import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

/**
 * robots.txt.
 *
 * The disallow list is belt and braces: every path here also carries a noindex
 * in its own metadata. They do different jobs and both are needed — robots.txt
 * stops a crawl, noindex stops an index. A page that is only disallowed can
 * still be indexed from an inbound link, and a page that is only noindexed is
 * still crawled and still burns budget.
 *
 * What is excluded and why:
 * - /styleguide is an internal design reference. It renders every token and
 *   every primitive, which would rank for nothing and dilute everything.
 * - the data room request and its gated access route are not public surfaces.
 * - the confirmation pages are post-conversion; landing on one from a search
 *   result tells someone their request was received when it was not.
 * - /admin is the internal dashboard. It is also behind Basic Auth, which a
 *   crawler cannot pass, but listing it keeps the URL out of logs and out of
 *   anyone's site: search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/styleguide',
          '/*/styleguide',
          '/investors/data-room',
          '/*/investors/data-room',
          '/pilot/received',
          '/*/pilot/received',
          '/admin',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
