'use server';

import { COPY } from '@/content/copy';
import { lodgeAccessRequest } from '@/lib/data-room/requests';
import type { DataRoomFormState } from '@/lib/data-room-form';

/**
 * Data room access request.
 *
 * This action NEVER grants access. It validates, records the request, notifies
 * us, and returns a pending state. Minting an access token is a separate,
 * manual step (scripts/grant-data-room.ts) with no code path from here to
 * there — which is the property worth preserving if this file is ever edited.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Accepts a profile URL with or without scheme, and rejects other hosts. */
const LINKEDIN = /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/.+$/i;

/**
 * Widened from the literal tuple so the submitted string can be checked against
 * it. The allow-list is still the copy, so adding a type in one place is enough.
 */
const INVESTOR_TYPES: readonly string[] = COPY.dataRoomRequest.investorTypes;

export async function requestDataRoomAccess(
  _previous: DataRoomFormState,
  formData: FormData,
): Promise<DataRoomFormState> {
  const text = (key: string) => String(formData.get(key) ?? '').trim();

  const request = {
    name: text('name'),
    organisation: text('organisation'),
    role: text('role'),
    investorType: text('investorType'),
    country: text('country'),
    email: text('email'),
    linkedin: text('linkedin'),
  };
  const declared = formData.get('declaration') === 'on';

  const errors: DataRoomFormState['errors'] = {};
  if (request.name.length < 2) errors.name = 'Enter your full name.';
  if (request.organisation.length < 2) errors.organisation = 'Enter your organisation.';
  if (request.role.length < 2) errors.role = 'Enter your role.';
  if (!INVESTOR_TYPES.includes(request.investorType)) {
    errors.investorType = 'Select an investor type.';
  }
  if (request.country.length < 2) errors.country = 'Enter your country.';
  if (!EMAIL.test(request.email)) errors.email = 'Enter a work email address.';
  if (!LINKEDIN.test(request.linkedin)) errors.linkedin = 'Enter a LinkedIn profile URL.';
  if (!declared) errors.declaration = COPY.dataRoomRequest.declaration.requiredError;

  // Echo the submitted values back: React 19 resets the form after the action
  // resolves, so without this a validation error empties all seven fields.
  if (Object.keys(errors).length > 0) {
    return { status: 'invalid', errors, values: request, declared };
  }

  const result = await lodgeAccessRequest({
    ...request,
    // Records WHICH wording was agreed to. While the declaration is a
    // placeholder this is the marker, so it is obvious on review that these
    // requests predate the real text.
    declarationVersion: COPY.investorDisclaimer.marker,
    receivedAt: new Date().toISOString(),
  });

  if (!result.lodged) {
    console.error(`[data-room] request not lodged: ${result.reason}`);
    return { status: 'failed', errors: {} };
  }

  return { status: 'pending', errors: {}, notifyWarning: !result.notified };
}
