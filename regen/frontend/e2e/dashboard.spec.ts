import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

test.describe('仪表盘', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(true, '需要认证 - 在实际运行前设置测试账号')
    
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login('test@example.com', 'Test123!@#')
    await expect(page).toHaveURL('/dashboard')
  })

  test('显示仪表盘标题和欢迎信息', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.headerTitle).toBeVisible()
    await expect(dashboardPage.welcomeMessage).toBeVisible()
  })

  test('显示统计卡片', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.jobCountCard).toBeVisible()
    await expect(dashboardPage.experienceCountCard).toBeVisible()
    await expect(dashboardPage.resumeCountCard).toBeVisible()
    await expect(dashboardPage.usageQuotaCard).toBeVisible()
  })

  test('快速操作按钮可用', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.newJobButton).toBeVisible()
    await expect(dashboardPage.manageJobsButton).toBeVisible()
    await expect(dashboardPage.addExperienceButton).toBeVisible()
    await expect(dashboardPage.generateResumeButton).toBeVisible()
  })

  test('点击新建职位跳转到创建页面', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.clickNewJob()
    
    await expect(page).toHaveURL('/jobs/create')
  })

  test('点击管理职位跳转到职位列表', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.clickManageJobs()
    
    await expect(page).toHaveURL('/jobs')
  })

  test('点击添加经历跳转到经历列表', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await dashboardPage.clickAddExperience()
    
    await expect(page).toHaveURL('/experiences')
  })

  test('显示最近活动区域', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.recentJobsSection).toBeVisible()
  })

  test('显示开始使用区域', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    
    await expect(dashboardPage.gettingStartedSection).toBeVisible()
  })
})
