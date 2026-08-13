import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Investor disclaimer' };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  return (
    <StubPage
      title="Investor disclaimer"
      intent="Placeholder. Nothing on this site is an offer of securities; wording requires counsel before publication."
    />
  );
}
