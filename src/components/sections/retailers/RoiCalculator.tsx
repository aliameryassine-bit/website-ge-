'use client';

import { useMemo, useState } from 'react';

import { Eyebrow, Panel } from '@/components/ui/Panel';
import { useCopy } from '@/i18n/copy';
import {
  computeRoi,
  ROI_COEFFICIENTS,
  ROI_INPUT_LIMITS,
  type CoefficientKey,
  type RoiInputs,
} from '@/content/roi';

/**
 * Retailer ROI calculator.
 *
 * Every coefficient comes from ROI_COEFFICIENTS in content/roi.ts — there is
 * no number in this file that affects an output. The maths lives in
 * computeRoi(), which is a pure function, so it can be checked without a
 * browser.
 *
 * While any coefficient is unmeasured the model reports that it cannot compute
 * and names what is missing, instead of producing a plausible figure. A retail
 * operations lead may take a siting decision on this output; an invented
 * estimate would be worse than none, because it would look like diligence.
 *
 * The disclaimer is permanent and non-dismissible by construction: it is a
 * static region of the panel with no close control and no conditional, so it
 * cannot be dismissed, collapsed or scrolled past unread. The assumptions are
 * listed on screen beneath it rather than behind a tooltip.
 */

const DEFAULTS: RoiInputs = {
  // Starting positions only — a mid-size chain. These are form defaults, not
  // modelling assumptions, and they do not feed any coefficient.
  stores: 10,
  dailyFootfall: 4000,
  machinesPerStore: 1,
};

/**
 * Field identity and bounds are structural and stay at module scope; only the
 * LABEL is copy, so it is looked up per locale at render.
 */
const FIELDS = [
  { key: 'stores', labelKey: 'stores', limits: ROI_INPUT_LIMITS.stores },
  { key: 'dailyFootfall', labelKey: 'dailyFootfall', limits: ROI_INPUT_LIMITS.dailyFootfall },
  {
    key: 'machinesPerStore',
    labelKey: 'machinesPerStore',
    limits: ROI_INPUT_LIMITS.machinesPerStore,
  },
] as const satisfies readonly {
  key: keyof RoiInputs;
  labelKey: 'stores' | 'dailyFootfall' | 'machinesPerStore';
  limits: { min: number; max: number; step: number };
}[];

