// Dev helper: study the showcase templates — viewport screenshots while scrolling + detected libraries.
// Usage: node scripts/study-templates.mjs <outDir> [name …]   (env BASE, default the live showcase)
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const out = process.argv[2];
const base = process.env.BASE ?? 'https://showcase-build-tau.vercel.app';
const all = ['perfume', 'drift', 'moana', 'travel', 'aurelle', 'vara', 'cairnline', 'saffron', 'kanak', 'halden', 'zipev', 'aurelune', 'dewlab', 'irontemple', 'marigold', 'meridian', 'melt'];
const names = process.argv.slice(3).length ? process.argv.slice(3) : all;
const browser = await chromium.launch({ channel: 'msedge' });
for (const name of names) {
  const dir = `${out}/${name}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const scripts = new Set();
  page.on('request', (r) => { if (r.resourceType() === 'script') scripts.add(r.url()); });
  try {
    await page.goto(`${base}/${name}/`, { waitUntil: 'load', timeout: 120000 });
  } catch (e) { console.log(name, 'load failed', e.message.slice(0, 80)); await ctx.close(); continue; }
  await page.waitForTimeout(4000); // preloaders
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const libs = await page.evaluate(() => ({
    gsap: Boolean(window.gsap), lenis: Boolean(document.documentElement.className.match(/lenis/)) || Boolean(window.lenis),
    three: Boolean(window.THREE) || Boolean(document.querySelector('canvas')), canvas: document.querySelectorAll('canvas').length,
    video: document.querySelectorAll('video').length, sections: document.querySelectorAll('section').length,
    title: document.title,
  }));
  let i = 0;
  const step = 900;
  for (let y = 0; y < Math.min(total, 30000) && i < 22; y += step) {
    await page.mouse.wheel(0, step);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${dir}/${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 60 });
    i++;
  }
  const scrolledTotal = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(JSON.stringify({ name, height: scrolledTotal, shots: i, ...libs, scriptHints: [...scripts].map((s) => s.split('/').pop()).filter((s) => /gsap|lenis|three|scroll|motion|spline|lottie/i.test(s)).slice(0, 6) }));
  await ctx.close();
}
await browser.close();
