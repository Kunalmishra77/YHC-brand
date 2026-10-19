# 17 · Audit master checklist — Baseline v1 (19 Oct 2026)

Source: *Your Hair Company — Website Audit Report (Baseline v1)*, 23 pages, 54 issues + 14 assets.
The audit tested the live site. This checklist adds what the **code** shows (column *Code check*),
where the fix goes, and which phase of the plan below closes it. Update *Status* as work lands; the
second audit re-tests by ID.

**Code check:** ✅ Confirmed · ◐ Partly (real, but cause differs from the report) · ✗ Not a bug as
described · ⏳ Can't verify in code (needs client/infra).
**Status** (updated 19 Oct 2026, after implementation): Fixed · Partly · Blocked (needs input — see `docs/18_Client_Inputs.md`) · Open.

## Context the audit could not see

- The whole site is the **client demo prototype** (ADR-23): portals, OTP, payments and messages are
  simulated in an in-memory store mirrored to Supabase (ADR-29). Real auth, storage and payment
  adapters are kit phases 01–12. Several P0s are "the demo is public", not "the auth is broken".
- The homepage's 15 sections are a **client-approved order** (ADR-31); the hero form fields (name,
  mobile, address) come from the **client brief** (ADR-26). Changing either needs the client's OK.
- "Pack render" images are the client's own pack renders (ADR-32), labelled truthfully.

