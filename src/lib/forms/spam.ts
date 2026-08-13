import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Spam controls with no visible captcha: a honeypot field and a timing check.
 *
 * Neither asks the person anything, which is the point — a captcha on a lead
 * form taxes the exact people we want most, and a retail operations lead on a
 * phone in a car park will abandon rather than solve a puzzle.
 *
 * THE TIMING TOKEN is issued when the form renders and verified on submit. It
 * is signed, because an unsigned timestamp in a hidden field is a suggestion:
 * anything scripted just writes an older value. The signature covers the
 * timestamp, so the elapsed time cannot be edited.
 *
 * Because the token is issued at render time, a page that is statically
 * prerendered would bake in a build-time timestamp and reject every real
 * submission. The routes that carry these forms are therefore dynamic. That is
 * the cost of a tamper-proof timing check and it is a deliberate trade.
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

function sign(payload: string, key: string): string {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

/** Called at render time, in a server component. */
export function issueFormToken(now: number = Date.now()): string {
  const issued = String(now);
  const key = secret();
  return key ? `${issued}${SEPARATOR}${sign(issued, key)}` : issued;
}

export type TimingResult =
  | { ok: true; elapsedSeconds: number }
  | { ok: false; reason: 'too-fast' | 'stale' | 'invalid'; elapsedSeconds?: number };

export function checkFormToken(raw: string, now: number = Date.now()): TimingResult {
  const value = raw.trim();
  if (!value) return { ok: false, reason: 'invalid' };

  const parts = value.split(SEPARATOR);
  const issuedRaw = parts[0] ?? '';
  const provided = parts[1];
  const key = secret();

  if (key) {
    // A secret is configured, so an unsigned or wrongly signed token is a forgery.
    if (!provided) return { ok: false, reason: 'invalid' };
    const expected = Buffer.from(sign(issuedRaw, key));
    const actual = Buffer.from(provided);
    // Length must match first: timingSafeEqual throws on unequal lengths.
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return { ok: false, reason: 'invalid' };
    }
  }

  const issued = Number(issuedRaw);
  if (!Number.isFinite(issued) || issued <= 0) return { ok: false, reason: 'invalid' };

  const elapsedSeconds = (now - issued) / 1000;
  // A token issued in the future is either a clock skew or a forgery attempt.
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
