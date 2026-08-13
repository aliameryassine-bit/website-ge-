'use client';

import { useActionState, useMemo } from 'react';

import { Button } from '@/components/ui/Button';
import { CheckboxField, FormToken, Honeypot, SelectField, TextField } from '@/components/ui/Field';
import { FormFailure } from '@/components/ui/FormFailure';
import { Panel } from '@/components/ui/Panel';
import { useCopy } from '@/i18n/copy';
import { requestDataRoomAccess } from '@/lib/forms/actions';
import { DATA_ROOM_FIELDS, dataRoomSchema } from '@/lib/forms/schemas';
import { DATA_ROOM_INITIAL_STATE } from '@/lib/forms/state';
import { useFormValidation } from '@/lib/forms/use-form-validation';

/**
 * Data room access request. Goal two.
 *
 * Seven fields, a required declaration, and consent. A delivered submission
 * redirects to /investors/data-room/received, which states plainly that nothing
 * has been granted — this form has no path to an access token, and access is
 * minted manually.
 *
 * The seven fields are why the echoed values in form state matter more here
 * than anywhere else on the site: React 19 resets an uncontrolled form when the
 * action resolves, so without them one failed validation costs an investor
 * everything they typed at the last step.
 */

export function DataRoomRequestForm({ token }: { token: string }) {
  const COPY = useCopy();
  const [state, formAction, pending] = useActionState(
    requestDataRoomAccess,
    DATA_ROOM_INITIAL_STATE,
  );
  const copy = COPY.dataRoomRequest;

  // Rebuilt only if the copy changes; the schema closes over the type list.
  const schema = useMemo(
    () => dataRoomSchema(copy.investorTypes, copy.declaration.requiredError),
    [copy.investorTypes, copy.declaration.requiredError],
  );

  const { formRef, errors, onBlur, onSubmit } = useFormValidation({
    schema,
    fields: DATA_ROOM_FIELDS,
    serverErrors: state.errors,
  });

  return (
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
        <FormToken value={token} />

        <TextField
          name="name"
          label={copy.fields.name}
          autoComplete="name"
          required
          defaultValue={state.values?.name}
          error={errors.name}
        />
        <TextField
          name="organisation"
          label={copy.fields.organisation}
          autoComplete="organization"
          required
          defaultValue={state.values?.organisation}
          error={errors.organisation}
        />
        <TextField
          name="role"
          label={copy.fields.role}
          autoComplete="organization-title"
          required
          defaultValue={state.values?.role}
          error={errors.role}
        />

        <SelectField
          name="investorType"
          label={copy.fields.investorType}
          options={copy.investorTypes}
          prompt={copy.investorTypePrompt}
          required
          defaultValue={state.values?.investorType}
          error={errors.investorType}
        />

        <TextField
          name="country"
          label={copy.fields.country}
          autoComplete="country-name"
          required
          defaultValue={state.values?.country}
          error={errors.country}
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
          name="linkedin"
          label={copy.fields.linkedin}
          autoComplete="url"
          required
          hint="linkedin.com/in/yourname"
          defaultValue={state.values?.linkedin}
          error={errors.linkedin}
        />

        {/*
          Required declaration. The WORDING is a lawyer's placeholder — see
          content/copy.ts — and is marked as such on screen so no requester can
          mistake it for the real representation.
        */}
        <div className="border-t border-optic-ink/60 pt-md">
          <CheckboxField
            name="declaration"
            defaultChecked={state.checked?.declaration}
            error={errors.declaration}
            note="This declaration text is a placeholder pending legal drafting."
          >
            {copy.declaration.label}
          </CheckboxField>
        </div>

        <div className="border-t border-alu/25 pt-md">
          <CheckboxField
            name="consent"
            defaultChecked={state.checked?.consent}
            error={errors.consent}
          >
            {COPY.consent.dataRoom}{' '}
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

          <p aria-live="polite" className="text-data text-ink-muted">
            {state.status === 'invalid' ? copy.validationFailed : null}
          </p>
        </div>
      </form>
    </Panel>
  );
}

export default DataRoomRequestForm;
