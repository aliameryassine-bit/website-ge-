'use client';

import { useEffect, useRef, useState } from 'react';

import { COPY } from '@/content/copy';
import { FACTS, isPubliclyCitable, type FactId } from '@/content/facts';

/**
 * Egypt PET material flow: consumed, against where it ends up.
 *
 * A real chart, not decoration — and it refuses to lie in two distinct ways.
 *
 * 1. It will not draw magnitudes without a public source for every band. A
 *    flow diagram is read as authoritative; drawing one from unsourced numbers
 *    would be the most damaging thing on this site.
 * 2. It will not draw if the bands do not reconcile with consumption. A flow
 *    chart whose parts do not sum to the whole is worse than no chart, because
 *    it looks right. Mixing a consumption figure from one study with a
 *    collection rate from another is exactly how that happens, so the check is
 *    explicit rather than trusted.
 *
 * When it cannot draw magnitudes it still draws the STRUCTURE — the three
 * destinations, at indeterminate width, hatched and labelled as unsourced. The
 * system is real even where our numbers are not, and showing the shape of the
 * question asserts nothing about its answer.
 *
 * MATERIAL AS MATERIAL: no trees, globes or droplets. Formally collected is
 * solid flake; informally collected is flake under a diagonal hatch, recovered
 * but outside the formal system; uncollected is belt black. Every band is
 * directly labelled, so nothing depends on colour alone.
 *
 * ANIMATION: on intersection, scaleX from the left, and only for a chart that
 * was off screen when it mounted — a chart already in view renders final rather
 * than jumping to zero to grow back. Reduced motion and no JavaScript both give
 * the final state, because the base CSS state IS the final state.
 */

const BANDS = [
  { id: 'egypt-pet-formally-collected', fill: 'var(--color-stream-pet)', pattern: null },
  { id: 'egypt-pet-informally-collected', fill: 'var(--color-stream-pet)', pattern: 'flow-hatch' },
  { id: 'egypt-pet-uncollected', fill: 'var(--color-belt)', pattern: null },
] as const satisfies readonly { id: FactId; fill: string; pattern: string | null }[];

const TOTAL_ID: FactId = 'egypt-annual-pet-consumption';

/** Bands must sum to consumption within this fraction, or the chart refuses. */
const RECONCILE_TOLERANCE = 0.02;

const WIDTH = 1000;

/**
 * The bar scales with its container width, so the viewBox aspect sets its height
 * at every breakpoint. At 72 the bar measured ~25px tall at 390px wide, too thin
 * for the informal-collection hatch to read as a hatch. 110 gives ~38px on a
 * phone and ~128px on desktop, where the band reads as a volume of material.
 */
const BAR_HEIGHT = 110;

type Resolved = {
  id: FactId;
  label: string;
  numeric: number;
  share: number;
  fill: string;
  pattern: string | null;
};

function resolve():
  | { ok: true; bands: Resolved[]; total: number; source: string; sourceUrl?: string; unit: string }
  | {
      ok: false;
      reason: 'unsourced' | 'mismatch';
      missing: string[];
      sum?: number;
      total?: number;
    } {
  const total = FACTS[TOTAL_ID];
  const missing: string[] = [];

  if (!isPubliclyCitable(total) || typeof total.numeric !== 'number') missing.push(total.label);
  for (const band of BANDS) {
    const fact = FACTS[band.id];
    if (!isPubliclyCitable(fact) || typeof fact.numeric !== 'number') missing.push(fact.label);
  }
  if (missing.length > 0) return { ok: false, reason: 'unsourced', missing };

  const totalValue = total.numeric as number;
  const resolved: Resolved[] = BANDS.map((band) => {
    const fact = FACTS[band.id];
    const numeric = fact.numeric as number;
    return {
      id: band.id,
      label: fact.label,
      numeric,
      share: numeric / totalValue,
      fill: band.fill,
      pattern: band.pattern,
    };
  });

  const sum = resolved.reduce((accumulator, band) => accumulator + band.numeric, 0);
  if (Math.abs(sum - totalValue) / totalValue > RECONCILE_TOLERANCE) {
    return { ok: false, reason: 'mismatch', missing: [], sum, total: totalValue };
  }

  return {
    ok: true,
    bands: resolved,
    total: totalValue,
    source: total.source,
    ...(total.sourceUrl ? { sourceUrl: total.sourceUrl } : {}),
    unit: total.unit ?? '',
  };
}

