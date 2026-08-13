import type { MetadataRoute } from 'next';

import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

/**
 * Sitemap.
 *
 * INDEXABLE ROUTES ONLY, listed explicitly rather than crawled off the file
 * system. A generated sitemap that walks the route tree eventually includes the
 * styleguide, the data room request and the confirmation pages — a sitemap is a
 * request to index, so a page that carries noindex and also appears here sends
 * a search engine two contradictory instructions.
 *
 * Each entry carries its own hreflang alternates, so the three locales are
 * declared as one page in three languages rather than as three pages.
 *
 * `priority` is deliberately not uniform: the two conversion paths and the
 * pages that feed them rank above the legal pages, which exist to be found when
 * looked for rather than to be surfaced.
 */

type Entry = { href: Parameters<typeof getPathname>[0]['href']; priority: number };

const ROUTES: Entry[] = [
  { href: '/', priority: 1 },
  { href: '/for-retailers', priority: 0.9 },
  { href: '/technology', priority: 0.8 },
  { href: '/impact', priority: 0.7 },
  { href: '/investors', priority: 0.7 },
  { href: '/pilot', priority: 0.9 },
  { href: '/company', priority: 0.5 },
  { href: '/legal/privacy', priority: 0.2 },
  { href: '/legal/cookies', priority: 0.2 },
  { href: '/legal/terms', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.flatMap(({ href, priority }) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        `${SITE_URL}${getPathname({ href, locale: locale as Locale })}`,
      ]),
    );

    return routing.locales.map((locale) => ({
      url: `${SITE_URL}${getPathname({ href, locale: locale as Locale })}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority,
      alternates: { languages },
    }));
  });
}
