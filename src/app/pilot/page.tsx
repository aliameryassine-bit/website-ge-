import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Request a pilot' };

export default function Page() {
  return (
    <StubPage
      title="Request a pilot"
      intent="The pilot request form: chain, store, intended placement. Goal one of the site."
    />
  );
}
