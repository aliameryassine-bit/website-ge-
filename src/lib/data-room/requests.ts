import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

/**
 * Storing and notifying data room access requests.
 *
 * Two things must be true before a requester is told their request is pending:
 * it was actually recorded, and we were actually told about it. If either fails
 * the caller reports failure — a "pending" screen over a dropped request is the
 * worst outcome available here, because the requester stops chasing.
 *
 * Configuration, both by environment variable so no secret is in the repo:
 *   DATA_ROOM_REQUESTS_DIR   directory to append request records to
 *   DATA_ROOM_NOTIFY_EMAIL   where notifications go
 *   DATA_ROOM_NOTIFY_WEBHOOK POST target for the notification
 *
 * The file store is deliberate rather than a stand-in for a database: it makes
 * the flow genuinely work in development and on a persistent host, and it fails
 * loudly on ephemeral serverless storage instead of pretending. Swap the body of
 * `store` for a real database when there is one; the contract does not change.
 */

export type AccessRequest = {
  name: string;
  organisation: string;
  role: string;
  investorType: string;
  country: string;
  email: string;
  linkedin: string;
  /** Which declaration wording the requester agreed to, for the record. */
  declarationVersion: string;
  receivedAt: string;
};

export type LodgeResult =
  { lodged: true; id: string; notified: boolean } | { lodged: false; reason: string };

async function store(request: AccessRequest): Promise<{ id: string } | { error: string }> {
  const dir = process.env.DATA_ROOM_REQUESTS_DIR;
  if (!dir) {
    return {
      error: 'DATA_ROOM_REQUESTS_DIR is not set, so there is nowhere to record the request.',
    };
  }

  const id = randomUUID();
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, `${request.receivedAt.replace(/[:.]/g, '-')}-${id}.json`),
      JSON.stringify({ id, ...request }, null, 2),
      'utf8',
    );
    return { id };
  } catch (error) {
    return { error: `Could not write the request: ${(error as Error).message}` };
  }
}

/**
 * Notification. Returns false rather than throwing, because a stored request
 * with a failed notification is recoverable — the record exists — while losing
 * the record is not. The caller surfaces the difference.
 */
async function notify(request: AccessRequest, id: string): Promise<boolean> {
  const webhook = process.env.DATA_ROOM_NOTIFY_WEBHOOK;
  const to = process.env.DATA_ROOM_NOTIFY_EMAIL;

  if (!webhook) {
    // No transport configured. Recorded in the server log so the request is not
    // silently invisible to us even when the notification path is missing.
    console.warn(
      `[data-room] request ${id} stored but NOT notified: DATA_ROOM_NOTIFY_WEBHOOK unset` +
        (to ? ` (intended recipient ${to})` : ''),
    );
    return false;
  }

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, to, request }),
    });
    if (!response.ok) {
      console.error(`[data-room] notification for ${id} failed: HTTP ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[data-room] notification for ${id} threw: ${(error as Error).message}`);
    return false;
  }
}

export async function lodgeAccessRequest(request: AccessRequest): Promise<LodgeResult> {
  const stored = await store(request);
  if ('error' in stored) return { lodged: false, reason: stored.error };

  const notified = await notify(request, stored.id);
  return { lodged: true, id: stored.id, notified };
}
