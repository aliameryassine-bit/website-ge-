import type { Metadata } from 'next';

import { TrackOnMount } from '@/components/analytics/TrackOnMount';
import { Received } from '@/components/sections/Received';
import { EVENTS } from '@/lib/analytics/events';
import { getCopy } from '@/i18n/copy';

export const metadata: Metadata = {
  title: 'Data room request lodged',
  robots: { index: false, follow: false },
};

export default async function DataRoomReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const COPY = await getCopy();
  const { ref } = await searchParams;
  const copy = COPY.received.dataRoom;

  return (
    <>
      <TrackOnMount event={EVENTS.dataRoomAccessRequested} props={{}} />
      <Received
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        reference={ref}
        referenceLabel={copy.referenceLabel}
        referenceNote={copy.referenceNote}
        nextHeading={copy.nextHeading}
        steps={copy.steps}
        responseLabel={copy.responseLabel}
        responseFactId="data-room-review-time"
        footnote={COPY.dataRoomRequest.pending.body}
      >
        {/*
        Stated before anything else on the page. A confirmation screen is
        exactly where someone might assume a request became an approval.
      */}
        <p className="max-w-measure border border-optic-ink/60 p-md text-body text-optic-ink">
          {copy.notGranted}
        </p>
      </Received>
    </>
  );
}
