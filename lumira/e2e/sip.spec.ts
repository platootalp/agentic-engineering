import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('SIP Calculator Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/sip');
  });

  test('should display SIP calculator', async ({ page }) => {
    await expect(page).toHaveURL('/sip');
    await expect(page.locator('body')).toBeVisible();
  });
});
