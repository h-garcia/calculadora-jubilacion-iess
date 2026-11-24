// Alpine components. Pure math lives in calc.js; data in iess-data.js.
import {
  SBU, SBU_YEAR, COEF, RETIREMENT_REQUIREMENTS, MIN_PENSION_BRACKETS, MAX_PENSION_BRACKETS,
} from './iess-data.js';
import {
  pensionSummary, eligibility, defaultSalary, iessContribution, simulate, simulationMeta,
  minPensionPct, maxPensionPct, formatMoney,
} from './calc.js';

// Generic accessible tabs. Tab buttons carry data-tab="<name>" and role="tab".
export function tabs(initial) {
  return {
    active: initial,
    select(name) { this.active = name; },
    isActive(name) { return this.active === name; },
    onKey(event) {
      const list = [...event.currentTarget.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const i = list.indexOf(event.currentTarget);
      let next = null;
      if (event.key === 'ArrowRight') next = list[(i + 1) % list.length];
      else if (event.key === 'ArrowLeft') next = list[(i - 1 + list.length) % list.length];
      else if (event.key === 'Home') next = list[0];
      else if (event.key === 'End') next = list[list.length - 1];
      if (!next) return;
      event.preventDefault();
      next.focus();
      this.select(next.dataset.tab);
    },
  };
}

// SBU facts for the footer.
export function siteInfo() {
  return { sbu: formatMoney(SBU), sbuYear: SBU_YEAR };
}

// Rows for the four reference tables, built from iess-data.js.
const kebab = (s) => s.replace(/([A-Z])/g, '-$1').toLowerCase();

export function rulesTables() {
  const pctRows = (brackets) => brackets.map((b) => ({
    key: b.key, id: kebab(b.key), pct: Math.round(b.pct * 100), amount: formatMoney(SBU * b.pct),
  }));
  return {
    sbu: formatMoney(SBU),
    sbuYear: SBU_YEAR,
    idBase: 'tables',
    init() { this.idBase = this.$el.id || 'tables'; },
    eligibility: RETIREMENT_REQUIREMENTS.map((r) => ({ key: r.key, id: kebab(r.key), n: r.contributions })),
    minRows: pctRows(MIN_PENSION_BRACKETS),
    maxRows: pctRows(MAX_PENSION_BRACKETS),
    coefRows: Object.entries(COEF).map(([year, coef]) => ({ year: Number(year), coef: coef.toFixed(3) })),
  };
}

export function calculator() {
  return {
    ...tabs('calc'),
    SBU,
    aportes: 180,
    promedio: 1800,
    edad: 65,
    deseada: 0,
    sueldoAjustado: null,
    sueldoTouched: false,

    init() {
      this.sueldoAjustado = this.sueldoDefault;
      this.$watch('promedio', () => {
        if (!this.sueldoTouched) this.sueldoAjustado = this.sueldoDefault;
      });
    },

    fmt: formatMoney,
    get summary() { return pensionSummary({ aportes: this.aportes, promedio: this.promedio }); },
    get elig() { return eligibility({ aportes: this.aportes, edad: this.edad }); },
    get coefSubParams() { return { years: this.summary.wholeYears, months: this.summary.remainderMonths }; },
    // The original uses fractional years for the "% of SBU" sub-labels.
    get minPct() { return (minPensionPct(this.aportes / 12) * 100).toFixed(0); },
    get maxPct() { return (maxPensionPct(this.aportes / 12) * 100).toFixed(0); },

    get sueldoDefault() { return defaultSalary(this.promedio); },
    get sueldoActivo() { return this.sueldoAjustado || this.sueldoDefault; },
    get aporteIESS() { return iessContribution(this.sueldoActivo); },
    stepSalary(delta) {
      const base = Math.round(this.sueldoAjustado / 100) * 100;
      this.sueldoAjustado = Math.max(0, base + delta);
    },

    get sinDatos() { return this.deseada <= 0 || this.promedio <= 0; },
    get simulation() {
      return simulate({ aportes: this.aportes, promedio: this.promedio, deseada: this.deseada, salario: this.sueldoActivo });
    },
    get meta() {
      return simulationMeta({ aportes: this.aportes, promedio: this.promedio, deseada: this.deseada, salario: this.sueldoActivo });
    },
    get reachedParams() {
      const m = this.meta;
      return {
        salary: formatMoney(m.salario), iess: formatMoney(m.iess), desired: formatMoney(this.deseada),
        months: m.meses, total: m.totalAportes, years: m.anos,
      };
    },
    get recommendationParams() {
      const m = this.meta;
      const t = this.$store.i18n;
      const ranges = m.proximosRangos.map((r) => (r.toYears
        ? t.t('calc.desired.rangeBounded', { from: r.fromYears, to: r.toYears, amount: formatMoney(r.amount) })
        : t.t('calc.desired.rangeOpen', { from: r.fromYears, amount: formatMoney(r.amount) }))).join(' · ');
      return {
        total: m.primeraTopada ? m.primeraTopada.num : 0, years: m.topeSugeridoAnos, extra: m.aportesExtra,
        cap: formatMoney(m.topeSugerido), ranges,
      };
    },

    goToMaxTable() {
      this.select('tables');
      this.$nextTick(() => {
        const el = this.$root.querySelector('[data-role="max-pension"]');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    },
  };
}
