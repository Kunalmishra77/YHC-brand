# Phase 06 · Recommendation & one-tap purchase

**Goal:** "Recommend & create order" in the workspace sends the patient a personal plan link on WhatsApp; the patient pays in ≤ 5 taps with the ₹500 credit applied once.
**Depends on:** Phase 05 (+ Phase 03 payments). **Inputs:** D-P3 (credit), D-P11 (disclosure).
**FRs:** M6-1…M6-6.
**Time:** 4–5 days.

## Tasks
- [ ] **6.1 Plan.** Read PRD M6, TRD §6.4, `docs/03` §3, ADR-11/14. Wait for OK.
- [ ] **6.2 Recommendation builder** (Outcome pane): pick protocol template or products; per-item dosage/instructions/qty; plan duration (1/2/3, template default; 3 months highlighted as doctor-recommended); patient note; live price preview (plan price, credit if eligible, total). Button **Recommend & create order**.
- [ ] **6.3 `createRecommendation` action**: validate (consultation completed or completing in the same action), compute pricing (`server/recommendations/pricing.ts`), insert recommendation `sent` with `expires_at = now + link_ttl_hours`, emit `recommendation.sent`, schedule `recommendation.nudge` (+24 h), `recommendation.task` (+48 h), `recommendation.expire` (+72 h) with dedupe `rec:{id}:*`, enqueue `plan_ready` WhatsApp + `plan_ready_email`. Cancel/reissue actions.
- [ ] **6.4 `/r/[token]` page** (no login needed, ADR-14): greeting with first name, Dr. Tyagi's note, products with dosage, duration selector (doctor's choice preselected), price breakdown (plan, ₹500 credit line, total), guarantee summary (from active policy; hidden if flag off), disclosure line (D-P11), address (prefilled **only** if this device already has the customer's session; otherwise typed, or "Verify your number to use your saved address" via OTP — ADR-14), consents (terms/refund/guarantee terms version), **Pay securely**. States: expired (CTA "Ask for a new link" → task), paid (thank-you + tracking link), cancelled.
- [ ] **6.5 `POST /api/recommendations/{token}/pay`**: re-price server-side, **create or reuse** the recommendation's open `pending_payment` order (unique index; retries never reserve the credit twice), reserve credit, (source `recommendation`, `supply_days = months × 30`, `guarantee_eligible = plan.guarantee_eligible && settings.guarantee.enabled`) with items from recommendation, Razorpay order; on `order.paid` (processor): consume credit, recommendation `paid` + `order_id`, cancel `rec:{id}:*` jobs, emit events. The `order.expire` job (Phase 03) cancels it after 24 h unpaid and releases the credit.
- [ ] **6.6 Doctor visibility**: workspace shows recommendation status (sent / opened — from `recommendations.opened_at`, set on first GET / paid / expired) with timestamps; Today KPI "plans sent" and "plans paid".
- [ ] **6.7 Tests**: pricing unit tests (credit eligible / expired / already used / disabled), retry (two pay attempts → same order reused, one credit reservation), order expiry releases credit, token states, job scheduling + cancellation on pay, E2E: doctor recommends → open `/r/token` on mobile → pay (test) → paid state.

## Acceptance criteria
1. From click to WhatsApp queued ≤ 5 s; customer completes payment in ≤ 5 taps.
2. Credit applied exactly once and only within its window.
3. Paying cancels the nudge/task/expiry jobs; expiry blocks payment with a clear message.

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_06_Recommendation_Purchase.md, PRD module M6 and TRD §6.4.
Plan first, wait for OK, then build task by task with tests.
```
