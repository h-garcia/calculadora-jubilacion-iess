# Skill: internal-scaffolding

> This is a personal Claude Code skill. It lives in the author's skills folder
> (`~/.claude/skills/internal-scaffolding/`), not in this repository. This page describes it;
> it does not include it.

## What it is for

A spec-driven workflow for solo or internal projects. It creates and maintains the
[`internal/`](../internal/CLAUDE.md) folder, turns roadmap items into specs, and moves each
item through delivery one approved step at a time.

## When it runs

- **Empty project:** it bootstraps. It asks two questions (project name, one-sentence
  description) and creates the folder structure from templates. It never overwrites existing files.
- **Existing project:** it shows a menu: check steering coverage, specify a roadmap item,
  continue a delivery stage, log QA feedback, archive finished roadmap items, or (marketing
  sites only) content and video.

## What it produces

```
AGENTS.md                 ← points every AI agent at internal/CLAUDE.md
internal/
├── CLAUDE.md             ← the project rules, valid even without the skill
├── steering/             ← product, roadmap, tech-stack, design
├── specs/                ← YYYY-MM-DD-<slug>.md, one per feature
├── qa/                   ← the human's raw testing notes, verbatim
├── ai-reviews/           ← AI reviews and measurements
└── releases/             ← CHANGELOG.md, roadmap-log.md
```

## Key rules

- **Approval gates.** Branch, spec, implement, review, push, PR, merge: each needs a human
  "yes". Finishing one step is never permission for the next.
- **Specs are the source of truth.** They say *what*, not *how*. If code and spec disagree,
  the spec is updated first. Shipped specs are frozen; changes get a new dated file.
- **The spec interview happens in three rounds:** scope and value, then requirements and edge
  cases, then acceptance criteria and open questions.
- **The roadmap is an index.** At most two sentences per item: `[ ]` not started, `[WIP]` once
  the branch exists, `[x]` when merged.
- **Delegate down, review up.** Well-specified slices go to a cheaper model; slicing, review,
  debugging and spec work stay on the stronger one.
- **Design system first.** Reuse an existing element, component or section before making a
  new one. Anything new is added to the design-system reference page in the same change.
- **Semantic ids.** Every UI element gets a stable kebab-case `id` (`landing-hero-cta`) so
  people can point to it in feedback.
- **Changelog on push.** A dated entry, in its own commit, before every push.
- **Merge closes the loop.** Deleting the branch and flipping the roadmap item to `[x]` are
  part of the merge, not later chores.

See it in action: [How this project was built](how-this-was-built.md).
