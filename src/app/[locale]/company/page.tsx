import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { StubPage } from '@/components/sections/StubPage';
import { getCopy } from '@/i18n/copy';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const COPY = await getCopy();
  return pageMetadata({
    title: COPY.seo.company.title,
    description: COPY.seo.company.description,
    href: '/company',
    locale: locale as Locale,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  const COPY = await getCopy();

  return <StubPage title={COPY.seo.company.title} intent={COPY.seo.company.description} />;
}
