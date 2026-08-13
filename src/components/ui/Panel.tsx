/**
 * A surface. Two grounds only:
 *
 * - `ground` (default): sits on the housing grey page, delineated by an
 *   aluminium rule rather than a fill, so the page reads as one machine
 *   housing rather than a stack of cards.
 * - `well`: Belt Black. Required for anything charting the two material
 *   streams — PET Flake and Mill Aluminium are 2.08:1 against each other and
 *   only clear 3:1 against the ground when that ground is the belt.
 */

import type { ReactNode } from 'react';

type PanelProps = {
  surface?: 'ground' | 'well';
  children: ReactNode;
  className?: string;
};

const SURFACES = {
  ground: 'border border-alu/30 bg-transparent',
  well: 'border border-alu/20 bg-well',
} as const;

export function Panel({ surface = 'ground', children, className }: PanelProps) {
  return (
    <div className={`rounded-panel p-lg ${SURFACES[surface]} ${className ?? ''}`}>{children}</div>
  );
}

/** Small uppercase section marker. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-label text-ink-muted uppercase">{children}</p>;
}
