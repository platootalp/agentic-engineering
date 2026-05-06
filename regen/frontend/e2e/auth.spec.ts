import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'

test.describe('认证流程', () => {
  test.describe('登录', () => {
    test('显示登录页面', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await expect(page).toHaveTitle(/登录/)
      await expect(loginPage.emailInput).toBeVisible()
      await expect(loginPage.passwordInput).toBeVisible()
      await expect(loginPage.loginButton).toBeVisible()
    })

    test('登录表单验证 - 空字段', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.loginButton.click()

      await expect(page.getByText('请输入邮箱地址')).toBeVisible()
      await expect(page.getByText('请输入密码')).toBeVisible()
    })

    test('登录失败 - 无效凭证', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.login('invalid@example.com', 'wrongpassword')

      const errorMessage = await loginPage.getErrorMessage()
      expect(errorMessage).toContain('Invalid email or password')
    })

    test('成功登录后重定向到仪表盘', async ({ page }) => {
      test.skip(true, '需要有效的测试账号')
      
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.login('valid@example.com', 'ValidPassword123')

      await expect(page).toHaveURL('/dashboard')
      const dashboardPage = new DashboardPage(page)
      await expect(dashboardPage.headerTitle).toBeVisible()
    })

    test('已登录用户访问登录页重定向到仪表盘', async ({ page }) => {
      test.skip(true, '需要已登录状态')
      
      await page.goto('/login')
      await expect(page).toHaveURL('/dashboard')
    })

    test('点击注册链接跳转到注册页', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.navigateToRegister()

      await expect(page).toHaveURL('/register')
    })
  })

  test.describe('注册', () => {
    test('显示注册页面', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await expect(page).toHaveTitle(/注册/)
      await expect(registerPage.firstNameInput).toBeVisible()
      await expect(registerPage.lastNameInput).toBeVisible()
      await expect(registerPage.emailInput).toBeVisible()
      await expect(registerPage.passwordInput).toBeVisible()
      await expect(registerPage.confirmPasswordInput).toBeVisible()
      await expect(registerPage.registerButton).toBeVisible()
    })

    test('注册表单验证 - 空字段', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.registerButton.click()

      await expect(page.getByText('请输入名字')).toBeVisible()
      await expect(page.getByText('请输入姓氏')).toBeVisible()
      await expect(page.getByText('请输入邮箱地址')).toBeVisible()
      await expect(page.getByText('请输入密码')).toBeVisible()
    })

    test('注册表单验证 - 密码不匹配', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      })

      await expect(page.getByText('密码不匹配')).toBeVisible()
    })

    test('注册表单验证 - 密码强度', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
      })

      await expect(page.getByText('密码至少8位')).toBeVisible()
    })

    test('成功注册后重定向到仪表盘', async ({ page }) => {
      test.skip(true, '需要清理测试数据')
      
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      const timestamp = Date.now()
      await registerPage.register({
        firstName: 'Test',
        lastName: 'User',
        email: `test-${timestamp}@example.com`,
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      })

      await expect(page).toHaveURL('/dashboard')
    })

    test('点击登录链接跳转到登录页', async ({ page }) => {
      const registerPage = new RegisterPage(page)
      await registerPage.goto()

      await registerPage.navigateToLogin()

      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('未认证访问控制', () => {
    test('未登录用户访问受保护页面重定向到登录', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')
    })

    test('未登录用户访问职位页面重定向到登录', async ({ page }) => {
      await page.goto('/jobs')
      await expect(page).toHaveURL('/login')
    })

    test('未登录用户访问经历页面重定向到登录', async ({ page }) => {
      await page.goto('/experiences')
      await expect(page).toHaveURL('/login')
    })

    test('未登录用户访问简历页面重定向到登录', async ({ page }) => {
      await page.goto('/resumes')
      await expect(page).toHaveURL('/login')
    })
  })
})
