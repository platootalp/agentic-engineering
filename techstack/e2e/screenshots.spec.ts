import { test, expect } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

const SCREENSHOTS_DIR = path.join(process.cwd(), 'public', 'screenshots')
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'tech-stack', path: '/tech-stack' },
  { name: 'frontend', path: '/frontend' },
  { name: 'backend', path: '/backend' },
  { name: 'ai-stack', path: '/ai-stack' },
  { name: 'infrastructure', path: '/infrastructure' },
]

test.describe('Screenshot Capture', () => {
  test.beforeAll(async () => {
    // Ensure screenshots directory exists
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })
  })

  test('screenshots directory should exist', async () => {
    const stats = await fs.stat(SCREENSHOTS_DIR)
    expect(stats.isDirectory()).toBe(true)
  })

  test('should capture screenshots for all pages', async ({ page }) => {
    for (const { name, path: pagePath } of PAGES) {
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`)

      await page.goto(`http://localhost:3888${pagePath}`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: screenshotPath, fullPage: true })

      // Verify file exists and has content (> 10KB for a real page screenshot)
      const fileStats = await fs.stat(screenshotPath)
      expect(fileStats.size).toBeGreaterThan(10000)
    }
  })

  test('all screenshot files should exist with valid size', async () => {
    for (const { name } of PAGES) {
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`)
      const stats = await fs.stat(screenshotPath)
      expect(stats.size).toBeGreaterThan(10000, `${name}.png should be > 10KB`)
    }
  })
})
