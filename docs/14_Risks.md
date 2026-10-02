# 14 · Risk Register

Likelihood/Impact: H/M/L. Review weekly.

| ID | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | Guarantee terms not finalised → can't advertise or launch guarantee | M | H | Build as data with feature flag; draft terms from us in week 2; counsel review early | PO + client |
| R-02 | WhatsApp template approval delays block booking messages | M | H | Submit all utility templates in week 1; SMS + email fallback built in | Client svc |
| R-03 | DLT registration delays SMS OTP | M | M | Start immediately; WhatsApp OTP primary | Client ops |
| R-04 | Razorpay KYC/category review delays live payments | M | H | Apply in week 1 with doctor registration + product licences | Client ops |
| R-05 | Regulatory category of a product makes online sale or claims restricted | M | H | Category per SKU before listing; counsel review; pharmacy-partner option | Client + counsel |
| R-06 | Doctor-owned brand recommendation raises professional-conduct questions | M | M | Disclosure, patient choice, prescription regardless; counsel opinion | Client + counsel |
| R-07 | WhatsApp policy on health products restricts messaging | L | H | Links-only commerce; no catalogues; policy review; SMS/email fallback | Tech lead |
| R-08 | Double bookings / payment-confirmation errors | L | H | DB exclusion constraint, server-side confirmation, idempotency, reconciliation, tests | Tech lead |
| R-09 | Clinical data leak to sales or public | L | H | RLS matrix + tests, signed URLs, audit logs, no clinical data in Calendar/WhatsApp text | Tech lead |
| R-10 | Video quality on low bandwidth | M | M | LiveKit adaptive stream, audio fallback, "switch to phone" | Dev |
| R-11 | Single doctor capacity limits growth | H | M | Utilisation KPI, max/day setting, data model ready for more doctors (P2) | PO + client |
| R-12 | Guarantee refunds exceed Razorpay refund window | M | M | Bank payout path; confirm window; track in claims | Ops |
| R-13 | Content delays (photos, products, bios) delay site | H | M | Placeholders with `TODO(client)`; asset tracker; weekly review | Client svc |
| R-14 | Scope creep into Phase 2 features | M | M | Change control in docs/15 | PO |
| R-15 | Google OAuth "testing" mode expires tokens after 7 days | M | M | Internal Workspace app or published app before launch | Tech lead |
| R-16 | AI-generated code quality/security issues | M | H | Plan-first workflow, human review of every PR, tests, lint rules, security checklist | Tech lead |
| R-17 | Misleading-claim complaints (ASCI/CCPA) | M | H | Banned-words lint, doctor review, consented reviews only | PO + client |
| R-18 | Shipping RTO/NDR on prepaid orders | M | M | Address validation, pincode serviceability check, ops exception queue | Ops |
