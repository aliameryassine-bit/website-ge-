import { EVENTS } from '@/lib/analytics/events';

/**
 * What the admin dashboard reads.
 *
 * Two sources, deliberately kept separate: Airtable holds the submissions and
 * is authoritative for "who asked"; Plausible holds the events and is
 * authoritative for "how many and out of how many". Neither can answer the
 * other's question, and the dashboard's job is to put the RATE next to the
 * COUNT, because a count on its own has never settled an argument about whether
 * a page works.
 *
 * EVERY SOURCE REPORTS ITS OWN ABSENCE. If a credential is missing the section
 * says which one, rather than rendering a zero. A zero on a dashboard is read
 * as "nobody came", and being wrong about that in front of an investor is worse
 * than an empty panel that says why it is empty.
 */

export type SourceState<T> =
  { ok: true; data: T } | { ok: false; reason: string; missing?: string[] };

// ---------------------------------------------------------------------------
// Submissions, from Airtable
// ---------------------------------------------------------------------------

export type Submission = {
  id: string;
  reference: string;
  receivedAt: string;
  /** Column name → value, rendered as a row. */
  fields: Record<string, string>;
};

const AIRTABLE_BASE_URL = process.env.AIRTABLE_BASE_URL ?? 'https://api.airtable.com';

async function listTable(table: string, columns: string[]): Promise<SourceState<Submission[]>> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    return {
      ok: false,
      reason: 'Airtable is not configured, so submissions cannot be listed.',
      missing: [!apiKey && 'AIRTABLE_API_KEY', !baseId && 'AIRTABLE_BASE_ID'].filter(
        Boolean,
      ) as string[],
    };
  }

  const url = new URL(`${AIRTABLE_BASE_URL}/v0/${baseId}/${encodeURIComponent(table)}`);
  url.searchParams.set('pageSize', '50');
  url.searchParams.set('sort[0][field]', 'Received at');
  url.searchParams.set('sort[0][direction]', 'desc');

  try {
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
      // Always live. A cached admin dashboard is a dashboard that lies.
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        reason: `Airtable returned HTTP ${response.status}. ${detail.slice(0, 200)}`,
      };
    }

    const body = (await response.json()) as {
      records?: { id: string; fields?: Record<string, unknown> }[];
    };

    /*
      `fields` is optional here, and the guard is not theoretical: Airtable omits
      the key entirely for a record where every cell is empty, and reading
      through it took the whole panel down with a TypeError rather than showing
      a row with dashes. A dashboard that dies on one malformed row is worse
      than one that renders it as unknown.
    */
    const data = (body.records ?? []).map((record) => {
      const cells = record.fields ?? {};
      return {
        id: record.id,
        reference: String(cells.Reference ?? '—'),
        receivedAt: String(cells['Received at'] ?? ''),
        fields: Object.fromEntries(columns.map((column) => [column, String(cells[column] ?? '—')])),
      };
    });

    return { ok: true, data };
  } catch (error) {
    return { ok: false, reason: `Could not reach Airtable: ${(error as Error).message}` };
  }
}

export function listPilotRequests() {
  return listTable(process.env.AIRTABLE_PILOT_TABLE ?? 'Pilot requests', [
    'Company',
    'Stores',
    'City',
    'Role',
    'Email',
  ]);
}

export function listDataRoomRequests() {
  return listTable(process.env.AIRTABLE_DATA_ROOM_TABLE ?? 'Data room requests', [
    'Organisation',
    'Investor type',
    'Country',
    'Name',
    'Status',
  ]);
}

// ---------------------------------------------------------------------------
// Events, from the Plausible Stats API
// ---------------------------------------------------------------------------

export type EventCount = { name: string; visitors: number; events: number };
export type PageviewCount = { page: string; visitors: number };

const PLAUSIBLE_HOST = process.env.PLAUSIBLE_HOST ?? 'https://plausible.io';

type StatsRow = Record<string, string | number>;

async function statsQuery(body: unknown): Promise<SourceState<StatsRow[]>> {
  const key = process.env.PLAUSIBLE_API_KEY;
  const site = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!key || !site) {
    return {
      ok: false,
      reason: 'Plausible is not configured, so event counts cannot be read.',
      missing: [!key && 'PLAUSIBLE_API_KEY', !site && 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN'].filter(
        Boolean,
      ) as string[],
    };
  }

  try {
    const response = await fetch(`${PLAUSIBLE_HOST}/api/v2/query`, {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ site_id: site, ...(body as object) }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        ok: false,
        reason: `Plausible returned HTTP ${response.status}. ${detail.slice(0, 200)}`,
      };
    }

    const parsed = (await response.json()) as {
      results?: { dimensions: string[]; metrics: number[] }[];
    };
    return {
      ok: true,
      data: (parsed.results ?? []).map((row) => ({
        dimension: row.dimensions[0] ?? '',
        visitors: row.metrics[0] ?? 0,
        events: row.metrics[1] ?? row.metrics[0] ?? 0,
      })),
    };
  } catch (error) {
    return { ok: false, reason: `Could not reach Plausible: ${(error as Error).message}` };
  }
}

/** Every tracked event, with the visitors who fired it. */
export async function eventCounts(period: string): Promise<SourceState<EventCount[]>> {
  const result = await statsQuery({
    metrics: ['visitors', 'events'],
    date_range: period,
    dimensions: ['event:name'],
    filters: [['is', 'event:name', Object.values(EVENTS)]],
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((row) => ({
      name: String(row.dimension),
      visitors: Number(row.visitors),
      events: Number(row.events),
    })),
  };
}

/** Fork choice split — the property breakdown, not just the total. */
export async function forkSplit(period: string): Promise<SourceState<EventCount[]>> {
  const result = await statsQuery({
    metrics: ['visitors', 'events'],
    date_range: period,
    dimensions: ['event:props:choice'],
    filters: [['is', 'event:name', [EVENTS.forkSelected]]],
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((row) => ({
      name: String(row.dimension),
      visitors: Number(row.visitors),
      events: Number(row.events),
    })),
  };
}

/** Store-count bands from the ROI calculator. */
export async function roiBuckets(period: string): Promise<SourceState<EventCount[]>> {
  const result = await statsQuery({
    metrics: ['visitors', 'events'],
    date_range: period,
    dimensions: ['event:props:stores'],
    filters: [['is', 'event:name', [EVENTS.roiCalculatorUsed]]],
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((row) => ({
      name: String(row.dimension),
      visitors: Number(row.visitors),
      events: Number(row.events),
    })),
  };
}

/** Visitors per page, for the denominators the rates need. */
export async function pageVisitors(period: string): Promise<SourceState<PageviewCount[]>> {
  const result = await statsQuery({
    metrics: ['visitors'],
    date_range: period,
    dimensions: ['event:page'],
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: result.data.map((row) => ({
      page: String(row.dimension),
      visitors: Number(row.visitors),
    })),
  };
}
