import { useMessages } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { COPY } from '@/content/copy';

/**
 * Locale-aware access to the copy tree.
 *
 * `content/copy.ts` stays the English source of truth — it is where copy is
 * written and reviewed, with the reasoning in comments beside each block, which
 * a JSON file cannot carry. `npm run build:messages` projects it into
 * messages/en.json and derives the other locales.
 *
 * WHY AN OBJECT RATHER THAN t('a.b.c'). Every string on this site is static:
 * there is not one plural, one interpolated count, or one date to format,
 * because every number routes through content/facts.ts instead. Against that,
 * an object accessor keeps the existing typed shape — `copy.forRetailers.pilot
 * .fields.company` still autocompletes and still fails to compile when a key is
 * renamed, across all 24 call sites — where `t('forRetailers.pilot.fields
 * .company')` is a string that no compiler checks.
 *
 * The message loading, the locale resolution, the routing and the provider are
 * all next-intl. This is how the loaded messages are read.
 *
 * WHEN TO USE t() INSTEAD: the moment a string needs a count, a date, or a
 * gendered form. ICU formatting is the thing this trades away, and a string
 * that needs it should move to `useTranslations`/`getTranslations` rather than
 * being assembled from fragments here.
 */
export type Copy = typeof COPY;

/** Server components and server actions. */
export async function getCopy(): Promise<Copy> {
  return (await getMessages()) as unknown as Copy;
}

/** Client components. Messages arrive through NextIntlClientProvider. */
export function useCopy(): Copy {
  return useMessages() as unknown as Copy;
}

/**
 * The namespaces that reach a CLIENT component, and therefore the only ones
 * that need to be serialised into the document.
 *
 * next-intl forwards the whole message tree to the browser by default. That put
 * all 30.1 KB of copy into every page's RSC payload — the homepage was shipping
 * the investor thesis, the ROI assumptions and the data room declaration to
 * render a hero and a fork. This list is the union of what the client
 * components below actually read:
 *
 *   site, nav, cta, a11y  Header, MobileMenu, on every route
 *   consent, formFailure  PilotForm, DataRoomRequestForm
 *   forRetailers          PilotForm (pilot), RoiCalculator (roi)
 *   dataRoomRequest       DataRoomRequestForm
 *   impact                MaterialFlow
 *   technology            TechnologySequence
 *   errors                the 500 boundary, which React requires to be a
 *                         client component and which must not itself fail
 *
 * Everything else is server-rendered to HTML and never needed as data. Keep
 * this list in step when a component gains 'use client' — a missing namespace
 * shows up as the [MISSING: …] fallback rather than as silence.
 */
export const CLIENT_NAMESPACES = [
  'site',
  'nav',
  'cta',
  'a11y',
  'consent',
  'formFailure',
  'forRetailers',
  'dataRoomRequest',
  'impact',
  'technology',
  'errors',
] as const;

/** Narrows a full message tree to the namespaces the browser needs. */
export function clientMessages(messages: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const namespace of CLIENT_NAMESPACES) {
    if (namespace in messages) out[namespace] = messages[namespace];
  }
  return out;
}
