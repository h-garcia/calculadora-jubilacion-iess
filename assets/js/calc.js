// Pure pension math. No DOM, no Alpine.
import {
  SBU, COEF, COEF_MAX, MIN_CONTRIBUTION_YEARS,
  RETIREMENT_REQUIREMENTS, MIN_PENSION_BRACKETS, MAX_PENSION_BRACKETS,
  IESS_CONTRIBUTION_RATE, MAX_SIMULATION_CONTRIBUTIONS,
} from './iess-data.js';

export function coefForMonths(months) {
  const years = Math.floor(months / 12);
  if (years < MIN_CONTRIBUTION_YEARS) return 0;
  if (years >= 50) return COEF_MAX;
  return COEF[years];
}

// First bracket whose upper bound covers `years` (fractions fall into the bracket above
// the previous bound, as in the original ternaries). Below the first bracket uses the first.
function pctFor(brackets, years) {
  for (const b of brackets) {
    if (b.toYears === null || years <= b.toYears) return b.pct;
  }
  return brackets[brackets.length - 1].pct;
}

export function minPensionPct(years) { return pctFor(MIN_PENSION_BRACKETS, years); }
export function maxPensionPct(years) { return pctFor(MAX_PENSION_BRACKETS, years); }

export function pensionSummary({ aportes, promedio }) {
  const years = aportes / 12;
  const wholeYears = Math.floor(years);
  const remainderMonths = aportes % 12;
  const coef = coefForMonths(aportes);
  const pensMin = SBU * minPensionPct(wholeYears);
  const pensMax = SBU * maxPensionPct(wholeYears);
  const pension = Math.max(pensMin, Math.min(promedio * coef, pensMax));
  return {
    years, wholeYears, remainderMonths, coef, pensMin, pensMax, pension,
    decimoTercero: pension,
    decimoCuarto: SBU,
    totalAnual: pension * 13 + SBU,
  };
}

export function eligibility({ aportes, edad }) {
  const [noAge, a60, a65, a70] = RETIREMENT_REQUIREMENTS;
  if (aportes >= noAge.contributions) return { ok: true, code: 'ok480', params: {} };
  if (edad >= a70.minAge && aportes >= a70.contributions) return { ok: true, code: 'ok70', params: {} };
  if (edad >= a65.minAge && aportes >= a65.contributions) return { ok: true, code: 'ok65', params: {} };
  if (edad >= a60.minAge && aportes >= a60.contributions) return { ok: true, code: 'ok60', params: {} };
  const options = [];
  if (aportes < noAge.contributions) options.push({ code: 'missing480', params: { missing: noAge.contributions - aportes } });
  if (edad >= a70.minAge && aportes < a70.contributions) options.push({ code: 'missing70', params: { missing: a70.contributions - aportes } });
  if (edad >= a65.minAge && aportes < a65.contributions) options.push({ code: 'missing65', params: { missing: a65.contributions - aportes } });
  if (edad >= a60.minAge && aportes < a60.contributions) options.push({ code: 'missing60', params: { missing: a60.contributions - aportes } });
  if (edad < a60.minAge) options.push({ code: 'under60', params: {} });
  return { ok: false, ...options[0] };
}

export function defaultSalary(promedio) {
  return Math.round(promedio * 2.5 * 100) / 100;
}

export function iessContribution(salary) {
  return salary * IESS_CONTRIBUTION_RATE;
}

export function simulate({ aportes, promedio, deseada, salario }) {
  const rows = [];
  if (deseada <= 0 || promedio <= 0) return rows;
  let count = Math.max(0, aportes);
  let prom = promedio;
  const salary = salario || defaultSalary(promedio);
  while (count < MAX_SIMULATION_CONTRIBUTIONS) {
    count++;
    prom = (prom * 59 + salary) / 60;
    const coef = coefForMonths(count);
    const bruta = prom * coef;
    const y = Math.floor(count / 12);
    const final = Math.max(SBU * minPensionPct(y), Math.min(bruta, SBU * maxPensionPct(y)));
    rows.push({ num: count, salario: salary, prom, coef, bruta, final });
    if (final >= deseada) break;
  }
  return rows;
}

export function simulationMeta({ aportes, promedio, deseada, salario }) {
  const rows = simulate({ aportes, promedio, deseada, salario });
  if (!rows.length) {
    return { alcanzada: false, salario: 0, iess: 0, meses: 0, totalAportes: 0, anos: '0', primeraTopada: null, topeSugerido: 0, topeSugeridoAnos: '0', proximosRangos: [] };
  }
  const last = rows[rows.length - 1];
  const primeraTopada = rows.find((r) => r.final !== r.bruta) || null;
  const aniosSugerido = primeraTopada ? Math.floor(primeraTopada.num / 12) : Math.floor(last.num / 12);
  const proximosRangos = MAX_PENSION_BRACKETS
    .filter((b) => b.fromYears > aniosSugerido)
    .map((b) => ({ fromYears: b.fromYears, toYears: b.toYears, amount: SBU * b.pct }));
  return {
    alcanzada: last.final >= deseada,
    meses: rows.length,
    totalAportes: last.num,
    anos: (last.num / 12).toFixed(1),
    salario: last.salario,
    iess: iessContribution(last.salario),
    primeraTopada,
    aportesExtra: primeraTopada ? primeraTopada.num - aportes : 0,
    topeSugerido: primeraTopada ? SBU * maxPensionPct(Math.floor(primeraTopada.num / 12)) : 0,
    topeSugeridoAnos: primeraTopada ? (primeraTopada.num / 12).toFixed(1) : '0',
    proximosRangos,
  };
}

export function formatMoney(v) {
  return '$' + Math.round(v).toLocaleString('en-US');
}
