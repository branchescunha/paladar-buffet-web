import { expect, test, type Page } from '@playwright/test';

const admin = {
  id: 'admin-1',
  name: 'Administrador Paladar Buffet',
  email: 'coordenacao.comercial.eventos.paladar.buffet.df@gmail.com',
  commercialTitle: 'Coordenador de Eventos e Operações',
  role: 'ADMIN',
  isActive: true,
  mustChangePassword: false,
  googleLinked: false
};

async function openUsers(page: Page, getTitle: () => string, onFetch?: () => void) {
  await page.route('**/*', (route) => {
    if (!['fetch', 'xhr'].includes(route.request().resourceType())) return route.continue();
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/auth/me') {
      return route.fulfill({ json: { admin } });
    }
    if (pathname === '/admin/users') {
      onFetch?.();
      return route.fulfill({ json: [{ ...admin, commercialTitle: getTitle() }] });
    }
    return route.fulfill({ json: {} });
  });
  await page.goto('/admin/users');
  await expect(page.getByText(getTitle())).toBeVisible();
}

for (const width of [1280, 1366, 1440]) {
  test(`keeps all Administradores columns and actions inside the panel at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await openUsers(page, () => admin.commercialTitle);

    const bounds = await page.locator('main table').evaluate((table) => {
      const panel = table.parentElement!;
      const action = table.querySelector('tbody button')!;
      const panelBox = panel.getBoundingClientRect();
      const tableBox = table.getBoundingClientRect();
      const actionBox = action.getBoundingClientRect();
      return {
        panelRight: panelBox.right - parseFloat(getComputedStyle(panel).paddingRight),
        tableRight: tableBox.right,
        tableScrollWidth: table.scrollWidth,
        tableClientWidth: table.clientWidth,
        actionRight: actionBox.right,
        actionScrollWidth: action.scrollWidth,
        actionClientWidth: action.clientWidth,
        viewportWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    expect(bounds.tableRight).toBeLessThanOrEqual(bounds.panelRight + 1);
    expect(bounds.tableScrollWidth).toBeLessThanOrEqual(bounds.tableClientWidth + 1);
    expect(bounds.actionRight).toBeLessThanOrEqual(bounds.panelRight + 1);
    expect(bounds.actionScrollWidth).toBeLessThanOrEqual(bounds.actionClientWidth + 1);
    expect(bounds.actionRight).toBeLessThanOrEqual(width);
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.viewportWidth);
  });
}

for (const width of [320, 375, 390, 430]) {
  test(`keeps menu, theme, refresh and logout reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openUsers(page, () => admin.commercialTitle);

    const buttons = [
      page.getByRole('button', { name: 'Abrir navegação' }),
      page.getByRole('button', { name: 'Usar tema escuro' }),
      page.getByRole('button', { name: 'Atualizar dados' }),
      page.getByRole('button', { name: 'Sair' })
    ];
    const boxes = await Promise.all(buttons.map(async (button) => {
      await expect(button).toBeVisible();
      return (await button.boundingBox())!;
    }));
    expect(boxes.every(({ width: buttonWidth, height }) => buttonWidth >= 44 && height >= 44)).toBe(true);
    expect(new Set(boxes.map(({ y }) => Math.round(y))).size).toBe(1);
    expect(boxes.at(-1)!.x + boxes.at(-1)!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('refreshes active admin data without navigating or duplicating requests', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let title = admin.commercialTitle;
  let fetches = 0;
  await openUsers(page, () => title, () => { fetches += 1; });

  title = 'Diretor Comercial';
  await page.getByRole('button', { name: 'Atualizar dados' }).click();
  await expect(page.getByText(title)).toBeVisible();
  expect(fetches).toBe(2);
  await expect(page).toHaveURL(/\/admin\/users$/);
});

test('refreshes active admin data on visibilitychange without a refetch loop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let title = admin.commercialTitle;
  let fetches = 0;
  await openUsers(page, () => title, () => { fetches += 1; });

  title = 'Diretor Comercial';
  await page.evaluate(() => window.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByText(title)).toBeVisible();
  expect(fetches).toBe(2);
  await page.waitForTimeout(250);
  expect(fetches).toBe(2);
});
