import { test, expect } from '@playwright/test';
import { PAGES, messages, open, ready, trackConsoleErrors } from './helpers.js';

const INTENTIONAL_MISSING = 'designSystem.sample.intentionallyMissing';

test.describe('missing translations', () => {
  for (const lang of ['es', 'en']) {
    for (const p of PAGES) {
      test(`no .i18n-missing on ${p.name} in ${lang}`, async ({ page }) => {
        await open(page, p.path, lang);
        // open the calculator's extra UI so conditional strings render too
        if (p.page === 'calculator') {
          await page.fill('#calc-input-aportes', '300');
          await page.fill('#calc-input-promedio', '1200');
          await page.fill('#calc-input-edad', '55');
          await page.fill('#calc-input-deseada', '900');
          await page.click('#calc-tab-tables');
        }
        if (p.page === 'design-system') {
          const markers = await page.locator('.i18n-missing').allInnerTexts();
          expect(markers).toEqual(['⚠ missing: ' + INTENTIONAL_MISSING]);
          expect(messages[lang].designSystem.sample?.intentionallyMissing).toBeUndefined();
        } else {
          await expect(page.locator('.i18n-missing')).toHaveCount(0);
        }
      });
    }
  }

  test('a key missing from en.json shows a red marker and logs a console error', async ({ page }) => {
    const en = structuredClone(messages.en);
    delete en.landing.hero.cta;
    await page.route('**/i18n/en.json', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(en) }));
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await open(page, '', 'en');
    const marker = page.locator('#landing-hero-cta .i18n-missing');
    await expect(marker).toHaveText('⚠ missing: landing.hero.cta');
    expect(await marker.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(209, 0, 0)');
    expect(errors.some((e) => e.includes('landing.hero.cta'))).toBe(true);
  });
});

test.describe('console', () => {
  for (const lang of ['es', 'en']) {
    for (const p of PAGES.filter((x) => x.page !== 'design-system')) {
      test(`no console errors on ${p.name} in ${lang}`, async ({ page }) => {
        const errors = trackConsoleErrors(page);
        await open(page, p.path, lang);
        if (p.page === 'calculator') {
          await page.fill('#calc-input-deseada', '900');
          await page.click('#calc-tab-tables');
        }
        expect(errors).toEqual([]);
      });
    }
  }

  test('design system page logs only the intentional missing-key error', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await open(page, 'design-system/');
    expect(errors.filter((e) => !e.includes(INTENTIONAL_MISSING) && !/fonts\.g/.test(e))).toEqual([]);
  });
});

test.describe('360px viewport', () => {
  test.use({ viewport: { width: 360, height: 780 } });
  for (const lang of ['es', 'en']) {
    for (const p of PAGES) {
      test(`no horizontal scroll on ${p.name} in ${lang}`, async ({ page }) => {
        await open(page, p.path, lang);
        if (p.page === 'calculator') {
          await page.fill('#calc-input-deseada', '900');
          expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
          await page.click('#calc-tab-tables');
        }
        if (p.page === 'design-system') {
          for (const t of ['brand', 'elements', 'components', 'sections', 'exploration']) {
            await page.click(`#ds-tab-${t}`);
            expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
          }
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      });
    }
  }

  test('toggle and nav are usable at 360px', async ({ page }) => {
    await open(page, '');
    await expect(page.locator('#lang-toggle-en')).toBeInViewport();
    await page.click('#lang-toggle-en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#site-nav-link-calculator')).toBeInViewport();
    await page.click('#site-nav-link-calculator');
    await expect(page).toHaveURL(/\/calculadora\/$/);
    const toggle = await page.locator('#lang-toggle').boundingBox();
    expect(toggle.x + toggle.width).toBeLessThanOrEqual(360);
  });
});

test.describe('ids', () => {
  for (const p of PAGES) {
    test(`ids are unique and interface elements have one on ${p.name}`, async ({ page }) => {
      await open(page, p.path);
      if (p.page === 'calculator') {
        await page.fill('#calc-input-aportes', '300');
        await page.fill('#calc-input-promedio', '1200');
        await page.fill('#calc-input-edad', '55');
        await page.fill('#calc-input-deseada', '900');
      }
      if (p.page === 'design-system') {
        for (const t of ['brand', 'elements', 'components', 'sections', 'exploration']) await page.click(`#ds-tab-${t}`);
      }
      const res = await page.evaluate(() => {
        const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        const kebab = ids.filter((id) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id));
        const missing = [...document.querySelectorAll('button, a, input, table, section, nav, details')]
          .filter((e) => !e.id).map((e) => e.outerHTML.slice(0, 100));
        return { dupes, kebab, missing };
      });
      expect(res.dupes).toEqual([]);
      expect(res.kebab).toEqual([]);
      expect(res.missing).toEqual([]);
    });
  }
});

test('Alpine is ready before any content is shown (no flash)', async ({ page }) => {
  await page.goto('');
  await ready(page);
  await expect(page.locator('body')).not.toHaveAttribute('x-cloak', /.*/);
});
