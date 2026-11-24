# 2026-11-24 — How this project was built (docs)

## Summary
Three short Markdown files in `docs/` that explain how this repository was built with Claude Code and the two local skills that drove the process: `internal-scaffolding` (spec-driven delivery workflow) and `adversarial-review` (hostile pre-PR review). The project doubles as a practice repository (`steering/product.md`, Purpose), so making its workflow legible lets others learn from and reuse it.

## User value
A developer or tech lead landing on the repo can understand, in a few minutes, how the project went from an empty folder to a merged, reviewed landing page, what each skill does, and how to reproduce the workflow on their own project. A PM or BA can follow the same files without needing to read code.

## Requirements
1. The repository shall contain exactly three new files: `docs/how-this-was-built.md`, `docs/skill-internal-scaffolding.md`, and `docs/skill-adversarial-review.md`.
2. All three files shall be written in English, in plain language, and each shall fit in roughly one screen (about 80 lines or fewer).
3. `how-this-was-built.md` shall tell the actual history of the project in chronological order (bootstrap → steering → branch → spec → implementation → design exploration and choice → adversarial review → changelog → PR → merge → roadmap item closed), linking to the real spec, AI review, changelog, and roadmap files.
4. `how-this-was-built.md` shall link to both skill files.
5. Each skill file shall state what the skill is for, when it runs (and when it must not), what it produces and where, and its key rules.
6. Each skill file shall state that the skill lives outside this repository (in the author's personal Claude Code skills folder) and is described, not included.
7. `README.md` shall link to `docs/how-this-was-built.md`.
8. Every relative link in the three files and the README link shall resolve to an existing file in the repository.

## Out of scope
- Copying the skill source files into the repository.
- Spanish translations.
- Publishing these files on the GitHub Pages site.
- The contributor guide for non-technical PRs (separate roadmap item).

## Acceptance criteria
- Given the branch, when listing `docs/`, then exactly the three files exist.
- Given each file, when read, then it is English, about one screen long, and meets requirements 3–6 as applicable.
- Given `README.md`, when opened on GitHub, then it links to `docs/how-this-was-built.md`.
- Given every relative link in the new files, when followed, then it opens an existing file.

## Open questions
- None.
