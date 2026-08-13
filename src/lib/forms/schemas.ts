import { z } from 'zod';

export * from './fields';

/**
 * The validation contract for both conversion paths.
 *
 * ONE definition, used in three places: the client validates against it for
 * instant inline errors, the server action validates against it again as the
 * only authority, and the inferred types are what the delivery layer receives.
 * A field cannot drift between client and server because there is nothing to
 * drift from.
 *
 * This module is imported by client components, so it must stay pure — no
 * node: builtins, no process.env, no secrets. The spam and rate-limit checks
 * live in server-only modules for that reason.
 *
 * MESSAGE VOICE: every message says what to do, in the same operational voice
 * as the rest of the site. Not "Invalid input", not "Oops, something went
 * wrong" — a instruction the person can act on, and where a format is
 * involved, an example of the format. One message per field covers both the
 * empty and the malformed case, so there is no state where a field is wrong
 * and the guidance is generic.
 */

const CONSENT_MESSAGE = 'Tick this so we can reply. It is the only basis we have to contact you.';

/** HTML sends "on" for a ticked box and nothing at all for an unticked one. */
const consent = z.literal('on', CONSENT_MESSAGE);

function required(message: string) {
  return z.string().trim().min(2, message);
}

function workEmail(message: string) {
  return z.string().trim().pipe(z.email(message));
}

/**
 * Store count as typed. Parsed from a string rather than coerced, because
 * `Number('')` is 0 — coercion turns an empty field into a range error about
 * the minimum instead of telling the person to enter a number.
 */
const storeCount = z
  .string()
  .trim()
  .regex(/^\d{1,6}$/, 'Enter the number of stores as a whole number, like 40.')
  .transform(Number)
  .refine((value) => value >= 1, 'Enter 1 or more. For a single store, enter 1.');

// ---------------------------------------------------------------------------
// Pilot request — goal one of the site
// ---------------------------------------------------------------------------

export const pilotSchema = z.object({
  company: required('Enter the chain or company name.'),
  email: workEmail(
    'Enter your work email — it needs an @ and a domain, like operations@chain.com.',
  ),
  stores: storeCount,
  /** Progressive fields. Optional, so an empty string is valid. */
  role: z.string().trim().max(120, 'Shorten this to under 120 characters.').optional(),
  city: z.string().trim().max(120, 'Shorten this to under 120 characters.').optional(),
  consent,
});

export type PilotInput = z.input<typeof pilotSchema>;
export type PilotData = z.output<typeof pilotSchema>;

// ---------------------------------------------------------------------------
// Data room access request — goal two
// ---------------------------------------------------------------------------

/**
 * Built from the copy so the allow-list and the rendered options cannot
 * disagree. Widened from the literal tuple to compare against a submitted
 * string.
 */
export function dataRoomSchema(investorTypes: readonly string[], declarationError: string) {
  return z.object({
    name: required('Enter your full name.'),
    organisation: required('Enter the fund, firm or company name.'),
    role: required('Enter your role, for example Partner or Investment Manager.'),
    investorType: z
      .string()
      .trim()
      .refine((value) => investorTypes.includes(value), 'Choose the closest investor type.'),
    country: required('Enter the country you invest from.'),
    email: workEmail('Enter your work email — it needs an @ and a domain, like name@fund.com.'),
    linkedin: z
      .string()
      .trim()
      .regex(
        /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/.+$/i,
        'Paste the full profile URL, like linkedin.com/in/yourname.',
      ),
    declaration: z.literal('on', declarationError),
    consent,
  });
}

// ---------------------------------------------------------------------------
// Shared plumbing
// ---------------------------------------------------------------------------

/** First message per field. One error per field is what the UI renders. */
export function fieldErrors<Field extends string>(
  error: z.ZodError,
  fields: readonly Field[],
): Partial<Record<Field, string>> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const out: Partial<Record<Field, string>> = {};
  for (const field of fields) {
    const message = flattened[field]?.[0];
    if (message) out[field] = message;
  }
  return out;
}
