// Dev helper: full-page screenshots via the system Edge browser (no Playwright browser download).
// Usage: node scripts/screens.mjs <outDir> <role|-> <path> [path…]   (env W=width, H=height)
import { chromium } from '@playwright/test';

const [outDir, role, ...paths] = process.argv.slice(2);
const width = Number(process.env.W ?? 1440);
const height = Number(process.env.H ?? 900);
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
if (role && role !== '-') {
  const cookies = [{ name: 'yhc_demo_role', value: role, url: base }];
  if (role === 'customer') cookies.push({ name: 'yhc_demo_customer', value: 'cus-s0', url: base });
  await context.addCookies(cookies);
}
const page = await context.newPage();
for (const p of paths) {
  await page.goto(base + p, { waitUntil: 'networkidle', timeout: 120000 });
  // Scroll through so lazy images load, then return to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const name = `${width}${p.replace(/[^a-z0-9]+/gi, '_') || '_home'}.png`;
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: process.env.FULL !== '0' });
  console.log('shot', name);
}
await browser.close();
