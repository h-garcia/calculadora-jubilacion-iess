# 2026-11-24 — Landing page with bilingual calculator

## Summary
A public, bilingual (Spanish / English) website for Ecuadorian workers: a landing page that explains IESS retirement rules and drives visitors to the pension calculator, the existing IESS calculator moved onto its own page, and a public design-system reference page. All visible text lives in translation files so non-technical team members can change copy through pull requests, with CI guarding those changes. Ties to the product purpose in `steering/product.md`: help workers estimate their pension, and give PMs/BAs a safe repository to practice PRs.

## User value
A worker can land on the site, understand the retirement rules in their language, and get to the calculator in one click to estimate their pension and what they need to contribute to reach a target pension. A non-technical teammate can change any visible text by editing one JSON file, and CI tells them if they broke something.

## Requirements

### Pages and navigation
1. The site shall have three pages: Landing (`/`), Calculator (`/calculadora/`), and Design System (`/design-system/`).
2. Every page shall show a top navigation with links to Home, Calculator, and Design System, and a language toggle in the top-right corner.
3. All internal links shall work when the site is served from the GitHub Pages project path (`/calculadora-jubilacion-iess/`).

### Landing page
4. The landing page shall contain, in order: Hero (headline, subheadline, call-to-action), How it works (3 steps), Rules explained, FAQ (6 questions and answers), Disclaimer, Footer.
5. The hero call-to-action ("Calcula mi pensión" / "Calculate my pension") shall navigate to the Calculator page.
6. The Rules explained section shall show: retirement age vs. required contributions, minimum pension by years of contributions, maximum pension by years of contributions, and the retirement coefficient table.
7. The disclaimer shall state that results are estimates, not official IESS advice, and link to the official IESS website.

### Calculator page
8. The Calculator page shall provide the same inputs, outputs, desired-pension simulation, and recommendation as the original calculator (`IESS-jubilacion/index.html`), with identical numeric results for identical inputs.
9. The Calculator page shall keep its "Reference tables" tab. Those tables and the landing page's Rules explained section shall be rendered from the same data, so they cannot disagree.
10. A short disclaimer note shall appear under the calculator results, in addition to the footer disclaimer.

### Language
11. The default language shall be Spanish.
12. The language toggle shall be a compact `ES | EN` control. Activating it shall switch every visible string on the current page, including calculator labels, results text, and tables.
13. The selected language shall persist across pages and across visits on the same browser.
14. The page's `<html lang>` attribute shall match the selected language.
15. All visible text shall come from two translation files, one per language, with identical key sets.
16. When a translation key is missing, the page shall not silently fall back: it shall show a visible red marker `⚠ missing: <key>` in place of the text and log an error to the browser console.
17. Money shall be formatted the same in both languages: `$` followed by the amount rounded to whole dollars with comma thousands separators (e.g. `$1,200`).

### Design system
18. The Design System page shall have five tabs, in this order: Brand, Elements, Components, Sections, Exploration.
19. Every element, component, and section used on a production page shall appear on the Design System page, rendered from the same source the production pages use.
20. The Exploration tab shall show 5 distinct visual directions (each with a name, palette, typography, and a sample hero/card). These explorations shall be kept permanently, including after a direction is chosen; production pages shall not depend on them.
21. Production pages shall use a fresh visual direction chosen by the user from the 5 explorations (see Acceptance criteria and the delivery note below).

### Quality and delivery
22. Every interface element added shall have a stable, semantic, kebab-case `id`.
23. Pages shall render without horizontal scroll at 360px viewport width; the toggle and nav shall work on mobile.
24. The language toggle and navigation shall be reachable and operable by keyboard.
25. On every pull request, CI shall fail if either translation file is invalid JSON or if the two files do not have identical key sets, and shall run the automated tests.
26. On merge to `main`, the site shall be published to GitHub Pages.

**Delivery note:** implementation pauses after the 5 explorations are built so the user can pick one; brand tokens and production page styling are built only after that choice.

## Out of scope
- Moving SBU and coefficient values into editable data files (roadmap item: "Yearly SBU / coefficient data updates").
- Contributor guide for non-technical PRs (separate roadmap item).
- Per-PR preview deployments.
- Analytics, contact form, custom domain.
- Languages other than Spanish and English.

