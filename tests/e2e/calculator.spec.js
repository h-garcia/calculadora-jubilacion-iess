import { test, expect } from '@playwright/test';
import { calculadora } from '../fixtures/original-calculator.js';
import { open } from './helpers.js';

function oracle(v) {
  const o = calculadora();
  o.$watch = () => {};
  Object.assign(o, v);
  o.init();
  return o;
}

const CASES = [
  { name: '180 / 1800 / 65', aportes: 180, promedio: 1800, edad: 65, deseada: 0 },
  { name: '300 / 1200 / 55 desired 900', aportes: 300, promedio: 1200, edad: 55, deseada: 900 },
  { name: '480 / 2500 / 58', aportes: 480, promedio: 2500, edad: 58, deseada: 0 },
  { name: '100 / 600 / 70', aportes: 100, promedio: 600, edad: 70, deseada: 0 },
  { name: '100 / 600 / 70 unreachable desired', aportes: 100, promedio: 600, edad: 70, deseada: 5000 },
  { name: '480 / 2500 / 58 desired below min', aportes: 480, promedio: 2500, edad: 58, deseada: 100 },
  { name: '200 / 2500 / 65 desired 2000 (with recommendation)', aportes: 200, promedio: 2500, edad: 65, deseada: 2000 },
  { name: '250 / 1500 / 61 desired 1800', aportes: 250, promedio: 1500, edad: 61, deseada: 1800 },
];

async function fillInputs(page, v) {
  await page.fill('#calc-input-aportes', String(v.aportes));
  await page.fill('#calc-input-promedio', String(v.promedio));
  await page.fill('#calc-input-edad', String(v.edad));
  await page.fill('#calc-input-deseada', v.deseada ? String(v.deseada) : '');
}

for (const c of CASES) {
  test(`parity with original calculator: ${c.name}`, async ({ page }) => {
    const o = oracle(c);
    await open(page, 'calculadora/');
    await fillInputs(page, c);
    const text = (sel) => page.locator(sel).innerText().then((s) => s.trim());

    expect(await text('#calc-result-pension-value')).toBe(o.fmt(o.pension));
    expect(await text('#calc-result-decimo-cuarto-value')).toBe(o.fmt(o.SBU));
    expect(await text('#calc-result-decimo-tercero-value')).toBe(o.fmt(o.pension));
    expect(await text('#calc-result-total-anual-value')).toBe(o.fmt(o.totalAnual));
    expect(await text('#calc-result-coef-value')).toBe(o.coef.toFixed(3));
    expect(await text('#calc-result-coef-sub')).toBe(o.coefSub);
    expect(await text('#calc-result-min-value')).toBe(o.fmt(o.pensMin));
    expect(await text('#calc-result-min-sub')).toBe((o.pctMin(o.anios) * 100).toFixed(0) + '% del SBU');
    expect(await text('#calc-result-max-value')).toBe(o.fmt(o.pensMax));
    expect(await text('#calc-result-max-sub')).toBe((o.pctMax(o.anios) * 100).toFixed(0) + '% del SBU');
    expect(await text('#calc-eligibility')).toBe(o.elig.text);
    await expect(page.locator('#calc-eligibility')).toHaveClass(o.elig.ok ? /alert--ok/ : /alert--warn/);

    if (!c.deseada) {
      await expect(page.locator('#calc-desired')).toBeHidden();
      return;
    }
    await expect(page.locator('#calc-desired')).toBeVisible();
    const m = o.simulacionMeta;
    const rows = o.simulacion;
    expect(await page.locator('#calc-sim-table tbody tr').count()).toBe(rows.length);
    for (const r of [rows[0], rows[rows.length - 1]]) {
      const row = page.locator(`#calc-sim-row-${r.num}`);
      const cells = (await row.locator('td').allInnerTexts()).map((s) => s.trim());
      expect(cells[0]).toBe(String(r.num));
      expect(cells[1]).toBe((r.num / 12).toFixed(1));
      expect(cells[2]).toBe(o.fmt(r.salario));
      expect(cells[3]).toBe(o.fmt(r.prom));
      expect(cells[4]).toBe(r.coef.toFixed(3));
      expect(cells[5]).toContain(o.fmt(r.bruta));
      if (r.final !== r.bruta) expect(cells[5]).toContain('tope: ' + o.fmt(r.final));
    }
    const result = await text('#calc-desired-result');
    expect(result).toContain(o.fmt(m.salario));
    if (m.alcanzada) {
      expect(result).toContain(o.fmt(m.iess));
      expect(result).toContain(o.fmt(c.deseada));
      expect(result).toContain(`${m.meses} meses`);
      expect(result).toContain(`${m.totalAportes} aportes (${m.anos} años)`);
      await expect(page.locator('#calc-desired-result')).toHaveClass(/alert--ok/);
    } else {
      await expect(page.locator('#calc-desired-result')).toHaveClass(/alert--warn/);
    }
    if (m.primeraTopada) {
      const rec = await text('#calc-recommendation');
      expect(rec).toContain(`${m.primeraTopada.num} aportes (${m.topeSugeridoAnos} años o ${m.aportesExtra} aportes más)`);
      expect(rec).toContain(o.fmt(m.topeSugerido));
      expect(rec).toContain(m.proximosRangos.join(' · '));
      await expect(page.locator('#calc-recommendation-max-table-link')).toBeVisible();
    } else {
      await expect(page.locator('#calc-recommendation')).toHaveCount(0);
    }
    if (c.deseada < o.pensMin) {
      await expect(page.locator('#calc-desired-below-min')).toBeVisible();
      expect(await text('#calc-desired-below-min')).toContain(o.fmt(o.pensMin));
    } else {
      await expect(page.locator('#calc-desired-below-min')).toBeHidden();
    }
  });
}

