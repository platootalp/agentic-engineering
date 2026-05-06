import { Page, Locator } from '@playwright/test'

export class ExperienceListPage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly newExperienceButton: Locator
  readonly experienceList: Locator
  readonly emptyState: Locator
  readonly experienceCards: Locator
  readonly filterSelect: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '经历管理' })
    this.newExperienceButton = page.getByRole('button', { name: '添加经历' })
    this.experienceList = page.locator('[data-testid="experience-list"]').or(page.locator('.experience-list'))
    this.emptyState = page.locator('text=暂无经历')
    this.experienceCards = page.locator('[data-testid="experience-card"]').or(page.locator('.experience-item'))
    this.filterSelect = page.getByLabel('类型')
  }

  async goto() {
    await this.page.goto('/experiences')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewExperience() {
    await this.newExperienceButton.click()
  }

  async filterByType(type: string) {
    await this.filterSelect.selectOption(type)
    await this.page.waitForLoadState('networkidle')
  }

  async getExperienceCount(): Promise<number> {
    return this.experienceCards.count()
  }

  async clickExperienceByIndex(index: number) {
    await this.experienceCards.nth(index).click()
  }

  async isEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible().catch(() => false)
  }
}
