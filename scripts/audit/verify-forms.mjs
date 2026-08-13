/** Re-verifies both conversion paths after the timing token moved to a cookie. */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

let n = 0;
const ctx = async () => {
  n += 1;
  return browser.newContext({
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'x-forwarded-for': `198.18.${Math.floor(Math.random() * 250) + 1}.${n}` },
  });
};

const PILOT = { company: 'Seoudi Supermarket', email: 'operations@seoudi.example', stores: '38' };

async function fill(page, values) {
  for (const [k, v] of Object.entries(values)) await page.fill(`#${k}`, v);
}

// 1. Cookie is set on the first HTML response, httpOnly.
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  const cookies = await c.cookies();
  const token = cookies.find((k) => k.name === 'gx_t');
  const hiddenField = await page.locator('input[name=gx_t]').count();
  console.log('\n### 1. Timing token');
  console.log('  cookie present :', Boolean(token));
  console.log('  httpOnly       :', token?.httpOnly);
  console.log('  sameSite       :', token?.sameSite);
  console.log('  signed         :', (token?.value ?? '').includes('.'));
  console.log('  hidden field in DOM (should be 0):', hiddenField);
  console.log('  readable from JS (should be false):',
    await page.evaluate(() => document.cookie.includes('gx_t')));
  await c.close();
}

// 2. Happy path still delivers and redirects.
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  await fill(page, PILOT);
  await page.check('#consent');
  await page.waitForTimeout(3400);
  await Promise.all([page.waitForURL(/\/pilot\/received/), page.click('button[type=submit]')]);
  console.log('\n### 2. Pilot happy path');
  console.log('  url      :', page.url());
  console.log('  reference:', await page.locator('[data-reference]').textContent());
  await c.close();
}

// 3. Too fast is still rejected.
{
  const c = await ctx();
  const page = await c.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  await fill(page, PILOT);
  await page.check('#consent');
  await page.click('button[type=submit]');
  await page.waitForTimeout(1500);
  console.log('\n### 3. Submitted immediately');
  console.log('  failure reason:', await page.getAttribute('[data-form-failure]', 'data-form-failure').catch(() => 'none'));
  await c.close();
}

// 4. Client-side validation still gates (schema is now lazily loaded).
{
  const c = await ctx();
  const page = await c.newPage();
  const posts = [];
  page.on('request', (r) => {
    if (r.method() === 'POST') posts.push(r.url());
  });
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3400);
  await page.click('button[type=submit]');
  await page.waitForTimeout(700);
  console.log('\n### 4. Empty submit with JS');
  console.log('  POST requests (should be 0):', posts.length);
  console.log('  errors shown:', (await page.locator('p[role=alert]').allTextContents()).length);
  await c.close();
}

// 5. No JavaScript still works end to end.
{
  const c = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    javaScriptEnabled: false,
    extraHTTPHeaders: { 'x-forwarded-for': '198.18.99.99' },
  });
  const page = await c.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'load' });
  await fill(page, { company: 'Kazyon (no-JS)', email: 'ops@kazyon.example', stores: '12' });
  await page.check('#consent');
  await page.waitForTimeout(3400);
  await page.click('button[type=submit]');
  await page.waitForTimeout(2000);
  console.log('\n### 5. No JavaScript');
  console.log('  url      :', page.url());
  console.log('  reference:', await page.locator('[data-reference]').textContent().catch(() => null));
  await c.close();
}

// 6. Data room path.
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
  await Promise.all([page.waitForURL(/data-room\/received/), page.click('button[type=submit]')]);
  console.log('\n### 6. Data room happy path');
  console.log('  url      :', page.url());
  console.log('  reference:', await page.locator('[data-reference]').textContent());
  await c.close();
}

await browser.close();
