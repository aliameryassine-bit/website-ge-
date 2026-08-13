import { COPY } from '@/content/copy';

/**
 * Persistent disclaimer, rendered at the foot of every investor route by
 * src/app/investors/layout.tsx.
 *
 * THE WORDING IS A PLACEHOLDER AND MUST BE WRITTEN BY A LAWYER.
 *
 * It is not drafted here on purpose. Investor-facing disclaimers carry real
 * legal effect — which jurisdictions materials may be received in, what
 * constitutes an offer, how forward-looking statements are framed — and
 * plausible-sounding language written in-house is worse than none, because it
 * looks like it has been reviewed.
 *
 * It also cannot ship by accident: the block carries a marker string and
 * scripts/check-legal.ts fails a production build while that marker is present.
 * The placeholder is visually loud for the same reason — nobody should be able
 * to look at this page and not notice.
 */
export function InvestorDisclaimer() {
  const copy = COPY.investorDisclaimer;

  return (
    <aside
      aria-labelledby="investor-disclaimer-heading"
      data-legal-placeholder={copy.marker}
      className="mt-3xl border-t-2 border-optic-ink"
    >
      <div className="mx-auto flex max-w-page flex-col gap-md px-md py-xl md:px-xl">
        <div className="flex flex-wrap items-center gap-md">
          <span className="border border-optic-ink px-sm py-xs text-label text-optic-ink uppercase">
            {copy.marker}
          </span>
          <h2 id="investor-disclaimer-heading" className="text-label text-ink uppercase">
            {copy.heading}
          </h2>
        </div>
        <p className="max-w-measure text-data text-ink-muted">{copy.body}</p>
      </div>
    </aside>
  );
}

export default InvestorDisclaimer;
