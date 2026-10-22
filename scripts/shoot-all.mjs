// Dev helper: full-page screenshots of every public page at desktop (1440) and phone (390) for visual QA.
// Scrolls each page first so lazy images load. Usage: node scripts/shoot-all.mjs <outDir>  (env BASE)
import { chromium } from '@playwright/test';

const out = process.argv[2] ?? '.';
const base = process.env.BASE ?? 'http://localhost:3000';
const PAGES = [
  '/', '/science', '/how-it-works', '/plans', '/products', '/products/hair-regrowth-solution',
  '/products/hair-nourishing-tablets', '/products/hair-regrowth-capsules', '/concerns', '/concerns/hair-fall',
  '/concerns/crown-thinning', '/results', '/stories', '/guarantee', '/doctor-tyagi', '/about', '/faqs',
  '/contact', '/blog', '/start', '/cart', '/not-a-page',
];
const browser = await chromium.launch({ channel: 'msedge' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: 'load', timeout: 180000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((t) => window.scrollTo(0, t), y);
      await page.waitForTimeout(250);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    const name = `${w}${p === '/' ? '_home' : p.replace(/\//g, '_')}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
    console.log('shot', name);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
