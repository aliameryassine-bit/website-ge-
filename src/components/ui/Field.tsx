import type { ReactNode } from 'react';

import { HONEYPOT_FIELD, TIMING_FIELD } from '@/lib/forms/schemas';

/**
 * Form field primitives, shared by both conversion paths.
 *
 * One definition of what a field looks like and how it announces an error, so
 * the pilot form and the data room form cannot drift apart.
 *
 * ACCESSIBILITY, in every field here rather than remembered per form:
 * - a real <label> bound by htmlFor. A placeholder is never a label; it
 *   disappears exactly when the person needs it.
 * - aria-invalid and aria-describedby wired to the message element.
 * - the message carries role="alert" so it is announced when it appears.
 * - errors are text, never colour alone.
 * - 44px minimum target height on every control.
 */

const CONTROL =
  'min-h-11 w-full rounded-panel border bg-well px-md py-sm text-body text-ink ' +
  'transition-colors duration-[var(--duration-state)] ease-enter';

function controlClass(invalid: boolean): string {
  return `${CONTROL} ${invalid ? 'border-optic-ink' : 'border-alu/50'}`;
}

function Message({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-data text-optic-ink">
      {children}
    </p>
  );
}

type BaseProps = {
  name: string;
  label: string;
  error?: string;
  defaultValue?: string;
  required?: boolean;
  autoComplete?: string;
  /** Shown under the label, before the control. Not an error. */
  hint?: string;
};

export function TextField({
  type = 'text',
  inputMode,
  min,
  step,
  ...props
}: BaseProps & {
  type?: 'text' | 'email' | 'url' | 'number' | 'tel';
  inputMode?: 'numeric' | 'text' | 'email' | 'url';
  min?: number;
  step?: number;
}) {
  const errorId = `${props.name}-error`;
  const hintId = `${props.name}-hint`;
  const described = [props.error ? errorId : null, props.hint ? hintId : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={props.name} className="text-label text-ink uppercase">
        {props.label}
      </label>
      {props.hint ? (
        <p id={hintId} className="text-data text-ink-muted">
          {props.hint}
        </p>
      ) : null}
      <input
        id={props.name}
        name={props.name}
        type={type}
        inputMode={inputMode}
        min={min}
        step={step}
        autoComplete={props.autoComplete}
        required={props.required}
        defaultValue={props.defaultValue ?? ''}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={described || undefined}
        className={controlClass(Boolean(props.error))}
      />
      {props.error ? <Message id={errorId}>{props.error}</Message> : null}
    </div>
  );
}

export function SelectField({
  options,
  prompt,
  ...props
}: BaseProps & { options: readonly string[]; prompt: string }) {
  const errorId = `${props.name}-error`;
  return (
    <div className="flex flex-col gap-sm">
      <label htmlFor={props.name} className="text-label text-ink uppercase">
        {props.label}
      </label>
      <select
        id={props.name}
        name={props.name}
        required={props.required}
        /*
          Remounted when the echoed value changes. React applies a select's
          defaultValue at mount only, so after the form reset that follows an
          action it snaps back to the empty option — which then fails validation
          on resubmit even though a type was chosen. The key forces it to take.
        */
        key={`${props.name}-${props.defaultValue ?? 'empty'}`}
        defaultValue={props.defaultValue ?? ''}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? errorId : undefined}
        className={controlClass(Boolean(props.error))}
      >
        <option value="" disabled>
          {prompt}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {props.error ? <Message id={errorId}>{props.error}</Message> : null}
    </div>
  );
}

export function CheckboxField({
  name,
  error,
  defaultChecked,
  children,
  note,
}: {
  name: string;
  error?: string;
  /** Never defaults to true. Consent and declarations start unticked. */
  defaultChecked?: boolean;
  children: ReactNode;
  note?: ReactNode;
}) {
  const errorId = `${name}-error`;
  const noteId = `${name}-note`;
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex items-start gap-md">
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked ?? false}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error ? errorId : null, note ? noteId : null].filter(Boolean).join(' ').trim() ||
            undefined
          }
          className="mt-xs size-5 shrink-0 accent-[var(--color-action)]"
        />
        <label htmlFor={name} className="text-data text-ink">
          {children}
        </label>
      </div>
      {note ? (
        <p id={noteId} className="text-data text-optic-ink">
          {note}
        </p>
      ) : null}
      {error ? <Message id={errorId}>{error}</Message> : null}
    </div>
  );
}

/**
 * The honeypot.
 *
 * Off-screen rather than `display: none`: some bots skip fields that are
 * outright hidden. `aria-hidden` and `tabIndex={-1}` keep it away from screen
 * readers and the tab order, so no person reaches it, and `autoComplete="off"`
 * with a meaningless name keeps password managers from filling it — an
 * autofilled honeypot rejects a real submission, which is worse than the spam
 * it prevents.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden"
    >
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/** Signed issue time for the timing check. Minted server-side per render. */
export function FormToken({ value }: { value: string }) {
  return <input type="hidden" name={TIMING_FIELD} defaultValue={value} />;
}

export { controlClass };
