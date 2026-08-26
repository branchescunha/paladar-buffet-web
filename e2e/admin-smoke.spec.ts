import { test, expect } from '@playwright/test';

test('loads the admin login screen', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Paladar Buffet')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});
