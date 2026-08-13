/**
 * Keyboard walkthrough of the two conversion forms and the mobile menu.
 *
 * Drives real key events — no clicking — and reports what focus actually did.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

const describe = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return 'body (nothing focused)';
    const name =
      el.getAttribute('aria-label') ||
      (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim()) ||
      el.textContent?.trim().slice(0, 34) ||
      el.getAttribute('name') ||
      '';
    const style = getComputedStyle(el);
    return `${el.tagName.toLowerCase()}${el.type ? `[${el.type}]` : ''} "${name}"  outline:${style.outlineWidth} ${style.outlineColor}`;
  });

async function tabThrough(page, steps) {
  const seen = [];
  for (let i = 0; i < steps; i += 1) {
    await page.keyboard.press('Tab');
    seen.push(await describe(page));
  }
  return seen;
}

// ---------------------------------------------------------------------------
// 1. Mobile menu
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  console.log('\n================ MOBILE MENU (390px)');

  console.log('\n-- Tab from page load');
  for (const step of await tabThrough(page, 3)) console.log('  ', step);

  // Reach the toggle and open it with Enter.
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const opened = await page.locator('#site-menu').count();
  console.log('\n-- Enter on the toggle');
  console.log('   menu opened:', opened > 0);
  console.log('   focus now  :', await describe(page));
  console.log('   aria-expanded:', await page.getAttribute('button[aria-controls=site-menu]', 'aria-expanded'));
  console.log('   body scroll locked:', await page.evaluate(() => getComputedStyle(document.body).overflow));

  console.log('\n-- Tab inside the overlay (focus trap)');
  const inside = await tabThrough(page, 9);
  for (const step of inside) console.log('  ', step);
  const escaped = await page.evaluate(() => !document.querySelector('#site-menu')?.contains(document.activeElement));
  console.log('   focus escaped the dialog:', escaped);

  console.log('\n-- Shift+Tab wraps backwards');
  await page.keyboard.press('Shift+Tab');
  console.log('  ', await describe(page));

  console.log('\n-- Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  console.log('   menu closed:', (await page.locator('#site-menu').count()) === 0);
  console.log('   focus returned to:', await describe(page));
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 2. Skip link
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  console.log('\n================ SKIP LINK');
  await page.keyboard.press('Tab');
  console.log('   first tab stop:', await describe(page));
  const visible = await page.evaluate(() => {
    const el = document.activeElement;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top >= 0;
  });
  console.log('   visible when focused:', visible);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  console.log('   after Enter, focus:', await describe(page));
  console.log('   url hash:', new URL(page.url()).hash);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 3. Pilot form, keyboard only
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/pilot`, { waitUntil: 'networkidle' });
  console.log('\n================ PILOT FORM (keyboard only)');

  await page.locator('#company').focus();
  console.log('\n-- Tab order from the first field');
  console.log('   ', await describe(page));
  for (const step of await tabThrough(page, 6)) console.log('  ', step);

  console.log('\n-- Progressive disclosure with the keyboard');
  await page.locator('summary').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  console.log('   details open:', await page.locator('details').getAttribute('open') !== null);
  console.log('   next tab stop:', (await tabThrough(page, 1))[0]);

  console.log('\n-- Consent checkbox with Space');
  await page.locator('#consent').focus();
  await page.keyboard.press('Space');
  console.log('   checked:', await page.isChecked('#consent'));

  console.log('\n-- Submit an empty-ish form with Enter, and where focus lands');
  await page.locator('#consent').press('Space'); // uncheck
  await page.waitForTimeout(3400);
  await page.locator('button[type=submit]').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(700);
  console.log('   focus moved to:', await describe(page));
  console.log('   errors announced (role=alert):', await page.locator('p[role=alert]').count());
  console.log('   first field aria-invalid:', await page.getAttribute('#company', 'aria-invalid'));
  console.log('   error linked by aria-describedby:', await page.getAttribute('#company', 'aria-describedby'));

  console.log('\n-- Complete and submit, keyboard only');
  await page.locator('#company').focus();
  await page.keyboard.type('Seoudi Supermarket');
  await page.keyboard.press('Tab');
  await page.keyboard.type('operations@seoudi.example');
  await page.keyboard.press('Tab');
  await page.keyboard.type('38');
  await page.locator('#consent').focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(3400);
  await page.locator('button[type=submit]').focus();
  await Promise.all([page.waitForURL(/received/), page.keyboard.press('Enter')]);
  console.log('   url:', page.url());
  console.log('   status region text:', (await page.locator('[role=status]').first().textContent())?.trim().slice(0, 60));
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 4. Data room form, keyboard only
// ---------------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/investors/data-room`, { waitUntil: 'networkidle' });
  console.log('\n================ DATA ROOM FORM (keyboard only)');

  await page.locator('#name').focus();
  console.log('\n-- Tab order');
  console.log('   ', await describe(page));
  for (const step of await tabThrough(page, 9)) console.log('  ', step);

  console.log('\n-- Select with the keyboard');
  await page.locator('#investorType').focus();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  console.log('   value after ArrowDown:', await page.inputValue('#investorType'));

  console.log('\n-- Declaration and consent are separate stops');
  await page.locator('#declaration').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  console.log('   after declaration, Tab lands on:', await describe(page));
  await ctx.close();
}

await browser.close();
