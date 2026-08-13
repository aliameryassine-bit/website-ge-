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
