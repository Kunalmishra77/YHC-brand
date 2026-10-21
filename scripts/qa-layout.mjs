// Dev helper: layout QA - no sideways scroll, no text under 12 px, no console errors - on 10 key pages
// at 5 widths (1536/1024/768/390/360). Needs the app on http://localhost:3000. Usage: node scripts/qa-layout.mjs
import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'msedge' });
for (const [w, h] of [[1536, 864], [1024, 768], [768, 1024], [390, 844], [360, 740]]) {
  for (const p of ['/', '/science', '/products/hair-regrowth-solution', '/concerns/hair-fall', '/start', '/how-it-works', '/plans', '/results', '/about', '/blog']) {
    const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 100)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 100)));
    await page.goto('http://localhost:3000' + p, { waitUntil: 'load', timeout: 300000 });
    for (let y = 0; y < 16000; y += 900) { await page.evaluate((t) => window.scrollTo(0, t), y); await page.waitForTimeout(30); }
    const r = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, small: [...document.querySelectorAll('body *')].filter((el) => { const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && !el.closest('[aria-hidden="true"]') && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(s.fontSize) < 12; }).length }));
    if (r.overflow || r.small || errors.length || p === '/') console.log(w, p, JSON.stringify({ ...r, errors: errors.slice(0, 2) }));
    await page.close();
  }
}
await browser.close();
