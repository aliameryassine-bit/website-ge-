'use client';

import { useSyncExternalStore } from 'react';

/**
 * True once the window has scrolled past `threshold` pixels.
 *
 * Read as an external store rather than mirrored into state, so there is no
 * setState-in-effect cascade. The snapshot is a boolean, so React only
 * re-renders when the header actually changes state — not on every scroll
 * event — which is why this needs no rAF throttle of its own.
 *
 * The server snapshot is `false`, the over-hero state. With JavaScript disabled
 * the header stays there permanently; that state is legible against the ground,
 * so nothing is gated on this hook.
 */
export function useScrollPast(threshold: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.scrollY > threshold,
    () => false,
  );
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange, { passive: true });
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}
