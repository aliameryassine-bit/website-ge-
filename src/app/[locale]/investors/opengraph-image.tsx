import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ogImage, OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og';

/*
  Route-level Open Graph card. Next wires this into the page's metadata by file
  convention, so nothing has to remember to reference it — and because it sits
  under [locale], each locale gets its own card with its own copy and direction.
*/
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Green Exchange';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'seo' });
  return ogImage({ title: t('investors.title'), eyebrow: 'Investors', locale });
}
