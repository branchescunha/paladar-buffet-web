import { expect, test } from '@playwright/test';

const expectedGallery = [
  ['CORTE', 'Churrasco fatiado', 'gallery-sliced-beef-final.jpg'],
  ['BRASA', 'Montagem na brasa', 'gallery-grill-prep-final.jpg'],
  ['BUFFET', 'Massas e acompanhamentos', 'gallery-pasta-sides-final.jpg'],
  ['ACOMPANHAMENTOS', 'Molhos e acompanhamentos', 'gallery-sauces-sides-final.jpg'],
  ['CAFÉ', 'Café e bebidas', 'gallery-coffee-drinks-final.jpg'],
  ['MESA', 'Mesa posta', 'gallery-table-setting-final.jpg'],
  ['CHURRASCO', 'Churrasco na brasa', 'gallery-grilled-meats-final.jpg'],
  ['SOBREMESAS', 'Sobremesas montadas', 'gallery-desserts-final.jpg']
];

test('loads the eight final gallery cards with unique categories and images', async ({ page }) => {
  await page.goto('/');

  const gallery = page.getByLabel('Galeria Paladar Buffet');
  await gallery.scrollIntoViewIfNeeded();

  const cards = gallery.getByRole('figure');
  await expect(cards).toHaveCount(8);

  for (const [index, [category, title, asset]] of expectedGallery.entries()) {
    await page.getByRole('button', { name: `Ver imagem ${index + 1}: ${title}` }).click();

    const card = cards.nth(index);
    await expect(card.getByText(category, { exact: true })).toBeVisible();
    await expect(card.getByText(title)).toBeVisible();

    const image = card.getByRole('img', { name: title });
    await expect(image).toHaveAttribute('src', new RegExp(asset.replace('.', '\\.')));
    await expect
      .poll(async () => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});
