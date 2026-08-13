import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Panel';
import { getCopy } from '@/i18n/copy';

/**
 * 404.
 *
 * A dead end on a marketing site is a lead walking away, so this page does one
 * job: put both conversion paths back in front of the person who arrived here.
 * It is not an apology and it is not a joke — same operational register as the
 * rest of the site.
 *
 * Deliberately NOT a list of every route. Someone who mistyped a URL does not
 * want a sitemap; they want the two things this company does. The header still
 * carries full navigation for anyone who does want to browse.
 *
 * No `generateMetadata` — Next does not support it in not-found.tsx. The title
 * falls through to the locale layout's template, which is correct.
 */
export default async function NotFound() {
  const COPY = await getCopy();

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto flex max-w-page flex-col gap-2xl px-md py-3xl md:px-xl"
    >
      <header className="flex flex-col gap-lg">
        <Eyebrow>{COPY.errors.notFound.eyebrow}</Eyebrow>
        <h1 className="font-display text-section text-ink">{COPY.errors.notFound.heading}</h1>
        <p className="max-w-measure text-lead text-ink-muted">{COPY.errors.notFound.body}</p>
      </header>

      <div className="flex flex-col gap-md border-t border-alu/25 pt-2xl sm:flex-row sm:flex-wrap">
        <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
        <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
          {COPY.cta.investorAccess.label}
        </ButtonLink>
      </div>
    </main>
  );
}
