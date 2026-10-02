---
description: Self-review the current phase before opening a PR
---

Review the work on the current branch against its phase file and CLAUDE.md. Do not change code yet; produce a findings list.

Check:
1. Every task ticked is actually implemented; every acceptance criterion — pass/fail with evidence (test name, command output, screenshot path).
2. CLAUDE.md architecture rules: money only confirmed in processCapturedPayment; prices recomputed server-side; idempotency keys; service-role imports only in src/server or src/app/api; requireRole in every server action/handler; no clinical data in sales views, messages, logs or Sentry; audit on clinical views and ★ actions; settings instead of hard-coded windows.
3. RLS: new tables have RLS + policies + docs/04 entry + tests.
4. Security: zod on every input, rate limits where public, webhook signatures, no secrets in code, error messages don't leak internals.
5. UX: loading/empty/error states, 360 px layout, status chips with words, copy free of banned claims.
6. Tests: coverage of the critical paths for this phase (docs/10 §2 items that apply).

Output: a table of findings (severity S1–S4, file:line, problem, fix). Then ask whether to fix them.
