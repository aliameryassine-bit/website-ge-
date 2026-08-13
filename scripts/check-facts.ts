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
 * Commit mode:    npm run check:facts -- --commit
 *
 * Note: `next dev` does not run prebuild, so local dev is never blocked by
 * this check. The escape hatch is for running a production build locally
 * while figures are still outstanding.
 *
 * Two severities, because they are different kinds of problem:
 *
 * - An unknown id, or a fact claiming verified/internal status while still
 *   UNSOURCED, is a MISTAKE. It fails in every mode, including commits.
 * - A referenced PLACEHOLDER is an intentional interim state — the footer's
 *   registration details are placeholders precisely because nobody has
 *   supplied them yet. That must block a DEPLOY, not a commit, so `--commit`
 *   reports them without failing. Blocking commits on them would only teach
 *   everyone to pass --no-verify.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { FACTS } from '../content/facts.ts';

const ROOT = join(import.meta.dirname, '..');
const SCAN_DIRS = ['app', 'components', 'content', 'lib', 'src', 'pages'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mdx'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build']);

/**
 * Files that define or catalogue the system rather than ship it to a buyer.
 *
 * The styleguide is exempt on purpose: it is a noindex internal reference whose
 * job includes demonstrating the placeholder state of the Fact and Callout
 * primitives. Nothing else is exempt — every public surface is gated.
 */
const SKIP_FILES = new Set([
  'content/facts.ts',
  'src/components/ui/Fact.tsx',
  'src/components/ui/Callout.tsx',
  'src/app/styleguide/page.tsx',
]);

/**
 * Explicit call shapes. These also surface UNKNOWN ids, because writing
 * getFact('typo') is a mistake worth reporting even though tsc catches it.
 */
const REFERENCE_PATTERNS: RegExp[] = [
  /<Fact\b[^>]*?\bid\s*=\s*["'`]([^"'`]+)["'`]/gs,
  /\bgetFact\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /\bFACTS\[\s*["'`]([^"'`]+)["'`]\s*\]/g,
];

/**
 * Any quoted string that IS a known fact id also counts as a reference.
 *
 * Without this the gate has a hole wide enough to drive the footer through:
 * it collects its ids in a `FactId[]` array and reads `FACTS[id]` with a
 * computed key, so no call-shape pattern matches and placeholder registration
 * details sail into a production build. TypeScript validates that the id
 * exists; only this check knows whether it has a real value yet.
 *
 * Conservative by construction — it matches against the actual key list, so a
 * string only counts if it is genuinely a fact id.
 */
const QUOTED_STRING = /["'`]([a-z0-9][a-z0-9-]*)["'`]/g;

type Reference = { id: string; file: string; line: number };

const KNOWN_IDS = new Set(Object.keys(FACTS));

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
      const seen = new Set<string>();

      for (const pattern of REFERENCE_PATTERNS) {
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = pattern.exec(source)) !== null) {
          const id = match[1];
          if (!id) continue;
          const line = lineOf(source, match.index);
          seen.add(`${id}:${line}`);
          references.push({ id, file: relativePath, line });
        }
      }

      // Bare id literals — arrays, maps, config objects.
      QUOTED_STRING.lastIndex = 0;
      let quoted: RegExpExecArray | null;
      while ((quoted = QUOTED_STRING.exec(source)) !== null) {
        const id = quoted[1];
        if (!id || !KNOWN_IDS.has(id)) continue;
        const line = lineOf(source, quoted.index);
        if (seen.has(`${id}:${line}`)) continue;
        references.push({ id, file: relativePath, line });
      }
    }
  }

  return references;
}

function main(): void {
  const allowed = process.env.ALLOW_PLACEHOLDERS === '1';
  /** Commit mode: mistakes still fail, intentional placeholders do not. */
  const commitMode = process.argv.includes('--commit');
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
    const report = commitMode ? console.log : console.error;
    report('\nPLACEHOLDER facts referenced by the app:');
    for (const reference of placeholders) {
      report(`  ${reference.file}:${reference.line}  ${reference.id}`);
    }
    report(
      commitMode
        ? '\nThese block a production build, not this commit. Supply real values before deploying.'
        : '\nSupply real values in content/facts.ts with a source, or remove the reference.',
    );
  }

  if (pending.length > 0) {
    console.log(`\n${pending.length} placeholder fact(s) defined but not yet referenced.`);
  }

  // Mistakes always fail. Referenced placeholders fail everywhere except commits.
  const mistakes = unknown.length + unsourced.length;
  const failures = commitMode ? mistakes : mistakes + placeholders.length;

  if (failures === 0) {
    console.log(`\ncheck-facts: pass${commitMode ? ' (commit mode)' : ''}.`);
    return;
  }

  if (allowed && !commitMode) {
    console.warn(
      `\ncheck-facts: ${failures} problem(s) found, but ALLOW_PLACEHOLDERS=1 is set — continuing.`,
    );
    console.warn('Do not deploy this build.');
    return;
  }

  console.error(
    `\ncheck-facts: FAILED with ${failures} problem(s).` +
      (commitMode
        ? ' Unknown ids and unsourced claims are never allowed, in any mode.'
        : ' Set ALLOW_PLACEHOLDERS=1 to build anyway (local only).'),
  );
  process.exit(1);
}

main();
