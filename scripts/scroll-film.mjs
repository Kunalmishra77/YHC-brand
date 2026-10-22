// Dev helper: scroll a page with the mouse wheel (so Lenis + scroll films play) and save a viewport
// screenshot every step. Usage: node scripts/scroll-film.mjs <outDir> [path=/] (env W,H,STEP,BASE)
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [out, path = '/'] = process.argv.slice(2);
const W = Number(process.env.W ?? 1440);
const H = Number(process.env.H ?? 900);
const STEP = Number(process.env.STEP ?? 700);
const base = process.env.BASE ?? 'http://localhost:3000';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
await page.goto(base + path, { waitUntil: 'load', timeout: 180000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/000.jpg`, type: 'jpeg', quality: 70 });
let i = 1;
for (;;) {
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, STEP);
  await page.waitForTimeout(1300);
  const after = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${out}/${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 70 });
  i++;
  if (after - before < 5 || i > 90) break;
}
console.log('shots', i, 'errors', JSON.stringify(errors));
await browser.close();
