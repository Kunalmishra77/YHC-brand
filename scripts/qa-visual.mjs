// Dev helper: visual QA on every public page.
// 1) Crop check — images whose frame shape differs a lot from the picture (object-fit: cover cuts > 45%).
// 2) Empty-band check — plain horizontal bands taller than 220 px in the full-page screenshot.
// Usage: node scripts/qa-visual.mjs <shotsDir>   (shots from scripts/shoot-all.mjs; app on BASE)
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const dir = process.argv[2];
const base = process.env.BASE ?? 'http://localhost:3000';
const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharp = createRequire(import.meta.url)(join(pnpmDir, readdirSync(pnpmDir).find((d) => d.startsWith('sharp@')), 'node_modules', 'sharp'));
const PAGES = [
  '/', '/science', '/how-it-works', '/plans', '/products', '/products/hair-regrowth-solution',
  '/products/hair-nourishing-tablets', '/products/hair-regrowth-capsules', '/concerns', '/concerns/hair-fall',
  '/concerns/crown-thinning', '/results', '/stories', '/guarantee', '/doctor-tyagi', '/about', '/faqs',
  '/contact', '/blog', '/start', '/cart',
];

const browser = await chromium.launch({ channel: 'msedge' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: 'load', timeout: 180000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 700) { await page.evaluate((t) => window.scrollTo(0, t), y); await page.waitForTimeout(150); }
    await page.waitForTimeout(800);
    const crops = await page.evaluate(() =>
      [...document.querySelectorAll('img')].flatMap((img) => {
        const r = img.getBoundingClientRect();
        if (r.width < 120 || r.height < 120 || !img.naturalWidth) return [];
        if (img.closest('[aria-hidden="true"]')) return [];
        const s = getComputedStyle(img);
        if (s.objectFit !== 'cover') return [];
        const frame = r.width / r.height;
        const pic = img.naturalWidth / img.naturalHeight;
        const kept = frame > pic ? pic / frame : frame / pic; // share of the picture still visible
        return kept < 0.55 ? [`${Math.round(kept * 100)}% kept · ${Math.round(r.width)}x${Math.round(r.height)} · ${decodeURIComponent(img.currentSrc).match(/media\/[^&?]+/)?.[0] ?? img.src.slice(0, 60)}`] : [];
      }),
    );
    for (const c of [...new Set(crops)]) console.log(`CROP  ${w} ${p}  ${c}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();

// Empty bands in the full-page shots
for (const file of readdirSync(dir).filter((f) => /^(1440|390)_.*\.png$/.test(f))) {
  const img = sharp(join(dir, file));
  const { width, height } = await img.metadata();
  const scale = 4;
  const { data, info } = await img.resize(Math.round(width / scale)).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  let run = 0;
  let start = 0;
  const bands = [];
  for (let y = 0; y < H; y++) {
    let min = 255;
    let max = 0;
    for (let x = Math.round(W * 0.04); x < W * 0.96; x++) {
      const v = data[y * W + x];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const plain = max - min < 14;
    if (plain) { if (!run) start = y; run++; }
    if (!plain || y === H - 1) {
      if (run * scale > 220) bands.push(`${start * scale}-${(start + run) * scale}px (${run * scale}px)`);
      run = 0;
    }
  }
  if (bands.length) console.log(`EMPTY ${file}  ${bands.join(', ')}`);
}
