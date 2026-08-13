'use client';

import { useEffect, useRef } from 'react';

import type { EventName, EventProps } from '@/lib/analytics/events';
import { track } from '@/lib/analytics/track';

/**
 * Fires one event when the page it sits on is reached.
 *
 * Used by the two confirmation pages, which are only ever reached by a redirect
 * after a submission was actually delivered. That makes the confirmation page a
 * more truthful place to count a conversion than the submit button: a click
 * that ended in a delivery failure is not a conversion, and counting it as one
 * would inflate exactly the number an investor is shown.
 *
 * KNOWN GAP: a confirmation URL can be visited directly, which would count.
 * The reference format is checked before the page renders anything, so it takes
 * a deliberately well-formed guess rather than an accident, and the Airtable
 * row remains the authoritative count. Accepted rather than papered over.
 *
 * The ref guard is for StrictMode's double-invoked effects in development, which
 * would otherwise report every conversion twice.
 */
export function TrackOnMount<Name extends EventName>({
  event,
  props,
}: {
  event: Name;
  props: Name extends keyof EventProps ? EventProps[Name] : never;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, props);
  }, [event, props]);

  return null;
}

export default TrackOnMount;
