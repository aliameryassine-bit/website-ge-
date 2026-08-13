/**
 * Per-route transfer weight, measured from the browser against `next start`.
 *
 * Turbopack does not emit app-build-manifest.json, and a manifest would only
 * describe what is declared rather than what is fetched. This records every
 * response the browser actually takes for a cold load of each route, which is
 * the number that decides the Lighthouse score.
 */
import { chromium } from 'playwright';
import { gzipSync } from 'node:zlib';

const BASE = 'http://localhost:3000';
const ROUTES = [
  '/',
  '/technology',
  '/for-retailers',
  '/impact',
  '/investors',
  '/pilot',
  '/investors/data-room',
  '/ar',
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const kb = (bytes) => (bytes / 1024).toFixed(1);
const byChunk = new Map();
const rows = [];

for (const route of ROUTES) {
  // A fresh context per route so nothing is served from a warm cache.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const seen = new Map();

  page.on('response', async (response) => {
    const url = response.url();
    if (!url.startsWith(BASE)) return;
    try {
      /*
        `next start` gzips but sends no content-length, so Playwright reports the
        DECOMPRESSED length. Gzipping the body here gives the figure that
        actually crosses the wire — the first pass overstated JS by ~4x.
      */
      const raw = await response.body().catch(() => Buffer.alloc(0));
      const body = raw.length ? gzipSync(raw).length : 0;
      const type = url.includes('/_next/static/chunks/')
        ? 'js'
        : url.match(/\.(woff2|woff|ttf)/)
          ? 'font'
          : url.match(/\.css/)
            ? 'css'
            : url.includes('/_next/')
              ? 'js'
              : 'doc';
      seen.set(url, { type, size: body });
      if (type === 'js') {
        const name = url.split('/').pop();
        byChunk.set(name, Math.max(byChunk.get(name) ?? 0, body));
      }
    } catch {
      /* response body unavailable; ignore */
    }
  });

  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(400);

  const totals = { js: 0, css: 0, font: 0, doc: 0 };
  for (const { type, size } of seen.values()) totals[type] += size;
  rows.push({ route, ...totals, total: Object.values(totals).reduce((a, b) => a + b, 0) });
  await ctx.close();
}

console.log('\nTRANSFERRED PER ROUTE, cold load at 390px (bytes over the wire)\n');
console.log('  ' + 'route'.padEnd(26) + '     JS      CSS     font      doc     TOTAL');
for (const r of rows.sort((a, b) => b.total - a.total)) {
  console.log(
    `  ${r.route.padEnd(26)}${kb(r.js).padStart(7)}  ${kb(r.css).padStart(7)}  ${kb(r.font).padStart(7)}  ${kb(r.doc).padStart(7)}  ${kb(r.total).padStart(8)} KB`,
  );
}

console.log('\nLARGEST JS CHUNKS SEEN\n');
for (const [name, size] of [...byChunk.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`  ${kb(size).padStart(8)} KB  ${name}`);
}

await browser.close();
