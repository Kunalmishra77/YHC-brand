# YHC — videos & extra images for the cinematic website (Google Flow + ChatGPT)

**For:** the person creating videos (Google Flow / Veo) and images (ChatGPT). **22 Oct 2026.**

Your template sites (Halden, Meridian, Aurelune) look cinematic because each has a short film that
**plays as you scroll**. We do the same: you make the film, I turn it into frames
(`node scripts/video-to-frames.mjs film.mp4 <name>`) and the section switches from its still picture to
the scroll film automatically. The site works today with stills; each film below upgrades one section.

## How to make each film (same for all)
- **Length 8 seconds**, **16:9, 1920×1080** (Flow "landscape"), 24 fps. Export MP4.
- **One continuous shot**, **slow and smooth**, no cuts, **no text, no logos added, no people's faces**.
- **Camera keeps moving in one direction** (orbit or push-in) — scroll will play it forwards and backwards,
  so it must look good at every frame. **Start and end frames must be clean, still compositions.**
- Lighting and palette: warm amber key light + cool steel-blue rim light, deep near-black background,
  soft haze. Premium skincare commercial look.
- **If the YHC bottle/jar is in the shot:** upload the real pack render as the reference image
  (`YHC-assets/YHC_3D_Solution_Men.png` etc.) and say "keep the label exactly as in the reference" —
  check the label in the result; regenerate if it changed.
- Save as `V01.mp4`, `V02.mp4` … in `YHC-assets/videos/` and tell me.

---

## V01 ⭐ — Hero film: the Solution bottle reveal → `hero`
**Where:** homepage hero, act 3 "A plan only if it helps." (pinned while you scroll).
**Reference image:** `YHC-assets/YHC_3D_Solution_Men.png`
```
Premium cosmetic commercial, 8 seconds, one continuous shot. A matte black YHC hair regrowth solution bottle (use the reference image exactly, label unchanged) stands on a dark wet stone plinth. The camera slowly orbits 90 degrees around the bottle from its left side to its front while gently pushing in. Warm amber key light from the right, cool steel-blue rim light from behind, fine water droplets on the stone catching the light, soft drifting haze, a few green leaves at the base. Deep near-black background with a warm glow. Photorealistic, 4K, shallow depth of field, very smooth slow motion. No text, no people.
```
Timeline: 0–2 s bottle in silhouette, rim light only · 2–6 s orbit, label turns into view · 6–8 s front view, still, label readable.
Poster: last frame (front view).

## V02 ⭐ — Science film: from scalp into a living root → `science`
**Where:** homepage "Roots first." (pinned; labels 01/02/03 appear as it plays) and the /science page.
```
Scientific 3D animation, 8 seconds, one continuous camera move. Start above human scalp skin with fine dark hairs, seen at a low angle. The camera smoothly dives down beside one hair, through translucent skin layers, to the hair root deep below: the hair bulb and the small glowing dermal papilla fed by tiny red blood vessels. Elegant translucent tissue, soft steel-blue rim light, warm amber glow at the root, deep near-black background, floating particles. Museum-quality medical visualisation, calm, premium. No text, no labels, no people.
```
Timeline: 0–2 s scalp surface · 2–5 s diving through skin layers · 5–8 s close on the glowing root, still.

## V03 — Ritual film: a few drops on the parting → `ritual`
**Where:** homepage "How it works" (behind the step bar) and product page.
```
Premium skincare commercial, 8 seconds, one continuous shot, extreme close-up. A black glass dropper (no label visible) releases three slow drops of clear serum onto a clean hair parting of dark hair; the drops catch warm light and soak in. The camera slowly pushes in. Warm amber key light, steel-blue rim, soft haze, shallow depth of field, slow motion. No face, no text, no logos.
```

## V04 — Ingredients film: botanicals orbit the capsule jar → `ingredients`
**Reference image:** `YHC-assets/YHC_Mockup_Capsules_Men.png`
```
Premium product commercial, 8 seconds, one continuous shot. The YHC hair regrowth capsules jar (use the reference image exactly, label unchanged) stands on dark stone; fresh amla fruits, bhringraj leaves, ashwagandha roots and amber lac resin pieces float and slowly orbit around the jar in mid-air, turning gently. Camera slowly circles 60 degrees. Warm amber light, steel-blue rim, soft haze, near-black background. Photorealistic, slow motion. No text, no people.
```

## V05 — 3D scan screen recording (real, not generated) → `scan`
Record the real scan on a phone: open yourhaircompany.com → Begin my 3D scan → go through 3 zones.
30–45 s, portrait, screen recording + (optional) a second phone filming the hand holding the phone over
the parting. I will cut it and add captions.

## V06 — Dr. Anil Tyagi intro (real, filmed)
60–90 s, phone on a tripod, window light, plain background. He says in his own words: who he is,
why YHC scans the scalp first, what happens in the 30-minute video call, that treatment is given only
if it can help, and that results vary. No product claims.

---

## Extra images (ChatGPT) — transparent product cut-outs
For floating product effects (ingredients orbit, hero, plans), I need the packs **on a transparent
background**. In ChatGPT, upload the pack render and paste:
```
Remove the background completely and return only the product (bottle/jar) as a PNG with a transparent background. Keep the product, label, text, logo and colours exactly as they are — do not redraw or change anything. Keep the soft natural shadow off. Output 2048 px tall, centred, with a little empty margin around the product.
```
Do this for: `YHC_3D_Solution_Men.png`, `YHC_3D_Solution_Women.png`, `YHC_3D_Tablets_Men.png`,
`YHC_3D_Tablets_Women.png`, `YHC_Mockup_Capsules_Men.png`, `YHC_Mockup_Capsules_Women.png`.
Name them `T01.png` … `T06.png` (same order) and put them in `YHC-assets/generated/`.

## Priority
1. V01 hero film · 2. V02 science film · 3. T01–T06 cut-outs · 4. V03 · 5. V04 · 6. V05/V06 (real).
