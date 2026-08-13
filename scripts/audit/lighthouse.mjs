/**
 * Lighthouse, mobile preset, simulated 4G.
 *
 * Runs against `next start` on localhost. Localhost removes real network
 * latency, but Lighthouse's mobile preset applies SIMULATED throttling on top
 * of the recorded trace (1.6 Mbps down, 150 ms RTT, 4x CPU slowdown), so the
 * reported metrics are modelled for a mid-tier phone on 4G rather than for this
 * machine.
 */
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/for-retailers', '/impact', '/ar'];

const chrome = await launch({
  chromePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage'],
});

const results = [];

const RUNS = Number(process.env.LH_RUNS ?? 3);
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

for (const route of ROUTES) {
  /*
    Lighthouse's simulated metrics move by 10-20% run to run on the same build,
    so a single number is not evidence. Every figure below is the median of
    RUNS full runs.
  */
  const runs = [];
  for (let i = 0; i < RUNS; i += 1) {
    const { lhr } = await lighthouse(
      `${BASE}${route}`,
      { port: chrome.port, output: 'json', logLevel: 'error' },
      undefined,
    );
    runs.push(lhr);
  }
  const pick = (fn) => median(runs.map(fn));
  const spread = (fn) => {
    const v = runs.map(fn).sort((a, b) => a - b);
    return `${(v[0] / 1000).toFixed(2)}–${(v[v.length - 1] / 1000).toFixed(2)}s`;
  };
  const lhr = runs[runs.length - 1];
  const audit = (id) => lhr.audits[id];
  const row = {
    route,
    performance: Math.round(pick((r) => r.categories.performance.score) * 100),
    accessibility: Math.round(pick((r) => r.categories.accessibility.score) * 100),
    bestPractices: Math.round(pick((r) => r.categories['best-practices'].score) * 100),
    seo: Math.round(pick((r) => r.categories.seo.score) * 100),
    LCP: pick((r) => r.audits['largest-contentful-paint'].numericValue),
    CLS: pick((r) => r.audits['cumulative-layout-shift'].numericValue),
    TBT: pick((r) => r.audits['total-blocking-time'].numericValue),
    FCP: pick((r) => r.audits['first-contentful-paint'].numericValue),
    SI: pick((r) => r.audits['speed-index'].numericValue),
    lcpElement: audit('largest-contentful-paint-element')?.details?.items?.[0]?.items?.[0]?.node
      ?.snippet,
    opportunities: Object.values(lhr.audits)
      .filter((a) => a.details?.type === 'opportunity' && a.numericValue > 100)
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 5)
      .map((a) => `${a.title}: ${Math.round(a.numericValue)}ms`),
  };
  results.push(row);

  console.log(`\n=== ${route}`);
  console.log(
    `  perf ${row.performance}  a11y ${row.accessibility}  bp ${row.bestPractices}  seo ${row.seo}`,
  );
  console.log(
    `  LCP ${(row.LCP / 1000).toFixed(2)}s   CLS ${row.CLS.toFixed(4)}   TBT ${Math.round(row.TBT)}ms   FCP ${(row.FCP / 1000).toFixed(2)}s   SI ${(row.SI / 1000).toFixed(2)}s`,
  );
  console.log(
    `  across ${RUNS} runs — LCP ${spread((r) => r.audits['largest-contentful-paint'].numericValue)}, ` +
      `FCP ${spread((r) => r.audits['first-contentful-paint'].numericValue)}, ` +
      `perf ${runs.map((r) => Math.round(r.categories.performance.score * 100)).sort((a, b) => a - b).join('/')}`,
  );
  if (row.opportunities.length) console.log(`  top opportunities: ${row.opportunities.join(' | ')}`);
}

writeFileSync(
  '/tmp/claude-0/-home-user-website-ge-/0923c2cc-09db-5010-88f6-923341f0d254/scratchpad/lighthouse.json',
  JSON.stringify(results, null, 2),
);

console.log('\n--- TARGETS: perf >= 90, LCP < 2.5s, CLS < 0.05, TBT < 200ms');
for (const r of results) {
  const fails = [];
  if (r.performance < 90) fails.push(`perf ${r.performance}`);
  if (r.LCP >= 2500) fails.push(`LCP ${(r.LCP / 1000).toFixed(2)}s`);
  if (r.CLS >= 0.05) fails.push(`CLS ${r.CLS.toFixed(4)}`);
  if (r.TBT >= 200) fails.push(`TBT ${Math.round(r.TBT)}ms`);
  console.log(`  ${r.route.padEnd(18)} ${fails.length ? 'MISS: ' + fails.join(', ') : 'all targets met'}`);
}

await chrome.kill();
