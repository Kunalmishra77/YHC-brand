# 19 · Audit implementation report — Baseline v1 → re-test handover (19 Oct 2026)

Companion to `docs/17_Audit_Master_Checklist.md` (status per audit ID), `docs/18_Client_Inputs.md`
(what YHC must supply) and `YOUR_HAIR_COMPANY_ASSET_GENERATION_PROMPTS.md` (image/video prompts and
shoot briefs). Branch `feat/audit-v1-fixes`; decisions in `docs/15` ADR-33.

## 1. Result in one table

| Audit area | Items | Fixed | Partly | Blocked (client) | Open / not performed |
|---|---|---|---|---|---|
| Security, privacy, compliance | 9 | 5 | 1 | 3 | — |
| Journey and functional | 11 | 8 (+1 already met) | 1 | 1 | — |
| Content and trust | 7 | 2 | 3 | 2 | — |
| UI/UX and responsive | 11 | 9 (+1 passed) | 1 | — | — |
| Accessibility | 6 | 4 (+1 already met) | — | — | 1 (axe run) |
| SEO | 6 | 6 | — | — | — |
| Performance | 4 | 2 | 1 | — | 1 (ISR) |
| Measurement | 1 | — | 1 | — | — |

**All 10 P0s addressed in code where possible.** The ones that cannot close without YHC: registration
number (CON-01), legal entity + grievance officer (SEC-05), legal sign-off (SEC-06), WhatsApp number
(FUN-01), result durations/consent dates (CON-02), GA4/Pixel IDs (BIZ-01).

## 2. What changed, where, why

**Security and data (SEC-01/02/03/04/07/08)**
- `src/lib/demo-gate.ts`, `src/server/demo/session.ts`, `src/proxy.ts`, `src/lib/rbac.ts`,
  `src/app/demo/*`: demo session cookies are HMAC-signed (a hand-made `yhc_demo_role=admin` is ignored);
  staff portals, the role switcher and "Reset sample data" need a shared access code (Vercel env
  `DEMO_ACCESS_CODE`, rate-limited); every app route sends `X-Robots-Tag: noindex`.
- `src/server/demo/otp-claim.ts`: the demo OTP is public, so it can no longer open an existing
  customer's record from another browser (the real data-exposure path behind SEC-02).
- `scripts/purge-demo-state.mjs`: purges the shared live snapshot (run after deploy).
- `next.config.ts`: CSP (`frame-ancestors 'none'`), HSTS includeSubDomains, X-Frame-Options,
  nosniff, Referrer-Policy, Permissions-Policy (camera/mic self for scan + consult), no X-Powered-By.
- Privacy policy hosting line now names only what runs (Vercel, Supabase).

**One funnel (FUN-03/04/05, UX-04, CON-03)**
- Start form = name + mobile + consent → OTP (already on step 1) → scan → assessment → health form
  → **Book & pay** → consultation. Address moved to plan checkout (it was already collected there).
- `/assessment` → 308 `/start` (next.config); `/book` sends visitors without a returning-patient
  session to `/start`; concern/blog links updated. `/book` stays for follow-ups.
- A held slot survives refresh (`start/book/page.tsx` restores the live hold).
- Homepage "How it works" says "Six steps to your consultation, then follow-up" from the same list.

**Functional (FUN-02/06/07/08/09/10)** — guarantee "On track" state with 74/75/76 % tests; `/r/[token]`
404; seeded scans + mandatory override reason when prescribing without a scan; whole-rupee revenue
KPIs with definitions; one funnel source for admin conversion; demo day count computed.

**Trust and content (CON-01/02/04/05, SEC-06, FUN-01)** — unconfirmed facts are hidden, not labelled:
registration/council lines, patent line, "Duration: to be confirmed", support hours, internal
"(Pending client confirmation)" notes, public "Draft terms" badges, "Version 1 · draft". WhatsApp
buttons appear only once `NEXT_PUBLIC_WHATSAPP_NUMBER` is set (no dead `910000000000` link).

**Homepage and UI (UX-01/02/03/05/06/07/08/09/10)**
- How it works: one-viewport tab stepper (was a 4,700 px sticky scroll). Science: 3 cited facts +
  link (was 6,300 px). Why choose: compact bento. Doctor, hair-loss, ingredients, results, scan
  sections tightened; display type capped at 96 px; section rhythm 56/80 px.
- Mobile hero CTA above the fold; Plans in the nav; YHC logo in portals; no text under 12 px;
  /science tap targets ≥ 24 px; testimonials overlay fixed.
- Height: desktop 23,387 → ~12,700 px; 390 px 27,726 → ~18,800 px.

**Accessibility (A11Y-01/02/03/05)** — pause/play on every background video, poster only under
reduced motion; skip link on site + portals; marquee clones `aria-hidden` + `inert`; product alt text.

**SEO (SEO-01–06)** — complete sitemap, generated 1200×630 OG/Twitter cards (product cards show the
pack), self-canonicals, titles < 60 / descriptions 140–155, `/concerns/hair-fall` with 308s, Product
image + MedicalWebPage + MedicalClinic JSON-LD.

