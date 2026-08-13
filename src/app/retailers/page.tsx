import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'For Retailers' };

export default function Page() {
  return (
    <StubPage
      title="For Retailers"
      intent="Floor space, servicing burden, revenue share and the reporting a retail partner receives. Ends in a pilot request."
    />
  );
}
