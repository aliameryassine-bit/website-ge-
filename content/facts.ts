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
  'container-recognition-rate': placeholder(
    'container-recognition-rate',
    'First-pass recognition rate',
    'Share of registered containers accepted on the first insertion. The figure that decides whether a queue forms at the entrance.',
  ),
  'deposit-value-per-container': placeholder(
    'deposit-value-per-container',
    'Value returned per container',
    'What the depositor receives. Set by the scheme or by Green Exchange where no scheme exists — state which.',
  ),
  'stream-separation-purity': placeholder(
    'stream-separation-purity',
    'Stream separation purity',
    'Share of each bin that is the intended material. Drives the price a reprocessor will pay.',
  ),
  'compaction-ratio': placeholder(
    'compaction-ratio',
    'Compaction ratio',
    'Volume reduction per container. Sets how long a bin lasts, and therefore the servicing interval.',
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
  'floor-loading': placeholder(
    'floor-loading',
    'Floor loading, machine full',
    'kg per m². Shopping-centre and upper-floor sites will ask for this before they approve a site.',
  ),
  'connectivity-requirement': placeholder(
    'connectivity-requirement',
    'Connectivity requirement',
    'State whether it runs on its own cellular connection or needs store network access — the answer decides whether IT has to be involved.',
  ),
  'service-clearance': placeholder(
    'service-clearance',
    'Service clearance required',
    'Working space in front and to the side for a collection. Distinct from the machine footprint.',
  ),
  'servicing-frequency': placeholder(
    'servicing-frequency',
    'Servicing frequency',
    'Also state who performs it — Green Exchange, not store staff, if that is the case.',
  ),
  'fault-response-time': placeholder(
    'fault-response-time',
    'Fault response time',
    'From fault raised to an engineer on site. The commitment a risk-averse operations lead is actually buying.',
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
  'voucher-redemption-rate': placeholder(
    'voucher-redemption-rate',
    'Voucher redemption rate in store',
    'Share of issued value spent in the store rather than taken as cash. The number that turns a return trip into a basket.',
  ),

  // ---------------------------------------------------------------------
  // ROI model coefficients.
  //
  // These are the inputs to the retailer calculator on /for-retailers. They
  // are held to a higher standard than the rest, not a lower one: a retail
  // operations lead may take a decision on the output, so no coefficient here
  // gets a plausible-looking value. Until each is measured, the calculator
  // reports that it cannot compute rather than producing a number.
  // ---------------------------------------------------------------------
  'capture-rate-per-footfall': placeholder(
    'capture-rate-per-footfall',
    'Containers returned per visitor',
    'Containers deposited per store visitor per day. Must come from a live pilot — no published figure from another market transfers to Egyptian retail.',
  ),
  'average-container-mass-pet': placeholder(
    'average-container-mass-pet',
    'Average PET container mass',
    'Grams per accepted PET container, weighted by the size mix actually returned. Publicly citable industry ranges exist but the mix does not — measure it.',
  ),
  'average-container-mass-aluminium': placeholder(
    'average-container-mass-aluminium',
    'Average aluminium container mass',
    'Grams per accepted can, weighted by the size mix actually returned.',
  ),
  'stream-split-pet-share': placeholder(
    'stream-split-pet-share',
    'PET share of accepted containers',
    'Share of accepted containers that are PET rather than aluminium. Drives tonnage and material value, and varies by site.',
  ),
  'benefit-range-band': placeholder(
    'benefit-range-band',
    'Benefit estimate range band',
    'Plus/minus band applied to the benefit figure to express uncertainty. Set from the spread observed across pilot sites, not chosen for comfort.',
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

  // ---------------------------------------------------------------------
  // Corporate identity — footer disclosure.
  //
  // Not statistics, but the same rule applies with more force: a wrong
  // registration number or a guessed address is a legal misstatement, not
  // an approximation. These route through the same gate as every figure.
  // ---------------------------------------------------------------------
  'legal-entity-name': placeholder(
    'legal-entity-name',
    'Registered entity name',
    'The full Romanian legal form as registered (e.g. SRL / SA), not the trading name.',
  ),
  'company-registration-number': placeholder(
    'company-registration-number',
    'Company registration number',
    'Romanian trade register number. Must match the register exactly.',
  ),
  'vat-number': placeholder(
    'vat-number',
    'VAT number',
    'Include the RO prefix if VAT-registered. If not registered, say so rather than leaving it blank.',
  ),
  'registered-address': placeholder(
    'registered-address',
    'Registered office address',
    'The registered office as filed, not an operational or correspondence address.',
  ),
  'contact-email': placeholder('contact-email', 'Contact email'),
  'contact-phone': placeholder(
    'contact-phone',
    'Contact phone',
    'Include the country code. Consider whether an Egypt-local number is needed for retail enquiries.',
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
