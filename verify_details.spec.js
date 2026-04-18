import { test, expect } from '@playwright/test';

test('capture browser errors', async ({ page }) => {
  page.on('pageerror', error => console.error('Browser Error:', error));

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:3000/how-it-works');
  await page.waitForTimeout(1000);
});
