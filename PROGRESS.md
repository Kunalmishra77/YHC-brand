# PROGRESS

Claude Code updates this file after every task. Humans update "Waiting on client" and sign-offs.

## Status
| Phase | Status | Branch | Started | Done | Acceptance |
|---|---|---|---|---|---|
| 00 Foundation | ⏳ Not started | | | | |
| 01 Data layer | ⏳ | | | | |
| 02 Design system & website | ⏳ | | | | |
| 03 OTP, catalog & checkout | ⏳ | | | | |
| 04 Consultation booking | ⏳ | | | | |
| 05 Doctor Portal | ⏳ | | | | |
| 06 Recommendation & purchase | ⏳ | | | | |
| 07 Sales CRM | ⏳ | | | | |
| 08 Messaging & automation | ⏳ | | | | |
| 09 Fulfilment, care & refill | ⏳ | | | | |
| 10 Account & guarantee | ⏳ | | | | |
| 11 Admin & analytics | ⏳ | | | | |
| 12 Hardening & launch | ⏳ | | | | |

## Kit baseline (before Phase 00)
- 2026-10-02 · Schema migration + seed executed and behaviour-tested on Postgres 16 (stub auth/storage): holds, idempotent payment capture, late payments, credit consumption, reorder dates, lead stage rules + manual guard, jobs, RLS matrix incl. MFA-at-DB, hijack/escalation/reactivation blocks — all PASS (`supabase/tests/manual/`).
- 2026-10-02 · Independent review of the kit (35 findings: RLS gaps, payment atomicity, phase ordering, templates) — all addressed in schema + docs before handover (see docs/15 ADR-16…21).

## Log
<!-- YYYY-MM-DD · phase.task · what changed · FR IDs · tests -->

## Installed versions
<!-- filled in Phase 00 -->

## Waiting on client (mirror of docs/12)
- [ ] D-P1 Guarantee terms
- [ ] D-P2 Product regulatory categories + licences
- [ ] D-P3 ₹500 credit confirmation
- [ ] D-P4 Consult cancellation/refund rules
- [ ] D-P5 Follow-up consult fee
- [ ] D-P6 Reorder validity
- [ ] D-P7 WhatsApp provider/number + API docs
- [ ] D-P8 Delivery SLA, pickup address, packaging
- [ ] D-P9 Consult-fee GST treatment
- [ ] D-P14 GST on plan orders (single line vs split)
- [ ] Razorpay test keys · [ ] Supabase projects · [ ] Vercel team · [ ] Domain DNS access
- [ ] Dr. Tyagi photos, bio, registration no., signature · [ ] Product data & photos · [ ] Logo SVGs

## Decisions taken during build
<!-- link to docs/15 entries -->

## Sign-offs
| Item | By | Date |
|---|---|---|
| UAT — Dr. Tyagi | | |
| UAT — Sales | | |
| UAT — Ops | | |
| UAT — Admin | | |
| Compliance checklist | | |
| Go-live | | |
