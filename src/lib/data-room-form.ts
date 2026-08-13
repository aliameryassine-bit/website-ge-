/**
 * Shared shape for the data room request form.
 *
 * Outside the action module because a `'use server'` file may only export async
 * functions — exporting state from one compiles and then resolves to
 * `undefined` at runtime.
 */

export type DataRoomFieldName =
  | 'name'
  | 'organisation'
  | 'role'
  | 'investorType'
  | 'country'
  | 'email'
  | 'linkedin'
  | 'declaration';

export type DataRoomTextField = Exclude<DataRoomFieldName, 'declaration'>;

export type DataRoomFormState = {
  /**
   * `pending` means recorded and awaiting manual review — never granted.
   * `failed` means nothing was recorded, and says so.
   */
  status: 'idle' | 'invalid' | 'pending' | 'failed';
  errors: Partial<Record<DataRoomFieldName, string>>;
  /** Set when the request was stored but we could not be notified. */
  notifyWarning?: boolean;
  /**
   * What the requester typed, echoed back so a validation error does not wipe
   * the form.
   *
   * React 19 resets an uncontrolled form once its action resolves. On a
   * seven-field form that means one failed validation costs the requester
   * everything they entered — the fastest way to lose an investor at the last
   * step. These values repopulate the fields.
   */
  values?: Partial<Record<DataRoomTextField, string>>;
  declared?: boolean;
};

export const DATA_ROOM_INITIAL_STATE: DataRoomFormState = { status: 'idle', errors: {} };
