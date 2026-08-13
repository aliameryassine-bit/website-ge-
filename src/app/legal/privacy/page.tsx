import type { Metadata } from 'next';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Privacy' };

export default function Page() {
  return (
    <StubPage
      title="Privacy"
      intent="How enquiry and site data is handled. Requires legal review before publication."
    />
  );
}