**Performance (PERF-01/02/04)** — videos lazy-mount near the viewport and were re-encoded to
~0.7 MB WebM + MP4 (from 2.9–5.1 MB); homepage HTML 636 → 449 KB; footer prefetch off.

**Measurement (BIZ-01)** — `src/lib/analytics.ts` + `src/components/shared/analytics-consent.tsx`:
consent banner (Accept/Decline equal weight), GA4 + Meta Pixel load only after Accept and only when
IDs are set; events `details_submitted`, `scan_started`, `scan_completed`, `consult_paid`,
`plan_paid` with amounts only — never health data.

## 3. Testing report

| Check | Result | Evidence |
|---|---|---|
| Typecheck / lint / unit + integration tests | **Pass** | `pnpm typecheck` 0, `pnpm lint` 0, `pnpm test` 22 files / 140 tests |
| Production build | **Pass** (1 warning: OG file reads trace the project) | `pnpm build` |
| Journey: details → OTP → 4 questions → 7-zone scan (2 skipped) → assessment → health form → booking | **Pass** (local) | `scripts/_e2e.mjs`, `scripts/journey-check.mjs` |
| Held slot survives refresh | **Pass** | same slot + countdown after reload |
| Consultation payment (demo Razorpay) | see §3a | |
| Forged admin cookie → access-code form | **Pass** | |
| Logged-out `/account` → `/start`; `/book` → `/start`; `/assessment` → 308 | **Pass** | |
| `/r/invalid` → 404; `/concerns/hair_fall` → 308 | **Pass** | |
| Security headers, no X-Powered-By, `/demo` noindex | **Pass** | response headers |
| No horizontal overflow 360/390/768/1280/1536; CTA above fold; 0 text < 12 px | **Pass** | `scripts/_measure.mjs` |
| Homepage < 9,000 / 12,000 px | **Fail** (~12,700 / ~18,800) | needs a client decision (§4) |
| axe automated scan | **Not performed** | `@axe-core/playwright` not installed (needs approval) |
| Real OTP, real payments, video consult, shipping, Android/iPhone devices | **Blocked** | staging keys / devices (docs/18 #12) |
| PageSpeed / CrUX | **Not performed** | run after deploy on the live URL |

## 4. Remaining issues register

| ID | Issue | Impact | Pri | Next action |
|---|---|---|---|---|
| UX-01 | Homepage ~12,700 px desktop / ~18,800 px mobile vs 9,000 / 12,000 target | Long scroll on mobile | P1 | Client decision: move Hair-loss types, What to expect and the Results gallery to /concerns, /how-it-works, /results with teaser cards (≈ −3,500 px) |
| CON-01 / E-01 | No registration number on hero, doctor pages, prescriptions | Telemedicine compliance, trust | P0 | docs/18 #1 |
| SEC-05 | Legal entity / grievance officer unpublished | E-Commerce Rules | P0 | docs/18 #2 |
| SEC-06 | Policies not legally approved | Contract risk | P0 | docs/18 #3 |
| FUN-01 | No WhatsApp number | Main channel missing | P0 | docs/18 #4 |
| CON-02 | Result durations + consent dates | Advertising evidence | P0 | docs/18 #5 |
| BIZ-01 | Analytics dormant | No funnel data | P0 | docs/18 #6 |
| Health form | No pregnancy / breastfeeding / sex-specific question before a finasteride decision | Clinical safety | P1 | Dr. Tyagi to approve the question wording (docs/16 C5) |
| CON-07 | Finasteride solution + label claims | Regulatory | P1 | docs/18 #9 |
| SEC-09, FUN-11, SEC-01 (full) | Real auth, storage, payments, staging | Go-live | P1 | Kit Phase 01–03 after keys |
| PERF-03 | Marketing routes render per request | TTFB/caching | P2 | ISR once settings live in the DB |
| A11Y-06 | No automated contrast/axe pass | Accessibility | P2 | Approve `@axe-core/playwright`, run on routes in audit §I |
| Build | Dynamic file reads in OG cards trace the whole project | Larger server bundle | P3 | Switch OG reads to static imports |
| UX-07 | Guarantee seal ring text renders ~5 px (decorative, aria-hidden) | Visual only | P3 | Redraw the seal |
| Demo | Seeded admin/doctor demo data and `assessment-quiz.tsx` kept unused | Code tidiness | P3 | Delete after client confirms |

## 5. Deployment readiness

- **Demo site (yourhaircompany.com, DEMO_MODE): ready to deploy** once `DEMO_SESSION_SECRET` and
  `DEMO_ACCESS_CODE` are set in Vercel (the build refuses to start without them on a hosted demo).
  Run `scripts/purge-demo-state.mjs` right after the deploy.
- **Paid traffic: not ready** — blocked by the P0 client inputs above (registration number, legal
  entity + grievance officer, legal sign-off, WhatsApp number, analytics IDs, result evidence).
- **Production service (real patients, payments): not ready** — needs the go-live build (real OTP,
  Razorpay, storage, staging end-to-end test), which waits on test keys and an OTP provider.
