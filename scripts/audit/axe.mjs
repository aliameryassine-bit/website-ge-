import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'http://localhost:3000';
const ROUTES = [
  '/', '/technology', '/for-retailers', '/impact', '/investors',
  '/pilot', '/investors/data-room', '/company',
  '/legal/privacy', '/legal/cookies', '/legal/terms', '/legal/investor-disclaimer',
  '/pilot/received?ref=GX-P-7K4MQ', '/investors/data-room/received?ref=GX-D-M2X9T',
  '/styleguide',
  '/ar', '/ar/for-retailers', '/ar/impact',
  '/ro', '/ro/investors',
];

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
];

let totalViolations = 0;
const all = [];

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    for (const v of results.violations) {
      totalViolations += v.nodes.length;
      all.push({ route, viewport: viewport.name, id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, target: v.nodes[0]?.target?.join(' ') , html: v.nodes[0]?.html?.slice(0,120) });
    }
    await ctx.close();
  }
}

if (all.length === 0) {
  console.log(`\naxe: 0 violations across ${ROUTES.length} routes x ${VIEWPORTS.length} viewports.`);
} else {
  console.log(`\naxe: ${totalViolations} violating node(s), ${all.length} finding(s)\n`);
  const byRule = new Map();
  for (const f of all) {
    const key = `${f.id} (${f.impact})`;
    const list = byRule.get(key) ?? [];
    list.push(f);
    byRule.set(key, list);
  }
  for (const [rule, findings] of [...byRule.entries()].sort()) {
    console.log(`\n### ${rule} — ${findings.length} occurrence(s)`);
    console.log(`  ${findings[0].help}`);
    console.log(`  example: ${findings[0].target}`);
    console.log(`  html:    ${findings[0].html}`);
    console.log(`  routes:  ${[...new Set(findings.map(f => `${f.route}[${f.viewport}]`))].slice(0,8).join(', ')}`);
  }
}
await browser.close();
