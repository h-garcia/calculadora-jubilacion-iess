# Design system

This steering document defines the visual direction and records decisions. The design-system source files belong in the application, alongside the code that consumes them; they are not copied into `internal/`.

## Design-system locations

Record the project-specific paths here before adding or changing a design-system asset.

The design system is organized into five areas, shown as five tabs (in this order) on the app's living reference page.

| Area / tab | Application path | Notes |
|---|---|---|
| Brand | `design-system/brand/` (`tokens.css`, logo, favicon) | Tokens (`tokens.json` or equivalent: color, type, spacing, radii), wordmark/logo, monogram/favicon. |
| Elements | `design-system/elements/elements.css` | Buttons, inputs, typography, badges, and other atoms. |
| Components | `design-system/components/components.css` + Alpine components in `assets/js/` | Reusable composites such as cards, navigation, forms, and dialogs. |
| Sections | `design-system/sections/*.html` partials + `sections.css` | Reusable page-level blocks such as hero, pricing, and footer. |
| Exploration | `design-system/exploration/` (dated files, kept permanently) | Dated, non-production explorations. Production pages never import from here. |

**Living reference page:** `design-system/index.html` → https://h-garcia.github.io/calculadora-jubilacion-iess/design-system/ — access: public, linked from the main nav. Rendered from the same source files as production pages.

## Aesthetic

Fresh look, to be chosen by the user from the 5 directions on the Exploration tab (spec `2026-11-24-landing-page.md`). Until then production uses neutral placeholder tokens.

## Principles

- Clarity for non-financial users: large numbers, plain language, one primary action per screen.
- Bilingual by construction: no visible text in HTML; every string comes from `i18n/*.json`.
- Mobile first: works at 360px with no horizontal scroll.

## Decisions and open questions

- 2026-11-24: Exploration directions are never deleted, even after one is chosen (user decision).
- Open: which of the 5 directions becomes production.
