/**
 * Form state, shared between the server actions and the client components.
 *
 * Separate from the action module because a `'use server'` file may only export
 * async functions — exporting a constant from one compiles and then resolves to
 * `undefined` at runtime. That cost a 500 on /for-retailers once already.
 *
 * There is no `success` status, and that is deliberate. A successful submission
 * REDIRECTS to a real page with its own URL, so success is never a piece of
 * component state that a reload or a back button can erase.
 */

import type { DataRoomField, PilotField } from './schemas';

/**
 * Why a submission was refused. Each reason renders different copy, because
 * "we could not deliver this" and "you are submitting too fast" need different
 * things from the person reading them.
 */
export type FailureReason =
  /** Both delivery destinations refused or are unconfigured. Offers the fallback address. */
  | 'delivery'
  /** Rate limit tripped. Says when to try again. */
  | 'rate-limited'
  /** The page has been open too long; the timing token expired. Says to reload. */
  | 'stale'
  /** Honeypot filled or submitted implausibly fast. Offers the fallback address. */
  | 'suspected-bot';

export type FormState<Field extends string> = {
  status: 'idle' | 'invalid' | 'failed';
  errors: Partial<Record<Field, string>>;
  reason?: FailureReason;
  /** Seconds until the rate limit clears. Only set when reason is 'rate-limited'. */
  retryAfter?: number;
  /**
   * What was typed, echoed back. React 19 resets an uncontrolled form once its
   * action resolves, so without this one failed validation empties every field —
   * the fastest way to lose a lead at the last step.
   */
  values?: Partial<Record<Field, string>>;
  /** Checkbox states are echoed separately: they are booleans, not strings. */
  checked?: Partial<Record<Field, boolean>>;
};

export type PilotFormState = FormState<PilotField>;
export type DataRoomFormState = FormState<DataRoomField>;

export const PILOT_INITIAL_STATE: PilotFormState = { status: 'idle', errors: {} };
export const DATA_ROOM_INITIAL_STATE: DataRoomFormState = { status: 'idle', errors: {} };
