import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow, Panel } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';

/**
 * Honest placeholder for a route the global shell links to but whose content
 * is not written yet.
 *
 * These exist so the shell is genuinely navigable — every nav item, fork panel
 * and footer link resolves to a real route, and Next's typed routes verify that
 * at build time rather than letting a dead link ship. They say plainly that the
 * page is not built, and they still offer both conversion paths so a visitor
 * who lands here is not stranded.
 */
export async function StubPage({
  title,
  intent,
}: {
  title: string;
  /** What this page will need to do for its audience once written. */
  intent: string;
}) {
  const COPY = await getCopy();
  return (
    <main id="main" className="mx-auto flex max-w-page flex-col gap-xl px-md py-3xl md:px-xl">
      <Eyebrow>{COPY.site.name}</Eyebrow>
      <h1 className="max-w-measure font-display text-nameplate text-ink">{title}</h1>

      <Panel className="flex max-w-measure flex-col gap-md">
        <Eyebrow>Not written yet</Eyebrow>
        <p className="text-body text-ink">{intent}</p>
        <div className="mt-sm flex flex-wrap gap-md">
          <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
          <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
            {COPY.cta.investorAccess.label}
          </ButtonLink>
        </div>
      </Panel>
    </main>
  );
}

export default StubPage;
