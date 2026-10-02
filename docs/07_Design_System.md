# 07 · Design System

Approved direction: **silver, white and metallic black — clinical, not cold.** Premium D2C healthcare, not a hospital site, not a template.
Tokens: `design/tokens.css`. Figma (UI/UX phase) must use the same names.

## 1. Principles
1. **The doctor is the brand.** Real photography of Dr. Tyagi and the products; no stock models.
2. **One idea per screen**, generous white space, strong hierarchy.
3. **Evidence over hype** — ingredients, process, credentials; the guarantee always shown with its conditions.
4. **Mobile first** (most traffic is mobile, many users non-metro on mid-range Android): 16 px gutters, thumb-reach CTAs, small JS on public pages.
5. **Metallic is an accent**, not a surface: gradients on primary CTA (dark backgrounds), hero light, premium cards. Never chrome/glitter effects.

## 2. Colour

| Token | Hex | Use |
|---|---|---|
| obsidian | #121315 | Dark hero, footer, doctor portal sidebar, primary button (light bg) |
| ink-2 / graphite | #1C1E21 / #2A2D31 | Dark cards, borders on dark |
| steel | #8E939A | Icons, rules, disabled |
| platinum | #C9CCD1 | Metallic mid, chart neutral |
| mist | #E6E7E9 | Fills, table headers |
| pearl | #F4F4F2 | Page background |
| card | #FBFBFA | Cards on pearl |
| text-strong / text / muted | #16181B / #4A4E55 / #6B7078 | Headings / body / meta |
| accent | #4E6378 | Eyebrows, links, focus ring |
| success / warning / danger / info | see tokens | Status chips **with words** |

Contrast: body text ≥ 4.5:1 (checked: text #4A4E55 on pearl ≈ 7.6:1; accent on pearl ≈ 5.6:1; muted #6B7078 on pearl ≈ 4.5:1 — muted text only at ≥ 14 px on pearl/card, never on mist); large display ≥ 3:1. All four status pairs ≥ 5:1.
Portals (doctor/sales/admin) use the same palette with a light content area and obsidian sidebar.

## 3. Typography
- **Cormorant Garamond** (500) — display headlines and hero only, ≥ 28 px. Never for UI controls, prices or tables.
- **DM Sans** (400/500/600) — everything else: body, UI, prices, tables, forms.
- Load with `next/font/google` (subset latin, `display: swap`), expose as CSS variables.
- Scale: hero / 3xl / 2xl / xl / lg / base / sm (tokens). Body 16 px minimum; line-height 1.5 body, 1.1 display.
- Eyebrows: 13–14 px, 600, letter-spacing 0.12em, uppercase, accent colour.
- Prices: DM Sans 600, tabular numbers (`font-variant-numeric: tabular-nums`), ₹ with Indian grouping (`₹14,999`).

## 4. Tailwind mapping (v4 `@theme` in `globals.css`)
```css
@import "tailwindcss";
@import "../../design/tokens.css";
@theme inline {
  --color-obsidian: var(--yhc-obsidian);
  --color-graphite: var(--yhc-graphite);
  --color-steel: var(--yhc-steel);
  --color-platinum: var(--yhc-platinum);
  --color-mist: var(--yhc-mist);
  --color-pearl: var(--yhc-pearl);
  --color-card: var(--yhc-card);
  --color-ink: var(--yhc-text-strong);
  --color-body: var(--yhc-text);
  --color-muted: var(--yhc-text-muted);
  --color-accent: var(--yhc-accent);
  --font-display: var(--yhc-font-display);
  --font-sans: var(--yhc-font-sans);
  --radius-card: var(--yhc-radius-lg);
}
```
shadcn/ui theme variables (`--background`, `--foreground`, `--primary`, …) are set to these tokens in `globals.css`.

## 5. Core components (build in Phase 02, document in `/admin/design` playground page)

| Component | Variants / notes |
|---|---|
| Button | primary (obsidian; on dark: silver gradient with obsidian text), secondary (outline steel), ghost, link; sizes sm/md/lg; loading state; min touch 44 px |
| PriceTag | total + per-month + strike-through compare + savings line |
| PlanCard | duration, per-month, total, "Doctor-recommended duration" badge, guarantee line, CTA |
| GuaranteeBadge / GuaranteeTerms | short line + link to full terms; same text everywhere (from active policy) |
| DoctorCard | photo, name, qualifications, registration no., short bio |
| SlotPicker | day tabs (Today/Tomorrow/dates), time chips, "x left", disabled states, sticky continue bar |
| OtpInput | 6 boxes, autofill (`autocomplete="one-time-code"`), resend timer, "Send by SMS" |
| Stepper | booking/checkout steps; mobile compact |
| Countdown | hold timer (mm:ss), warns at 2 min |
| PhotoUploader | guided angles (front hairline, crown, parting) with overlay, compress client-side, retry |
| StatusChip | colour + word + icon (e.g., "Paid · intake done") |
| Timeline | lead/customer timeline items |
| KanbanBoard | CRM stages, drag only for manual stages |
| DataTable | sorting, filters, pagination, column visibility, CSV export |
| KpiTile | value, label, delta with words ("+12% vs last week") |
| EmptyState, ErrorState, Skeleton | every list/screen has all three |
| Toast | realtime alerts in CRM ("₹500 PAID · Rahul · Tue 11:20") |
| Modal/Sheet | sheet on mobile, dialog on desktop |
| Form fields | label above, helper text, error text, required marker; Indian phone input (+91 default) |

## 6. Layout
- Container 1200 px; 12-column grid desktop, 4-column mobile; section spacing 64–96 px desktop, 48 px mobile.
- Portals: sidebar 248 px (collapsible), top bar with search and notifications, content max 1440 px.
- Sticky mobile action bar on site: **WhatsApp** + **Book consultation**.

## 7. Motion
- 150–250 ms ease-out fades and 8–12 px rises on scroll-in (once). One slow metallic light sweep on the hero (≤ 1.5 s, once). No carousels, no parallax, no autoplay video with sound.
- Respect `prefers-reduced-motion` (tokens set durations to 0).

## 8. Imagery
- Doctor: natural light portrait, neutral background, white coat optional; plus consultation-at-desk shot.
- Products: on pearl/mist backgrounds with soft shadow; texture macro; in-hand use.
- Results: only consented, unretouched, same lighting/angle, with "Individual results vary" and duration used.
- Icons: lucide, 1.5 px stroke, steel/obsidian.

## 9. Accessibility
WCAG 2.1 AA; focus ring 2 px accent with 2 px offset; all interactive targets ≥ 44 px; form errors announced (`aria-live`); colour never the only signal; alt text required in CMS; captions for videos.

## 10. Voice & microcopy
- Calm, specific, kind. "Your consultation is confirmed." not "Yay! You're all set!!"
- Name the next step on every screen ("Next: complete your hair profile — 3 minutes").
- Money and dates exact: "₹500 paid · Tue 14 Oct, 11:20 am IST".
- See PRD §15 for banned claims.
