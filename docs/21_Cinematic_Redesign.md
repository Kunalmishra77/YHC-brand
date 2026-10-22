# 21 · Cinematic redesign brief (22 Oct 2026, ADR-35)

**Why:** the client says the site looks basic, empty in places and crowded in others, with no real
visual effects or interaction. Reference: the client's own template library
`E:\showcase-build` (live: https://showcase-build-tau.vercel.app/<name>/). Screenshots of every
template while scrolling: `C:\Users\monum\AppData\Local\Temp\tpl\<name>\00.jpg …` (1440×900).

## What the templates do (and we copy)
| Pattern | Template | How it works |
|---|---|---|
| Pinned word-story hero | **dewlab** (00–03) | Section pinned ~300vh; a giant serif word changes per scroll third ("One drop." → "Three depths." → "All-day dew."); animated water-caustic light behind; a small side index shows which word is active |
| Scroll-scrubbed product film | **halden**, **meridian** (00–05), aurelune | A short AI film exported to ~190 webp frames, drawn on a canvas by scroll progress; labelled callouts appear at set progress points ("01 · Sapphire crystal") |
| Ritual with step bar | **dewlab** (04–06) | Pinned product; big coloured step word ("Cleanse", "SPF", "Seal"); a segmented progress bar along the bottom; background colour shifts per step |
| Drag before/after | **dewlab** (07) | Big rounded frame, drag handle, checklist beside it, product card with price |
| Image-in-text band | **meridian** (10) | Giant uppercase words filled with a photo (background-clip:text), slow parallax |
| Colour-per-collection carousel | **kanak** (03–05) | Each item gets its own soft background colour; large product; arrows + chips |
| Configurator / "Make it yours" | **meridian** (08–09), melt | Left list of options, centre product, right summary card |
| Giant wordmark footer | **dewlab** (11) | Brand name across the full width at the bottom, gradient fill |
| Smooth scroll | all | Lenis (installed, `src/components/site/smooth-scroll.tsx`) |

## Engine already in the repo
- `src/components/site/scroll-sequence.tsx` — `<ScrollSequence name="hero" progress={mv} poster={img} />`.
  Plays `public/media/seq/<name>/frame_NNNN.webp` + `manifest.json`; shows `poster` until frames exist
  (and always with reduced motion). `scripts/video-to-frames.mjs <video> <name>` creates the frames.
- Image slots `src/lib/slots.ts` (`SLOTS.H01` …) — all 57 generated images are live.
- `motion/react` (`useScroll`, `useTransform`, `useSpring`, `MotionConfig reducedMotion="user"`).

## Rules
- Premium, cinematic, warm: obsidian + pearl + steel-blue tokens (`src/app/globals.css`), warm amber
  light accents allowed (radial glows, not new flat colours). Not flat black, not flat white.
- Every section: one strong visual + motion, ≤ 2 short lines of text, one action.
- Pinned/scroll-story sections only on ≥ lg and only when motion is allowed; phones get a stacked,
  swipeable, still-animated version. Never trap scroll; every pinned section ≤ 300vh.
- Keep: client-approved headline "Hair care begins with science, not with products." visible on the
  first screen with the start form (conversion); plain English; safety lines; a11y (alt, focus,
  ≥ 12 px text, reduced motion = static & readable, pause controls for video); no banned claims; no
  fake numbers/reviews/results; "Illustrative image" chips via `illustrativeNote()`.
- Performance: images via next/image with `sizes`; canvases only when in view; no new dependencies.
- Spacing: no plain band > 220 px; no cramped clusters. Section rhythm `SECTION_Y` (56/80 px).
