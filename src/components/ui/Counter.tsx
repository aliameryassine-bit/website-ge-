'use client';

import { useEffect, useRef, useState } from 'react';

import { FACTS, isCountable, type FactId } from '@/content/facts';
import { useCopy } from '@/i18n/copy';
import { useReducedMotion } from '@/lib/use-reduced-motion';

/**
 * A figure that counts up — but only when it is entitled to.
 *
 * THE RULE: a PLACEHOLDER never animates. It renders as a dash. Animating a
 * number nobody has measured is the most persuasive way to publish a fiction,
 * and an impact page is where that does the most damage. `isCountable()` in
 * facts.ts is the gate, and it also requires a unit and a time basis, because
 * "1.2M containers" is a decoration and "1.2M containers since March 2026" is a
 * claim someone can check.
 *
 * REDUCED MOTION: the final value renders immediately. Not counted quickly —
 * counted not at all.
 *
 * NO JAVASCRIPT: the server render is the final value, so the figure is correct
 * before hydration and the count-up only ever replaces a correct number with
 * the same correct number.
 */

/** Matches --duration-signature. The count is the one long movement here. */
const COUNT_MS = 900;

/** Expo-out, the same curve as --ease-enter: decisive arrival, no overshoot. */
function easeOut(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function format(value: number, fractionDigits: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function Counter({ id, className }: { id: FactId; className?: string }) {
  const COPY = useCopy();
  const fact = FACTS[id];
  const countable = isCountable(fact);
  const target = fact.numeric ?? 0;
  const reduced = useReducedMotion();

  /**
   * Starts at the target, so the first paint — server or client — is already
   * the true value. The animation rewinds to zero and plays forward only once
   * it is allowed to run.
   */
  const [display, setDisplay] = useState(target);
  const node = useRef<HTMLSpanElement>(null);

  // Decimal places follow the source figure rather than being imposed.
  const fractionDigits = Number.isInteger(target) ? 0 : (String(target).split('.')[1]?.length ?? 1);

  useEffect(() => {
    if (!countable || reduced) return;
    const element = node.current;
    if (!element) return;

    /**
     * Already on screen at mount: render final, never animate.
     *
     * The server render is the true value, so animating a visible counter means
     * painting the answer, rewinding to zero, and counting back to it — a
     * flicker on the one element that has to look trustworthy. Measured: the
     * first four rendered values were 1,284,930 → 0 → 154,207 → 291,439. A
     * layout effect only shortens that; the SSR paint has already happened.
     * So the count-up is for counters the reader scrolls to. Same rule as the
     * material flow chart.
     */
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    let frame = 0;
    let start: number | null = null;

    const step = (now: number) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / COUNT_MS);
      setDisplay(target * easeOut(progress));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    // Runs on entering view, and disconnects after — a counter that replays on
    // every scroll past becomes wallpaper.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setDisplay(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [countable, reduced, target]);

  if (!countable) {
    const pending = fact.status === 'PLACEHOLDER';
    return (
      <div className={`flex flex-col gap-xs ${className ?? ''}`} data-fact-status={fact.status}>
        <span data-readout className="text-readout-xl text-ink">
          {fact.value}
        </span>
        {pending ? <span className="sr-only">{COPY.a11y.placeholderFact}</span> : null}
        <span className="text-label text-ink-muted uppercase">{fact.label}</span>
        <span className="text-data text-ink-muted">
          {pending ? (
            <span className="border border-optic-ink px-xs text-optic-ink uppercase">
              not yet measured
            </span>
          ) : (
            /* Measured but not countable: missing a unit or a time basis. */
            <span className="border border-optic-ink px-xs text-optic-ink uppercase">
              basis required
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-xs ${className ?? ''}`} data-fact-status={fact.status}>
      <span ref={node} data-readout className="text-readout-xl text-ink">
        {format(display, fractionDigits)}
        <span className="ml-sm text-readout-m text-ink-muted">{fact.unit}</span>
      </span>
      <span className="text-label text-ink-muted uppercase">{fact.label}</span>
      {/* The basis is not optional chrome — without it the number is not a claim. */}
      <span className="text-data text-ink-muted">{fact.basis}</span>
    </div>
  );
}

export default Counter;
