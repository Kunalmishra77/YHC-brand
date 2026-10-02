# 10 · Testing & QA Plan

## 1. Test pyramid

| Level | Tool | What | Gate |
|---|---|---|---|
| Unit | Vitest | Pure domain logic: availability, pricing/credit, stage map, refill dates, guarantee eligibility, signed links, money/time utils, webhook signature verify, template rendering | CI on every PR; ≥ 90% coverage on `src/server/**/(availability|pricing|eligibility|stage-map|refill|signed-links)` |
| SQL behaviour | psql scripts (`supabase/tests/manual`) → pgTAP later | Holds, confirmations, stage rules, jobs, RLS matrix | Run after every migration change |
| Integration | Vitest + local Supabase + MSW (provider mocks) | Route handlers & server actions end to end against a real DB: booking hold → webhook → booked; order paid → shipment job; idempotent replays | CI (Supabase CLI in GitHub Actions) |
| E2E | Playwright (mobile Chrome + desktop) | Critical journeys below on staging with Razorpay **test mode** | Before each release |
| Visual/accessibility | Playwright screenshots + axe | Key pages and portal screens | Before release |
| Performance | Lighthouse CI | Home, Product, Book (mobile) | PR on site changes |
| UAT | Scripts §4 | Dr. Tyagi, sales, ops, admin | Phase 12 sign-off |

## 2. Critical test cases (must pass before launch)

### Booking & payments
1. Slots respect rules, breaks, holidays, busy blocks, min notice, max/day, booking window (table-driven unit tests).
2. Two parallel holds on one slot → one succeeds, other `409 SLOT_TAKEN`.
3. Hold expires after 10 min → slot visible again.
4. Payment captured within hold → booked; webhook replayed ×5 → one booking, one message, one CRM toast.
5. Webhook with bad signature → 401, nothing changes, logged.
6. Payment captured after expiry, slot free → `rebooked_after_expiry`; slot taken → `slot_lost` → rebook flow uses same payment.
7. Verify endpoint used without webhook (webhook delayed) → booked via server fetch; later webhook → no duplicate.
8. Reconciliation finds a captured payment whose webhook never arrived → books it.
9. Under-18 age → blocked with message.
10. Amount tampering (client sends other amount) → server ignores client amount.

### Doctor & recommendation
11. Cannot complete consult without identity + consent ticks.
12. Prescription PDF contains registration no., patient details, items; stored privately; patient can download, sales cannot.
13. Recommend & create order → WhatsApp sent, `/r/{token}` shows correct plan, ₹500 credit applied once; second order cannot reuse credit; credit expires after 7 days.
14. Link expiry at 72 h; nudge at 24 h; sales task at 48 h.

### CRM
15. Stage moves automatically through the full journey; manual move back from `payment_successful` to `contacted` is impossible via UI and SQL.
16. Sales user cannot query `intake_forms`, `media`, `consultations`, `prescriptions` (RLS test with sales JWT).
17. Meta lead webhook creates lead, dedupes by phone, assigns round-robin.

### Fulfilment, care, refill, guarantee
18. Order paid → Shiprocket order created once (idempotent job).
19. Delivered webhook → `plan_end_on` correct (IST date) → check-in and refill jobs scheduled with dedupe keys.
20. Reorder paid → parent refill jobs cancelled; stage reordered → followup_active.
21. "Facing an issue" reply → urgent task + doctor notification within 1 min.
22. Guarantee eligibility table tests: each rule pass/fail; claim outside window rejected; refund amount = % × plan payments.
23. Guarantee feature flag off → no guarantee UI, no enrollments.

### Security & privacy
24. Role escalation via profile update blocked.
25. Staff routes require MFA (aal2) for doctor/admin.
26. Signed link tampering → 400; expired → friendly message.
27. Rate limits on OTP and booking endpoints.
28. Clinical view writes an audit log row.
29. Data erasure request anonymises customer while keeping medical records per retention rule.
30. Doctor/admin session without MFA (aal1) reads **zero** clinical/admin rows via PostgREST (not just redirected by middleware).
31. Sales user cannot change `customers.profile_id/phone/opt-ins`, cannot set system stages, cannot read recommendation dosage (base table) — only `v_sales_*` views.
32. Deactivated staff cannot reactivate themselves; a deactivated user's sessions are revoked.
33. Concurrent `payment.captured` + `order.paid` + verify + reconcile for one payment → one capture, one `order.paid`/`appointment.booked` event, one set of side effects.
34. "Pay" retried on `/r/{token}` → same pending order reused; credit reserved once; unpaid order expires at 24 h and releases the credit.
35. Reorder delivered before the current plan ends → new `plan_end_on` continues from the old end date.
36. ₹0 follow-up books without Razorpay and only for eligible customers.
37. Intake cannot be edited after the consultation starts.

## 3. Test data & environments
- `pnpm seed:dev` creates: 1 doctor (Dr. Tyagi test account), 2 sales, 1 ops, 1 admin, 5 customers, availability rules Mon–Sat 10:00–13:00 & 16:00–19:00 IST, 4 products, 3 plans, 2 protocol templates.
- Razorpay test mode cards/UPI; WhatsApp sandbox/test number or `WHATSAPP_PROVIDER=log` (logs messages to console + DB); Shiprocket staging or mock.
- Never use real patient data outside production.

## 4. UAT scripts (Phase 12)

**Dr. Tyagi (45 min):** set availability + a holiday → see slots change on site → take a test booking → open Today → start consult (video with a colleague) → write notes → issue prescription → Recommend & create order → confirm patient receives WhatsApp → review a sample guarantee claim.

**Sales (30 min):** receive a Meta test lead → contact (log call) → send consult link → watch "₹500 PAID" toast → see stage auto-move → handle an unpaid-plan task → handle a "Facing an issue" care task.

**Ops (20 min):** see paid order → Shiprocket order + AWB → simulate delivery → verify plan end date and refill schedule → issue a partial refund.

**Admin (30 min):** invite a staff user → edit plan price (audited) → edit a template → activate a draft guarantee policy in staging → view KPI dashboard → export orders CSV.

**Customer (mobile, 20 min):** book, pay, intake + photos, join consult, pay plan from WhatsApp link, track order, upload progress photos, reorder.

## 5. Bug severity & release gate
- S1 (money, booking, data leak) — fix before release, no exceptions.
- S2 (feature broken, workaround exists) — fix before launch unless signed off.
- S3/S4 — backlog.
Release gate: all §2 cases green, zero open S1/S2, Lighthouse targets met, UAT sign-offs recorded in `PROGRESS.md`.
