# Phase 02 · Design system & website shell

**Goal:** the public website, built on a reusable component kit, with all pages from FR-M1-1 rendering real (or placeholder) content from the DB and markdown, SEO-ready.
**Depends on:** Phase 01. **Design input:** Figma homepage + product page + booking screens if ready; otherwise follow `docs/07` and the approved deck (`docs/reference/`), and keep visuals easy to restyle.
**FRs:** M1-1, M1-2, M1-3, M1-4 (read side), M1-6, M1-7, M1-8, M1-9, M14-6.
**Time:** ~1 week.

## Tasks
- [ ] **2.1 Plan.** Read `docs/07`, PRD M1, deck slides 9–13. Wait for OK.
- [ ] **2.2 Component kit** (`src/components/ui` shadcn themed + `src/components/shared`): Button variants, PriceTag, PlanCard, GuaranteeBadge/GuaranteeTerms (reads the active policy; renders **nothing** while `guarantee.enabled=false`), DoctorCard, StatusChip, EmptyState/ErrorState/Skeleton, Section, Eyebrow, Container, Stepper, Countdown, OtpInput (UI only), PhotoUploader (UI shell), KpiTile, Timeline, DataTable (TanStack Table). A hidden `/admin/design` playground page renders every component and state.
- [ ] **2.3 Site layout**: header (logo placeholder slot for Capsule Tuft SVG, nav: Plans, Consult, Learn, About; CTA "Book consultation"), footer (legal links, grievance officer, registration no. from doctors table, medical disclaimer, support WhatsApp + grievance officer from public settings — `settings.is_public`, readable with the anon key), sticky mobile bar (WhatsApp + Book), skip link.
- [ ] **2.4 Homepage** sections exactly as FR-M1-2 (guarantee block hidden while `guarantee.enabled=false`), with plans and guarantee from DB, doctor from DB, reviews (approved only), FAQs (top 6). Hero: dark radial gradient, doctor portrait slot, one-time light sweep (respects reduced motion).
- [ ] **2.5 Pages**: About, Meet Dr. Tyagi (`/doctor-tyagi` → from `doctors` + bio_md), Concerns index/detail (`concerns`), Products index/detail (`products`; consultation-only products show "Book consultation to get this prescribed"), Plans (`plans`, per-month + savings computed), How it works, Real stories (`reviews` approved), Blog index/post (`posts` published, markdown via `react-markdown` + `rehype-sanitize`), FAQs (`faqs` grouped), Contact (form posts to `/api/contact` → task; stub ok), Legal (`content/legal/*.md` drafts with `[placeholders]`: privacy, terms, refund-cancellation, shipping, guarantee, medical-disclaimer, grievance). Book page is a placeholder linking to Phase 04.
- [ ] **2.6 Content admin (minimal)**: `/admin/content` CRUD for concerns, FAQs, posts (with `medically_reviewed` toggle required to publish), reviews moderation (approve disabled unless `consent_id`). On save: `revalidatePath`.
- [ ] **2.7 SEO**: `generateMetadata` per page, OpenGraph image route, `sitemap.ts`, `robots.ts`, canonical URLs, JSON-LD (Organization, Physician, Product with `offers` from plans, FAQPage, BreadcrumbList). No medical claims in metadata.
- [ ] **2.8 Analytics & consent**: cookie/consent banner (essential vs analytics/marketing); GA4 + Meta Pixel load only after consent; `lib/analytics.ts` `track(event, props)` with typed event names (`cta_book_click`, `view_plan`, …); first-touch UTM cookie (90 days).
- [ ] **2.9 i18n scaffolding**: all UI strings via `src/i18n/en.ts` dictionary + `t()` helper.
- [ ] **2.10 Performance**: images via `next/image` with sizes; fonts subset; no client JS on static sections; Lighthouse mobile ≥ 90 perf, ≥ 95 a11y on Home/Product/Plans (record scores in PROGRESS.md).
- [ ] **2.11 Tests**: component tests for PriceTag (₹ grouping, per-month), PlanCard savings, GuaranteeTerms flag; E2E: home → plans → product → book CTA visible on mobile.

## Acceptance criteria
1. Every FR-M1-1 page reachable within 2 taps from Home; mobile layout clean at 360 px with 16 px gutters, no horizontal scroll.
2. Editing a FAQ in Admin shows on site within 5 s (revalidation).
3. Registration no. and disclaimer visible in footer on every page.
4. Lighthouse targets met; axe shows no serious violations.
5. No banned claim words in any page or seed content (manual grep until Phase 12 lint).

## Paste-ready prompt
```
Read CLAUDE.md, then phases/PHASE_02_Design_System_Website.md, docs/07_Design_System.md and PRD module M1.
Use the approved deck in docs/reference/ for visual direction. Plan first, wait for OK, then build task by task.
```
