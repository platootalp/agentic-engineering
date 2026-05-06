import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { ExperienceListPage } from './pages/ExperienceListPage'

test.describe('经历管理', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(true, '需要认证 - 在实际运行前设置测试账号')
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'Test123!@#')
  })

  test.describe('经历列表', () => {
    test('访问经历列表页面', async ({ page }) => {
      const experienceListPage = new ExperienceListPage(page)
      await experienceListPage.goto()

      await expect(experienceListPage.headerTitle).toBeVisible()
      await expect(experienceListPage.newExperienceButton).toBeVisible()
    })

    test('点击添加经历按钮', async ({ page }) => {
      const experienceListPage = new ExperienceListPage(page)
      await experienceListPage.goto()

      await experienceListPage.clickNewExperience()

      await expect(page).toHaveURL(/\/experiences\/create/)
    })

    test('按类型筛选经历', async ({ page }) => {
      const experienceListPage = new ExperienceListPage(page)
      await experienceListPage.goto()

      await experienceListPage.filterByType('work')

      await expect(page.url()).toContain('type=work')
    })
  })
})
