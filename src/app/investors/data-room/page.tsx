import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Data room access' };

export default function Page() {
  return (
    <StubPage
      title="Data room access"
      intent="The access request form for named individuals. Goal two of the site."
    />
  );
}
