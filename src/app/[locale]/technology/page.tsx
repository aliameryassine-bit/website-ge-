import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { TechnologySequence } from '@/components/sections/TechnologySequence';
import { ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';

export async function generateMetadata(): Promise<Metadata> {
  const COPY = await getCopy();
  return {
    title: 'Technology',
    description: COPY.technology.intro,
  };
}

export default async function TechnologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  const COPY = await getCopy();
  return (
    <main id="main" className="flex flex-col">
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
