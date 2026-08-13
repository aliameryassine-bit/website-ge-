/**
 * The row store: Airtable.
 *
 * WHY THIS ONE (the alternative considered was Google Sheets):
 * - Auth is a single bearer token in one environment variable. A Sheets service
 *   account needs a JSON key pasted into an env var, which is more to get wrong
 *   and more to rotate.
 * - Records are typed and each one has its own row of state, so a Status column
 *   ("New", "Contacted", "Site visit booked", "Declined") turns the table into
 *   the pipeline rather than a log. A spreadsheet is a log with the pipeline
 *   drawn on top of it by hand.
 * - Views and filters belong to the person reading, not the person writing, so
 *   sorting leads by city or store count needs no developer and cannot break
 *   the schema.
 * - There is a usable mobile app, which matters for a business whose buyers are
 *   visited in their stores.
 *
 * Sheets wins on familiarity and on cost at high volume. At this volume the
 * per-record workflow is worth more than either.
 *
 * TYPECAST is on: it lets Airtable accept a string for a single-select or number
 * column rather than rejecting the whole write. A rejected write here means a
 * lost lead, and a slightly wrong cell type does not.
 */

const DEFAULT_BASE_URL = 'https://api.airtable.com';

export type StoreResult =
  { stored: true; id: string } | { stored: false; reason: string; configured: boolean };

export type Row = Record<string, string | number>;

type AirtableConfig = { baseUrl: string; apiKey: string; baseId: string };

function config(): AirtableConfig | null {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) return null;
  return {
    // Overridable so the delivery path can be exercised end to end against a
    // local stand-in without a live account.
    baseUrl: process.env.AIRTABLE_BASE_URL ?? DEFAULT_BASE_URL,
    apiKey,
    baseId,
  };
}

export async function appendRow(table: string, fields: Row): Promise<StoreResult> {
  const settings = config();
  if (!settings) {
    return {
      stored: false,
      configured: false,
      reason: 'AIRTABLE_API_KEY or AIRTABLE_BASE_ID is not set, so there is no table to write to.',
    };
  }

  const url = `${settings.baseUrl}/v0/${settings.baseId}/${encodeURIComponent(table)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${settings.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
      // A lead form must not hang on a slow third party.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return {
        stored: false,
        configured: true,
        reason: `Airtable returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`,
      };
    }

    const body = (await response.json()) as { records?: { id?: string }[] };
    const id = body.records?.[0]?.id;
    if (!id)
      return {
        stored: false,
        configured: true,
        reason: 'Airtable accepted the write but returned no record id.',
      };
    return { stored: true, id };
  } catch (error) {
    return {
      stored: false,
      configured: true,
      reason: `Airtable request failed: ${(error as Error).message}`,
    };
  }
}
