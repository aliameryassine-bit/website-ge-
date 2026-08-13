import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});

for (const route of ['/', '/ar']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const fonts = [];
  page.on('response', async (r) => {
    if (!/\.(woff2|woff|ttf)$/.test(new URL(r.url()).pathname)) return;
    const body = await r.body().catch(() => Buffer.alloc(0));
    fonts.push({ url: r.url().split('/').pop(), size: body.length });
  });
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(600);

  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`),
  );
  const preloads = await page.evaluate(() =>
    [...document.querySelectorAll('link[rel=preload][as=font]')].map((l) =>
      l.getAttribute('href').split('/').pop(),
    ),
  );

  console.log(`\n=== ${route}`);
  console.log('  preloaded:', preloads);
  console.log('  used by the page:', [...new Set(loaded)]);
  let total = 0;
  for (const f of fonts.sort((a, b) => b.size - a.size)) {
    total += f.size;
    console.log(`    ${(f.size / 1024).toFixed(1).padStart(7)} KB  ${f.url}`);
  }
  console.log(`  TOTAL ${(total / 1024).toFixed(1)} KB across ${fonts.length} files`);
  await ctx.close();
}

await browser.close();
