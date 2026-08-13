import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin/auth';
import { TIMING_FIELD } from '@/lib/forms/fields';
import { issueFormToken, TIMING_LIMITS } from '@/lib/forms/spam';

const handleI18n = createMiddleware(routing);

/**
 * Three jobs, in this order: gate the admin dashboard, route locales, issue the
 * anti-spam timing token.
 *
 * ADMIN IS CHECKED FIRST and returns early, before the locale middleware sees
 * the request. Two reasons: /admin is a single-language internal tool and must
 * not be redirected to /en/admin, and an auth gate that runs after other
 * middleware has already rewritten the request is a gate with a gap in it.
 *
 * THE TIMING TOKEN moved here from the form's server render. Minting a signed
 * timestamp inside the page forced /pilot, /for-retailers and
 * /investors/data-room to be `force-dynamic`: a prerendered page would have
 * shipped a build-time timestamp and rejected every real submission as stale.
 * That cost /for-retailers a 1.97s FCP against a 2.5s LCP target, because
 * nothing could be served from a cache.
 *
 * Issued as a cookie, the token travels with the form POST on its own —
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
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = checkAdminAuth(request.headers.get('authorization'));
    if (!auth.ok) return unauthorizedResponse(auth.reason);
    return NextResponse.next();
  }

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
    Everything except Next internals, the API surface, the analytics proxy, and
    anything with a file extension.

    `stats` is excluded explicitly and the reason is not obvious: the extension
    rule already skips /stats/script.tagged-events.js, but /stats/event has no
    dot, so without this it would be treated as a page and locale-prefixed —
    every analytics event would redirect to /en/stats/event and be lost.

    Without the extension exclusion the middleware would also try to
    locale-prefix /favicon.ico and the font files, which both 404s them and
    wastes a middleware invocation on every asset request.
  */
  matcher: ['/((?!api|_next|_vercel|stats|.*\\..*).*)'],
};
