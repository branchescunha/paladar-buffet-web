import { expect, test } from '@playwright/test';

async function expectAtTop(page: import('@playwright/test').Page) {
  await expect
    .poll(() => page.evaluate(() => Math.round(window.scrollY)))
    .toBeLessThanOrEqual(4);
}

async function scrollPageDown(page: import('@playwright/test').Page) {
  await page.evaluate(() => window.scrollTo(0, Math.max(900, document.documentElement.scrollHeight * 0.55)));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
}

test('home scrolled to quote opens the quote page at the top', async ({ page }) => {
  await page.goto('/');
  await scrollPageDown(page);

  await page.getByRole('banner').getByRole('link', { name: /solicitar orçamento/i }).click();

  await expect(page).toHaveURL('/orcamento');
  await expect(page.getByRole('heading', { name: /solicite um orçamento personalizado/i })).toBeVisible();
  await expectAtTop(page);
});

test('quote scrolled to privacy opens the privacy page at the top', async ({ page }) => {
  await page.goto('/orcamento');
  await scrollPageDown(page);

  await page.getByRole('link', { name: 'política de privacidade', exact: true }).click();

  await expect(page).toHaveURL('/privacidade');
  await expect(page.getByRole('heading', { name: /política de privacidade/i })).toBeVisible();
  await expectAtTop(page);
});

test('privacy scrolled to footer home opens the home hero at the top', async ({ page }) => {
  await page.goto('/privacidade');
  await scrollPageDown(page);
  await page.getByRole('contentinfo').getByRole('link', { name: /^home$/i }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /buffet completo para eventos em brasília/i })).toBeVisible();
  await expectAtTop(page);
});

test('navbar logo on the current home route scrolls back to the top', async ({ page }) => {
  await page.goto('/');
  await scrollPageDown(page);

  await page.getByRole('banner').getByRole('link', { name: /^paladar buffet$/i }).click();

  await expect(page).toHaveURL('/');
  await expectAtTop(page);
});

test('footer logo opens the home hero at the top', async ({ page }) => {
  await page.goto('/');
  await scrollPageDown(page);
  await page.getByRole('contentinfo').getByRole('link', { name: /^paladar buffet$/i }).click();

  await expect(page).toHaveURL('/');
  await expectAtTop(page);
});

test('same-route quote navigation scrolls back to the top', async ({ page }) => {
  await page.goto('/orcamento');
  await scrollPageDown(page);

  await page.getByRole('banner').getByRole('link', { name: /solicitar orçamento/i }).click();

  await expect(page).toHaveURL('/orcamento');
  await expectAtTop(page);
});

test('home section anchors keep their target instead of forcing the top', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /ver detalhes/i }).click();

  await expect(page).toHaveURL('/#galeria');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  await expect(page.getByRole('heading', { name: /detalhes que compõem cada evento/i })).toBeVisible();
});
