import { test, expect } from '@playwright/test';
import { PAGES, open } from './helpers.js';

for (const p of PAGES) {
  test(`Tab reaches nav links and the language toggle on ${p.name}`, async ({ page }) => {
    await open(page, p.path);
    const seen = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      seen.push(await page.evaluate(() => document.activeElement.id));
    }
    for (const id of ['site-nav-link-home', 'site-nav-link-calculator', 'site-nav-link-design-system', 'lang-toggle-es', 'lang-toggle-en']) {
      expect(seen).toContain(id);
    }
  });

  test(`Enter and Space switch the language on ${p.name}`, async ({ page }) => {
    await open(page, p.path);
    await page.focus('#lang-toggle-en');
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.focus('#lang-toggle-es');
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
}

test('skip link is the first tab stop and targets main', async ({ page }) => {
  await open(page, '');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement.id)).toBe('skip-link');
  await expect(page.locator('main#main')).toHaveCount(1);
});

test('nav link can be activated with Enter', async ({ page }) => {
  await open(page, '');
  await page.focus('#site-nav-link-calculator');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/calculadora\/$/);
});

test('arrow keys move between calculator tabs', async ({ page }) => {
  await open(page, 'calculadora/');
  await page.focus('#calc-tab-calc');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#calc-tab-tables')).toBeFocused();
  await expect(page.locator('#calc-tab-tables')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#calc-tabpanel-tables')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#calc-tab-calc')).toBeFocused();
  await expect(page.locator('#calc-tabpanel-calc')).toBeVisible();
});

test('arrow keys, Home and End move between design-system tabs', async ({ page }) => {
  await open(page, 'design-system/');
  const order = ['brand', 'elements', 'components', 'sections', 'exploration'];
  await page.focus('#ds-tab-brand');
  for (const t of order.slice(1)) {
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`#ds-tab-${t}`)).toBeFocused();
    await expect(page.locator(`#ds-tab-${t}`)).toHaveAttribute('aria-selected', 'true');
  }
  await page.keyboard.press('ArrowRight'); // wraps
  await expect(page.locator('#ds-tab-brand')).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.locator('#ds-tab-exploration')).toBeFocused();
  await page.keyboard.press('Home');
  await expect(page.locator('#ds-tab-brand')).toBeFocused();
});
