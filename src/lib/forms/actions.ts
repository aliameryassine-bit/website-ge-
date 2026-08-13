'use server';

import { getLocale } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

import { redirect } from 'next/navigation';

import { getCopy } from '@/i18n/copy';
import { getPathname } from '@/i18n/navigation';
import { deliver, referenceCode } from './delivery';
import { check, clientKey } from './rate-limit';
import {
  CONSENT_VERSION,
  DATA_ROOM_FIELDS,
  HONEYPOT_FIELD,
  PILOT_FIELDS,
  TIMING_FIELD,
  dataRoomSchema,
  fieldErrors,
  formValues,
  pilotSchema,
} from './schemas';
import { checkFormToken, honeypotTripped } from './spam';
import type { DataRoomFormState, FormState, PilotFormState } from './state';

/**
 * The two conversion paths.
 *
 * Order of checks is deliberate, cheapest and most abusive first: honeypot,
 * then timing, then rate limit, then validation, then delivery. There is no
 * point running Zod over a submission from something that filled a hidden
 * field, and no point calling two third-party APIs for a request that is over
 * its rate limit.
 *
 * Both actions REDIRECT on success. A `useActionState` success flag would be
 * erased by a reload and would leave the person on the form URL with no way to
 * link to or return to the confirmation; a redirect gives the outcome its own
 * page, its own URL, and a sane back button. It also means a no-JavaScript
 * submission gets a 303 to a real page, which is the same experience.
 *
 * Only async functions may be exported from a `'use server'` module, so the
 * state types and initial values live in ./state.
 */

/** Shared pre-checks. Returns a failed state, or null when the submission may proceed. */
async function gate<Field extends string>(formData: FormData): Promise<FormState<Field> | null> {
  if (honeypotTripped(String(formData.get(HONEYPOT_FIELD) ?? ''))) {
    console.warn('[forms] rejected: honeypot filled');
    return { status: 'failed', errors: {}, reason: 'suspected-bot' };
  }

  /*
    From the cookie the middleware set on the first HTML response, not from a
    hidden field. That is what lets the form pages be static; see
    src/middleware.ts.
  */
  const timingCookie = (await cookies()).get(TIMING_FIELD)?.value ?? '';
  const timing = await checkFormToken(timingCookie);
  if (!timing.ok) {
    console.warn(`[forms] rejected: timing ${timing.reason} (${timing.elapsedSeconds ?? '?'}s)`);
    // A stale token is a real person on a page left open; say so and let them
    // reload. Anything else failing the timing check is treated as automated.
    return {
      status: 'failed',
      errors: {},
      reason: timing.reason === 'stale' ? 'stale' : 'suspected-bot',
    };
  }

  const requestHeaders = await headers();
  const { key, identified } = clientKey(requestHeaders);
  if (!identified) console.warn('[forms] no client address in headers; per-client limit is shared');

  const limit = check(key);
  if (!limit.ok) {
    console.warn(`[forms] rejected: rate limit (${limit.scope})`);
    return { status: 'failed', errors: {}, reason: 'rate-limited', retryAfter: limit.retryAfter };
  }

  return null;
}

/** Local time in Cairo, where the machines and the buyers are. */
function receivedAt(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Pilot request
// ---------------------------------------------------------------------------

export async function submitPilotRequest(
  _previous: PilotFormState,
  formData: FormData,
): Promise<PilotFormState> {
  const blocked = await gate<(typeof PILOT_FIELDS)[number]>(formData);
  if (blocked) return { ...blocked, values: formValues(formData, PILOT_FIELDS) };

  const COPY = await getCopy();
  const locale = await getLocale();

  const raw = formValues(formData, PILOT_FIELDS);
  const parsed = pilotSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: 'invalid',
      errors: fieldErrors(parsed.error, PILOT_FIELDS),
      values: raw,
      checked: { consent: raw.consent === 'on' },
    };
  }

  const data = parsed.data;
  const reference = referenceCode('P');
  const received = receivedAt();

  const result = await deliver({
    table: process.env.AIRTABLE_PILOT_TABLE ?? 'Pilot requests',
    row: {
      Reference: reference,
      Company: data.company,
      Email: data.email,
      Stores: data.stores,
      Role: data.role ?? '',
      City: data.city ?? '',
      'Received at': received,
      'Consent version': CONSENT_VERSION,
      // The wording AS SHOWN, in the language it was shown in. A consent record
      // that stores only the English text cannot answer what an Arabic reader
      // actually agreed to.
      'Consent locale': locale,
      'Consent text': COPY.consent.pilot,
      Source: 'website: pilot form',
    },
    subject: `Pilot request — ${data.company} (${data.stores} stores) — ${reference}`,
    body: [
      `Reference:  ${reference}`,
      `Company:    ${data.company}`,
      `Email:      ${data.email}`,
      `Stores:     ${data.stores}`,
      `Role:       ${data.role || '—'}`,
      `City:       ${data.city || '—'}`,
      `Received:   ${received}`,
      '',
      `Consent (${CONSENT_VERSION}): ${COPY.consent.pilot}`,
    ].join('\n'),
    replyTo: data.email,
  });

  if (!result.delivered) {
    return {
      status: 'failed',
      errors: {},
      reason: 'delivery',
      values: raw,
      checked: { consent: true },
    };
  }

  // Outside any try/catch: redirect() signals by throwing.
  redirect(getPathname({ href: '/pilot/received', locale }) + `?ref=${reference}`);
}

