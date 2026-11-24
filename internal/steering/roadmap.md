# Roadmap

Planned work, grouped by the month it's targeted for. Statuses: `- [ ]` not started, `- [WIP]` in flight, `- [x]` merged. Undated ideas live in `## Backlog` at the bottom.

To start work on an item, ask the `internal-scaffolding` skill to spec it — that creates a branch and a file in `internal/specs/`.

When a month wraps, run the archive command (e.g., "archive 2026-11") to move every `- [x]` item under that heading into `internal/releases/roadmap-log.md`. Unchecked items stay where they are; the heading is removed only if everything moved.

**This file is an index, not a record.** Every item is at most two sentences: what it is, its status, and where the detail lives. Reasoning, measurements, decisions and history belong in the spec, the QA note, or the AI review the item points at — never here.

## 2026-11
- [x] Landing page (ES/EN with top-right language selector) that embeds the existing IESS calculator, deployed to GitHub Pages. Spec: `internal/specs/2026-11-24-landing-page.md`; PR #1; review: `internal/ai-reviews/2026-11-24-feat-landing-page.md`.
- [ ] Contributor guide so non-technical team members can open PRs from the GitHub web editor. Spec: TBD.
- [ ] Yearly SBU / coefficient data updates as editable data files. Spec: TBD.
- [WIP] Short `docs/` files explaining how this project was built and the two local skills used. Spec: `internal/specs/2026-11-24-how-it-was-built.md`.

## Backlog
