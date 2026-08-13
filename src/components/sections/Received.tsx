import type { ReactNode } from 'react';

import { Fact } from '@/components/ui/Fact';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import type { FactId } from '@/content/facts';
import { REFERENCE_PATTERN } from '@/lib/forms/delivery';

/**
 * The confirmation page body, shared by both conversion paths.
 *
 * This is a real page at a real URL, not a toast. A toast is the wrong shape
 * for this moment: it disappears while the person is still reading it, it
 * cannot be returned to, and it leaves them on a form that now looks blank and
 * unsubmitted. A page survives a reload, can be linked, and has room to answer
 * the two questions someone actually has after handing over their details —
 * what happens now, and by when.
 *
 * THE REFERENCE comes from the URL, so it is checked against the code format
 * before it is rendered. React escapes interpolated text, but echoing arbitrary
 * query content back to the page is a habit worth not having.
 *
 * THE "BY WHEN" is a fact, not a sentence. A response commitment is a promise
 * the company makes; this component renders whatever it has been given and the
 * build gate stops a placeholder reaching production.
 */

export function Received({
  eyebrow,
  heading,
  reference,
  referenceLabel,
  referenceNote,
  nextHeading,
  steps,
  responseLabel,
  responseFactId,
  footnote,
  children,
}: {
  eyebrow: string;
  heading: string;
  reference: string | undefined;
  referenceLabel: string;
  referenceNote: string;
  nextHeading: string;
  steps: readonly { heading: string; body: string }[];
  responseLabel: string;
  responseFactId: FactId;
  footnote: string;
  children?: ReactNode;
}) {
  const valid = reference && REFERENCE_PATTERN.test(reference) ? reference : undefined;

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl"
    >
      <header className="flex flex-col gap-lg">
        <Eyebrow>{eyebrow}</Eyebrow>
        {/*
          The live region is a SEPARATE element, not the heading.

          role="status" on the h1 replaced its heading semantics: axe reported
          the confirmation pages as having no h1 at all, which is exactly what a
          screen reader's heading list would have shown. The announcement and
          the heading are two jobs, so they are two elements — the h1 is a plain
          h1, and the outcome is announced by a visually hidden status region
          that also covers client-side navigation, where no page-load
          announcement happens.
        */}
        <p role="status" className="sr-only">
          {eyebrow}. {heading}
        </p>
        <h1 className="font-display text-nameplate text-ink">{heading}</h1>

        {children}
      </header>

      <div className="flex flex-col gap-2xl md:flex-row md:items-start md:gap-3xl">
        {valid ? (
          <Panel className="flex shrink-0 flex-col gap-sm">
            <Eyebrow>{referenceLabel}</Eyebrow>
            <p data-readout data-reference className="text-readout-m text-ink">
              {valid}
            </p>
            <p className="text-data text-ink-muted">{referenceNote}</p>
          </Panel>
        ) : null}

        <div className="flex flex-col gap-sm">
          <Eyebrow>{responseLabel}</Eyebrow>
          <Fact id={responseFactId} showLabel={false} size="m" />
        </div>
      </div>

      <section
        aria-labelledby="next"
        className="flex flex-col gap-lg border-t border-alu/25 pt-2xl"
      >
        <h2 id="next" className="font-display text-section text-ink">
          {nextHeading}
        </h2>
        <ol className="flex flex-col gap-lg">
          {steps.map((step, index) => (
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
        <p className="max-w-measure text-data text-ink-muted">{footnote}</p>
      </section>
    </main>
  );
}

export default Received;