test('defaults match the original calculator', async ({ page }) => {
  await open(page, 'calculadora/');
  await expect(page.locator('#calc-input-aportes')).toHaveValue('180');
  await expect(page.locator('#calc-input-promedio')).toHaveValue('1800');
  await expect(page.locator('#calc-input-edad')).toHaveValue('65');
  await expect(page.locator('#calc-input-deseada')).toHaveValue('0');
});

test('adjusted salary follows average until edited; arrows step by 100', async ({ page }) => {
  await open(page, 'calculadora/');
  await page.fill('#calc-input-deseada', '2000');
  await expect(page.locator('#calc-input-sueldo')).toHaveValue('4500');
  await page.fill('#calc-input-promedio', '1000');
  await expect(page.locator('#calc-input-sueldo')).toHaveValue('2500');
  await page.locator('#calc-input-sueldo').press('ArrowUp');
  await expect(page.locator('#calc-input-sueldo')).toHaveValue('2600');
  await page.locator('#calc-input-sueldo').press('ArrowDown');
  await page.locator('#calc-input-sueldo').press('ArrowDown');
  await expect(page.locator('#calc-input-sueldo')).toHaveValue('2400');
  // typing marks it as touched: it no longer follows the average
  await page.fill('#calc-input-sueldo', '3000');
  await page.fill('#calc-input-promedio', '1100');
  await expect(page.locator('#calc-input-sueldo')).toHaveValue('3000');
});

test('recommendation link opens the Reference tables tab at the max pension table', async ({ page }) => {
  await open(page, 'calculadora/');
  await page.fill('#calc-input-aportes', '200');
  await page.fill('#calc-input-promedio', '2500');
  await page.fill('#calc-input-edad', '65');
  await page.fill('#calc-input-deseada', '2000');
  const link = page.locator('#calc-recommendation-max-table-link');
  await expect(link).toBeVisible();
  await link.click();
  await expect(page.locator('#calc-tab-tables')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#calc-tabpanel-tables')).toBeVisible();
  await expect(page.locator('#calc-ref-max-pension')).toBeInViewport();
});

test('short disclaimer sits under the results', async ({ page }) => {
  await open(page, 'calculadora/');
  await expect(page.locator('#calc-results-disclaimer')).toHaveText('Resultado estimado, no oficial. Confirma tu pensión con el IESS.');
});

test('results text is translated in English', async ({ page }) => {
  await open(page, 'calculadora/', 'en');
  await expect(page.locator('#calc-result-coef-sub')).toHaveText('15 years and 0 months of contributions');
  await expect(page.locator('#calc-eligibility')).toContainText('You qualify to retire at 65');
  await expect(page.locator('#calc-result-pension-value')).toHaveText(/^\$[\d,]+$/);
});
