# 04 · Database Schema Guide

Source of truth: `supabase/migrations/20261002000001_init_schema.sql` (+ `..._storage_and_cron.sql`, `seed.sql`).
The migration was **executed and behaviour-tested on Postgres 16** with a stub `auth`/`storage` schema (`supabase/tests/manual/`), and re-tested after an independent security review. Verified: slot overlap blocked; expired holds release slots; `capture_payment` is idempotent (replays → `already_captured`, one `appointment.booked` event), late payment → `slot_lost`, amount mismatch flagged without capture; `mark_order_paid` consumes the reserved consult credit once; reorder `plan_end_on` continues from the parent plan; lead stages (forward-only, retention loop, lost re-open, manual-stage guard, `set_lead_stage_manual`); job claiming; order total check; RLS for customer/sales/doctor/anon; **doctor without MFA (aal1) sees nothing**; role escalation, customer hijack by sales, phone change and self-reactivation all blocked; anon cannot call server functions; seed is re-runnable.

## 1. Entity map

```
auth.users 1─1 profiles (role) 1─0..1 customers 1─* addresses
                         └─0..1 doctors 1─1 doctor_integrations (secrets)
                                     ├─* availability_rules / availability_exceptions / calendar_busy_blocks
customers 1─* appointments *─1 doctors
appointments 1─0..1 intake_forms · 1─* media · 1─0..1 consultations · 1─* payments(consultation)
consultations 1─* prescriptions · 1─* recommendations ─1 plans
recommendations 0..1─1 orders 1─* order_items · 1─* payments(order) · 1─* shipments
payments 1─* refunds *─0..1 guarantee_claims
customers 1─1 leads 1─* lead_activities · leads 1─* tasks
customers 1─* messages *─0..1 message_templates
orders 1─* care_checkins · customers 1─* consult_credits
guarantee_policies 1─* guarantee_enrollments (1 per first plan order) 1─* guarantee_claims
customers 1─* consents · 1─* data_requests
domain_events (outbox) · scheduled_jobs (queue) · webhook_events (idempotency) · audit_logs · settings
content: concerns · posts · faqs · reviews (consent required to approve)
```

## 2. Tables by module

| Module | Tables |
|---|---|
| Identity | `profiles`, `customers`, `addresses` |
| Doctor & calendar | `doctors`, `doctor_integrations`, `availability_rules`, `availability_exceptions`, `calendar_busy_blocks` |
| Booking & clinical | `appointments`, `intake_forms`, `media`, `consultations`, `prescriptions`, `assessments` (free assessment answers) |
| Catalog | `products`, `plans`, `protocol_templates` |
| Commerce | `orders`, `order_items`, `recommendations`, `consult_credits`, `payments`, `refunds`, `shipments` |
| CRM | `leads`, `lead_activities`, `tasks` |
| Messaging | `message_templates`, `messages` |
| Care | `care_checkins` |
| Guarantee | `guarantee_policies`, `guarantee_enrollments`, `guarantee_claims` |
| Content | `concerns`, `posts`, `faqs`, `reviews` |
| Platform | `domain_events`, `scheduled_jobs`, `webhook_events`, `audit_logs`, `settings`, `consents`, `data_requests` |
| Views | `v_lead_funnel`, `v_daily_kpis` (security_invoker); `v_sales_recommendations`, `v_sales_order_items` (sales-safe projections without dosage/notes) |

## 3. SQL functions (server-only unless noted)

