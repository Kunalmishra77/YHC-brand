# 12 · What We Need — Complete Checklist

Everything required to build and launch, who owns it, and **by which build phase** it is needed. Tick items here as they arrive; Claude Code reads this file and will stub anything missing (with a `TODO(client)` marker) instead of blocking.

Owner key: **YHC** = client (Dr. Tyagi's team) · **US** = our team · **Both**.

---

## A. Decisions the client must make
Full list with our recommendations: `docs/15_Decisions.md` §Pending. The ones that block build:

| # | Decision | Needed by |
|---|---|---|
| D-P1 | Money-back guarantee terms (refund %, months, conditions, claim window) | Phase 10 (and before any ad mentions it) |
| D-P2 | Regulatory category + licence for each product | Phase 03 |
| D-P3 | ₹500 credit against first plan within 7 days — yes/no | Phase 06 |
| D-P4 | Consult cancellation, reschedule and refund rules | Phase 04 |
| D-P5 | Follow-up consult fee (free for plan customers?) | Phase 04 |
| D-P6 | Reorder validity (how long a consult stays valid for reorders) | Phase 09 |
| D-P7 | Which WhatsApp automation provider/number is in use today | Phase 08 (week 1 for template submission) |
| D-P8 | Delivery SLA, packaging, pickup address | Phase 09 |
| D-P9 | Consult-fee GST treatment (CA) | Phase 03 |
| D-P14 | GST on plans: one plan line vs price split across products (HSN/rates) | Phase 03 |

## B. Client content & assets (owner: YHC)

| Item | Detail | Needed by |
|---|---|---|
| Logo files | "Capsule Tuft" mark: SVG (colour, black, white), favicon, app icon | Phase 02 |
| Brand guidelines (if any) | otherwise the approved deck direction is used | Phase 02 |
| Dr. Tyagi | Portrait photos (2–3), consultation photo, 30–60 s intro video (optional), full name as registered, qualifications, **registration number + council**, experience, bio (150 & 400 words), signature image (for prescriptions, transparent PNG) | Phase 02 (photos/bio), Phase 05 (signature) |
| Products | Names, SKUs, photos (pack front/back, texture, in-hand), descriptions, full ingredient lists with role of each, usage instructions, days of supply per pack, pack size, weight & dimensions (shipping), MRP, HSN code, GST rate, manufacturer & licence numbers, regulatory category, patent number + scope (if "patented" is claimed) | Phase 03 |
| Protocols | Dr. Tyagi's standard plans per concern (products + dosage + follow-up timing) → protocol templates | Phase 05 |
| Intake questionnaire | Final medical questions & photo angles approved by Dr. Tyagi (draft provided in Phase 04) | Phase 04 |
| Prescription format | Letterhead details, clinic address, any mandatory text | Phase 05 |
| Trust | Reviews/testimonials **with signed consent**, before/after photos **with photo consent**, certifications, lab/manufacturing info, press | Phase 02 (placeholders allowed) |
| Content | Hair-concern pages (we draft, doctor reviews), FAQs answers (doctor reviews), 3–5 launch blog posts | Phase 02 → Phase 12 |
| Business | Legal entity name, registered address, GSTIN, support phone/WhatsApp/email, grievance officer name & contact, business hours | Phase 02 |
| Policies | Privacy, Terms, Refund & Cancellation, Shipping, Guarantee terms, Medical disclaimer, Telemedicine consent text (counsel-reviewed; we provide drafts) | Phase 12 (drafts earlier) |
| Marketing | Current Meta ad accounts/campaigns, Meta Pixel (if exists), existing WhatsApp templates and creatives, existing customer list (if importing, with consent basis) | Phase 07–08 |

## C. Accounts, access & credentials

Create accounts **in YHC's name** (YHC owns them); add our team as admins/developers. Never share passwords over chat; use a password manager share or the provider's team invite.

| Service | Purpose | Owner | What we need | Needed by |
|---|---|---|---|---|
| Domain DNS (yourhaircompany.com) | Site, email sending, verification records | YHC | DNS access or a person who can add records quickly | Phase 00 (staging subdomain) |
| GitHub organisation | Code repo, CI | US (transfer to YHC at handover if contracted) | Private repo `yhc-platform` | Phase 00 |
| Vercel (Pro) | Hosting | YHC (billing) / US (admin) | Team + project, domain | Phase 00 |
| Supabase (Pro for prod) | DB, auth, storage | YHC (billing) / US | Two projects: staging, prod (Mumbai) | Phase 00 |
| Razorpay | Payments | YHC | Business KYC; test keys now, live keys before launch; webhook secret; team access for us | Phase 03 (test), Phase 12 (live) |
| WhatsApp (existing provider **or** Meta Cloud API) | Messages | YHC | Provider API docs + key, **or** Meta Business Manager (verified), WhatsApp Business Account, phone number, system user token; template approval access | Phase 08 (submit templates in week 1) |
| Meta Business Manager | Lead Ads, Pixel, CAPI, CTWA | YHC | Admin/partner access; page access for leads; Pixel ID; CAPI token | Phase 07 |
| MSG91 | SMS fallback + OTP | YHC | Account, **DLT registration** (entity ID, sender header, template IDs) — DLT can take days, start now | Phase 03 (dev uses test OTP; live SMS by Phase 08) |
| Resend | Email | YHC | Account, verified sending domain (SPF/DKIM/DMARC) | Phase 04 |
| LiveKit Cloud | Video consults | YHC | Project URL, API key/secret | Phase 05 |
| Google Workspace / Google Cloud | Dr. Tyagi's calendar sync | YHC | Calendar account Dr. Tyagi uses; Google Cloud project with OAuth (Internal app if Workspace) | Phase 05 |
| Shiprocket | Shipping | YHC | Account, KYC, pickup address, API user, webhook | Phase 09 |
| Upstash | Rate limiting + OTP channel flag | US/YHC | Redis database (Mumbai/closest) | Phase 03 |
| Sentry | Error tracking | US/YHC | Organisation + project | Phase 00 |
| Google Analytics 4 / Search Console | Analytics, SEO | YHC | Property + admin access | Phase 02 |
| Uptime monitor | Alerts | US | Better Stack / UptimeRobot | Phase 12 |
| Figma | UI/UX design | US | Team file, client viewer access | Design phase (parallel to 00–01) |
| Password manager | Secret sharing | Both | Shared vault (1Password/Bitwarden) | Day 1 |

## D. Legal & compliance (owner: YHC + counsel + CA)
See `docs/09_Compliance.md` §10 for the launch checklist. Start now: counsel review of telemedicine + doctor-owned brand + guarantee terms; CA on GST/HSN/consult fee; DLT registration; Razorpay KYC.

## E. People

| Role | Responsibility |
|---|---|
| Product owner (US) | Scope, priorities, client communication, acceptance |
| Tech lead (US) | Architecture, code review, Claude Code supervision, releases |
| Full-stack/backend developer | Booking, payments, jobs, integrations |
| Frontend developer | Website, account, portals UI |
| UI/UX designer | Figma: website, booking, portals; component specs |
| QA | Test plan execution, E2E, UAT coordination |
| Client servicing | Asset collection, approvals, meeting notes |
| Dr. Tyagi (YHC) | Medical content, intake, protocols, prescription format, UAT |
| YHC operations | Products, logistics, Razorpay/WhatsApp/MSG91 accounts |
| Counsel & CA (YHC) | Policies, guarantee terms, GST |

Details and RACI: `docs/13_Team_RACI.md`.

## F. Developer machine setup
- Node.js LTS, pnpm (`corepack enable`), Git, Docker Desktop (for `supabase start`), Supabase CLI, VS Code + extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Markdown Preview Mermaid Support, Playwright Test; Claude Code (VS Code extension or CLI).
- Access to the GitHub repo, staging Supabase/Vercel, Razorpay test keys, password vault.

## G. Running-cost drivers (estimate with live pricing before quoting)

| Item | Driver |
|---|---|
| Vercel Pro | per team member + usage |
| Supabase Pro (+ PITR add-on) | per project (staging can be Free/Pro) |
| Razorpay | % fee per transaction (by method) |
| WhatsApp | per delivered template: ≈ ₹0.8631 marketing, ≈ ₹0.115 utility/auth (Oct 2026 India rate card, + GST + BSP fee) |
| MSG91 | per SMS (fallback only) + DLT fees |
| LiveKit Cloud | per participant-minute (≈ 30 min × 2 participants per consult) |
| Shiprocket | per shipment by weight/zone |
| Resend, Sentry, Upstash, uptime | free/low tiers likely enough at launch |
