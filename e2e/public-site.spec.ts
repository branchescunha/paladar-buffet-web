import { test, expect } from '@playwright/test';

test('loads the public home page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /buffet completo para eventos em brasília/i })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: /solicitar orçamento/i })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: /entrar/i })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /acesso administrativo/i })).toHaveCount(0);
});

test('loads the public quote form', async ({ page }) => {
  await page.goto('/orcamento');

  await expect(page.getByRole('heading', { name: /solicite um orçamento personalizado/i })).toBeVisible();
  await expect(page.getByLabel('Nome completo')).toBeVisible();
  await expect(page.getByLabel('Horário previsto')).toBeVisible();
  await expect(page.getByRole('button', { name: /enviar solicitação/i })).toBeVisible();
});