// ---------------------------------------------------------------------------
// Data room access request
// ---------------------------------------------------------------------------

/**
 * This action NEVER grants access. It validates, records, notifies, and sends
 * the requester to a pending page. Minting an access token is a separate manual
 * step (scripts/grant-data-room.ts) with no code path from here to there — the
 * property worth preserving if this file is ever edited.
 */
export async function requestDataRoomAccess(
  _previous: DataRoomFormState,
  formData: FormData,
): Promise<DataRoomFormState> {
  const blocked = await gate<(typeof DATA_ROOM_FIELDS)[number]>(formData);
  if (blocked) return { ...blocked, values: formValues(formData, DATA_ROOM_FIELDS) };

  const COPY = await getCopy();
  const locale = await getLocale();

  const raw = formValues(formData, DATA_ROOM_FIELDS);
  const schema = dataRoomSchema(
    COPY.dataRoomRequest.investorTypes,
    COPY.dataRoomRequest.declaration.requiredError,
  );
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: 'invalid',
      errors: fieldErrors(parsed.error, DATA_ROOM_FIELDS),
      values: raw,
      checked: { declaration: raw.declaration === 'on', consent: raw.consent === 'on' },
    };
  }

  const data = parsed.data;
  const reference = referenceCode('D');
  const received = receivedAt();

  const result = await deliver({
    table: process.env.AIRTABLE_DATA_ROOM_TABLE ?? 'Data room requests',
    row: {
      Reference: reference,
      Name: data.name,
      Organisation: data.organisation,
      Role: data.role,
      'Investor type': data.investorType,
      Country: data.country,
      Email: data.email,
      LinkedIn: data.linkedin,
      'Received at': received,
      // Records WHICH declaration wording was agreed to. While that text is a
      // lawyer's placeholder this marker makes it obvious on review that these
      // requests predate the real wording.
      'Declaration version': COPY.investorDisclaimer.marker,
      'Consent version': CONSENT_VERSION,
      'Consent locale': locale,
      'Consent text': COPY.consent.dataRoom,
      Status: 'Awaiting review',
      Source: 'website: data room request',
    },
    subject: `Data room request — ${data.organisation} (${data.investorType}) — ${reference}`,
    body: [
      `Reference:     ${reference}`,
      `Name:          ${data.name}`,
      `Organisation:  ${data.organisation}`,
      `Role:          ${data.role}`,
      `Investor type: ${data.investorType}`,
      `Country:       ${data.country}`,
      `Email:         ${data.email}`,
      `LinkedIn:      ${data.linkedin}`,
      `Received:      ${received}`,
      '',
      'ACCESS IS NOT GRANTED BY THIS REQUEST.',
      'Approve manually with: npm run grant:data-room',
      '',
      `Declaration version: ${COPY.investorDisclaimer.marker}`,
      `Consent (${CONSENT_VERSION}): ${COPY.consent.dataRoom}`,
    ].join('\n'),
    replyTo: data.email,
  });

  if (!result.delivered) {
    return {
      status: 'failed',
      errors: {},
      reason: 'delivery',
      values: raw,
      checked: { declaration: true, consent: true },
    };
  }

  redirect(getPathname({ href: '/investors/data-room/received', locale }) + `?ref=${reference}`);
}