export function MaterialFlow() {
  const copy = COPY.impact.flow;
  const data = resolve();
  const container = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!data.ok) return;
    const element = container.current;
    if (!element) return;

    // Already on screen: render final. Only animate a chart the reader arrives at.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setAnimate(true);
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [data.ok]);

  return (
    <figure ref={container} className="flex flex-col gap-lg">
      <svg
        viewBox={`0 0 ${WIDTH} ${BAR_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-labelledby="flow-title flow-desc"
      >
        <title id="flow-title">{copy.title}</title>
        <desc id="flow-desc">
          {data.ok
            ? `${copy.title}. ${data.bands
                .map((band) => `${band.label}: ${Math.round(band.share * 100)} per cent`)
                .join('. ')}.`
            : copy.unsourcedDescription}
        </desc>

        <defs>
          <pattern
            id="flow-hatch"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" fill="var(--color-stream-pet)" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--color-belt)" strokeWidth="3" />
          </pattern>
          <pattern
            id="flow-unknown"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="10" stroke="var(--color-ink-muted)" strokeWidth="2" />
          </pattern>
        </defs>

        {data.ok ? (
          (() => {
            let x = 0;
            return data.bands.map((band) => {
              const width = band.share * WIDTH;
              const rect = (
                <rect
                  key={band.id}
                  x={x}
                  y="0"
                  width={width}
                  height={BAR_HEIGHT}
                  fill={band.pattern ? `url(#${band.pattern})` : band.fill}
                  stroke="var(--color-ground)"
                  strokeWidth="2"
                  data-flow-band
                  style={{
                    transformOrigin: 'left center',
                    transform: animate ? undefined : 'scaleX(1)',
                    animation: animate
                      ? 'flow-grow var(--duration-section) var(--ease-enter) both'
                      : undefined,
                  }}
                />
              );
              x += width;
              return rect;
            });
          })()
        ) : (
          /* Structure only. Equal thirds carry no claim; the hatch says so. */
          <>
            <rect
              x="0"
              y="0"
              width={WIDTH}
              height={BAR_HEIGHT}
              fill="url(#flow-unknown)"
              opacity="0.5"
            />
            <rect
              x="0"
              y="0"
              width={WIDTH}
              height={BAR_HEIGHT}
              fill="none"
              stroke="var(--color-ink-muted)"
              strokeWidth="2"
            />
            {[1, 2].map((index) => (
              <line
                key={index}
                x1={(WIDTH / 3) * index}
                y1="0"
                x2={(WIDTH / 3) * index}
                y2={BAR_HEIGHT}
                stroke="var(--color-ink-muted)"
                strokeWidth="2"
                strokeDasharray="6 5"
              />
            ))}
          </>
        )}
      </svg>

      {/* Legend. Every band labelled, so colour is never the only carrier. */}
      <ul className="flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:gap-xl">
        {BANDS.map((band) => {
          const fact = FACTS[band.id];
          const resolved = data.ok ? data.bands.find((item) => item.id === band.id) : undefined;
          return (
            <li key={band.id} className="flex items-baseline gap-sm">
              <span
                aria-hidden="true"
                className="mt-[0.3em] inline-block size-4 shrink-0 border border-alu/50"
                style={{
                  background: band.pattern
                    ? 'repeating-linear-gradient(45deg, var(--color-stream-pet) 0 3px, var(--color-belt) 3px 6px)'
                    : band.fill,
                }}
              />
              <span className="text-label text-ink uppercase">{fact.label}</span>
              <span data-readout className="text-data text-ink-muted">
                {resolved ? `${Math.round(resolved.share * 100)}%` : '—'}
              </span>
            </li>
          );
        })}
      </ul>

      <figcaption className="flex flex-col gap-sm">
        {data.ok ? (
          <>
            <p className="text-data text-ink-muted">
              {copy.totalPrefix} {FACTS[TOTAL_ID].value} {data.unit}
            </p>
            {/* Citation, visible, directly beneath the chart. */}
            <p className="text-data text-ink-muted">
              {copy.sourcePrefix}{' '}
              {data.sourceUrl ? (
                <a
                  href={data.sourceUrl}
                  rel="noreferrer"
                  className="underline decoration-alu/50 underline-offset-2 hover:text-ink hover:decoration-action"
                >
                  {data.source}
                </a>
              ) : (
                data.source
              )}
            </p>
          </>
        ) : (
          <div className="flex max-w-measure flex-col gap-sm border border-optic-ink/40 p-md">
            <p className="text-label text-optic-ink uppercase">
              {data.reason === 'mismatch' ? copy.mismatchHeading : copy.unsourcedHeading}
            </p>
            <p className="text-body text-ink">
              {data.reason === 'mismatch' ? copy.mismatchBody : copy.unsourcedBody}
            </p>
            {data.missing.length > 0 ? (
              <ul className="flex flex-col gap-xs">
                {data.missing.map((label) => (
                  <li key={label} className="flex items-baseline gap-sm text-data">
                    <span className="border border-optic-ink px-xs text-optic-ink uppercase">
                      no source
                    </span>
                    <span className="text-ink-muted">{label}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </figcaption>
    </figure>
  );
}

export default MaterialFlow;
