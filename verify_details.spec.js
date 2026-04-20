import { test, expect } from '@playwright/test';

test('capture browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  await page.goto('http://localhost:3000/how-it-works');
  await page.waitForLoadState('networkidle');

  expect(errors).toEqual([]);
});
