import { Page, Locator } from '@playwright/test'

export class JobListPage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly newJobButton: Locator
  readonly jobList: Locator
  readonly searchInput: Locator
  readonly emptyState: Locator
  readonly jobCards: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '职位管理' })
    this.newJobButton = page.getByRole('button', { name: '添加职位' })
    this.jobList = page.locator('[data-testid="job-list"]').or(page.locator('.job-list'))
    this.searchInput = page.getByPlaceholder('搜索职位...')
    this.emptyState = page.locator('text=暂无职位')
    this.jobCards = page.locator('[data-testid="job-card"]').or(page.locator('.job-item'))
  }

  async goto() {
    await this.page.goto('/jobs')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewJob() {
    await this.newJobButton.click()
  }

  async searchJobs(query: string) {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
    await this.page.waitForLoadState('networkidle')
  }

  async getJobCount(): Promise<number> {
    return this.jobCards.count()
  }

  async clickJobByIndex(index: number) {
    await this.jobCards.nth(index).click()
  }

  async clickJobByTitle(title: string) {
    await this.page.getByRole('link', { name: title }).click()
  }

  async isEmptyState(): Promise<boolean> {
    return this.emptyState.isVisible().catch(() => false)
  }
}
