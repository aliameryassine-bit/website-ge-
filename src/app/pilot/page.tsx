import type { Metadata } from 'next';

import { PilotForm } from '@/components/sections/retailers/PilotForm';
import { Eyebrow } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';
import { issueFormToken } from '@/lib/forms/spam';

/**
 * /pilot — the destination of the header's primary CTA.
 *
 * This route was a stub while the form lived only on /for-retailers, which
 * meant the site's most prominent call to action led to a placeholder. Same
 * form component, same action, two entry points: a buyer who arrives via the
 * header gets the form directly, and one reading the retailer page gets it in
 * context without leaving.
 *
 * DYNAMIC, deliberately. The anti-spam timing token is signed at render time,
 * so a prerendered page would ship a build-time timestamp and reject every real
 * submission as stale. That is the cost of a timing check that cannot be forged.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Request a pilot',
  description: COPY.forRetailers.pilot.intro,
};

export default function PilotPage() {
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>For retailers</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">{COPY.forRetailers.pilot.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.forRetailers.pilot.intro}</p>
      </header>

      <PilotForm token={issueFormToken()} heading={false} />
    </main>
  );
}
