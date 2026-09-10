import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
}

const mobileViewports = [
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 }
];

test.describe('public mobile responsive closeout', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('keeps the post-hero trust strip aligned with uniform mobile dividers', async ({ page }) => {
    await page.goto('/');

    const trust = page.getByLabel('Diferenciais principais');
    const items = trust.locator('span');

    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveText('Atendimento personalizado');
    await expect(items.nth(1)).toHaveText('Estrutura completa sob consulta');
    await expect(items.nth(2)).toHaveText('Brasília/DF e região');

    const layout = await items.evaluateAll((elements) => {
      const boxes = elements.map((element) => element.getBoundingClientRect());
      const dividerStyles = elements.slice(1).map((element) => window.getComputedStyle(element, '::before'));

      return {
        lefts: boxes.map((box) => Math.round(box.left)),
        widths: boxes.map((box) => Math.round(box.width)),
        dividerWidths: dividerStyles.map((style) => style.width),
        dividerHeights: dividerStyles.map((style) => style.height),
        dividerOpacity: dividerStyles.map((style) => style.opacity),
        maxRight: Math.max(...boxes.map((box) => box.right)),
        viewportWidth: window.innerWidth
      };
    });

    expect(new Set(layout.lefts).size).toBe(1);
    expect(new Set(layout.widths).size).toBe(1);
    expect(new Set(layout.dividerWidths).size).toBe(1);
    expect(new Set(layout.dividerHeights).size).toBe(1);
    expect(new Set(layout.dividerOpacity).size).toBe(1);
    expect(layout.maxRight).toBeLessThanOrEqual(layout.viewportWidth);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps events as a balanced 2x2 grid on mobile without page overflow', async ({ page }) => {
    await page.goto('/');

    const section = page.locator('#eventos');
    const cards = section.locator('article');

    await expect(cards).toHaveCount(4);

    const layout = await cards.evaluateAll((elements) => {
      const boxes = elements.map((element) => element.getBoundingClientRect());

      return {
        uniqueLefts: new Set(boxes.map((box) => Math.round(box.left))).size,
        uniqueTops: new Set(boxes.map((box) => Math.round(box.top))).size,
        maxRight: Math.max(...boxes.map((box) => box.right)),
        viewportWidth: window.innerWidth
      };
    });

    expect(layout.uniqueLefts).toBe(2);
    expect(layout.uniqueTops).toBe(2);
    expect(layout.maxRight).toBeLessThanOrEqual(layout.viewportWidth);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps menu categories in two columns on mobile with semantic order preserved', async ({ page }) => {
    await page.goto('/');

    const menu = page.getByLabel('Categorias de cardapio');
    const items = menu.locator('li');

    await expect(items).toHaveCount(8);
    await expect(items.nth(0)).toContainText('Entradas');
    await expect(items.nth(1)).toContainText('Saladas');
    await expect(items.nth(7)).toContainText('Churrasco');

    const layout = await items.evaluateAll((elements) => {
      const boxes = elements.map((element) => element.getBoundingClientRect());

      return {
        uniqueLefts: new Set(boxes.map((box) => Math.round(box.left))).size,
        maxRight: Math.max(...boxes.map((box) => box.right)),
        viewportWidth: window.innerWidth
      };
    });

    expect(layout.uniqueLefts).toBe(2);
    expect(layout.maxRight).toBeLessThanOrEqual(layout.viewportWidth);
    await expectNoHorizontalOverflow(page);
  });

  for (const viewport of mobileViewports) {
    test(`keeps menu titles readable and contained at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const menu = page.getByLabel('Categorias de cardapio');
      const items = menu.locator('li');

      await expect(items).toHaveCount(8);

      const layout = await items.evaluateAll((elements) => {
        const boxes = elements.map((element) => element.getBoundingClientRect());
        const titles = elements.map((element) => element.querySelector('strong'));
        const titleBoxes = titles.map((title) => title?.getBoundingClientRect());
        const accompaniment = titles.find((title) => title?.textContent === 'Acompanhamentos');
        const accompanimentRange = document.createRange();

        if (!accompaniment) {
          throw new Error('Acompanhamentos title was not found');
        }

        accompanimentRange.selectNodeContents(accompaniment);

        return {
          itemCount: elements.length,
          uniqueLefts: new Set(boxes.map((box) => Math.round(box.left))).size,
          uniqueTops: new Set(boxes.map((box) => Math.round(box.top))).size,
        order: elements.map((element) => {
          const number = element.querySelector('span')?.textContent?.trim();
          const title = element.querySelector('strong')?.textContent?.trim();
          return `${number} ${title}`;
        }),
          maxTitleRight: Math.max(...titleBoxes.map((box) => box?.right ?? 0)),
          minTitleLeft: Math.min(...titleBoxes.map((box) => box?.left ?? Number.POSITIVE_INFINITY)),
          maxItemRight: Math.max(...boxes.map((box) => box.right)),
          viewportWidth: window.innerWidth,
          accompanimentText: accompaniment.textContent,
          accompanimentRects: Array.from(accompanimentRange.getClientRects()).length,
          accompanimentOverflowWrap: window.getComputedStyle(accompaniment).overflowWrap,
          accompanimentWordBreak: window.getComputedStyle(accompaniment).wordBreak
        };
      });

      expect(layout.itemCount).toBe(8);
      expect(layout.uniqueLefts).toBe(2);
      expect(layout.uniqueTops).toBe(4);
      expect(layout.order).toEqual([
        '01 Entradas',
        '02 Saladas',
        '03 Proteínas',
        '04 Massas e molhos',
        '05 Acompanhamentos',
        '06 Bebidas',
        '07 Mesa de café',
        '08 Churrasco'
      ]);
      expect(layout.accompanimentText).toBe('Acompanhamentos');
      expect(layout.accompanimentRects).toBe(1);
      expect(layout.accompanimentOverflowWrap).toBe('normal');
      expect(layout.accompanimentWordBreak).toBe('normal');
      expect(layout.minTitleLeft).toBeGreaterThanOrEqual(0);
      expect(layout.maxTitleRight).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.maxItemRight).toBeLessThanOrEqual(layout.viewportWidth);
      await expectNoHorizontalOverflow(page);
    });
  }

  for (const route of ['/', '/orcamento', '/privacidade']) {
    test(`keeps the legal footer readable on mobile at ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(route);

      const footer = page.locator('footer');
      const cnpj = footer.getByText('59.973.986/0001-29', { exact: true });

      await expect(footer.getByText(/© \d{4} Paladar Buffet\./)).toBeVisible();
      await expect(footer.getByText('Buffet e Restaurante Paladar LTDA', { exact: true })).toBeVisible();
      await expect(cnpj).toBeVisible();

      const layout = await cnpj.evaluate((element) => {
        const cnpjBox = element.getBoundingClientRect();
        const footerBox = element.closest('footer')?.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(element);

        return {
          cnpjText: element.textContent,
          cnpjRects: Array.from(range.getClientRects()).length,
          cnpjLeft: cnpjBox.left,
          cnpjRight: cnpjBox.right,
          footerLeft: footerBox?.left ?? 0,
          footerRight: footerBox?.right ?? window.innerWidth,
          viewportWidth: window.innerWidth,
          whiteSpace: window.getComputedStyle(element).whiteSpace
        };
      });

      expect(layout.cnpjText).toBe('59.973.986/0001-29');
      expect(layout.cnpjRects).toBe(1);
      expect(layout.whiteSpace).toBe('nowrap');
      expect(layout.cnpjLeft).toBeGreaterThanOrEqual(layout.footerLeft);
      expect(layout.cnpjRight).toBeLessThanOrEqual(layout.footerRight);
      expect(layout.cnpjRight).toBeLessThanOrEqual(layout.viewportWidth);
      await expectNoHorizontalOverflow(page);
    });
  }

  test('shows the active gallery card image and caption as a complete mobile unit', async ({ page }) => {
    await page.goto('/');

    const gallery = page.getByLabel('Galeria Paladar Buffet');
    await gallery.scrollIntoViewIfNeeded();

    const buttons = page.getByLabel('Navegação da galeria').getByRole('button');
    await expect(buttons).toHaveCount(8);
    await expect(buttons.first()).toBeVisible();

    const firstCard = gallery.getByRole('figure').first();
    await expect(firstCard.getByRole('img', { name: 'Churrasco fatiado' })).toBeVisible();
    await expect(firstCard.getByText('CORTE', { exact: true })).toBeVisible();
    await expect(firstCard.getByText('Churrasco fatiado')).toBeVisible();

    const cardBox = await firstCard.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return {
        top: box.top,
        bottom: box.bottom,
        left: box.left,
        right: box.right,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    });

    expect(cardBox.top).toBeGreaterThanOrEqual(0);
    expect(cardBox.bottom).toBeLessThanOrEqual(cardBox.viewportHeight);
    expect(cardBox.left).toBeGreaterThanOrEqual(0);
    expect(cardBox.right).toBeLessThanOrEqual(cardBox.viewportWidth);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps quote controls inside the mobile viewport', async ({ page }) => {
    await page.goto('/orcamento');

    const layout = await page.evaluate(() => {
      const form = document.querySelector('form');
      const controls = Array.from(document.querySelectorAll('input, select, textarea, button'));

      if (!(form instanceof HTMLElement)) {
        throw new Error('Quote form was not found');
      }

      const formBox = form.getBoundingClientRect();
      const controlBoxes = controls
        .filter((element): element is HTMLElement => element instanceof HTMLElement && element.offsetParent !== null)
        .map((element) => element.getBoundingClientRect());

      return {
        formRight: formBox.right,
        maxRight: Math.max(...controlBoxes.map((box) => box.right)),
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    expect(layout.maxRight).toBeLessThanOrEqual(layout.formRight + 1);
    expect(layout.maxRight).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
  });
});
