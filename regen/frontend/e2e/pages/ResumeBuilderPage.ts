import { Page, Locator } from '@playwright/test'

export class ResumeBuilderPage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly jobSelect: Locator
  readonly templateSelect: Locator
  readonly generateButton: Locator
  readonly previewSection: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly experienceList: Locator
  readonly experienceCheckboxes: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '生成简历' })
    this.jobSelect = page.getByLabel('选择职位')
    this.templateSelect = page.getByLabel('选择模板')
    this.generateButton = page.getByRole('button', { name: '生成简历' })
    this.previewSection = page.locator('[data-testid="resume-preview"]').or(page.locator('.resume-preview'))
    this.saveButton = page.getByRole('button', { name: '保存简历' })
    this.cancelButton = page.getByRole('button', { name: '取消' })
    this.experienceList = page.locator('[data-testid="experience-list"]')
    this.experienceCheckboxes = page.locator('input[type="checkbox"]')
  }

  async goto() {
    await this.page.goto('/resumes/builder')
    await this.page.waitForLoadState('networkidle')
  }

  async selectJob(jobName: string) {
    await this.jobSelect.selectOption(jobName)
  }

  async selectTemplate(templateName: string) {
    await this.templateSelect.selectOption(templateName)
  }

  async toggleExperience(index: number) {
    await this.experienceCheckboxes.nth(index).click()
  }

  async generateResume() {
    await this.generateButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async saveResume() {
    await this.saveButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }

  async isPreviewVisible(): Promise<boolean> {
    return this.previewSection.isVisible().catch(() => false)
  }
}
