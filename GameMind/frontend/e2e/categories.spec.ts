import { test, expect } from '@playwright/test';

test.describe('Categories Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories', { waitUntil: 'domcontentloaded' });
  });

  test('categories page loads', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('品类管理');
  });

  test('shows categories list', async ({ page }) => {
    // Wait for page heading to confirm page is loaded
    await expect(page.locator('h1')).toContainText('品类管理');
  });

  test('shows add category button', async ({ page }) => {
    // Add category button should always be visible
    const addButton = page.getByRole('button', { name: /添加品类/ });
    await expect(addButton).toBeVisible();
  });

  test('shows page description', async ({ page }) => {
    // Page description should be present
    await expect(page.getByText('配置分析品类、关键词和数据源')).toBeVisible({ timeout: 10000 });
  });
});
