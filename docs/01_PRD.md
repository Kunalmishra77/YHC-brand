# 01 · Product Requirements Document (PRD)

**Product:** Your Hair Company — e-commerce + doctor consultation + retention platform
**Owner:** Endorphins / AI Agentix product team · **Client approver:** Dr. Tyagi
**Version:** 1.0 (post-approval) · **Status:** Ready for build
**Source of truth for scope.** Anything not here is out of scope until added via `docs/15_Decisions.md`.

Priority key: **M** = Must (MVP) · **S** = Should (MVP if time allows, else first patch) · **P2** = Phase 2.
Each requirement has an ID (`FR-<module>-<n>`). Code, tests and commits reference these IDs.

---

## 1. Goals and success measures

| Goal | Measure (defined in §17) | Target |
|---|---|---|
| Convert leads into paid consultations | Lead → paid consult rate | `[set after 30 days]` |
| Convert consultations into plans | Consult-to-plan rate (7 days) | `[set after 30 days]` |
| Keep customers on the full course | Reorder rate; 90-day retention | `[set after 60 days]` |
| Remove manual payment checking | % bookings confirmed without staff action | ≥ 99% |
| Fast lead response | Median first-contact time | ≤ `sales.first_contact_sla_minutes` (15) |
| Fair, fast guarantee | Claim decision time | ≤ 5 working days |

Non-goals for MVP: marketplace selling (Amazon), mobile apps, multiple doctors in the UI (data model supports it), UPI AutoPay subscriptions, AI photo analysis, loyalty, Hindi UI.

## 2. Users and personas

| Persona | Needs | Main surface |
|---|---|---|
| **Customer** (18+, hair thinning / hairline / hair fall; ~70% likely non-metro, mostly on mobile) | Trust, clear price, quick booking, a plan made for them, easy reorder, confidence the guarantee is real | Website, WhatsApp, `/account` |
| **Dr. Tyagi** | Prepared patients, a fast workspace, recommend in one click, no admin chores | `/doctor` |
| **Sales executive** | New leads instantly, knows who paid without asking, clear next action | `/sales` |
| **Care executive** (sales role, care view) | Check-in replies, side-effect flags, refill calls | `/sales/care` |
| **Ops** | Orders to ship, delivery issues, refunds | `/admin/orders` |
| **Management / admin** | Funnel, revenue, team performance, control of prices, templates and terms | `/admin` |

## 3. Scope summary

MVP = M1–M14 below. Phase 2 = §16.

---

## M1 · Marketing website & content

