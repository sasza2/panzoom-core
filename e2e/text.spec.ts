/* eslint-disable import/no-extraneous-dependencies */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/?story=panzoom--text');
});

test('move text', async ({ page }) => {
  const element1 = page
    .locator('.react-panzoom__in', { hasText: 'abcdef' })
    .last();
  const box = await element1.boundingBox();
  const { x, y } = box;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 200, y + 150);
  await page.mouse.up();

  await expect(page).toHaveScreenshot();
});

test('hide text', async ({ page }) => {
  const element1 = page.locator('.react-panzoom__in', { hasText: 'abcdef' }).last();
  const box = await element1.boundingBox();
  const { x, y } = box;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 100, y + 500);
  await page.mouse.up();

  await expect(page).toHaveScreenshot();
});
