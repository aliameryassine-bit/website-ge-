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
  /**
   * Link for the named source, when one exists.
   *
   * Separate from `source` so a citation can read as a name — "Egypt Ministry
   * of Environment, 2024" — while still linking out. Public-facing citations
   * need both; an internal doc has a name and no URL.
   */
  sourceUrl?: string;
  /**
   * The figure as a number, for anything that has to compute or animate with
   * it. `value` stays the display string; this is the same quantity machine
   * readable.
   */
  numeric?: number;
  /** What the number counts: "containers", "tonnes", "m²". */
  unit?: string;
  /**
   * The period the figure covers: "since March 2026", "per machine per day",
   * "trailing 90 days".
   *
   * Required for any animated counter, and the reason is not pedantry.
   * "1.2M containers" is not a claim — it is a number with no referent.
   * "1.2M containers since March 2026" can be checked, argued with, and
   * relied on. `isCountable()` refuses to animate without it.
   */
  basis?: string;
};

/**
 * Whether a fact may be rendered as an animated counter.
 *
 * Four conditions, all necessary:
 * - measured (`verified` or `internal`) — a PLACEHOLDER never animates, it
 *   renders as a dash, because animating a number nobody has measured is the
 *   most persuasive way to publish a fiction;
 * - a numeric value to count toward;
 * - a unit, so the number means something;
 * - a time basis, so the number is a claim rather than a decoration.
 */
export function isCountable(fact: Fact): boolean {
  return (
    (fact.status === 'verified' || fact.status === 'internal') &&
    typeof fact.numeric === 'number' &&
    Number.isFinite(fact.numeric) &&
    typeof fact.unit === 'string' &&
    fact.unit.length > 0 &&
    typeof fact.basis === 'string' &&
    fact.basis.length > 0
  );
}

/**
 * Whether a fact may appear on a PUBLIC investor surface.
 *
 * The investor market-context rule is absolute: a figure without a named
 * public source does not go on the page. Not greyed out, not marked pending —
 * absent. An unsourced market statistic in front of an investor is the single
 * most damaging thing this site could publish, so the test is a function
 * rather than a habit, and the component that renders citations calls it.
 *
 * `internal` deliberately fails: an internal document is not a public source.
 */
export function isPubliclyCitable(fact: Fact): boolean {
  return fact.status === 'verified' && fact.source !== 'UNSOURCED' && fact.source.trim().length > 0;
}

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

/**
 * A placeholder for a figure intended to be displayed as a counter.
 *
 * Declares the unit and the time basis up front, even while the value is
 * unknown. Two reasons: it records what we intend to measure and over what
 * period before anyone measures it, and promoting the fact later becomes a
 * one-line change — add `numeric`, `value`, `source` and `status` — with no
 * chance of a number arriving without its basis attached.
 */
function countable(id: string, label: string, unit: string, basis: string, note?: string): Fact {
  return { ...placeholder(id, label, note), unit, basis };
}

/**
 * The fact table.
 *
 * Declared as a private const so the KEYS are inferred as literals, then
 * re-exported with every VALUE widened to `Fact`. Both halves matter:
 *
 * - literal keys give FactId, so an unknown id fails to compile;
 * - uniform `Fact` values mean the optional fields — sourceUrl, numeric, unit,
 *   basis — are always accessible.
 *
 * Without the widening, `as const` infers a union of object literal types and
 * only the entries that happen to declare `sourceUrl` have it. Promoting one
 * fact by writing a literal object — the obvious way to do it — then breaks
 * every reader of an optional field with a confusing error somewhere else
 * entirely. Found exactly that way.
 */
