'use client';

import type { EventName, EventProps } from './events';

/**
 * Sending an event.
 *
 * PLAUSIBLE, chosen over Vercel Analytics. Both are cookieless; the deciding
 * factors were that Vercel Analytics only works on Vercel — a hard hosting
 * coupling for a site that may not stay there — and that Plausible can be
 * self-hosted, which matters for a company whose own pitch is about owning its
 * data. Plausible also has a shareable read-only dashboard, which is how you
 * show an investor traffic without handing over an account.
 *
 * NO COOKIE BANNER IS REQUIRED, and the reasoning is in docs/analytics.md
 * rather than assumed here. In short: Plausible stores nothing on the device
 * and holds no personal data, so neither ePrivacy consent nor a GDPR basis is
 * engaged. That claim is about THIS configuration and stops being true the
 * moment a marketing pixel is added.
 *
 * FAILS SILENTLY AND COMPLETELY. If the script is blocked, not configured, or
 * still loading, the call is a no-op. Analytics is never allowed to throw into
 * a click handler on a conversion path — losing a lead to measure a lead is the
 * worst trade on this site.
 */

type PlausibleFn = (event: string, options?: { props?: Record<string, string> }) => void;

declare global {
  interface Window {
    plausible?: PlausibleFn & { q?: unknown[] };
  }
}

export function track<Name extends EventName>(
  name: Name,
  props: Name extends keyof EventProps ? EventProps[Name] : never,
): void {
  if (typeof window === 'undefined') return;
  try {
    /*
      The snippet defines window.plausible as a queue stub before the script
      loads, so calls made during that window are not lost. If analytics is
      unconfigured the stub does not exist and this is simply skipped.
    */
    window.plausible?.(name, { props: props as Record<string, string> });
  } catch {
    // Never surface an analytics failure to the person using the site.
  }
}

/**
 * Fires at most once per mount.
 *
 * Several of these events are "the first time X happened" — a form was started,
 * a sequence was completed. Counting them more than once per session turns a
 * rate into noise.
 */
export function once(): (run: () => void) => void {
  let done = false;
  return (run) => {
    if (done) return;
    done = true;
    run();
  };
}
