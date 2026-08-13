import { randomInt } from 'node:crypto';

import { appendRow, type Row, type StoreResult } from './airtable';
import { sendNotification, type EmailResult } from './resend';

/**
 * Delivery: one email, one row, and a policy for what counts as delivered.
 *
 * THE POLICY, which is the only interesting part of this file:
 *
 * A submission is DELIVERED if at least one destination accepted it. The row and
 * the email are independent durable records — either one is enough for a person
 * to be contacted back, so refusing to confirm because the second one failed
 * would turn a recoverable partial outage into a lost lead and a person who
 * thinks nobody has their details.
 *
 * A submission FAILS only when both destinations refused. In that case the full
 * payload is written to the server log under a searchable marker, because a log
 * line is the last place a lead can be recovered from, and the person is given a
 * direct email address so they are never left with nothing.
 *
 * Both destinations are attempted concurrently and both are given a hard
 * timeout. Neither is allowed to make the other wait.
 */

/** Marker to grep for when a submission could not be delivered anywhere. */
export const LOST_LEAD_MARKER = '[LEAD-NOT-DELIVERED]';

/** No I, O, 0 or 1: these get read aloud and typed back by people. */
const CODE_ALPHABET = 'ACDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * A short reference the person can quote. Random, not sequential — a sequential
 * code publishes how many leads we have received to anyone who submits twice.
 */
export function referenceCode(prefix: 'P' | 'D'): string {
  let body = '';
  for (let index = 0; index < 5; index += 1) {
    body += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return `GX-${prefix}-${body}`;
}

/** Reference codes are echoed from a URL, so the shape is checked before use. */
export const REFERENCE_PATTERN = /^GX-[PD]-[ACDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/;

export type Delivery = {
  /** Airtable table name. */
  table: string;
  /** Row to write. Keys are Airtable column names. */
  row: Row;
  subject: string;
  /** Plain-text email body. */
  body: string;
  replyTo: string;
};

export type DeliveryResult = {
  delivered: boolean;
  store: StoreResult;
  email: EmailResult;
};

export async function deliver(delivery: Delivery): Promise<DeliveryResult> {
  const [store, email] = await Promise.all([
    appendRow(delivery.table, delivery.row),
    sendNotification({ subject: delivery.subject, body: delivery.body, replyTo: delivery.replyTo }),
  ]);

  const delivered = store.stored || email.sent;

  if (!store.stored) console.error(`[delivery] row not written: ${store.reason}`);
  if (!email.sent) console.error(`[delivery] notification not sent: ${email.reason}`);

  if (!delivered) {
    // Last resort. Recoverable from the host's log even though both
    // destinations are down or unconfigured.
    console.error(`${LOST_LEAD_MARKER} ${JSON.stringify(delivery.row)}`);
  }

  return { delivered, store, email };
}
