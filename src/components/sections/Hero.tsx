import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Panel';
import { COPY } from '@/content/copy';

/**
 * Hero.
 *
 * Type and space only. The design plan makes the machine the hero object,
 * photographed under one hard Cairo-noon light — and that photograph does not
 * exist yet. Rather than drop in a decorative stand-in, the space it will
 * occupy is simply left as space. The --shadow-noon token is reserved for it.
 *
 * Tall enough that the header's transparent-over-hero state is a real state
 * rather than a technicality.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mx-auto flex w-full max-w-page flex-col gap-lg px-md pt-2xl pb-3xl md:px-xl md:pt-3xl"
    >
      <Eyebrow>{COPY.site.name}</Eyebrow>
      <h1 id="hero-heading" className="max-w-measure font-display text-nameplate text-ink">
        {COPY.home.hero.headline}
      </h1>
      <p className="max-w-measure text-lead text-ink-muted">{COPY.home.hero.subhead}</p>

      <div className="mt-md flex flex-wrap gap-md">
        <ButtonLink href={COPY.cta.pilot.href}>{COPY.cta.pilot.label}</ButtonLink>
        <ButtonLink href={COPY.cta.investorAccess.href} variant="secondary">
          {COPY.cta.investorAccess.label}
        </ButtonLink>
      </div>
    </section>
  );
}

export default Hero;
