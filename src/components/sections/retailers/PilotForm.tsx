'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { CheckboxField, Honeypot, TextField } from '@/components/ui/Field';
import { FormFailure } from '@/components/ui/FormFailure';
import { Panel } from '@/components/ui/Panel';
import { useCopy } from '@/i18n/copy';
import { submitPilotRequest } from '@/lib/forms/actions';
import { PILOT_FIELDS } from '@/lib/forms/fields';
import { PILOT_INITIAL_STATE } from '@/lib/forms/state';
import { useFormValidation } from '@/lib/forms/use-form-validation';

/**
 * Pilot request form. Goal one of the site.
 *
 * Three fields visible — company, work email, store count — with role and city
 * behind a native <details>. That element is the progressive disclosure: no
 * JavaScript, keyboard operable and screen-reader announced for free, and it
 * cannot fall out of sync with React state.
 *
 * There is no success branch in this component. A delivered submission
 * redirects to /pilot/received, so the confirmation is a page with a URL rather
 * than a piece of state a reload would erase.
 *
 * The anti-spam timing token rides in a cookie set by middleware, so this
 * component needs nothing from the server render and the page stays static.
 */

/** Module-level so its identity is stable across renders. */
const LOAD_PILOT_SCHEMA = () => import('@/lib/forms/schemas').then((m) => m.pilotSchema);

export function PilotForm({ heading = true }: { heading?: boolean }) {
  const COPY = useCopy();
  const [state, formAction, pending] = useActionState(submitPilotRequest, PILOT_INITIAL_STATE);
  const copy = COPY.forRetailers.pilot;

  const { formRef, errors, onBlur, onSubmit } = useFormValidation({
    loadSchema: LOAD_PILOT_SCHEMA,
    fields: PILOT_FIELDS,
    serverErrors: state.errors,
  });

  return (
    <section aria-labelledby="pilot-heading" className="flex flex-col gap-lg">
      {heading ? (
        <header className="flex flex-col gap-md">
          <h2 id="pilot-heading" className="font-display text-section text-ink">
            {copy.heading}
          </h2>
          <p className="max-w-measure text-lead text-ink-muted">{copy.intro}</p>
        </header>
      ) : null}

      <Panel className="relative max-w-measure">
        <form
          ref={formRef}
          action={formAction}
          onSubmit={onSubmit}
          onBlur={onBlur}
          noValidate
          className="flex flex-col gap-lg"
        >
          <Honeypot />

          <TextField
            name="company"
            label={copy.fields.company}
            autoComplete="organization"
            required
            defaultValue={state.values?.company}
            error={errors.company}
          />
          <TextField
            name="email"
            type="email"
            label={copy.fields.email}
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            error={errors.email}
          />
          <TextField
            name="stores"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            label={copy.fields.stores}
            required
            defaultValue={state.values?.stores}
            error={errors.stores}
          />

          {/* Progressive disclosure, native. Works with JavaScript disabled. */}
          <details
            className="border-t border-alu/25 pt-md"
            open={Boolean(state.values?.role || state.values?.city)}
          >
            <summary className="cursor-pointer text-label text-ink uppercase">
              {copy.progressiveSummary}
            </summary>
            <div className="mt-md flex flex-col gap-lg">
              <TextField
                name="role"
                label={copy.fields.role}
                autoComplete="organization-title"
                defaultValue={state.values?.role}
                error={errors.role}
              />
              <TextField
                name="city"
                label={copy.fields.city}
                autoComplete="address-level2"
                defaultValue={state.values?.city}
                error={errors.city}
              />
            </div>
          </details>

          <div className="border-t border-alu/25 pt-md">
            <CheckboxField
              name="consent"
              defaultChecked={state.checked?.consent}
              error={errors.consent}
            >
              {COPY.consent.pilot}{' '}
              <a
                href={COPY.consent.privacyHref}
                className="underline decoration-alu/50 underline-offset-2 hover:text-ink hover:decoration-action"
              >
                {COPY.consent.privacyLinkText}
              </a>
              .
            </CheckboxField>
          </div>

          <div className="flex flex-col gap-md">
            <Button type="submit" disabled={pending}>
              {copy.submit}
            </Button>

            {state.status === 'failed' && state.reason ? (
              <FormFailure reason={state.reason} retryAfter={state.retryAfter} />
            ) : null}

            {/* Announced without stealing focus. */}
            <p aria-live="polite" className="text-data text-ink-muted">
              {state.status === 'invalid' ? copy.validationFailed : null}
            </p>
          </div>
        </form>
      </Panel>
    </section>
  );
}

export default PilotForm;
