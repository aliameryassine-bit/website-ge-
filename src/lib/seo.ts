import type { Metadata } from 'next';

import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

/**
 * Metadata construction, in one place.
 *
 * Canonical and hreflang are the two things easiest to get subtly wrong across
 * three locales, and wrong hreflang is worse than none: it tells a search engine
 * that pages ARE alternates of each other, so a mistake merges or splits the
 * wrong pages. Building them from the routing config means the set is always
 * complete and always agrees with the middleware.
 *
 * WHAT EACH PAGE GETS:
 * - a canonical pointing at the absolute URL of THIS locale's version;
 * - an alternates.languages map covering all three locales plus x-default,
 *   which points at the unprefixed English URL — the one a search engine should
 *   serve when it cannot infer a language;
 * - Open Graph and Twitter cards, with the route's own generated image.
 */

/**
 * The public origin. Absolute URLs are not optional for canonical, hreflang or
 * OG images — a relative canonical is ignored by most crawlers and a relative
 * OG image never renders in a share card.
 *
 * Set NEXT_PUBLIC_SITE_URL at build time. The fallback keeps development and
 * preview builds working; it is not a guess at the production domain, and
 * shipping with it means every canonical points at localhost.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

/** True once a real origin is configured. Checked by scripts/check-seo.ts. */
export const SITE_URL_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

type Href = Parameters<typeof getPathname>[0]['href'];

function absolute(href: Href, locale: Locale): string {
  return `${SITE_URL}${getPathname({ href, locale })}`;
}

export function localeAlternates(href: Href): NonNullable<Metadata['alternates']>['languages'] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = absolute(href, locale as Locale);
  }
  // What to serve when no locale matches: the unprefixed default.
  languages['x-default'] = absolute(href, routing.defaultLocale as Locale);
  return languages;
}

/**
 * Builds a page's metadata.
 *
 * `noindex` is a parameter rather than something remembered per page, because
 * the routes that must carry it — the styleguide, the gated data room, the
 * confirmation pages — are exactly the ones nobody thinks about.
 */
export function pageMetadata({
  title,
  description,
  href,
  locale,
  noindex = false,
}: {
  title: string;
  description: string;
  href: Href;
  locale: Locale;
  noindex?: boolean;
}): Metadata {
  const url = absolute(href, locale);

  /*
    No `images` here on purpose. Each route has an opengraph-image.tsx and Next
    wires it in by file convention; setting images manually would override the
    generated card with a hand-built URL that has to be kept in step with the
    route tree.
  */
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: localeAlternates(href),
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Green Exchange',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    ...(noindex
      ? {
          robots: {
            index: false,
            follow: false,
            // Also keeps the page out of the archive and out of snippets.
            nocache: true,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
  };
}
