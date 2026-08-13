/**
 * The retailer ROI model.
 *
 * ONE object holds every coefficient, each line naming where its value has to
 * come from. Nothing in the calculator may use a number that is not declared
 * here — that is the whole point of the file. If a figure is needed and is not
 * in this object, the answer is to add it here with a source, not to inline it.
 *
 * These coefficients are held to a HIGHER standard than the rest of the fact
 * system, not a lower one. A retail operations lead may take a siting decision
 * on the output of this calculator, so none of them gets a plausible-looking
 * placeholder value. While any is unmeasured the calculator reports that it
 * cannot compute and names what is missing. An estimate built on invented
 * coefficients is worse than no estimate, because it looks like diligence.
 */

import { FACTS, type Fact, type FactId } from './facts.ts';

export type Coefficient = {
  readonly label: string;
  readonly unit: string;
  /** Numeric value. `undefined` while the underlying figure is unmeasured. */
  readonly value?: number;
  /** The fact this resolves from, for company figures. Absent for constants. */
  readonly factId?: FactId;
};

/** A coefficient whose value comes from a company figure in facts.ts. */
function fromFact(factId: FactId, unit: string, value?: number): Coefficient {
  const fact: Fact = FACTS[factId];
  return { label: fact.label, unit, ...(value === undefined ? {} : { value }), factId };
}

/** A coefficient that is a fixed constant rather than a measurement. */
function constant(label: string, unit: string, value: number): Coefficient {
  return { label, unit, value };
}

export const ROI_COEFFICIENTS = {
  // source: facts.ts `capture-rate-per-footfall` — pilot measurement. No published figure from another market transfers to Egyptian retail, so this stays unset until a live site produces it.
  captureRatePerVisitor: fromFact('capture-rate-per-footfall', 'containers per visitor per day'),
  // source: facts.ts `containers-per-machine-per-day` — machine throughput, used as the ceiling on demand. Footfall cannot deposit more than the hardware can take.
  machineThroughputPerDay: fromFact(
    'containers-per-machine-per-day',
    'containers per machine per day',
  ),
  // source: facts.ts `stream-split-pet-share` — share of accepted containers that are PET rather than aluminium. Varies by site; drives both tonnage and material value.
  petShareOfContainers: fromFact('stream-split-pet-share', 'share of containers, 0–1'),
  // source: facts.ts `average-container-mass-pet` — grams per accepted PET container, weighted by the size mix actually returned.
  massPerPetContainerGrams: fromFact('average-container-mass-pet', 'grams'),
  // source: facts.ts `average-container-mass-aluminium` — grams per accepted can, weighted by the size mix actually returned.
  massPerAluminiumContainerGrams: fromFact('average-container-mass-aluminium', 'grams'),
  // source: facts.ts `value-per-tonne-baled-pet` — baled PET price. Volatile; must carry a pricing date and market when set.
  valuePerTonnePet: fromFact('value-per-tonne-baled-pet', 'currency per tonne'),
  // source: facts.ts `value-per-tonne-baled-aluminium` — baled aluminium price. Same volatility caveat as PET.
  valuePerTonneAluminium: fromFact('value-per-tonne-baled-aluminium', 'currency per tonne'),
  // source: facts.ts `retailer-revenue-share` — the retailer's share of recovered material value, as agreed commercially. Not a market rate.
  retailerShareOfMaterialValue: fromFact('retailer-revenue-share', 'share of material value, 0–1'),
  // source: facts.ts `benefit-range-band` — plus/minus band expressing uncertainty, set from the spread observed across pilot sites rather than chosen for comfort.
  benefitRangeBand: fromFact('benefit-range-band', 'fraction, 0–1'),
  // source: calendar constant, 365.25 / 12. Not a business assumption and not subject to measurement.
  daysPerMonth: constant('Days per month', 'days', 30.44),
} as const satisfies Record<string, Coefficient>;

