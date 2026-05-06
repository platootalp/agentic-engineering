import { test as base, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

export type TestUser = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const test = base.extend<{
  authUser: TestUser
  loginPage: LoginPage
  authenticatedPage: { page: typeof base; user: TestUser }
}>({
  authUser: async ({}, use) => {
    const timestamp = Date.now()
    const user: TestUser = {
      email: `test-${timestamp}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
    }
    await use(user)
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await use(loginPage)
  },

  authenticatedPage: async ({ page, authUser }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(authUser.email, authUser.password)
    await expect(page).toHaveURL('/dashboard')
    await use({ page, user: authUser })
  },
})

export { expect }
