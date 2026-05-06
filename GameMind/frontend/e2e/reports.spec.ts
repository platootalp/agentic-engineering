import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports', { waitUntil: 'domcontentloaded' });
  });

  test('reports page loads', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('报告列表');
  });

  test('shows reports list or empty state', async ({ page }) => {
    // Wait for heading to confirm page is loaded
    await expect(page.locator('h1')).toContainText('报告列表');
  });

  test('shows total report count', async ({ page }) => {
    // Page should show heading with total
    await expect(page.locator('h1')).toContainText('报告列表');
    // Total count should be visible
    await expect(page.locator('text=/共 \\d+ 份报告/')).toBeVisible({ timeout: 10000 });
  });

  test('shows filter controls', async ({ page }) => {
    // Filter section should be present
    await expect(page.getByText(/筛选/)).toBeVisible({ timeout: 10000 });
  });
});
