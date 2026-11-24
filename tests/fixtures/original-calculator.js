// Oracle: verbatim copy of the original calculator. Never modify the math.
export function calculadora() {
  return {
    SBU: 482,
    tab: 'calc',
    COEF: {
      5: 0.438, 6: 0.450, 7: 0.463, 8: 0.475, 9: 0.488, 10: 0.500,
      11: 0.513, 12: 0.525, 13: 0.538, 14: 0.550, 15: 0.563, 16: 0.575,
      17: 0.588, 18: 0.600, 19: 0.613, 20: 0.625, 21: 0.638, 22: 0.650,
      23: 0.663, 24: 0.675, 25: 0.688, 26: 0.700, 27: 0.713, 28: 0.725,
      29: 0.738, 30: 0.750, 31: 0.763, 32: 0.775, 33: 0.788, 34: 0.800,
      35: 0.813, 36: 0.833, 37: 0.861, 38: 0.897, 39: 0.943, 40: 1.000,
      41: 1.013, 42: 1.025, 43: 1.038, 44: 1.050, 45: 1.063, 46: 1.075,
      47: 1.088, 48: 1.100, 49: 1.113, 50: 1.125
    },
    COEF_MAX: 1.125,

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

    get coefData() {
      return Object.entries(this.COEF).map(([a, c]) => ({ anios: parseInt(a), coef: c }));
    },
    get anios() { return this.aportes / 12; },
    coefPorMeses(meses) {
      const anios = Math.floor(meses / 12);
      if (anios < 5) return 0;
      if (anios >= 50) return this.COEF_MAX;
      return this.COEF[anios];
    },
    get coef() { return this.coefPorMeses(this.aportes); },
    get coefSub() {
      const a = this.anios;
      return Math.floor(a) + ' años y ' + (this.aportes % 12) + ' meses de aportes';
    },
    pctMin(y) {
      return y <= 10 ? 0.50 : y <= 20 ? 0.60 : y <= 30 ? 0.70 : y <= 35 ? 0.80 : y <= 39 ? 0.90 : 1.00;
    },
    pctMax(y) {
      return y < 10 ? 2.50 : y <= 14 ? 2.50 : y <= 19 ? 3.00 : y <= 24 ? 3.50 : y <= 29 ? 4.00 : y <= 34 ? 4.50 : y <= 39 ? 5.00 : 5.50;
    },
    get pensMin() { return this.SBU * this.pctMin(Math.floor(this.anios)); },
    get pensMax() { return this.SBU * this.pctMax(Math.floor(this.anios)); },
    get pension() {
      const cruda = this.promedio * this.coef;
      return Math.max(this.pensMin, Math.min(cruda, this.pensMax));
    },
    get totalAnual() { return this.pension * 13 + this.SBU; },
    get elig() {
      const { aportes, edad } = this;
      if (aportes >= 480) return { ok: true, text: 'Cumples los requisitos: tienes 480 o más aportaciones (sin límite de edad).' };
      if (edad >= 70 && aportes >= 120) return { ok: true, text: 'Cumples los requisitos para jubilarte a los 70 años (120 o más aportaciones).' };
      if (edad >= 65 && aportes >= 180) return { ok: true, text: 'Cumples los requisitos para jubilarte a los 65 años (180 o más aportaciones).' };
      if (edad >= 60 && aportes >= 360) return { ok: true, text: 'Cumples los requisitos para jubilarte a los 60 años (360 o más aportaciones).' };
      const opciones = [];
      if (aportes < 480) opciones.push('te faltan ' + (480 - aportes) + ' aportes para llegar a 480 (sin límite de edad)');
      if (edad >= 70 && aportes < 120) opciones.push('te faltan ' + (120 - aportes) + ' aportes para los requisitos de 70 años (120)');
      if (edad >= 65 && aportes < 180) opciones.push('te faltan ' + (180 - aportes) + ' aportes para los requisitos de 65 años (180)');
      if (edad >= 60 && aportes < 360) opciones.push('te faltan ' + (360 - aportes) + ' aportes para los requisitos de 60 años (360)');
      if (edad < 60) opciones.push('con menos de 60 años necesitas 480 aportes');
      return { ok: false, text: 'Aún no cumples los requisitos: ' + opciones[0] + '.' };
    },
    get sueldoDefault() { return Math.round(this.promedio * 2.5 * 100) / 100; },
    get sueldoActivo() { return this.sueldoAjustado || this.sueldoDefault; },
    irATablaPensionMaxima() {
      this.tab = 'tablas';
      this.$nextTick(() => document.getElementById('pension-maxima').scrollIntoView({ behavior: 'smooth' }));
    },
    get aporteIESS() { return this.sueldoActivo * 0.206; },
    get simulacionSinDatos() { return this.deseada <= 0 || this.promedio <= 0; },
    get simulacion() {
      const rows = [];
      if (this.simulacionSinDatos) return rows;
      let aportes = Math.max(0, this.aportes);
      let prom = this.promedio;
      const salario = this.sueldoActivo;
      while (aportes < 600) {
        aportes++;
        prom = (prom * 59 + salario) / 60;
        const coef = this.coefPorMeses(aportes);
        const bruta = prom * coef;
        const final = Math.max(this.SBU * this.pctMin(Math.floor(aportes / 12)), Math.min(bruta, this.SBU * this.pctMax(Math.floor(aportes / 12))));
        rows.push({ num: aportes, salario, prom, coef, bruta, final });
        if (final >= this.deseada) break;
      }
      return rows;
    },
    get simulacionMeta() {
      const rows = this.simulacion;
      if (!rows.length) return { alcanzada: false, salario: 0, iess: 0, meses: 0, totalAportes: 0, anos: '0', primeraTopada: null, topeSugerido: 0, topeSugeridoAnos: '0', proximosRangos: [] };
      const last = rows[rows.length - 1];
      const primeraTopada = rows.find(r => r.final !== r.bruta) || null;
      const aniosSugerido = primeraTopada ? Math.floor(primeraTopada.num / 12) : Math.floor(last.num / 12);
      const rangos = [
        { desde: 10, hasta: 14, pct: 2.5 },
        { desde: 15, hasta: 19, pct: 3.0 },
        { desde: 20, hasta: 24, pct: 3.5 },
        { desde: 25, hasta: 29, pct: 4.0 },
        { desde: 30, hasta: 34, pct: 4.5 },
        { desde: 35, hasta: 39, pct: 5.0 },
        { desde: 40, hasta: null, pct: 5.5 }
      ];
      const proximosRangos = rangos
        .filter(r => r.desde > aniosSugerido)
        .map(r => (r.hasta ? r.desde + '-' + r.hasta + ' años' : r.desde + ' años y más') + ': ' + this.fmt(this.SBU * r.pct));
      return {
        alcanzada: last.final >= this.deseada,
        meses: rows.length,
        totalAportes: last.num,
        anos: (last.num / 12).toFixed(1),
        salario: last.salario,
        iess: last.salario * 0.206,
        primeraTopada,
        aportesExtra: primeraTopada ? primeraTopada.num - this.aportes : 0,
        topeSugerido: primeraTopada ? this.SBU * this.pctMax(Math.floor(primeraTopada.num / 12)) : 0,
        topeSugeridoAnos: primeraTopada ? (primeraTopada.num / 12).toFixed(1) : '0',
        proximosRangos
      };
    },
    fmt(v) { return '$' + Math.round(v).toLocaleString('en-US'); }
  };
}
