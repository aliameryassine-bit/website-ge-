/**
 * Build gate: placeholder legal text may not ship.
 *
 * The investor disclaimer and the investor-status declaration are both marked
 * placeholders waiting on a lawyer. "Do not let it ship as final" is only a real
 * guarantee if something enforces it, so this fails a production build while the
 * marker is present anywhere in the source.
 *
 * Run:            npm run check:legal
 * Escape hatch:   ALLOW_PLACEHOLDERS=1 npm run build
 *
 * The escape hatch is shared with the fact gate on purpose: one switch to
 * acknowledge "this build contains known placeholders and must not be
 * deployed", rather than a second flag someone can set without noticing what
 * else it lets through.
 *
 * When the real wording arrives, delete the marker from content/copy.ts and from
 * the disclaimer component. This check then passes and needs no edit.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SCAN_DIRS = ['src', 'content'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.css', '.md'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git']);

/** The marker itself, assembled so this file is not its own match. */
const MARKER = ['LEGAL', 'PLACEHOLDER', 'DO', 'NOT', 'SHIP'].join('-');

/** This gate defines the marker; it is not a placeholder site. */
const SKIP_FILES = new Set(['scripts/check-legal.ts']);

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (SCAN_EXTENSIONS.some((extension) => entry.endsWith(extension))) files.push(full);
  }
  return files;
}

function main(): void {
  const allowed = process.env.ALLOW_PLACEHOLDERS === '1';
  const hits: { file: string; line: number }[] = [];

  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const relativePath = relative(ROOT, file).split('\\').join('/');
      if (SKIP_FILES.has(relativePath)) continue;

      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (line.includes(MARKER)) hits.push({ file: relativePath, line: index + 1 });
      });
    }
  }

  if (hits.length === 0) {
    console.log('check-legal: pass. No placeholder legal text found.');
    return;
  }

  const report = allowed ? console.warn : console.error;
  report(`\nPlaceholder legal text (${MARKER}) found in ${hits.length} place(s):`);
  for (const hit of hits) report(`  ${hit.file}:${hit.line}`);
  report(
    '\nThe investor disclaimer and the investor-status declaration must be drafted by a\n' +
      'qualified lawyer before this ships. Do not write them in-house.',
  );

  if (allowed) {
    console.warn(
      '\ncheck-legal: ALLOW_PLACEHOLDERS=1 is set — continuing. Do not deploy this build.',
    );
    return;
  }

  console.error('\ncheck-legal: FAILED. Set ALLOW_PLACEHOLDERS=1 to build anyway (local only).');
  process.exit(1);
}

main();
