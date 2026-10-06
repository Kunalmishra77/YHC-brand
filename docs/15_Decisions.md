# 15 · Decisions Log (ADRs + pending client decisions)

## Decided (architecture)

| ID | Decision | Why | Alternatives considered |
|---|---|---|---|
| ADR-1 | One Next.js app with route groups for site, account, doctor, sales, admin | Shared types/auth/domain logic; one deploy; small team | Separate apps per portal (more overhead) |
| ADR-2 | Supabase (Postgres + Auth + Storage + Realtime), Mumbai | Team experience, RLS, realtime for sales alerts, India data residency | Custom Node API + RDS (more build) |
| ADR-3 | No ORM; SQL migrations + generated types | RLS-first design, SQL functions for concurrency | Prisma/Drizzle (weaker fit with RLS) |
| ADR-4 | Booking concurrency in Postgres (exclusion constraint + `hold_slot`) | Correct under race conditions without app locks | Redis locks (extra failure mode) |
| ADR-5 | Outbox (`domain_events`) + DB job queue drained by `/api/cron/jobs` via pg_cron | Host-independent, idempotent, observable | Inngest/Trigger.dev (another vendor); Vercel Cron only |
| ADR-6 | Adapters for all providers | Swap BSP/courier/video without rewrites | Direct calls |
| ADR-7 | WhatsApp: `generic-http` adapter for YHC's existing system, `meta-cloud` as alternative | Brief says an automation system already exists | Build only for Meta Cloud API |
| ADR-8 | Video: LiveKit in-portal, Google Meet fallback | Keeps patient on-platform; doctor sees notes alongside; team knows LiveKit | Meet-only (simpler, less control) |
| ADR-9 | Customers log in by phone OTP only; staff by email + TOTP | Lowest friction for customers; strong auth for clinical data | Passwords for customers |
| ADR-10 | Slot first, then OTP, then 3-field form, pay, then detailed intake | Conversion (approved in deck) | Long form first |
| ADR-11 | `/r/{token}` plan page with Razorpay Checkout (not a bare payment link) | Shows plan, credit, duration choice, address prefill in one place | Payment Links only |
| ADR-12 | Guarantee refunds via Razorpay refunds; bank payout when outside refund window | Payments older than the refund window can't be refunded online | Store credit (not a real money-back) |
| ADR-13 | Prepaid only at launch | Lower RTO risk for high-value treatment orders | COD |
| ADR-14 | Recommendation token page viewable and payable without OTP (unguessable 36-char token, 72 h expiry, first name + plan). Saved address is shown only when the device already has the customer's session; otherwise the customer types an address or verifies OTP to use the saved one | One-tap purchase from WhatsApp without leaking an address if a link is forwarded | Require OTP always (safer, more friction) |
| ADR-15 | Prices include GST; money as integer paise | Consumer clarity; no float errors | |
| ADR-16 | Payment capture in one SQL function (`capture_payment` → `confirm_appointment_payment` / `mark_order_paid`); all external side effects in outbox event handlers | Several webhooks + verify + reconciliation can race for one payment; PostgREST can't hold row locks; nothing lost if the process dies after commit | TypeScript select-then-update (races) |
| ADR-17 | MFA enforced in the database (`aal2` required for doctor/admin in `has_role`/`current_doctor_id`) | A stolen password alone must not expose clinical data via the public API | Middleware-only check |
| ADR-18 | Sales see recommendations/order items only through `v_sales_*` projections (no dosage, instructions, notes) | Golden rule 2: no clinical content for sales | Column grants (harder to maintain) |
| ADR-19 | Free assessment answers stored in `assessments` (clinical RLS), not on leads | Health data must not be sales-visible | |
| ADR-20 | "Book on behalf" uses a signed pay page with consents + age check, not a bare payment link; hold length `consult.sales_hold_minutes` | Explicit telemedicine consent when staff initiate; avoid slot loss | Razorpay Payment Link (no consent capture) |
| ADR-21 | Guarantee enrollment is created at delivery of the first guarantee-eligible plan order | Clock starts at delivery; avoids enrollments for undelivered/refunded orders | Enroll at payment |
| ADR-22 | Local development uses a hosted Supabase project `yhc-dev` (Mumbai) instead of `supabase start`; scripts use `--linked`. CI keeps `supabase start` on GitHub runners | Docker is not usable on the developer machine (2026-10-02) | Local Docker; native Postgres install |
| ADR-24 | Tailwind names `muted` and `accent` follow shadcn/ui semantics (mist fills); muted text = `text-muted-foreground`, brand steel-blue = `brand` (`text-brand`, focus ring). All other docs/07 §4 names unchanged | docs/07 §4 maps `--color-muted`/`--color-accent` to text colours, which breaks every shadcn component that uses `bg-muted`/`bg-accent` | Rename shadcn variables (fork every component) |
| ADR-29 | Live demo on Vercel: the in-memory demo store is mirrored to one Supabase row (`public.demo_state`, migration 20261006000001, service-role only) — loaded at the start of each request if newer, written after the response if changed. Hosted Supabase `pysdkatjadlgshtnqkou` (Mumbai) has the full schema + seed applied. Demo-only: removed when Phase 01+ moves surfaces to real tables | Serverless instances do not share memory, so journey/booking state was lost between steps on Vercel | Vercel Blob (new dependency), single-server host |
| ADR-26 | Patient journey reordered (client brief 2026-10-05): Basic details (name, mobile, address) → guided 3D scalp scan → personalised assessment (suitable / doctor review / not suitable, with reasons) → detailed form → doctor slot booking (+ ₹500) → patient portal → consultation. Supersedes ADR-10 (slot first). Demo scan = guided phone-camera capture with a *simulated* root analysis, labelled "demo — final assessment by the doctor"; real scan engine/device to be chosen | Trust- and science-led positioning; avoid treating people with no viable roots | Keep slot-first booking |
| ADR-27 | Site positioning is trust/science-first, not e-commerce: video hero with glass start form, science, doctor-recommended, guarantee, consented before/after. "Patented" and "doctor-developed" claims and before/after photos render only from client-supplied, verified data (patent no.; written photo consent); until then clearly labelled slots. No stock or AI images are ever presented as patient results | ASCI / Drugs & Magic Remedies Act / CCPA: unverified efficacy or patent claims are unlawful | Publish claims now (rejected) |
| ADR-28 | No WordPress. The whole product (site + journey + portals) stays one Next.js app (ADR-1); hosting to be decided (Vercel or Node host) | Client decision 2026-10-05 | WordPress theme / static export |
| ADR-25 | Until real photography arrives, the site uses AI-generated *concept* product still-lifes (unlabelled packaging, no people, no doctor likeness, never results) in `public/images/concept/`, each labelled "Concept image" where shown large. Homepage hero is a product still-life with headline + live next-slot, not a doctor portrait placeholder; the doctor section uses a credential card (name, qualifications, reg. no.) instead of a silhouette | Client feedback 2026-10-02: grey placeholders and the doctor silhouette in the hero looked cheap; FR-M1-2 hero intent (doctor-led promise, Book ₹500 + assessment) is kept, with the doctor's credentials in the hero facts rail | Keep placeholders until shoot (looks unfinished) |
| ADR-23 | Client demo first: after Phase 00 foundation, build a clickable UI prototype of all surfaces (site, booking, account, doctor, sales, admin) on an in-memory demo data layer (`src/server/demo/`), enabled only when `DEMO_MODE=true`, with a role switcher instead of real auth. Real Supabase/auth/integrations replace the demo layer phase by phase (01 → 12) | Client wants to see the full product before integrations (Meta, Razorpay, WhatsApp, etc.) are wired | Follow phases 01→12 strictly (no demo for weeks) |

