import { createHash } from 'node:crypto';

/**
 * Rate limiting for the two lead forms.
 *
 * Sliding window, in memory. Two ceilings, because they stop different things:
 * a PER-CLIENT limit stops one source hammering the form, and a GLOBAL limit
 * stops a distributed flood from filling the store and the inbox faster than
 * anyone can read them.
 *
 * HONEST LIMITATION, and it matters before this goes to production: in-memory
 * counters are per process. On a serverless host each instance keeps its own,
 * so the effective limit is the configured one multiplied by the instance
 * count, and every deploy resets it. That is acceptable for a form that
 * receives a handful of submissions a day and is not acceptable as a defence
 * against a determined flood. `check()` is the only thing the actions call, so
 * swapping the body for Upstash/Redis is a single-file change when it matters.
 *
 * The client key is a SALTED HASH of the address, never the address itself. A
 * rate limiter needs to know "same client again", not who the client is, and an
 * in-memory map of IP addresses is personal data sitting in a process for no
 * reason.
 */

type Window = { hits: number[] };

const PER_CLIENT = { limit: 5, windowSeconds: 15 * 60 } as const;
const GLOBAL = { limit: 60, windowSeconds: 60 * 60 } as const;

const clients = new Map<string, Window>();
const globalWindow: Window = { hits: [] };

/**
 * Bounds the map so a spray of unique addresses cannot grow it without limit.
 * Well above any plausible real concurrency for this site.
 */
const MAX_TRACKED_CLIENTS = 10_000;

function prune(window: Window, now: number, windowSeconds: number): void {
  const cutoff = now - windowSeconds * 1000;
  // Hits are appended in order, so dropping from the front is enough.
  let index = 0;
  while (index < window.hits.length && (window.hits[index] ?? 0) < cutoff) index += 1;
  if (index > 0) window.hits.splice(0, index);
}

/**
 * Derives the client key from proxy headers.
 *
 * `x-forwarded-for` is a client-controlled header; the LEFTMOST entry is the
 * one a client can set freely, so the value used is the last hop, which is
 * whatever the platform's proxy appended. Falls back to a shared constant when
 * no address is available, which makes the per-client limit collapse into the
 * global one rather than silently disappearing.
 */
export function clientKey(headers: { get(name: string): string | null }): {
  key: string;
  identified: boolean;
} {
  const forwarded = headers.get('x-forwarded-for');
  const candidates = forwarded ? forwarded.split(',').map((part) => part.trim()) : [];
  const address =
    candidates.length > 0
      ? candidates[candidates.length - 1]
      : (headers.get('x-real-ip') ?? headers.get('cf-connecting-ip'));

  if (!address) return { key: 'unidentified', identified: false };

  const salt = process.env.FORM_SIGNING_SECRET ?? 'green-exchange-rate-limit';
  return {
    key: createHash('sha256').update(`${salt}:${address}`).digest('base64url'),
    identified: true,
  };
}

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfter: number; scope: 'client' | 'global' };

function retryAfter(window: Window, now: number, windowSeconds: number): number {
  const oldest = window.hits[0];
  if (oldest === undefined) return windowSeconds;
  return Math.max(1, Math.ceil((oldest + windowSeconds * 1000 - now) / 1000));
}

/**
 * Records an attempt and reports whether it may proceed.
 *
 * Counts the attempt only when it is allowed, so a client that is already
 * blocked does not extend its own block by retrying.
 */
export function check(key: string, now: number = Date.now()): RateLimitResult {
  prune(globalWindow, now, GLOBAL.windowSeconds);
  if (globalWindow.hits.length >= GLOBAL.limit) {
    return {
      ok: false,
      retryAfter: retryAfter(globalWindow, now, GLOBAL.windowSeconds),
      scope: 'global',
    };
  }

  let window = clients.get(key);
  if (!window) {
    if (clients.size >= MAX_TRACKED_CLIENTS) clients.clear();
    window = { hits: [] };
    clients.set(key, window);
  }

  prune(window, now, PER_CLIENT.windowSeconds);
  if (window.hits.length >= PER_CLIENT.limit) {
    return {
      ok: false,
      retryAfter: retryAfter(window, now, PER_CLIENT.windowSeconds),
      scope: 'client',
    };
  }

  window.hits.push(now);
  globalWindow.hits.push(now);
  return { ok: true };
}

/** Test seam. Not called by application code. */
export function reset(): void {
  clients.clear();
  globalWindow.hits.length = 0;
}

export const LIMITS = { perClient: PER_CLIENT, global: GLOBAL } as const;
