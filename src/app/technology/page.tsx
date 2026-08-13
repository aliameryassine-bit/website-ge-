import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Technology' };

export default function Page() {
  return (
    <StubPage
      title="Technology"
      intent="The machine: intake, NIR identification, compaction, storage and collection. Specification, footprint and power."
    />
  );
}
