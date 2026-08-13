/**
 * A figure with its public citation — or nothing at all.
 *
 * The investor market-context rule is absolute: a figure without a named
 * public source does not go on the page. So this component renders NOTHING
 * when the fact is not publicly citable. It does not render a dash, a "pending"
 * chip or a caveat, because all three still put the claim in front of the
 * reader with a hedge attached.
 *
 * That is the opposite of `FactValue`, which shows pending state on purpose.
 * The two coexist because the audiences differ: an operations lead reading a
 * spec benefits from knowing a figure is coming, while an investor reading an
 * unsourced market statistic has been handed a liability.
 *
 * `internal` status does not qualify. An internal document is not a public
 * source, whatever it says.
 */

import { FACTS, isPubliclyCitable, type FactId } from '@/content/facts';

export function SourcedFigure({ id }: { id: FactId }) {
  const fact = FACTS[id];
  if (!isPubliclyCitable(fact)) return null;

  return (
    <div
      className="flex flex-col gap-xs border-t border-alu/25 pt-md"
      data-fact-id={fact.id}
      data-fact-status={fact.status}
    >
      <span data-readout className="text-readout-m text-ink">
        {fact.value}
      </span>
      <span className="text-label text-ink-muted uppercase">{fact.label}</span>
      <span className="text-data text-ink-muted">
        {fact.sourceUrl ? (
          <a
            href={fact.sourceUrl}
            rel="noreferrer"
            className="underline decoration-alu/50 underline-offset-2 transition-colors duration-[var(--duration-state)] ease-enter hover:text-ink hover:decoration-action"
          >
            {fact.source}
          </a>
        ) : (
          fact.source
        )}
      </span>
    </div>
  );
}

/** True when at least one of `ids` may be published. Drives the empty state. */
export function anyPubliclyCitable(ids: readonly FactId[]): boolean {
  return ids.some((id) => isPubliclyCitable(FACTS[id]));
}

export default SourcedFigure;
