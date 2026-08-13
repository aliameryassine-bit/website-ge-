/**
 * The event taxonomy.
 *
 * ONE RULE: an event earns its place only if a plausible reading of it changes
 * a decision. Everything below states the question it answers and the decision
 * it would change. Two requested events are deliberately absent, and why is
 * recorded at the bottom — a taxonomy that only lists what was kept teaches
 * nobody why the next suggestion should be refused.
 *
 * No event carries anything identifying. No names, no emails, no company names,
 * no free text. Store counts are bucketed rather than exact, because an exact
 * store count plus a timestamp is close to identifying for a named chain, and
 * the decision only needs the band.
 */

export const EVENTS = {
  /**
   * Which door a visitor takes at the audience fork.
   *
   * QUESTION: what audience mix actually arrives, against the mix the site is
   * built for?
   *
   * DECISION: CLAUDE.md ranks retail above investors and resolves every layout
   * trade-off in retail's favour. If the split comes back majority investor,
   * that ranking is wrong and the homepage is weighted for the wrong reader.
   * Separately: the fork is the site's primary routing device. If neither panel
   * is taken — visitors scroll past it or use the header nav instead — the fork
   * has failed as a device and should be replaced, not tuned.
   */
  forkSelected: 'fork_selected',

  /**
   * The ROI calculator was used, with the size of chain being modelled.
   *
   * QUESTION: what size of retail chain is actually evaluating us?
   *
   * DECISION: three things assume a chain size — the ROI coefficients, the
   * pilot-of-one-store proposition, and the TAM story told to investors. If
   * everyone modelling is 1–5 stores we are selling to independents and the
   * go-to-market is aimed wrong; if they are 200+, a single-store pilot is too
   * small an ask to be taken seriously.
   *
   * URGENT SECOND READING: the calculator currently cannot compute anything —
   * all nine coefficients are PLACEHOLDER, so it reports what it is missing
   * instead of a result. This event counts how many prospects hit that dead
   * end, which is the number that decides how hard to chase those figures.
   */
  roiCalculatorUsed: 'roi_calculator_used',

  /**
   * First real interaction with the pilot form.
   *
   * QUESTION: is the pilot form the bottleneck, or is the traffic?
   *
   * DECISION: this is only meaningful as a pair with the submit. Started-but-
   * not-submitted separates "nobody wants a pilot" from "the form loses them",
   * and those need opposite responses — one is a positioning problem, the other
   * is a form problem. A submission count on its own cannot tell them apart,
   * which is why both halves are here and neither is worth keeping alone.
   */
  pilotFormStarted: 'pilot_form_started',
  pilotFormSubmitted: 'pilot_form_submitted',

  /**
   * A data room request was lodged.
   *
   * QUESTION: is investor interest real, and what share of /investors readers
   * ask for access?
   *
   * DECISION: goal two of the site. The rate — requests over /investors
   * pageviews — is the part the Airtable row cannot give, and it is what says
   * whether the gate's friction (seven fields, a declaration and a consent) is
   * costing us requests or filtering correctly. A count alone would be
   * redundant with the store; the rate is not.
   *
   * NOTE: requested as `datacenter_access_requested`. There is no datacenter;
   * this is the data room, and the name is corrected here.
   */
  dataRoomAccessRequested: 'data_room_access_requested',

  /**
   * The pinned technology sequence was driven to its last step.
   *
   * QUESTION: does the pinned scroll sequence work, or does it trap people?
   *
   * DECISION: if completion is near zero the pin is hijacking the scroll rather
   * than driving it, and the section should be unpinned into the plain vertical
   * list it already degrades to under reduced motion. That is a concrete change
   * with a clear trigger.
   *
   * THIS IS A REDUCTION of the requested `scroll_depth`. See the note below.
   */
  technologySequenceCompleted: 'technology_sequence_completed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/* ---------------------------------------------------------------------------
 * NOT TRACKED, and why
 * ---------------------------------------------------------------------------
 *
 * scroll_depth on the technology section — REPLACED, not kept.
 *   Continuous depth answers "how far did they get" and no decision follows
 *   from the answer. Suppose 40% reach step five of nine: shortening the
 *   sequence and reordering it are both guesses, because depth cannot say why
 *   anyone stopped. /technology is a credibility page, not a conversion path,
 *   and what matters from it is whether the reader went on to request a pilot —
 *   which the pilot events already capture. Depth is also the most expensive
 *   signal here: a scroll listener firing many events per session, for the
 *   noisiest data on the site.
 *   The one real decision hiding inside it — "is the pin broken?" — is answered
 *   by a single completion event per session, which is what is implemented.
 *
 * outbound_deck_download — REMOVED. There is no deck.
 *   There is no PDF anywhere in the project, and the only download-shaped copy
 *   is cta.spec, which points at /machine — a route that does not exist. An
 *   event on a file nobody can download reports a permanent zero, and a
 *   permanent zero on a dashboard reads as failure rather than as absence.
 *   When a deck exists this becomes worth tracking, and the question it would
 *   answer is a good one: which audience takes the asset, and therefore whether
 *   to gate it. Add it with the deck, not before.
 */

// ---------------------------------------------------------------------------
// Property shapes
// ---------------------------------------------------------------------------

/** Which fork panel. */
export type ForkChoice = 'retailer' | 'investor';

/**
 * Store-count bands.
 *
 * Bucketed, not exact. An exact store count and a timestamp is close to
 * identifying for a named chain in a market this concentrated, and every
 * decision the number feeds only needs the band. The boundaries are the ones
 * that change what we would do: a single site, a small independent group, a
 * regional chain, a national chain.
 */
export const STORE_BUCKETS = ['1', '2-5', '6-20', '21-50', '51-200', '200+'] as const;
export type StoreBucket = (typeof STORE_BUCKETS)[number];

export function storeBucket(count: number): StoreBucket {
  if (!Number.isFinite(count) || count <= 1) return '1';
  if (count <= 5) return '2-5';
  if (count <= 20) return '6-20';
  if (count <= 50) return '21-50';
  if (count <= 200) return '51-200';
  return '200+';
}

/** Typed property maps, so a call site cannot invent a property name. */
export type EventProps = {
  [EVENTS.forkSelected]: { choice: ForkChoice };
  [EVENTS.roiCalculatorUsed]: { stores: StoreBucket; computed: 'yes' | 'no' };
  [EVENTS.pilotFormStarted]: { entry: 'pilot' | 'for-retailers' };
  /*
    No properties on either submission. The detail — store count, investor type
    — is already on the Airtable row, which the admin dashboard reads, and the
    confirmation page that fires these cannot know it without putting it in a
    URL. A count is all the RATE needs, and a count carries nothing about a
    named chain.
  */
  [EVENTS.pilotFormSubmitted]: Record<string, never>;
  [EVENTS.dataRoomAccessRequested]: Record<string, never>;
  [EVENTS.technologySequenceCompleted]: { mode: 'pinned' | 'list' };
};
