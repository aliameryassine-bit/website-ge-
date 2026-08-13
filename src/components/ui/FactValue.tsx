/**
 * A fact's value with its pending marker — the smallest honest unit.
 *
 * Extracted because this markup had been written three times (hero spec row,
 * footer disclosure, technology steps) and a fourth copy would have guaranteed
 * they drifted apart. The screen-reader announcement is the part that must not
 * vary: a placeholder is never silently read out as a real figure.
 */

import { FACTS, type FactId } from '@/content/facts';
import { getCopy } from '@/i18n/copy';

type Size = 'readout' | 'data';

const SIZES: Record<Size, string> = {
  readout: 'text-readout-m text-ink',
  data: 'text-data text-ink',
};

export async function FactValue({ id, size = 'readout' }: { id: FactId; size?: Size }) {
  const COPY = await getCopy();
  const fact = FACTS[id];
  const pending = fact.status === 'PLACEHOLDER';

  return (
    <span className="inline-flex items-center gap-sm" data-fact-status={fact.status}>
      <span data-readout className={SIZES[size]}>
        {fact.value}
      </span>
      {pending ? (
        <>
          <span className="sr-only">{COPY.a11y.placeholderFact}</span>
          <span
            aria-hidden="true"
            className="border border-optic-ink px-xs text-data text-optic-ink uppercase"
          >
            pending
          </span>
        </>
      ) : null}
    </span>
  );
}

/** A label/value pair for dense specification lists. */
export function FactRow({ id }: { id: FactId }) {
  const fact = FACTS[id];
  return (
    <div
      className="flex flex-col gap-xs border-t border-alu/20 pt-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-lg"
      data-fact-id={fact.id}
      data-fact-status={fact.status}
    >
      <dt className="text-label text-ink-muted uppercase">{fact.label}</dt>
      <dd>
        <FactValue id={id} />
      </dd>
    </div>
  );
}

export default FactValue;
