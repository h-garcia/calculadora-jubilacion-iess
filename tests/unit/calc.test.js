import { describe, it, expect } from 'vitest';
import { calculadora } from '../fixtures/original-calculator.js';
import * as calc from '../../assets/js/calc.js';
import * as data from '../../assets/js/iess-data.js';

const okMsgs = {
  ok480: 'Cumples los requisitos: tienes 480 o más aportaciones (sin límite de edad).',
  ok70: 'Cumples los requisitos para jubilarte a los 70 años (120 o más aportaciones).',
  ok65: 'Cumples los requisitos para jubilarte a los 65 años (180 o más aportaciones).',
  ok60: 'Cumples los requisitos para jubilarte a los 60 años (360 o más aportaciones).',
};
const missing = {
  missing480: (p) => 'te faltan ' + p.missing + ' aportes para llegar a 480 (sin límite de edad)',
  missing70: (p) => 'te faltan ' + p.missing + ' aportes para los requisitos de 70 años (120)',
  missing65: (p) => 'te faltan ' + p.missing + ' aportes para los requisitos de 65 años (180)',
  missing60: (p) => 'te faltan ' + p.missing + ' aportes para los requisitos de 60 años (360)',
  under60: () => 'con menos de 60 años necesitas 480 aportes',
};
function eligText({ ok, code, params }) {
  if (ok) return okMsgs[code];
  return 'Aún no cumples los requisitos: ' + missing[code](params) + '.';
}

function oracle({ aportes, promedio, edad = 65, deseada = 0, sueldoAjustado }) {
  const o = calculadora();
  o.aportes = aportes; o.promedio = promedio; o.edad = edad; o.deseada = deseada;
  o.sueldoAjustado = sueldoAjustado === undefined ? o.sueldoDefault : sueldoAjustado;
  return o;
}

const cases = [
  { name: 'ref 180/1800/65', aportes: 180, promedio: 1800, edad: 65, deseada: 0 },
  { name: 'ref 300/1200/55 desired 900', aportes: 300, promedio: 1200, edad: 55, deseada: 900 },
  { name: 'ref 480/2500/58', aportes: 480, promedio: 2500, edad: 58, deseada: 0 },
  { name: 'ref 100/600/70', aportes: 100, promedio: 600, edad: 70, deseada: 0 },
  { name: '0 aportes', aportes: 0, promedio: 1000, edad: 40, deseada: 500 },
  { name: '59 aportes', aportes: 59, promedio: 1000, edad: 62, deseada: 600 },
  { name: '60 aportes', aportes: 60, promedio: 1000, edad: 62, deseada: 600 },
  { name: '119 aportes age 70', aportes: 119, promedio: 900, edad: 70, deseada: 0 },
  { name: '120 aportes age 70', aportes: 120, promedio: 900, edad: 70, deseada: 0 },
  { name: '179 aportes age 66', aportes: 179, promedio: 1500, edad: 66, deseada: 800 },
  { name: '180 aportes age 65', aportes: 180, promedio: 1500, edad: 65, deseada: 800 },
  { name: '359 aportes age 61', aportes: 359, promedio: 2000, edad: 61, deseada: 1500 },
  { name: '360 aportes age 60', aportes: 360, promedio: 2000, edad: 60, deseada: 1500 },
  { name: '479 aportes', aportes: 479, promedio: 3000, edad: 59, deseada: 2000 },
  { name: '480 aportes', aportes: 480, promedio: 3000, edad: 50, deseada: 2000 },
  { name: '600+ aportes', aportes: 650, promedio: 3000, edad: 70, deseada: 2500 },
  { name: 'promedio 0', aportes: 200, promedio: 0, edad: 65, deseada: 500 },
  { name: 'desired below minimum', aportes: 200, promedio: 1000, edad: 65, deseada: 100 },
  { name: 'desired unreachable in 600', aportes: 100, promedio: 300, edad: 65, deseada: 5000 },
  { name: 'custom sueldoAjustado', aportes: 150, promedio: 800, edad: 65, deseada: 900, sueldoAjustado: 3000 },
  { name: 'sueldoAjustado 0 falls back', aportes: 150, promedio: 800, edad: 65, deseada: 900, sueldoAjustado: 0 },
  { name: 'negative aportes', aportes: -5, promedio: 800, edad: 65, deseada: 700 },
  { name: '430 aportes', aportes: 430, promedio: 2200, edad: 64, deseada: 2400 },
];

