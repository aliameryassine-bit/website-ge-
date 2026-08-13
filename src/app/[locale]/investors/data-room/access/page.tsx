import type { Metadata } from 'next';

import { Eyebrow, Panel } from '@/components/ui/Panel';
import { verifyAccessToken } from '@/lib/data-room/signing';

export const metadata: Metadata = {
  title: 'Data room',
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The gated materials, behind a manually issued time-limited signed URL.
 *
 * Fails closed: anything other than a valid, unexpired, correctly signed token
 * shows the refusal state. There is no path from the public request form to a
 * token — one is minted only by scripts/grant-data-room.ts, run by a person who
 * has reviewed the request.
 *
 * The refusal message does not distinguish a forged signature from a malformed
 * token, so probing tells an attacker nothing. Expiry is called out separately
 * because a legitimate holder of a lapsed link needs to know to ask again.
 */
export default async function DataRoomAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = verifyAccessToken(token);

  if (!result.valid) {
    const expired = result.reason === 'expired';
    return (
      <main id="main" className="mx-auto flex max-w-page flex-col gap-lg px-md py-3xl md:px-xl">
        <Eyebrow>Data room</Eyebrow>
        <h1 className="font-display text-section text-ink">
          {expired ? 'This link has expired' : 'This link is not valid'}
        </h1>
        <p className="max-w-measure text-body text-ink-muted">
          {expired
            ? 'Access links are time limited. Ask us for a new one and it will be reissued after review.'
            : 'No access has been granted for this link. If you have requested access, you will receive a link by email once the request has been reviewed.'}
        </p>
      </main>
    );
  }

  const expiresAt = new Date(result.payload.expiresAt);

  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-2xl px-md py-2xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>Data room</Eyebrow>
        <h1 className="font-display text-section text-ink">Materials</h1>
        <dl className="flex flex-col gap-sm text-data text-ink-muted">
          <div className="flex gap-sm">
            <dt className="uppercase">Issued to</dt>
            <dd className="text-ink">{result.payload.email}</dd>
          </div>
          <div className="flex gap-sm">
            <dt className="uppercase">Access expires</dt>
            <dd data-readout className="text-ink">
              {expiresAt.toISOString().replace('T', ' ').slice(0, 16)} UTC
            </dd>
          </div>
        </dl>
      </header>

      {/*
        No documents have been supplied, so none are listed. The gate is real and
        verified; the contents are not invented.
      */}
      <Panel className="flex max-w-measure flex-col gap-md border-optic-ink/40">
        <Eyebrow>No materials uploaded yet</Eyebrow>
        <p className="text-body text-ink">
          The access gate is live and your link has verified, but no documents have been added to
          the data room. The financial model, deployment plan, machine specification and offtake
          terms go here.
        </p>
      </Panel>
    </main>
  );
}
