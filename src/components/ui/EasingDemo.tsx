'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Runs a token easing curve against a token duration so the pairing can be
 * felt rather than read. Replays on demand — nothing loops, and under reduced
 * motion the travel is instant and the button says so.
 *
 * Uses CSS transitions with var() so it demonstrates the actual token values,
 * not a JS re-implementation of them.
 */
export function EasingDemo({
  easeToken,
  durationToken,
}: {
  easeToken: string;
  durationToken: string;
}) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(false);

  // Auto-return so the demo is always ready to replay.
  useEffect(() => {
    if (!out) return;
    const timer = setTimeout(() => setOut(false), 1200);
    return () => clearTimeout(timer);
  }, [out]);

  return (
    <div className="flex flex-col gap-sm">
      <div className="relative h-8 border border-alu/30 bg-well">
        <span
          className="absolute top-1/2 size-6 -translate-y-1/2 bg-action"
          style={{
            left: out ? 'calc(100% - var(--spacing-lg) - 0.25rem)' : 'var(--spacing-xs)',
            transitionProperty: 'left',
            transitionDuration: reduced ? '0ms' : `var(--duration-${durationToken})`,
            transitionTimingFunction: `var(--ease-${easeToken})`,
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => setOut((value) => !value)}
        className="w-fit cursor-pointer border border-alu/50 px-sm py-xs text-data text-ink-muted uppercase transition-colors duration-[var(--duration-state)] hover:border-action hover:text-action"
      >
        {reduced ? 'Run (reduced: instant)' : 'Run'}
      </button>
    </div>
  );
}

export default EasingDemo;