## Acceptance criteria
- Given a set of reference inputs (at least: 180 aportes / $1,800 / 65 years; 300 / $1,200 / 55 with desired $900; 480 / $2,500 / 58; 100 / $600 / 70), when entered in the new calculator, then every output matches the original calculator.
- Given any page, when the user clicks `EN`, then every visible string is English, `<html lang="en">` is set, and after navigating to another page or reloading, English is still selected.
- Given the landing page, when the user clicks the hero CTA, then the Calculator page opens.
- Given any page, then the nav shows Home, Calculator, Design System and each link works on the GitHub Pages URL.
- Given the landing page in either language, then Hero, How it works, Rules explained, FAQ (6 Q&As), Disclaimer, and Footer are present.
- Given the Rules explained section and the calculator's Reference tables tab, then they show the same values.
- Given a translation key missing from one file, when that page renders, then `⚠ missing: <key>` is shown in red and a console error is logged; and given a PR with that change, CI fails.
- Given a PR with invalid JSON in a translation file, then CI fails.
- Given a 360px-wide viewport, then no page scrolls horizontally and the toggle and nav are usable.
- Given keyboard-only navigation, then the nav links and language toggle can be focused and activated.
- Given any interface element on the three pages, then it has a unique semantic kebab-case `id`.
- Given the Design System page, then it shows the five tabs in order and the Exploration tab shows 5 named visual directions.
- Given a merge to `main`, then the GitHub Pages site updates.

## Open questions
- None. The visual direction is chosen by the user mid-implementation (see Delivery note).

## Interview log
Questions asked during specification and the user's answers, verbatim where short.

### Setup (before specification)
- **Which project idea?** → Landing page that uses the existing IESS calculator (`IESS-jubilacion`).
- **Stack?** → Static (plain HTML/CSS + Alpine.js, no build step).
- **Hosting?** → GitHub + GitHub Pages; public repo `h-garcia/calculadora-jubilacion-iess`.
- **Project name?** → "Calculadora jubilacion iess" (also the repo name).
- **Description?** → "A public landing page for Ecuadorian workers that explains IESS retirement rules and lets them estimate their pension and how much more they need to contribute to reach a target pension."
- **Language?** → Spanish + English, selectable from a toggle at the top-right corner of the page.

### Round 1 — user, value, scope
1. **Primary user is the Ecuadorian worker (~40–65) planning retirement; anyone else?** → Yes, the worker.
2. **Main goal: (a) use the calculator, (b) understand the rules, (c) other?** → (a) use the calculator.
3. **Which sections in v1 (hero, how it works, calculator, rules explained, FAQ, disclaimer, footer)?** → All.
4. **Calculator embedded in landing (a) or separate `/calculadora` page (b)?** → (b) separate page.
5. **Out of scope: data files, contributor guide, analytics/contact/domain; all text in translation files in scope?** → OK; OK to use translation files.
6. **Spanish default, remember choice?** → OK.

### Round 2 — requirements, happy path, edge cases
1. **Calculator "Tablas de referencia" tab: (a) keep, sharing data with landing, or (b) drop and link?** → Keep them.
2. **Toggle `ES | EN` or dropdown?** → Toggle.
3. **Money format per language?** → Both show the same.
4. **Who writes FAQ/copy?** → Claude drafts it; reviewed in the PR.
5. **Missing translations: fall back or break; CI check?** → It should break. CI should also check.
6. **Disclaimer in footer + under calculator results?** → OK.
7. **Design system page at `/design-system/`, public, unlinked?** → Also link it in the nav.
8. **Keep current calculator look or fresh look?** → Fresh look; add 5 versions to the Exploration tab of the design system.
- Additional instruction: capture all questions and answers in the spec file.

### Round 3 — acceptance criteria, cuts, open questions
1. **"Break" = red `⚠ missing: key` marker + console error + CI failure?** → OK.
2. **Pause after explorations for the user to pick (a), or Claude picks (b)?** → (a). Don't remove the exploration versions; keep them.
3. **Node as dev-only tooling (Vitest, Playwright, GitHub Actions); Alpine pinned to an exact version?** → OK.
4. **Proposed acceptance criteria?** → OK.
5. **Out-of-scope list?** → OK.