const fmtRango = (r) =>
  (r.toYears ? r.fromYears + '-' + r.toYears + ' años' : r.fromYears + ' años y más') + ': ' + calc.formatMoney(r.amount);

describe('parity with original calculator', () => {
  for (const c of cases) {
    describe(c.name, () => {
      const o = oracle(c);
      const salario = c.sueldoAjustado === undefined ? o.sueldoDefault : c.sueldoAjustado;

      it('pension summary', () => {
        const s = calc.pensionSummary({ aportes: c.aportes, promedio: c.promedio });
        expect(s.years).toBeCloseTo(o.anios, 10);
        expect(s.wholeYears).toBe(Math.floor(o.anios));
        expect(s.remainderMonths).toBe(c.aportes % 12);
        expect(s.coef).toBeCloseTo(o.coef, 10);
        expect(s.pensMin).toBeCloseTo(o.pensMin, 10);
        expect(s.pensMax).toBeCloseTo(o.pensMax, 10);
        expect(s.pension).toBeCloseTo(o.pension, 10);
        expect(s.decimoTercero).toBeCloseTo(o.pension, 10);
        expect(s.decimoCuarto).toBe(o.SBU);
        expect(s.totalAnual).toBeCloseTo(o.totalAnual, 10);
      });

      it('eligibility', () => {
        const e = calc.eligibility({ aportes: c.aportes, edad: c.edad });
        expect(e.ok).toBe(o.elig.ok);
        expect(eligText(e)).toBe(o.elig.text);
      });

      it('default salary and contribution', () => {
        expect(calc.defaultSalary(c.promedio)).toBeCloseTo(o.sueldoDefault, 10);
        expect(calc.iessContribution(o.sueldoActivo)).toBeCloseTo(o.aporteIESS, 10);
      });

      it('simulation rows', () => {
        const rows = calc.simulate({ aportes: c.aportes, promedio: c.promedio, deseada: c.deseada, salario });
        expect(rows.length).toBe(o.simulacion.length);
        rows.forEach((r, i) => {
          const e = o.simulacion[i];
          expect(r.num).toBe(e.num);
          for (const k of ['salario', 'prom', 'coef', 'bruta', 'final']) expect(r[k]).toBeCloseTo(e[k], 10);
        });
      });

      it('simulation meta', () => {
        const m = calc.simulationMeta({ aportes: c.aportes, promedio: c.promedio, deseada: c.deseada, salario });
        const e = o.simulacionMeta;
        expect(m.alcanzada).toBe(e.alcanzada);
        expect(m.meses).toBe(e.meses);
        expect(m.totalAportes).toBe(e.totalAportes);
        expect(m.anos).toBe(e.anos);
        expect(m.salario).toBeCloseTo(e.salario, 10);
        expect(m.iess).toBeCloseTo(e.iess, 10);
        expect(m.aportesExtra ?? 0).toBe(e.aportesExtra ?? 0);
        expect(m.topeSugerido).toBeCloseTo(e.topeSugerido, 10);
        expect(m.topeSugeridoAnos).toBe(e.topeSugeridoAnos);
        if (e.primeraTopada) {
          expect(m.primeraTopada.num).toBe(e.primeraTopada.num);
          expect(m.primeraTopada.final).toBeCloseTo(e.primeraTopada.final, 10);
        } else {
          expect(m.primeraTopada).toBeNull();
        }
        expect(m.proximosRangos.map(fmtRango)).toEqual(e.proximosRangos);
      });
    });
  }

  it('simulation is empty when deseada <= 0 or promedio <= 0', () => {
    expect(calc.simulate({ aportes: 100, promedio: 1000, deseada: 0, salario: 2500 })).toEqual([]);
    expect(calc.simulate({ aportes: 100, promedio: 0, deseada: 500, salario: 2500 })).toEqual([]);
  });
});

