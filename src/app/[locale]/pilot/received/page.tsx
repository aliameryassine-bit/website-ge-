import type { Metadata } from 'next';

import { Received } from '@/components/sections/Received';
import { getCopy } from '@/i18n/copy';

export const metadata: Metadata = {
  title: 'Pilot request received',
  // A confirmation page has no business in an index.
  robots: { index: false, follow: false },
};

export default async function PilotReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const COPY = await getCopy();
  const { ref } = await searchParams;
  const copy = COPY.received.pilot;

  return (
    <Received
      eyebrow={copy.eyebrow}
      heading={copy.heading}
      reference={ref}
      referenceLabel={copy.referenceLabel}
      referenceNote={copy.referenceNote}
      nextHeading={copy.nextHeading}
      steps={copy.steps}
      responseLabel={copy.responseLabel}
      responseFactId="pilot-response-time"
      footnote={copy.changedYourMind}
    />
  );
}
