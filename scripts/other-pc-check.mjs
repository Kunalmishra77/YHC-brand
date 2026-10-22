// Dev helper: load the live homepage the way a different PC might (no GPU, animations off, slow net).
import { chromium } from '@playwright/test';
const out = process.argv[2];
const base = process.env.BASE ?? 'https://yourhaircompany.com';
const CASES = [
  ['nogpu', { args: ['--disable-gpu', '--disable-gpu-compositing'] }, {}],
  ['reduced', {}, { reducedMotion: 'reduce' }],
  ['slow', {}, {}, true],
  ['laptop1366', {}, { viewport: { width: 1366, height: 768 } }],
];
for (const [name, launch, ctxOpts, slow] of CASES) {
  const b = await chromium.launch({ channel: 'msedge', ...launch });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 940 }, ...ctxOpts });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 140)); });
  if (slow) {
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 300, downloadThroughput: 1.5e6 / 8, uploadThroughput: 0.75e6 / 8 });
  }
  const t0 = Date.now();
  await p.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await p.waitForTimeout(slow ? 6000 : 3000);
  await p.screenshot({ path: `${out}/${name}_a.jpg`, type: 'jpeg', quality: 70 });
  await p.waitForTimeout(slow ? 12000 : 3000);
  await p.screenshot({ path: `${out}/${name}_b.jpg`, type: 'jpeg', quality: 70 });
  const info = await p.evaluate(() => {
    const vis = (el) => el && el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
    const h1 = [...document.querySelectorAll('h1')].find(vis);
    const op = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o.toFixed(2); };
    const v = [...document.querySelectorAll('#home-hero video')].find(vis);
    return { h1: h1?.textContent?.slice(0, 30), h1Opacity: h1 ? op(h1) : 'none', video: v ? { paused: v.paused, ready: v.readyState, err: v.error?.code ?? null } : 'none' };
  });
  console.log(name, `${Date.now() - t0}ms`, JSON.stringify(info), JSON.stringify(errs.slice(0, 4)));
  await b.close();
}
