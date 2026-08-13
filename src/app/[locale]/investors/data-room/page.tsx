import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { DataRoomRequestForm } from '@/components/sections/investors/DataRoomRequestForm';
import { Eyebrow } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';
import { issueFormToken } from '@/lib/forms/spam';

/** Dynamic so the signed timing token is minted per request, not at build. */
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const COPY = await getCopy();
  return {
    title: 'Request data room access',
    description: COPY.dataRoomRequest.intro,
    // A request form has no business being indexed.
    robots: { index: false, follow: false },
  };
}

export default async function DataRoomRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const COPY = await getCopy();
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.investorsPublic.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-section text-ink">{COPY.dataRoomRequest.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.dataRoomRequest.intro}</p>
      </header>

      <DataRoomRequestForm token={issueFormToken()} />
    </main>
  );
}
