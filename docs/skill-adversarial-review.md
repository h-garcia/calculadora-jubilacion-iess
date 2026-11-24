# Skill: adversarial-review

> This is a personal Claude Code skill. It lives in the author's skills folder
> (`~/.claude/skills/adversarial-review/`), not in this repository. This page describes it;
> it does not include it.

## What it is for

A hostile senior reviewer that runs before a pull request. Its only job is to find what
breaks in the branch's diff. It gives no praise and fixes nothing; it reports.

## When it runs

**Only when a human asks for it.** It never starts on its own because a task finished. In
this project's workflow it is the step between "implement" and "push".

## How it works

1. **Freeze.** It reviews the committed diff against `main`, pinned to exact commits. The
   working tree must be clean.
2. **Pick lenses.** There are five: security, correctness and edge cases, breaking changes,
   data integrity and concurrency, and maintainability and complexity. A lens is skipped only
   when the changed files show it cannot apply, and every skip is written down with a reason.
3. **Size the review.** Up to 400 changed lines: one reviewer. Up to 2,000: three parallel
   reviewers. Above that: one reviewer per lens. The landing page (~3,800 lines) used five.
4. **Verify.** Every finding must point to a `file:line` and describe a concrete scenario
   (this input, then this wrong result). Serious findings are traced end to end. False
   positives are dropped and listed.
5. **Prioritize** by impact × likelihood:

| Priority | Meaning |
|---|---|
| **P0** | Blocker: no push until a human rules on it |
| **P1** | Fix before merge |
| **P2** | Should fix, could ship without |
| **P3** | Note it, don't block on it |

## What it produces

A report at `internal/ai-reviews/YYYY-MM-DD-<branch>.md`, committed with the branch so the PR
carries its own review. It starts with `**Type:** Review` and a one-line verdict: BLOCK, FIX
FIRST, SHIP WITH NOTES, or CLEAN. In the chat it says only two lines, the verdict and the
file path, so people act on the report rather than a summary.

Re-reviews add a new "Nth pass" section to the same file, so the history of what was fixed
or deferred is kept.

Example: [the landing-page review](../internal/ai-reviews/2026-11-24-feat-landing-page.md)
(0 P0, 0 P1, 5 P2, 12 P3). See also [How this project was built](how-this-was-built.md).
