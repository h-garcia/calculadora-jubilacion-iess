# Adversarial review — feat/landing-page vs main

**Type:** Review

**Scope:** 50 files, +3804/−29 lines @ `540319c` vs `1bf3321` (excluded: `package-lock.json`, `tests/fixtures/` — legacy calculator oracle) · **Shape:** 5 agents (one per lens; > 2000 lines) · **Lenses skipped:** none · **Verdict:** SHIP WITH NOTES — 0 P0, 0 P1, 5 P2, 12 P3

Calculator math, eligibility, brackets, simulation and es/en key sets were checked against the legacy fixtures: no numeric divergence found.

## Findings

### P2 — should fix
1. **Language switch has no request ordering; a slow earlier fetch overwrites a later choice** — `assets/js/i18n.js:60`
   *Breaks when:* cold cache, user clicks EN then ES quickly; ES (cached) applies, then the slow `en.json` resolves and sets `lang`/`messages`/`<html lang>`/localStorage to EN — last click lost and persisted wrong.
   *Fix:* track a request token (or the requested lang) and drop responses that are not the latest call.

2. **Failed initial translation load leaves every `x-t` element empty, with no fallback to `es`** — `assets/js/main.js:36`
   *Breaks when:* localStorage holds `en` and `en.json` 404s/times out (or `es.json` fails transiently); `load()` rejects, `main.js` only logs, `ready` stays false → page renders with no text and no error UI.
   *Fix:* on failure fall back to `es` (or the other language), and show a visible error if both fail.

3. **Alpine loaded from jsDelivr at runtime with no integrity check** — `assets/js/main.js:2`
   *Breaks when:* the CDN path is compromised or tampered; attacker JS runs on the production origin for every visitor. ES-module `import` can't carry SRI, and Alpine is already a devDependency.
   *Fix:* vendor `alpinejs@3.15.12/dist/module.esm.js` into `assets/` (copied in deploy) and import it locally.

4. **IESS rule values hardcoded in translated prose, duplicating `iess-data.js`** — `i18n/en.json:79` (also `:75`, `:131`, `:178-186`; same keys in `es.json`)
   *Breaks when:* the roadmap's yearly data update edits `RETIREMENT_REQUIREMENTS`/`COEF` in `iess-data.js`; FAQ, coefficient note and `ok*`/`missing*` messages keep the old 480/360/180/120, 1.125, 60 months in both languages → text contradicts tables/results; `check:i18n` only compares es vs en, so nothing fails.
   *Fix:* parameterize these strings (`{n}`, `{age}`, `{max}`) from `iess-data.js`, as `footer.source` already does for SBU.

5. **Deploy publishes to production without running tests, from a hand-maintained file whitelist** — `.github/workflows/deploy.yml:27`
   *Breaks when:* a push to `main` with failing parity/e2e tests (or a direct push bypassing PR) publishes wrong pension numbers — deploy runs in parallel with CI, only `check:i18n` gates it; a new public file (`404.html`, `robots.txt`, favicon, new page folder) is silently omitted by `cp -r index.html calculadora design-system assets i18n` while tests pass against repo root.
   *Fix:* run `npm test` (+ e2e) in deploy or trigger it on `workflow_run` success of CI; assemble `_site` by excluding dev paths instead of whitelisting.

### P3 — notes
- `.github/workflows/ci.yml:1` — no `permissions:` block (token gets repo default scope) and all actions pinned by mutable tag, not SHA.
- `.github/workflows/ci.yml:29` — failure upload targets `playwright-report/`, but reporter is `list` only and traces go to `test-results/artifacts`; CI failures upload nothing useful.
- `.github/workflows/deploy.yml:15` — `cancel-in-progress: true` on the Pages group can cancel a deploy mid-upload; GitHub's Pages template uses `false`.
- `assets/js/i18n.js:62` — language-click fetch failure is an unhandled rejection with no user feedback; click appears dead.
- `assets/js/include.js:25` — includes past `MAX_DEPTH` (or cyclic partials) are left as raw placeholders with no error logged; cycles fan out fetches up to depth 5.
- `assets/js/calc.js:65` — `aportes >= 600` with desired pension > 0 shows "not reached" built from all-zero meta ($0, 0 months); matches legacy (spec req. 8 demands parity), but is misleading. *(unverified in UI)*
- `assets/js/calc.js:11` — `years >= 50`, `COEF_MAX` (duplicates `COEF[50]`), the 59/60 averaging window, and `eligibility()` destructuring `[noAge, a60, a65, a70]` hard-couple to current data shape; a new tier or window change silently misreads.
- `assets/js/i18n.js:5` — language set scattered (`LANGS`, es/en `toggle()`, `'es'` defaults, `check-i18n` hardcoding es/en); adding a third language leaves it unreachable with nothing failing.
- `design-system/index.html:13` — the production design-system page loads exploration CSS and a 7-family Google Fonts request, contradicting `internal/steering/design.md:17` ("Production pages never import from here"); fix the doc or lazy-load on the Exploration tab.
- `design-system/index.html:290` — specimens hardcode `$1,013` / `$482` instead of deriving from `SBU`; stale after the yearly SBU update.
- `tests/e2e/calculator.spec.js:56` — simulation parity compares only row count and first/last rows; middle-row rendering regressions pass. *(unverified)*
- `playwright.config.js:9` — e2e never runs under the `/calculadora-jubilacion-iess/` sub-path that spec req. 3 targets; `reuseExistingServer: true` lets a stray local server on 4173 serve the wrong tree.

## Dropped as false positives
- Legacy root URL / anchors (`#pension-maxima` etc.) break — the new site is a new Pages project (`calculadora-jubilacion-iess`); the legacy calculator lives in a separate project, so no existing links point here.
- `innerHTML` with i18n strings / fetched partials is XSS — all sources are same-origin static files and `data-include` paths are static; no user-controlled input reaches them.
