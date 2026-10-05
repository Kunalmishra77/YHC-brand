// Dev helper: walks the patient journey in the system Edge browser and screenshots each step.
// Usage: node scripts/journey-check.mjs <outDir>
import { chromium } from '@playwright/test';

const out = process.argv[2] ?? '.';
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const shot = async (name) => {
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}/j-${name}.png`, fullPage: true });
  console.log('shot', name, page.url());
};

await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 120000 });
const form = page.locator('form').filter({ hasText: 'Begin my 3D scan' }).first();
await form.getByLabel('Full name').fill('Asha Verma');
await form.getByLabel('Mobile number').fill('9876543210');
await form.getByLabel('Address').fill('14 Park Street, Lucknow');
await form.getByLabel('PIN code').fill('226001');
await form.getByRole('checkbox').click();
await form.getByRole('button', { name: /Begin my 3D scan/ }).click();
await page.waitForTimeout(2500);
await shot('1-otp');
const otp = page.locator('input[autocomplete="one-time-code"], input[inputmode="numeric"][maxlength="1"]');
const count = await otp.count();
if (count >= 6) for (let i = 0; i < 6; i++) await otp.nth(i).fill('123456'[i] ?? '');
else await otp.first().fill('123456');
const verify = page.getByRole('button', { name: /verify|continue|start/i }).first();
if (await verify.isVisible().catch(() => false)) await verify.click();
await page.waitForURL(/\/start\/scan/, { timeout: 60000 }).catch(() => {});
await page.waitForLoadState('networkidle');
await shot('2-scan');

// Four pre-scan questions: pick the first option each time (continue button if one appears).
for (let q = 0; q < 4; q++) {
  const option = page.locator('main button').filter({ hasNotText: /back/i }).first();
  await option.click();
  await page.waitForTimeout(600);
  const next = page.getByRole('button', { name: /^(next|continue|start the scan)/i }).first();
  if (await next.isVisible().catch(() => false)) await next.click();
  await page.waitForTimeout(600);
}
await shot('3-capture');

// Four angles via the upload fallback (headless has no camera).
const photo = process.env.PHOTO ?? 'public/images/concept/texture-tablets.webp';
for (let a = 0; a < 4; a++) {
  await page.locator('input[type="file"]').setInputFiles(photo);
  await page.waitForTimeout(1500);
  const nextAngle = page.getByRole('button', { name: /next angle/i });
  if (await nextAngle.isVisible().catch(() => false)) await nextAngle.click();
  await page.waitForTimeout(500);
}
await page.getByRole('button', { name: /analyse my scan/i }).click();
await page.waitForTimeout(3000);
await shot('4-analysing');
await page.waitForURL(/\/start\/assessment/, { timeout: 60000 }).catch(() => {});
await page.waitForLoadState('networkidle');
await shot('5-assessment');
const cont = page.getByRole('link', { name: /continue to your health form/i }).first();
if (await cont.isVisible().catch(() => false)) {
  await cont.click();
  await page.waitForURL(/\/start\/details/, { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await shot('6-details');
}
await browser.close();
