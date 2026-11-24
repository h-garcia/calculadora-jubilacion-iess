import { test, expect } from '@playwright/test';
import { msg, open, ready } from './helpers.js';

const ORDER = ['landing-hero', 'landing-how', 'rules', 'landing-faq', 'site-disclaimer', 'site-footer'];

for (const lang of ['es', 'en']) {
  test.describe(`landing in ${lang}`, () => {
    test('has hero, how it works, rules, FAQ, disclaimer and footer in order', async ({ page }) => {
      await open(page, '', lang);
      const pos = await page.evaluate((ids) => ids.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : null;
      }), ORDER);
      expect(pos.every((v) => v !== null)).toBe(true);
      expect([...pos].sort((a, b) => a - b)).toEqual(pos);
      await expect(page.locator('main#main #landing-hero')).toHaveCount(1);
      await expect(page.locator('#landing-hero-title')).toHaveText(msg(lang, 'landing.hero.title'));
      await expect(page.locator('#landing-how .step-card')).toHaveCount(3);
      await expect(page.locator('#rules-title')).toHaveText(msg(lang, 'landing.rules.title'));
    });

    test('FAQ has 6 questions with answers', async ({ page }) => {
      await open(page, '', lang);
      await expect(page.locator('#landing-faq details.faq-item')).toHaveCount(6);
      for (let i = 1; i <= 6; i++) {
        await expect(page.locator(`#faq-item-q${i}-question`)).toHaveText(msg(lang, `landing.faq.q${i}.question`));
        await expect(page.locator(`#faq-item-q${i}-answer`)).toHaveText(msg(lang, `landing.faq.q${i}.answer`));
      }
      await page.click('#faq-item-q1-question');
      await expect(page.locator('#faq-item-q1')).toHaveAttribute('open', '');
    });

    test('disclaimer links to the official IESS site; footer has repo link and SBU', async ({ page }) => {
      await open(page, '', lang);
      const link = page.locator('#site-disclaimer-link');
      await expect(link).toHaveAttribute('href', 'https://www.iess.gob.ec/');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
      await expect(page.locator('#site-disclaimer-body')).toHaveText(msg(lang, 'disclaimer.body'));
      await expect(page.locator('#site-footer-repo-link')).toHaveAttribute('href', 'https://github.com/h-garcia/calculadora-jubilacion-iess');
      await expect(page.locator('#site-footer-source')).toHaveText(msg(lang, 'footer.source').replace('{year}', '2026').replace('{sbu}', '$482'));
    });

    test('rules tables show the data (min, max, coefficients)', async ({ page }) => {
      await open(page, '', lang);
      await expect(page.locator('#rules-eligibility-table tbody tr')).toHaveCount(4);
      await expect(page.locator('#rules-min-pension-table tbody tr')).toHaveCount(6);
      await expect(page.locator('#rules-max-pension-table tbody tr')).toHaveCount(7);
      await expect(page.locator('#rules-coefficient-table tbody tr')).toHaveCount(46);
      await expect(page.locator('#rules-max-pension')).toBeVisible();
      await expect(page.locator('#rules-tables-max-row-y40plus')).toContainText('550%');
      await expect(page.locator('#rules-tables-max-row-y40plus')).toContainText('$2,651');
      await expect(page.locator('#rules-tables-min-row-y11to20')).toContainText('60%');
      await expect(page.locator('#rules-tables-min-row-y11to20')).toContainText('$289');
      await expect(page.locator('#rules-tables-coef-row-25')).toContainText('0.688');
      await expect(page.locator('#rules-tables-eligibility-row-age65')).toContainText(msg(lang, 'tables.eligibility.contributionsValue').replace('{n}', '180'));
      await expect(page.locator('#rules-coefficient-table').locator('xpath=ancestor::div[contains(@class,"table-wrap--scroll")]')).toHaveCount(1);
    });
  });
}

test('landing rules tables and calculator Reference tables tab show the same values', async ({ page }) => {
  const names = ['eligibility', 'min-pension', 'max-pension', 'coefficient'];
  for (const lang of ['es', 'en']) {
    await open(page, '', lang);
    const landing = {};
    for (const n of names) landing[n] = await page.locator(`#rules-${n}-table`).innerText();
    await page.click('#site-nav-link-calculator');
    await ready(page);
    await page.click('#calc-tab-tables');
    for (const n of names) {
      expect(await page.locator(`#calc-ref-${n}-table`).innerText()).toBe(landing[n]);
    }
  }
});
