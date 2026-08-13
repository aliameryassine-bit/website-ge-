'use client';

import { useEffect, type ReactNode } from 'react';

import { useReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Root scroll boundary.
 *
 * Lenis smooth scroll is only ever constructed when motion is welcome. Not
 * "started then stopped" — never instantiated, so it cannot hijack a single
 * frame of scrolling for someone who asked for stillness.
 *
 * IMPORTED DYNAMICALLY, with a measurement behind it: statically imported,
 * Lenis and Motion shared a 47.7 KB gzip chunk in the baseline of EVERY route,
 * paid for by every visitor including the ones who asked for reduced motion and
 * never run a frame of it. Now none of it is fetched until after paint, and
 * under `reduce` it is never fetched at all.
 *
 * MotionConfig used to live here, wrapping the whole tree. It moved into
 * MobileMenu, the only component in the codebase that animates with Motion,
 * because a provider at the root pulled the library into every page to serve an
 * overlay most visitors never open. The reduced-motion contract is unchanged —
 * the config now sits with the thing it configures.
 */

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let lenis: { raf(time: number): void; destroy(): void } | null = null;
    let frame = 0;
    let cancelled = false;

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({
        duration: 1.1,
        // Belts run at constant speed; scroll should feel weighty, not springy.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Never smooth touch: it fights the platform's own scroll physics and
        // makes a phone feel broken.
        syncTouch: false,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [reduced]);

  return children;
}

export default MotionProvider;
