import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing.
 *
 * English is the default and is served WITHOUT a prefix, so the commercial
 * surface a retail buyer is most likely to be sent — a bare greenexchange link
 * — keeps working exactly as it did. Arabic and Romanian are prefixed:
 * /ar/for-retailers, /ro/for-retailers.
 *
 * WHY THESE THREE, in this order:
 * - en is the working language of Egyptian retail head offices and of every
 *   investor conversation. It stays the default.
 * - ar is the language of the country we sell into, and of the depositor
 *   standing at the machine. It is the one that earns commercial trust.
 * - ro is the language of the entity: a Romanian company, Romanian
 *   registration details, Romanian suppliers and staff.
 *
 * `localeDetection` is off deliberately. Redirecting an Egyptian operations
 * lead to /ar because their browser says ar-EG, when they run their working
 * day in English, is a worse first impression than showing English and letting
 * them choose. The switcher is in the footer on every page.
 */
export const routing = defineRouting({
  locales: ['en', 'ar', 'ro'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

/** Writing direction per locale. Drives `dir` on <html> and the RTL styles. */
export const DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
  ro: 'ltr',
};

/**
 * What each locale calls itself. Never the English name of the language — a
 * switcher that says "Arabic" to an Arabic reader is written for the wrong
 * person.
 */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ro: 'Română',
};

/** Short form for the compact footer switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  ar: 'ع',
  ro: 'RO',
};