describe('eligibility codes', () => {
  it('maps to expected codes', () => {
    expect(calc.eligibility({ aportes: 480, edad: 30 })).toMatchObject({ ok: true, code: 'ok480' });
    expect(calc.eligibility({ aportes: 120, edad: 70 })).toMatchObject({ ok: true, code: 'ok70' });
    expect(calc.eligibility({ aportes: 180, edad: 65 })).toMatchObject({ ok: true, code: 'ok65' });
    expect(calc.eligibility({ aportes: 360, edad: 60 })).toMatchObject({ ok: true, code: 'ok60' });
    expect(calc.eligibility({ aportes: 100, edad: 50 })).toEqual({ ok: false, code: 'missing480', params: { missing: 380 } });
  });

  it('matches the original over a grid of aportes and edad', () => {
    for (const aportes of [0, 59, 100, 119, 120, 179, 180, 359, 360, 479, 480, 700]) {
      for (const edad of [18, 55, 59, 60, 64, 65, 69, 70, 80]) {
        const o = oracle({ aportes, promedio: 1000, edad });
        const e = calc.eligibility({ aportes, edad });
        expect(e.ok).toBe(o.elig.ok);
        expect(eligText(e)).toBe(o.elig.text);
      }
    }
  });
});

describe('coefForMonths', () => {
  it('matches the original for every month count', () => {
    const o = calculadora();
    for (let m = 0; m <= 700; m++) expect(calc.coefForMonths(m)).toBe(o.coefPorMeses(m));
  });
  it('has the documented edges', () => {
    expect(calc.coefForMonths(59)).toBe(0);
    expect(calc.coefForMonths(60)).toBe(0.438);
    expect(calc.coefForMonths(600)).toBe(data.COEF_MAX);
    expect(calc.coefForMonths(5000)).toBe(data.COEF_MAX);
  });
});

describe('minPensionPct / maxPensionPct', () => {
  const o = calculadora();
  const ys = [];
  for (let y = -1; y <= 60; y += 0.25) ys.push(y);
  for (const b of [10, 11, 14, 15, 19, 20, 24, 25, 29, 30, 34, 35, 39, 40]) ys.push(b - 0.0001, b, b + 0.0001);

  it('minPensionPct matches original at all boundaries and fractions', () => {
    for (const y of ys) expect(calc.minPensionPct(y)).toBe(o.pctMin(y));
  });
  it('maxPensionPct matches original at all boundaries and fractions', () => {
    for (const y of ys) expect(calc.maxPensionPct(y)).toBe(o.pctMax(y));
  });
});

describe('data tables match the original', () => {
  const o = calculadora();
  it('COEF and constants', () => {
    expect(data.COEF).toEqual(o.COEF);
    expect(data.COEF_MAX).toBe(o.COEF_MAX);
    expect(data.SBU).toBe(o.SBU);
    expect(data.IESS_CONTRIBUTION_RATE).toBe(0.206);
    expect(data.MAX_SIMULATION_CONTRIBUTIONS).toBe(600);
  });
  it('bracket arrays reproduce the original pct functions for whole years', () => {
    const find = (arr, y) => arr.find((b) => y >= b.fromYears && (b.toYears === null || y <= b.toYears));
    for (let y = 0; y <= 60; y++) {
      expect(find(data.MIN_PENSION_BRACKETS, y).pct).toBe(o.pctMin(y));
      const max = find(data.MAX_PENSION_BRACKETS, y);
      expect(max ? max.pct : 2.5).toBe(o.pctMax(y));
    }
  });
  it('max brackets match the original rangos list', () => {
    const m = calculadora();
    m.aportes = 1; m.promedio = 100; m.deseada = 1; m.sueldoAjustado = 1;
    expect(m.simulacionMeta.proximosRangos).toEqual(
      data.MAX_PENSION_BRACKETS.map((b) =>
        fmtRango({ fromYears: b.fromYears, toYears: b.toYears, amount: data.SBU * b.pct })));
  });
  it('requirements table', () => {
    expect(data.RETIREMENT_REQUIREMENTS.map((r) => r.contributions)).toEqual([480, 360, 180, 120]);
  });
});

describe('formatMoney', () => {
  it('matches original fmt', () => {
    const o = calculadora();
    for (const v of [0, 0.5, 1.49, 482, 1234.56, 1e6, 2410]) expect(calc.formatMoney(v)).toBe(o.fmt(v));
  });
});
