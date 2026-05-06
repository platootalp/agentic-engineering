import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { ResumeListPage } from './pages/ResumeListPage'
import { ResumeBuilderPage } from './pages/ResumeBuilderPage'

test.describe('简历管理', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(true, '需要认证 - 在实际运行前设置测试账号')
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'Test123!@#')
  })

  test.describe('简历列表', () => {
    test('访问简历列表页面', async ({ page }) => {
      const resumeListPage = new ResumeListPage(page)
      await resumeListPage.goto()

      await expect(resumeListPage.headerTitle).toBeVisible()
      await expect(resumeListPage.newResumeButton).toBeVisible()
    })

    test('点击生成简历按钮', async ({ page }) => {
      const resumeListPage = new ResumeListPage(page)
      await resumeListPage.goto()

      await resumeListPage.clickNewResume()

      await expect(page).toHaveURL('/resumes/builder')
    })

    test('按职位筛选简历', async ({ page }) => {
      const resumeListPage = new ResumeListPage(page)
      await resumeListPage.goto()

      await resumeListPage.filterByJob('测试职位')

      await expect(page.url()).toContain('job=')
    })
  })

  test.describe('简历生成器', () => {
    test('显示简历生成器页面', async ({ page }) => {
      const resumeBuilderPage = new ResumeBuilderPage(page)
      await resumeBuilderPage.goto()

      await expect(resumeBuilderPage.headerTitle).toBeVisible()
      await expect(resumeBuilderPage.jobSelect).toBeVisible()
      await expect(resumeBuilderPage.templateSelect).toBeVisible()
    })

    test('需要选择职位才能生成', async ({ page }) => {
      const resumeBuilderPage = new ResumeBuilderPage(page)
      await resumeBuilderPage.goto()

      await resumeBuilderPage.generateButton.click()

      await expect(page.getByText('请选择职位')).toBeVisible()
    })

    test('选择职位和模板', async ({ page }) => {
      test.skip(true, '需要已有职位和模板数据')
      
      const resumeBuilderPage = new ResumeBuilderPage(page)
      await resumeBuilderPage.goto()

      await resumeBuilderPage.selectJob('测试职位')
      await resumeBuilderPage.selectTemplate('现代简约')
      await resumeBuilderPage.generateResume()

      await expect(resumeBuilderPage.isPreviewVisible()).resolves.toBe(true)
    })

    test('取消生成返回列表', async ({ page }) => {
      const resumeBuilderPage = new ResumeBuilderPage(page)
      await resumeBuilderPage.goto()

      await resumeBuilderPage.cancel()

      await expect(page).toHaveURL('/resumes')
    })
  })
})
