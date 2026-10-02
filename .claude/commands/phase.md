---
description: Start or resume a build phase, e.g. /phase 04
argument-hint: <phase number, e.g. 04>
---

We are working on phase $ARGUMENTS of the Your Hair Company platform.

1. Read `CLAUDE.md` (rules) and `PROGRESS.md` (what is done, what is waiting on the client).
2. Open the matching file in `phases/` (the one whose name starts with `PHASE_$ARGUMENTS`).
3. Read only the docs that phase file points to.
4. If the phase is already partly done (ticked tasks or PROGRESS log lines), say which tasks remain.
5. Give me your plan (max 25 lines): tasks in order, files, migrations, tests, blockers from docs/12, questions.
6. Wait for my OK. Then work task by task following "How to run a phase" in CLAUDE.md: tests green, commit with FR IDs, tick the task, log in PROGRESS.md.
7. When all tasks are done, run the phase's acceptance criteria and report pass/fail for each.
