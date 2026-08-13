'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { COPY } from '@/content/copy';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useScrollPast } from '@/lib/use-scroll-past';

/**
 * Global header.
 *
 * Scroll state: transparent over the hero, then a solid ground with a hairline
 * rule once scrolled past it. The transition is animated across the component
 * band (220ms) on background, border and backdrop — never snapped.
 *
 * With JavaScript disabled the header stays in its over-hero state. That state
 * is still legible (flake on housing grey), so nothing is gated on scroll.
 *
 * Mobile: a full-screen overlay with a staggered reveal, focus trapped inside,
 * Escape to close, and body scroll locked while open. Under reduced motion the
 * stagger collapses to an instant appearance — the menu still works identically.
 */

/** Roughly the hero's height. Past this, the header goes solid. */
const HERO_THRESHOLD = 120;

export function Header() {
  const scrolled = useScrollPast(HERO_THRESHOLD);
  const reduced = useReducedMotion();
  const pathname = usePathname();

  /**
   * The menu stores the route it was opened on, and "open" is derived by
   * comparing that to the current route. A navigation therefore closes the
   * overlay during render — no effect, no setState cascade — and it works for
   * browser back/forward too, not just clicks on the links inside.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);

  const overlay = useRef<HTMLDivElement>(null);

  useScrollLock(open);
  useFocusTrap(overlay, open);

  // Escape closes.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenedOn(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      // role="banner" is implicit for a top-level <header>, but the overlay
      // renders inside it, so it is stated to survive any future nesting.
      role="banner"
      data-scrolled={scrolled ? '' : undefined}
      className={[
        'sticky top-0 z-40 w-full',
        'transition-[background-color,border-color,backdrop-filter]',
        'duration-[var(--duration-component)] ease-enter',
        scrolled
          ? 'border-b border-alu/30 bg-ground/95 backdrop-blur-sm'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-page items-center justify-between gap-md px-md py-sm md:px-xl">
        <Link
          href="/"
          className="font-display text-subsection whitespace-nowrap text-ink transition-colors duration-[var(--duration-state)] ease-enter hover:text-action"
        >
          {COPY.site.name}
        </Link>

        {/* Desktop navigation */}
        <nav aria-label={COPY.nav.label} className="hidden items-center gap-lg xl:flex">
          {COPY.nav.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? 'page' : undefined}
              className={[
                'text-label whitespace-nowrap uppercase transition-colors duration-[var(--duration-state)] ease-enter',
                isCurrent(item.href)
                  ? 'text-action'
                  : 'text-ink-muted hover:text-ink focus-visible:text-ink',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-sm xl:flex">
          <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
            {COPY.cta.investorAccess.label}
          </ButtonLink>
          <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
        </div>

        {/* Mobile toggle. 44px minimum target. */}
        <button
          type="button"
          onClick={() => setOpenedOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="flex size-11 items-center justify-center border border-alu/40 text-ink transition-colors duration-[var(--duration-state)] ease-enter hover:border-action hover:text-action xl:hidden"
        >
          <span className="sr-only">{open ? COPY.a11y.closeMenu : COPY.a11y.openMenu}</span>
          <MenuGlyph open={open} />
        </button>
      </div>

      {/* Mobile overlay */}
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
            transition={{
              duration: reduced ? 0 : 0.22,
            }}
            className="fixed inset-0 top-0 z-50 flex h-dvh flex-col overflow-y-auto bg-ground px-md pt-sm pb-2xl xl:hidden"
          >
            <div className="flex items-center justify-between gap-md">
              <span className="font-display text-subsection text-ink">{COPY.site.name}</span>
              <button
                type="button"
                onClick={close}
                className="flex size-11 items-center justify-center border border-alu/40 text-ink transition-colors duration-[var(--duration-state)] ease-enter hover:border-action hover:text-action"
              >
                <span className="sr-only">{COPY.a11y.closeMenu}</span>
                <MenuGlyph open />
              </button>
            </div>

            <nav aria-label={COPY.nav.label} className="mt-2xl flex flex-col">
              {COPY.nav.items.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.22,
                    // 40ms per item, inside the 30–50ms stagger band.
                    delay: reduced ? 0 : 0.04 * index,
                  }}
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
              transition={{
                duration: reduced ? 0 : 0.22,
                delay: reduced ? 0 : 0.04 * COPY.nav.items.length,
              }}
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
    </header>
  );
}

/**
 * Two bars, or a cross when open. Stroke and colour are inherited, so the glyph
 * follows the button's own state rather than carrying its own palette.
 *
 * Explicit coordinates rather than a rotate transform: a horizontal <line> has
 * a zero-height bounding box, so a CSS transform with a centre origin has
 * nothing sane to rotate about and the glyph renders broken. Swapping the
 * endpoints is deterministic, and the icon is small enough that morphing it
 * adds nothing.
 */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      {open ? (
        <>
          <line x1="5" y1="5" x2="15" y2="15" />
          <line x1="15" y1="5" x2="5" y2="15" />
        </>
      ) : (
        <>
          <line x1="2" y1="7" x2="18" y2="7" />
          <line x1="2" y1="13" x2="18" y2="13" />
        </>
      )}
    </svg>
  );
}

export default Header;
