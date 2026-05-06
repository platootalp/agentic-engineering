import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { JobListPage } from './pages/JobListPage'
import { JobCreatePage } from './pages/JobCreatePage'
import { DashboardPage } from './pages/DashboardPage'

test.describe('职位管理', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(true, '需要认证 - 在实际运行前设置测试账号')
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'Test123!@#')
  })

  test.describe('职位列表', () => {
    test('访问职位列表页面', async ({ page }) => {
      const jobListPage = new JobListPage(page)
      await jobListPage.goto()

      await expect(jobListPage.headerTitle).toBeVisible()
      await expect(jobListPage.newJobButton).toBeVisible()
    })

    test('从仪表盘导航到职位列表', async ({ page }) => {
      const dashboardPage = new DashboardPage(page)
      await dashboardPage.goto()
      await dashboardPage.clickManageJobs()

      const jobListPage = new JobListPage(page)
      await expect(jobListPage.headerTitle).toBeVisible()
    })

    test('点击添加职位按钮跳转到创建页面', async ({ page }) => {
      const jobListPage = new JobListPage(page)
      await jobListPage.goto()
      await jobListPage.clickNewJob()

      await expect(page).toHaveURL('/jobs/create')
    })

    test('搜索职位功能', async ({ page }) => {
      const jobListPage = new JobListPage(page)
      await jobListPage.goto()

      await jobListPage.searchJobs('前端')

      await expect(page.url()).toContain('search=')
    })
  })

  test.describe('创建职位', () => {
    test('显示创建职位表单', async ({ page }) => {
      const jobCreatePage = new JobCreatePage(page)
      await jobCreatePage.goto()

      await expect(jobCreatePage.headerTitle).toBeVisible()
      await expect(jobCreatePage.companyNameInput).toBeVisible()
      await expect(jobCreatePage.positionInput).toBeVisible()
      await expect(jobCreatePage.descriptionInput).toBeVisible()
      await expect(jobCreatePage.requirementsInput).toBeVisible()
    })

    test('表单验证 - 必填字段', async ({ page }) => {
      const jobCreatePage = new JobCreatePage(page)
      await jobCreatePage.goto()

      await jobCreatePage.submitButton.click()

      await expect(page.getByText('请输入公司名称')).toBeVisible()
      await expect(page.getByText('请输入职位名称')).toBeVisible()
    })

    test('成功创建职位', async ({ page }) => {
      const jobCreatePage = new JobCreatePage(page)
      await jobCreatePage.goto()

      const timestamp = Date.now()
      await jobCreatePage.createJob({
        companyName: `测试公司-${timestamp}`,
        position: `测试职位-${timestamp}`,
        description: '这是一个测试职位描述',
        requirements: '1. 测试要求\n2. 测试要求',
      })

      await expect(page).toHaveURL('/jobs')
    })

    test('取消创建返回职位列表', async ({ page }) => {
      const jobCreatePage = new JobCreatePage(page)
      await jobCreatePage.goto()

      await jobCreatePage.cancel()

      await expect(page).toHaveURL('/jobs')
    })
  })
})
