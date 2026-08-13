import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

import { setRequestLocale } from 'next-intl/server';

import { PilotForm } from '@/components/sections/retailers/PilotForm';
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
    title: COPY.seo.pilot.title,
    description: COPY.seo.pilot.description,
    href: '/pilot',
    locale: locale as Locale,
  });
}

export default async function PilotPage({ params }: { params: Promise<{ locale: string }> }) {
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
        <Eyebrow>For retailers</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">{COPY.forRetailers.pilot.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.forRetailers.pilot.intro}</p>
      </header>

      <PilotForm heading={false} />
    </main>
  );
}
