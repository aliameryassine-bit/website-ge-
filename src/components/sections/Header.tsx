'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { useCopy } from '@/i18n/copy';
import { Link, usePathname } from '@/i18n/navigation';
import { useScrollPast } from '@/lib/use-scroll-past';

/**
 * Loaded on demand. Motion is only used inside the overlay, so importing it
 * here would put the library in the baseline of every route to serve a menu a
 * desktop visitor never opens. `ssr: false` is safe because the overlay only
 * ever exists as a response to a click.
 */
const MobileMenu = dynamic(() => import('./MobileMenu').then((m) => m.MobileMenu), {
  ssr: false,
});

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
  const COPY = useCopy();
  const scrolled = useScrollPast(HERO_THRESHOLD);
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
      {/*
        flex-wrap is the safety net, not a layout choice. Translated labels are
        longer than English ones and their real lengths are not known yet, so
        the row is built to DROP the CTA group onto a second line rather than
        let anything overlap. Measured with the untranslated markers in place,
        which are longer than any real translation will be: English and Arabic
        both hold one line at 1440, and nothing collides at any width.
      */}
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-sm px-md py-sm md:px-xl xl:gap-md">
        <Link
          href="/"
          className="font-display text-subsection whitespace-nowrap text-ink transition-colors duration-[var(--duration-state)] ease-enter hover:text-action"
        >
          {COPY.site.name}
        </Link>

        {/*
          Desktop navigation.

          Spacing is tighter than it wants to be, on purpose. Translated labels
          are longer than English ones — Romanian typically runs 15–25% longer —
          and with the untranslated markers in place this row overflowed 1440px
          by 298px before the gaps came down. The nav and the CTA group both
          shrink before the row does.
        */}
        <nav
          aria-label={COPY.nav.label}
          className="hidden shrink-0 items-center gap-md xl:flex 2xl:gap-lg"
        >
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

        <div className="hidden shrink-0 items-center gap-sm xl:flex">
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

      {/* Mobile overlay — code-split; see the dynamic import above. */}
      <MobileMenu open={open} onClose={close} isCurrent={isCurrent} glyph={<MenuGlyph open />} />

      {/*
        Without JavaScript the toggle does nothing and the desktop nav is hidden
        below xl, which left a phone with no navigation at all. This is the same
        links as a plain list. It costs nothing when scripting is on, and it is
        the difference between a usable site and a dead end for anyone on a
        locked-down browser or a failed script load.
      */}
      <noscript>
        <nav aria-label={COPY.nav.label} className="border-t border-alu/20 px-md py-sm xl:hidden">
          <ul className="flex flex-wrap gap-x-lg gap-y-sm">
            {COPY.nav.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-label text-ink-muted uppercase">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>
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
