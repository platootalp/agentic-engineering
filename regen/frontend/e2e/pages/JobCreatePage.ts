import { Page, Locator } from '@playwright/test'

export class JobCreatePage {
  readonly page: Page
  readonly headerTitle: Locator
  readonly companyNameInput: Locator
  readonly positionInput: Locator
  readonly descriptionInput: Locator
  readonly requirementsInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.headerTitle = page.getByRole('heading', { name: '添加职位' })
    this.companyNameInput = page.getByLabel('公司名称')
    this.positionInput = page.getByLabel('职位名称')
    this.descriptionInput = page.getByLabel('职位描述')
    this.requirementsInput = page.getByLabel('任职要求')
    this.submitButton = page.getByRole('button', { name: '保存' })
    this.cancelButton = page.getByRole('button', { name: '取消' })
  }

  async goto() {
    await this.page.goto('/jobs/create')
    await this.page.waitForLoadState('networkidle')
  }

  async createJob(data: {
    companyName: string
    position: string
    description?: string
    requirements?: string
  }) {
    await this.companyNameInput.fill(data.companyName)
    await this.positionInput.fill(data.position)
    
    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }
    
    if (data.requirements) {
      await this.requirementsInput.fill(data.requirements)
    }
    
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
