import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
  });

  test('should navigate to main pages', async ({ page }) => {
    const pages = ['/', '/holdings', '/compare', '/rankings', '/sip', '/import'];
    for (const url of pages) {
      await page.goto(url);
      await expect(page).toHaveURL(url);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
