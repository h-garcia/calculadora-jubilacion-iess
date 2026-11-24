import { test, expect } from '@playwright/test';
import { PAGES, msg, open, ready } from './helpers.js';

const LINKS = [
  { id: 'site-nav-link-home', page: 'home', url: /\/$/ },
  { id: 'site-nav-link-calculator', page: 'calculator', url: /\/calculadora\/$/ },
  { id: 'site-nav-link-design-system', page: 'design-system', url: /\/design-system\/$/ },
];

for (const p of PAGES) {
  test.describe(`navigation on ${p.name}`, () => {
    test('nav shows three links and marks the current page', async ({ page }) => {
      await open(page, p.path);
      for (const l of LINKS) {
        await expect(page.locator(`#${l.id}`)).toBeVisible();
        if (l.page === p.page) await expect(page.locator(`#${l.id}`)).toHaveAttribute('aria-current', 'page');
        else await expect(page.locator(`#${l.id}`)).not.toHaveAttribute('aria-current', /.*/);
      }
    });

    for (const l of LINKS) {
      test(`link ${l.page} works`, async ({ page }) => {
        await open(page, p.path);
        await page.click(`#${l.id}`);
        await expect(page).toHaveURL(l.url);
        await ready(page);
        await expect(page.locator(`#${l.id}`)).toHaveAttribute('aria-current', 'page');
      });
    }

    test('brand link goes home', async ({ page }) => {
      await open(page, p.path);
      await page.click('#site-nav-brand');
      await expect(page).toHaveURL(/\/$/);
    });

    test('toggle sits in the top-right corner of the header', async ({ page }) => {
      await open(page, p.path);
      const nav = await page.locator('.site-nav__inner').first().boundingBox();
      const toggle = await page.locator('#lang-toggle').boundingBox();
      expect(toggle.x + toggle.width).toBeGreaterThan(nav.x + nav.width - 24 - 16);
      expect(toggle.y).toBeLessThan(nav.y + 40);
    });

    test('internal URLs are relative (work under a project subpath)', async ({ page }) => {
      await open(page, p.path);
      const abs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], link[href], script[src]')]
          .map((el) => el.getAttribute('href') || el.getAttribute('src'))
          .filter((u) => u.startsWith('/') && !u.startsWith('//')));
      expect(abs).toEqual([]);
    });
  });
}

test('hero CTA opens the calculator page', async ({ page }) => {
  await open(page, '');
  await page.click('#landing-hero-cta');
  await expect(page).toHaveURL(/\/calculadora\/$/);
  await ready(page);
  await expect(page.locator('#calc-root')).toBeVisible();
});

test('hero secondary link jumps to the rules section', async ({ page }) => {
  await open(page, '');
  await page.click('#landing-hero-secondary');
  await expect(page).toHaveURL(/#rules$/);
  await expect(page.locator('#rules')).toBeInViewport();
});

test('hero texts are Spanish by default', async ({ page }) => {
  await open(page, '');
  await expect(page.locator('#landing-hero-cta')).toHaveText(msg('es', 'landing.hero.cta'));
});
