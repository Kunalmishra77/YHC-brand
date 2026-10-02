# Phase 10 · Customer account & money-back guarantee

**Goal:** customers have one place for their plan, orders, prescriptions, progress and support; the money-back guarantee is tracked automatically and claims are decided fairly by Dr. Tyagi with refunds processed through Razorpay.
**Depends on:** Phase 09. **Inputs:** **D-P1 guarantee terms** (build with the draft policy if not final; keep `guarantee.enabled=false`), counsel-reviewed guarantee text.
**FRs:** M4-1…M4-8, M11-1…M11-6, M5-11, M14-5.
**Time:** ~1 week.

## Tasks
- [ ] **10.1 Plan.** Read PRD M4 and M11, TRD §6.6, `docs/03` §5, ADR-12. Wait for OK.
- [ ] **10.2 Account dashboard** `/account`: plan card ("Day X of Y", plan end date, products & dosage), next-step card (logic: intake pending → join consult → plan ready → upload photos → reorder → follow-up due), quick links.
- [ ] **10.3 Sections**: Consultations (upcoming: join/reschedule; past: patient-facing summary = treatment plan + follow-up instructions via a server function that never selects `private_notes`; prescriptions PDF), Orders (status, tracking, invoice, reorder), Progress (3-angle monthly sets, side-by-side timeline, upload), Profile & addresses, Consents (view, withdraw marketing/photo-marketing), Data requests (access/correction/erasure/grievance with status), Support (WhatsApp deep link + contact form).
- [ ] **10.4 Guarantee policy surface**: single `GuaranteeTerms` source (active policy) reused on plans, `/r/[token]`, checkout, legal page; consent `guarantee_terms` with policy version at first plan purchase.
- [ ] **10.5 Enrollment**: in the `order.delivered` handler, for the customer's first guarantee-eligible plan order → `guarantee_enrollments` (`started_on` = delivery date); emit `guarantee.enrolled` (ADR-21).
- [ ] **10.6 Eligibility engine** `server/guarantee/eligibility.ts` (pure, TRD §6.6) + exhaustive table tests (each rule pass/fail, gaps between orders, partial months, window boundaries, flag off).
- [ ] **10.7 Account › Guarantee**: status card with each rule ✓/✗ in plain words and what to do next ("Upload this month's photos to stay eligible"); **Claim** button only when eligible; claim form (statement + optional final photos); claim status timeline.
- [ ] **10.8 Doctor review** `/doctor/guarantee`: queue (submitted/under review), claim view (eligibility snapshot, adherence data, photo comparison first vs latest), approve/reject with notes (audited) → messages.
- [ ] **10.9 Refunds**: approved claim → admin/ops "Process refund" (amount = refund_percent × plan payments in coverage; per-payment Razorpay refunds; if a payment is older than the refund window → record `refunds.method='bank_transfer'` + `payout_reference`, then mark the claim refunded) → `refund.processed` webhooks → claim `refunded`, enrollment `claimed`, orders `refunded/partially_refunded`.
- [ ] **10.10 Data requests**: admin queue with SLA timer; erasure = anonymise customer PII + delete marketing data, keep medical/financial records per retention rule (documented).
- [ ] **10.11 Tests**: eligibility tables, claim lifecycle, refund amount math, RLS (customer sees own claims; sales read-only), private-notes never returned to customer (integration test on the server function).

## Acceptance criteria
1. A seeded customer journey (3 months, check-ins, photos, follow-up) shows "eligible"; removing one month of photos shows the exact failing rule.
2. Approve → refund(s) created once; webhook marks claim refunded; customer notified at each step.
3. With `guarantee.enabled=false`, no guarantee UI, consent or enrollment appears anywhere.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_10_Account_Guarantee.md, PRD modules M4 and M11, TRD §6.6 and docs/03 §5.
Plan first, wait for OK, then build task by task with tests. Keep guarantee.enabled false.
```
