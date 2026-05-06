import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Rankings Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/rankings');
  });

  test('should display rankings page', async ({ page }) => {
    await expect(page).toHaveURL('/rankings');
    await expect(page.locator('body')).toBeVisible();
  });
});
