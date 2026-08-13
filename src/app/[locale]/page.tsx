import { setRequestLocale } from 'next-intl/server';

import { Fork } from '@/components/sections/Fork';
import { Hero } from '@/components/sections/Hero';

/**
 * Home.
 *
 * Hero, then the audience fork directly below it — the fork is the primary
 * routing device and nothing is allowed between it and the hero.
 *
 * The remaining sections from the design plan (the machine spine, the unit
 * rail, the deposit cycle) are not built yet and are deliberately not faked.
 *
 * References no facts: every fact is still a PLACEHOLDER, and check-facts
 * correctly fails a production build if a marketing surface points at one.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Required for this localised route to render statically.
  setRequestLocale(locale);
  return (
    <main id="main" className="flex flex-col">
      <Hero />
      <Fork />
    </main>
  );
}
