import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

import { setRequestLocale } from 'next-intl/server';

/*
  Imported statically, and that was measured rather than assumed. Splitting these
  two out with next/dynamic — both are below the fold — made this route WORSE:
  median LCP went 2.62s to 3.20s. On a high-latency link an extra chunk is an
  extra round trip that cannot start until the main bundle has parsed, and that
  costs more than the parallelism gains. Code splitting is not free; it moved
  work off the main chunk and onto the critical path.
*/
import { PilotForm } from '@/components/sections/retailers/PilotForm';
import { RoiCalculator } from '@/components/sections/retailers/RoiCalculator';
import { FactValue, FactRow } from '@/components/ui/FactValue';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';
import { toFactId } from '@/content/facts';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const COPY = await getCopy();
  return pageMetadata({
    title: COPY.seo.forRetailers.title,
    description: COPY.seo.forRetailers.description,
    href: '/for-retailers',
    locale: locale as Locale,
  });
}

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

export default async function ForRetailersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const COPY = await getCopy();
  const COPY_R = COPY.forRetailers;
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-3xl px-md py-2xl md:px-xl"
    >
      {/* ---------- 1 · Their problem, not our product ---------- */}
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY_R.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">{COPY_R.hero.headline}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY_R.hero.subhead}</p>
      </header>

      {/* ---------- 2 · Deployment model ---------- */}
      <Section id="deployment" heading={COPY_R.deployment.heading} intro={COPY_R.deployment.intro}>
        <div className="grid gap-md md:grid-cols-3">
          {COPY_R.deployment.columns.map((column) => (
            <Panel key={column.heading} className="flex flex-col gap-md">
              <h3 className="text-label text-ink uppercase">{column.heading}</h3>
              <ul className="flex flex-col gap-sm">
                {column.items.map((item) => (
                  <li key={item} className="flex items-baseline gap-sm text-body text-ink-muted">
                    <span aria-hidden="true" className="mt-[0.6em] h-px w-md shrink-0 bg-alu/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>

        <div className="flex flex-col gap-md">
          <h3 className="font-display text-subsection text-ink">
            {COPY_R.deployment.placementHeading}
          </h3>
          <p className="max-w-measure text-body text-ink-muted">
            {COPY_R.deployment.placementIntro}
          </p>

          {/*
            Wide table, so it scrolls inside its own container rather than
            making the page scroll sideways.
          */}
          {/*
            tabIndex makes the scroll container reachable, so a keyboard user
            can pan a table wider than the viewport; without it the right-hand
            columns are unreachable without a mouse. role+label stop it being
            announced as an unnamed group.
          */}
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label={COPY_R.deployment.placementHeading}
          >
            <table className="w-full min-w-[48rem] border-collapse text-start">
              <caption className="sr-only">{COPY_R.deployment.placementHeading}</caption>
              <thead>
                <tr>
                  {COPY_R.deployment.placementColumns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-alu/40 py-sm pe-lg align-bottom text-start text-label text-ink-muted uppercase"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COPY_R.deployment.placements.map((row) => (
                  <tr key={row.name}>
                    <th
                      scope="row"
                      className="border-b border-alu/20 py-md pe-lg align-top text-body text-ink"
                    >
                      {row.name}
                    </th>
                    {[row.space, row.weather, row.footfall, row.servicing, row.power].map(
                      (cell, index) => (
                        <td
                          key={index}
                          className="border-b border-alu/20 py-md pe-lg align-top text-body text-ink-muted"
                        >
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ---------- 3 · Footprint spec ---------- */}
      <Section id="footprint" heading={COPY_R.footprint.heading} intro={COPY_R.footprint.intro}>
        <dl className="flex max-w-measure flex-col gap-md">
          {COPY_R.footprint.specs.map((id) => (
            <FactRow key={id} id={toFactId(id)} />
          ))}
        </dl>
        <p className="max-w-measure border-l-2 border-action pl-md text-body text-ink">
          {COPY_R.footprint.note}
        </p>
      </Section>

      {/* ---------- 4 · Servicing ---------- */}
      <Section id="servicing" heading={COPY_R.servicing.heading} intro={COPY_R.servicing.intro}>
        <div className="flex flex-col gap-lg">
          {COPY_R.servicing.items.map((item) => (
            <Panel key={item.question} className="flex flex-col gap-md">
              <h3 className="font-display text-subsection text-ink">{item.question}</h3>
              <p className="max-w-measure text-body text-ink-muted">{item.answer}</p>
              <div className="flex flex-wrap items-center gap-md border-t border-alu/20 pt-md">
                <FactValue id={toFactId(item.factId)} />
                <span className="text-label text-ink-muted uppercase">
                  {COPY_R.servicing.heading}
                </span>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ---------- 5 · What the retailer gets ---------- */}
      <Section id="benefits" heading={COPY_R.benefits.heading} intro={COPY_R.benefits.intro}>
        <div className="grid gap-md md:grid-cols-2">
          {COPY_R.benefits.items.map((item) => (
            <Panel key={item.heading} className="flex flex-col gap-md">
              <h3 className="font-display text-subsection text-ink">{item.heading}</h3>
              <p className="text-body text-ink-muted">{item.body}</p>
              <dl className="flex flex-col gap-md border-t border-alu/20 pt-md">
                {item.factIds.map((id) => (
                  <FactRow key={id} id={toFactId(id)} />
                ))}
              </dl>
            </Panel>
          ))}
        </div>
      </Section>

      {/* ---------- 6 · ROI calculator ---------- */}
      <div className="border-t border-alu/25 pt-2xl">
        <RoiCalculator />
      </div>

      {/* ---------- 7 · Pilot CTA ---------- */}
      <div className="border-t border-alu/25 pt-2xl">
        <PilotForm />
      </div>
    </main>
  );
}
