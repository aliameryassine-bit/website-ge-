/**
 * Build gate: no PLACEHOLDER fact may ship to production.
 *
 * Scans the app for fact references — <Fact id="…" />, getFact('…'),
 * FACTS['…'] — and fails if any referenced fact is still a placeholder.
 * Facts that exist in content/facts.ts but are not referenced anywhere do
 * not fail the build; they are reported so the backlog stays visible.
 *
 * Run:            npm run check:facts
 * Escape hatch:   ALLOW_PLACEHOLDERS=1 npm run build
 *
 * Note: `next dev` does not run prebuild, so local dev is never blocked by
 * this check. The escape hatch is for running a production build locally
 * while figures are still outstanding.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { FACTS } from '../content/facts.ts';

const ROOT = join(import.meta.dirname, '..');
const SCAN_DIRS = ['app', 'components', 'content', 'lib', 'src', 'pages'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mdx'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build']);

/** Files that define the system rather than consume it. */
const SKIP_FILES = new Set(['content/facts.ts', 'components/Fact.tsx']);

const REFERENCE_PATTERNS: RegExp[] = [
  /<Fact\b[^>]*?\bid\s*=\s*["'`]([^"'`]+)["'`]/gs,
  /\bgetFact\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /\bFACTS\[\s*["'`]([^"'`]+)["'`]\s*\]/g,
];

type Reference = { id: string; file: string; line: number };

function walk(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return []; // directory does not exist yet
  }

  const files: string[] = [];
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (SCAN_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function collectReferences(): Reference[] {
  const references: Reference[] = [];

  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dir))) {
      const relativePath = relative(ROOT, file).split('\\').join('/');
      if (SKIP_FILES.has(relativePath)) continue;

      const source = readFileSync(file, 'utf8');
      for (const pattern of REFERENCE_PATTERNS) {
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(source)) !== null) {
          references.push({
            id: match[1],
            file: relativePath,
            line: lineOf(source, match.index),
          });
        }
      }
    }
  }

  return references;
}

function main(): void {
  const allowed = process.env.ALLOW_PLACEHOLDERS === '1';
  const references = collectReferences();

  const unknown: Reference[] = [];
  const placeholders: Reference[] = [];

  for (const reference of references) {
    const fact = (FACTS as Record<string, { status: string } | undefined>)[reference.id];
    if (!fact) {
      unknown.push(reference);
    } else if (fact.status === 'PLACEHOLDER') {
      placeholders.push(reference);
    }
  }

  // A fact claiming to be sourced but carrying no source is a silent lie.
  const unsourced = Object.values(FACTS).filter(
    (fact) => fact.status !== 'PLACEHOLDER' && fact.source === 'UNSOURCED',
  );

  const referencedIds = new Set(references.map((reference) => reference.id));
  const pending = Object.values(FACTS).filter(
    (fact) => fact.status === 'PLACEHOLDER' && !referencedIds.has(fact.id),
  );

  console.log(
    `check-facts: ${references.length} reference(s) across ${referencedIds.size} fact(s); ` +
      `${Object.keys(FACTS).length} fact(s) defined.`,
  );

  if (unknown.length > 0) {
    console.error('\nUnknown fact ids (not defined in content/facts.ts):');
    for (const reference of unknown) {
      console.error(`  ${reference.file}:${reference.line}  ${reference.id}`);
    }
  }

  if (unsourced.length > 0) {
    console.error('\nFacts marked verified/internal but still UNSOURCED:');
    for (const fact of unsourced) {
      console.error(`  ${fact.id}  (status: ${fact.status})`);
    }
  }

  if (placeholders.length > 0) {
    console.error('\nPLACEHOLDER facts referenced by the app:');
    for (const reference of placeholders) {
      console.error(`  ${reference.file}:${reference.line}  ${reference.id}`);
    }
    console.error(
      '\nSupply real values in content/facts.ts with a source, or remove the reference.',
    );
  }

  if (pending.length > 0) {
    console.log(`\n${pending.length} placeholder fact(s) defined but not yet referenced.`);
  }

  const failures = unknown.length + unsourced.length + placeholders.length;
  if (failures === 0) {
    console.log('\ncheck-facts: pass.');
    return;
  }

  if (allowed) {
    console.warn(
      `\ncheck-facts: ${failures} problem(s) found, but ALLOW_PLACEHOLDERS=1 is set — continuing.`,
    );
    console.warn('Do not deploy this build.');
    return;
  }

  console.error(
    `\ncheck-facts: FAILED with ${failures} problem(s). ` +
      'Set ALLOW_PLACEHOLDERS=1 to build anyway (local only).',
  );
  process.exit(1);
}

main();
