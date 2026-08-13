import type { Metadata } from 'next';

import { MaterialFlow } from '@/components/sections/impact/MaterialFlow';
import { ButtonLink } from '@/components/ui/Button';
import { Counter } from '@/components/ui/Counter';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';
import type { FactId } from '@/content/facts';

export const metadata: Metadata = {
  title: 'Impact',
  description: COPY.impact.hero.subhead,
};

const C = COPY.impact;

function Section({
  id,
  heading,
  intro,
  children,
}: {
  id: string;
  heading: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-lg border-t border-alu/25 pt-2xl">
      <header className="flex flex-col gap-md">
        <h2 id={id} className="font-display text-section text-ink">
          {heading}
        </h2>
        {intro ? <p className="max-w-measure text-lead text-ink-muted">{intro}</p> : null}
      </header>
      {children}
    </section>
  );
}

export default function ImpactPage() {
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-3xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>{C.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">{C.hero.headline}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{C.hero.subhead}</p>
      </header>

      {/* ---------- Counters ---------- */}
      <Section id="recovery" heading={C.counters.heading} intro={C.counters.intro}>
        <div className="grid gap-2xl sm:grid-cols-2 lg:grid-cols-4">
          {C.counters.ids.map((id) => (
            <Counter key={id} id={id as FactId} />
          ))}
        </div>
      </Section>

      {/* ---------- The data visualisation ---------- */}
      <Section id="flow" heading={C.flow.heading} intro={C.flow.intro}>
        <MaterialFlow />
      </Section>

      {/* ---------- Methodology ---------- */}
      <Section id="methodology" heading={C.methodology.heading} intro={C.methodology.intro}>
        <ol className="flex flex-col gap-lg">
          {C.methodology.steps.map((step, index) => (
            <li key={step.heading} className="flex gap-md">
              <span data-readout className="shrink-0 text-data text-ink-muted">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-col gap-sm">
                <h3 className="font-display text-subsection text-ink">{step.heading}</h3>
                <p className="max-w-measure text-body text-ink-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <Panel className="flex max-w-measure flex-col gap-md">
          <Eyebrow>{C.methodology.exclusions.heading}</Eyebrow>
          <ul className="flex flex-col gap-sm">
            {C.methodology.exclusions.items.map((item) => (
              <li key={item} className="flex items-baseline gap-sm text-body text-ink-muted">
                <span aria-hidden="true" className="mt-[0.6em] h-px w-md shrink-0 bg-alu/60" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </Section>

      <div className="flex flex-wrap gap-md border-t border-alu/25 pt-2xl">
        <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
        <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
          {COPY.cta.investorAccess.label}
        </ButtonLink>
      </div>
    </main>
  );
}
