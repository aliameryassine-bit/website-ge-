import type { Metadata } from 'next';

import { setRequestLocale } from 'next-intl/server';

import { StubPage } from '@/components/sections/StubPage';

export const metadata: Metadata = { title: 'Company' };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  return (
    <StubPage
      title="Company"
      intent="Who operates Green Exchange, where it is registered, and how the Romanian build and Egyptian deployment fit together."
    />
  );
}
