# `internal/` workspace rules

`internal/` stores durable intent and records. Specs are the source of truth: when code and spec disagree, update the spec before changing code.

## Scope and implementation

These instructions govern the entire repository, including application code and tests outside
`internal/`. Read the approved spec and applicable steering before implementation: product
and roadmap for scope, tech-stack for constraints and TDD policy, and design plus referenced
assets when changing the interface. Resolve genuine blockers; implement against the actual
acceptance criteria and run the relevant checks before reporting completion.

An explicit user request to perform a stage authorizes that stage; do not ask for the same
approval again. It does not authorize later delivery stages. When implementation would change
approved behavior, return to the spec and obtain approval for that change.

## Model usage

**Delegate down, review up.** For already well-specified implementation, use a cheaper
available subagent model capable of the slice. This applies to templates, wiring, mechanical
refactors, tests against a spec, QA fixes, and follow-up implementation as well as roadmap work.

- Keep decomposition, orchestration, integration review, spec/steering/design decisions, and
  difficult debugging on the stronger model.
- Give each subagent the relevant spec excerpts and acceptance criteria, a bounded task and
  file scope, and the checks it must run. Review its changes and evidence before integrating.
- Escalate difficult migrations, authorization/security edge cases, or work that is not
  converging to the stronger model instead of letting a cheaper model keep retrying.
- Respect session restrictions on delegation and model selection. If subagents or a suitable
  cheaper model are unavailable, disclose the limitation and proceed with authorized work
  using available capabilities; do not silently claim to have delegated.

These standing rules apply even when the internal-scaffolding skill is not loaded. The skill
contains the detailed workflow procedures; its absence does not remove these project rules.

## Folder map

```
internal/
├── CLAUDE.md
├── steering/
│   ├── product.md         ← vision, strategy, objectives
│   ├── roadmap.md         ← monthly work + backlog; an index, not a record
│   ├── tech-stack.md      ← languages, libraries, conventions, TDD policy
│   └── design.md          ← visual direction + paths to app-owned design assets
├── specs/                 ← YYYY-MM-DD-<slug>.md
├── qa/                    ← human observations from hands-on testing
├── ai-reviews/            ← agent reviews and observed-system records
└── releases/
    ├── CHANGELOG.md
    └── roadmap-log.md
```

Do not create `internal/README.md`; this file is the guide. Do not create `content/` or `video/` unless the project is a marketing site and the user asks for the relevant workflow.

## Delivery gates

Each roadmap item moves through:

`Roadmap item → new branch → spec → implement → adversarial review → push, PR, merge → close the item`

Get the user's explicit approval before every transition. Completion of one stage is never permission to start the next. Create the branch before writing the spec, and do not push, open a PR, or merge without separate approval. If implementation changes the intended behavior, update and re-approve the spec first.

**Delete the merged branch as part of the merge.** Once a PR merges, delete its branch both on the remote (`gh pr merge --delete-branch`) and locally (switch to an up-to-date `main`, then `git branch -d <branch>`) — no separate approval needed. Use `-d`, never `-D`; if git refuses because the branch is not fully merged, stop and tell the user rather than forcing it.

**Closing the item is part of merging, not a separate errand.** The moment a merge lands, flip its roadmap item from `[WIP]` to `[x]` and append the PR number and review path to the item's pointer sentence — no separate approval needed, since approving the merge is approving the item as done. The roadmap is a status index; a merged item still reading `[WIP]` makes it lie about what is in flight. Do it alongside reporting the merge SHA rather than deferring it: nobody re-reads a roadmap line they did not just change, so a missed flip stays invisible until the item is picked up a second time.

## Steering

- `product.md`: vision, purpose, promise, users, strategy, objectives.
- `roadmap.md`: monthly checkbox bullets plus `## Backlog`. Each item has a two-sentence maximum and points to its detailed spec, QA note, review, or PR. Statuses are `[ ]` not started, `[WIP]` in flight, `[x]` merged — `[WIP]` goes up when the branch is created and `[x]` when the PR merges, so the file always answers "what is in flight" without being read against git.
- `tech-stack.md`: implementation constraints and conventions.
- `design.md`: visual principles and decisions. It must state where the app keeps each of the five design-system areas and where the living reference page lives.

## Design system belongs in the app

Keep design-system source files in the base application alongside their consumers, not under `internal/`, organized into five areas:

- **Brand** — tokens (`tokens.json` or the app's equivalent: color, type, spacing, radii), wordmark/logo, monogram/favicon
- **Elements** — primitives (buttons, inputs, typography, badges)
- **Components** — reusable composites (cards, navigation, forms, dialogs)
- **Sections** — page-level blocks (hero, footer, and similar)
- **Exploration** — dated, non-production explorations; production pages never import from it

When the app has a UI, the design system gets its own app/module and a living reference page with these five tabs in this order, rendered from the same source the production pages use. Record the project-specific locations, the reference page's URL, and who can access it in `steering/design.md`. Before changing these assets, read the app's existing design-system conventions and update the relevant code, its reference tab, and its steering record together.

**Design system first.** Before building any interface, check the design system for an existing element, component, or section that fits, and reuse it. Create a new one only when nothing fits, and add it to the design system — its source and its reference tab — in the same change that first uses it. Every element, component, and section used on a production page appears on the living reference page; pages never carry one-off buttons, links, or blocks.

## Semantic ids

Give every interface element you add or change a stable, semantic, kebab-case `id` that
names what it is, so the user can point to it in feedback. Name it page or component, then
region, then element: `practice-header-status`, `setup-tabs`, `logo-upload-button`,
`brand-primary-color-field`. Ids are unique on the page; repeated items share a prefix plus
the record's key (`request-row-<id>`). Keep ids stable; rename one only with a reason. Ids
identify elements and are not used for styling; existing `data-testid` hooks stay for tests.

## Specs

Specs are dated: `YYYY-MM-DD-<slug>.md`. They contain Summary, User value, Requirements, Out of scope, Acceptance criteria, and Open questions. They define **what**, not library choices or code structure.

Edit an in-progress spec freely. Once shipped, freeze it; a later iteration is a new dated file (`-2`, `-3`, etc. for same-day collisions).

## QA and AI reviews

`qa/` is the human's raw feedback. When transcribing it, preserve the user's wording, order, and intent; never append agent analysis. The only allowed later edit is adding `[x] ` to a shipped bullet.

`ai-reviews/` is the agent's folder for reviews, measurements, smoke runs, and other system observations. Every file begins directly below its title with `**Type:** Review` or `**Type:** Record`. A review finding at P0 blocks a push unless the user explicitly decides otherwise.

When QA drives a fix, find the actual root cause, clarify ambiguity, and create a normal dated spec with `Derived from internal/qa/<file>` under the title. Keep the QA note untouched.

## Marketing-only content and video

Ask whether to create the appropriate folder before drafting marketing material:

```
content/
├── style.md
└── YYYY-MM-DD-<slug>.md

video/
├── video-style.md
└── YYYY-MM-DD-<slug>.md
```

Ask whether each video accompanies a content piece or stands alone. Read the relevant style guide before drafting. Published pieces and videos are immutable; create a new dated iteration for revisions.

## Changelog on push

Before every approved `git push`, list the outgoing commits and prepend a dated, branch-grouped entry to `releases/CHANGELOG.md`. Commit it separately as `chore: update changelog`, then push both commits. Skip only for a changelog-only push or a push containing only docs changes entirely inside `internal/`.
