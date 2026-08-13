import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Investors' };

export default function Page() {
  return (
    <StubPage
      title="Investors"
      intent="Unit economics per machine, payback, offtake pricing and the Egypt deployment plan. Ends in data room access."
    />
  );
}
