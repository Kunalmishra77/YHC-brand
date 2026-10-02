# 00 · Project Blueprint — Your Hair Company Platform

> One-page map of the whole project. Read this first, then the PRD (what), the TRD (how) and the phase files (in what order).
> Status: **Scope approved by client (approved deck in `docs/reference/`).** Build starts at Phase 0.

---

## 1. What we are building

A doctor-led hair-care platform for **Your Hair Company (YHC)**, led by **Dr. Tyagi**. It joins five things that are usually separate systems:

| Surface | Who uses it | Job |
|---|---|---|
| **Website + shop** (`/`) | Customers | Learn, book a ₹500 video consultation, buy plans, reorder |
| **Customer account** (`/account`) | Customers | My plan, orders, prescriptions, progress photos, guarantee, reorder |
| **Doctor Portal** (`/doctor`) | Dr. Tyagi | Calendar, consultation workspace, prescriptions, one-click plan recommendation, guarantee review |
| **Sales CRM** (`/sales`) | Sales + care team | Leads, pipeline that moves itself, tasks, payment visibility, follow-ups |
| **Admin** (`/admin`) | Management, ops | Products, plans, orders, refunds, templates, settings, analytics, audit |

**Plus** an automation layer: WhatsApp/SMS/email messages, reminders, care check-ins, refill reminders and the money-back guarantee tracker.

## 2. Why the price is premium

Plans: **1 month ₹5,999 · 2 months ₹10,999 · 3 months ₹14,999.** Premium because of a **money-back guarantee**: follow Dr. Tyagi's plan and, if it doesn't work, get a refund under published terms. The platform must therefore track adherence (delivery, check-ins, monthly photos, follow-up consult) automatically so claims are fair and fast.

## 3. The customer journey (the spine of the system)

```
Meta ads / Google / referral
        │
        ▼
WhatsApp + sales team ──► Website (education)
        │                        │
        └──────────┬─────────────┘
                   ▼
   Pick a slot ─► OTP ─► Pay ₹500 (Razorpay) ─► server webhook confirms
                   │
                   ▼
   Intake form + scalp photos ─► reminders (24 h, 1 h, start)
                   │
                   ▼
   30-min video consult with Dr. Tyagi (Doctor Portal workspace)
                   │
                   ▼
   "Recommend & create order" ─► WhatsApp "Your plan is ready" ─► one-tap pay (₹500 credited)
                   │
                   ▼
   Shiprocket delivery ─► weekly care check-ins ─► monthly progress photos
                   │
                   ▼
   Refill reminders (7/4/1 days before plan ends) ─► one-tap reorder ─► loop
                   │
                   ▼
   Guarantee: eligible? ─► claim ─► doctor review ─► refund
```

Every step writes a **domain event**. Events drive the **CRM stage** automatically, the **messages**, the **jobs** and the **analytics**. Nobody updates a status by hand once money or delivery is involved.

## 4. System map

```
            ┌─────────────── Next.js app (one codebase, Vercel, Mumbai) ───────────────┐
            │  (site)  /account  /doctor  /sales  /admin   API: /api/*   Cron: /api/cron │
            └───────┬───────────────────────────────┬──────────────────────────┬───────┘
                    │ supabase-js (RLS)              │ service role (server only) │
                    ▼                                ▼                            ▼
          ┌──────────────────── Supabase (Mumbai) ────────────────────┐   External services
          │ Postgres: 40+ tables, RLS, SQL functions, KPI views       │   Razorpay (payments, refunds)
          │ Auth: phone OTP (customers), email+MFA (staff)            │   WhatsApp BSP / Meta Cloud API
          │ Storage: clinical (private), public-media                 │   MSG91 (SMS, DLT) · Resend (email)
          │ Realtime: payment + lead updates to sales                 │   LiveKit (video) / Google Meet
          │ pg_cron → /api/cron/jobs every minute                     │   Google Calendar · Shiprocket
          └───────────────────────────────────────────────────────────┘   GA4 + Meta CAPI · Sentry
```

## 5. Modules (PRD IDs)

| ID | Module | MVP? |
|---|---|---|
| M1 | Marketing website & content | ✅ |
| M2 | Catalog, cart & checkout | ✅ |
| M3 | Consultation booking (slots, hold, ₹500, confirm) | ✅ |
| M4 | Customer auth & account | ✅ |
| M5 | Doctor Portal (calendar, workspace, video, prescription) | ✅ |
| M6 | Recommendation & one-tap purchase | ✅ |
| M7 | Sales CRM | ✅ |
| M8 | Messaging & automation | ✅ (core journeys) |
| M9 | Fulfilment & shipping | ✅ |
| M10 | Care follow-ups, refill & reorder | ✅ |
| M11 | Money-back guarantee | ✅ (tracking + claims) |
| M12 | Admin panel | ✅ |
| M13 | Analytics & KPIs | ✅ (core) |
| M14 | Compliance, consent & audit | ✅ |
| P2 | UPI AutoPay subscriptions, AI photo tracking, loyalty, Hindi, app, multi-doctor UI | Phase 2 |