export function RoiCalculator() {
  const COPY = useCopy();
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULTS);
  const result = useMemo(() => computeRoi(inputs), [inputs]);

  const setField = (key: keyof RoiInputs, raw: string) => {
    const parsed = Number(raw);
    setInputs((current) => ({ ...current, [key]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <section aria-labelledby="roi-heading" className="flex flex-col gap-lg">
      <header className="flex flex-col gap-md">
        <h2 id="roi-heading" className="font-display text-section text-ink">
          {COPY.forRetailers.roi.heading}
        </h2>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.forRetailers.roi.intro}</p>
      </header>

      <div className="grid gap-lg lg:grid-cols-2">
        {/* ---------------- Inputs ---------------- */}
        <Panel className="flex flex-col gap-lg">
          <Eyebrow>Your numbers</Eyebrow>
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-sm">
              <label htmlFor={`roi-${field.key}`} className="text-label text-ink uppercase">
                {COPY.forRetailers.roi.inputs[field.labelKey]}
              </label>
              <div className="flex items-center gap-md">
                <input
                  id={`roi-${field.key}`}
                  type="number"
                  inputMode="numeric"
                  min={field.limits.min}
                  max={field.limits.max}
                  step={field.limits.step}
                  value={inputs[field.key]}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="min-h-11 w-32 rounded-panel border border-alu/50 bg-well px-md text-body text-ink"
                />
                <input
                  type="range"
                  aria-label={`${COPY.forRetailers.roi.inputs[field.labelKey]} (slider)`}
                  min={field.limits.min}
                  max={field.limits.max}
                  step={field.limits.step}
                  value={inputs[field.key]}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="h-2 flex-1 accent-[var(--color-action)]"
                />
              </div>
              <p className="text-data text-ink-muted">
                {field.limits.min.toLocaleString()} – {field.limits.max.toLocaleString()}
              </p>
            </div>
          ))}
        </Panel>

        {/* ---------------- Outputs ---------------- */}
        <Panel surface="well" className="flex flex-col gap-lg">
          <Eyebrow>Estimated output</Eyebrow>

          {result.available ? (
            <dl className="flex flex-col gap-lg">
              {[
                {
                  label: COPY.forRetailers.roi.outputs.containers,
                  value: Math.round(result.containersPerMonth).toLocaleString(),
                },
                {
                  label: COPY.forRetailers.roi.outputs.tonnage,
                  value: `${result.tonnesPerMonth.toFixed(2)} t`,
                },
                {
                  label: COPY.forRetailers.roi.outputs.benefit,
                  value: `${Math.round(result.benefitLow).toLocaleString()} – ${Math.round(
                    result.benefitHigh,
                  ).toLocaleString()}`,
                },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-xs">
                  <dd data-readout className="text-readout-xl text-ink">
                    {row.value}
                  </dd>
                  <dt className="text-label text-ink-muted uppercase">{row.label}</dt>
                </div>
              ))}
            </dl>
          ) : (
            <div className="flex flex-col gap-md">
              <p className="text-subsection text-ink">{COPY.forRetailers.roi.unavailableHeading}</p>
              <p className="max-w-measure text-body text-ink-muted">
                {COPY.forRetailers.roi.unavailableBody}
              </p>
              <ul className="flex flex-col gap-xs">
                {result.missing.map((label) => (
                  <li key={label} className="flex items-baseline gap-sm text-data">
                    <span
                      aria-hidden="true"
                      className="border border-optic-ink px-xs text-optic-ink uppercase"
                    >
                      pending
                    </span>
                    <span className="text-ink-muted">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.available && result.throughputLimited ? (
            <p className="border-t border-alu/25 pt-md text-data text-optic-ink">
              {COPY.forRetailers.roi.throughputNote}
            </p>
          ) : null}
        </Panel>
      </div>

      {/*
        Permanent disclaimer. No dismiss control, no conditional rendering, no
        collapse — it is part of the panel, and it sits above the assumptions
        rather than behind them.
      */}
      <Panel className="flex flex-col gap-lg border-optic-ink/50">
        <p role="note" className="max-w-measure text-body text-ink">
          {COPY.forRetailers.roi.disclaimer}
        </p>

        <div className="flex flex-col gap-sm">
          <Eyebrow>{COPY.forRetailers.roi.assumptionsHeading}</Eyebrow>
          <ol className="flex flex-col gap-sm">
            {COPY.forRetailers.roi.assumptions.map((assumption, index) => (
              <li key={assumption} className="flex gap-md text-body text-ink-muted">
                <span data-readout className="shrink-0 text-data text-ink-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="max-w-measure">{assumption}</span>
              </li>
            ))}
          </ol>
        </div>

        <details className="flex flex-col gap-sm">
          <summary className="cursor-pointer text-label text-ink uppercase">
            Coefficients and their sources
          </summary>
          <dl className="mt-md flex flex-col gap-sm">
            {(Object.keys(ROI_COEFFICIENTS) as CoefficientKey[]).map((key) => {
              const coefficient = ROI_COEFFICIENTS[key];
              return (
                <div
                  key={key}
                  className="flex flex-col gap-xs border-t border-alu/20 pt-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-lg"
                >
                  <dt className="text-data text-ink">{coefficient.label}</dt>
                  <dd className="flex items-center gap-sm text-data text-ink-muted">
                    <span>{coefficient.unit}</span>
                    {coefficient.value === undefined ? (
                      <span className="border border-optic-ink px-xs text-optic-ink uppercase">
                        pending
                      </span>
                    ) : (
                      <span data-readout className="text-ink">
                        {coefficient.value}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </details>
      </Panel>
    </section>
  );
}

export default RoiCalculator;
