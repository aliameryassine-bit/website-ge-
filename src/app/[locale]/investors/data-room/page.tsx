import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

import { setRequestLocale } from 'next-intl/server';

import { DataRoomRequestForm } from '@/components/sections/investors/DataRoomRequestForm';
import { Eyebrow } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const COPY = await getCopy();
  return pageMetadata({
    title: COPY.seo.dataRoom.title,
    description: COPY.seo.dataRoom.description,
    href: '/investors/data-room',
    locale: locale as Locale,
    noindex: true,
  });
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
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl"
    >
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.investorsPublic.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-section text-ink">{COPY.dataRoomRequest.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.dataRoomRequest.intro}</p>
      </header>

      <DataRoomRequestForm />
    </main>
  );
}
