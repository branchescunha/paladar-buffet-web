import { expect, test } from '@playwright/test';

const viewports = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '430x932', width: 430, height: 932 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 },
  { name: '360x800', width: 360, height: 800 }
];

for (const viewport of viewports) {
  test(`keeps the hero media below the header with a top-safe crop at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');

    const hero = page.locator('main > section').first();
    const mediaImage = hero.locator('img[src$="owner-waiter-hero.png"]');

    await expect(page.getByRole('heading', { name: /buffet completo para eventos em brasília/i })).toBeVisible();
    await expect(mediaImage).toBeVisible();

    const geometry = await page.evaluate(() => {
      const headerElement = document.querySelector('header');
      const heroElement = document.querySelector('main > section');
      const imageElement = document.querySelector<HTMLImageElement>('img[src$="owner-waiter-hero.png"]');

      if (!headerElement || !heroElement || !imageElement) {
        throw new Error('Hero geometry elements were not found');
      }

      const headerBox = headerElement.getBoundingClientRect();
      const heroBox = heroElement.getBoundingClientRect();
      const imageStyles = window.getComputedStyle(imageElement);
      const matrix = new DOMMatrixReadOnly(imageStyles.transform === 'none' ? undefined : imageStyles.transform);
      const [, objectY = '50%'] = imageStyles.objectPosition.split(' ');

      return {
        headerBottom: headerBox.bottom,
        heroTop: heroBox.top,
        heroHeight: heroBox.height,
        imageHeight: imageElement.getBoundingClientRect().height,
        objectY: Number.parseFloat(objectY),
        scaleY: matrix.d || 1
      };
    });

    expect(geometry.heroTop).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
    expect(geometry.heroHeight).toBeGreaterThan(500);
    expect(geometry.imageHeight).toBeGreaterThan(500);
    expect(geometry.objectY).toBeLessThanOrEqual(35);
    expect(geometry.scaleY).toBeLessThanOrEqual(1.01);
  });
}
