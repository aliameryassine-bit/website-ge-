/**
 * Spam controls with no visible captcha: a honeypot field and a timing check.
 *
 * Neither asks the person anything, which is the point — a captcha on a lead
 * form taxes the exact people we want most, and a retail operations lead on a
 * phone in a car park will abandon rather than solve a puzzle.
 *
 * THE TIMING TOKEN is issued as a cookie by middleware on the first HTML
 * response and verified when a form is submitted. It is signed, because an
 * unsigned timestamp is a suggestion: anything scripted just writes an older
 * value. The signature covers the timestamp, so the elapsed time cannot be
 * edited.
 *
 * WEB CRYPTO, not node:crypto. Middleware runs on the Edge runtime, where
 * node:crypto does not exist — importing it failed the build rather than
 * failing quietly, which is the right way round. The cost is that signing is
 * async; both callers already were.
 *
 * DEGRADATION: with no FORM_SIGNING_SECRET set, tokens are issued unsigned and
 * the window is still enforced, so the check keeps catching naive bots on an
 * unconfigured deployment. It is only tamper-PROOF once the secret is set. It
 * degrades toward working rather than toward blocking every submission, because
 * a dead conversion path is worse than a weakened filter.
 */

/** Faster than this and it was not typed by a person. */
const MIN_SECONDS = 3;

/**
 * Older than this and the token is stale. Generous on purpose: someone can open
 * a pilot form, get pulled into a store walkthrough, and come back to it.
 */
const MAX_SECONDS = 60 * 60 * 4;

const SEPARATOR = '.';

function secret(): string | null {
  const value = process.env.FORM_SIGNING_SECRET;
  return value && value.length >= 32 ? value : null;
}

function base64url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64url(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload)));
}

/**
 * Constant-time string comparison.
 *
 * `===` on a signature leaks how many leading characters matched. There is no
 * timingSafeEqual on the Edge runtime, so this compares every byte regardless
 * of where the first difference is.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

/** Called by middleware when a visitor has no token yet. */
export async function issueFormToken(now: number = Date.now()): Promise<string> {
  const issued = String(now);
  const key = secret();
  return key ? `${issued}${SEPARATOR}${await sign(issued, key)}` : issued;
}

export type TimingResult =
  | { ok: true; elapsedSeconds: number }
  | { ok: false; reason: 'too-fast' | 'stale' | 'invalid'; elapsedSeconds?: number };

export async function checkFormToken(raw: string, now: number = Date.now()): Promise<TimingResult> {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'invalid' };

  const parts = value.split(SEPARATOR);
  const issuedRaw = parts[0] ?? '';
  const provided = parts[1];
  const key = secret();

  if (key) {
    // A secret is configured, so an unsigned or wrongly signed token is a forgery.
    if (!provided) return { ok: false, reason: 'invalid' };
    if (!safeEqual(await sign(issuedRaw, key), provided)) {
      return { ok: false, reason: 'invalid' };
    }
  }

  const issued = Number(issuedRaw);
  if (!Number.isFinite(issued) || issued <= 0) return { ok: false, reason: 'invalid' };

  const elapsedSeconds = (now - issued) / 1000;
  // A token issued in the future is either clock skew or a forgery attempt.
  if (elapsedSeconds < 0) return { ok: false, reason: 'invalid' };
  if (elapsedSeconds < MIN_SECONDS) return { ok: false, reason: 'too-fast', elapsedSeconds };
  if (elapsedSeconds > MAX_SECONDS) return { ok: false, reason: 'stale', elapsedSeconds };

  return { ok: true, elapsedSeconds };
}

/** True when the hidden field was filled, which no person can have done. */
export function honeypotTripped(value: string): boolean {
  return value.trim().length > 0;
}

export const TIMING_LIMITS = { minSeconds: MIN_SECONDS, maxSeconds: MAX_SECONDS } as const;