export type CoefficientKey = keyof typeof ROI_COEFFICIENTS;

export type RoiInputs = {
  /** Stores in scope. */
  stores: number;
  /** Average daily visitors per store. */
  dailyFootfall: number;
  /** Machines installed per store. */
  machinesPerStore: number;
};

export type RoiResult =
  | {
      available: false;
      /** Human-readable labels of the coefficients still unmeasured. */
      missing: string[];
    }
  | {
      available: true;
      containersPerMonth: number;
      tonnesPerMonth: number;
      benefitLow: number;
      benefitHigh: number;
      /** True when machine throughput, not footfall, is the binding constraint. */
      throughputLimited: boolean;
    };

export const ROI_INPUT_LIMITS = {
  // source: sanity bounds for the form, not modelling assumptions. Wide enough for a national chain, narrow enough to reject a typo.
  stores: { min: 1, max: 2000, step: 1 },
  dailyFootfall: { min: 100, max: 100000, step: 100 },
  machinesPerStore: { min: 1, max: 10, step: 1 },
} as const;

function clampInput(value: number, limits: { min: number; max: number }): number {
  if (!Number.isFinite(value)) return limits.min;
  return Math.min(limits.max, Math.max(limits.min, value));
}

export function clampRoiInputs(inputs: RoiInputs): RoiInputs {
  return {
    stores: Math.round(clampInput(inputs.stores, ROI_INPUT_LIMITS.stores)),
    dailyFootfall: Math.round(clampInput(inputs.dailyFootfall, ROI_INPUT_LIMITS.dailyFootfall)),
    machinesPerStore: Math.round(
      clampInput(inputs.machinesPerStore, ROI_INPUT_LIMITS.machinesPerStore),
    ),
  };
}

/**
 * The model, as a pure function of inputs and coefficients.
 *
 * Coefficients are a parameter rather than a closed-over import so the maths can
 * be exercised independently of whether the company figures exist yet.
 *
 * Demand is capped by hardware: visitors cannot deposit more containers than the
 * machines on site can accept, so the binding constraint is reported back.
 */
export function computeRoi(
  rawInputs: RoiInputs,
  coefficients: Record<CoefficientKey, Coefficient> = ROI_COEFFICIENTS,
): RoiResult {
  const missing = (Object.keys(coefficients) as CoefficientKey[])
    .filter((key) => coefficients[key].value === undefined)
    .map((key) => coefficients[key].label);

  if (missing.length > 0) return { available: false, missing };

  const value = (key: CoefficientKey): number => coefficients[key].value as number;
  const inputs = clampRoiInputs(rawInputs);

  const demandPerStorePerDay = inputs.dailyFootfall * value('captureRatePerVisitor');
  const capacityPerStorePerDay = inputs.machinesPerStore * value('machineThroughputPerDay');
  const acceptedPerStorePerDay = Math.min(demandPerStorePerDay, capacityPerStorePerDay);

  const containersPerMonth = acceptedPerStorePerDay * inputs.stores * value('daysPerMonth');

  const petShare = value('petShareOfContainers');
  const petContainers = containersPerMonth * petShare;
  const aluContainers = containersPerMonth * (1 - petShare);

  const petTonnes = (petContainers * value('massPerPetContainerGrams')) / 1_000_000;
  const aluTonnes = (aluContainers * value('massPerAluminiumContainerGrams')) / 1_000_000;

  const materialValue =
    petTonnes * value('valuePerTonnePet') + aluTonnes * value('valuePerTonneAluminium');
  const benefit = materialValue * value('retailerShareOfMaterialValue');
  const band = value('benefitRangeBand');

  return {
    available: true,
    containersPerMonth,
    tonnesPerMonth: petTonnes + aluTonnes,
    benefitLow: benefit * (1 - band),
    benefitHigh: benefit * (1 + band),
    throughputLimited: capacityPerStorePerDay < demandPerStorePerDay,
  };
}
