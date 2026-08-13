'use client';

import { useCopy } from '@/i18n/copy';
import { FACTS } from '@/content/facts';
import type { FailureReason } from '@/lib/forms/state';

/**
 * What a refused submission looks like.
 *
 * The rule this component exists to enforce: a lead is never lost silently.
 * Whatever went wrong, the person leaves with a way to reach us that does not
 * depend on the thing that just failed.
 *
 * The fallback address comes from facts.ts. While `contact-email` is a
 * PLACEHOLDER it renders as a dash, and a dash where an email should be is
 * worse than useless — it looks like the page is broken and gives the person
 * nothing. So the unknown case says plainly that no address is published rather
 * than printing the dash. `check-facts` blocks a production build until it is
 * set, which is what stops this state shipping.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

function retryPhrase(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  if (minutes <= 1) return 'Try again in about a minute.';
  return `Try again in about ${minutes} minutes.`;
}

export function FormFailure({
  reason,
  retryAfter,
}: {
  reason: FailureReason;
  retryAfter?: number;
}) {
  const COPY = useCopy();
  /* Reason -> copy block. Built per render because the copy is locale-bound. */
  const copy = {
    delivery: COPY.formFailure.delivery,
    'rate-limited': COPY.formFailure.rateLimited,
    stale: COPY.formFailure.stale,
    'suspected-bot': COPY.formFailure.suspectedBot,
  }[reason];
  const contact = FACTS['contact-email'];
  const hasAddress = contact.status !== 'PLACEHOLDER' && contact.value !== '—';

  return (
    <div
      role="alert"
      className="flex flex-col gap-sm border border-optic-ink/60 p-md"
      data-form-failure={reason}
    >
      <p className="text-label text-optic-ink uppercase">{copy.heading}</p>
      <p className="text-body text-ink">{copy.body}</p>

      {reason === 'rate-limited' && retryAfter ? (
        <p className="text-data text-ink-muted">{retryPhrase(retryAfter)}</p>
      ) : null}

      {/* Never a dead end. */}
      <p className="text-data text-ink-muted">
        {hasAddress ? (
          <>
            {COPY.formFailure.fallbackPrefix}{' '}
            <a
              href={`mailto:${contact.value}`}
              className="text-ink underline decoration-alu/50 underline-offset-2 hover:decoration-action"
            >
              {contact.value}
            </a>
          </>
        ) : (
          <>
            {COPY.formFailure.fallbackUnknown}
            {/* The fix belongs to whoever is building, not to the visitor. */}
            {IS_DEV ? (
              <span className="text-optic-ink"> {COPY.formFailure.fallbackUnknownHint}</span>
            ) : null}
          </>
        )}
      </p>
    </div>
  );
}

export default FormFailure;