const FACT_TABLE = {
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
  'egypt-regulatory-direction': placeholder(
    'egypt-regulatory-direction',
    'Egypt packaging regulation status',
    'Waste Management Regulation Law 202/2020 and any EPR instrument under it. Needs a citation to the instrument itself, not to commentary about it.',
  ),

  // ---------------------------------------------------------------------
  // Egypt PET material flow — the four bands of the impact chart.
  //
  // These four must reconcile: formally collected + informally collected +
  // uncollected should equal consumption. The chart checks that and refuses to
  // draw if they do not, because a flow diagram whose parts do not sum is
  // worse than no diagram.
  //
  // All four need the SAME source, or the comparison is meaningless — mixing a
  // consumption figure from one study with a collection rate from another
  // produces a chart that looks authoritative and means nothing.
  // ---------------------------------------------------------------------
  'egypt-pet-formally-collected': placeholder(
    'egypt-pet-formally-collected',
    'PET formally collected',
    'Collected through formal municipal or licensed channels. Same source and same year as consumption.',
  ),
  'egypt-pet-informally-collected': placeholder(
    'egypt-pet-informally-collected',
    'PET informally collected',
    'Recovered by informal collectors. Usually the largest recovery channel in Egypt and routinely omitted; omitting it overstates the gap we address.',
  ),
  'egypt-pet-uncollected': placeholder(
    'egypt-pet-uncollected',
    'PET uncollected',
    'Landfilled, burned or leaked to environment. The residual, not an independent estimate.',
  ),
  'mena-addressable-retail-sites': placeholder(
    'mena-addressable-retail-sites',
    'Addressable retail sites across MENA',
    'Expansion case only. Egypt is the near-term story.',
  ),

  // ---------------------------------------------------------------------
  // Traction — these prove "operating company, not student concept"
  // ---------------------------------------------------------------------
  'company-stage': placeholder(
    'company-stage',
    'Current stage',
    'One phrase, e.g. "pre-pilot" or "first pilot installed". Stage-appropriate beats inflated: an investor discounts a vague claim harder than a small one.',
  ),
  'machines-built': placeholder(
    'machines-built',
    'Machines built',
    'Units manufactured, whether or not deployed. Distinct from machines-deployed and usually the larger number at this stage.',
  ),
  'pilots-signed': placeholder(
    'pilots-signed',
    'Pilots signed',
    'Signed pilot agreements. Count only executed documents — a verbal yes is not a pilot.',
  ),
  'lois-signed': placeholder(
    'lois-signed',
    'Letters of intent signed',
    'Non-binding LOIs. Keep separate from pilots-signed; conflating them is the most common traction inflation.',
  ),
  'team-size': placeholder(
    'team-size',
    'Team size',
    'Headcount, and state whether it includes founders and part-time.',
  ),
  'machines-deployed': countable(
    'machines-deployed',
    'Machines deployed',
    'machines',
    'as at BASIS REQUIRED — set the as-at date',
    'If this is currently zero or pre-pilot, say so plainly rather than omitting it.',
  ),
  'retail-partners': placeholder(
    'retail-partners',
    'Retail partners',
    'Count only. Never name a chain or show a logo without written permission.',
  ),
  'containers-collected-to-date': countable(
    'containers-collected-to-date',
    'Containers collected',
    'containers',
    'BASIS REQUIRED — set to the actual start of operation, e.g. "since March 2026"',
    'The counter refuses to animate until the basis names a real period. A cumulative total with no start date is not a claim.',
  ),
  'material-recovered-to-date': countable(
    'material-recovered-to-date',
    'Material recovered',
    'tonnes',
    'BASIS REQUIRED — set to the actual start of operation',
    'Split by stream if available. See the methodology note on /impact for how tonnage is derived.',
  ),
  'depositor-value-returned': countable(
    'depositor-value-returned',
    'Value returned to depositors',
    'currency',
    'BASIS REQUIRED — set to the actual start of operation',
    'State the currency explicitly in `unit` when this is set.',
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

  // ---------------------------------------------------------------------
  // Response commitments.
  //
  // These are the "by when" on the two confirmation pages. They are promises
  // the company makes to a named person who has just handed over their
  // details, which is exactly why they are not written into copy.ts as a
  // sentence: only the business can decide what it can actually hold to. Set
  // them to something conservative and true rather than something impressive.
  // ---------------------------------------------------------------------
  'pilot-response-time': placeholder(
    'pilot-response-time',
    'Pilot request response time',
    'What a retail chain is told on the confirmation page, e.g. "two working days". Commit to what can be met on a bad week, not a good one.',
  ),
  'data-room-review-time': placeholder(
    'data-room-review-time',
    'Data room request review time',
    'How long an investor waits for a decision either way. A slower stated time that is always met beats a fast one that is not.',
  ),
} as const satisfies Record<string, Fact>;

/** Every valid fact id. Use this for props so bad ids fail at compile time. */
export type FactId = keyof typeof FACT_TABLE;

export const FACTS: Readonly<Record<FactId, Fact>> = FACT_TABLE;

export function getFact(id: FactId): Fact {
  return FACTS[id];
}

/**
 * Narrows strings from the message files to real fact ids.
 *
 * Copy carries lists of fact ids — which specs a page shows, which figures a
 * section cites — and those arrive from JSON as plain strings. Casting them
 * with `as FactId` is a lie that held right up until the message generator
 * prefixed them with a translation marker: `FACTS['[[RO]] egypt-annual-pet-
 * consumption']` was undefined and /ro/investors crashed at build.
 *
 * This throws instead, naming the id, because a marketing page silently
 * dropping the figure it was built to cite is the worse failure. It runs at
 * build time for every static route, so a bad id cannot reach production.
 */
export function toFactIds(values: readonly string[]): FactId[] {
  return values.map((value) => {
    if (!(value in FACT_TABLE)) {
      throw new Error(
        `Unknown fact id ${JSON.stringify(value)} referenced from copy. ` +
          'Check content/copy.ts and that scripts/build-messages.ts is not translating it.',
      );
    }
    return value as FactId;
  });
}

/** Single-id form of `toFactIds`. */
export function toFactId(value: string): FactId {
  return toFactIds([value])[0] as FactId;
}

export function isPlaceholder(fact: Fact): boolean {
  return fact.status === 'PLACEHOLDER';
}

/** All facts still awaiting real values. Used by scripts/check-facts.ts. */
export function placeholderFacts(): Fact[] {
  return Object.values(FACTS).filter(isPlaceholder);
}

export const FACT_IDS = Object.keys(FACTS) as FactId[];
