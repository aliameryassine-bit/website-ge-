'use client';

import { useActionState } from 'react';

import { requestDataRoomAccess } from '@/app/investors/data-room/actions';
import { Button } from '@/components/ui/Button';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';
import { DATA_ROOM_INITIAL_STATE } from '@/lib/data-room-form';

/**
 * Data room access request form.
 *
 * Seven fields and a required declaration. On success it shows a PENDING state
 * and says explicitly that nothing has been granted — the form has no path to
 * an access token, and access is minted manually.
 *
 * If the request could not be recorded, it says that instead. A pending screen
 * over a dropped request would stop the requester from chasing it, which is the
 * worst outcome this form can produce.
 */

const FIELD =
  'min-h-11 w-full rounded-panel border bg-well px-md py-sm text-body text-ink ' +
  'transition-colors duration-[var(--duration-state)] ease-enter';

const cls = (invalid: boolean) => `${FIELD} ${invalid ? 'border-optic-ink' : 'border-alu/50'}`;

export function DataRoomRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestDataRoomAccess,
    DATA_ROOM_INITIAL_STATE,
  );
  const copy = COPY.dataRoomRequest;

  if (state.status === 'pending') {
    return (
      <Panel className="flex max-w-measure flex-col gap-md border-action">
        <Eyebrow>{copy.pending.heading}</Eyebrow>
        <p role="status" className="text-body text-ink">
          {copy.pending.body}
        </p>
        {state.notifyWarning ? (
          <p className="border-t border-alu/25 pt-md text-data text-optic-ink">
            Recorded, but the notification to our team did not send. If you do not hear back, follow
            up directly.
          </p>
        ) : null}
      </Panel>
    );
  }

  return (
    <Panel className="max-w-measure">
      <form action={formAction} noValidate className="flex flex-col gap-lg">
        {(
          [
            { name: 'name', type: 'text', autoComplete: 'name' },
            { name: 'organisation', type: 'text', autoComplete: 'organization' },
            { name: 'role', type: 'text', autoComplete: 'organization-title' },
          ] as const
        ).map((field) => (
          <div key={field.name} className="flex flex-col gap-sm">
            <label htmlFor={field.name} className="text-label text-ink uppercase">
              {copy.fields[field.name]}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              defaultValue={state.values?.[field.name] ?? ''}
              aria-invalid={state.errors[field.name] ? true : undefined}
              aria-describedby={state.errors[field.name] ? `${field.name}-error` : undefined}
              className={cls(Boolean(state.errors[field.name]))}
            />
            {state.errors[field.name] ? (
              <p id={`${field.name}-error`} role="alert" className="text-data text-optic-ink">
                {state.errors[field.name]}
              </p>
            ) : null}
          </div>
        ))}

        <div className="flex flex-col gap-sm">
          <label htmlFor="investorType" className="text-label text-ink uppercase">
            {copy.fields.investorType}
          </label>
          <select
            id="investorType"
            name="investorType"
            required
            /*
              Remounted when the echoed value changes. React applies a select's
              defaultValue at mount only, so after the form reset that follows an
              action it would snap back to the original empty default — which then
              failed validation on resubmit even though the requester had chosen a
              type. The key forces the new default to take.
            */
            key={`investorType-${state.values?.investorType ?? 'empty'}`}
            defaultValue={state.values?.investorType ?? ''}
            aria-invalid={state.errors.investorType ? true : undefined}
            aria-describedby={state.errors.investorType ? 'investorType-error' : undefined}
            className={cls(Boolean(state.errors.investorType))}
          >
            <option value="" disabled>
              {copy.investorTypePrompt}
            </option>
            {copy.investorTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {state.errors.investorType ? (
            <p id="investorType-error" role="alert" className="text-data text-optic-ink">
              {state.errors.investorType}
            </p>
          ) : null}
        </div>

        {(
          [
            { name: 'country', type: 'text', autoComplete: 'country-name' },
            { name: 'email', type: 'email', autoComplete: 'email' },
            { name: 'linkedin', type: 'url', autoComplete: 'url' },
          ] as const
        ).map((field) => (
          <div key={field.name} className="flex flex-col gap-sm">
            <label htmlFor={field.name} className="text-label text-ink uppercase">
              {copy.fields[field.name]}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              defaultValue={state.values?.[field.name] ?? ''}
              aria-invalid={state.errors[field.name] ? true : undefined}
              aria-describedby={state.errors[field.name] ? `${field.name}-error` : undefined}
              className={cls(Boolean(state.errors[field.name]))}
            />
            {state.errors[field.name] ? (
              <p id={`${field.name}-error`} role="alert" className="text-data text-optic-ink">
                {state.errors[field.name]}
              </p>
            ) : null}
          </div>
        ))}

        {/*
          Required declaration. The WORDING is a lawyer's placeholder — see
          content/copy.ts — and is marked as such on screen so no requester can
          mistake it for the real representation.
        */}
        <div className="flex flex-col gap-sm border-t border-optic-ink/60 pt-md">
          <div className="flex items-start gap-md">
            <input
              id="declaration"
              name="declaration"
              type="checkbox"
              required
              defaultChecked={state.declared ?? false}
              aria-invalid={state.errors.declaration ? true : undefined}
              aria-describedby={state.errors.declaration ? 'declaration-error' : 'declaration-note'}
              className="mt-xs size-5 shrink-0 accent-[var(--color-action)]"
            />
            <label htmlFor="declaration" className="text-data text-ink">
              {copy.declaration.label}
            </label>
          </div>
          <p id="declaration-note" className="text-data text-optic-ink">
            This declaration text is a placeholder pending legal drafting.
          </p>
          {state.errors.declaration ? (
            <p id="declaration-error" role="alert" className="text-data text-optic-ink">
              {state.errors.declaration}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-md">
          <Button type="submit" disabled={pending}>
            {copy.submit}
          </Button>

          <p aria-live="polite" className="text-data text-ink-muted">
            {state.status === 'invalid' ? copy.validationFailed : null}
            {state.status === 'failed' ? `${copy.failure.heading}. ${copy.failure.body}` : null}
          </p>
        </div>
      </form>
    </Panel>
  );
}

export default DataRoomRequestForm;
