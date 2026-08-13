/**
 * Shared shape for the pilot request form.
 *
 * Lives outside the action module on purpose: a `'use server'` file may only
 * export async functions, so exporting the initial state from there compiles
 * but resolves to `undefined` at runtime — the form crashed on
 * `state.errors.company` before this was split out.
 */

export type PilotFieldName = 'company' | 'email' | 'stores';

export type PilotFormState = {
  status: 'idle' | 'invalid' | 'unconfigured';
  /** Field name → message. Rendered next to the field it belongs to. */
  errors: Partial<Record<PilotFieldName, string>>;
};

export const PILOT_INITIAL_STATE: PilotFormState = { status: 'idle', errors: {} };
