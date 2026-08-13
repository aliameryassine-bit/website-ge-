'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * The server snapshot is `true` — the still version.
 *
 * The server cannot know the preference, and guessing "motion is fine" would
 * flash animation at exactly the people who asked not to see it. Rendering
 * still first means the worst case is that motion starts one commit late.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Live prefers-reduced-motion state, read as an external store rather than
 * mirrored into component state. Toggling the OS setting takes effect without
 * a reload, and there is no setState-in-effect cascade.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
