import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';
import { TIMING_FIELD } from '@/lib/forms/fields';
import { issueFormToken, TIMING_LIMITS } from '@/lib/forms/spam';

const handleI18n = createMiddleware(routing);

/**
 * Locale routing, plus the anti-spam timing token.
 *
 * THE TOKEN MOVED HERE FROM THE PAGE RENDER, and it is a performance change
 * with a measurement behind it. Minting a signed timestamp inside the form's
 * server render forced /pilot, /for-retailers and /investors/data-room to be
 * `force-dynamic`: a prerendered page would have shipped a build-time timestamp
 * and rejected every real submission as stale. That cost /for-retailers a 1.97s
 * FCP and a 2.63s LCP against a 2.5s target, because nothing could be served
 * from a cache.
 *
 * Issued as a cookie instead, the token travels with the form POST on its own —
 * including without JavaScript, since a browser attaches cookies to a plain
 * form submission — and the three routes go back to being static.
 *
 * SET ONLY IF ABSENT. Refreshing it on every request would be wrong twice over:
 * Next prefetches RSC payloads through this same middleware, so a prefetch
 * would reset the clock to zero and make a genuine submission look
 * instantaneous; and the check exists to measure how long a person has had the
 * form open, which is measured from their first sight of it.
 */
export default async function middleware(request: NextRequest) {
  const response = handleI18n(request);

  if (!request.cookies.has(TIMING_FIELD)) {
    response.cookies.set(TIMING_FIELD, await issueFormToken(), {
      // The action reads this server-side; script has no reason to touch it.
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: TIMING_LIMITS.maxSeconds,
    });
  }

  return response;
}

export const config = {
  /*
    Everything except Next internals, the API surface, and anything with a file
    extension. Without the extension exclusion the middleware would try to
    locale-prefix /favicon.ico and the font files, which both 404s them and
    wastes a middleware invocation on every asset request.
  */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
