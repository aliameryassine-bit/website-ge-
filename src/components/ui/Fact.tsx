/**
 * Renders one fact from content/facts.ts.
 *
 * No component may hardcode a number or a claim — this is the only way a
 * figure reaches the page.
 *
 * In development, any fact still marked PLACEHOLDER renders a visible badge so
 * it cannot be missed in review. scripts/check-facts.ts stops a placeholder
 * reaching a production build.
 *
 * Every value here is a design token. The placeholder badge deliberately uses
 * the optic colour rather than inventing a warning red: the palette has six
 * values and a review state is not a seventh.
 */

import { FACTS, type FactId } from '@/content/facts';
import { COPY } from '@/content/copy';

const IS_DEV = process.env.NODE_ENV !== 'production';

type FactProps = {
  /** Compile-time checked against the keys of FACTS. */
  id: FactId;
  /** Hide the label when the surrounding layout already provides one. */
  showLabel?: boolean;
  /** Readout size. `xl` for hero stats, `m` for inline figures. */
  size?: 'xl' | 'm';
  className?: string;
};

export function Fact({ id, showLabel = true, size = 'm', className }: FactProps) {
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
            {IS_DEV ? (
              <span
                aria-hidden="true"
                className="border border-optic-ink px-xs text-data font-semibold tracking-wider text-optic-ink uppercase"
              >
                placeholder
              </span>
            ) : null}
          </>
        ) : null}
      </span>

      {showLabel ? <span className="text-label text-ink-muted uppercase">{fact.label}</span> : null}
    </div>
  );
}

export default Fact;
