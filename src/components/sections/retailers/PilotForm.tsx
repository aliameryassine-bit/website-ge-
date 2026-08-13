'use client';

import { useActionState } from 'react';

import { submitPilotRequest } from '@/app/for-retailers/actions';
import { PILOT_INITIAL_STATE } from '@/lib/pilot-form';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';

/**
 * Pilot request form.
 *
 * Three fields visible — company, work email, store count — with role and city
 * behind a native <details>. That element is the progressive disclosure: it
 * works with no JavaScript, is keyboard operable and screen-reader announced
 * for free, and cannot get out of sync with React state.
 *
 * Every field has a visible label, never a placeholder standing in for one.
 * Errors render next to the field they belong to and are announced, and the
 * first invalid field is described by its own message rather than a summary
 * somewhere else on the page.
 *
 * Submission goes through a server action, so the form still posts and
 * re-renders without JavaScript.
 */

const FIELD =
  'min-h-11 w-full rounded-panel border bg-well px-md py-sm text-body text-ink ' +
  'transition-colors duration-[var(--duration-state)] ease-enter';

function fieldClass(hasError: boolean): string {
  return `${FIELD} ${hasError ? 'border-optic-ink' : 'border-alu/50'}`;
}

export function PilotForm() {
  const [state, formAction, pending] = useActionState(submitPilotRequest, PILOT_INITIAL_STATE);
  const copy = COPY.forRetailers.pilot;

  return (
    <section aria-labelledby="pilot-heading" className="flex flex-col gap-lg">
      <header className="flex flex-col gap-md">
        <h2 id="pilot-heading" className="font-display text-section text-ink">
          {copy.heading}
        </h2>
        <p className="max-w-measure text-lead text-ink-muted">{copy.intro}</p>
      </header>

      <Panel className="max-w-measure">
        <form action={formAction} noValidate className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <label htmlFor="company" className="text-label text-ink uppercase">
              {copy.fields.company}
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              required
              aria-invalid={state.errors.company ? true : undefined}
              aria-describedby={state.errors.company ? 'company-error' : undefined}
              className={fieldClass(Boolean(state.errors.company))}
            />
            {state.errors.company ? (
              <p id="company-error" role="alert" className="text-data text-optic-ink">
                {state.errors.company}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-sm">
            <label htmlFor="email" className="text-label text-ink uppercase">
              {copy.fields.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={state.errors.email ? true : undefined}
              aria-describedby={state.errors.email ? 'email-error' : undefined}
              className={fieldClass(Boolean(state.errors.email))}
            />
            {state.errors.email ? (
              <p id="email-error" role="alert" className="text-data text-optic-ink">
                {state.errors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-sm">
            <label htmlFor="stores" className="text-label text-ink uppercase">
              {copy.fields.stores}
            </label>
            <input
              id="stores"
              name="stores"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              required
              aria-invalid={state.errors.stores ? true : undefined}
              aria-describedby={state.errors.stores ? 'stores-error' : undefined}
              className={fieldClass(Boolean(state.errors.stores))}
            />
            {state.errors.stores ? (
              <p id="stores-error" role="alert" className="text-data text-optic-ink">
                {state.errors.stores}
              </p>
            ) : null}
          </div>

          {/* Progressive disclosure, native. Works with JavaScript disabled. */}
          <details className="border-t border-alu/25 pt-md">
            <summary className="cursor-pointer text-label text-ink uppercase">
              {copy.progressiveSummary}
            </summary>
            <div className="mt-md flex flex-col gap-lg">
              <div className="flex flex-col gap-sm">
                <label htmlFor="role" className="text-label text-ink uppercase">
                  {copy.fields.role}
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  autoComplete="organization-title"
                  className={fieldClass(false)}
                />
              </div>
              <div className="flex flex-col gap-sm">
                <label htmlFor="city" className="text-label text-ink uppercase">
                  {copy.fields.city}
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className={fieldClass(false)}
                />
              </div>
            </div>
          </details>

          <div className="flex flex-col gap-md">
            <Button type="submit" disabled={pending}>
              {copy.submit}
            </Button>

            {/* aria-live so the outcome is announced without stealing focus. */}
            <p aria-live="polite" className="text-data text-ink-muted">
              {state.status === 'unconfigured' ? copy.unconfigured : null}
              {state.status === 'invalid' ? copy.validationFailed : null}
            </p>
          </div>
        </form>
      </Panel>
    </section>
  );
}

export default PilotForm;
