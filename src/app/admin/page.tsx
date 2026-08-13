import type { Metadata } from 'next';

import { EVENTS } from '@/lib/analytics/events';
import {
  eventCounts,
  forkSplit,
  listDataRoomRequests,
  listPilotRequests,
  pageVisitors,
  roiBuckets,
  type EventCount,
  type SourceState,
  type Submission,
} from '@/lib/admin/data';

/**
 * The internal dashboard.
 *
 * Outside [locale] on purpose: this is a tool for us, in one language, and
 * running it through the translation pipeline would put 400 more strings in
 * front of a translator for a page no customer will ever see.
 *
 * Protected by Basic Auth in middleware. Also noindex and disallowed in
 * robots.txt — belt and braces, because the two do different jobs.
 *
 * WHAT IT SHOWS AND WHY IN THIS ORDER: rates first, then counts, then the
 * submissions themselves. A count answers "how many"; only a rate answers "is
 * this working", and the rates are the reason each event exists. Every panel
 * that cannot load says which credential is missing rather than showing a zero.
 */

export const metadata: Metadata = {
  title: 'Admin — Green Exchange',
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = 'force-dynamic';

const PERIOD = '30d';

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-md border border-alu/30 p-lg">
      <div className="flex flex-col gap-xs">
        <h2 className="text-label text-ink uppercase">{title}</h2>
        {note ? <p className="max-w-measure text-data text-ink-muted">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Renders the reason a source is unavailable, never a zero. */
function Unavailable({ state }: { state: SourceState<unknown> }) {
  if (state.ok) return null;
  return (
    <div className="flex flex-col gap-sm border border-optic-ink/50 p-md">
      <p className="text-data text-optic-ink uppercase">Not available</p>
      <p className="text-body text-ink">{state.reason}</p>
      {state.missing?.length ? (
        <p className="text-data text-ink-muted">
          Missing: {state.missing.map((name) => name).join(', ')}
        </p>
      ) : null}
    </div>
  );
}

function CountTable({ rows, label }: { rows: EventCount[]; label: string }) {
  if (rows.length === 0) {
    return (
      <p className="text-body text-ink-muted">
        No {label} recorded in the last {PERIOD}.
      </p>
    );
  }
  const total = rows.reduce((sum, row) => sum + row.visitors, 0);
  return (
    <table className="w-full border-collapse text-start">
      <thead>
        <tr>
          {[label, 'Visitors', 'Share'].map((column) => (
            <th
              key={column}
              scope="col"
              className="border-b border-alu/40 py-sm pe-lg text-start text-label text-ink-muted uppercase"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <th
              scope="row"
              className="border-b border-alu/20 py-sm pe-lg text-start text-body text-ink"
            >
              {row.name}
            </th>
            <td data-readout className="border-b border-alu/20 py-sm pe-lg text-data text-ink">
              {row.visitors.toLocaleString()}
            </td>
            <td data-readout className="border-b border-alu/20 py-sm text-data text-ink-muted">
              {total > 0 ? `${Math.round((row.visitors / total) * 100)}%` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SubmissionTable({
  state,
  columns,
  label,
}: {
  state: SourceState<Submission[]>;
  columns: string[];
  /* Distinct per table: two scroll regions sharing one name is ambiguous to
     anyone navigating by landmark, and axe flags it as such. */
  label: string;
}) {
  if (!state.ok) return <Unavailable state={state} />;
  if (state.data.length === 0) {
    return <p className="text-body text-ink-muted">No submissions yet.</p>;
  }

  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={label}>
      <table className="w-full min-w-[46rem] border-collapse text-start">
        <thead>
          <tr>
            {['Reference', ...columns, 'Received'].map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-alu/40 py-sm pe-lg text-start text-label text-ink-muted uppercase"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {state.data.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="border-b border-alu/20 py-sm pe-lg text-start">
                <span data-readout className="text-data text-ink">
                  {row.reference}
                </span>
              </th>
              {columns.map((column) => (
                <td
                  key={column}
                  className="border-b border-alu/20 py-sm pe-lg text-body text-ink-muted"
                >
                  {row.fields[column]}
                </td>
              ))}
              <td className="border-b border-alu/20 py-sm text-data text-ink-muted">
                {row.receivedAt ? row.receivedAt.slice(0, 16).replace('T', ' ') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A rate, with both halves shown so it can be argued with. */
function Rate({
  label,
  numerator,
  denominator,
  question,
}: {
  label: string;
  numerator: number | null;
  denominator: number | null;
  question: string;
}) {
  const computable =
    numerator !== null && denominator !== null && Number.isFinite(denominator) && denominator > 0;

  return (
    <div className="flex flex-col gap-xs border-t border-alu/25 pt-md">
      <p className="text-label text-ink-muted uppercase">{label}</p>
      <p data-readout className="text-readout-m text-ink">
        {computable ? `${Math.round((numerator / denominator) * 100)}%` : '—'}
      </p>
      <p className="text-data text-ink-muted">
        {computable
          ? `${numerator.toLocaleString()} of ${denominator.toLocaleString()}`
          : 'Not enough data yet.'}
      </p>
      <p className="max-w-measure text-data text-ink-muted">{question}</p>
    </div>
  );
}

export default async function AdminPage() {
  const [pilots, dataRooms, events, fork, buckets, pages] = await Promise.all([
    listPilotRequests(),
    listDataRoomRequests(),
    eventCounts(PERIOD),
    forkSplit(PERIOD),
    roiBuckets(PERIOD),
    pageVisitors(PERIOD),
  ]);

  const eventVisitors = (name: string) =>
    events.ok ? (events.data.find((row) => row.name === name)?.visitors ?? 0) : null;

  const pageVisitorsFor = (path: string) =>
    pages.ok ? (pages.data.find((row) => row.page === path)?.visitors ?? 0) : null;

  const started = eventVisitors(EVENTS.pilotFormStarted);
  const submitted = eventVisitors(EVENTS.pilotFormSubmitted);
  const requested = eventVisitors(EVENTS.dataRoomAccessRequested);
  const investorsPage = pageVisitorsFor('/investors');

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl"
    >
      <header className="flex flex-col gap-sm">
        <p className="text-label text-ink-muted uppercase">Internal</p>
        <h1 className="font-display text-section text-ink">Dashboard</h1>
        <p className="max-w-measure text-body text-ink-muted">
          Submissions from Airtable, events from Plausible. Last {PERIOD}. Airtable is authoritative
          for who asked; Plausible is authoritative for how many, out of how many.
        </p>
      </header>

      {/* ---------- The rates, first ---------- */}
      <Panel
        title="Rates"
        note="A count says how many. Only a rate says whether a page is working, which is why each of these exists."
      >
        {!events.ok ? <Unavailable state={events} /> : null}
        <div className="grid gap-lg md:grid-cols-3">
          <Rate
            label="Pilot form: start → submit"
            numerator={submitted}
            denominator={started}
            question="Low means the form loses people. Zero starts means the traffic, not the form, is the problem — opposite fixes."
          />
          <Rate
            label="Investors page → data room request"
            numerator={requested}
            denominator={investorsPage}
            question="Whether the gate's friction — seven fields, a declaration, a consent — filters correctly or just costs requests."
          />
          <Rate
            label="Technology sequence completed"
            numerator={eventVisitors(EVENTS.technologySequenceCompleted)}
            denominator={pageVisitorsFor('/technology')}
            question="Near zero means the pin is trapping people and the section should degrade to the plain list."
          />
        </div>
      </Panel>

      {/* ---------- Fork split ---------- */}
      <Panel
        title="Audience fork"
        note="The site ranks retail above investors and resolves layout trade-offs in retail's favour. If this split is majority investor, that ranking is wrong."
      >
        {fork.ok ? <CountTable rows={fork.data} label="Choice" /> : <Unavailable state={fork} />}
      </Panel>

      {/* ---------- ROI buckets ---------- */}
      <Panel
        title="ROI calculator — chain size"
        note="What size of chain is evaluating us. The ROI coefficients, the single-store pilot ask and the TAM story all assume an answer to this."
      >
        {buckets.ok ? (
          <CountTable rows={buckets.data} label="Stores" />
        ) : (
          <Unavailable state={buckets} />
        )}
      </Panel>

      {/* ---------- Raw event counts ---------- */}
      <Panel title="All events">
        {events.ok ? (
          <CountTable rows={events.data} label="Event" />
        ) : (
          <Unavailable state={events} />
        )}
      </Panel>

      {/* ---------- Submissions ---------- */}
      <Panel title="Pilot requests" note="Most recent 50, newest first.">
        <SubmissionTable
          state={pilots}
          label="Pilot requests"
          columns={['Company', 'Stores', 'City', 'Role', 'Email']}
        />
      </Panel>

      <Panel title="Data room requests" note="Most recent 50. Access is granted manually.">
        <SubmissionTable
          state={dataRooms}
          label="Data room requests"
          columns={['Organisation', 'Investor type', 'Country', 'Name', 'Status']}
        />
      </Panel>
    </main>
  );
}
