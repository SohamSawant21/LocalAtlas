import { test, expect } from '@playwright/test';

test('homepage has expected title and elements', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/LocalAtlas/);
  await expect(page.getByText('Discover the Unseen')).toBeVisible();
});
