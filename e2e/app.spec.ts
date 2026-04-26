import { test, expect } from '@playwright/test';

test.describe('Kiosky App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display app title', async ({ page }) => {
    await expect(page).toHaveTitle(/kiosky/i);
    await expect(page.getByRole('heading', { name: /kiosky/i })).toBeVisible();
  });

  test('should add a new source', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await page.getByLabel('Site Name').fill('Test Site');
    await page.getByLabel('URL').fill('https://example.com');
    
    await page.getByRole('button', { name: 'Add Source' }).click();
    
    await expect(page.getByText('Test Site')).toBeVisible();
  });

  test('should validate URL format', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await page.getByLabel('Site Name').fill('Invalid Site');
    await page.getByLabel('URL').fill('javascript:alert(1)');
    
    await page.getByRole('button', { name: 'Add Source' }).click();
    
    await expect(page.locator('#url-error')).toBeVisible();
  });

  test('should close modal with escape key', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await expect(page.getByRole('heading', { name: 'Add New Source' })).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByRole('heading', { name: 'Add New Source' })).not.toBeVisible();
  });

  test('should close modal by clicking overlay', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await expect(page.getByRole('heading', { name: 'Add New Source' })).toBeVisible();
    
    await page.locator('[role="dialog"]').click({ position: { x: 50, y: 50 } });
    
    await expect(page.getByRole('heading', { name: 'Add New Source' })).not.toBeVisible();
  });

  test('should persist sources after reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await page.getByLabel('Site Name').fill('Persistent Site');
    await page.getByLabel('URL').fill('https://persistent.com');
    
    await page.getByRole('button', { name: 'Add Source' }).click();
    
    await expect(page.getByText('Persistent Site')).toBeVisible();
    
    await page.reload();
    
    await expect(page.getByText('Persistent Site')).toBeVisible();
  });

  test('should trap focus within modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    await page.getByText('Add Source').click();
    
    await page.getByLabel('Site Name').focus();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('URL')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  test('should show drag handles in edit mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Mode' }).click();
    
    const dragHandle = page.locator('[aria-label="Drag to reorder"]').first();
    await expect(dragHandle).toBeVisible();
  });
});
