import type { CSSProperties } from 'react';

import { MachineSchematic } from '@/components/sections/hero/MachineSchematic';
import { ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Eyebrow } from '@/components/ui/Panel';
import { ScrollCue } from '@/components/ui/ScrollCue';
import { COPY } from '@/content/copy';
import { FACTS, type FactId } from '@/content/facts';

/**
 * Hero — the most important screen on the site.
 *
 * A server component. Nothing here needs a runtime, which is what lets the
 * three tiers collapse into one implementation instead of three:
 *
 *   full            CSS-keyframed entrance, one timeline (see globals.css)
 *   reduced motion  the hidden state is scoped to (prefers-reduced-motion:
 *                   no-preference), so nothing is ever hidden and nothing
 *                   animates — a static composition by construction
 *   no JavaScript   identical to full; CSS animation needs no runtime
 *
 * LCP: the h1 carries no animation and no fact dependency. It renders at its
 * final position on first paint and the composition choreographs around it.
 *
 * The signature element is here: every figure arrives on a leader line with its
 * status and source visible, including the ones nobody has measured yet.
 */

/**
 * The single choreography, in one place. Last beat starts at 700ms and runs for
 * one section band (420ms) → 1120ms total, inside the 1.2s budget.
 *
 * These are beats in one sequence, not eight independent timers: the values
 * only make sense read together, which is why they live in one table.
 */
const BEAT = {
  subhead: 80,
  machine: 140,
  spec: 320,
  callout: 420, // + 60ms per callout
  actions: 620,
  cue: 700,
} as const;

const CALLOUT_STAGGER = 60;

/** Throughput, uptime, deployment: operations for audience A, scale for audience B. */
const SPEC: FactId[] = ['containers-per-machine-per-day', 'machine-uptime', 'machines-deployed'];

/** Pointed at the drawing: footprint, then what it accepts. */
const CALLOUTS: FactId[] = ['floor-space-required-m2', 'accepted-container-sizes'];

const delay = (ms: number) => ({ '--hero-delay': `${ms}ms` }) as CSSProperties;

export function Hero() {
  /**
   * The headline states throughput inside the sentence as soon as that figure
   * exists. Until then it states what the company does, and the specification
   * strip below carries the scale with its pending figures marked.
   */
  const throughput = FACTS['containers-per-machine-per-day'];
  const throughputKnown = throughput.status !== 'PLACEHOLDER';

  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-page px-md pt-xl pb-2xl md:px-xl md:pt-2xl"
    >
      {/*
        Headline and machine share the top row so the machine is fully visible
        above the fold — it is the subject, and a subject you have to scroll to
        find is not one. The nameplate is not constrained to a text measure;
        that rule is for body copy, and at display size it forced five lines.
      */}
      <div className="mb-xl grid items-start gap-xl lg:grid-cols-12">
        <div className="flex flex-col gap-lg lg:col-span-7">
          <Eyebrow>{COPY.site.name}</Eyebrow>

          {/*
            LCP element. No animation, no fact gating, no wrapper that could
            delay it — it is text on the server and it paints immediately.
          */}
          <h1 id="hero-heading" className="font-display text-nameplate text-ink">
            {throughputKnown ? (
              <>
                {COPY.home.hero.headline.scaled.before}{' '}
                <span data-readout className="text-ink">
                  {throughput.value}
                </span>{' '}
                {COPY.home.hero.headline.scaled.after}
              </>
            ) : (
              COPY.home.hero.headline.base
            )}
          </h1>

          {/*
            Specification row — the scale statement, sitting with the headline
            so "what, and at what scale" reads as one block.

            One line per figure rather than a stacked value/label pair: stacked,
            this ran to two rows and pushed the scale below the fold at 1440.
          */}
          <dl
            data-hero-enter
            style={delay(BEAT.spec)}
            className="flex flex-wrap items-baseline gap-x-xl gap-y-sm border-y border-alu/25 py-sm"
          >
            {SPEC.map((id) => {
              const fact = FACTS[id];
              const pending = fact.status === 'PLACEHOLDER';
              return (
                <div
                  key={id}
                  className="flex items-baseline gap-sm"
                  data-fact-id={fact.id}
                  data-fact-status={fact.status}
                >
                  <dd data-readout className="text-readout-m text-ink">
                    {fact.value}
                  </dd>
                  {pending ? (
                    <>
                      <span className="sr-only">{COPY.a11y.placeholderFact}</span>
                      <span
                        aria-hidden="true"
                        className="border border-optic-ink px-xs text-data text-optic-ink uppercase"
                      >
                        pending
                      </span>
                    </>
                  ) : null}
                  <dt className="text-label text-ink-muted uppercase">{fact.label}</dt>
                </div>
              );
            })}
          </dl>

          <p
            data-hero-enter
            style={delay(BEAT.subhead)}
            className="max-w-measure text-lead text-ink-muted"
          >
            {COPY.home.hero.subhead}
          </p>

          <div data-hero-enter style={delay(BEAT.actions)} className="flex flex-wrap gap-md">
            <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
            <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
              {COPY.cta.investorAccess.label}
            </ButtonLink>
          </div>
        </div>

        {/* ---------------- Machine: the subject ---------------- */}
        <figure className="flex flex-col gap-lg lg:col-span-5">
          <div data-hero-enter style={delay(BEAT.machine)}>
            <MachineSchematic className="h-auto w-full max-w-machine" />
          </div>

          {/* The signature element, pointed at the subject. */}
          <figcaption className="flex flex-col gap-lg">
            {CALLOUTS.map((id, index) => (
              <div key={id} data-hero-enter style={delay(BEAT.callout + index * CALLOUT_STAGGER)}>
                <Callout id={id} />
              </div>
            ))}
          </figcaption>
        </figure>
      </div>

      {/* Last beat of the sequence, and the handover to the fork below. */}
      <div data-hero-enter style={delay(BEAT.cue)}>
        <ScrollCue label={COPY.home.hero.scrollCue} delayMs={BEAT.cue} />
      </div>
    </section>
  );
}

export default Hero;
