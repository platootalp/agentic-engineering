import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HoldingsPage extends BasePage {
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly emptyState: Locator;
  readonly holdingItems: Locator;

  constructor(page: Page) {
    super(page, '/holdings');
    this.addButton = page.getByRole('button', { name: /添加|新增/ });
    this.searchInput = page.getByPlaceholder(/搜索|search/i);
    this.emptyState = page.getByTestId('empty-state');
    this.holdingItems = page.getByTestId('holding-item');
  }

  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  async expectHoldingCount(count: number) {
    if (count === 0) {
      await this.expectEmptyState();
    } else {
      await expect(this.holdingItems).toHaveCount(count);
    }
  }

  async clickAddHolding() {
    await this.addButton.click();
  }

  async deleteFirstHolding() {
    const firstHolding = this.holdingItems.first();
    await firstHolding.getByTestId('delete-button').click();
    await this.page.getByRole('button', { name: /确认|删除/ }).click();
  }
}
