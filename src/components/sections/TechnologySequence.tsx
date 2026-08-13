'use client';

import { useEffect, useRef } from 'react';

import { TechStage } from '@/components/sections/technology/TechStage';
import { Callout } from '@/components/ui/Callout';
import { Eyebrow } from '@/components/ui/Panel';
import { useCopy } from '@/i18n/copy';
import { useReducedMotion } from '@/lib/use-reduced-motion';

/**
 * Technology — the journey of one container, as a pinned scroll-linked sequence.
 *
 * PROGRESS IS LINKED, NOT TRIGGERED. One continuous 0→1 value is computed from
 * the section's position each frame and written as a single custom property.
 * The stage reads it directly, so the container travels with the scroll rather
 * than snapping between steps — the difference between driving the machine and
 * clicking through slides.
 *
 * THREE TIERS, decided entirely in CSS (see globals.css) so the markup never
 * flips and there is no hydration shift:
 *   pinned      motion welcome AND lg+ AND :root[data-js]
 *   plain list  reduced motion, or below lg, or no JavaScript
 * :root[data-js] is set by a parser-blocking line in the layout, so the pinned
 * height is claimed in the first paint. This component does not gate the
 * layout; it only supplies progress.
 *
 * MOBILE: a stacked sequence, not a horizontal stepper. Nine steps each
 * carrying a specification would put most of the content behind a swipe, and a
 * horizontal scroller on primary content fights the page's own vertical scroll
 * — the gesture conflict the rule set warns about. Stacked keeps every step and
 * every figure reachable by the scroll the reader is already using.
 *
 * PERFORMANCE: one getBoundingClientRect read per frame, then writes — never
 * interleaved, so no forced synchronous layout. Only opacity and transform are
 * animated. The stage is inline SVG, so the section's JavaScript is this file.
 */
/**
 * Where each step's stage sits in the SVG's own coordinate system, as an offset
 * from the token's resting position at the intake.
 *
 * The token is interpolated between consecutive entries by the progress within
 * the current step, so it tracks the narrative continuously: at "Return value"
 * it is at the credit panel, not already down in the compactor. A single linear
 * sweep of the cabinet looked smooth and said the wrong thing.
 */
const STAGE_OFFSET = [0, 31, 58, 67, 101, 159, 262, 371, 430] as const;

export function TechnologySequence() {
  const COPY = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  /*
    Only the step IDS are needed inside the scroll driver, and they are
    structural rather than translated — pulling them out keeps the effect from
    depending on the whole copy tree, which changes identity on every render.
  */
  const stepIds = COPY.technology.steps.map((step) => step.id).join(',');
  const stepCount = COPY.technology.steps.length;

  useEffect(() => {
    if (reduced) return;
    const el = root.current;
    if (!el) return;

    const wide = window.matchMedia('(min-width: 64rem)');
    let frame = 0;
    let ticking = false;
    let lastIndex = -1;

    const update = () => {
      ticking = false;

      // READ phase — exactly one layout read per frame.
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const distance = rect.height - viewport;

      // WRITE phase.
      const raw = distance > 0 ? -rect.top / distance : 0;
      const progress = Math.min(1, Math.max(0, raw));
      el.style.setProperty('--tech-progress', progress.toFixed(4));

      const scaled = progress * stepCount;
      const index = Math.min(stepCount - 1, Math.max(0, Math.floor(scaled)));
      const local = Math.min(1, Math.max(0, scaled - index));

      // The token rides between this stage and the next, continuously.
      const from = STAGE_OFFSET[index] ?? 0;
      const to = STAGE_OFFSET[Math.min(index + 1, stepCount - 1)] ?? from;
      el.style.setProperty('--tech-token-y', `${(from + (to - from) * local).toFixed(1)}px`);

      if (index !== lastIndex) {
        el.dataset.step = String(index);

        // Only touched when the step actually changes, not every frame.
        const items = el.querySelectorAll('[data-tech-step]');
        items.forEach((node, i) => {
          if (i === index) node.setAttribute('aria-current', 'step');
          else node.removeAttribute('aria-current');
        });

        // The machine fills in as material passes through it: stages already
        // travelled stay lit rather than dropping back to dormant.
        stepIds.split(',').forEach((id, i) => {
          const stage = el.querySelector(`[data-stage="${id}"]`);
          if (!stage) return;
          stage.setAttribute(
            'data-state',
            i < index ? 'passed' : i === index ? 'active' : 'future',
          );
        });

        lastIndex = index;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(update);
    };

    /**
     * The pin itself is pure CSS, gated on :root[data-js] so it is in place at
     * first paint. This only decides whether to spend work computing progress,
     * and resets the derived state when the layout is no longer pinned.
     */
    const sync = () => {
      if (wide.matches) {
        update();
      } else {
        el.removeAttribute('data-step');
        el.style.removeProperty('--tech-progress');
        lastIndex = -1;
      }
    };

    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    wide.addEventListener('change', sync);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      wide.removeEventListener('change', sync);
    };
  }, [reduced, stepCount, stepIds]);

  return (
    <section
      aria-labelledby="tech-heading"
      className="mx-auto w-full max-w-page px-md py-3xl md:px-xl"
    >
      <header className="mb-2xl flex flex-col gap-lg">
        <Eyebrow>{COPY.technology.eyebrow}</Eyebrow>
        <h2 id="tech-heading" className="font-display text-section text-ink">
          {COPY.technology.headline}
        </h2>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.technology.intro}</p>
      </header>

      <div ref={root} data-tech data-step="0" className="grid gap-xl lg:grid-cols-12">
        {/* ---------------- Pinned stage ---------------- */}
        <div data-tech-stage className="lg:col-span-5">
          <div className="flex gap-lg">
            {/* Progress rail. Scales, so it cannot reflow. */}
            <div
              aria-hidden="true"
              className="relative hidden w-px shrink-0 bg-alu/30 lg:block"
              role="presentation"
            >
              <span data-tech-rail-fill className="absolute inset-0 block bg-action" />
            </div>
            <TechStage className="h-auto w-full max-w-machine" />
          </div>
        </div>

        {/* ---------------- Steps ---------------- */}
        <ol className="flex flex-col gap-2xl lg:col-span-7">
          {COPY.technology.steps.map((step, index) => (
            <li key={step.id} data-tech-step className="flex flex-col gap-md">
              <div className="flex items-baseline gap-md">
                <span data-readout className="text-data text-ink-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-subsection text-ink">{step.title}</h3>
              </div>
              <p className="max-w-measure text-body text-ink-muted">{step.body}</p>
              {/* One specification per step, carrying its own status and source. */}
              <Callout id={step.factId} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default TechnologySequence;
