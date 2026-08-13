/**
 * End-to-end check that each tracked event fires, with the right properties.
 *
 * Runs against `next start` with the mock Plausible endpoint, and reads the
 * events off the wire rather than trusting that a call was made.
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const LOG = process.argv[2];
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

let n = 0;
const ctx = async (options = {}) => {
  n += 1;
  return browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'x-forwarded-for': `198.51.${Math.floor(Math.random() * 250) + 1}.${n}` },
    ...options,
  });
};

function events() {
  try {
    return JSON.parse(readFileSync(LOG, 'utf8'))
      .filter((e) => e.url.includes('/api/event'))
      .map((e) => (typeof e.body === 'string' ? JSON.parse(e.body) : e.body));
  } catch {
    return [];
  }
}

const since = () => events().length;
const newSince = (mark) => events().slice(mark);

function report(title, fired) {
  console.log(`\n### ${title}`);
  if (fired.length === 0) {
    console.log('  NO EVENTS');
    return;
  }
  for (const e of fired) {
    const props = Object.keys(e.p ?? {}).length ? ` ${JSON.stringify(e.p)}` : '';
    console.log(`  ${e.n}${props}`);
  }
}

// 1. fork_selected
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const mark = since();
  await page.locator('a', { hasText: 'I run retail stores' }).first().click();
  await page.waitForTimeout(900);
  report('1. fork_selected — retail panel', newSince(mark));
  await c.close();
}

{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const mark = since();
  await page.locator('a', { hasText: 'I invest' }).first().click();
  await page.waitForTimeout(900);
  report('2. fork_selected — investor panel', newSince(mark));
  await c.close();
}

// 3. roi_calculator_used
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/for-retailers`, { waitUntil: 'networkidle' });
  const mark = since();
  // `#roi-stores`, not `#stores`: the pilot form is on this page too and owns
  // the plain id. Filling the wrong one fired pilot_form_started instead.
  await page.locator('#roi-stores').fill('120');
  await page.waitForTimeout(700);
  report('3. roi_calculator_used', newSince(mark));
  await c.close();
}

// 4 + 5. pilot_form_started, then pilot_form_submitted on delivery
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  const mark = since();
  await page.fill('#company', 'Seoudi Supermarket');
  await page.waitForTimeout(400);
  report('4. pilot_form_started', newSince(mark));

  await page.fill('#email', 'operations@seoudi.example');
  await page.fill('#stores', '38');
  await page.check('#consent');
  await page.waitForTimeout(3400);
  const mark2 = since();
  await Promise.all([page.waitForURL(/received/), page.click('button[type=submit]')]);
  await page.waitForTimeout(900);
  report('5. pilot_form_submitted (fired on the confirmation page)', newSince(mark2));
  await c.close();
}

// 6. data_room_access_requested
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/investors/data-room`, { waitUntil: 'networkidle' });
  for (const [k, v] of Object.entries({
    name: 'Layla Haddad',
    organisation: 'Nile Delta Ventures',
    role: 'Partner',
    country: 'Egypt',
    email: 'layla@ndv.example',
    linkedin: 'linkedin.com/in/layla-haddad',
  })) {
    await page.fill(`#${k}`, v);
  }
  await page.selectOption('#investorType', 'Venture capital');
  await page.check('#declaration');
  await page.check('#consent');
  await page.waitForTimeout(3400);
  const mark = since();
  await Promise.all([page.waitForURL(/received/), page.click('button[type=submit]')]);
  await page.waitForTimeout(900);
  report('6. data_room_access_requested', newSince(mark));
  await c.close();
}

// 7. technology_sequence_completed
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/technology`, { waitUntil: 'networkidle' });
  const mark = since();
  await page.mouse.move(640, 450);
  for (let i = 0; i < 60; i += 1) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(900);
  report('7. technology_sequence_completed (scrolled to the end)', newSince(mark));
  await c.close();
}

// 8. Nothing identifying anywhere in the payloads
{
  const all = events();
  const leaked = all.filter((e) => {
    const blob = JSON.stringify(e.p ?? {});
    return /@|Seoudi|Layla|Nile Delta|Haddad/i.test(blob);
  });
  console.log(`\n### 8. Privacy check across ${all.length} events`);
  console.log(`  payloads containing a name, email or company: ${leaked.length}`);
  console.log(`  distinct events seen: ${[...new Set(all.map((e) => e.n))].join(', ')}`);
}

await browser.close();
