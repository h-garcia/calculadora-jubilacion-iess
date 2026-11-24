# Design system

This steering document defines the visual direction and records decisions. The design-system source files belong in the application, alongside the code that consumes them; they are not copied into `internal/`.

## Design-system locations

Record the project-specific paths here before adding or changing a design-system asset.

The design system is organized into five areas, shown as five tabs (in this order) on the app's living reference page.

| Area / tab | Application path | Notes |
|---|---|---|
| Brand | `<path in the app>` | Tokens (`tokens.json` or equivalent: color, type, spacing, radii), wordmark/logo, monogram/favicon. |
| Elements | `<path in the app>` | Buttons, inputs, typography, badges, and other atoms. |
| Components | `<path in the app>` | Reusable composites such as cards, navigation, forms, and dialogs. |
| Sections | `<path in the app>` | Reusable page-level blocks such as hero, pricing, and footer. |
| Exploration | `<path in the app>` | Dated, non-production explorations. Production pages never import from here. |

**Living reference page:** `<URL>` — access: `<public / staff-only>`. Rendered from the same source files as production pages.

## Aesthetic

<Overall feel, words a user would use to describe it, and useful references.>

## Principles

- <Principle and its practical implication.>
- <Principle and its practical implication.>

## Decisions and open questions

<Freeform: accepted trade-offs, references, rejected approaches, and unresolved design decisions.>
