import { test, expect } from '@playwright/test';
import { clearIndexedDB } from './utils/test-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
  });

  test('login form validation - empty email', async ({ page }) => {
    await page.goto('/login');
    await page.waitForSelector('button[type="submit"]');
    await page.click('button[type="submit"]');
    
    const errorMessage = await page.locator('.text-destructive').textContent();
    expect(errorMessage).toContain('请输入邮箱地址');
  });

  test('login form validation - empty password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', 'test@example.com');
    await page.click('button[type="submit"]');
    
    const errorMessage = await page.locator('.text-destructive').textContent();
    expect(errorMessage).toContain('请输入密码');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', 'nonexistent@test.com');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for API response and error display
    await page.waitForTimeout(2000);
    
    const errorMessage = await page.locator('.text-destructive').textContent();
    // Should show some kind of error (email not registered or invalid credentials)
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.length).toBeGreaterThan(0);
  });

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/register');
    
    const title = await page.locator('text=创建账户').first().textContent();
    expect(title).toContain('创建账户');
    
    // Check form fields exist
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('protected route shows loading state when not logged in', async ({ page }) => {
    await page.goto('/holdings');
    
    // Should show loading state
    await page.waitForTimeout(1000);
    const content = await page.content();
    
    // Either shows loading state or redirects to login
    const hasLoading = content.includes('验证登录状态');
    const hasLogin = content.includes('欢迎回来') || page.url().includes('/login');
    
    expect(hasLoading || hasLogin).toBeTruthy();
  });

  test('login page has all required fields', async ({ page }) => {
    await page.goto('/login');
    
    // Check email input
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check register link
    await expect(page.locator('text=立即注册')).toBeVisible();
  });

  test('password visibility toggle works', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('testpassword');
    
    // Should be password type by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click eye icon to show password
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('register form validation - all fields required', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show validation errors or prevent submission
    const currentUrl = page.url();
    expect(currentUrl).toContain('/register');
  });
});

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    await clearIndexedDB(page);
  });

  test('dashboard requires authentication', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);
    
    const content = await page.content();
    const isLoginPage = content.includes('欢迎回来') || page.url().includes('/login');
    const isLoading = content.includes('验证登录状态');
    
    expect(isLoginPage || isLoading).toBeTruthy();
  });

  test('import page requires authentication', async ({ page }) => {
    await page.goto('/import');
    await page.waitForTimeout(1000);
    
    const content = await page.content();
    const isLoginPage = content.includes('欢迎回来') || page.url().includes('/login');
    const isLoading = content.includes('验证登录状态');
    
    expect(isLoginPage || isLoading).toBeTruthy();
  });
});