| ID | Requirement | Pri |
|---|---|---|
| FR-M1-1 | Pages: Home, About YHC, Meet Dr. Tyagi, Hair concerns (index + detail), Products (index + detail), Treatment plans, How it works, Book consultation, Free hair assessment, Real stories, Blog (index + post), FAQs, Contact, Legal (Privacy, Terms, Refund & Cancellation, Shipping, Guarantee terms, Medical disclaimer, Grievance officer). | M |
| FR-M1-2 | Homepage sections in order: Hero (doctor photo, promise, **Book consultation · ₹500** + Free assessment) → Trust strip (Dr. Tyagi's registration no., secure payment, delivery) → Hair concerns → How it works (Book → Consult → Plan → Delivered → Follow-up) → Meet Dr. Tyagi → Treatment plans with per-month price → **Money-back guarantee** block → Ingredients & science → Real stories → FAQs → Final CTA + footer. | M |
| FR-M1-3 | Persistent header CTA "Book consultation"; sticky mobile bar with WhatsApp + Book. | M |
| FR-M1-4 | Concerns, blog posts, FAQs and reviews are editable from Admin (no deploy needed). Blog posts need `medically_reviewed = true` before publishing. | M |
| FR-M1-5 | **Free hair assessment**: 6–8 question quiz (concern, duration, pattern, family history, previous treatment, age band) → result page that explains likely next step and pushes to booking. Captures phone (OTP) to save result and create a lead. Answers are stored as clinical data (not visible to sales). Must not present a diagnosis. | S |
| FR-M1-6 | Reviews show only with a stored publication consent; before/after photos only with photo-marketing consent, unretouched, with a "results vary" note. | M |
| FR-M1-7 | SEO: server-rendered pages, unique titles/descriptions, OpenGraph images, XML sitemap, robots.txt, canonical URLs, structured data (Organization, Physician for Dr. Tyagi, Product, FAQPage, BreadcrumbList). | M |
| FR-M1-8 | Analytics events on CTAs and funnel steps (§17), with consent banner for non-essential cookies. | M |
| FR-M1-9 | Medical disclaimer visible in footer on every page; Dr. Tyagi's registration number on the doctor page, footer and every prescription/communication. | M |

**Acceptance:** Lighthouse mobile ≥ 90 performance and ≥ 95 accessibility on Home, Product and Book; every page reachable within 2 taps from Home; no copy containing banned claims (§15.3).

## M2 · Catalog, cart & checkout

| ID | Requirement | Pri |
|---|---|---|
| FR-M2-1 | Products have: name, tagline, gallery, description, ingredients (name + role), how to use, what to expect by month (compliant wording), regulatory category, `requires_consultation`, standalone price (optional), HSN, GST rate, days of supply. | M |
| FR-M2-2 | Plans are priced by duration: 1 month ₹5,999; 2 months ₹10,999; 3 months ₹14,999 (3 months marked "Doctor-recommended duration"). Show total and per-month price together, and savings vs monthly. | M |
| FR-M2-3 | Products with `requires_consultation = true` cannot be added to cart; their page CTA is "Book consultation to get this prescribed". Products with `false` (e.g., shampoo) can be bought directly. | M |
| FR-M2-4 | Cart (client-side, persisted per device) → checkout: phone OTP (if not signed in), address (pincode validates 6 digits, city/state autofill if a pincode API is configured), order summary, guarantee/refund terms link, consent checkboxes → Razorpay Checkout. | M |
| FR-M2-5 | Order is created server-side as `pending_payment` with a Razorpay order; it becomes `paid` **only** from the verified webhook / server fetch. | M |
| FR-M2-6 | Order confirmation page polls status; shows "Confirming payment…" until the server confirms (max 60 s, then "We'll message you on WhatsApp"). | M |
| FR-M2-7 | GST invoice PDF generated on payment (invoice no. sequence, GSTIN, HSN, tax split CGST/SGST or IGST by state), stored privately, downloadable from account. | M |
| FR-M2-8 | Prepaid only at launch (no COD). | M |
| FR-M2-9 | Coupons / offers. | P2 |

## M3 · Consultation booking

| ID | Requirement | Pri |
|---|---|---|
| FR-M3-1 | "Book consultation" opens a **slot picker first** (no form): tabs Today / Tomorrow / next days up to `booking_window_days`, available times in IST, "x slots left" when ≤ 3. | M |
| FR-M3-2 | Availability = weekly rules − exceptions (holidays/leave) − Google Calendar busy blocks − live appointments − minimum notice − `max_per_day`. Slot length 30 min + 10 min buffer (configurable). | M |
| FR-M3-3 | Selecting a slot asks for **mobile number + OTP** (WhatsApp OTP with SMS fallback). Verification creates/links the customer and a lead (source website/sales/whatsapp). | M |
| FR-M3-4 | Short form only: full name, age (block under 18 with a message), main concern (single select), consents (telemedicine, privacy, WhatsApp updates). | M |
| FR-M3-5 | Server holds the slot for `consult.hold_minutes` (10) with a visible countdown; one live hold per customer. | M |
| FR-M3-6 | Payment ₹500 via Razorpay (UPI, cards, netbanking, wallets). | M |
| FR-M3-7 | **Confirmation only server-side**: webhook `payment.captured` (signature verified) or server fetch of the payment → `confirm_appointment_payment` → slot `booked`. Browser redirect alone never confirms. | M |
| FR-M3-8 | If payment lands after the hold expired: rebook the same slot if still free; else keep the payment, message the customer to pick a new slot (no second payment), and create a sales task. | M |
| FR-M3-9 | On booking: WhatsApp + email confirmation (name, doctor, date, time IST, type, amount paid, appointment ID, instructions, join link), calendar event on Dr. Tyagi's Google Calendar, Doctor Portal + CRM updated in real time. | M |
| FR-M3-10 | After payment: **detailed intake** (concern duration, pattern, previous treatments, current products, relevant medical history, medications, allergies, family history) + **3 scalp photos** (front hairline, crown, parting) with on-screen guidance. Saveable; reminders if incomplete at T-24 h and T-3 h. | M |
| FR-M3-11 | Reminders: T-24 h, T-1 h, at start ("Dr. Tyagi is ready"). Offsets configurable. | M |
| FR-M3-12 | Customer can reschedule free until `consult.free_reschedule_hours` (6) before; later changes via support. Cancellation/refund rules per approved policy. | M |
| FR-M3-13 | Sales can book on behalf of a customer: pick slot → system holds it for `consult.sales_hold_minutes` and sends a WhatsApp link to a personal page where the customer confirms age (18+), gives consents and pays ₹500 (stage "Consultation booked" on hold, "₹500 paid" on payment). | M |
| FR-M3-14 | Follow-up consultations (kind `follow_up`) bookable from account/link; fee per doctor setting (default ₹0 for plan customers — confirm). | M |

**Acceptance:**
- Two customers paying for the same slot at the same time → exactly one `booked`; the other gets FR-M3-8 handling. (DB exclusion constraint; tested.)
- Webhook replayed 5 times → one booking, one confirmation message.
- Sales sees "₹500 PAID" within 5 s of webhook receipt.

## M4 · Customer auth & account

| ID | Requirement | Pri |
|---|---|---|
| FR-M4-1 | Customers log in with phone OTP only; account created silently at first booking/checkout. | M |
| FR-M4-2 | Dashboard: current plan with "Day X of Y" and plan end date, next step card (intake pending / join consult / upload photos / reorder / follow-up due). | M |
| FR-M4-3 | Consultations: upcoming (join, reschedule), past (patient-facing summary: treatment plan + follow-up instructions — never `private_notes`), prescriptions (PDF). | M |
| FR-M4-4 | Orders: status, tracking, invoice download, reorder. | M |
| FR-M4-5 | Progress photos: monthly upload (same 3 angles), side-by-side timeline, private by default. | M |
| FR-M4-6 | Guarantee: status card (enrolled since, each rule ✓/✗ with plain words), claim button when eligible, claim status. | M |
| FR-M4-7 | Profile, addresses, consents (view + withdraw), data requests (access/correction/erasure/grievance). | M |
| FR-M4-8 | Support: WhatsApp deep link + contact form. | M |

## M5 · Doctor Portal

| ID | Requirement | Pri |
|---|---|---|
| FR-M5-1 | Staff login: email + password + TOTP 2FA (mandatory for doctor and admin, enforced in the database). Session timeout 12 h. Built in Phase 01. | M |
| FR-M5-2 | **Today**: KPIs (consults today, intake pending, plans sent, follow-ups due) + list with time, patient, concern, status chips with words (Paid · intake done / photos missing / ready / no-show). | M |
| FR-M5-3 | **Calendar**: day/week view of available, held, booked, completed, cancelled, rescheduled and unavailable time; click to open appointment. | M |
| FR-M5-4 | **Availability settings**: working days/hours per weekday (multiple ranges), breaks, holidays/leave (exceptions), slot length, buffer, max per day, booking window, minimum notice; Google Calendar connect (OAuth) for two-way sync. | M |
| FR-M5-5 | **Consultation workspace** (three panes): Patient (profile, intake, photos with zoom & compare, history, past consults, orders, check-in replies) · Live consult (video, structured notes: chief complaint, observations, assessment, treatment plan, follow-up instructions, private notes; identity-verified + consent-recorded checkboxes required before completing) · Outcome (recommendation builder, prescription, follow-up). Autosave every 5 s. | M |
| FR-M5-6 | **Video**: in-portal video (LiveKit) with join link for patient; fallback Google Meet link. No recording by default. | M |
| FR-M5-7 | **Prescription**: structured items (generic name, strength, dosage, frequency, duration, instructions) + advice → PDF with doctor name, qualifications, registration no., patient name/age/gender, date, signature image → stored privately, shared with patient. | M |
| FR-M5-8 | **Protocol templates**: presets (e.g., "Crown thinning — standard") of products + dosage + default plan + follow-up weeks, editable per patient. | M |
| FR-M5-9 | Mark completed / no-show; reschedule; add follow-up due date. | M |
| FR-M5-10 | **Follow-ups** queue: follow-up consults due, flagged side-effect replies, patients without progress photos. | M |
| FR-M5-11 | **Guarantee review**: claim queue with eligibility snapshot and photo comparison; approve/reject with notes. | M |
| FR-M5-12 | Patients list + search (name/phone/appointment code). | M |
| FR-M5-13 | Revenue view (own consult fees + plans from own recommendations). | S |

## M6 · Recommendation & one-tap purchase

| ID | Requirement | Pri |
|---|---|---|
| FR-M6-1 | In the workspace, the doctor picks a template or products, dosage/instructions, plan duration (1/2/3 months) and a note, then clicks **Recommend & create order**. | M |
| FR-M6-2 | One click creates: recommendation (status `sent`), pricing (plan price − consult credit if eligible), a personal link `/r/{token}` valid `recommendation.link_ttl_hours` (72 h), WhatsApp `plan_ready` + email, CRM stage → Product recommended, and an "unpaid plan" timer. | M |
| FR-M6-3 | `/r/{token}` page: greeting, Dr. Tyagi's note, products with dosage, duration selector (doctor's choice preselected; customer can change), price breakdown (plan price, ₹500 credit, total), guarantee summary, address (prefilled only if this device already has the customer's session; otherwise typed, or OTP to use the saved one), **Pay securely** (Razorpay). Retrying payment reuses the same order. | M |
| FR-M6-4 | Consult credit: created when a paid first consult is completed; equals fee paid; valid `consult.credit_window_days` (7) days; applied once, to a plan order. | M |
| FR-M6-5 | Unpaid after 24 h → WhatsApp nudge; after 48 h → sales task; expires at 72 h (sales can reissue). | M |
| FR-M6-6 | The patient is free not to buy; the prescription is theirs regardless. The page states Dr. Tyagi's association with YHC (disclosure). | M |

**Acceptance:** From "Recommend & create order" to WhatsApp delivered ≤ 30 s; customer can pay in ≤ 5 taps on mobile; credit applied exactly once.

## M7 · Sales CRM

| ID | Requirement | Pri |
|---|---|---|
| FR-M7-1 | Lead sources: Meta Lead Ads (webhook), Click-to-WhatsApp/inbound WhatsApp from unknown numbers, website (OTP at booking/checkout/assessment), manual entry, CSV import. Dedupe by phone (E.164). | M |
| FR-M7-2 | Stages: New lead → Contacted → Interested → Consultation suggested → Consultation link sent → Consultation booked (payment pending) → ₹500 paid → Consultation completed → Plan recommended → Plan purchased → Delivered → Follow-up active → Reorder due → Reordered (+ Lost). | M |
| FR-M7-3 | Only the first five stages (and Lost) are set by people. Everything from "Consultation booked" onward is set by system events (forward-only; retention loop can cycle; a payment re-opens a Lost lead). | M |
| FR-M7-4 | Views: Kanban by stage, list with filters (stage, owner, source, campaign, date, next action), "My tasks", lead detail timeline (activities, messages, appointments, payments, orders — no clinical data). | M |
| FR-M7-5 | Payment card on lead: **₹500 payment: PAID** · payment ID · appointment ID · slot · booking status. Same for plan orders. | M |
| FR-M7-6 | Real-time toast + sound for: new lead assigned, ₹500 paid, plan paid, side-effect flag. | M |
| FR-M7-7 | Auto-assign new leads round-robin across the active sales pool; reassign manually. | M |
| FR-M7-8 | Quick actions: send consult link (WhatsApp template), book on behalf (FR-M3-13), log call (outcome), note, task, mark lost (reason). | M |
| FR-M7-9 | Auto tasks: new lead not contacted in SLA, abandoned hold (held → expired without payment), unpaid plan at 48 h, refill call at plan end, intake missing at T-3 h, side-effect flag (urgent). | M |
| FR-M7-10 | Care view: check-in replies, flagged issues, refill due list. | M |
| FR-M7-11 | Rep performance: leads handled, first-contact time, conversion by stage. | S |

## M8 · Messaging & automation

| ID | Requirement | Pri |
|---|---|---|
| FR-M8-1 | Channel adapters: WhatsApp (existing automation provider via HTTP adapter, or Meta Cloud API), SMS (MSG91, DLT-registered), Email (Resend). Provider chosen by env config. | M |
| FR-M8-2 | Template catalog (`docs/08_Messaging_Templates.md`) stored in DB with category (marketing/utility/authentication/service), variables, buttons, approval status. | M |
| FR-M8-3 | All messages logged (`messages`) with delivery status webhooks; failures retried (max 3) then fallback channel (WhatsApp → SMS for transactional). | M |
| FR-M8-4 | Journeys (configurable offsets): booking confirmed, intake reminders, consult reminders, plan ready + nudge, order confirmed/shipped/delivered, care check-ins week 1–4, monthly progress photo request, refill reminders 7/4/1 days, follow-up consult due, guarantee claim updates. | M |
| FR-M8-5 | Marketing messages only to opted-in customers; one-tap opt-out ("STOP") honoured on all channels. Utility templates never carry offers (keeps them utility-priced). | M |
| FR-M8-6 | Inbound WhatsApp replies attach to the customer timeline; quick-reply answers to check-ins are parsed; replies mentioning issues/side effects create an urgent care task and notify the doctor; no automated medical advice. | M |
| FR-M8-7 | Quiet hours (configurable, default 9 pm–9 am IST) apply to scheduled non-urgent messages only (check-ins, photo requests, refill reminders, nudges, marketing). User-triggered transactional messages (booking/order confirmations, plan ready), OTPs and consult reminders are never delayed. | M |
| FR-M8-8 | Admin can edit offsets, enable/disable journeys, view queue and failures, retry. | M |

## M9 · Fulfilment & shipping

| ID | Requirement | Pri |
|---|---|---|
| FR-M9-1 | On order paid: create Shiprocket order (job), status `processing`; ops can review before pickup. | M |
| FR-M9-2 | AWB, courier, tracking URL stored; status webhooks map to `shipments.status` and order status (shipped, delivered, RTO). | M |
| FR-M9-3 | Delivered → `mark_order_delivered` → `plan_end_on` = delivery date (IST) + supply days → starts care check-ins, refill timers, guarantee clock. | M |
| FR-M9-4 | Ops view: to-pack list, pick list by product, exceptions (NDR, RTO, delayed), manual status override with reason (audited). | M |
| FR-M9-5 | Customer messages for shipped/out-for-delivery/delivered. | M |

## M10 · Care follow-ups, refill & reorder

| ID | Requirement | Pri |
|---|---|---|
| FR-M10-1 | Weekly check-ins (weeks 1–4 after delivery, configurable) with quick replies; responses stored per week (`care_checkins`). | M |
| FR-M10-2 | Monthly progress-photo request; uploads go to the patient file and guarantee tracker. | M |
| FR-M10-3 | Refill reminders at plan end − 7, − 4, − 1 days (10:00 IST); CRM stage → Reorder due at the first; refill call task at plan end. | M |
| FR-M10-4 | **One-tap reorder** via signed link or account: same plan & products, same address, pay; cancels pending refill reminders for that order; stage → Reordered → Follow-up active. | M |
| FR-M10-5 | Reorder is blocked (and a follow-up consult is offered) if the last consultation is older than the doctor's validity (default: 6 months — confirm with Dr. Tyagi). | M |
| FR-M10-6 | Follow-up consult due reminders based on `follow_up_in_weeks`. | M |

## M11 · Money-back guarantee

| ID | Requirement | Pri |
|---|---|---|
| FR-M11-1 | Policy is versioned data: refund %, minimum plan months, claim window, minimum check-in response %, monthly photos required, follow-up consult required, full terms text. Only one active policy. Feature flag `guarantee.enabled` off until approved. | M |
| FR-M11-2 | Terms shown beside every plan price, on `/r/{token}`, checkout and in the Guarantee legal page, in the same words. Customer accepts terms at first plan purchase (consent row with policy version). | M |
| FR-M11-3 | Enrollment created when the first paid guarantee-eligible plan order is **delivered**; the clock starts on that delivery date. | M |
| FR-M11-4 | Eligibility engine evaluates each rule and returns pass/fail with plain-language detail; shown live in account. | M |
| FR-M11-5 | Claim: customer submits statement (+ optional final photos) → status `submitted` → doctor review (photo comparison, adherence data) → approve/reject with notes → on approve, ops/admin triggers refund(s) through Razorpay (or bank payout if outside refund window) → `refunded`. Every step messages the customer. | M |
| FR-M11-6 | All decisions audited; rejected claims show the failed rule(s) to the customer. | M |

## M12 · Admin panel

| ID | Requirement | Pri |
|---|---|---|
| FR-M12-1 | Users & roles: invite staff by email, assign role (doctor, sales, ops, admin), deactivate. | M |
| FR-M12-2 | Products, plans, protocol templates (shared), media upload. | M |
| FR-M12-3 | Orders: search, detail, status timeline, refunds (full/partial, reason, audited), invoice regenerate. | M |
| FR-M12-4 | Appointments: list/filter, reschedule/cancel on behalf, refunds for consult fee. | M |
| FR-M12-5 | Customers: profile, timeline, consents, data requests, merge duplicates. | M |
| FR-M12-6 | Message templates, journey settings, job queue monitor (retry/cancel), webhook log. | M |
| FR-M12-7 | Guarantee policies (draft → activate), claims overview. | M |
| FR-M12-8 | Content: concerns, blog, FAQs, reviews moderation (consent required to approve). | M |
| FR-M12-9 | Settings (all keys in `settings` table) with descriptions and validation. | M |
| FR-M12-10 | Audit log viewer (who viewed/changed what). | M |
| FR-M12-11 | Exports (CSV) for orders, payments, leads. | S |

## M13 · Analytics & KPIs

| ID | Requirement | Pri |
|---|---|---|
| FR-M13-1 | Management dashboard with date range: funnel (leads → booked → paid → attended → plan bought → reordered), revenue (consult, plans, reorders), AOV, consult-to-plan rate, reorder rate, 90-day retention, refund/guarantee cost. | M |
| FR-M13-2 | Breakdowns by source/campaign (UTM), sales rep, plan duration. | M |
| FR-M13-3 | Doctor utilisation (booked ÷ available slots), no-show rate. | M |
| FR-M13-4 | Client-side GA4 + Meta Pixel; server-side Meta Conversions API for Lead, Schedule (booked), Purchase (consult and plan) with event IDs for dedupe. | M |
| FR-M13-5 | Every metric has a written definition (§17) shown as a tooltip. | M |

## M14 · Compliance, consent & audit

| ID | Requirement | Pri |
|---|---|---|
| FR-M14-1 | Consent capture with policy version for: privacy, terms, telemedicine, WhatsApp utility, WhatsApp marketing, clinical photo use, marketing photo use, guarantee terms, review publication. Withdrawal supported. | M |
| FR-M14-2 | Doctor's registration number on site, prescriptions, consult messages and receipts. | M |
| FR-M14-3 | Before completing a consultation the doctor confirms patient identity and consent (checkboxes, stored). | M |
| FR-M14-4 | Audit log for viewing clinical records, changing prices/settings/terms, refunds, role changes, data exports. | M |
| FR-M14-5 | Data requests workflow (access, correction, erasure, grievance) with SLA timer; erasure respects medical-record retention rules (anonymise where deletion is not allowed). | M |
| FR-M14-6 | Grievance officer name/contact on site (e-commerce rules) and in footer. | M |
| FR-M14-7 | Age gate: customers must be 18+. | M |

---

## 15. Content and copy rules

1. Tone: calm, clinical, warm. One idea per screen. Plain English (Hindi in Phase 2).
2. Show evidence, not hype: ingredients, process, doctor credentials, consented stories.
3. **Banned in all copy, templates, seed data and tests:** "cure", "100%", "guaranteed regrowth", "permanent", "miracle", "no side effects", fixed timelines ("in 30 days"), comparisons we can't substantiate, unconsented photos or invented reviews.
4. The guarantee is described with its conditions every time it is mentioned.
5. Every medical page/post is reviewed by Dr. Tyagi before publishing.

## 16. Phase 2 (not in MVP)

| ID | Item |
|---|---|
| P2-1 | UPI AutoPay / card subscriptions (Razorpay Subscriptions), pause/skip/cancel, pre-debit notices |
| P2-2 | AI-assisted progress photo comparison (doctor-facing only) |
| P2-3 | Loyalty & referrals; personalised offers |
| P2-4 | Hindi UI and templates; regional languages |
| P2-5 | Multiple doctors (UI for doctor selection, routing, payouts) |
| P2-6 | Mobile app (routine reminders, progress) |
| P2-7 | Home lab test partners |
| P2-8 | WhatsApp AI assistant for routine questions (with escalation) |
| P2-9 | Marketplaces (Amazon/quick commerce) for care products |
| P2-10 | Coupons and campaign landing pages builder |

## 17. Metric definitions

| Metric | Definition |
|---|---|
| New leads | Leads created in period (by `leads.created_at`, IST) |
| Lead → paid consult rate | Leads created in period that have a captured consultation payment within 14 days ÷ leads created in period |
| Booking conversion | Captured consult payments ÷ holds created (same period) |
| Show-up rate | Completed ÷ (completed + no_show) consultations |
| Consult-to-plan rate | Plans paid within 7 days of a completed consult ÷ completed consults, cohorted by consult week |
| AOV | Sum of paid order totals ÷ paid orders |
| Reorder rate | Customers with ≥ 1 reorder within 30 days after plan end ÷ customers whose plan ended in period |
| 90-day retention | Customers with an active plan (plan_end_on ≥ day 90 after first delivery) ÷ customers with first delivery in cohort |
| First-contact time | Lead created → first sales activity of kind call/whatsapp |
| Doctor utilisation | Booked + completed slot minutes ÷ available slot minutes |
| Guarantee cost | Sum of guarantee refunds ÷ plan revenue (same period) |

## 18. Open questions (tracked in `docs/15_Decisions.md` §Pending)

Guarantee terms · regulatory category per product · ₹500 credit confirmation · consult cancellation/refund rules · follow-up consult fee · reorder validity period · WhatsApp provider in use · delivery SLA · GST treatment of consult fee · domain & email sender.
