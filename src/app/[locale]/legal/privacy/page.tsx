import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Privacy' };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  return (
    <StubPage
      title="Privacy"
      intent="How enquiry and site data is handled. Requires legal review before publication."
    />
  );
}
