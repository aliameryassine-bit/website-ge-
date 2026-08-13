/**
 * Scroll cue: a conveyor tick on a rail, not a bouncing chevron.
 *
 * A vertical hairline with a single square tick that travels its length ONCE as
 * the last beat of the hero entrance, then stops. No loop — an infinite
 * animation in the corner of the viewport is exactly the decorative motion the
 * rule set forbids, and it competes with the content for attention forever.
 *
 * The tick reads as material moving down a belt, which is what the page is
 * about to describe.
 *
 * All three tiers: under reduced motion the tick sits at its rest position at
 * the foot of the rail with the label intact, and with no JavaScript it behaves
 * identically to the full tier because the travel is a CSS keyframe.
 */

export function ScrollCue({ label, delayMs }: { label: string; delayMs: number }) {
  return (
    <div className="flex items-center gap-md">
      <span aria-hidden="true" className="relative block h-2xl w-px bg-alu/50">
        <span
          data-hero-travel
          style={
            {
              '--hero-delay': `${delayMs}ms`,
              '--hero-travel-distance': 'calc(var(--spacing-2xl) - var(--spacing-sm))',
            } as React.CSSProperties
          }
          className="absolute -left-[3px] top-0 block size-2 bg-action"
        />
      </span>
      <span className="text-label text-ink-muted uppercase">{label}</span>
    </div>
  );
}

export default ScrollCue;
