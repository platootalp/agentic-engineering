import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly totalAssets: Locator;
  readonly totalProfit: Locator;
  readonly todayProfit: Locator;
  readonly addHoldingButton: Locator;
  readonly holdingsLink: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.totalAssets = page.getByTestId('total-assets');
    this.totalProfit = page.getByTestId('total-profit');
    this.todayProfit = page.getByTestId('today-profit');
    this.addHoldingButton = page.getByRole('button', { name: /添加持仓|新增/ });
    this.holdingsLink = page.getByRole('link', { name: /持仓|holdings/i });
  }

  async expectStatsVisible() {
    await expect(this.totalAssets).toBeVisible();
    await expect(this.totalProfit).toBeVisible();
  }

  async clickAddHolding() {
    await this.addHoldingButton.click();
  }

  async navigateToHoldings() {
    await this.holdingsLink.click();
  }
}
