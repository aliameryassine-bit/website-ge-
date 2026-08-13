/**
 * Does the Content Security Policy break anything?
 *
 * Loads the real pages with the real headers and records every CSP violation
 * the browser reports, then checks that the things most likely to be blocked —
 * the analytics beacon, the Motion-driven menu, the CSS keyframe entrances and
 * the form POST — still actually work.
 */
import { chromium, devices } from 'playwright';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const violations = [];

function watch(page, label) {
  page.on('console', (message) => {
    const text = message.text();
    if (/Content Security Policy|Refused to/i.test(text)) {
      violations.push(`[${label}] ${text.slice(0, 180)}`);
    }
  });
  page.on('pageerror', (error) => violations.push(`[${label}] pageerror: ${String(error).slice(0, 140)}`));
}

// 1. Every route loads clean
for (const route of ['/', '/technology', '/for-retailers', '/impact', '/investors', '/pilot', '/ar']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  watch(page, route);
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);
  await ctx.close();
}

// 2. Analytics: the proxied script must load and the beacon must be allowed
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  watch(page, 'analytics');
  const beacons = [];
  page.on('request', (r) => {
    if (r.url().includes('/stats/')) beacons.push(`${r.method()} ${new URL(r.url()).pathname}`);
  });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('a', { hasText: 'I run retail stores' }).first().click();
  await page.waitForTimeout(1200);
  console.log('\nANALYTICS');
  console.log('  /stats requests made:', beacons.length ? beacons : 'NONE');
  console.log('  window.plausible defined:', await page.evaluate(() => typeof window.plausible));
  await ctx.close();
}

// 3. Motion: the mobile menu animates through the Motion library
{
  const ctx = await browser.newContext({ ...devices['Galaxy S9+'] });
  const page = await ctx.newPage();
  watch(page, 'motion');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('button[aria-controls=site-menu]').click();
  await page.waitForTimeout(700);
  const open = await page.locator('#site-menu').count();
  const opacity = await page
    .locator('#site-menu')
    .evaluate((el) => getComputedStyle(el).opacity)
    .catch(() => 'n/a');
  console.log('\nMOTION (mobile menu)');
  console.log('  overlay rendered:', open > 0);
  console.log('  animated to opacity:', opacity);
  await ctx.close();
}

// 4. CSS keyframe entrance: the hero's inline --hero-delay custom property
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  watch(page, 'hero');
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const hero = await page.evaluate(() => {
    const el = document.querySelector('[data-hero-enter]');
    if (!el) return null;
    const s = getComputedStyle(el);
    return { animationName: s.animationName, opacity: s.opacity, delay: s.animationDelay };
  });
  console.log('\nHERO ENTRANCE (CSS keyframes + inline custom property)');
  console.log(' ', JSON.stringify(hero));
  await ctx.close();
}

// 5. Form submission: form-action 'self' must not block the server action POST
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'x-forwarded-for': '203.0.113.200' },
  });
  const page = await ctx.newPage();
  watch(page, 'form');
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  await page.fill('#company', 'CSP Test Chain');
  await page.fill('#email', 'ops@csptest.example');
  await page.fill('#stores', '9');
  await page.check('#consent');
  await page.waitForTimeout(3400);
  const posts = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') posts.push(new URL(r.url()).pathname);
  });
  await page.click('button[type=submit]');
  await page.waitForTimeout(2500);
  console.log('\nFORM SUBMISSION');
  console.log('  POST allowed:', posts.length > 0 ? posts : 'BLOCKED OR NONE');
  console.log('  ended at:', new URL(page.url()).pathname);
  await ctx.close();
}

console.log(`\nCSP VIOLATIONS: ${violations.length}`);
for (const v of violations.slice(0, 20)) console.log('  ' + v);

await browser.close();
