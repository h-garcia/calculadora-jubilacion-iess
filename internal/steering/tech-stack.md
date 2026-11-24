# Tech stack

## Languages
- HTML, CSS, and JavaScript (ES modules) served as static files. **No build step**: what is in the repo is what GitHub Pages serves.
- JSON for translations (`i18n/*.json`).
- Node.js (≥ 20) is used **only** as dev tooling (tests, checks); it is never needed to view or edit the site.

## Components

| Component | Purpose | Library / framework |
|---|---|---|
| Pages | `index.html` (landing), `calculadora/index.html`, `design-system/index.html` | Plain HTML |
| Interactivity | Reactive UI (calculator, tabs, language toggle) | Alpine.js **3.15.12**, ESM build from jsDelivr, pinned exact version |
| Calculation logic | Pure pension math, no DOM | `assets/js/calc.js` |
| Retirement data | SBU, coefficients, min/max pension, eligibility tables | `assets/js/iess-data.js` (single source for calculator and landing tables) |
| i18n | Loads `i18n/{es,en}.json`, `x-t` directive, `$t` magic, persisted language, missing-key marker | `assets/js/i18n.js` |
| Partials | Shared sections (nav, footer, hero…) injected from `design-system/sections/*.html` so production pages and the design-system page use the same source | `assets/js/include.js` |
| Unit tests | Calc parity with the original calculator, i18n behavior, translation file checks | Vitest |
| E2E tests | Pages, nav, toggle, CTA, mobile width, ids | Playwright (Chromium) |
| CI / deploy | PR checks; deploy to GitHub Pages on `main` | GitHub Actions |

### How they connect
Each page loads `assets/js/main.js` as an ES module. It imports Alpine, registers the i18n store/directive and page components, resolves `data-include` partials, then calls `Alpine.start()`. Visible text is never hard-coded in HTML: elements use `x-t="'key'"` (or `x-t="['key', {param}]"`) and attributes use `$t('key')`. All links and asset URLs are relative so the site works under the GitHub Pages project path `/calculadora-jubilacion-iess/`.

## Conventions
- **Formatter / linter**: none enforced (keep files readable for non-technical editors; 2-space indent).
- **Test runner**: `npm test` (Vitest), `npm run e2e` (Playwright), `npm run check:i18n` (translation file check).
- **Folder structure**: site files at repo root; design-system sources under `design-system/{brand,elements,components,sections,exploration}`; tests under `tests/{unit,e2e}`; scripts under `scripts/`.
- **Naming**: kebab-case file names and element ids; translation keys are dot-separated, lower camelCase segments (`landing.hero.title`).
- **Translations**: `i18n/es.json` and `i18n/en.json` must have identical key sets; CI fails otherwise.
- **Database**: none.

## TDD-first
This project is TDD. Every feature starts with failing tests derived from the acceptance criteria in its spec. No implementation code lands before its test does. Calculator changes must keep the parity tests against `tests/fixtures/original-calculator.js` green unless a spec explicitly changes the math.
