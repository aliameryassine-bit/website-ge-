/**
 * Renders one fact from content/facts.ts.
 *
 * No component may hardcode a number or a claim — this is the only way a
 * figure reaches the page.
 *
 * In development, any fact still marked PLACEHOLDER renders a visible red
 * badge so it cannot be missed in review. `scripts/check-facts.ts` stops
 * a placeholder reaching a production build.
 *
 * Deliberately unstyled beyond the dev badge: the Tailwind decision is
 * still open (see CLAUDE.md), so this carries no utility classes. Hook
 * styling onto the `data-fact-*` attributes when the design system lands.
 */

import type { CSSProperties } from 'react';

import { COPY } from '@/content/copy';
import { FACTS, type FactId } from '@/content/facts';

const IS_DEV = process.env.NODE_ENV !== 'production';

type FactProps = {
  /** Compile-time checked against the keys of FACTS. */
  id: FactId;
  /** Hide the label when the surrounding layout already provides one. */
  showLabel?: boolean;
  /** Element for the value. Use a heading level when the fact is a stat. */
  as?: 'span' | 'strong' | 'p' | 'div';
  className?: string;
};

const badgeStyle: CSSProperties = {
  // Colour is not the only indicator — the badge always carries the word.
  display: 'inline-block',
  marginInlineStart: '0.5ch',
  padding: '0.1em 0.4em',
  border: '1px solid #7f1d1d',
  borderRadius: '2px',
  background: '#fee2e2',
  color: '#7f1d1d',
  font: 'inherit',
  fontSize: '0.7em',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  verticalAlign: 'middle',
  whiteSpace: 'nowrap',
};

export function Fact({ id, showLabel = true, as: Value = 'span', className }: FactProps) {
  const fact = FACTS[id];
  const isPlaceholder = fact.status === 'PLACEHOLDER';

  return (
    <span
      className={className}
      data-fact-id={fact.id}
      data-fact-status={fact.status}
      data-fact-placeholder={isPlaceholder ? '' : undefined}
    >
      <Value data-fact-value="">{fact.value}</Value>
      {isPlaceholder ? (
        <>
          {/* Announced to screen readers in every environment, so a
              placeholder is never silently read as a real figure. */}
          <span
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              margin: '-1px',
              padding: 0,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {COPY.a11y.placeholderFact}
          </span>
          {IS_DEV ? (
            <span style={badgeStyle} aria-hidden="true">
              placeholder
            </span>
          ) : null}
        </>
      ) : null}
      {showLabel ? <span data-fact-label="">{fact.label}</span> : null}
    </span>
  );
}

export default Fact;
