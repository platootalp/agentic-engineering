import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('dashboard page loads without crash', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('仪表盘');
  });

  test('shows KPI cards or dashboard elements', async ({ page }) => {
    // Wait for KPI card content to appear (API data loaded)
    await expect(page.getByText('报告总数')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('品类数量')).toBeVisible({ timeout: 5000 });
    // Use heading role to be specific about the section heading
    await expect(page.getByRole('heading', { name: '最新报告' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('平均耗时')).toBeVisible({ timeout: 5000 });
  });

  test('shows category rankings section', async ({ page }) => {
    // Wait for category rankings to load
    await expect(page.getByText('品类热度排名')).toBeVisible({ timeout: 15000 });
  });

  test('shows recent activity or latest report section', async ({ page }) => {
    // Wait for recent reports section
    await expect(page.getByRole('heading', { name: '最新报告' })).toBeVisible({ timeout: 15000 });
  });

  test('shows generate report button', async ({ page }) => {
    // Generate report button should always be visible (no API needed)
    const generateButton = page.getByRole('button', { name: /生成报告/ });
    await expect(generateButton).toBeVisible();
  });
});
