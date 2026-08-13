/**
 * Reads the design tokens straight out of src/app/globals.css at build time.
 *
 * The styleguide is generated from the token source rather than a
 * hand-maintained copy of it. If someone adds, renames or removes a token,
 * /styleguide reflects that on the next build without anyone updating a
 * second list — a duplicated token registry is guaranteed to go stale.
 *
 * Server-only: uses node:fs. Never import this into a client component.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type Token = {
  /** Custom property name without the leading dashes, e.g. "color-housing". */
  name: string;
  /** Declared value, possibly a var() reference. */
  raw: string;
  /** Value with var() references resolved to a literal where possible. */
  resolved: string;
  /** Comment immediately preceding the declaration, if any. */
  note?: string;
};

const THEME_START = '@theme {';

function readThemeBlock(): string {
  const css = readFileSync(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8');
  const start = css.indexOf(THEME_START);
  if (start === -1) throw new Error('tokens: no @theme block found in globals.css');

  let depth = 0;
  let index = start + THEME_START.length - 1;
  for (; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return css.slice(start + THEME_START.length, index);
}

/** Collapse a comment body to one line of prose. */
function tidy(body: string): string {
  return body
    .split('\n')
    .map((line) => line.trim().replace(/^\*+/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parse(): Token[] {
  const block = readThemeBlock();
  const tokens: Token[] = [];
  const raw = new Map<string, string>();

  /**
   * Character-wise rather than line-wise: comments here span several lines, and
   * a line-based reader truncates the rationale at the first newline. Section
   * dividers (`---- Palette ----`) are discarded rather than attached, and a
   * comment trailing a declaration on the same line annotates that
   * declaration, not the next one.
   */
  let pendingNote: string | undefined;
  let index = 0;

  while (index < block.length) {
    const char = block[index];
    if (char === undefined) break;

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    // Comment: consume to its real terminator, however many lines away.
    if (char === '/' && block[index + 1] === '*') {
      const close = block.indexOf('*/', index + 2);
      const end = close === -1 ? block.length : close;
      const text = tidy(block.slice(index + 2, end));
      index = close === -1 ? block.length : close + 2;
      // A divider marks a section; it is not a token's justification.
      pendingNote = /-{3,}/.test(text) ? undefined : text || undefined;
      continue;
    }

    // Declaration: consume to the terminating semicolon.
    const semicolon = block.indexOf(';', index);
    const end = semicolon === -1 ? block.length : semicolon;
    const declaration = block.slice(index, end);
    index = semicolon === -1 ? block.length : semicolon + 1;

    const matched = declaration.match(/^--([\w-]+):\s*([\s\S]+)$/);
    if (matched?.[1] && matched[2]) {
      const value = matched[2].trim();
      raw.set(matched[1], value);

      // A trailing comment on the same line documents THIS declaration.
      const restOfLine = block.slice(index, block.indexOf('\n', index) + 1 || undefined);
      const trailing = restOfLine.match(/^[ \t]*\/\*([\s\S]*?)\*\//);
      if (trailing?.[1]) {
        pendingNote = tidy(trailing[1]);
        index += trailing[0].length;
      }

      tokens.push({
        name: matched[1],
        raw: value,
        resolved: value,
        ...(pendingNote ? { note: pendingNote } : {}),
      });
    }
    pendingNote = undefined;
  }

  const resolve = (value: string, seen = new Set<string>()): string =>
    value.replace(/var\(--([\w-]+)\)/g, (match, ref: string) => {
      if (seen.has(ref)) return match;
      const next = raw.get(ref);
      if (next === undefined) return match;
      return resolve(next, new Set(seen).add(ref));
    });

  return tokens.map((token) => ({ ...token, resolved: resolve(token.raw) }));
}

const ALL = parse();

export function allTokens(): Token[] {
  return ALL;
}

export function byPrefix(prefix: string): Token[] {
  return ALL.filter((token) => token.name.startsWith(prefix));
}

const HEX = /^#[0-9a-fA-F]{3,8}$/;

/** Palette entries: colour tokens that resolve to a literal hex value. */
export function colourTokens(): (Token & { hex: string })[] {
  return byPrefix('color-')
    .filter((token) => HEX.test(token.resolved))
    .map((token) => ({ ...token, hex: token.resolved }));
}

/** Colour tokens that are aliases pointing at another colour token. */
export function colourAliases(): Token[] {
  return byPrefix('color-').filter((token) => token.raw.startsWith('var('));
}

export type TypeToken = {
  name: string;
  size: string;
  lineHeight?: string;
  letterSpacing?: string;
  fontWeight?: string;
  note?: string;
};

/** Type scale entries, with their bound line-height/tracking/weight. */
export function typeTokens(): TypeToken[] {
  const base = byPrefix('text-').filter((token) => !token.name.includes('--'));
  return base.map((token) => {
    const modifier = (suffix: string) =>
      ALL.find((candidate) => candidate.name === `${token.name}--${suffix}`)?.resolved;
    return {
      name: token.name,
      size: token.resolved,
      lineHeight: modifier('line-height'),
      letterSpacing: modifier('letter-spacing'),
      fontWeight: modifier('font-weight'),
      ...(token.note ? { note: token.note } : {}),
    };
  });
}

export function spacingTokens(): Token[] {
  return byPrefix('spacing-');
}

export function easeTokens(): Token[] {
  return byPrefix('ease-');
}

export function durationTokens(): Token[] {
  return byPrefix('duration-');
}

export function shadowTokens(): Token[] {
  return byPrefix('shadow-');
}

export function radiusTokens(): Token[] {
  return byPrefix('radius-');
}

export function fontTokens(): Token[] {
  return byPrefix('font-');
}
