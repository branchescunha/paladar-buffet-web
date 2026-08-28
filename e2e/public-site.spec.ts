import { test, expect } from '@playwright/test';

test('loads the public home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /buffet completo para eventos em brasilia/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /solicitar orcamento/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /entrar/i })).toBeVisible();
});

test('loads the public quote form', async ({ page }) => {
  await page.goto('/orcamento');

  await expect(page.getByRole('heading', { name: /solicite um orcamento personalizado/i })).toBeVisible();
  await expect(page.getByLabel('Nome completo')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar solicitacao/i })).toBeVisible();
});
