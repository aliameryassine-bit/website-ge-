'use client';

import { useEffect } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Panel';
import { useCopy } from '@/i18n/copy';

/**
 * 500 — an unhandled error inside a route.
 *
 * Three things it must do, in order of importance:
 *
 * 1. Not lose the person. Both conversion paths are on the page, and — unlike
 *    the 404 — so is the direct contact address, because someone who hit a
 *    server error has reason to doubt that a form will work.
 * 2. Offer a retry. `reset()` re-renders the segment without a full reload,
 *    which recovers from a transient failure without losing scroll position.
 * 3. Say nothing about the cause. `error.digest` is logged, never displayed:
 *    a stack trace or an internal message on a public page is an information
 *    leak, and it means nothing to a retail operations lead anyway.
 *
 * This is a client component because React requires error boundaries to be
 * one. It therefore cannot read copy on the server, which is why the copy
 * namespace it uses is in CLIENT_NAMESPACES.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const COPY = useCopy();

  useEffect(() => {
    // The digest is the only handle on the server-side log entry.
    console.error(`[error-boundary] ${error.digest ?? 'no digest'}`, error);
  }, [error]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-2xl px-md py-3xl md:px-xl"
    >
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.errors.serverError.eyebrow}</Eyebrow>
        <h1 className="font-display text-section text-ink">{COPY.errors.serverError.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.errors.serverError.body}</p>
      </header>

      <div className="flex flex-col gap-md border-t border-alu/25 pt-2xl sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-sm rounded-panel bg-action px-lg py-sm text-label whitespace-nowrap text-on-action uppercase transition-colors duration-[var(--duration-state)] ease-enter hover:bg-action/90"
        >
          {COPY.errors.serverError.retry}
        </button>
        <ButtonLink href={COPY.cta.pilot.href} variant="secondary">
          {COPY.cta.pilot.label}
        </ButtonLink>
        <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
          {COPY.cta.investorAccess.label}
        </ButtonLink>
      </div>

      {/* Someone who just hit a 500 has earned a route that does not involve a form. */}
      <p className="text-data text-ink-muted">{COPY.errors.serverError.fallback}</p>
    </main>
  );
}
