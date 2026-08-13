'use client';

import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';

import { useReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Root motion boundary. Two jobs:
 *
 * 1. MotionConfig with reducedMotion="user" — every Motion animation in the
 *    tree respects the OS preference without any component opting in.
 *    Transform/opacity animations are skipped to their end state.
 * 2. Lenis smooth scroll is only ever constructed when motion is welcome.
 *    Not "started then stopped" — never instantiated, so it cannot hijack a
 *    single frame of scrolling for someone who asked for stillness.
 *
 * The motion physics come from the token layer, so a duration or curve can
 * only be changed in globals.css.
 */

/** Matches --duration-section / --ease-enter in globals.css. */
const SECTION_SECONDS = 0.42;
const EASE_ENTER: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Belts run at constant speed; scroll should feel weighty, not springy.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Never smooth touch: it fights the platform's own scroll physics and
      // makes a phone feel broken.
      syncTouch: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return (
    <MotionConfig
      reducedMotion="user"
      transition={reduced ? { duration: 0 } : { duration: SECTION_SECONDS, ease: EASE_ENTER }}
    >
      {children}
    </MotionConfig>
  );
}

export default MotionProvider;
