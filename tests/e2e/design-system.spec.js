import { test, expect } from '@playwright/test';
import { messages, open } from './helpers.js';

const TABS = ['brand', 'elements', 'components', 'sections', 'exploration'];
const COLOR_TOKENS = ['bg', 'surface', 'surface-alt', 'text', 'muted', 'border', 'primary', 'primary-strong',
  'on-primary', 'accent', 'highlight-bg', 'ok', 'ok-bg', 'warn', 'warn-bg', 'missing'];

test('five tabs in the required order with tab semantics', async ({ page }) => {
  await open(page, 'design-system/');
  const tabs = page.locator('#ds-tablist [role="tab"]');
  await expect(tabs).toHaveCount(5);
  expect(await tabs.evaluateAll((els) => els.map((e) => e.id))).toEqual(TABS.map((t) => `ds-tab-${t}`));
  expect(await tabs.allInnerTexts()).toEqual(TABS.map((t) => messages.es.designSystem.tabs[t]));
  await expect(page.locator('#ds-tablist')).toHaveCount(1);
  await expect(page.locator('#ds-tab-brand')).toHaveAttribute('aria-selected', 'true');
  for (const t of TABS) {
    await page.click(`#ds-tab-${t}`);
    await expect(page.locator(`#ds-tab-${t}`)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator(`#ds-tab-${t}`)).toHaveAttribute('aria-controls', `ds-tabpanel-${t}`);
    await expect(page.locator(`#ds-tabpanel-${t}`)).toBeVisible();
    await expect(page.locator(`#ds-tabpanel-${t}`)).toHaveAttribute('aria-labelledby', `ds-tab-${t}`);
    for (const other of TABS.filter((o) => o !== t)) await expect(page.locator(`#ds-tabpanel-${other}`)).toBeHidden();
  }
});

test('brand tab shows a swatch for every color token, type, spacing, radius, wordmark', async ({ page }) => {
  await open(page, 'design-system/');
  await expect(page.locator('#ds-brand-swatches .ds-swatch')).toHaveCount(COLOR_TOKENS.length);
  for (const t of COLOR_TOKENS) {
    const sw = page.locator(`#ds-brand-swatch-${t}`);
    await expect(sw).toContainText(`--color-${t}`);
    expect(await sw.locator('.ds-swatch__chip').getAttribute('style')).toContain(`var(--color-${t})`);
  }
  await expect(page.locator('#ds-brand-type .ds-specimen')).toHaveCount(6);
  await expect(page.locator('#ds-brand-spacing .ds-specimen')).toHaveCount(8);
  await expect(page.locator('#ds-brand-radius .ds-specimen')).toHaveCount(3);
  await expect(page.locator('#ds-brand-wordmark')).toContainText(messages.es.common.siteName);
});

test('elements tab labels each element by class and has the missing-key sample', async ({ page }) => {
  await open(page, 'design-system/');
  await page.click('#ds-tab-elements');
  for (const cls of ['.btn--primary', '.btn--secondary', '.btn--link', '.field', '.badge', '.alert--ok', '.alert--warn', '.alert--info', '.eyebrow', '.lead', '.note', '.table', '.i18n-missing']) {
    await expect(page.locator('#ds-tabpanel-elements .ds-specimen__label', { hasText: cls }).first()).toBeVisible();
  }
  await expect(page.locator('#ds-tabpanel-elements .i18n-missing')).toHaveCount(1);
  await expect(page.locator('.i18n-missing')).toHaveCount(1);
});

test('components tab shows nav, lang toggle, card, stats, step card, tabs, faq item, notice', async ({ page }) => {
  await open(page, 'design-system/');
  await page.click('#ds-tab-components');
  for (const cls of ['.site-nav', '.lang-toggle', '.card', '.stat', '.step-card', '.tabs', '.faq-item', '.notice']) {
    await expect(page.locator('#ds-tabpanel-components .ds-specimen__label', { hasText: cls }).first()).toBeVisible();
  }
});

test('sections tab renders every section partial with prefixed ids', async ({ page }) => {
  await open(page, 'design-system/');
  await page.click('#ds-tab-sections');
  for (const id of ['ds-site-nav', 'ds-landing-hero', 'ds-landing-how', 'ds-rules', 'ds-landing-faq', 'ds-site-disclaimer', 'ds-site-footer', 'ds-calc-root']) {
    await expect(page.locator(`#ds-tabpanel-sections #${id}`)).toHaveCount(1);
  }
  await expect(page.locator('#ds-tabpanel-sections #ds-landing-faq details')).toHaveCount(6);
});

test('exploration tab shows 5 named directions; production pages do not depend on explorations', async ({ page }) => {
  await open(page, 'design-system/');
  await page.click('#ds-tab-exploration');
  await expect(page.locator('#ds-tabpanel-exploration article.direction')).toHaveCount(5);
  for (const d of ['andes', 'pacifico', 'civico', 'cacao', 'claro']) {
    await expect(page.locator(`#exploration-${d}-name`)).toContainText(messages.es.designSystem.exploration.directions[d].name);
  }
  await expect(page.locator('link[href*="2026-11-24-directions.css"]')).toHaveCount(1);
  for (const path of ['', 'calculadora/']) {
    await open(page, path);
    await expect(page.locator('link[href*="exploration"]')).toHaveCount(0);
  }
});

// Production uses the chosen direction "Claro": its fonts (Inter + Space Grotesk) and the four design-system CSS files only.
test('production pages link only the chosen fonts and the four design-system CSS files', async ({ page }) => {
  for (const path of ['', 'calculadora/']) {
    await open(page, path);
    const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    const fonts = hrefs.filter((h) => h.includes('fonts.googleapis.com'));
    expect(fonts).toHaveLength(1);
    const families = [...fonts[0].matchAll(/family=([^:&]+)/g)].map((m) => m[1]).sort();
    expect(families).toEqual(['Inter', 'Space+Grotesk']);
    expect(hrefs.filter((h) => !h.includes('fonts.googleapis.com')).map((h) => h.replace(/^(\.\.\/)?/, ''))).toEqual([
      'design-system/brand/tokens.css', 'design-system/elements/elements.css',
      'design-system/components/components.css', 'design-system/sections/sections.css']);
    const headingFont = await page.locator('h1').first().evaluate((el) => getComputedStyle(el).fontFamily);
    expect(headingFont).toContain('Space Grotesk');
  }
});
