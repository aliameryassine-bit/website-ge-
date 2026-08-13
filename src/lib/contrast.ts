/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * The styleguide computes every ratio it displays from the token values at
 * build time, so a palette edit updates the reported numbers automatically.
 * A hand-transcribed ratio is a number that silently goes stale.
 */

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function parseHex(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '').trim();
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`parseHex: not a 6-digit hex colour: ${hex}`);
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function relativeLuminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastVerdict = {
  ratio: number;
  /** Normal body text, WCAG AA. */
  passesBody: boolean;
  /** Large text (≥24px, or ≥18.66px bold) and UI components, WCAG AA. */
  passesLargeAndUi: boolean;
  /** Normal body text, WCAG AAA. */
  passesAaa: boolean;
};

export function judge(foreground: string, background: string): ContrastVerdict {
  const ratio = contrastRatio(foreground, background);
  return {
    ratio,
    passesBody: ratio >= 4.5,
    passesLargeAndUi: ratio >= 3,
    passesAaa: ratio >= 7,
  };
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}
