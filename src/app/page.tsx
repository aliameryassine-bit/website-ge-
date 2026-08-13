import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';

/**
 * Scaffold shell only. The homepage sections from the design plan — the
 * machine spine, the unit rail, the deposit cycle — are not built yet, and
 * this page deliberately does not fake them.
 *
 * It references no facts: every fact is currently a PLACEHOLDER, and
 * check-facts would (correctly) fail the production build if a marketing
 * surface pointed at one.
 */
export default function HomePage() {
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-2xl px-md py-3xl md:px-xl">
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.site.name}</Eyebrow>
        <h1 className="max-w-measure font-display text-nameplate text-ink">
          {COPY.home.hero.headline}
        </h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.home.hero.subhead}</p>
      </header>

      <Panel className="flex flex-col gap-md">
        <Eyebrow>Scaffold status</Eyebrow>
        <p className="max-w-measure text-body text-ink">
          Design tokens, fonts, motion boundary and UI primitives are in place. Page sections are
          not built yet.
        </p>
        <div className="flex flex-wrap gap-md">
          <ButtonLink href="/styleguide">View the styleguide</ButtonLink>
        </div>
      </Panel>
    </main>
  );
}
