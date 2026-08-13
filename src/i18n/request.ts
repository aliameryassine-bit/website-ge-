import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

/**
 * Per-request i18n configuration.
 *
 * Messages are loaded per locale, so an English visitor never downloads the
 * Arabic or Romanian bundles.
 *
 * ON MISSING KEYS: `ar.json` and `ro.json` are deliberately incomplete — they
 * carry marked untranslated placeholders, not translations. Rather than falling
 * back to English silently, which would hide how much is outstanding, an
 * untranslated string renders as its marked placeholder so a reviewer can see
 * exactly what is missing on the page itself.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    /**
     * Surfaces a missing key loudly in development instead of printing the key
     * path into the page, which is how untranslated strings reach production
     * looking like copy.
     */
    onError(error) {
      if (process.env.NODE_ENV !== 'production') console.warn(`[i18n] ${error.message}`);
    },
    getMessageFallback({ namespace, key }) {
      return `[MISSING: ${[namespace, key].filter(Boolean).join('.')}]`;
    },
  };
});
