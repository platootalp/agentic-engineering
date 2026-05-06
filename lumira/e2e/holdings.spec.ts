import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Holdings Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
    await page.goto('/holdings');
  });

  test('should display holdings page', async ({ page }) => {
    await expect(page).toHaveURL('/holdings');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have page content', async ({ page }) => {
    // Page should have some content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
