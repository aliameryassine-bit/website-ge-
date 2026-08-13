import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Company' };

export default function Page() {
  return (
    <StubPage
      title="Company"
      intent="Who operates Green Exchange, where it is registered, and how the Romanian build and Egyptian deployment fit together."
    />
  );
}
