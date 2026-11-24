# How this project was built

This site was built with [Claude Code](https://claude.com/claude-code), steered by two personal
skills: [internal-scaffolding](skill-internal-scaffolding.md), which runs the workflow, and
[adversarial-review](skill-adversarial-review.md), which attacks the code before it ships.
Everything below happened on 2026-11-24 and is visible in `git log`.

## The rule that shaped everything

Every piece of work follows the same path, and **a human approves each step** before the next one starts:

```
Roadmap item → branch → spec → implement → adversarial review → push → PR → merge → close the item
```

The AI never moves on just because a step finished. Approving the spec is not approval to
push; approving the PR is not approval to merge.

## The story, step by step

1. **Scaffold.** The `internal-scaffolding` skill asked for the project's name and a
   one-sentence description, then created the [`internal/`](../internal/CLAUDE.md) folder:
   steering docs, empty `specs/`, `qa/`, `ai-reviews/` and `releases/`. It also added a root
   [`AGENTS.md`](../AGENTS.md) so any AI agent finds the rules.
   *Commit: `chore: bootstrap internal scaffolding`.*
2. **Steering.** [`product.md`](../internal/steering/product.md) captured the vision (every
   Ecuadorian worker understands their IESS pension) and the second purpose (a practice repo
   for PMs and BAs). [`tech-stack.md`](../internal/steering/tech-stack.md) fixed the
   constraints: static HTML, no build step, Alpine.js, Vitest + Playwright, TDD.
3. **Roadmap.** The work was listed in [`roadmap.md`](../internal/steering/roadmap.md), an
   index with at most two sentences per item that points to where the detail lives.
4. **Branch, then spec.** `feat/landing-page` was created *before* the spec was written. The
   skill interviewed in three rounds (scope, requirements, acceptance criteria) and wrote
   [the landing-page spec](../internal/specs/2026-11-24-landing-page.md): 26 testable
   requirements, including exact numeric parity with the original calculator.
5. **Implement, tests first.** Tests were written from the acceptance criteria, then the
   landing, calculator and design-system pages, with all text in `i18n/es.json` and
   `i18n/en.json`.
6. **Pick a look.** Implementation paused after five visual directions were built on the
   design-system page's Exploration tab. A human chose "Claro", and only then was it applied
   to production. *Commit: `feat: adopt Claro visual direction for production`.*
7. **Adversarial review.** The `adversarial-review` skill reviewed the ~3,800-line diff with
   five parallel reviewers, one per lens. Verdict: ship with notes (0 P0, 0 P1, 5 P2, 12 P3).
   The report is committed with the branch:
   [`2026-11-24-feat-landing-page.md`](../internal/ai-reviews/2026-11-24-feat-landing-page.md).
8. **Changelog, push, PR, merge.** Before pushing, a dated entry was added to
   [`CHANGELOG.md`](../internal/releases/CHANGELOG.md) as a separate commit. PR #1 was opened
   with the spec and review linked, then merged, and the branch was deleted.
9. **Close the item.** Right after the merge, the roadmap line flipped from `[WIP]` to `[x]`
   with the PR number and review path. *Commit: `docs: close landing page roadmap item`.*

## Where things live

| Want to know… | Look in |
|---|---|
| Why the project exists | `internal/steering/product.md` |
| What is planned or in flight | `internal/steering/roadmap.md` |
| Exactly what a feature must do | `internal/specs/` |
| What the AI found wrong | `internal/ai-reviews/` |
| What shipped and when | `internal/releases/CHANGELOG.md` |

## Reuse it

Install the two skills in your own Claude Code skills folder, open an empty project, and ask
Claude Code to scaffold it. The rules travel with the repo in `internal/CLAUDE.md`, so they
still apply when the skills are not installed.
