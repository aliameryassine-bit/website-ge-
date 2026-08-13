import { setRequestLocale } from 'next-intl/server';

import { InvestorDisclaimer } from '@/components/sections/investors/InvestorDisclaimer';

/**
 * Layout for every investor route.
 *
 * The disclaimer is attached here rather than to each page so it cannot be
 * forgotten on a route added later — /investors, /investors/data-room and
 * anything nested under them all inherit it.
 *
 * `setRequestLocale` is not optional here. Without it the disclaimer's copy
 * lookup opted this whole subtree into dynamic rendering, which quietly took
 * /investors and /investors/data-room off static generation — a layout is as
 * capable of forcing a render mode as a page is.
 */
export default async function InvestorsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {children}
      <InvestorDisclaimer />
    </>
  );
}