## 6. Build phases (for Claude Code)

| Phase | Name | Output | Indicative time |
|---|---|---|---|
| 00 | Foundation | Repo, Next.js, Supabase, CI, design tokens, auth skeleton | 3–4 days |
| 01 | Data layer & platform | Migrations applied, types, dev seed, RLS tests, events + job runner, **staff login + MFA** | 3–4 days |
| 02 | Design system & website shell | UI kit, homepage, static pages, CMS-backed content | 1 week |
| 03 | Catalog & checkout | Products, plans, cart, Razorpay orders, webhook, orders | 1 week |
| 04 | Consultation booking | Availability engine, hold, ₹500, confirm, intake, photos | 1 week |
| 05 | Doctor Portal | Dashboard, calendar settings, workspace, video, prescription PDF | 1–1.5 weeks |
| 06 | Recommendation & one-tap buy | Recommend & create order, `/r/[token]`, consult credit | 4–5 days |
| 07 | Sales CRM | Leads, auto-stages, tasks, realtime payment alerts, Meta leads | 1 week |
| 08 | Messaging & jobs | WhatsApp adapter, templates, job runner, reminders | 1 week |
| 09 | Fulfilment, care & refill | Shiprocket, delivery, check-ins, refill, reorder | 1 week |
| 10 | Customer account & guarantee | Dashboard, progress photos, guarantee eligibility + claims | 1 week |
| 11 | Admin & analytics | Admin modules, KPI dashboard, audit, jobs monitor | 1 week |
| 12 | Hardening & launch | Security, compliance pass, performance, SEO, E2E, UAT, go-live | 1.5–2 weeks |
| P2 | Phase 2 backlog | AutoPay, AI tracking, loyalty, Hindi, app | after 60–90 days of data |

Total ≈ **12–14 weeks** of build after kick-off. UI/UX design (Figma) can run **in parallel** with Phases 00–01, because those phases are design-independent. Website visuals in Phase 02 should start once the homepage and product page designs are signed off.

## 7. Document index

| File | What it answers |
|---|---|
| `docs/01_PRD.md` | What exactly we build, for whom, with numbered requirements (FR-xxx) and acceptance criteria |
| `docs/02_TRD.md` | Architecture, stack, folder structure, core algorithms, security, NFRs |
| `docs/03_User_Flows.md` | Sequence + state diagrams (Mermaid) for every critical flow |
| `docs/04_Database_Schema.md` | Entity guide for `supabase/migrations/*` |
| `docs/05_API_Spec.md` | Every route handler, server action, webhook and cron endpoint |
| `docs/06_Integrations.md` | Razorpay, WhatsApp, MSG91, Resend, LiveKit/Meet, Google Calendar, Shiprocket, Meta CAPI |
| `docs/07_Design_System.md` | Brand tokens, type, components, motion, accessibility (+ `design/tokens.css`) |
| `docs/08_Messaging_Templates.md` | Every WhatsApp/SMS/email template with category and copy |
| `docs/09_Compliance.md` | Telemedicine, NMC, DPDP, ASCI/CCPA, e-commerce, GST, WhatsApp policy |
| `docs/10_Testing_QA.md` | Test strategy, test cases, UAT scripts |
| `docs/11_Deployment_DevOps.md` | Environments, CI/CD, secrets, cron, backups, monitoring, go-live |
| `docs/12_What_We_Need.md` | **Everything required to start**: accounts, credentials, client inputs, legal, content |
| `docs/13_Team_RACI.md` | Roles, owners, cadence |
| `docs/14_Risks.md` | Risk register |
| `docs/15_Decisions.md` | Decisions made (ADRs) and decisions pending with the client |
| `phases/PHASE_*.md` | Build plan with tasks, acceptance criteria and a paste-ready Claude Code prompt |
| `CLAUDE.md` | Rules Claude Code follows in this repo |
| `PROGRESS.md` | Live tracker Claude Code updates after each task |

## 8. Golden rules (non-negotiable)

1. **The server decides money.** A booking or order is confirmed only by a verified Razorpay webhook (or a server-side API fetch) through the SQL function `capture_payment`, never by a browser redirect.
2. **Clinical data stays clinical.** Sales never sees intake/assessment answers, photos, consultation notes, prescriptions or dosage. Enforced by RLS, guard triggers and MFA-at-database, not just UI.
3. **Money in paise, time in UTC, display in IST.**
4. **Every state change emits an event**; CRM stages, messages and KPIs come from events.
5. **No medical over-claiming.** No "cure", "100%", guaranteed timelines or fake reviews anywhere: copy, templates, seed data or tests.
6. **Guarantee terms are data, not code**, and stay inactive until Dr. Tyagi and counsel approve them.
7. **Every external service sits behind an adapter**, so we can swap WhatsApp BSP, courier or video provider without rewrites.