## Pending — client decisions (with our recommendation)

| ID | Question | Our recommendation | Status |
|---|---|---|---|
| D-P1 | Guarantee terms: refund %, minimum months, conditions, claim window | 100% of plan payments; 3 months minimum continuous plan; ≥ 75% check-in replies; monthly photos; 1 follow-up consult; claim within 30 days after plan end | Open |
| D-P2 | Regulatory category + licence per product | Provide per SKU before Phase 03 | Open |
| D-P3 | Credit ₹500 against first plan within 7 days | Yes | Open |
| D-P4 | Consult cancellation/reschedule/refund | Free reschedule until 6 h before; cancel > 24 h → full refund; later → no refund but one free reschedule; no-show → no refund | Open |
| D-P5 | Follow-up consult fee | Free for customers with an active plan; ₹500 otherwise | Open |
| D-P6 | Reorder validity without new consult | 6 months from last consult | Open |
| D-P7 | WhatsApp provider/number in use | — (need name + API docs) | Open |
| D-P8 | Delivery SLA, pickup address, packaging | — | Open |
| D-P9 | Consult-fee GST treatment | CA to confirm | Open |
| D-P10 | Products buyable without consult (care products)? | Yes for non-prescription care products only | Open |
| D-P11 | Show Dr. Tyagi's association with YHC on recommendation page | Yes (disclosure) | Open |
| D-P12 | Sales team round-robin pool and working hours | — | Open |
| D-P13 | Email sender address | care@yourhaircompany.com | Open |
| D-P14 | GST on plan orders: single plan line (one HSN) or split across products | Split proportionally to product list prices, HSN per product — CA to confirm | Open |

## Proposed changes (change control)
_Add new requests here: date · requester · description · impact · MVP or Phase 2 · decision._

- 2026-10-02 · project owner · Build a demo prototype (UI for all surfaces, mock data) before external integrations · Phase order: 00 → demo (UI from phases 02–11 on mock data) → 01 and integration work; no scope added, Sentry deferred to integration work · MVP · **Accepted** (ADR-23)
- 2026-10-02 · project owner · Docker not usable locally → hosted `yhc-dev` Supabase project · Local `db:*` scripts target the linked project · MVP · **Accepted** (ADR-22)
