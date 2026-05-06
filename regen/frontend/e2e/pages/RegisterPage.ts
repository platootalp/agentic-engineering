import { Page, Locator } from '@playwright/test'

export class RegisterPage {
  readonly page: Page
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly registerButton: Locator
  readonly loginLink: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.firstNameInput = page.locator('input[name="first_name"]')
    this.lastNameInput = page.locator('input[name="last_name"]')
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]').first()
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]')
    this.registerButton = page.locator('main').getByRole('button', { name: '注册' })
    this.loginLink = page.getByRole('link', { name: '立即登录' })
    this.errorMessage = page.locator('.bg-destructive\\/15')
  }

  async goto() {
    await this.page.goto('/register')
    await this.page.waitForLoadState('networkidle')
  }

  async register(data: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) {
    await this.firstNameInput.fill(data.firstName)
    await this.lastNameInput.fill(data.lastName)
    await this.emailInput.fill(data.email)
    await this.passwordInput.fill(data.password)
    await this.confirmPasswordInput.fill(data.confirmPassword)
    await this.registerButton.click()
  }

  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible().catch(() => false)) {
      return this.errorMessage.textContent()
    }
    return null
  }

  async navigateToLogin() {
    await this.loginLink.click()
  }
}
