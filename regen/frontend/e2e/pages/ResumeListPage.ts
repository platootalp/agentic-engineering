import { Page, Locator } from '@playwright/test'

export class ResumeListPage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly newResumeButton: Locator
  readonly resumeList: Locator
  readonly emptyState: Locator
  readonly resumeCards: Locator
  readonly filterByJobSelect: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '简历管理' })
    this.newResumeButton = page.getByRole('button', { name: '生成简历' })
    this.resumeList = page.locator('[data-testid="resume-list"]').or(page.locator('.resume-list'))
    this.emptyState = page.locator('text=暂无简历')
    this.resumeCards = page.locator('[data-testid="resume-card"]').or(page.locator('.resume-item'))
    this.filterByJobSelect = page.getByLabel('按职位筛选')
  }

  async goto() {
    await this.page.goto('/resumes')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewResume() {
    await this.newResumeButton.click()
  }

  async filterByJob(jobName: string) {
    await this.filterByJobSelect.selectOption(jobName)
    await this.page.waitForLoadState('networkidle')
  }

  async getResumeCount(): Promise<number> {
    return this.resumeCards.count()
  }

  async clickResumeByIndex(index: number) {
    await this.resumeCards.nth(index).click()
  }

  async isEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible().catch(() => false)
  }

  async clickDownloadResume(index: number) {
    const downloadButton = this.resumeCards.nth(index).getByRole('button', { name: '下载' })
    await downloadButton.click()
  }
}
