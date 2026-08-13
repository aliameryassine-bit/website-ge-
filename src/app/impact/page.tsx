import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Impact' };

export default function Page() {
  return (
    <StubPage
      title="Impact"
      intent="Material recovered by stream, and the reporting method behind every figure. Method stated before number."
    />
  );
}
