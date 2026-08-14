/**
 * Renders one fact from content/facts.ts.
 *
 * No component may hardcode a number or a claim — this is the only way a
 * figure reaches the page.
 *
 * A PLACEHOLDER renders a visible marker in EVERY environment, matching
 * FactValue, Counter and Callout.
 *
 * It used to render only in development, on the reasoning that
 * scripts/check-facts.ts stops a placeholder reaching production anyway. That
 * reasoning no longer holds: a preview deploy runs with ALLOW_PLACEHOLDERS=1,
 * which is the only way to see the site before the figures exist — so
 * placeholders do reach a production build, and this component was the one
 * member of the family that fell back to a bare dash there. On the pilot
 * confirmation page that meant someone who had just submitted the form was
 * told when to expect a reply by an unexplained "—", with no way to tell an
 * unmeasured figure from one that failed to load.
 *
 * Every value here is a design token. The marker deliberately uses the optic
 * colour rather than inventing a warning red: the palette has six values and a
 * review state is not a seventh.
 */

import { FACTS, type FactId } from '@/content/facts';
import { getCopy } from '@/i18n/copy';

type FactProps = {
  /** Compile-time checked against the keys of FACTS. */
  id: FactId;
  /** Hide the label when the surrounding layout already provides one. */
  showLabel?: boolean;
  /** Readout size. `xl` for hero stats, `m` for inline figures. */
  size?: 'xl' | 'm';
  className?: string;
};

export async function Fact({ id, showLabel = true, size = 'm', className }: FactProps) {
  const COPY = await getCopy();
  const fact = FACTS[id];
  const isPlaceholder = fact.status === 'PLACEHOLDER';

  return (
    <div
      className={`flex flex-col gap-xs ${className ?? ''}`}
      data-fact-id={fact.id}
      data-fact-status={fact.status}
    >
      <span className="flex items-center gap-sm">
        <span
          data-readout
          className={size === 'xl' ? 'text-readout-xl text-ink' : 'text-readout-m text-ink'}
        >
          {fact.value}
        </span>

        {isPlaceholder ? (
          <>
            {/* Announced in every environment, so a placeholder is never
                silently read out as a real figure. */}
            <span className="sr-only">{COPY.a11y.placeholderFact}</span>
            <span
              aria-hidden="true"
              className="border border-optic-ink px-xs text-data font-semibold tracking-wider text-optic-ink uppercase"
            >
              {COPY.a11y.factNotMeasured}
            </span>
          </>
        ) : null}
      </span>

      {showLabel ? <span className="text-label text-ink-muted uppercase">{fact.label}</span> : null}
    </div>
  );
}

export default Fact;
