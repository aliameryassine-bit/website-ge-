import type { Metadata } from 'next';

import { DataRoomRequestForm } from '@/components/sections/investors/DataRoomRequestForm';
import { Eyebrow } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';

export const metadata: Metadata = {
  title: 'Request data room access',
  description: COPY.dataRoomRequest.intro,
  // A request form has no business being indexed.
  robots: { index: false, follow: false },
};

export default function DataRoomRequestPage() {
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.investorsPublic.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-section text-ink">{COPY.dataRoomRequest.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.dataRoomRequest.intro}</p>
      </header>

      <DataRoomRequestForm />
    </main>
  );
}
