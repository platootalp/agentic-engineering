import { Page, expect } from '@playwright/test';

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

export async function clearIndexedDB(page: Page) {
  try {
    await page.evaluate(async () => {
      try {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (e) {
        // IndexedDB access may be restricted in some contexts
        console.log('Could not clear IndexedDB:', e);
      }
    });
  } catch (e) {
    // Ignore errors from clearIndexedDB
  }
}

export async function clickWhenVisible(page: Page, selector: string) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible' });
  await element.click();
}

export async function safeFill(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.waitFor({ state: 'visible' });
  await input.clear();
  await input.fill(value);
}

export async function expectTextToBeVisible(page: Page, text: string) {
  await expect(page.getByText(text)).toBeVisible();
}

export async function mockFundSearchAPI(page: Page) {
  await page.route('**/api/funds/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        funds: [
          {
            code: '000001',
            name: '华夏成长混合',
            type: '混合型',
            nav: 1.2345,
            navDate: '2024-01-15',
          },
          {
            code: '000002',
            name: '华夏大盘精选',
            type: '股票型',
            nav: 2.5678,
            navDate: '2024-01-15',
          },
        ],
      }),
    });
  });
}

export async function mockFundEstimateAPI(page: Page) {
  await page.route('**/api/funds/*/estimate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: '000001',
        estimate: 1.2456,
        estimateTime: '2024-01-15 15:00:00',
        change: 0.89,
      }),
    });
  });
}
