// Dev helper: capture a long page as viewport-sized segments (avoids Chromium's ~16k px full-page limit).
// Usage: node scripts/segments.mjs <outDir> <path> [role]   env: W, H (segment height), BASE, WAIT
import { chromium } from '@playwright/test';

const [outDir, path = '/', role] = process.argv.slice(2);
const width = Number(process.env.W ?? 1440);
const height = Number(process.env.H ?? 1600);
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext({ viewport: { width, height } });
if (role) await context.addCookies([{ name: 'yhc_demo_role', value: role, url: base }]);
const page = await context.newPage();
await page.goto(base + path, { waitUntil: process.env.WAIT ?? 'load', timeout: 120000 });
const total = await page.evaluate(() => document.documentElement.scrollHeight);
console.log('page height', total);
let i = 0;
for (let y = 0; y < total; y += height) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(900);
  const name = `${outDir}/seg-${width}-${String(i).padStart(2, '0')}.png`;
  await page.screenshot({ path: name });
  i++;
}
console.log('segments', i);
await browser.close();
