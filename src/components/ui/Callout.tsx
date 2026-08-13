/**
 * THE SIGNATURE ELEMENT — the sourced callout.
 *
 * A figure arrives on a leader line pointing at the thing it measures, and it
 * carries its own provenance: status and source, visible, not buried. A number
 * is either measured and attributed, or it is visibly marked as not yet
 * measured. It is never quietly omitted because it isn't flattering.
 *
 * This is a design device that structurally cannot lie — a callout has to
 * point at something real, and the provenance line has to say where the number
 * came from. It reads its status straight off the fact, so the honesty is
 * enforced by the data rather than by the person laying out the page.
 *
 * Leader lines do not survive 375px, so below `md` the rule is dropped and the
 * callout becomes a plain stacked spec row. Faking the line on mobile would
 * produce the horizontal scroll we forbid.
 */

import { FACTS, type FactId } from '@/content/facts';

const STATUS_LABEL: Record<string, string> = {
  verified: 'Verified',
  internal: 'Internal',
  PLACEHOLDER: 'Not yet measured',
};

type CalloutProps = {
  id: FactId;
  /** Which side the leader line runs to. */
  side?: 'left' | 'right';
  className?: string;
};

export function Callout({ id, side = 'right', className }: CalloutProps) {
  const fact = FACTS[id];
  const isPlaceholder = fact.status === 'PLACEHOLDER';

  return (
    <div
      className={`flex items-center gap-md ${side === 'left' ? 'flex-row-reverse' : ''} ${className ?? ''}`}
      data-callout={fact.id}
      data-fact-status={fact.status}
    >
      {/* Leader line: md and up only. */}
      <span
        aria-hidden="true"
        className="hidden h-px w-[var(--spacing-2xl)] shrink-0 bg-alu/60 md:block"
      />

      <div className="flex flex-col gap-xs">
        <span data-readout className="text-readout-m text-ink">
          {fact.value}
        </span>
        <span className="text-label text-ink-muted uppercase">{fact.label}</span>

        {/* Provenance. The part that makes this the signature rather than
            decoration. */}
        <span className="flex flex-wrap items-center gap-sm text-data">
          <span
            className={
              isPlaceholder
                ? 'border border-optic-ink px-xs text-optic-ink uppercase'
                : 'border border-alu/50 px-xs text-ink-muted uppercase'
            }
          >
            {STATUS_LABEL[fact.status] ?? fact.status}
          </span>
          <span className="text-ink-muted">
            {fact.source === 'UNSOURCED' ? 'source pending' : fact.source}
          </span>
        </span>
      </div>
    </div>
  );
}

export default Callout;
