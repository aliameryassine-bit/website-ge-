/**
 * Field names and form constants. NO validation library.
 *
 * Split from schemas.ts so a form component can render without pulling Zod into
 * the first load. Zod measured 64.9 KB gzip — a third of the JS on the pilot and
 * data room routes — to run a check the server repeats anyway. The schema is now
 * fetched after paint (see use-form-validation.ts) and this module carries the
 * handful of strings the markup genuinely needs at render time.
 *
 * Anything here must stay free of imports that pull a runtime.
 */

/**
 * Honeypot. Deliberately meaningless name: password managers and browser
 * autofill target fields called `website`, `url`, `organization` and friends,
 * so the classic bait names produce false positives on real people. A naive bot
 * fills every input it finds regardless of name, which is what this catches.
 */
export const HONEYPOT_FIELD = 'gx_hp';

/** Signed issue-time for the timing check. Verified server-side. */
export const TIMING_FIELD = 'gx_t';

/**
 * The consent wording, versioned.
 *
 * Stored with every submission. If the wording changes, this constant changes
 * with it, and old records still say what their owner actually agreed to —
 * which is the part that matters if consent is ever questioned.
 */
export const CONSENT_VERSION = '2026-08-13.1';

export const PILOT_FIELDS = ['company', 'email', 'stores', 'role', 'city', 'consent'] as const;
export type PilotField = (typeof PILOT_FIELDS)[number];

export const DATA_ROOM_FIELDS = [
  'name',
  'organisation',
  'role',
  'investorType',
  'country',
  'email',
  'linkedin',
  'declaration',
  'consent',
] as const;
export type DataRoomField = (typeof DATA_ROOM_FIELDS)[number];

/**
 * FormData → a plain record the schemas can read.
 *
 * Unticked checkboxes are absent from FormData entirely, and `z.literal('on')`
 * needs a value to reject, so a missing key becomes an empty string.
 */
export function formValues<Field extends string>(
  formData: FormData,
  fields: readonly Field[],
): Record<Field, string> {
  const out = {} as Record<Field, string>;
  for (const field of fields) out[field] = String(formData.get(field) ?? '').trim();
  return out;
}
