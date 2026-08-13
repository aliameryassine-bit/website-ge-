/**
 * Admin authentication: HTTP Basic, checked in middleware.
 *
 * WHY BASIC AUTH. This protects an internal dashboard for a team of a few
 * people, not a user account system. Basic Auth needs no session store, no
 * cookie, no login page and no JavaScript, and the browser handles the prompt —
 * which means there is no half-built auth flow to get subtly wrong. A hand-
 * rolled password page with a signed cookie is more code and more surface for
 * exactly the same result.
 *
 * ITS LIMITS, stated rather than assumed: credentials go on every request, so
 * this is only acceptable over HTTPS; there is no logout beyond closing the
 * browser; and there is one shared password rather than per-person accounts, so
 * it cannot tell you who looked. That is proportionate for an internal
 * dashboard and would not be for anything holding investor materials — which is
 * why the data room uses signed, time-limited, individually issued tokens
 * instead.
 *
 * FAILS CLOSED. With no ADMIN_PASSWORD set the route is not open, it is
 * unavailable. An admin surface that falls back to public when misconfigured is
 * the failure mode worth designing against.
 */

const REALM = 'Green Exchange admin';

/** Constant-time comparison. `===` on a secret leaks its length and prefix. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

export type AdminAuthResult =
  { ok: true } | { ok: false; reason: 'unconfigured' | 'missing' | 'invalid' };

export function checkAdminAuth(header: string | null): AdminAuthResult {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) return { ok: false, reason: 'unconfigured' };

  if (!header?.startsWith('Basic ')) return { ok: false, reason: 'missing' };

  let decoded: string;
  try {
    decoded = atob(header.slice('Basic '.length));
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  // The username is ignored; the password is the secret.
  const password = decoded.slice(decoded.indexOf(':') + 1);
  return safeEqual(password, expected) ? { ok: true } : { ok: false, reason: 'invalid' };
}

export function unauthorizedResponse(reason: 'unconfigured' | 'missing' | 'invalid'): Response {
  if (reason === 'unconfigured') {
    return new Response(
      'Admin dashboard is not configured. Set ADMIN_PASSWORD (12+ characters) to enable it.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
