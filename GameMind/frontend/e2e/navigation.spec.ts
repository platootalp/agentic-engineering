import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigation between main pages works', async ({ page }) => {
    // Start at dashboard
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('仪表盘');

    // Navigate to reports via header link
    await page.getByRole('link', { name: '报告列表' }).click();
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.locator('h1')).toContainText('报告列表');

    // Navigate back to dashboard via header link
    await page.getByRole('link', { name: '首页' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('仪表盘');

    // Navigate to categories
    await page.getByRole('link', { name: '品类管理' }).click();
    await expect(page).toHaveURL(/\/categories/);
    await expect(page.locator('h1')).toContainText('品类管理');
  });

  test('no 404 errors on navigation', async ({ page }) => {
    const errors: string[] = [];

    page.on('response', response => {
      if (response.status() === 404) {
        errors.push(`404: ${response.url()}`);
      }
    });

    // Navigate through main pages
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.goto('/reports', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.goto('/categories', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // No 404s should have occurred for page navigation (ignore _next static files)
    expect(errors.filter(e => !e.includes('_next') && !e.includes('/api/'))).toHaveLength(0);
  });
});
