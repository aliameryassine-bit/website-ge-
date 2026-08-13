import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** Self-hosted Plausible if set, otherwise the hosted service. */
const PLAUSIBLE_HOST = process.env.PLAUSIBLE_HOST ?? 'https://plausible.io';

/**
 * Content Security Policy.
 *
 * EVERY ORIGIN IS 'self', and that is a direct consequence of two earlier
 * decisions rather than a coincidence: next/font self-hosts the four typefaces
 * at build time, and Plausible is proxied through /stats. Nothing on this site
 * is fetched from a third party, so the policy needs no allow-list to maintain
 * and there is no vendor whose compromise becomes ours.
 *
 * TWO RELAXATIONS, both real, both stated rather than buried:
 *
 * 1. script-src 'unsafe-inline'. Next inlines the RSC flight payload into every
 *    prerendered page — 57 KB of it on the homepage, different on every route —
 *    so it cannot be hashed. The alternative is a per-request nonce, which
 *    forces every page to render dynamically and would undo the 39 static pages
 *    the performance pass produced. For a marketing site with no user accounts
 *    and no user-generated content rendered anywhere, static delivery is worth
 *    more than the marginal XSS protection. THIS IS THE WEAKEST LINE IN THE
 *    POLICY. If this site ever renders content a stranger supplied, revisit it:
 *    the upgrade is a nonce in middleware, paid for in static rendering.
 *
 * 2. style-src 'unsafe-inline'. Motion writes inline styles while animating,
 *    and the hero's per-element --hero-delay is an inline custom property.
 *    Inline styles are a far smaller risk than inline scripts — they cannot
 *    execute — and removing them would mean giving up the animation layer.
 *
 * Everything else is closed: no plugins, no framing, no base-tag hijack, and
 * forms can only post to this origin.
 */
const CSP = [
  "default-src 'self'",
  // See relaxation 1 above.
  "script-src 'self' 'unsafe-inline'",
  // See relaxation 2 above.
  "style-src 'self' 'unsafe-inline'",
  // Fonts are self-hosted by next/font; no CDN needed.
  "font-src 'self'",
  // data: covers the SVG patterns; no remote images exist on this site.
  "img-src 'self' data:",
  // Analytics posts to /stats/event on this origin, so no third party here.
  "connect-src 'self'",
  // No Flash, no Java, no embeds.
  "object-src 'none'",
  // Stops an injected <base> rewriting every relative URL on the page.
  "base-uri 'self'",
  // The forms post to server actions on this origin and nowhere else.
  "form-action 'self'",
  // Clickjacking. X-Frame-Options below repeats this for older browsers.
  "frame-ancestors 'none'",
  // No nested browsing contexts are used at all.
  "frame-src 'none'",
  // Upgrades any stray http:// subresource rather than failing it.
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  {
    /*
      Two years, subdomains included, and preload-eligible. Only set this once
      the domain is genuinely HTTPS-only including every subdomain — preload is
      effectively irreversible on the timescale that matters.
    */
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Redundant against frame-ancestors, kept for browsers that predate CSP3.
  { key: 'X-Frame-Options', value: 'DENY' },
  /*
    Send the full URL within our own origin, only the origin cross-site. The
    referrer of a confirmation page carries a reference code, and there is no
    reason for another site to receive it.
  */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Stops a text/plain upload being sniffed into a script.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  {
    /*
      Nothing here uses a camera, microphone, geolocation or payment API, so
      every one of them is denied outright rather than left at the default.
    */
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,

  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },

  /**
   * Plausible, served from our own origin.
   *
   * The script and the event endpoint are proxied so both are first-party
   * requests. This is the configuration Plausible documents for Next, and it is
   * what stops content blockers removing the measurement — under-reporting a
   * privacy-minded, technical audience is precisely the wrong bias for numbers
   * that end up in front of an investor.
   *
   * It is also what lets the CSP above say connect-src 'self' with no
   * exceptions: a proxied analytics endpoint is a same-origin request.
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
