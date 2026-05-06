import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly welcomeMessage: Locator
  readonly jobCountCard: Locator
  readonly experienceCountCard: Locator
  readonly resumeCountCard: Locator
  readonly usageQuotaCard: Locator
  readonly newJobButton: Locator
  readonly manageJobsButton: Locator
  readonly addExperienceButton: Locator
  readonly generateResumeButton: Locator
  readonly chromeExtensionButton: Locator
  readonly accountSettingsButton: Locator
  readonly recentJobsSection: Locator
  readonly gettingStartedSection: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '仪表盘' })
    this.welcomeMessage = page.getByText(/欢迎回来/)
    this.jobCountCard = page.locator('text=职位总数').locator('..')
    this.experienceCountCard = page.locator('text=经历总数').locator('..')
    this.resumeCountCard = page.locator('text=简历总数').locator('..')
    this.usageQuotaCard = page.locator('text=使用额度').locator('..')
    this.newJobButton = page.locator('text=新建职位').first()
    this.manageJobsButton = page.locator('text=管理职位').first()
    this.addExperienceButton = page.locator('text=添加经历').first()
    this.generateResumeButton = page.locator('text=生成简历').first()
    this.chromeExtensionButton = page.locator('text=Chrome 插件').first()
    this.accountSettingsButton = page.locator('text=账户设置').first()
    this.recentJobsSection = page.getByRole('heading', { name: '最近活动' })
    this.gettingStartedSection = page.getByRole('heading', { name: '开始使用' })
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async getJobCount(): Promise<string> {
    const card = this.jobCountCard
    const count = await card.locator('.text-2xl').textContent()
    return count || '0'
  }

  async getExperienceCount(): Promise<string> {
    const card = this.experienceCountCard
    const count = await card.locator('.text-2xl').textContent()
    return count || '0'
  }

  async getResumeCount(): Promise<string> {
    const card = this.resumeCountCard
    const count = await card.locator('.text-2xl').textContent()
    return count || '0'
  }

  async getUsageQuota(): Promise<string> {
    const card = this.usageQuotaCard
    const quota = await card.locator('.text-2xl').textContent()
    return quota || '0%'
  }

  async clickNewJob() {
    await this.newJobButton.click()
  }

  async clickManageJobs() {
    await this.manageJobsButton.click()
  }

  async clickAddExperience() {
    await this.addExperienceButton.click()
  }

  async clickGenerateResume() {
    await this.generateResumeButton.click()
  }
}
