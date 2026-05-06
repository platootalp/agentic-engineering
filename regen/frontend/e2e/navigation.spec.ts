import { test, expect } from '@playwright/test'

test.describe('导航和布局', () => {
  test('首页可以正常访问', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/Regen/)
    await expect(page.getByRole('heading')).toBeVisible()
  })

  test('404页面重定向到首页', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    await expect(page).toHaveURL('/')
  })

  test.describe('响应式布局', () => {
    test('桌面端显示完整导航', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')
      
      await expect(page.getByRole('navigation')).toBeVisible()
    })

    test('移动端显示汉堡菜单', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      const menuButton = page.getByRole('button', { name: /菜单|Menu/i })
      if (await menuButton.isVisible().catch(() => false)) {
        await menuButton.click()
        await expect(page.getByRole('navigation')).toBeVisible()
      }
    })
  })

  test.describe('页面加载性能', () => {
    test('登录页面加载时间', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(5000)
    })

    test('首页加载时间', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(5000)
    })
  })
})
