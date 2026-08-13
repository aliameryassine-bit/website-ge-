'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { LOCALE_LABELS, LOCALE_SHORT, routing, type Locale } from '@/i18n/routing';

/**
 * Language switcher.
 *
 * Links, not a select. Three options do not need a menu, and a link keeps the
 * switcher working with JavaScript disabled — which matters more here than
 * almost anywhere else on the site, because a reader who cannot read the
 * current language cannot troubleshoot their way out of a broken control.
 *
 * Each locale is named IN ITSELF: العربية, not "Arabic". A switcher that labels
 * a language in a language the reader does not read is written for the wrong
 * person.
 *
 * `usePathname` from the i18n navigation returns the path WITHOUT the locale
 * prefix, so switching keeps the reader on the page they were on rather than
 * dropping them at the homepage — the single most common way a language
 * switcher loses someone mid-journey.
 */
export function LocaleSwitcher({ label }: { label: string }) {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap gap-sm" aria-label={label}>
      {routing.locales.map((locale) => {
        const current = locale === active;
        return (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={current ? 'true' : undefined}
              className={`flex min-h-11 items-center px-md text-label uppercase transition-colors duration-[var(--duration-state)] ease-enter ${
                current
                  ? 'border border-action text-action'
                  : 'border border-alu/30 text-ink-muted hover:border-alu/60 hover:text-ink'
              }`}
            >
              {/* The short form is the control; the full name is for screen readers. */}
              <span aria-hidden="true">{LOCALE_SHORT[locale as Locale]}</span>
              <span className="sr-only">{LOCALE_LABELS[locale as Locale]}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default LocaleSwitcher;
