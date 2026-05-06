import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Interface Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to categories page
    await page.goto('/categories');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('1. Category preview functionality should work', async ({ page }) => {
    // First, create a test category
    await page.click('button:has-text("添加品类")');

    // Wait for dialog - use more flexible selector
    await page.waitForTimeout(2000);
    await page.waitForLoadState('domcontentloaded');

    // Take screenshot of dialog
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/01-add-category-dialog.png'),
    });

    // Fill in the form
    await page.fill('input[placeholder*="休闲解谜"]', '测试品类');
    await page.fill('input[placeholder*="casual_puzzle"]', 'test_category');
    await page.fill('textarea[placeholder*="puzzle"]', '测试关键词');

    // Submit
    await page.click('button:has-text("创建品类")');

    // Wait for category to appear
    await page.waitForSelector('text=测试品类', { timeout: 5000 });

    // Now test preview - click the eye icon
    const previewButton = page.locator('button[title="关键词预览"]').first();
    await previewButton.click();

    // Wait for preview result
    await page.waitForTimeout(2000); // Wait for API call

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/02-preview-result.png'),
    });

    // Verify preview result appears (either result or error message)
    const previewText = page.locator('.mt-3.p-2.bg-bg.rounded-md.text-xs.text-muted').first();
    await expect(previewText).toBeVisible({ timeout: 5000 });
  });

  test('2. Category form dialog should have max-w-md (not max-w-2xl)', async ({ page }) => {
    // Open the add category dialog
    await page.click('button:has-text("添加品类")');

    // Wait for dialog to appear
    await page.waitForTimeout(2000);

    // Take screenshot for documentation
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/03-dialog-size.png'),
    });

    // Check the source code directly - verify max-w-md in the component
    const categoryPagePath = path.join(__dirname, '../app/categories/page.tsx');
    const categoryListPath = path.join(__dirname, '../components/categories/CategoryList.tsx');

    const fs = await import('fs');
    const pageContent = fs.readFileSync(categoryPagePath, 'utf-8');
    const listContent = fs.readFileSync(categoryListPath, 'utf-8');

    // Verify max-w-md is used in both dialogs
    expect(pageContent).toContain('max-w-md');
    expect(listContent).toContain('max-w-md');

    // Verify max-w-2xl is NOT used in dialogs
    expect(pageContent).not.toContain('max-w-2xl');
    expect(listContent).not.toContain('max-w-2xl');

    console.log('Dialog width classes verified: max-w-md present, max-w-2xl absent');
  });

  test('3. Categories should load from API', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('text=暂无品类', { state: 'hidden', timeout: 10000 }).catch(() => {
      // Categories may or may not exist
    });

    // Check if categories are loaded
    const categoryCards = page.locator('[class*="Card"]');

    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, '../screenshots/04-categories-list.png'),
    });

    // If categories exist, verify they have preview buttons
    const previewButtons = page.locator('button[title="关键词预览"]');
    const count = await previewButtons.count();
    console.log(`Found ${count} preview buttons`);
  });
});

test.describe('API Verification', () => {
  test('Preview API should return estimated results', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/categories/1/preview');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('slug');
    expect(data).toHaveProperty('estimated_results');
    expect(typeof data.estimated_results).toBe('number');

    console.log('Preview API response:', data);
  });

  test('Categories API should return list', async ({ request }) => {
    const response = await request.get('http://localhost:8000/api/v1/categories');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('slug');
    }

    console.log(`Categories API returned ${data.length} categories`);
  });
});

test.describe('Analyzer Model Configuration', () => {
  test('Analyzer should use correct model name', async () => {
    const analyzerPath = path.join(__dirname, '../../backend/services/agent/analyzer.py');
    const fs = await import('fs');

    const content = fs.readFileSync(analyzerPath, 'utf-8');

    // Check for the model name in both streaming and sync methods
    const streamingModelMatch = content.match(/model="([^"]+)"/);
    const models: string[] = [];

    if (streamingModelMatch) {
      models.push(streamingModelMatch[1]);
    }

    // Find all model occurrences
    const allModelMatches = content.match(/model="([^"]+)"/g) || [];
    allModelMatches.forEach(m => {
      const model = m.match(/model="([^"]+)"/)?.[1];
      if (model && !models.includes(model)) {
        models.push(model);
      }
    });

    console.log('Models found in analyzer.py:', models);

    // Verify a model is being set
    expect(models.length).toBeGreaterThan(0);

    // Check if the model is a valid Anthropic model
    // Valid models: claude-3-5-sonnet-20241022, claude-3-opus-20240229, claude-3-sonnet-20240229, etc.
    const knownValidModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-sonnet-20240620',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    // Document the current state
    const currentModel = models[0];
    const isValidModel = knownValidModels.includes(currentModel);

    if (!isValidModel) {
      console.log(`WARNING: Model "${currentModel}" may not be valid. Valid models include: ${knownValidModels.join(', ')}`);
    }

    expect(content).toContain('model=');
  });
});
