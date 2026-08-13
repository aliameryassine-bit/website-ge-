'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { useCopy } from '@/i18n/copy';
import { Link } from '@/i18n/navigation';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { useScrollLock } from '@/lib/use-scroll-lock';

/**
 * The mobile navigation overlay.
 *
 * Split out of Header so it can be loaded ON DEMAND. Motion is used in exactly
 * one place on this site — here — and importing it from the header put a
 * 47.7 KB gzip chunk (with Lenis) in the baseline of every route to serve an
 * overlay that a desktop visitor never opens. It is now fetched when the menu
 * is first opened.
 *
 * MotionConfig lives here rather than at the root for the same reason. The
 * contract it enforces is unchanged: `reducedMotion="user"` means every
 * animation below it skips to its end state when the OS asks for stillness,
 * and this is the only subtree with animations to configure.
 *
 * Behaviour is untouched by the move: focus trapped inside, Escape closes, body
 * scroll locked while open, staggered reveal that collapses to an instant
 * appearance under reduced motion.
 */

/** Matches --duration-component in globals.css. */
const COMPONENT_SECONDS = 0.22;
/** 40ms per item — inside the approved 30–50ms stagger band. */
const STAGGER_SECONDS = 0.04;
const EASE_ENTER: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function MobileMenu({
  open,
  onClose,
  isCurrent,
  glyph,
}: {
  open: boolean;
  onClose: () => void;
  isCurrent: (href: string) => boolean;
  /** The close glyph, passed in so the icon has one definition in Header. */
  glyph: React.ReactNode;
}) {
  const COPY = useCopy();
  const reduced = useReducedMotion();
  const overlay = useRef<HTMLDivElement>(null);

  useScrollLock(open);
  useFocusTrap(overlay, open);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const duration = reduced ? 0 : COMPONENT_SECONDS;
  const stagger = reduced ? 0 : STAGGER_SECONDS;

  return (
    <MotionConfig reducedMotion="user" transition={{ duration, ease: EASE_ENTER }}>
      <AnimatePresence>
        {open ? (
          <motion.div
            id="site-menu"
            ref={overlay}
            role="dialog"
            aria-modal="true"
            aria-label={COPY.a11y.menuLabel}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            className="fixed inset-0 top-0 z-50 flex h-dvh flex-col overflow-y-auto bg-ground px-md pt-sm pb-2xl xl:hidden"
          >
            <div className="flex items-center justify-between gap-md">
              <span className="font-display text-subsection text-ink">{COPY.site.name}</span>
              <button
                type="button"
                onClick={onClose}
                className="flex size-11 items-center justify-center border border-alu/40 text-ink transition-colors duration-[var(--duration-state)] ease-enter hover:border-action hover:text-action"
              >
                <span className="sr-only">{COPY.a11y.closeMenu}</span>
                {glyph}
              </button>
            </div>

            <nav aria-label={COPY.nav.label} className="mt-2xl flex flex-col">
              {COPY.nav.items.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration, delay: stagger * index }}
                  className="border-b border-alu/20"
                >
                  <Link
                    href={item.href}
                    aria-current={isCurrent(item.href) ? 'page' : undefined}
                    className={[
                      'flex min-h-14 items-center font-display text-subsection transition-colors',
                      'duration-[var(--duration-state)] ease-enter',
                      isCurrent(item.href) ? 'text-action' : 'text-ink hover:text-action',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration, delay: stagger * COPY.nav.items.length }}
              className="mt-2xl flex flex-col gap-sm"
            >
              <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
              <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
                {COPY.cta.investorAccess.label}
              </ButtonLink>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default MobileMenu;
