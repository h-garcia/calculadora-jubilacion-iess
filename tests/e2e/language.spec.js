import { test, expect } from '@playwright/test';
import { PAGES, messages, msg, open, ready } from './helpers.js';

const TITLE_KEY = { home: 'landing.meta.title', calculator: 'calc.meta.title', 'design-system': 'designSystem.meta.title' };
const H1_ID = { home: 'landing-hero-title', calculator: 'calc-page-title', 'design-system': 'ds-page-title' };
const H1_KEY = { home: 'landing.hero.title', calculator: 'calc.title', 'design-system': 'designSystem.title' };

for (const p of PAGES) {
  test.describe(`language toggle on ${p.name}`, () => {
    test('defaults to Spanish', async ({ page }) => {
      await open(page, p.path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(page.locator('#lang-toggle-es')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#lang-toggle-en')).toHaveAttribute('aria-pressed', 'false');
      await expect(page.locator(`#${H1_ID[p.page]}`)).toHaveText(msg('es', H1_KEY[p.page]));
      await expect(page).toHaveTitle(msg('es', TITLE_KEY[p.page]));
    });

    test('EN switches strings, html lang and title; persists; ES switches back', async ({ page }) => {
      await open(page, p.path);
      await page.click('#lang-toggle-en');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator('#lang-toggle-en')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator(`#${H1_ID[p.page]}`)).toHaveText(msg('en', H1_KEY[p.page]));
      await expect(page).toHaveTitle(msg('en', TITLE_KEY[p.page]));
      await expect(page.locator('#site-nav-link-home')).toHaveText(messages.en.common.nav.home);
      await expect(page.locator('#site-nav-link-calculator')).toHaveText(messages.en.common.nav.calculator);
      await expect(page.locator('#site-nav-link-design-system')).toHaveText(messages.en.common.nav.designSystem);

      await page.reload();
      await ready(page);
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await expect(page.locator(`#${H1_ID[p.page]}`)).toHaveText(msg('en', H1_KEY[p.page]));

      // persists across navigation to every other page
      for (const other of PAGES.filter((o) => o !== p)) {
        await page.click(`#site-nav-link-${other.page === 'home' ? 'home' : other.page}`);
        await ready(page);
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator(`#${H1_ID[other.page]}`)).toHaveText(msg('en', H1_KEY[other.page]));
        await page.goBack();
        await ready(page);
      }

      await page.click('#lang-toggle-es');
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await expect(page.locator(`#${H1_ID[p.page]}`)).toHaveText(msg('es', H1_KEY[p.page]));
    });

    for (const lang of ['es', 'en']) {
      test(`every literal x-t string renders its ${lang} text`, async ({ page }) => {
        await open(page, p.path, lang);
        const bad = await page.evaluate((json) => {
          const get = (key) => key.split('.').reduce((o, k) => (o == null ? o : o[k]), json);
          const out = [];
          for (const el of document.querySelectorAll('[x-t]')) {
            const m = /^'([^']+)'$/.exec(el.getAttribute('x-t').trim());
            if (!m) continue;
            const expected = get(m[1]);
            if (expected === undefined) continue; // intentional missing sample
            if (el.textContent !== expected) out.push([m[1], el.textContent, expected]);
          }
          return out;
        }, messages[lang]);
        expect(bad).toEqual([]);
      });
    }
  });
}
