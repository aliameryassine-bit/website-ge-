import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { Button, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { EasingDemo } from '@/components/ui/EasingDemo';
import { Fact } from '@/components/ui/Fact';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { StreamTag } from '@/components/ui/StreamTag';
import { formatRatio, judge } from '@/lib/contrast';
import {
  colourAliases,
  colourTokens,
  durationTokens,
  easeTokens,
  fontTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typeTokens,
} from '@/lib/tokens';

export const metadata: Metadata = {
  title: 'Styleguide',
  // Internal reference surface: never indexed.
  robots: { index: false, follow: false, nocache: true },
};

const GROUND = '#383f43';
const WELL = '#16181a';

/**
 * The two grounds are backgrounds, not foregrounds. Judging them for text
 * contrast reports a meaningless 1.00:1 against themselves, so they are
 * labelled by role instead.
 */
const GROUND_TOKENS = new Set(['color-housing', 'color-belt']);

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex flex-col gap-lg border-t border-alu/25 pt-xl">
      <header className="flex flex-col gap-sm">
        <h2 className="font-display text-section text-ink">{title}</h2>
        {intro ? <p className="max-w-measure text-body text-ink-muted">{intro}</p> : null}
      </header>
      {children}
    </section>
  );
}

export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  const colours = colourTokens();
  const aliases = colourAliases();
  const type = typeTokens();

  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-3xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-md">
        <Eyebrow>Internal reference · noindex</Eyebrow>
        <h1 className="font-display text-nameplate text-ink">Styleguide</h1>
        <p className="max-w-measure text-lead text-ink-muted">
          Every design token, read directly out of <code>src/app/globals.css</code> at build time.
          Contrast ratios are computed from the token values, not transcribed — edit a colour and
          this page re-reports itself.
        </p>
      </header>

      {/* ---------------- PALETTE ---------------- */}
      <Section
        id="palette"
        title="Palette"
        intro="Six material values. Every one is a material or condition in the business. Ratios are measured against the two grounds: Housing Grey (the page) and Belt Black (wells)."
      >
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {colours.map((token) => {
            const onGround = judge(token.hex, GROUND);
            const onWell = judge(token.hex, WELL);
            return (
              <Panel key={token.name} className="flex flex-col gap-md">
                <div
                  aria-hidden="true"
                  className="h-20 w-full rounded-panel border border-alu/20"
                  style={{ backgroundColor: `var(--${token.name})` }}
                />
                <div className="flex flex-col gap-xs">
                  <span className="text-label text-ink uppercase">
                    {token.name.replace('color-', '')}
                  </span>
                  <span data-readout className="text-data text-ink-muted uppercase">
                    {token.hex}
                  </span>
                </div>
                {token.note ? <p className="text-data text-ink-muted">{token.note}</p> : null}
                {GROUND_TOKENS.has(token.name) ? (
                  <p className="border-t border-alu/25 pt-sm text-data text-ink-muted uppercase">
                    Ground — background only, never text
                  </p>
                ) : (
                  <dl className="flex flex-col gap-xs border-t border-alu/25 pt-sm text-data">
                    {[
                      { label: 'on housing', verdict: onGround },
                      { label: 'on belt', verdict: onWell },
                    ].map(({ label, verdict }) => (
                      <div key={label} className="flex items-baseline justify-between gap-sm">
                        <dt className="text-ink-muted uppercase">{label}</dt>
                        <dd className="flex items-baseline gap-sm">
                          <span data-readout className="text-ink">
                            {formatRatio(verdict.ratio)}
                          </span>
                          <span
                            className={
                              verdict.passesBody
                                ? 'text-ink-muted uppercase'
                                : verdict.passesLargeAndUi
                                  ? 'text-optic-ink uppercase'
                                  : 'text-action uppercase'
                            }
                          >
                            {verdict.passesBody
                              ? 'AA body'
                              : verdict.passesLargeAndUi
                                ? 'large/UI only'
                                : 'graphic only'}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </Panel>
            );
          })}
        </div>

        <div className="flex flex-col gap-sm">
          <Eyebrow>Semantic aliases — what components reference</Eyebrow>
          <ul className="grid gap-xs sm:grid-cols-2 lg:grid-cols-3">
            {aliases.map((token) => (
              <li
                key={token.name}
                className="flex items-center justify-between gap-sm border border-alu/25 px-sm py-xs text-data"
              >
                <span className="text-ink">--{token.name}</span>
                <span className="flex items-center gap-sm">
                  <span
                    aria-hidden="true"
                    className="inline-block size-4 border border-alu/30"
                    style={{ backgroundColor: `var(--${token.name})` }}
                  />
                  <span className="text-ink-muted">{token.resolved}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------- TYPE ---------------- */}
      <Section
        id="type"
        title="Type scale"
        intro="Three roles, two families: Array for display, Archivo for body, Martian Mono for every numeral. Sizes are fluid clamps — mobile value on the left of each range, desktop on the right."
      >
        <div className="flex flex-col gap-sm">
          {fontTokens().map((token) => (
            <div key={token.name} className="flex flex-wrap items-baseline gap-sm text-data">
              <span className="text-ink">--{token.name}</span>
              <span className="text-ink-muted">{token.resolved}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-xl">
          {type.map((token) => {
            const isReadout = token.name.includes('readout') || token.name === 'text-data';
            const family = isReadout
              ? 'font-mono'
              : token.name === 'text-nameplate' ||
                  token.name === 'text-section' ||
                  token.name === 'text-subsection'
                ? 'font-display'
                : 'font-body';
            return (
              <div key={token.name} className="flex flex-col gap-sm">
                <div className="flex flex-wrap items-baseline gap-md text-data text-ink-muted">
                  <span className="text-ink uppercase">{token.name.replace('text-', '')}</span>
                  <span>{token.size}</span>
                  {token.fontWeight ? <span>w{token.fontWeight}</span> : null}
                  {token.letterSpacing ? <span>tracking {token.letterSpacing}</span> : null}
                  {token.lineHeight ? <span>lh {token.lineHeight}</span> : null}
                </div>
                <p
                  className={`${family} text-ink`}
                  style={{
                    fontSize: `var(--${token.name})`,
                    lineHeight: token.lineHeight,
                    letterSpacing: token.letterSpacing,
                    fontWeight: token.fontWeight,
                  }}
                >
                  {isReadout ? '0123456789 · 1.4 m² · 99.2%' : 'Take back containers'}
                </p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ---------------- SPACING ---------------- */}
      <Section
        id="spacing"
        title="Spacing"
        intro="A 4/8 rhythm at standard density. Section spacing tiers come from the same scale — no arbitrary gaps."
      >
        <ul className="flex flex-col gap-sm">
          {spacingTokens().map((token) => (
            <li key={token.name} className="flex items-center gap-md">
              <span className="w-16 shrink-0 text-label text-ink uppercase">
                {token.name.replace('spacing-', '')}
              </span>
              <span data-readout className="w-16 shrink-0 text-data text-ink-muted">
                {token.resolved}
              </span>
              <span
                aria-hidden="true"
                className="h-4 bg-action"
                style={{ width: `var(--${token.name})` }}
              />
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------- MOTION ---------------- */}
      <Section
        id="motion"
        title="Motion"
        intro="The physics, defined once. Expo-out entering, expo-in exiting, linear for anything continuous — a conveyor runs at constant speed, so easing one would misrepresent the mechanism. Every demo is instant under prefers-reduced-motion."
      >
        <div className="grid gap-lg md:grid-cols-2">
          {easeTokens().map((token) => (
            <Panel key={token.name} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <span className="text-label text-ink uppercase">
                  {token.name.replace('ease-', '')}
                </span>
                <span data-readout className="text-data break-all text-ink-muted">
                  {token.resolved}
                </span>
                {token.note ? <p className="text-data text-ink-muted">{token.note}</p> : null}
              </div>
              <EasingDemo easeToken={token.name.replace('ease-', '')} durationToken="section" />
            </Panel>
          ))}
        </div>

        <div className="flex flex-col gap-sm">
          <Eyebrow>Duration bands</Eyebrow>
          <ul className="grid gap-xs sm:grid-cols-2">
            {durationTokens().map((token) => (
              <li
                key={token.name}
                className="flex items-baseline justify-between gap-sm border border-alu/25 px-sm py-xs"
              >
                <span className="text-label text-ink uppercase">
                  {token.name.replace('duration-', '')}
                </span>
                <span data-readout className="text-data text-ink-muted">
                  {token.resolved}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---------------- ELEVATION ---------------- */}
      <Section
        id="elevation"
        title="Elevation & radius"
        intro="One hard directional shadow at a fixed angle, warm-tinted rather than neutral: Egyptian noon. Reserved for the machine as hero object, so it appears nowhere else."
      >
        <div className="flex flex-wrap items-end gap-2xl">
          {shadowTokens().map((token) => (
            <div key={token.name} className="flex flex-col gap-sm">
              <div
                aria-hidden="true"
                className="size-24 bg-alu"
                style={{ boxShadow: `var(--${token.name})` }}
              />
              <span className="text-label text-ink uppercase">
                {token.name.replace('shadow-', '')}
              </span>
            </div>
          ))}
          {radiusTokens().map((token) => (
            <div key={token.name} className="flex flex-col gap-sm">
              <div
                aria-hidden="true"
                className="size-24 border border-alu/50 bg-well"
                style={{ borderRadius: `var(--${token.name})` }}
              />
              <span className="text-label text-ink uppercase">{token.name}</span>
              <span data-readout className="text-data text-ink-muted">
                {token.resolved}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------- PRIMITIVES ---------------- */}
      <Section
        id="primitives"
        title="Primitives"
        intro="Every UI primitive in the system. Safety Yellow appears as a filled field in exactly one place — the primary action."
      >
        <div className="flex flex-col gap-xl">
          <div className="flex flex-col gap-sm">
            <Eyebrow>Buttons</Eyebrow>
            <div className="flex flex-wrap items-center gap-md">
              <Button>Request a pilot</Button>
              <Button variant="secondary">Request data room access</Button>
              <Button disabled>Disabled</Button>
              <ButtonLink href="/">Link as button</ButtonLink>
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <Eyebrow>Material streams — differentiated by fill, not colour</Eyebrow>
            <div className="flex flex-wrap items-center gap-xl">
              <StreamTag stream="pet" />
              <StreamTag stream="alu" />
            </div>
            <p className="max-w-measure text-data text-ink-muted">
              PET Flake and Mill Aluminium measure 2.08:1 against each other, so they are never
              distinguished by hue alone: PET is solid, aluminium carries a diagonal mill-line
              hatch, and both are always directly labelled.
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            <Eyebrow>Readouts (Fact)</Eyebrow>
            <div className="flex flex-wrap gap-2xl">
              <Fact id="floor-space-required-m2" size="xl" />
              <Fact id="machine-uptime" size="xl" />
              <Fact id="containers-per-machine-per-day" />
            </div>
          </div>

          <div className="flex flex-col gap-sm">
            <Eyebrow>Signature element — the sourced callout</Eyebrow>
            <Panel surface="well" className="flex flex-col gap-lg">
              <Callout id="floor-space-required-m2" />
              <Callout id="payback-period-per-machine" />
              <Callout id="footfall-effect" />
            </Panel>
            <p className="max-w-measure text-data text-ink-muted">
              Every figure carries its status and source. Unmeasured figures stay on the page,
              visibly marked, rather than being quietly omitted until they are flattering.
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            <Eyebrow>Surfaces</Eyebrow>
            <div className="grid gap-md md:grid-cols-2">
              <Panel>
                <p className="text-body text-ink">
                  Panel on ground — delineated by an aluminium rule, not a fill.
                </p>
              </Panel>
              <Panel surface="well">
                <p className="text-body text-ink">
                  Panel as well — Belt Black. Required for anything charting both streams.
                </p>
              </Panel>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
