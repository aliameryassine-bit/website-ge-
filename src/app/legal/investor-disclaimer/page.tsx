import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Investor disclaimer' };

export default function Page() {
  return (
    <StubPage
      title="Investor disclaimer"
      intent="Placeholder. Nothing on this site is an offer of securities; wording requires counsel before publication."
    />
  );
}
