import { test } from '@playwright/test';
import { join } from 'path';

test('capture PWA screenshots', async ({ page, browser }) => {
  if (!process.env.CI && !process.env.npm_config_screenshots) {
    console.log('Skipping screenshots (not in CI, set npm_config_screenshots=true to force)');
    return;
  }

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/kiosky/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(__dirname, '..', 'public', 'screenshot-desktop.png'), fullPage: true });
  console.log('Captured screenshot-desktop.png');

  const mobilePage = await browser.newPage();
  await mobilePage.setViewportSize({ width: 390, height: 844 });
  await mobilePage.goto('/kiosky/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: join(__dirname, '..', 'public', 'screenshot-mobile.png'), fullPage: true });
  console.log('Captured screenshot-mobile.png');
  await mobilePage.close();
});