| Function | Purpose | Called from |
|---|---|---|
| `hold_slot(doctor, customer, starts_at, kind, source, hold_minutes, fee)` | Atomic 10-min hold; raises `SLOT_TAKEN` | `POST /api/booking/hold`, sales "book on behalf" |
| `capture_payment(provider_order_id, payment_link_id, payment_id, amount, method, raw)` | **Single idempotent entry for captured payments**: lock + compare-and-set, amount check, then `confirm_appointment_payment` or `mark_order_paid`, all in one transaction. Returns jsonb `{ result, payment_id, purpose, appointment_id, order_id, newly_captured }` | `processCapturedPayment()` (webhooks, verify, reconcile) |
| `confirm_appointment_payment(appointment_id)` | Returns `booked` / `already_booked` / `rebooked_after_expiry` / `slot_lost`; emits `appointment.booked` / `appointment.slot_lost`. Also called directly for ₹0 follow-ups | `capture_payment`, free follow-up booking |
| `mark_order_paid(order_id)` | `paid` / `already_paid` / `invalid_state:x`; consumes reserved credit, marks recommendation paid, emits `order.paid` | `capture_payment` |
| `set_lead_stage_manual(lead_id, stage, reason)` | Manual stage moves under `lead_manual_stage_allowed` rules (+ activity; lost needs a reason) | sales server actions |
| Guard triggers `guard_profile_role`, `guard_customer_columns`, `guard_lead_stage` | Column rules RLS can't express | automatic |
| `expire_stale_holds()` | Housekeeping | job runner |
| `advance_lead_stage(customer, stage, reason)` | Forward-only stage rules + activity row | event handlers |
| `claim_jobs(limit)` / `cancel_jobs(prefix)` | Queue with `FOR UPDATE SKIP LOCKED`, stuck-job recovery | job runner |
| `mark_order_delivered(order, at)` | Sets `plan_end_on` (IST) and emits `order.delivered` | Shiprocket webhook |
| `emit_event(type, entity, id, payload)` | Writes outbox row | functions + server code |
| `has_role`, `is_staff`, `current_customer_id`, `current_doctor_id`, `current_app_role`, `jwt_aal` | RLS helpers; **doctor/admin rights require `aal2` (MFA)**; `current_customer_id` requires role customer | policies |

## 4. RLS matrix (summary — matches the migration)

Doctor and admin columns apply only to MFA (aal2) sessions; with aal1 they see nothing beyond public data.

| Data | Customer | Doctor | Sales | Ops | Admin | Anon |
|---|---|---|---|---|---|---|
| Own customer row | R (W non-identity fields) | R | R/W (non-identity fields) | R | all | – |
| Addresses | own R/W | – | R | R | all | – |
| Appointments | own R | own R | R | R | all | – |
| Intake | own R, insert, update until consult starts | R (own patients) | **none** | none | all | – |
| Media, assessments | own R | R | **none** | none | all | – |
| Consultations | – (server returns a summary without private notes) | own R/W | none | none | all | – |
| Prescriptions | own R | own R/W | none | none | all | – |
| Products, plans, published content, active guarantee policy, public settings | R | R | R | R | all | R |
| Orders, payments | own R | R | R | R | all | – |
| Order items | own R | R | via `v_sales_order_items` (no dosage) | R | all | – |
| Recommendations | own R (not draft) | own R/W | via `v_sales_recommendations` | – | all | – |
| Leads, activities | – | **none** | R/W (stage moves guarded) | – | all | – |
| Tasks | – | assigned | R/W/insert | R/W/insert | all | – |
| Messages | – | – | R | – | all | – |
| Care check-ins | – | R | R/W | – | all | – |
| Guarantee claims | own R | R/W | R | R | all | – |
| Settings | public ones | R | R | R | all | public ones |
| `doctor_integrations`, `webhook_events` | – | – | – | – | – (service role only) | – |

No browser UPDATE exists on appointments, orders or shipments. Writes involving money, bookings, stages, messages or jobs are done by **server code with the service role** after validation and authorization; RLS + guard triggers are the safety net.

## 5. Conventions
- `*_paise int` for money; `timestamptz` UTC; `date` columns are IST calendar dates (`plan_end_on`).
- `updated_at` maintained by trigger on mutable tables.
- Human codes: `appointments.code` (`YHC-A-1001…`), `orders.code` (`YHC-10001…`); invoice numbers assigned at payment (`YHC/{FY}/{seq}`, implement with a per-FY sequence in Phase 03).
- New tables: enable RLS, add policies, add to the admin loop, document here, add a behaviour check.

## 6. Migrations workflow
```
supabase start                     # local stack (Docker)
supabase db reset                  # apply migrations + seed.sql
pnpm db:types                      # regenerate src/lib/database.types.ts
supabase migration new <name>      # new change → write SQL → db reset → test
supabase db push                   # CI applies to staging/prod (never edit applied migrations)
```

## 7. Tables to add in later phases (planned)
- `invoice_sequences (fy text pk, last_no int)` — Phase 03.
- `subscriptions`, `subscription_events` — Phase 2 (UPI AutoPay).
- `coupons`, `coupon_redemptions` — Phase 2.
