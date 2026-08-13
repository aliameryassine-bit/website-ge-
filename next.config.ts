import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** Self-hosted Plausible if set, otherwise the hosted service. */
const PLAUSIBLE_HOST = process.env.PLAUSIBLE_HOST ?? 'https://plausible.io';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,

  /**
   * Plausible, served from our own origin.
   *
   * The script and the event endpoint are proxied so both are first-party
   * requests. This is the configuration Plausible documents for Next, and it is
   * what stops content blockers removing the measurement — under-reporting a
   * privacy-minded, technical audience is precisely the wrong bias for numbers
   * that end up in front of an investor.
   *
   * The path is /stats rather than /plausible or /analytics: blocker lists
   * match on the obvious names.
   */
  async rewrites() {
    return [
      {
        source: '/stats/script.tagged-events.js',
        destination: `${PLAUSIBLE_HOST}/js/script.tagged-events.js`,
      },
      { source: '/stats/event', destination: `${PLAUSIBLE_HOST}/api/event` },
    ];
  },
};

export default withNextIntl(nextConfig);
