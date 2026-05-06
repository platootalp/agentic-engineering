import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class FundDetailPage extends BasePage {
  readonly fundName: Locator;
  readonly fundCode: Locator;
  readonly addTransactionButton: Locator;

  constructor(page: Page, fundCode: string) {
    super(page, `/fund/${fundCode}`);
    this.fundName = page.getByTestId('fund-name');
    this.fundCode = page.getByTestId('fund-code');
    this.addTransactionButton = page.getByRole('button', { name: /记录交易|添加交易/ });
  }

  async expectFundInfoVisible() {
    await expect(this.fundName).toBeVisible();
    await expect(this.fundCode).toBeVisible();
  }

  async clickAddTransaction() {
    await this.addTransactionButton.click();
  }
}
