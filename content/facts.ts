/**
 * Single source of truth for every number and every claim on this site.
 *
 * RULES (see CLAUDE.md):
 * - No component may hardcode a number or a claim. Import from here.
 * - Never invent a value. Unsupplied facts stay status:'PLACEHOLDER',
 *   value:'—', source:'UNSOURCED'.
 * - Promote to 'internal' only with a named internal doc in `source`.
 * - Promote to 'verified' only with a citable URL in `source`.
 *
 * `scripts/check-facts.ts` fails the build if any fact referenced by the
 * app is still a PLACEHOLDER.
 */

export type Fact = {
  id: string;
  value: string; // display value, e.g. "38 sec"
  label: string; // e.g. "Average deposit cycle per container"
  source: string; // URL, internal doc name, or "UNSOURCED"
  status: 'verified' | 'internal' | 'PLACEHOLDER';
  note?: string;
};

/** A placeholder fact. Keeps the shape honest and the intent obvious. */
function placeholder(id: string, label: string, note?: string): Fact {
  return {
    id,
    value: '—',
    label,
    source: 'UNSOURCED',
    status: 'PLACEHOLDER',
    ...(note ? { note } : {}),
  };
}

export const FACTS = {
  // ---------------------------------------------------------------------
  // Machine operations — what a Head of Operations asks first
  // ---------------------------------------------------------------------
  'containers-per-machine-per-day': placeholder(
    'containers-per-machine-per-day',
    'Containers processed per machine per day',
    'Split PET vs aluminium if the figures differ materially.',
  ),
  'machine-uptime': placeholder(
    'machine-uptime',
    'Machine uptime',
    'State the measurement window alongside this (e.g. trailing 90 days). An uptime figure without a window is not credible.',
  ),
  'deposit-cycle-per-container': placeholder(
    'deposit-cycle-per-container',
    'Average deposit cycle per container',
    'Drives queue length at store entrances. Retail buyers will ask.',
  ),
  'machine-capacity-per-collection': placeholder(
    'machine-capacity-per-collection',
    'Container capacity before collection',
    'Pairs with servicing-frequency to show the servicing burden.',
  ),
  'accepted-container-sizes': placeholder(
    'accepted-container-sizes',
    'Accepted container sizes',
    'Range, e.g. min–max volume for PET and aluminium.',
  ),

  // ---------------------------------------------------------------------
  // Retail footprint and servicing burden
  // ---------------------------------------------------------------------
  'floor-space-required-m2': placeholder(
    'floor-space-required-m2',
    'Floor space required per machine',
    'In m². The single most common first objection from Store Development.',
  ),
  'machine-dimensions': placeholder(
    'machine-dimensions',
    'Machine dimensions',
    'W × D × H. Needed for store-entrance and car-park siting.',
  ),
  'power-requirement': placeholder(
    'power-requirement',
    'Power requirement per machine',
    'Retail sites need this before they can approve an install.',
  ),
  'servicing-frequency': placeholder(
    'servicing-frequency',
    'Servicing frequency',
    'Also state who performs it — Green Exchange, not store staff, if that is the case.',
  ),
  'install-lead-time': placeholder(
    'install-lead-time',
    'Install lead time per site',
    'From signed pilot to operating machine.',
  ),

  // ---------------------------------------------------------------------
  // Retailer commercial case
  // ---------------------------------------------------------------------
  'retailer-revenue-share': placeholder(
    'retailer-revenue-share',
    'Retailer revenue share',
    'Describe the mechanism, not just a percentage.',
  ),
  'footfall-effect': placeholder(
    'footfall-effect',
    'Effect on store footfall',
    'DO NOT PUBLISH until measured in a live pilot. An unmeasured footfall claim is the fastest way to lose a retail buyer.',
  ),
  'dwell-time-effect': placeholder(
    'dwell-time-effect',
    'Effect on dwell time',
    'Same rule as footfall-effect: measured in pilot, or it does not ship.',
  ),
  'esg-reporting-cadence': placeholder(
    'esg-reporting-cadence',
    'ESG reporting cadence provided to partners',
    'What the retailer receives and how often — feeds their compliance reporting.',
  ),

  // ---------------------------------------------------------------------
  // Unit economics — the investor conversation
  // ---------------------------------------------------------------------
  'payback-period-per-machine': placeholder(
    'payback-period-per-machine',
    'Payback period per machine',
    'State the assumptions this rests on. A bare payback number invites doubt.',
  ),
  'capex-per-machine': placeholder(
    'capex-per-machine',
    'Capital cost per machine',
    'Manufactured in Romania — note whether this includes shipping to Egypt.',
  ),
  'opex-per-machine-per-month': placeholder(
    'opex-per-machine-per-month',
    'Operating cost per machine per month',
    'Servicing, logistics, connectivity, share paid to depositors and retailer.',
  ),
  'value-per-tonne-baled-pet': placeholder(
    'value-per-tonne-baled-pet',
    'Value per tonne of baled PET',
    'Volatile. Record the pricing date and market alongside the figure.',
  ),
  'value-per-tonne-baled-aluminium': placeholder(
    'value-per-tonne-baled-aluminium',
    'Value per tonne of baled aluminium',
    'Same volatility caveat as PET.',
  ),

  // ---------------------------------------------------------------------
  // Market — Egypt first, then MENA
  // ---------------------------------------------------------------------
  'egypt-annual-pet-consumption': placeholder(
    'egypt-annual-pet-consumption',
    'Egypt annual PET consumption',
    'Needs a citable third-party source before it can be status:verified.',
  ),
  'egypt-pet-collection-rate': placeholder(
    'egypt-pet-collection-rate',
    'Egypt current PET collection rate',
    'The gap between this and consumption is the market argument. Source it properly.',
  ),
  'egypt-aluminium-collection-rate': placeholder(
    'egypt-aluminium-collection-rate',
    'Egypt current aluminium can collection rate',
  ),
  'egypt-addressable-retail-sites': placeholder(
    'egypt-addressable-retail-sites',
    'Addressable retail sites in Egypt',
    'Basis for TAM. Define what counts as a site.',
  ),
  'mena-addressable-retail-sites': placeholder(
    'mena-addressable-retail-sites',
    'Addressable retail sites across MENA',
    'Expansion case only. Egypt is the near-term story.',
  ),

  // ---------------------------------------------------------------------
  // Traction — these prove "operating company, not student concept"
  // ---------------------------------------------------------------------
  'machines-deployed': placeholder(
    'machines-deployed',
    'Machines deployed',
    'If this is currently zero or pre-pilot, say so plainly rather than omitting it.',
  ),
  'retail-partners': placeholder(
    'retail-partners',
    'Retail partners',
    'Count only. Never name a chain or show a logo without written permission.',
  ),
  'containers-collected-to-date': placeholder(
    'containers-collected-to-date',
    'Containers collected to date',
  ),
  'material-recovered-to-date': placeholder(
    'material-recovered-to-date',
    'Material recovered to date',
    'In tonnes. Split by stream if available.',
  ),
  'depositor-value-returned': placeholder(
    'depositor-value-returned',
    'Value returned to depositors to date',
  ),

  // ---------------------------------------------------------------------
  // Environmental impact — support with method, never assert bare
  // ---------------------------------------------------------------------
  'co2e-avoided-per-tonne-pet': placeholder(
    'co2e-avoided-per-tonne-pet',
    'CO₂e avoided per tonne of PET recovered',
    'Requires a stated methodology in `source`, not a round number.',
  ),
} as const satisfies Record<string, Fact>;

/** Every valid fact id. Use this for props so bad ids fail at compile time. */
export type FactId = keyof typeof FACTS;

export function getFact(id: FactId): Fact {
  return FACTS[id];
}

export function isPlaceholder(fact: Fact): boolean {
  return fact.status === 'PLACEHOLDER';
}

/** All facts still awaiting real values. Used by scripts/check-facts.ts. */
export function placeholderFacts(): Fact[] {
  return Object.values(FACTS).filter(isPlaceholder);
}

export const FACT_IDS = Object.keys(FACTS) as FactId[];
