'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { z } from 'zod';

import { formValues } from './fields';

/**
 * Client-side validation against the SAME schema the server uses.
 *
 * What this buys: an error appears when someone leaves a field, and a submission
 * that cannot pass never leaves the browser. What it does not buy: authority.
 * The server re-validates every submission with the same schema, because
 * anything the client checks can be skipped.
 *
 * WHEN ERRORS SHOW. The whole form is parsed on every check, but a field's error
 * is only displayed once that field has been left, or once a submit has been
 * attempted. Parsing everything and filtering what is shown avoids the usual
 * mess of per-field schemas, and it means a form does not open covered in
 * complaints about fields nobody has reached yet.
 *
 * NO-JAVASCRIPT: none of this runs, the form posts to the server action, and the
 * same schema produces the same messages on the page that comes back.
 *
 * THE SCHEMA IS FETCHED AFTER PAINT. Zod measured 64.9 KB gzip — a third of the
 * JavaScript on the pilot and data room routes — for a check the server repeats
 * as the authority. Loading it with the page delayed the form appearing in order
 * to speed up an error message. Now the form renders immediately and the client
 * gate arms a moment later; anything submitted in that window is validated
 * server-side and comes back with the same messages, which is the no-JavaScript
 * path that already had to work.
 */

type Validator = {
  safeParse(value: unknown): { success: true } | { success: false; error: z.ZodError };
};

export function useFormValidation<Field extends string>({
  loadSchema,
  fields,
  serverErrors,
}: {
  /** Resolves the schema. Called once, after mount. */
  loadSchema: () => Promise<Validator>;
  fields: readonly Field[];
  serverErrors: Partial<Record<Field, string>>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [schema, setSchema] = useState<Validator | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadSchema().then((loaded) => {
      if (!cancelled) setSchema(loaded);
    });
    return () => {
      cancelled = true;
    };
    // Loaders are module-level arrow functions; re-running on identity would
    // refetch on every render for no gain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [clientErrors, setClientErrors] = useState<Partial<Record<Field, string>>>({});
  const [touched, setTouched] = useState<ReadonlySet<Field>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const parse = useCallback(
    (form: HTMLFormElement): Partial<Record<Field, string>> => {
      // Not armed yet: the server is still the authority, so nothing is blocked.
      if (!schema) return {};
      const result = schema.safeParse(formValues(new FormData(form), fields));
      if (result.success) return {};

      const flattened = result.error.issues;
      const out: Partial<Record<Field, string>> = {};
      for (const issue of flattened) {
        const key = issue.path[0] as Field | undefined;
        if (key && fields.includes(key) && !out[key]) out[key] = issue.message;
      }
      return out;
    },
    [schema, fields],
  );

  /** Re-checks the whole form and marks the field just left as touched. */
  const onBlur = useCallback(
    (event: React.FocusEvent<HTMLFormElement>) => {
      /*
        Blur is captured on the form, so React types event.target as the form
        rather than the control that was actually left. The real target is
        whichever input bubbled, and only its name is needed.
      */
      const name = (event.target as unknown as { name?: string }).name as Field | undefined;
      const form = formRef.current;
      if (!form || !name) return;
      if (fields.includes(name)) {
        setTouched((previous) => (previous.has(name) ? previous : new Set(previous).add(name)));
      }
      setClientErrors(parse(form));
    },
    [fields, parse],
  );

  /**
   * Blocks a submission the schema would reject, and moves focus to the first
   * field at fault so a keyboard or screen-reader user is put where the work is
   * rather than told there is work somewhere.
   */
  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const form = event.currentTarget;
      const errors = parse(form);
      setClientErrors(errors);
      setSubmitAttempted(true);

      const firstInvalid = fields.find((field) => errors[field]);
      if (!firstInvalid) return;

      event.preventDefault();
      const element = form.elements.namedItem(firstInvalid);
      if (element instanceof HTMLElement) element.focus();
    },
    [fields, parse],
  );

  /**
   * Server errors always show — they are the authority and they arrive with the
   * page. Client errors show for touched fields, or for everything once a submit
   * has been attempted.
   */
  const errors: Partial<Record<Field, string>> = {};
  for (const field of fields) {
    const server = serverErrors[field];
    if (server) {
      errors[field] = server;
      continue;
    }
    const client = clientErrors[field];
    if (client && (submitAttempted || touched.has(field))) errors[field] = client;
  }

  return { formRef, errors, onBlur, onSubmit };
}
