# 20 · Visual-first, plain-English redesign brief (21 Oct 2026)

**Why:** the client feels the site is "nothing special". Customers trust what they *see*; few read
long text. Every section must lead with a strong visual, say less, and invite a tap. The English must
be easy for an everyday Indian customer.

## 1. Visual-first rules
- **Every section opens with a visual** (photo, illustration or interactive graphic) that tells the
  story on its own. Text supports the visual, not the other way round.
- **Text budget per block:** a short heading (≤ 8 words) + at most **2 short lines** of body. Move
  detail into tap-to-open (accordion, sheet, hover card) or onto the inner page.
- **Images come from slots:** `import { SLOTS } from '@/lib/slots'` → `SLOTS.H06` etc. Never hard-code
  a path for a slot. Use `next/image` with correct `sizes`. If `slot.illustrative && slot.ready` (or the
  fallback image is an illustrative doctor scene), show a small "Illustrative image" chip.
- **Premium look:** editorial "Hair Bureau" direction already in the site — big serif display words
  (cap 96 px), generous but not empty space, rounded 28 px media, black/pearl palette with steel-blue
  accent, real product packs (black bottles, mint = men, blush = women). Use the tokens in
  `src/app/globals.css`; no new colours.
- **Interactive, tasteful:** hover/tap image zoom and lift, tabs where the *picture* changes, swipe rails
  on mobile, drag-to-compare, small count/fill animations on real numbers only, cursor-free. Use
  `motion/react`; respect `prefers-reduced-motion` (static, fully readable). No autoplaying sound, no
  scroll-jacking, no sticky sections taller than one screen.
- **Mobile first:** design at 390 px first. Thumb-friendly targets (≥ 44 px). Swipe rails instead of
  long stacks. Sections must not get taller than today — aim shorter.
- **Every section ends with one clear action** (usually "Begin my free 3D scan" → `/start`).

## 2. Plain-English rules
- Short sentences (aim ≤ 15 words). Everyday words. Talk to "you". Active voice.
- One idea per sentence. Cut filler ("in order to", "it is important to note").
- Medical words: use the everyday word first, the medical name second only where it helps search —
  e.g. "hair roots getting smaller (miniaturisation)", "sudden shedding (telogen effluvium)". On the
  homepage avoid Latin/biology terms entirely (no "dermal papilla", "anagen", "catagen").
- Numbers as digits, ₹ amounts from settings (never hard-coded).
- Examples: "Assessment first. Treatment only when it can help." → "We check first. We treat only if it
  will help." · "Prescribed after consultation" → "Your doctor decides if you need it."
- Keep the meaning and every safety line: "Individual results vary", guarantee conditions, "not a
  diagnosis", prescription-only notes, finasteride pregnancy note.

## 3. Must not change
- No banned claims: cure, 100%, guaranteed regrowth, permanent, miracle, no side effects, fixed
  timelines, invented reviews. No before/after or "result" imagery except real consented cases.
- No generated doctor face; the real portrait stays.
- Legal pages (`src/server/content/legal.ts`) and consent checkbox wording stay as they are.
- Settings-driven values stay settings-driven. Accessibility from the audit stays (skip link, pause
  buttons, alt text, ≥ 12 px text, inert marquee clones, focus states).
- No new dependencies.
