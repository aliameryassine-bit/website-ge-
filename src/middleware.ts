import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  /*
    Everything except Next internals, the API surface, and anything with a file
    extension. Without the extension exclusion the middleware would try to
    locale-prefix /favicon.ico and the font files, which both 404s them and
    wastes a middleware invocation on every asset request.
  */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
