'use server';

import type { PilotFormState } from '@/lib/pilot-form';

/**
 * Pilot request handling.
 *
 * There is no destination configured — no inbox, no CRM, no store. So this
 * validates properly and then says plainly that nothing was sent.
 *
 * The alternative was a form that returns a success message and discards the
 * submission, which is worse than a broken form: a retail operations lead would
 * believe they had made contact. When a destination exists, the send goes in
 * where `unconfigured` is returned and nothing else here changes.
 *
 * Only async functions may be exported from a 'use server' module, which is why
 * the state type and initial value live in @/lib/pilot-form.
 */

/** Deliberately permissive: enough to catch a typo, not to reject a valid address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function submitPilotRequest(
  _previous: PilotFormState,
  formData: FormData,
): Promise<PilotFormState> {
  const company = String(formData.get('company') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const storesRaw = String(formData.get('stores') ?? '').trim();
  const stores = Number(storesRaw);

  const errors: PilotFormState['errors'] = {};
  if (company.length < 2) errors.company = 'Enter the chain or company name.';
  if (!EMAIL.test(email)) errors.email = 'Enter a work email address.';
  if (!storesRaw || !Number.isFinite(stores) || stores < 1) {
    errors.stores = 'Enter the number of stores, as a whole number of 1 or more.';
  }

  // Echoed back: React 19 resets the form after the action resolves.
  if (Object.keys(errors).length > 0) {
    return { status: 'invalid', errors, values: { company, email, stores: storesRaw } };
  }

  // Validated. Nothing is stored or forwarded, and the response says so.
  return { status: 'unconfigured', errors: {} };
}
