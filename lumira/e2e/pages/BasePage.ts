import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '/') {
    this.page = page;
    this.url = url;
  }

  async goto() {
    await this.page.goto(this.url);
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectToBeOnPage() {
    await expect(this.page).toHaveURL(this.url);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png` });
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  async clickByTestId(testId: string) {
    await this.getByTestId(testId).click();
  }

  async fillByTestId(testId: string, value: string) {
    await this.getByTestId(testId).fill(value);
  }
}
