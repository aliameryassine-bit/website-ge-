import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

/**
 * Time-limited signed access tokens for the data room.
 *
 * Access is granted MANUALLY: a human approves a request and mints a token with
 * scripts/grant-data-room.ts. Nothing in the request flow can produce one, which
 * is the property that matters — an attacker who can submit the public form
 * still cannot obtain access.
 *
 * Token shape: base64url(payload) "." base64url(hmac-sha256(payload)).
 *
 * Design notes, since this is the one place in the codebase where getting it
 * subtly wrong has a real consequence:
 * - The signature covers the ENTIRE payload including the expiry, so an expiry
 *   cannot be extended without invalidating the signature.
 * - Comparison is constant-time. A `===` on a signature leaks timing.
 * - Expiry is checked after the signature verifies, so an expired-token error
 *   never reveals whether the signature was valid.
 * - The secret is read at call time rather than at module load, so a missing
 *   secret fails loudly at the point of use instead of at import.
 * - Every token carries a jti, so a specific grant can be identified in logs
 *   and revoked by list if that is ever needed.
 */

const SEPARATOR = '.';

export type AccessPayload = {
  /** Who the grant was issued to. */
  email: string;
  /** Unix milliseconds. Absolute, not a duration. */
  expiresAt: number;
  /** Token id, for logging and future revocation. */
  jti: string;
};

export type VerifyResult =
  | { valid: true; payload: AccessPayload }
  | { valid: false; reason: 'malformed' | 'bad-signature' | 'expired' };

function secret(): string {
  const value = process.env.DATA_ROOM_SIGNING_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      'DATA_ROOM_SIGNING_SECRET is missing or shorter than 32 characters. ' +
        'Set a long random value; access tokens cannot be signed without it.',
    );
  }
  return value;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payloadEncoded: string): string {
  return createHmac('sha256', secret()).update(payloadEncoded).digest('base64url');
}

/** Mints a token. Called only from the manual grant path. */
export function createAccessToken(
  email: string,
  ttlHours: number,
): { token: string; payload: AccessPayload } {
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) {
    throw new Error(`ttlHours must be a positive number, received ${ttlHours}`);
  }

  const payload: AccessPayload = {
    email,
    expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
    jti: randomUUID(),
  };

  const encoded = base64url(JSON.stringify(payload));
  return { token: `${encoded}${SEPARATOR}${sign(encoded)}`, payload };
}

export function verifyAccessToken(token: string | undefined | null): VerifyResult {
  if (!token) return { valid: false, reason: 'malformed' };

  const parts = token.split(SEPARATOR);
  if (parts.length !== 2) return { valid: false, reason: 'malformed' };

  const [encoded, provided] = parts as [string, string];

  let expected: string;
  try {
    expected = sign(encoded);
  } catch {
    // No secret configured: fail closed rather than fail open.
    return { valid: false, reason: 'bad-signature' };
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // Length must match before timingSafeEqual, which throws on unequal lengths.
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { valid: false, reason: 'bad-signature' };
  }

  let payload: AccessPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as AccessPayload;
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (
    typeof payload.email !== 'string' ||
    typeof payload.expiresAt !== 'number' ||
    typeof payload.jti !== 'string'
  ) {
    return { valid: false, reason: 'malformed' };
  }

  // Checked only after the signature holds.
  if (Date.now() > payload.expiresAt) return { valid: false, reason: 'expired' };

  return { valid: true, payload };
}

/** The URL a granted requester receives. */
export function accessUrl(baseUrl: string, token: string): string {
  const url = new URL('/investors/data-room/access', baseUrl);
  url.searchParams.set('token', token);
  return url.toString();
}
