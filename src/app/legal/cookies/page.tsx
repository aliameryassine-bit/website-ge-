import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Cookies' };

export default function Page() {
  return (
    <StubPage
      title="Cookies"
      intent="What is set, why, and how to refuse it. Requires legal review before publication."
    />
  );
}