## Security, privacy and compliance

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| SEC-01 | P0 | ✅ by design (demo) | `src/proxy.ts`, `src/app/demo/page.tsx` | Access-code gate for `/demo` and every portal (env `DEMO_ACCESS_CODE`, httpOnly cookie), `noindex` on all app routes; real OTP/staff auth = kit Phase 01 | 1 | Fixed for the demo (signed cookies + access code + noindex; verified forged admin cookie → /demo code form). Real OTP/staff auth: kit Phase 01 |
| SEC-02 | P0 | ◐ | `src/server/demo/persist.ts`, `public.demo_state` | Purge the shared snapshot; gated portals stop other visitors seeing submissions; public lead form shows a "demo — use sample details" notice until real storage ships | 1 | Fixed (snapshot purged at deploy; demo OTP can no longer claim another person’s number — test; portals gated) |
| SEC-03 | P0 | ✅ by design (demo) | `src/app/admin/**` actions | Covered by the SEC-01 gate; server actions already re-check role (`requireRole`) | 1 | Fixed (reset + role switch require the access code server-side) |
| SEC-04 | P1 | ✅ | `next.config.ts` | Security headers (CSP incl. `frame-ancestors 'none'`, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, HSTS includeSubDomains), `poweredByHeader: false` | 1 | Fixed (verified headers; no X-Powered-By) |
| SEC-05 | P0 | ✅ | `site-footer.tsx`, `legal.ts` (grievance) | Publish operating entity, CIN, address, named grievance officer; agency credit as a small "Built by" line | 5 | Blocked — entity, CIN, address, officer (docs/18 #2) |
| SEC-06 | P0 | ✅ | `fixtures.ts` (FAQ notes, guarantee name), `legal.ts`, guarantee band | Remove every internal note from public pages; items that are genuinely unapproved are hidden, not labelled | 1 + 5 | Partly — every public "draft/pending/to be added" string removed; legal sign-off blocked (docs/18 #3) |
| SEC-07 | P1 | ✅ | `src/server/content/legal.ts` (privacy) | Processor list = what actually runs (Vercel, Supabase); Sentry etc. listed only when live | 1 | Fixed (hosting line = Vercel + Supabase; Sentry removed until enabled) |
| SEC-08 | P2 | ✅ | `src/app/robots.ts` | Drop `/auth`; `X-Robots-Tag: noindex` on app routes via proxy | 1 | Fixed (X-Robots-Tag noindex on app routes; robots.txt trimmed) |
| SEC-09 | P1 | ⏳ | kit Phase 01–02 | Real storage: RLS (already in migrations), signed photo URLs, retention jobs — demo keeps photos on the device | 6 | Blocked — go-live build |

## Customer journey and functional

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| FUN-01 | P0 | ✅ | `src/lib/site.ts` `whatsappUrl` | One setting/env `NEXT_PUBLIC_WHATSAPP_NUMBER`; until set, WhatsApp links are hidden (no dead link) | 1 | Partly — WhatsApp buttons hidden until NEXT_PUBLIC_WHATSAPP_NUMBER is set (docs/18 #4) |
| FUN-02 | P0 | ◐ maths is `>=` (correct) | `src/server/guarantee/eligibility.ts` | A cumulative rule on target before the plan ends shows **"On track"**, counted in an "on track" total; unit tests 74/75/76 % | 1 | Fixed ("On track" state; tests 74/75/76 %) |
| FUN-03 | P1 | ✅ | `/start`, `/assessment`, `/book` | One stepper: `/assessment` and new-patient `/book` route into `/start`; `/book` stays for signed-in follow-ups | 2 | Fixed (/assessment 308 → /start; new visitors on /book → /start; links updated) |
| FUN-04 | P1 | ✅ | `src/components/booking/*` | Booking step in URL + server-side state keyed to the hold | 2 | Fixed (journey booking restores a live hold after refresh — verified) |
| FUN-05 | P1 | ✅ | `/start` details step | OTP once, at the first step, reused for the journey | 2 | Already met — OTP is verified at step 1 (audit could not submit forms) |
| FUN-06 | P2 | ✅ | `src/app/r/[token]/page.tsx` | `notFound()` → 404 with the friendly page | 1 | Fixed (404 verified) |
| FUN-07 | P2 | ✅ demo seed | `store.ts` seed, `doctor/*` recommend flow | Seed a scan for plan customers; prescribing without a scan needs a recorded override reason | 1 | Fixed (seeded scans; no-scan override reason required + audited) |
| FUN-08 | P2 | ✅ | `src/server/doctor/*` revenue KPIs | Whole-rupee display; define + reconcile KPIs; tests on a fixed fixture | 1 | Fixed (whole rupees; KPI definitions; tests) |
| FUN-09 | P2 | ✅ | `src/server/admin/kpis.ts` | One funnel source; cohort logic documented; monotonic stages | 1 | Fixed (one funnel source; monotonic; tests) |
| FUN-10 | P3 | ✅ | `src/app/demo/page.tsx` | Day count computed from the seeded start date | 1 | Fixed |
| FUN-11 | P1 | ⏳ | infra | Staging env with test OTP + Razorpay test keys (kit Phase 01/03) | 6 | Blocked — test keys + OTP provider (docs/18 #12) |

## Content and trust

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| CON-01 | P0 | ✅ | hero trust rail, `doctor-card.tsx`, `/doctor-tyagi`, `claims.ts` | Hide "to be added" / "pending" lines now; show the registration number + council when supplied; patent line only with a patent number | 1 + 5 | Partly — placeholder lines hidden; registration number needed (docs/18 #1) |
| CON-02 | P0 | ◐ consent recorded, durations missing | `src/server/content/results.ts`, `/results` | Hide "Duration: to be confirmed"; show duration + consent date per case when supplied | 1 + 5 | Partly — "to be confirmed" hidden; durations + consent dates needed (docs/18 #5) |
| CON-03 | P1 | ◐ value is 30 everywhere; count-up animation captured mid-way; steps 7 vs 6 is real | `why-choose.tsx` CountUp, `how-it-works`, `/start` stepper | Render the final number for screen readers/no-JS; one shared step list | 1 | Fixed (factual figure no longer animates; one step list "6 + follow-up") |
| CON-04 | P1 | ✅ | plans/book/products copy | Drive "credited within N days" from `credit_window_days`; remove caveat once D-P3 confirmed | 1 + 5 | Fixed text (value from setting); rule confirmation pending (docs/18 #11) |
| CON-05 | P1 | ✅ | contact, home contact strip | Hide hours until supplied | 1 + 5 | Partly — hours hidden until supplied (docs/18 #8) |
| CON-06 | P2 | ✅ | product media | Real pack photos when shot (E-04) | 5 | Blocked — real photography (E-04) |
| CON-07 | P1 | ⏳ | product + label | Written regulatory sign-off; already prescription-gated | 5 | Blocked — regulatory sign-off (docs/18 #9) |

## UI/UX and responsive

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| UX-01 | P1 | ✅ | `src/app/(site)/page.tsx` | Keep the 15-section order, compact each section (see UX-02/03, padding tokens) to < 9,000 px desktop / < 12,000 px mobile | 3 | Partly — 23,387 → ~12,700 px desktop, 27,726 → ~18,800 px mobile; < 9,000 needs moving 3–4 sections off the homepage (client decision) |
| UX-02 | P1 | ✅ | `how-it-works/journey-stepper.tsx` | Tabs/stepper in one viewport, CTA + ₹500 note in the step-7 row | 3 | Fixed (one-viewport tab stepper, CTA + fee beside the steps) |
| UX-03 | P1 | ✅ | `science-story.tsx` | 3 key facts + "Read the science" link; chapters stay on `/science` | 3 | Fixed (3 cited facts + link; ~1,230 px) |
| UX-04 | P1 | ✅ | `hero-start-form.tsx`, `start/details` | Name + mobile (+OTP) only; address at plan checkout | 2 | Fixed (name + mobile + consent) |
| UX-05 | P1 | ✅ | `home-hero.tsx`, sticky bar | Primary CTA under the H1 on mobile; sticky bar from load | 3 | Fixed (CTA above the fold at 360/390 — verified) |
| UX-06 | P2 | ✅ | portals' `Logo` usage | Same logo + tokens in portals (logo done 18 Oct; check every layout) | 3 | Fixed (YHC logo in header, footer, portals, demo; shared tokens) |
| UX-07 | P2 | ✅ | eyebrow/label classes (11 px, 8 px "Magnified") | 12 px minimum label, 16 px mobile body | 3 | Fixed (0 text nodes < 12 px measured; decorative guarantee-seal ring excepted) |
| UX-08 | P2 | ✅ | `/science` citations, chips | ≥ 24×24 targets, 44×44 primary | 3 | Fixed (/science citation and source targets ≥ 24×24) |
| UX-09 | P2 | ✅ | `testimonials/*`, guarantee band badge | Remove overlay fade / quote overlap; badge goes with SEC-06 | 3 | Fixed |
| UX-10 | P2 | ✅ | `site-header.tsx`, mobile menu | Add Plans to nav | 1 | Fixed (Plans in nav) |
| UX-11 | — | ✅ passed | — | Keep as regression check | 7 | Passed — re-verified no overflow at 360/390/768/1280/1536 |

## Accessibility

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| A11Y-01 | P1 | ✅ | `background-video.tsx` | Pause/play control; poster only under reduced motion | 1 | Fixed (pause/play; poster under reduced motion) |
| A11Y-02 | P2 | ✅ | `(site)/layout.tsx`, portal layouts | Skip link to `#main` | 1 | Fixed (skip link site + portals) |
| A11Y-03 | P2 | ◐ | `results/results-carousel.tsx` | Render the case list once in the a11y tree (clones `aria-hidden` + `inert`) | 1 | Fixed (clones aria-hidden + inert) |
| A11Y-04 | P2 | ✅ | `hero-start-form.tsx` consent | `aria-invalid` + `aria-describedby` on the checkbox | 1 | Already met in code (aria-invalid + aria-describedby on the checkbox) |
| A11Y-05 | P3 | ✅ | `ingredients-spread.tsx` | Alt = product name + pack size | 1 | Fixed |
| A11Y-06 | P2 | ⏳ | site-wide | axe run on the routes in §I; fix serious/critical | 7 | Not performed — axe not installed (needs approval to add @axe-core/playwright) |

## SEO

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| SEO-01 | P2 | ✅ | `src/app/sitemap.ts` | Add /science, /start, /results, /guarantee | 1 | Fixed |
| SEO-02 | P2 | ✅ | `seo.tsx`, `opengraph-image` | Generated 1200×630 OG images per template (next/og, brand logo + pack); `summary_large_image` | 1 | Fixed (generated OG cards incl. pack photos) |
| SEO-03 | P3 | ✅ | `/start`, `/book` metadata | Self-canonical | 1 | Fixed |
| SEO-04 | P3 | ✅ | articles, home metadata | Titles < 60, descriptions 140–155 | 1 | Fixed |
| SEO-05 | P3 | ✅ | concern slugs | Hyphenated slugs + 301 from underscore URLs | 1 | Fixed (308 verified) |
| SEO-06 | P2 | ✅ | JSON-LD | Product image; MedicalWebPage (+ reviewedBy once CON-01); MedicalClinic on home | 1 | Fixed (reviewedBy waits for CON-01) |

## Performance

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| PERF-01 | P2 | ✅ | `background-video.tsx` | Mount below-fold video on intersection; re-encode under 800 KB (WebM + MP4) | 1 | Fixed (lazy mount; videos 2.9–5.1 MB → ~0.7 MB WebM/MP4) |
| PERF-02 | P2 | ✅ | homepage | Falls with UX-01/03; lazy-load heavy widgets; bundle check | 3 | Partly — HTML 636 → 449 KB; JS bundle not re-measured |
| PERF-03 | P2 | ✅ | `force-dynamic` on marketing routes | ISR (revalidate) for marketing routes that only read catalog/settings | 3 | Open — marketing routes still force-dynamic (they read live demo settings); ISR when settings move to the DB |
| PERF-04 | P3 | ✅ | footer/long lists | `prefetch={false}` on footer and long-list links | 1 | Fixed (footer links prefetch={false}) |

## Measurement

| ID | Pri | Code check | Where | Fix (planned) | Phase | Status |
|---|---|---|---|---|---|---|
| BIZ-01 | P0 | ✅ | — | Consent banner + event layer (`scan_started`, `details_submitted`, `scan_completed`, `consult_paid`, `plan_paid`), GA4 + Meta Pixel load only after consent and only when their IDs are set | 4 | Partly — consent banner + 5 events built and tested; dormant until GA4/Pixel IDs (docs/18 #6); CAPI later |

## Assets (audit §E) — prompts in `YOUR_HAIR_COMPANY_ASSET_GENERATION_PROMPTS.md`

| ID | Pri | Asset | Status |
|---|---|---|---|
| E-01 | P0 | Dr. Tyagi portrait set + caption with Reg. No. | Portrait exists; needs real photo set + Reg. No. (must be real photos, not generated) |
| E-02 | P1 | 30–45 s screen recording of the real phone scan | Screen recording of our own UI — can be produced from the app; prompt for B-roll intro only |
| E-03 | P1 | 60–90 s doctor intro video | Must be filmed with Dr. Tyagi (no generated likeness) |
| E-04 | P1 | Real pack photography | Must be photographed (renders exist) |
| E-05 | P0 | Consented before/after sets with dates | Real patients only — never generated |
| E-06 | P2 | OG images | Generated in code (Phase 1) |
| E-07 | P2 | "What happens in the consult" 3-panel illustration | Prompt |
| E-08 | P3 | Cart/checkout empty-state illustration | Prompt |
| E-09 | P2 | Replace stock doctor image (Considered) | Real clinic photo preferred; prompt for a faceless consultation still |
| E-10 | P3 | Replace hands-on-scalp image | Prompt (faceless scan session) |
| E-11 | P2 | Optimise science video | Re-encode (Phase 1) + Flow prompt for a replacement |
| E-12 | P2 | Optimise hero video + pause | Re-encode + pause (Phase 1) + Flow prompt |
| E-13 | P3 | Wordmark SVG for portals | Needs vector logo from client (PNG in use) |
| E-14 | P3 | Product alt text | Phase 1 (A11Y-05) |

## Plan (phases)

1. **Hardening, honesty and quick wins** — no client input needed: SEC-01/02/03/04/06(notes)/07/08,
   FUN-01(hide)/02/06/07/08/09/10, CON-01(hide)/02(hide)/03/05(hide), UX-10, A11Y-01–05,
   SEO-01–06, PERF-01/04.
2. **One funnel** (after decisions): FUN-03/04/05, UX-04.
3. **Homepage and UI compaction**: UX-01/02/03/05/06/07/08/09, PERF-02/03.
4. **Measurement**: BIZ-01 consent + events (IDs from client).
5. **Client/legal content** as it arrives: SEC-05/06, CON-01/02/04/05/06/07, E-01/03/04/05.
6. **Go-live build** (kit phases 01+): real auth, storage, payments, staging — SEC-01 (full), SEC-09, FUN-11.
7. **Final verification** against §I of the audit + second-audit handover.
