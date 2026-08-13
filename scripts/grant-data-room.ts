/**
 * Grant data room access. MANUAL, by design.
 *
 *   DATA_ROOM_SIGNING_SECRET=... npm run grant:data-room -- \
 *     --email lp@example.com --hours 72 --base-url https://greenexchange.example
 *
 * This is the only thing in the repository that mints an access token. The
 * public request form has no path to it, so approving a request is an action a
 * person takes after reading it — which is what "access is granted manually"
 * has to mean to be worth anything.
 *
 * Prints the signed URL. Send it to the requester yourself.
 */

import { createAccessToken, accessUrl } from '../src/lib/data-room/signing.ts';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

function main(): void {
  const email = arg('email');
  const hours = Number(arg('hours') ?? 72);
  const baseUrl = arg('base-url') ?? process.env.SITE_URL;

  if (!email) {
    console.error('Missing --email. Nothing was granted.');
    process.exit(1);
  }
  if (!baseUrl) {
    console.error('Missing --base-url (or SITE_URL). Nothing was granted.');
    process.exit(1);
  }
  if (!Number.isFinite(hours) || hours <= 0) {
    console.error(`--hours must be a positive number, received "${arg('hours')}".`);
    process.exit(1);
  }

  let token: string;
  let expiresAt: number;
  try {
    const created = createAccessToken(email, hours);
    token = created.token;
    expiresAt = created.payload.expiresAt;
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }

  console.log('\nData room access granted.\n');
  console.log(`  requester : ${email}`);
  console.log(`  expires   : ${new Date(expiresAt).toISOString()} (${hours}h)`);
  console.log(`  url       : ${accessUrl(baseUrl, token)}\n`);
  console.log('Send this link to the requester. It cannot be regenerated — mint a new one.\n');
}

main();
