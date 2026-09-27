import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');
const title = 'Paladar Buffet | Buffet para Eventos em Brasília';
const description = 'Buffet para eventos em Brasília e região, com atendimento personalizado e cardápios preparados para cada ocasião.';
const siteUrl = 'https://buffetpaladar.com.br/';
const socialImageUrl = `${siteUrl}assets/paladar/owner-waiter-hero.png`;

describe('public install and sharing metadata', () => {
  it('publishes the approved browser and social metadata with existing assets', async () => {
    const html = await readFile(path.join(projectRoot, 'index.html'), 'utf8');
    const document = new DOMParser().parseFromString(html, 'text/html');

    expect(document.title).toBe(title);
    expect(metaContent(document, 'name', 'description')).toBe(description);
    expect(metaContent(document, 'name', 'theme-color')).toBe('#132415');
    expect(metaContent(document, 'property', 'og:type')).toBe('website');
    expect(metaContent(document, 'property', 'og:title')).toBe(title);
    expect(metaContent(document, 'property', 'og:description')).toBe(description);
    expect(metaContent(document, 'property', 'og:url')).toBe(siteUrl);
    expect(metaContent(document, 'property', 'og:site_name')).toBe('Paladar Buffet');
    expect(metaContent(document, 'property', 'og:image')).toBe(socialImageUrl);
    expect(metaContent(document, 'name', 'twitter:card')).toBe('summary_large_image');
    expect(metaContent(document, 'name', 'twitter:title')).toBe(title);
    expect(metaContent(document, 'name', 'twitter:description')).toBe(description);
    expect(metaContent(document, 'name', 'twitter:image')).toBe(socialImageUrl);
    expect(linkHref(document, 'canonical')).toBe(siteUrl);

    const localAssets = [
      linkHref(document, 'icon'),
      linkHref(document, 'apple-touch-icon'),
      linkHref(document, 'manifest'),
      '/assets/paladar/owner-waiter-hero.png'
    ];

    await Promise.all(localAssets.map((asset) => access(publicPath(asset))));
    await expectPngSize('/icons/favicon-64.png', 64);
    await expectPngSize('/apple-touch-icon.png', 180);
  });

  it('provides a valid lightweight manifest with regular and maskable icons', async () => {
    const manifest = JSON.parse(await readFile(path.join(publicRoot, 'manifest.webmanifest'), 'utf8')) as WebManifest;

    expect(manifest).toMatchObject({
      name: 'Paladar Buffet',
      short_name: 'Paladar',
      description,
      start_url: '/admin',
      scope: '/',
      display: 'standalone',
      background_color: '#F7F5EF',
      theme_color: '#132415'
    });
    expect(manifest.icons).toEqual([
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]);

    await Promise.all(manifest.icons.map(async (icon) => {
      await access(publicPath(icon.src));
      await expectPngSize(icon.src, Number.parseInt(icon.sizes, 10));
    }));
  });
});

function metaContent(document: Document, attribute: 'name' | 'property', value: string) {
  return document.querySelector<HTMLMetaElement>(`meta[${attribute}="${value}"]`)?.content;
}

function linkHref(document: Document, relation: string) {
  const href = document.querySelector<HTMLLinkElement>(`link[rel="${relation}"]`)?.getAttribute('href');
  expect(href).toBeTruthy();
  return href as string;
}

function publicPath(assetPath: string) {
  return path.join(publicRoot, assetPath.replace(/^\//, ''));
}

async function expectPngSize(assetPath: string, expectedSize: number) {
  const png = await readFile(publicPath(assetPath));
  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(expectedSize);
  expect(png.readUInt32BE(20)).toBe(expectedSize);
}

interface WebManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: Array<{ src: string; sizes: string; type: string; purpose: string }>;
}
