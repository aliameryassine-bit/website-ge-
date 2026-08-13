import type { Route } from 'next';
import Link from 'next/link';

import { COPY } from '@/content/copy';

/**
 * THE AUDIENCE FORK — the primary routing device of the site.
 *
 * Deliberately a server component with no JavaScript at all. This is the one
 * element both conversion paths depend on, so it must not be able to break:
 * the panels, the previews and the links all work with JS disabled, and the
 * interaction is pure CSS.
 *
 * There is no scroll-triggered entrance. Content must never be gated behind a
 * scroll observer, and the motion that matters here is the response to intent
 * — the hover/focus state — not a reveal on the way down the page.
 *
 * Physicality, within the approved motion language:
 * - Border goes to Safety Yellow, surface lifts from ground to Belt Black well.
 * - The leader line extends and the arrow travels.
 * - Opacity and transform only. Nothing scales, nothing shifts layout bounds.
 * - Component band (220ms), ease-enter.
 *
 * Preview behaviour: on pointer devices the detail list is held at zero opacity
 * and revealed on hover or keyboard focus, with its space always reserved so
 * nothing reflows. On touch devices — where hover does not exist — it is simply
 * always visible. The `(hover: hover)` gate is what makes that split work;
 * relying on `group-hover` alone would leave tablets unable to see it at all.
 *
 * Retail is first in DOM order and takes the wider column, because audience A
 * outranks audience B.
 */

const PREVIEW_MOTION = [
  'transition-[opacity,transform] duration-[var(--duration-component)] ease-enter',
  '[@media(hover:hover)]:translate-y-sm [@media(hover:hover)]:opacity-0',
  'group-hover:translate-y-0 group-hover:opacity-100',
  'group-focus-within:translate-y-0 group-focus-within:opacity-100',
].join(' ');

const PANEL = [
  'group relative flex flex-col gap-lg rounded-panel border p-lg md:p-xl',
  'border-alu/30 bg-transparent',
  'transition-[background-color,border-color] duration-[var(--duration-component)] ease-enter',
  'hover:border-action hover:bg-well',
  // The ring belongs to the whole panel, not just the heading link inside it.
  'has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2',
  'has-[a:focus-visible]:outline-action has-[a:focus-visible]:border-action',
  'has-[a:focus-visible]:bg-well',
].join(' ');

type Door = {
  title: string;
  summary: string;
  preview: readonly string[];
  cta: string;
  href: Route;
};

function Door({ door }: { door: Door }) {
  return (
    <div className={PANEL}>
      <h3 className="font-display text-section text-ink">
        {/*
          One link per panel, named by the heading alone, with a stretched
          pseudo-element making the whole panel the hit area. The preview list
          stays outside the accessible name so it is read as content rather
          than swallowed into a very long link label.
        */}
        <Link
          href={door.href}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {door.title}
        </Link>
      </h3>

      <p className="max-w-measure text-lead text-ink-muted">{door.summary}</p>

      <ul data-fork-preview className={`flex flex-col gap-sm ${PREVIEW_MOTION}`}>
        {door.preview.map((item) => (
          <li key={item} className="flex items-baseline gap-sm text-body text-ink">
            <span aria-hidden="true" className="mt-[0.6em] h-px w-md shrink-0 bg-alu/60" />
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-auto flex items-center gap-sm text-label text-action uppercase">
        {door.cta}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 8"
          className="h-2 w-8 transition-transform duration-[var(--duration-component)] ease-enter group-hover:translate-x-xs group-focus-within:translate-x-xs"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="0" y1="4" x2="20" y2="4" />
          <polyline points="16,1 20,4 16,7" />
        </svg>
      </p>
    </div>
  );
}

export function Fork() {
  return (
    <section aria-labelledby="fork-heading" className="mx-auto w-full max-w-page px-md md:px-xl">
      <h2 id="fork-heading" className="sr-only">
        {COPY.a11y.forkLabel}
      </h2>
      <p className="mb-lg text-label text-ink-muted uppercase">{COPY.fork.eyebrow}</p>

      {/* 3/2 split on desktop: the retail buyer gets the wider door. */}
      <div className="grid gap-md md:grid-cols-5 md:gap-lg">
        <div className="md:col-span-3">
          <Door door={COPY.fork.retail} />
        </div>
        <div className="md:col-span-2">
          <Door door={COPY.fork.investor} />
        </div>
      </div>
    </section>
  );
}

export default Fork;
