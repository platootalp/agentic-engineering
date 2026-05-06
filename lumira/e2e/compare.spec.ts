import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Compare Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/compare');
  });

  test('should display compare page', async ({ page }) => {
    await expect(page).toHaveURL('/compare');
    await expect(page.locator('body')).toBeVisible();
  });
});
