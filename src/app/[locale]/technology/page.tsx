import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

import { setRequestLocale } from 'next-intl/server';

import { TechnologySequence } from '@/components/sections/TechnologySequence';
import { ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const COPY = await getCopy();
  return pageMetadata({
    title: COPY.seo.technology.title,
    description: COPY.seo.technology.description,
    href: '/technology',
    locale: locale as Locale,
  });
}

export default async function TechnologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  const COPY = await getCopy();
  return (
    <main id="main" tabIndex={-1} className="flex flex-col">
      <TechnologySequence />

      <div className="mx-auto w-full max-w-page px-md pb-3xl md:px-xl">
        <Panel className="flex max-w-measure flex-col gap-md">
          <p className="text-body text-ink">{COPY.home.closing.body}</p>
          <div className="flex flex-wrap gap-md">
            <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
            <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
              {COPY.cta.investorAccess.label}
            </ButtonLink>
          </div>
        </Panel>
      </div>
    </main>
  );
}
