import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { routing } from '../src/i18n/routing.ts';

/**
 * Fails a production build while any string is still untranslated.
 *
 * Same shape as check-facts and check-legal: the mistake this prevents is a
 * page going live in Arabic that is actually English with a marker in front of
 * it. That reads worse to an Egyptian buyer than an English-only site does,
 * because it says we started and did not finish.
 *
 * Gated behind ALLOW_PLACEHOLDERS=1 so local development and review builds
 * still run.
 */

const MARKER = /\[\[[A-Z]{2}\]\]/;

type Node = string | number | boolean | null | Node[] | { [key: string]: Node };

function walk(node: Node, path: string[], found: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, [...path, String(index)], found));
    return;
  }
  if (node !== null && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) walk(value, [...path, key], found);
    return;
  }
  if (typeof node === 'string' && MARKER.test(node)) found.push(path.join('.'));
}

let total = 0;
const summary: { locale: string; count: number; sample: string[] }[] = [];

for (const locale of routing.locales) {
  const file = join(process.cwd(), 'messages', `${locale}.json`);
  const messages = JSON.parse(readFileSync(file, 'utf8')) as Node;
  const found: string[] = [];
  walk(messages, [], found);
  total += found.length;
  if (found.length > 0) summary.push({ locale, count: found.length, sample: found.slice(0, 8) });
}

if (total === 0) {
  console.log('check-i18n: pass — every locale is fully translated.');
  process.exit(0);
}

console.error('\nUntranslated strings remain:\n');
for (const entry of summary) {
  console.error(`  ${entry.locale}: ${entry.count} string(s)`);
  for (const path of entry.sample) console.error(`    ${path}`);
  if (entry.count > entry.sample.length) {
    console.error(`    … and ${entry.count - entry.sample.length} more`);
  }
  console.error('');
}
console.error('The full worklist is content/i18n-todo.md.');
console.error('These must be translated by a person. Do not machine translate them.\n');

if (process.env.ALLOW_PLACEHOLDERS === '1') {
  console.error('check-i18n: ALLOW_PLACEHOLDERS=1 is set — continuing. Do not deploy this build.');
  process.exit(0);
}

console.error(`check-i18n: FAILED with ${total} untranslated string(s).`);
process.exit(1);
