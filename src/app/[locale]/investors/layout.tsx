import { InvestorDisclaimer } from '@/components/sections/investors/InvestorDisclaimer';

/**
 * Layout for every investor route.
 *
 * The disclaimer is attached here rather than to each page so it cannot be
 * forgotten on a route added later — /investors, /investors/data-room and
 * anything nested under them all inherit it.
 */
export default function InvestorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InvestorDisclaimer />
    </>
  );
}
