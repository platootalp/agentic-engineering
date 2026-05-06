import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads with 200 status', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
  });

  test('homepage has correct title content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText('仪表盘');
  });

  test('reports page loads with 200 status', async ({ page }) => {
    const response = await page.goto('/reports', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('报告列表');
  });

  test('categories page loads with 200 status', async ({ page }) => {
    const response = await page.goto('/categories', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('品类管理');
  });
});
