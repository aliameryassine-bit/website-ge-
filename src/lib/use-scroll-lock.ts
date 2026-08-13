'use client';

import { useEffect } from 'react';

/**
 * Locks body scroll while `active`.
 *
 * Compensates for the scrollbar width so locking does not shift the layout
 * sideways as the bar disappears — a jump that reads as a bug every time.
 * Also sets overscroll-behavior to stop the scroll chaining through to the
 * page behind the overlay on touch.
 *
 * Restores the previous inline values rather than clearing them, so this
 * composes with anything else that touches body style.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const { body, documentElement } = document;
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      overscroll: body.style.overscrollBehavior,
    };

    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'contain';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      body.style.overscrollBehavior = previous.overscroll;
    };
  }, [active]);
}
