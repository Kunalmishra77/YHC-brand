// Dev helper: end-to-end walk of the patient journey (details → OTP → scan → health form → hold → refresh →
// pay → portal) plus access-gate, redirect, 404 and header checks. Usage: node scripts/e2e-journey.mjs <outDir>
// env BASE (default http://localhost:3000). Demo data only — uses random test numbers, the demo OTP and demo payment.
import { chromium } from '@playwright/test';
const out = process.argv[2];
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const log = (...a) => console.log(...a);
const shot = async (n) => { await page.waitForTimeout(700); await page.screenshot({ path: `${out}/e-${n}.png`, fullPage: true }); log('shot', n, page.url()); };
await page.goto(base + '/', { waitUntil: 'load', timeout: 120000 });
const form = page.locator('form').filter({ hasText: 'Begin my 3D scan' }).first();
await form.getByLabel(/^(Your name|Full name)$/).fill('Test Patient');
await form.getByLabel('Mobile number').fill('97' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0'));
await form.getByRole('checkbox').click();
await form.getByRole('button', { name: /Begin my 3D scan/ }).click();
await page.waitForTimeout(2500);
const otp = page.locator('input[autocomplete="one-time-code"], input[inputmode="numeric"][maxlength="1"]');
if ((await otp.count()) >= 6) for (let i = 0; i < 6; i++) await otp.nth(i).fill('123456'[i]); else await otp.first().fill('123456');
const verify = page.getByRole('button', { name: /verify|continue|start/i }).first();
if (await verify.isVisible().catch(() => false)) await verify.click();
await page.waitForURL(/\/start\/scan/, { timeout: 60000 });
const startBtn = page.getByRole('button', { name: /start my scan/i });
if (await startBtn.isVisible().catch(() => false)) await startBtn.click();
for (let q = 0; q < 4; q++) { const o = page.locator('main [role="radio"]').first(); if (!(await o.isVisible().catch(() => false))) break; await o.click(); await page.waitForTimeout(600); }
const photo = 'public/images/concept/texture-tablets.webp';
for (let z = 0; z < 7; z++) {
  const skip = page.getByRole('button', { name: /skip for now/i });
  if ((z === 2 || z === 5) && (await skip.isVisible().catch(() => false))) await skip.click();
  else {
    await page.getByRole('button', { name: /^(scan|retake) /i }).click(); await page.waitForTimeout(700);
    await page.locator('input[type="file"]').setInputFiles(photo); await page.waitForTimeout(1300);
    await page.getByRole('button', { name: /^done$/i }).click(); await page.waitForTimeout(400);
    await page.getByRole('button', { name: /^(next|analyse my scan)/i }).click();
  }
  await page.waitForTimeout(600);
}
await page.waitForURL(/\/start\/assessment/, { timeout: 60000 });
await page.getByText(/loading your assessment/i).waitFor({ state: 'detached', timeout: 60000 }).catch(() => {});
await page.getByRole('link', { name: /continue to your health form/i }).first().click();
await page.waitForURL(/\/start\/details/, { timeout: 60000 });
await page.getByLabel('Age').fill('34');
await page.getByRole('radio', { name: 'Male' }).or(page.getByRole('button', { name: 'Male' })).first().click();
await page.getByRole('button', { name: '1–2 years' }).or(page.getByRole('radio', { name: '1–2 years' })).first().click();
for (const ta of await page.locator('main textarea').all()) { if (!(await ta.inputValue())) await ta.fill('None'); }
for (const cb of await page.getByRole('checkbox').all()) await cb.click();
await page.getByRole('button', { name: /continue to booking/i }).click();
await page.waitForURL(/\/start\/book/, { timeout: 20000 }).catch(async () => { await shot('0-details-fail'); throw new Error('details did not submit'); });
await shot('1-book');
const slotBtn = page.getByRole('button', { name: /^\d{1,2}:\d{2} (am|pm)/ }).first();
const slotLabel = (await slotBtn.innerText()).trim().split('\n')[0];
await slotBtn.click();
await page.getByRole('button', { name: /hold time/i }).click();
await page.waitForTimeout(2500);
await shot('2-held');
await page.reload({ waitUntil: 'load' });
await page.waitForTimeout(1500);
await shot('3-after-refresh');
const body = await page.locator('main').innerText();
log('after refresh keeps hold:', body.includes(slotLabel), slotLabel);
await page.getByRole('button', { name: /^pay /i }).first().click();
await page.waitForTimeout(1500);
await shot('4-pay-sheet');
const dlg = page.getByRole('dialog');
const payBtn = dlg.getByRole('button', { name: /^pay ₹/i });
await payBtn.click();
await page.waitForTimeout(4000);
await shot('5-confirmed');
log('confirmed:', /confirmed|booked|you're booked|see you/i.test(await page.locator('main').innerText()));
await page.goto(base + '/account', { waitUntil: 'load' });
await shot('6-portal');
log('portal url', page.url());
// security: a fresh browser with a forged admin cookie
const evil = await browser.newContext();
await evil.addCookies([{ name: 'yhc_demo_role', value: 'admin', url: base }, { name: 'yhc_demo_sig', value: 'forged', url: base }]);
const ep = await evil.newPage();
await ep.goto(base + '/admin', { waitUntil: 'load' });
log('forged admin lands on', new URL(ep.url()).pathname);
const body2 = await ep.locator('main').innerText();
log('demo shows code form:', /access code/i.test(body2));
await ep.goto(base + '/account', { waitUntil: 'load' });
log('anon /account lands on', new URL(ep.url()).pathname);
await ep.goto(base + '/book', { waitUntil: 'load' });
log('anon /book lands on', new URL(ep.url()).pathname);
await ep.goto(base + '/assessment', { waitUntil: 'load' });
log('anon /assessment lands on', new URL(ep.url()).pathname);
const r404 = await ep.goto(base + '/r/not-a-real-token', { waitUntil: 'load' });
log('/r/invalid status', r404?.status());
const home = await ep.goto(base + '/', { waitUntil: 'load' });
const h = home?.headers() ?? {};
log('headers', JSON.stringify({ csp: Boolean(h['content-security-policy']), xfo: h['x-frame-options'], nosniff: h['x-content-type-options'], ref: h['referrer-policy'], perm: Boolean(h['permissions-policy']), powered: h['x-powered-by'] ?? null }));
const plan = await ep.goto(base + '/r/demo-karan-plan-token-00000000000000', { waitUntil: 'load' });
log('/r/valid status', plan?.status(), /plan/i.test(await ep.locator('main').innerText()));
const demo = await ep.goto(base + '/demo', { waitUntil: 'load' });
log('/demo robots', demo?.headers()['x-robots-tag']);
await browser.close();
