import { expect, test } from '@playwright/test';

test('home renders with the booking CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /book consultation/i }).first()).toBeVisible();
});

test('health endpoint is ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  expect((await res.json()).ok).toBe(true);
});

test('portals require sign-in', async ({ page }) => {
  await page.goto('/doctor');
  await expect(page).toHaveURL(/\/(demo|auth\/login)\?next=%2Fdoctor/);
});
