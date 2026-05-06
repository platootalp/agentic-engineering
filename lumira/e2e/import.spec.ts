import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Import Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/import');
  });

  test('should display import page', async ({ page }) => {
    await expect(page).toHaveURL('/import');
    await expect(page.locator('body')).toBeVisible();
  });
});
