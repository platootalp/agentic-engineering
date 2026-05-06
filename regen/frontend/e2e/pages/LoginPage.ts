import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly registerLink: Locator
  readonly forgotPasswordLink: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]')
    this.loginButton = page.locator('main').getByRole('button', { name: '登录' })
    this.registerLink = page.getByRole('link', { name: '立即注册' })
    this.forgotPasswordLink = page.getByRole('link', { name: '忘记密码？' })
    this.errorMessage = page.locator('.bg-destructive\\/15')
  }

  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async getErrorMessage(): Promise<string | null> {
    // Wait for error message to appear with a timeout
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 })
      return this.errorMessage.textContent()
    } catch {
      return null
    }
  }

  async navigateToRegister() {
    await this.registerLink.click()
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click()
  }
}
