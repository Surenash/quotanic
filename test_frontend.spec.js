import { test, expect } from '@playwright/test';

test('verify frontend renders correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/Quotanic/);
});
