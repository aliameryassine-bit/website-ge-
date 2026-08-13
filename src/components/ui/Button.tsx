/**
 * Primary and secondary action.
 *
 * Safety Yellow is reserved for human action, so `primary` is the only place
 * it appears as a filled field. Radius is --radius-panel (2px): engineered,
 * not soft. Press feedback is a colour/opacity shift within the state band —
 * never a scale transform, which would shift layout bounds.
 */

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-sm whitespace-nowrap rounded-panel px-lg py-sm ' +
  'text-label uppercase transition-colors duration-[var(--duration-state)] ease-enter ' +
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-40';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-action text-on-action hover:bg-action/90',
  secondary: 'border border-alu/60 text-ink hover:border-action hover:text-action',
};

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
} & ComponentProps<'button'>;

export function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  variant?: Variant;
  children: ReactNode;
} & ComponentProps<typeof Link>;

export function ButtonLink({ variant = 'primary', children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`} {...rest}>
      {children}
    </Link>
  );
}
