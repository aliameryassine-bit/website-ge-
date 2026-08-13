import type { Metadata } from 'next';

import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

import { setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { FactRow } from '@/components/ui/FactValue';
import { SourcedFigure, anyPubliclyCitable } from '@/components/ui/SourcedFigure';
import { getCopy } from '@/i18n/copy';
import { toFactIds } from '@/content/facts';
import { TEAM } from '@/content/team';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const COPY = await getCopy();
  return pageMetadata({
    title: COPY.seo.investors.title,
    description: COPY.seo.investors.description,
    href: '/investors',
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

export default async function InvestorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  const COPY = await getCopy();
  const C = COPY.investorsPublic;
  const marketFigures = toFactIds(C.market.figures);
  const tractionFigures = toFactIds(C.traction.figures);
  const marketPublishable = anyPubliclyCitable(marketFigures);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-3xl px-md py-2xl md:px-xl"
    >
      {/* ---------- 1 · Thesis, three sentences ---------- */}
      <header className="flex flex-col gap-lg">
        <Eyebrow>{C.hero.eyebrow}</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">{C.hero.headline}</h1>
        <div className="flex max-w-measure flex-col gap-md">
          {C.hero.thesis.map((sentence) => (
            <p key={sentence} className="text-lead text-ink-muted">
              {sentence}
            </p>
          ))}
        </div>
      </header>

      {/* ---------- 2 · Market context, sourced only ---------- */}
      <Section id="market" heading={C.market.heading} intro={C.market.intro}>
        {marketPublishable ? (
          <div className="grid max-w-measure gap-md sm:grid-cols-2">
            {marketFigures.map((id) => (
              <SourcedFigure key={id} id={id} />
            ))}
          </div>
        ) : (
          /*
            No citable figure exists, so none is shown — not a dash, not a
            pending chip. Stating that the figures are withheld is honest;
            showing them with a hedge would put the claim in front of an
            investor anyway.
          */
          <Panel className="flex max-w-measure flex-col gap-md border-optic-ink/40">
            <Eyebrow>{C.market.pendingHeading}</Eyebrow>
            <p className="text-body text-ink">{C.market.pendingBody}</p>
          </Panel>
        )}

        <p className="max-w-measure border-l-2 border-alu/40 pl-md text-body text-ink-muted">
          {C.market.regulatoryNote}
        </p>
      </Section>

      {/* ---------- 3 · The model, qualitative ---------- */}
      <Section id="model" heading={C.model.heading} intro={C.model.intro}>
        <div className="grid gap-md md:grid-cols-2">
          {C.model.lines.map((line) => (
            <Panel key={line.heading} className="flex flex-col gap-md">
              <h3 className="font-display text-subsection text-ink">{line.heading}</h3>
              <p className="text-body text-ink-muted">{line.body}</p>
            </Panel>
          ))}
        </div>
        <p className="max-w-measure border-l-2 border-action pl-md text-body text-ink">
          {C.model.note}
        </p>
      </Section>

      {/* ---------- 4 · Traction, counted separately ---------- */}
      <Section id="traction" heading={C.traction.heading} intro={C.traction.intro}>
        <dl className="flex max-w-measure flex-col gap-md">
          {tractionFigures.map((id) => (
            <FactRow key={id} id={id} />
          ))}
        </dl>
        <p className="max-w-measure border-l-2 border-alu/40 pl-md text-body text-ink-muted">
          {C.traction.note}
        </p>
      </Section>

      {/* ---------- 5 · Team, real names only ---------- */}
      <Section id="team" heading={C.team.heading} intro={C.team.intro}>
        {TEAM.length > 0 ? (
          <ul className="grid gap-md md:grid-cols-2">
            {TEAM.map((member) => (
              <li key={member.name}>
                <Panel className="flex flex-col gap-sm">
                  <span className="font-display text-subsection text-ink">{member.name}</span>
                  <span className="text-label text-ink-muted uppercase">{member.role}</span>
                  {member.note ? (
                    <span className="text-body text-ink-muted">{member.note}</span>
                  ) : null}
                </Panel>
              </li>
            ))}
          </ul>
        ) : (
          <Panel className="flex max-w-measure flex-col gap-md border-optic-ink/40">
            <Eyebrow>{C.team.pendingHeading}</Eyebrow>
            <p className="text-body text-ink">{C.team.pendingBody}</p>
          </Panel>
        )}
      </Section>

      {/* ---------- 6 · CTA ---------- */}
      <Section id="investor-cta" heading={C.cta.heading}>
        <p className="max-w-measure text-body text-ink-muted">{C.cta.body}</p>
        <div className="flex flex-wrap gap-md">
          <ButtonLink href={COPY.cta.dataRoom.href}>{COPY.cta.dataRoom.label}</ButtonLink>
        </div>
      </Section>
    </main>
  );
}
