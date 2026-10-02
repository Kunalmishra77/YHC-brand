# Phase 2 · Backlog (after 60–90 days of live data)

Do not build these during MVP. Prioritise with real numbers (reorder rate, AutoPay demand, doctor utilisation).

| ID | Item | Notes / prerequisites |
|---|---|---|
| P2-1 | **UPI AutoPay / card subscriptions** | Razorpay Subscriptions; plans ≤ ₹15,000 per cycle need no AFA after mandate; pre-debit notice ≥ 24 h; pause/skip/cancel in 2 taps; new tables `subscriptions`, `subscription_events`; CRM stage loop via `subscription.charged` |
| P2-2 | AI-assisted progress photo comparison | Doctor-facing only; standardised angles from MVP make this possible; consent for clinical photo use already captured |
| P2-3 | Loyalty & referrals, personalised offers, coupons | Marketing consent; utility templates stay offer-free |
| P2-4 | Hindi UI + templates | i18n dictionary from Phase 02; Meta template translations |
| P2-5 | Multiple doctors | Data model ready (`doctor_id` everywhere); add doctor selection, routing, payouts |
| P2-6 | Mobile app | Routine reminders, progress photos, push |
| P2-7 | Home lab test partners | Root-cause checks; results into patient file |
| P2-8 | WhatsApp AI assistant | Routine questions only, escalation to care team; no medical advice |
| P2-9 | Marketplaces / quick commerce for care products | Only non-prescription items |
| P2-10 | Campaign landing page builder | For Meta ads A/B tests |

## Paste-ready prompt (when the time comes)
```
Read CLAUDE.md, PROGRESS.md and phases/PHASE_P2_Backlog.md. Propose a PRD addendum for item P2-<n>
(requirements, schema changes, risks, test plan) before writing any code.
```
