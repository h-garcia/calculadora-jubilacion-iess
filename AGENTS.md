# Project instructions

Before working in this repository, read [internal/CLAUDE.md](internal/CLAUDE.md).
Its implementation, delegation, verification, and delivery rules apply to the entire
repository, including source code and tests outside `internal/`.

Use the approved spec and relevant steering referenced there. For well-specified
implementation, delegate bounded slices to a cheaper available subagent model and keep
orchestration, integration review, and difficult debugging on the stronger model. Follow
session restrictions and disclose when delegation or model selection is unavailable.

For interface work, check the design system first and reuse an existing element, component,
or section; anything new is added to the design system and its reference page in the same
change (see "Design system first" in internal/CLAUDE.md).

An explicit user request authorizes the named stage. Preserve the separate approval gates
for later stages; do not request approval again for work already authorized.
