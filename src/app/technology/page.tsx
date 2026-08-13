import type { Metadata } from 'next';

import { TechnologySequence } from '@/components/sections/TechnologySequence';
import { ButtonLink } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';

export const metadata: Metadata = {
  title: 'Technology',
  description: COPY.technology.intro,
};

export default function TechnologyPage() {
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
