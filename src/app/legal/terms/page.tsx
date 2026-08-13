import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Terms' };

export default function Page() {
  return (
    <StubPage
      title="Terms"
      intent="Terms of use for this site. Requires legal review before publication."
    />
  );
}
