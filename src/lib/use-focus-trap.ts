'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps Tab within `container` while `active`, and restores focus to whatever
 * was focused before on close.
 *
 * Hand-rolled rather than pulled in as a dependency: the behaviour is a dozen
 * lines and the alternative is a library in the critical path of the header.
 *
 * - Moves focus into the container on open, so a screen reader lands inside
 *   the menu rather than continuing behind it.
 * - Wraps Tab and Shift+Tab at the ends.
 * - Restores the previously focused element on close, so closing the menu puts
 *   the user back on the toggle they opened it with.
 */
export function useFocusTrap(container: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const node = container.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null || element === document.activeElement,
      );

    // Focus the first control inside rather than the container itself.
    const initial = focusable()[0];
    if (initial) initial.focus();
    else node.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [active, container]);
}
