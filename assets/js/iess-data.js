// IESS retirement data. Single source for the calculator and the landing tables.
export const SBU = 482;
export const SBU_YEAR = 2026;
export const COEF = {
  5: 0.438, 6: 0.450, 7: 0.463, 8: 0.475, 9: 0.488, 10: 0.500,
  11: 0.513, 12: 0.525, 13: 0.538, 14: 0.550, 15: 0.563, 16: 0.575,
  17: 0.588, 18: 0.600, 19: 0.613, 20: 0.625, 21: 0.638, 22: 0.650,
  23: 0.663, 24: 0.675, 25: 0.688, 26: 0.700, 27: 0.713, 28: 0.725,
  29: 0.738, 30: 0.750, 31: 0.763, 32: 0.775, 33: 0.788, 34: 0.800,
  35: 0.813, 36: 0.833, 37: 0.861, 38: 0.897, 39: 0.943, 40: 1.000,
  41: 1.013, 42: 1.025, 43: 1.038, 44: 1.050, 45: 1.063, 46: 1.075,
  47: 1.088, 48: 1.100, 49: 1.113, 50: 1.125
};
export const COEF_MAX = 1.125;
export const MIN_CONTRIBUTION_YEARS = 5;

// Eligibility table, in display order.
export const RETIREMENT_REQUIREMENTS = [
  { key: 'noAgeLimit', minAge: null, contributions: 480 },
  { key: 'age60', minAge: 60, contributions: 360 },
  { key: 'age65', minAge: 65, contributions: 180 },
  { key: 'age70', minAge: 70, contributions: 120 },
];

// Min pension % of SBU by whole years of contributions (inclusive ranges; toYears null = and more).
export const MIN_PENSION_BRACKETS = [
  { key: 'upTo10', fromYears: 0, toYears: 10, pct: 0.5 },
  { key: 'y11to20', fromYears: 11, toYears: 20, pct: 0.6 },
  { key: 'y21to30', fromYears: 21, toYears: 30, pct: 0.7 },
  { key: 'y31to35', fromYears: 31, toYears: 35, pct: 0.8 },
  { key: 'y36to39', fromYears: 36, toYears: 39, pct: 0.9 },
  { key: 'y40plus', fromYears: 40, toYears: null, pct: 1.0 },
];
export const MAX_PENSION_BRACKETS = [
  { key: 'y10to14', fromYears: 10, toYears: 14, pct: 2.5 },
  { key: 'y15to19', fromYears: 15, toYears: 19, pct: 3.0 },
  { key: 'y20to24', fromYears: 20, toYears: 24, pct: 3.5 },
  { key: 'y25to29', fromYears: 25, toYears: 29, pct: 4.0 },
  { key: 'y30to34', fromYears: 30, toYears: 34, pct: 4.5 },
  { key: 'y35to39', fromYears: 35, toYears: 39, pct: 5.0 },
  { key: 'y40plus', fromYears: 40, toYears: null, pct: 5.5 },
];
export const IESS_CONTRIBUTION_RATE = 0.206;
export const MAX_SIMULATION_CONTRIBUTIONS = 600;
