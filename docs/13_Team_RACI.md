# 13 · Team, RACI & Cadence

Assign names in the "Owner" column at kick-off.

## 1. Roles

| Role | Owner | Focus |
|---|---|---|
| Product owner | `[name]` | Scope, PRD changes, client approvals, acceptance |
| Tech lead | `[name]` | Architecture, reviews every Claude Code PR, migrations, releases, security |
| Backend / full-stack dev | `[name]` | Phases 03, 04, 06–11 server work |
| Frontend dev | `[name]` | Phases 02, 04–07, 10–11 UI |
| UI/UX designer | `[name]` | Figma for site, booking, portals (starts week 1) |
| QA | `[name]` | Test cases (docs/10), E2E, UAT |
| Client servicing | `[name]` | Asset checklist (docs/12), meetings, sign-offs |
| Client: Dr. Tyagi | Dr. Tyagi | Medical content, intake, protocols, UAT |
| Client: operations | `[name]` | Accounts, logistics, products |

## 2. RACI (R = does, A = accountable, C = consulted, I = informed)

| Work | PO | Tech lead | Dev | Design | QA | Client svc | Dr. Tyagi | Client ops |
|---|---|---|---|---|---|---|---|---|
| Scope changes | A | C | I | C | I | R | C | C |
| UI/UX designs | A | C | C | R | I | C | C | I |
| Schema & migrations | I | A | R | – | C | – | – | – |
| Booking & payments | C | A | R | C | R (tests) | I | I | C |
| Doctor Portal | C | A | R | R | R | I | C (UAT) | – |
| Medical content & intake | A | – | I | C | – | R | R | – |
| Integrations & accounts | I | A | R | – | C | R (collect) | – | R (create) |
| Compliance & policies | A | C | I | – | – | R | C | R (counsel) |
| Testing & UAT | C | C | C | – | A/R | R | R | R |
| Go-live | A | R | R | – | R | R | C | C |

## 3. Cadence
- **Daily** (15 min, internal): yesterday / today / blockers; Claude Code output reviewed by tech lead before merge.
- **Weekly** (45 min, with client): demo on staging, decisions needed (docs/15), assets status (docs/12).
- **End of each phase**: phase acceptance checklist signed in `PROGRESS.md`.
- **Change control**: new requests go to `docs/15_Decisions.md` as "Proposed"; PO decides MVP vs Phase 2.

## 4. Working with Claude Code (team rules)
1. One phase at a time; one branch per phase (`feat/phase-04-booking`).
2. Claude Code proposes a plan first for each phase; tech lead approves before code.
3. Every PR: tests passing, `PROGRESS.md` updated, FR IDs in commits.
4. Humans own: secrets, production deploys, Razorpay live mode, medical wording, guarantee activation.
