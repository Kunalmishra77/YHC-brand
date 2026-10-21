> **Images: use [YHC_IMAGE_PROMPTS.md](YHC_IMAGE_PROMPTS.md)** (21 Oct 2026) — the complete, simpler list of all 58 website images with copy-paste prompts and file names. This file stays the reference for **videos** (Google Flow), real-shoot briefs and the audit asset IDs (E-01…E-22).

# Your Hair Company — Asset Generation Prompts & Shoot Briefs

For: the project owner (generating images in **ChatGPT** and videos in **Google Flow / Veo**) and the developers who integrate them.
Site: yourhaircompany.com · Covers audit items **E-01 to E-14** (`docs/17_Audit_Master_Checklist.md`) plus extra assets **E-15 to E-22**, each tied to a real page/section in `src/app/(site)`.

How to use this file
1. Read **Rules** and the **YHC house style** blocks once.
2. For each asset, copy the prompt. Where it says `[HOUSE-PHOTO-DARK]` etc., paste that block from §2 in its place (or keep the expanded prompt as written; most prompts already include it).
3. Generate, run the QA checklist (§6.6), hand the file to developers with its filename from the table in §5.

---

## 1. Rules (apply to every asset — no exceptions)

1. **No doctor likeness.** Never generate Dr. Anil Tyagi, any real doctor, or anyone presented as "our doctor". Doctor-related imagery is faceless (hands, coat sleeve, desk) and the site shows an **"Illustrative image"** chip on it. These must be **real, never generated**: E-01 Dr. Tyagi portraits, E-03 doctor video, E-04 pack photography, E-05 before/after. They get a shoot brief, not a prompt.
2. **No implied results.** Never generate patient results, before/after, "regrowth" transformations, or people with conspicuously thick/lush hair near a product (ASCI code; Drugs and Magic Remedies (Objectionable Advertisements) Act). No testimonials, no fake credentials, certificates or badges. **No invented packaging:** if a product appears, upload the real render from `public/media/products/` as a reference image and keep the label unchanged — otherwise keep products out of frame. The Hair Regrowth Solution contains finasteride (prescription only): never show it in a "buy now / everyday cosmetic" context.
3. **No text in generated images.** No words, letters, numbers, logos, watermarks, UI text or fake labels. The website overlays all copy; leave the negative space described per asset.
4. **People:** diverse Indian adults only where people are needed. Faces only in lifestyle/journey scenes that are clearly not patients or doctors — and even then prefer over-shoulder or hands-only. No identifiable faces in anything scalp-related.
5. **Videos:** silent (no music, no narration) unless stated. The site always plays video **muted**, never autoplays with sound, shows a Pause button, and shows the **poster image instead of the video** for `prefers-reduced-motion` and data-saver (`src/components/site/background-video.tsx`). Background loops must loop seamlessly. Every video needs a poster.
6. **Copy rules apply to anything spoken or captioned** (PRD §15): no "cure", "100%", "guaranteed regrowth", "permanent", "miracle", "no side effects", fixed timelines, invented reviews. The guarantee is only mentioned together with its conditions — and is better left out of media entirely (it can be switched off in settings).
7. **Don't change medical wording, prices, guarantee terms or legal text** in captions/scripts without the client's sign-off.

---

## 2. YHC house style (reusable blocks)

Brand source of truth: `design/tokens.css`, `docs/07_Design_System.md` §8, `src/lib/brand-media.ts`.
Palette: obsidian `#121315`, ink `#1c1e21`, graphite `#2a2d31`, steel `#8e939a`, platinum `#c9ccd1`, mist `#e6e7e9`, pearl `#f4f4f2` (logo light uses `#f5f3ee`), steel-blue accent `#4e6378` / on dark `#aebbc8`. Product line colours: **mint label = men, blush label = women**, black bottles/jars. Type (for reference only — never rendered in images): Cormorant Garamond display + DM Sans.

**[HOUSE-PHOTO-DARK]** — editorial stills on dark sections
> Premium editorial photograph for a doctor-led dermatology clinic. Calm, quiet, clinical-luxury mood. Low-key lighting: a single large soft key light from the upper left, deep falloff into near-black (#121315) shadows, subtle cool steel-blue rim light (#aebbc8). Desaturated, near-monochrome palette of obsidian, graphite, steel grey and platinum with at most one muted accent. Fine film grain, crisp micro-detail, shallow depth of field, 85 mm or 100 mm macro look. Real materials: matte stone, brushed steel, clear glass, white cotton. Photorealistic, not CGI, not glossy advertising. Generous clean negative space. Absolutely no text, letters, numbers, logos or watermarks anywhere.

**[HOUSE-PHOTO-LIGHT]** — editorial stills on pearl/light sections
> Premium editorial photograph for a doctor-led dermatology clinic. Bright, soft, even north-window daylight, very gentle shadows. Pearl (#f4f4f2), mist (#e6e7e9) and platinum (#c9ccd1) surfaces, matte textures, a hint of cool steel blue. Desaturated and calm, high-end healthcare editorial, photorealistic, fine grain, shallow depth of field. Generous clean negative space. Absolutely no text, letters, numbers, logos or watermarks anywhere.

**[HOUSE-ILLUSTRATION]** — flat/line illustration set
> Minimal editorial line illustration. Single-weight rounded strokes (equivalent to 1.5 px at 24 px icon scale) in obsidian #121315 with flat fills in mist #e6e7e9 and platinum #c9ccd1, one accent of steel blue #4e6378 used sparingly. Plenty of white space, transparent or pearl #f4f4f2 background. People are abstract and faceless: simple rounded head shapes with no eyes, nose or mouth, no hair detail. No gradients, no 3D, no shadows except one flat offset tone. Consistent stroke weight, consistent corner radius, centred composition with even margins. Absolutely no text, letters, numbers, UI labels or logos.

**[HOUSE-MOTION]** — Google Flow / Veo b-roll
> Cinematic macro b-roll for a premium dermatology clinic. Dark, calm, scientific. Near-black background (#121315), cool steel-blue and platinum light, slow and continuous motion only (slow dolly or slow drift, no cuts, no shake, no zoom punches). Shallow depth of field, soft bokeh, fine grain, photorealistic. No people, no faces, no text, no logos, no UI. No audio: silent.

**[NEGATIVE-COMMON]** — append to every prompt (ChatGPT has no negative field, so add as a sentence: "Avoid: …")
> Avoid: any text, letters, numbers, labels, logos, watermarks, signatures; faces or identifiable people; doctors' faces; before/after or split comparisons; thick glossy "shampoo-ad" hair; bald-head shock imagery; pills spilling dramatically; syringes, needles, blood; medical certificates, badges, seals, star ratings; invented product packaging or bottles; extra or malformed fingers; plastic CGI look; oversaturated colours; lens flare; busy backgrounds.

Consistency across the set
- Generate assets of the same group in **one ChatGPT conversation**, and after the first good result say: "Keep exactly this lighting, palette, grain and lens for the next images."
- Dark-section stills are shown **in greyscale by CSS** in some places (`why-choose.tsx` applies `grayscale`), so judge contrast in black-and-white too.
- Keep horizons, light direction (upper left) and colour temperature identical within a set.

---

## 3. Images

Output pipeline for every image (unless stated): generate the largest size ChatGPT offers in the closest aspect (1536×1024 landscape, 1024×1536 portrait, 1024×1024 square) → upscale only if needed with a neutral upscaler → crop to the exact size → export **WebP, quality 80–85, sRGB, metadata stripped** → keep under the target KB. Developers can run the same step with sharp (see §6.4).

---

### E-01 — Dr. Anil Tyagi portrait set — **Must be real — do not generate**

- **Where:** home §5 "Dr. Anil Tyagi and his treatments" (`src/components/home/doctor-feature.tsx`), `DoctorCard` (`src/components/site/doctor-card.tsx`), `/doctor-tyagi` hero, `/book`.
- **Problem:** one interim portrait exists (`public/media/img/dr-anil-tyagi.webp`, 1000×1211, 48 KB) — needs a full, consistent set plus a caption with his registration number.
- **Deliverables:**
  | Shot | Use | Size |
  |---|---|---|
  | A. Formal portrait, three-quarter, white coat, looking at camera, gentle smile | Doctor feature, /doctor-tyagi hero | 4:5, 1600×2000 |
  | B. Same as A, head-and-shoulders | DoctorCard, /book | 1:1, 1200×1200 |
  | C. At desk, reviewing a scan on a monitor/tablet (screen blank or showing a neutral scalp macro — no patient data, no names) | /doctor-tyagi "What a consultation covers" | 4:5 1600×2000 + 4:3 1520×1140 |
  | D. At desk, speaking towards a laptop as if on a video consult (screen faces away) | /book, /how-it-works | 4:5 + 4:3 |
  | E. Detail: hands with a dermatoscope / writing notes (no readable text) | Spare / editorial | 4:3 |
- **Framing:** subject on the **right third** in 4:5 shots, eyes at upper third, ~30% clean space on the left for overlaid text; 1:1 centred. Shoot wider than needed (crop room).
- **Lighting:** large soft key (softbox/window) camera-left, fill at −1.5 stops, subtle rim; background plain mid-grey or a tidy clinic wall in pearl/grey tones (no posters, certificates, brand logos or devices with visible brand names).
- **Wardrobe:** white coat or dark suit; no visible logos; stethoscope optional.
- **Specs:** full-frame or good APS-C, 85 mm, f/2.8–4, ISO ≤ 400, RAW. Deliver unretouched + lightly retouched (skin tone only, no reshaping). Colour-graded neutral to match `[HOUSE-PHOTO-LIGHT]`.
- **Caption needed from client:** full name, qualifications, State Medical Council + **registration number** exactly as registered. Written consent from Dr. Tyagi for web use.
- **Files:** `public/media/img/dr-anil-tyagi-formal.webp`, `-formal-square`, `-desk-review`, `-desk-consult`, `-hands` (q85, ≤ 180 KB each).

---

### E-02 — Phone scan screen recording (30–45 s)

- **Where:** home §3 "Take your scalp scan" (`src/components/home/scan-invite.tsx`), `/how-it-works`, `/start` intro, social.
- **Purpose:** show the real 7-zone guided scan so visitors know what to expect before tapping "Start" — reduces drop-off at the camera permission step.
- **Formats:** 9:16 1080×1920 (mobile/social) and 16:9 1920×1080 (desktop). Captions **burned in** for social use; for the website also deliver a `.vtt` so captions can be rendered in code. Max **3 MB** each.

**Before recording**
- Use a **staging/demo environment**, not production, and a test account — no real customer data on screen.
- The camera preview shows a real scalp: use a **consenting team member** (written consent), not a patient. Keep the face out of frame for every zone (camera close to the scalp). Clean, dry, unstyled hair; no product applied.
- Phone: recent iPhone or Android, brightness 80%, Do Not Disturb on, full battery icon, time set to 10:00, notifications off, browser in a clean tab (no other tabs/bookmarks bar visible). Room lit by soft daylight.

**Capture script** (target 40 s; the app's own copy appears on screen — don't change it)
| Time | Screen | Burned-in caption (bottom, 2 lines max) |
|---|---|---|
| 0:00–0:03 | `yourhaircompany.com` home, tap "Start your free scan" | Free guided scalp scan, on your phone |
| 0:03–0:06 | How-to sheet (`how-to-sheet.tsx`), scroll once | Good light, dry hair, about arm's length |
| 0:06–0:08 | Camera permission → allow | Photos are used only for your assessment |
| 0:08–0:12 | Zone 1 | 1/7 Forehead – Left · left temple and hairline |
| 0:12–0:16 | Zone 2 | 2/7 Forehead – Centre · middle of the hairline |
| 0:16–0:20 | Zone 3 | 3/7 Forehead – Right · right temple and hairline |
| 0:20–0:24 | Zone 4 | 4/7 Top of head · between hairline and crown |
| 0:24–0:28 | Zone 5 | 5/7 Crown · the swirl at the top-back |
| 0:28–0:32 | Zone 6 | 6/7 Parting · along your usual parting |
| 0:32–0:36 | Zone 7 | 7/7 Back of head · above the neck |
| 0:36–0:40 | Review/complete screen | A dermatologist reviews your scan before anything is suggested |

Zone wording matches `ANGLE_LABEL` / `ZONE_HINT` in `src/lib/journey/labels.ts`. If you add a closing card, use only approved copy (e.g. the headline "Hair care begins with science, not with products."). Confirm with the client before mentioning the consultation fee (it comes from settings and can change).

**How to record**
- iPhone: Settings → Control Centre → add Screen Recording; long-press it, microphone **off**; start, wait for the 3-second countdown, perform the script; trim later.
- Android: Quick Settings → Screen record → "Record audio: off", "Show touches: on" (helps viewers follow taps).
- Do 3 takes; perform at a calm pace; pause ~1 s on each zone after capture so the success state is visible.

**Editing**
- 9:16: the raw recording, trimmed. Captions in DM Sans-like sans, 44–48 px, pearl `#f4f4f2` on a 60% obsidian rounded bar, inside the bottom safe area (keep 220 px from the bottom and 160 px from the top clear of platform UI).
- 16:9: the phone recording inside a simple device frame (thin graphite bezel, no brand-specific phone model), placed at **62% horizontal**, on an obsidian `#121315` background; captions left-aligned in the left 45%.
- Optional bookends from the Flow clip below (≤ 3 s each, dissolve 0.5 s).
- Tools: CapCut, DaVinci Resolve or iMovie (no new project dependency).

**Export:** H.264 High, 30 fps, 1080×1920 / 1920×1080, CBR/2-pass ~550 kbps video (40 s ≈ 2.8 MB), **no audio track**, `+faststart`. Also a WebM VP9 version (§6.5). Poster = the Zone 5 frame. Captions file `scan-walkthrough.en.vtt`.

**Optional Google Flow bookend (4–6 s, 9:16 and 16:9)**
> [HOUSE-MOTION] Over-the-shoulder close-up from behind and slightly above a person's head: two hands hold a plain dark smartphone (no logo, screen shows only a soft blank glow) a few centimetres above the crown of short dark hair, the phone slowly lowering towards the scalp. We never see the face — only the back/top of the head, shoulders in a plain grey t-shirt, hands and phone. Soft daylight from a window on the left, room behind deeply out of focus in graphite and pearl tones. Camera: very slow push-in, 5 seconds, ending with the phone screen filling the centre of the frame (this frame will dissolve into the screen recording). Natural skin tones, Indian adult, realistic hands with five fingers each. Silent.
>
> Avoid: faces, mirrors showing a face, text or UI on the phone screen, brand logos, thick glossy hair, bald-head imagery, fast motion, cuts, music, speech.

Use Flow's "Frames to video" with an end frame that is a blank glowing phone screen so the dissolve into the recording is clean.

---

### E-03 — Doctor introduction video (60–90 s) — **Must be real — do not generate**

- **Where:** `/doctor-tyagi` hero/intro, home §5 doctor feature (click-to-play, never autoplay), `/book` sidebar.
- **Purpose:** trust — who Dr. Tyagi is and how the consult works, in his own voice.

**Script outline (≈ 160–200 words; Dr. Tyagi to say it in his own words; legal/medical sign-off before shooting)**
1. (0–10 s) Name, that he is a dermatologist, years of practice and registration (as provided by him).
2. (10–30 s) Why scalp first: "Hair loss has different causes. Before suggesting anything, I want to look at your scalp and your history."
3. (30–55 s) What the consult covers: he reviews the scan and health form beforehand, the video call, explains what is likely going on in plain words, answers questions.
4. (55–75 s) Honesty: "Not everyone needs treatment. If I don't think treatment can help, I'll tell you." "Every person responds differently, and some treatments need a prescription and follow-up."
5. (75–90 s) Next step: "If you'd like, start with the free scan and book a consultation."
- **Do not say:** cure, guaranteed, permanent, 100%, miracle, no side effects, "results in X weeks", product names as a promise, the guarantee (unless with full conditions and client approval).

**Production**
- Framing: 16:9 4K master, medium close-up, subject on the right third looking slightly off-lens (interview style) **or** to camera; second angle 9:16-safe (centre). Also a 1:1 crop-safe composition.
- Location: tidy consultation room or plain grey backdrop; no certificates, posters, or branded devices in shot.
- Light: soft key 45° camera-left, fill, hair light; 5000–5600 K.
- Audio: lavalier + backup recorder; quiet room. **This video has narration** — it must never autoplay; play on click with sound.
- Captions: always on by default on the site; deliver `doctor-intro.en.vtt` (and Hindi `.hi.vtt` if requested). Full **transcript** below the player (WCAG).
- B-roll (optional, real): his hands with a dermatoscope, reviewing a neutral scalp macro on screen (no patient identifiers).
- **Export:** H.264 1920×1080, 30 fps, ~3–4 Mbps, AAC 128 kbps, `+faststart`; plus 1280×720 version ~1.5 Mbps for mobile. Consider hosting on a video CDN/YouTube unlisted if > 10 MB. Poster: a calm frame of him mid-sentence (real frame), `poster-doctor-intro.jpg`.
- Consent: written consent from Dr. Tyagi for web/social use.

---

### E-04 — Pack photography + lifestyle composites

**Part A — real pack photography — Must be real — do not generate**
- **Where:** `/products/[slug]` gallery (`src/components/site/product-gallery.tsx`), product tiles, home §10 Ingredients.
- **Status:** client renders exist (`public/media/products/*-0…4.webp`, front of pack). Real photography still needed for trust (audit CON-06).
- **Shot list per product (8 packs: 4 products × men/women):** front (straight, label centred), back label (for internal record — back labels are **not** published until the claims review in ADR-32 clears), in hand (Indian adult hand, neutral skin, no rings, nails clean; no face, no hair in frame), open pack showing the dropper / tablet / capsule / powder texture.
- **Framing:** 4:5 1600×2000, product centred at 55–60% of frame height, 12% margin all round, label perfectly legible and level.
- **Background:** pearl `#f4f4f2` seamless and mist stone; plus one obsidian set to match the existing renders.
- **Light:** large softbox overhead-left, white bounce right, polariser to control glare on black packs; tethered, f/8–f/11, focus-stack if needed.
- **Files:** `public/media/products/<product>-<line>-photo-<n>.webp` (e.g. `solution-men-photo-front.webp`), q85, ≤ 200 KB.

**Part B — lifestyle composites with the REAL pack (ChatGPT)**
Upload the matching render as the reference image (e.g. `public/media/products/solution-women-0.webp`). Start each prompt with:

> "Use the uploaded product exactly as it is. Do not redraw, re-letter, recolour or reshape the bottle/jar or its label. Keep the label fully legible and unchanged; do not add any other text."

**E-04-B1 Bathroom shelf** (4:5, 1600×2000)
> Use the uploaded product exactly as it is — do not redraw, re-letter, recolour or reshape it or its label, and add no other text. Place it on a matte pale-grey stone shelf in a calm, minimal Indian bathroom: textured lime-plaster wall in pearl and mist tones, a folded white cotton towel, a small ceramic dish, one sprig of green leaves. Soft morning daylight from the upper left, gentle shadow to the right. Product at the lower centre, occupying about 40% of the frame height; the top 35% of the frame is clean wall for overlaid text. Photorealistic, premium editorial, desaturated, fine grain. No people, no hands, no mirror reflections of people, no hair. Avoid: any extra text or labels, invented packaging, other brands' bottles, before/after imagery, clutter, oversaturation.

**E-04-B2 Vanity / dressing table** (4:5) — women's packs
> Use the uploaded product exactly as it is — do not redraw, re-letter, recolour or reshape it or its label, and add no other text. Set it on a pale travertine vanity tray beside a ceramic bowl, a linen cloth and a few dried blush flowers, against a soft blush-and-pearl wall. Warm-neutral window light from the left. Product slightly right of centre; the left 40% of the frame stays calm and empty for text. Photorealistic, quiet luxury, no people, no hands, no hair, no mirror. Avoid: extra text, logos, invented bottles, make-up brands, glitter, oversaturated pink.

**E-04-B3 Travel kit** (4:5 and 1:1 1200×1200)
> Use the uploaded product exactly as it is — do not redraw, re-letter, recolour or reshape it or its label, and add no other text. Top-down flat lay on a graphite linen surface: an open dark-grey canvas travel pouch, the product lying beside it, a folded white cotton cloth, a plain notebook (blank cover), a pair of plain earphones. Even soft overhead light, gentle shadows. Product in the right half; the left half is uncluttered surface for overlaid text. Photorealistic, minimal. No people, no hands, no hair, no passport or documents with text. Avoid: any text, logos, invented packaging, phone screens.

- Generate men's variants on graphite/stone with sage-green accents, women's on pearl/blush.
- **Rule:** the Solution is prescription-only — use B1–B3 for the Tablets/Capsules/Powder first; use the Solution only on its own product page, never in ads.
- **Files:** `public/media/products/<product>-<line>-lifestyle-<shelf|vanity|travel>.webp`, q82, ≤ 220 KB.
- **QA:** compare the label pixel-for-pixel against the render; reject any image with changed letters, colours or added text.

---

### E-05 — Consented before/after sets — **Must be real — never generated**

- **Where:** home §8 "Before & after" (`src/components/home/results-marquee.tsx`), `/results` gallery; data in `src/server/content/results.ts`.
- **Status:** 5 consented pairs exist in `public/media/results/` (faces cropped via `scripts/results-crops.mjs`); **durations and consent references still missing** (`TODO(client)` in `results.ts`).

**Consent protocol**
- Written, specific consent for marketing use on the website/social, signed and dated; states faces will not be shown, that photos are unretouched, and how to withdraw. Store the form reference (not the form) with each set.
- Patient ≥ 18; no sales staff involved in collecting clinical photos.

**Capture protocol (both visits identical)**
- Same camera/phone model, same distance (use a marked floor spot and a 50 cm string or tripod), same lens (1×), flash off.
- Same lighting: diffuse 5000 K, two lights at 45°, no window light; same plain mid-grey backdrop.
- Hair dry, clean, unstyled, no fibres/sprays/oils; same parting; same haircut length where possible.
- Views (match `ResultView`): **Top-front**, **Side** (left and right), **Crown**; camera at the same height/angle each time (use the scan app's zone guides as reference).
- Record: dates of both photos, **months between them**, treatment used (as prescribed), adherence notes, any other treatment.
- Never retouch, re-light, sharpen differently, or colour-correct one image of a pair differently. Crops/resizing only.
- On the site every set shows "Individual results vary" and the duration.

---

### E-06 — Open Graph images (1200×630) — **Generated in code by developers**

- **Where:** `opengraph-image.tsx` route files using `next/og` for `/` , `/science`, `/results`, `/products/[slug]`, `/concerns/[slug]`, `/blog/[slug]`.
- **Status:** not implemented yet (no `opengraph-image*` files in `src/app`; blog pages currently reuse article images). **Pending (dev).**
- Text (title, logo) is rendered by code. Optional background art only:

**E-06 background prompt** (generate 1536×1024, crop to 1200×630)
> [HOUSE-PHOTO-DARK] Abstract background plate: an extreme macro of fine hair strands and scalp texture dissolving into soft steel-blue bokeh on the right third of the frame, the left 60% of the frame a smooth, nearly flat obsidian #121315 gradient with subtle grain (space for a title). Horizontal 1.9:1 composition. Avoid: any text, logos, faces, products, before/after.

- Variants: `og-bg-science` (cool cellular bokeh instead of hair), `og-bg-results` (very soft platinum gradient only — no hair, no people, to avoid implying results).
- **Format:** JPG q80 (Satori/`next/og` handles PNG/JPEG reliably; avoid WebP here), ≤ 150 KB, `public/media/og/og-bg-<name>.jpg`. Product OG uses the real pack render on the right; never a generated pack.

---

### E-07 — "What happens in the consult" — 3-panel illustration

- **Where:** `/book` (above or beside `BookingFlow`, `src/components/booking/booking-flow.tsx`) and `/plans` intro section ("Plans are prescribed after your consultation"), `src/app/(site)/plans/page.tsx`.
- **Purpose:** remove uncertainty before paying for the consult: what the doctor does, what the call is, what you get after.
- **Size:** 3 × 1:1, generate 1024×1024 each with **transparent background**; displayed ~240–320 px. Panels sit in a row on desktop, stacked or horizontally scrolled on mobile; captions are HTML below each panel.
- **Recommended route:** use the PNGs as art direction, then a developer/designer traces them to SVG (Figma or Illustrator Image Trace; clean up nodes) so stroke colour can follow tokens. If tracing is not possible, ship as WebP with transparency.

Run all three in one conversation. First message:
> I'm creating a set of three matching square illustrations. Style for all three: [HOUSE-ILLUSTRATION]. Transparent background, square, subject centred with 12% margin. I'll describe each panel; keep the style, stroke weight, palette and character design identical across all three.

**Panel 1 — Doctor reviews scan and form**
> Panel 1: an abstract faceless figure in a simple white coat seen from behind/three-quarter, seated at a desk, looking at a large monitor that shows a simple line drawing of a top-down head outline with seven small dots on it (no text), and beside the monitor a clipboard with a form drawn as blank lines and checkboxes (no letters). A small stethoscope lies on the desk. Calm, orderly.

**Panel 2 — The video call**
> Panel 2: a laptop seen from slightly above, its screen showing a split video call: one window with an abstract faceless figure in a white coat, a smaller picture-in-picture window with an abstract faceless person in casual clothes. A small speech bubble with three dots (no letters) between them. A cup and a plant at the side. Same style as panel 1.

**Panel 3 — Plan on WhatsApp**
> Panel 3: a hand holding a simple smartphone; the screen shows a generic chat thread drawn as rounded message bubbles with blank lines (no letters, no app logo, not WhatsApp-branded), one bubble containing a small document icon and one containing a calendar icon with a tick. Beside the phone, a small closed parcel box with no labels. Same style as panels 1 and 2.

- **Negative:** [NEGATIVE-COMMON] plus: no WhatsApp logo or green brand colour, no real app UI, no faces, no prices, no pill bottles.
- **Files:** `public/media/illustrations/consult-step-1-review.webp` / `-2-call` / `-3-plan` (or `.svg` after tracing), ≤ 40 KB each (WebP) / ≤ 12 KB (SVG).
- **Alt:** "Illustration: the doctor reviews your scan and health form before the call" / "Illustration: a one-to-one video consultation" / "Illustration: your plan and next steps sent on WhatsApp". Illustrations of a doctor are clearly drawings — no "Illustrative image" chip needed.

---

### E-08 — Cart / checkout empty state + 3-step strip

- **Where:** empty cart (`EmptyState` "Your cart is empty" in `src/components/checkout/cart-view.tsx`, shared component `src/components/shared/states.tsx`) and the checkout progress strip (`src/components/checkout/checkout-flow.tsx`).
- **Purpose:** friendly, on-brand empty state that points people back to the scan/consult rather than to products.
- **Sizes:** empty-state 1:1 (generate 1024×1024, display ~160–200 px); 3-step strip = 3 small 1:1 icons (display 48–64 px).

**E-08a Empty cart**
> [HOUSE-ILLUSTRATION] A single small illustration: an empty minimal tote bag with soft folds, standing upright, with a gentle steel-blue circular "scan ring" outline (two concentric thin circles) behind it, and a tiny leaf sprig beside it. Calm and reassuring, lots of white space, transparent background, centred. Avoid: products, bottles, pills, sad faces, text, price tags.

**E-08b Step strip (3 icons, same conversation)**
> [HOUSE-ILLUSTRATION] Three matching square icons, same stroke and size, transparent background: (1) a simple shopping bag with a check mark; (2) a delivery address pin over a simple folded map; (3) a shield with a small lock, for secure payment (no card brand logos, no numbers). Icon-like, centred, 15% padding.

- **Note:** if lucide icons already cover the strip (house style: lucide 1.5 px, `docs/07` §8), prefer them and generate only E-08a.
- **Files:** `public/media/illustrations/empty-cart.webp` (≤ 25 KB) / traced `.svg`; `checkout-step-1-bag`, `-2-address`, `-3-secure`.
- **Alt:** empty state is decorative (`alt=""`) because the heading says "Your cart is empty".

---

### E-09 — Replace the stock doctor image in "Considered" (Why choose)

- **Where:** home §4 Why choose, split 1 "One to one · on video" — `SplitImage image={CLINICAL.consultNotes} caption="Illustrative image"` in `src/components/home/why-choose.tsx`. Current file `public/media/img/consult-notes.webp` (Unsplash stock, doctor across a desk from a patient). Also used on `/how-it-works` intro.
- **Problem:** stock image of an unknown doctor + patient sits right next to "With Dr. Anil Tyagi" — reads as if it were him. **A real clinic photo (E-01 shot C/D) is the preferred fix.** Until then, use a faceless still life.
- **Size:** 4:3 1520×1140 (desktop column fills 50% width at `min-h-[36rem]`; phones 4:3, `sm` 16:10). Keep the subject in the **central 70%** so both crops work. CSS renders it **greyscale** — design for black-and-white. The "Illustrative image" chip sits **bottom-left**: keep that corner calm.

**Prompt — variant A (preferred: no person)**
> [HOUSE-PHOTO-DARK] Black-and-white-friendly editorial still life of a doctor's consultation desk, seen from a 30° high angle: an open laptop facing slightly away from the camera with its screen showing only a soft, out-of-focus blue-grey glow (no face, no interface), a clipboard with a printed history form (lines and boxes only, completely unreadable, no letters), a fine pen resting across it, a stethoscope coiled beside it, a ceramic cup. Matte dark-grey stone desk, deep shadows, soft key light from the upper left. Composition centred, objects occupying the middle 70%, calm empty bottom-left corner. Landscape 4:3. Photorealistic. Avoid: any readable text or numbers, logos on the laptop, people, faces, hands, pills, syringes, certificates.

**Prompt — variant B (hands only)**
> [HOUSE-PHOTO-DARK] Close editorial photograph across a dark consultation desk: only the forearms and hands of a clinician in a crisp white coat sleeve, making notes with a pen on a clipboard form (lines and checkboxes only, no legible text), an open laptop at the right edge with an out-of-focus blank glow, a stethoscope on the desk. No face, no shoulders, nobody else in frame. Indian skin tone, realistic hands with five fingers, no rings or watch brands. Soft light from the upper left, deep shadows, landscape 4:3, subject centred in the middle 70%, calm bottom-left corner. Avoid: faces, readable text, logos, patient in frame, pills, syringes.

- **Label:** keep the existing "Illustrative image" chip (variant B is mandatory; variant A recommended for consistency).
- **Alt:** A: "Illustrative image: a consultation desk with a laptop, a history form and a stethoscope". B: "Illustrative image: a clinician's hands taking notes on a history form, face not shown".
- **File:** `public/media/img/consult-desk.webp`, q82, ≤ 120 KB.

---

### E-10 — Replace the hands-on-scalp image

- **Where:** home §4 Why choose, split 2 "Step zero · Scalp first." (`SplitImage image={CLINICAL.scalpExam}` in `why-choose.tsx`, shown left of/above dark text panel); also `/doctor-tyagi` "What a consultation covers" and the scan explorer. Current `public/media/img/scalp-exam.webp` is stock and 234 KB.
- **Purpose:** show *our* scan — a phone held close to a parted scalp — not a generic exam. The scan-ring guide overlay is drawn in code (`ScanRings`), so the image itself stays clean.
- **Size:** 4:3 1520×1140, greyscale in CSS; subject centred (phone + parting in the central 60%); keep the right edge calm on desktop (it meets the obsidian text panel).

**Prompt**
> [HOUSE-PHOTO-DARK] Realistic close-up photograph looking down at the top of a person's head of dark, medium-density hair with a neat centre parting, seen from above and slightly behind. One hand gently holds a plain dark smartphone (no logo) about 10 cm above the parting, its camera side toward the scalp; the phone screen is not visible. The face is not in frame — only the top of the head, part of a shoulder in a plain grey t-shirt, the hand and phone. Soft directional light from the upper left that makes individual hair roots along the parting visible, deep background falloff to near-black. Natural, ordinary hair — neither thick and glossy nor visibly balding. Indian adult, realistic hand with five fingers. Landscape 4:3, the parting and phone in the central 60% of the frame. Photorealistic, black-and-white friendly. Avoid: faces, mirrors, text, logos, UI on screen, gloves, medical devices, thick glossy hair, bald patches, before/after.

- **Label:** add `caption="Illustrative image"` to this `SplitImage` (people are shown).
- **Alt:** "Illustrative image: a phone held close to a hair parting to scan the scalp".
- **File:** `public/media/img/scan-session.webp`, q80, ≤ 140 KB.

---

### E-15 — Concern page hero images (5) — *new*

- **Where:** `/concerns/[slug]` header (`src/app/(site)/concerns/[slug]/page.tsx`): right half on `md+`, currently **every concern shows the men's Solution pack** (`IMAGES.heroStage`) — a product as the hero of a medical-condition page is the wrong signal and repeats the same image 5×.
- **Size:** 4:5 1600×2000 (the column is `w-1/2`, full height, `object-cover`; a gradient from obsidian covers the **left 40%** of the image — keep the subject in the **right 55%**). Hidden on phones, so no mobile crop.
- **Rule:** describe the area, never a result. Ordinary, mild presentation; no "after" looks, no shock imagery. No faces.

Common start: `[HOUSE-PHOTO-DARK] Portrait 4:5 editorial macro, subject placed in the right 55% of the frame, the left side falling into soft obsidian darkness. No face visible.`

| Slug (file) | Prompt continuation |
|---|---|
| `hair_fall` → `concerns/hair-fall.webp` | "A few shed hair strands resting on a dark slate surface beside a wide-tooth wooden comb, side light catching each strand, very shallow depth of field." |
| `thinning` → `concerns/thinning.webp` | "Top-down macro of a centre parting in dark hair of ordinary density, the scalp line gently visible, soft side light revealing the roots; calm, clinical, not dramatic." |
| `receding_hairline` → `concerns/receding-hairline.webp` | "Three-quarter rear view of a man's temple area and hairline edge at the side of the head, cropped above the eyebrow line so no face features are visible, soft rim light along the hairline." |
| `crown_thinning` → `concerns/crown-thinning.webp` | "Directly overhead macro of the crown swirl of short dark hair, the natural whorl pattern visible, soft top light; ordinary density, not bald." |
| `dandruff_scalp` → `concerns/dandruff-scalp.webp` | "Extreme macro of scalp skin texture between hair roots, a few fine flakes, cool steel-blue rim light, tasteful and clinical." |

- **Negative:** [NEGATIVE-COMMON] plus: no eyes, nose or mouth, no shiny bald scalp, no before/after, no products.
- **Alt:** decorative (`alt=""`, as now) — the page `h1` names the concern.
- **Files:** `public/media/concerns/<kebab-slug>.webp`, q80, ≤ 160 KB.

---

### E-16 — Scan-zone stills for the homepage scan explorer (7) — *new*

- **Where:** home §3 scan explorer (`src/components/home/scan-invite/scan-explorer.tsx`): 7 zones reuse only 4 photos (Forehead L/C/R all use `hair-macro-2.jpg`; `hair-macro.jpg` is 518 KB).
- **Not needed:** the head-diagram line art — it already exists as code SVG (`src/components/journey/scan/head-diagrams.tsx`, three line-art heads with a zone dot). Don't generate diagrams.
- **Size:** 4:5 1000×1250 (matches `scalp-parting-portrait`), shown zoomed per zone (`zoom` prop) — keep detail sharp in the centre 60%.

Common start (same conversation for all 7): `[HOUSE-PHOTO-DARK] Black-and-white-friendly macro photograph, portrait 4:5, ordinary dark hair of medium density, soft directional light from the upper left revealing individual roots, no face or facial features in frame, subject centred.`

| Zone | File | Continuation |
|---|---|---|
| Forehead – Left | `scan/zone-forehead-left.webp` | "Left temple and the left edge of the front hairline, seen from the front-left, cropped above the eyebrow." |
| Forehead – Centre | `scan/zone-forehead-centre.webp` | "The middle of the front hairline seen from the front and slightly above, cropped above the eyebrows." |
| Forehead – Right | `scan/zone-forehead-right.webp` | "Right temple and the right edge of the front hairline, mirror of the left view." |
| Top of head | `scan/zone-top.webp` | "Mid-scalp from directly above, hair combed back." |
| Crown | `scan/zone-crown.webp` | "The crown whorl from directly above." |
| Parting | `scan/zone-parting.webp` | "A neat centre parting from above, roots visible along the line." |
| Back of head | `scan/zone-back.webp` | "Lower back of the head above the nape, short hair, from behind." |

- Alt: "Close-up of the <zone> area of the scalp" (from `ANGLE_LABEL`). q80, ≤ 110 KB each.

---

### E-17 — Science editorial stills — *new*

- **Where:** `/science` — "The hair growth cycle" (`#cycle-heading`, anagen/catagen/telogen copy) and "Why hair thins" image (`CLINICAL.scalpPartingPortrait`, 4:3 → 16:9 → `lg` tall, rounded, on dark); final CTA background `MEDIA.dnaHelix` (at 35% opacity).
- **Purpose:** the "why" image duplicates the scan imagery used elsewhere. The cycle section **already has a code SVG** (`src/components/site/hair-cycle-diagram.tsx`, three follicles + HTML labels) — so E-17a is **optional** (blog/social or a dark editorial backdrop only); do not replace the diagram.

**E-17a Follicle cycle (optional, illustrative, not an anatomical claim)** — 16:9 1600×900
> [HOUSE-PHOTO-DARK] Scientific editorial visual: three single hair follicles shown side by side as softly glowing, translucent, stylised cross-section forms suspended in dark space, left one long and active, middle one shortening, right one resting with a hair about to release — an abstract, elegant representation of the growth, transition and resting phases. Cool steel-blue and platinum light, microscope-like depth of field, evenly spaced across the frame with 10% margin. Photorealistic-meets-scientific-illustration, no labels. Avoid: text, arrows with labels, blood, gore, medical-textbook clip art, cartoon style.
- Labels (Anagen/Catagen/Telogen) are added in HTML. Add an "Illustrative" note in the caption. File `img/science-hair-cycle.webp`, ≤ 140 KB.

**E-17b Microscope at work (replaces reuse of the scan photo)** — 4:3 1520×1140, safe for 16:9 crop
> [HOUSE-PHOTO-DARK] A dermatoscope-style handheld lens and a laboratory microscope objective in soft focus over a glass slide holding a single hair strand, cool steel rim light, subject in the central 60%. Avoid: text, logos, gloves with brand marks, faces.
- File `img/science-microscope-slide.webp`, ≤ 130 KB.

---

### E-18 — Ingredient macro textures (optional) — *new, P3*

- **Where:** home §10 Ingredients (`src/components/home/ingredients/ingredients-spread.tsx`) and `/products/[slug]` ingredient list.
- **Assessment:** the client's ingredient photos (`public/media/ingredients/*.webp`, 230–620 px) are shown at 48–56 px thumbnails, which is fine. **Only** generate if a larger ingredient spread is designed. Prefer the client's flat-lay boards.
- **Prompt (per botanical)** — 1:1 1200×1200:
> [HOUSE-PHOTO-DARK] Top-down macro still life of fresh <amla fruit / arjun bark / bhringraj leaves and small white flowers / shatavari roots / amber lac resin pieces / ashwagandha roots> on matte dark slate, soft light from the upper left, centred with 15% margin, nothing else in frame. Illustrative ingredient photograph. Avoid: text, bowls with labels, capsules, pills, product packaging.
- These depict ingredients, not the formula: alt "Illustrative photo of <ingredient>". File `ingredients/<name>-macro.webp`, ≤ 120 KB.

---

### E-19 — How-it-works journey stills (3) — *new*

- **Where:** `/how-it-works` (`src/app/(site)/how-it-works/page.tsx`): intro image (`CLINICAL.consultNotes`, same stock image as home — replace with E-09) and the "Before your call" band (`CLINICAL.scalpParting`); home §6 step visuals (`src/components/home/how-it-works/step-visuals.tsx`).
- **Size:** 16:9 1600×900 with the subject in the central 60% (mobile crops to 4:3).

| # | File | Prompt |
|---|---|---|
| 1 Scan | `journey/journey-scan.webp` | Use the E-10 prompt, landscape 16:9, lighter: `[HOUSE-PHOTO-LIGHT]`. |
| 2 Health form | `journey/journey-form.webp` | "[HOUSE-PHOTO-LIGHT] Over-the-shoulder view of an Indian adult seated on a sofa, holding a smartphone; only the shoulder, hand and phone are visible, the screen shows a soft blank glow (no text, no UI). A cup of tea on a side table, linen cushions, pearl walls, soft daylight. Avoid: face, readable screen, logos." |
| 3 Plan arrives | `journey/journey-delivery.webp` | "[HOUSE-PHOTO-LIGHT] A plain unbranded cardboard parcel, closed, on a pale wooden console table by a doorway, soft morning light, a set of keys and a small plant beside it. No labels, no text, no products, no people." |

- Step 2 shows a person: add "Illustrative image" chip. Alt text describes the action ("A person filling in a health form on a phone"). ≤ 120 KB each.

---

### E-20 — Blog article header images (5) — *new*

- **Where:** `/blog` list and `/blog/[slug]` header (`articleImage()` in `src/components/site/article/article-row.tsx`, keys in `src/server/content/articles.ts`). Today all five articles use **product pack images** as headers — educational articles shouldn't look like product promotion (and the Solution is prescription-only).
- **Size:** 16:9 1600×900 (list thumbnail 180 px wide crops centre; keep subject central). Also used as OG fallback.

| Article slug | File | Prompt continuation after `[HOUSE-PHOTO-LIGHT]` |
|---|---|---|
| `hair-shedding-vs-hair-loss` | `blog/hair-shedding-vs-hair-loss.webp` | "A few naturally shed hair strands on a white cotton pillowcase, morning light, very shallow depth of field." |
| `hair-growth-cycle-explained` | `blog/hair-growth-cycle-explained.webp` | "Macro of individual hair strands of different lengths against a pearl background, backlit, abstract and scientific." |
| `what-happens-in-a-video-consultation` | `blog/video-consultation.webp` | "A laptop on a calm home desk with a softly glowing blank screen, a notebook with blank pages, a cup of tea; no people, no text." |
| `how-to-take-scalp-photos` | `blog/how-to-take-scalp-photos.webp` | "A plain smartphone lying on a bathroom counter next to a hand mirror (reflecting only the ceiling), soft daylight; no people." |
| `nutrition-and-hair` | `blog/nutrition-and-hair.webp` | "Top-down flat lay of eggs, almonds, pumpkin seeds, spinach and amla on a pale stone surface, soft daylight." |

- Developers add keys to `IMAGES` (or a new `ARTICLE_IMAGES`) and update `article.image`. ≤ 120 KB each.

---

## 4. Videos

Common encoding spec (§6.5 has the exact commands): MP4 H.264 High `yuv420p` + WebM VP9, 24 fps, **no audio track**, `+faststart`, 1280×720 for background loops; poster JPG 1280×720 q75 ≤ 80 KB that is **frame 0 of the loop** (so reduced-motion/poster and first frame match). Flow/Veo clips are 8 s by default — trim or extend inside Flow.

**Seamless loops in Flow:** (1) generate the poster still first in ChatGPT; (2) in Flow use **Frames to Video** with that still as both the **first and last frame**; (3) describe motion that returns to its start (orbit and return, drift that eases out). If the result still jumps, apply the crossfade loop in §6.5.

---

### E-11 — Science video replacement (`science-cellular.mp4`)

- **Where:** `/science` hero background (`BackgroundVideo video={VIDEOS.science} priority`) and home §7 The science (`src/components/home/science-story.tsx`).
- **Problem:** 2.9 MB stock clip, poster 145 KB, no WebM. Target **< 800 KB**.
- **Spec:** 8–10 s seamless loop, 16:9 1280×720, silent. Text overlays sit over the left/centre (gradient applied in code) — keep brightest detail right of centre and avoid high-contrast flicker under text.

**Flow prompt**
> [HOUSE-MOTION] Abstract microscopic world: translucent, softly glowing cell-like spheres and fine fibrous strands, like a dermal papilla and hair follicle seen through a fluorescence microscope, drifting very slowly in deep near-black space. Cool steel-blue (#aebbc8) and platinum light, gentle bioluminescent glow, soft bokeh particles in the foreground. Camera: an extremely slow lateral drift from left to right with a subtle parallax, no zoom. The brightest structures sit in the right 60% of the frame; the left side stays darker and calm. Motion is continuous and returns to the starting arrangement at the end so the clip loops seamlessly. 8 seconds. Silent, no music.
>
> Negative: text, labels, scale bars, people, hands, blood, red cells, viruses, gore, fast motion, flashes, camera shake, cuts, lens flares, saturated colours.

**Timeline**
| Time | Action |
|---|---|
| 0.0–2.0 s | Field of soft spheres, slow drift begins |
| 2.0–6.0 s | A fibrous strand passes through mid-ground right; bokeh particles float up |
| 6.0–8.0 s | Drift eases; arrangement matches frame 0 (loop point) |

- **Poster:** frame 0 → `public/media/img/poster-science-cellular.jpg` (replace), ≤ 80 KB.
- **Files:** `public/media/video/science-cellular.webm` + `.mp4` (same names → no code changes except adding `webm`). Label stays "(illustrative footage)".

---

### E-12 — Hero video (`hero-microscope.mp4`)

- **Where:** home §2 hero (`src/components/site/home-hero.tsx`, `BackgroundVideo video={VIDEOS.hero} priority objectPosition="60% 50%"`). Headline left (max 38rem), glass start form right (380–400 px). Overlay: `lg` left-to-right obsidian gradient 95% → 30%; mobile top-to-bottom 70% → 100%.
- **Problem:** 5.1 MB stock clip. Target **< 1 MB**. Pause button already exists in `BackgroundVideo`.
- **Spec:** 8–10 s seamless loop, 16:9 1280×720 (optionally 1920×1080 at ≤ 1.5 MB for ≥ 1440 px screens), silent.
- **Composition:** left 55% dark and low-detail (headline); hero subject (lens/dermatoscope) centred at **~62% horizontal**, vertically centred — this also survives the phone crop at `objectPosition 60% 50%` (phones show roughly the 48–72% band). The form sits over 72–95%: keep that area dim and soft (bokeh only).

**Flow prompt**
> [HOUSE-MOTION] Premium laboratory macro: the polished steel objective lenses of a modern microscope and a dermatoscope lens glass, seen in extreme close-up against deep near-black. Brushed-steel edges catch slow travelling highlights of cool platinum and steel-blue light; tiny dust motes float in a soft beam. Camera: a very slow dolly-in and slight arc to the right over 8 seconds, ending at the same framing it started (seamless loop). Composition: the lens sits slightly right of centre (about 62% across the frame); the left half of the frame is almost pure darkness with smooth gradients; the far right is soft out-of-focus bokeh. Calm, expensive, scientific. Silent.
>
> Negative: text, logos, brand names on the microscope, people, hands, gloves, faces, screens, blood, bright white backgrounds, cuts, shake, fast moves, lens flares, colour shifts, flicker.

**Timeline**
| Time | Action |
|---|---|
| 0.0–1.0 s | Static-feeling open, highlight resting on lens rim |
| 1.0–7.0 s | Slow dolly/arc; highlight travels across the steel edge left→right |
| 7.0–8.0 s | Move eases back to frame-0 framing; highlight back to start |

- **Poster:** frame 0, 1280×720 JPG ≤ 80 KB → `public/media/img/poster-hero-microscope.jpg`. This is what reduced-motion visitors and slow connections see — check it works as a still with the headline over it.
- **Files:** `public/media/video/hero-microscope.webm` + `.mp4`.

---

### E-21 — Guarantee background loop (`guarantee-bubbles.mp4`) — *new*

- **Where:** `/guarantee` hero and the guarantee panel (`src/components/site/guarantee-panel.tsx`, home §12 `guarantee-compact.tsx`). Shown only while `guarantee.enabled = true` (handled in code).
- **Problem:** 3.1 MB stock clip; generic.
- **Flow prompt (8 s, 16:9 1280×720, < 800 KB)**
> [HOUSE-MOTION] Slow, tiny bubbles rising through clear, slightly blue-tinted liquid in a glass vessel, macro, against near-black. Soft platinum backlight, gentle refraction, calm and reassuring. Camera locked off with an almost imperceptible drift. Bubbles concentrated in the right half; the left half stays dark and quiet for text. Loops seamlessly. Silent.
>
> Negative: text, logos, products, bottles, labels, hands, fizzing drinks, fast boiling, splashes, colour shifts.
- Must **not** show product, money, coins, seals or certificates. Poster frame 0 → `poster-guarantee-bubbles.jpg`. Files `guarantee-bubbles.{webm,mp4}`.

---

### E-22 — Journey b-roll (`journey-formulation.mp4`) and product texture clip — *new, P3*

**E-22a Journey b-roll** — replaces `journey-formulation.mp4` (3.3 MB). **Note:** `VIDEOS.journey` is currently **not referenced** by any page. Generate only if developers wire it in (candidates: `/how-it-works` hero or `/products` hero); otherwise developers can delete the unused file (ask first).
> [HOUSE-MOTION] Laboratory glassware in soft blue light: a row of clear glass test tubes and a glass pipette, a single drop of clear liquid forming slowly at the pipette tip and falling in slow motion into a tube, gentle ripples. Slow lateral dolly from right to left, returning to start for a seamless loop. Glassware occupies the right 55%; left side dark. 8 seconds. Silent.
> Negative: text, labels on glassware, gloves, hands, people, coloured chemicals, smoke, fast motion, brand marks.
- Files `journey-formulation.{webm,mp4}`, < 800 KB; poster `poster-journey-formulation.jpg`.

**E-22b Product texture clip (Solution drop on stone)** — `/products/hair-regrowth-solution` gallery (`src/components/site/product-gallery.tsx`), as a final gallery tile (muted, loop, poster first).
- 4:5 is the gallery format; Flow outputs 16:9/9:16 → generate **9:16 1080×1920** and crop to 4:5 (1080×1350) centred.
> [HOUSE-MOTION] Extreme macro: a generic clear glass dropper (no bottle, no label) releases a single drop of clear, very slightly amber liquid onto a matte dark slate surface; the drop lands and spreads into a perfect small bead with a soft highlight. Slow motion, locked-off camera, soft key light from the upper left. Vertical framing, the drop in the centre. 6 seconds; the last second holds still on the bead. Silent.
> Negative: product bottle, label, text, hands, skin, hair, scalp, splashes, colours other than clear/amber, foam.
- Keep the real bottle out of frame (no invented packaging). No claim text over it. Not looped (plays once on tap, then shows final frame), or loop with a crossfade. Files `public/media/video/product-solution-texture.{webm,mp4}`, < 700 KB, 720×900; poster `poster-product-solution-texture.jpg`.

---

## 5. Non-generated items

### E-13 — YHC wordmark SVG for portals — **client to supply**
- Current logo is raster: `public/media/brand/logo-dark.webp` / `logo-light.webp` (1200×473, built from the client's PNG by `scripts/build-assets.mjs`). Portals (admin/doctor/sales sidebars) need a crisp vector at small sizes.
- **Do not generate or AI-trace the logo** — a traced wordmark changes letterforms. Ask the client/brand designer for the master **SVG (or AI/EPS/PDF)**: full lockup, wordmark only, mark only; one-colour black and pearl versions.
- Developers: save as `public/media/brand/logo-wordmark.svg` (and `-light.svg`), strip editor metadata, make fills `currentColor` so it follows tokens; add to `BRAND_LOGO` in `src/lib/brand-media.ts`.

### E-14 — Alt text for the 4 product images — **developer task**
- **Where:** `src/components/home/ingredients/ingredients-spread.tsx` (~line 122) renders the product pack with `alt=""` (audit A11Y-05: "Alt = product name + pack size"). Verified still `alt=""` → **Pending (dev)**.
- Recommended strings (men's pack shown by default; switch to the women's string when that line is selected):
  | Product | Alt (men) | Alt (women) |
  |---|---|---|
  | hair-regrowth-solution | YHC Hair Regrowth Solution for men, 60 ml bottle | YHC Hair Regrowth Solution for women, 60 ml bottle |
  | hair-nourishing-tablets | YHC Hair Nourishing Tablets for men, jar of 30 tablets | YHC Hair Nourishing Tablets for women, jar of 30 tablets |
  | hair-regrowth-capsules | YHC Hair Regrowth Capsules for men, jar of 30 capsules | YHC Hair Regrowth Capsules for women, jar of 30 capsules |
  | hair-regrowth-powder | YHC Hair Regrowth Powder for men, 30 servings | YHC Hair Regrowth Powder for women, 30 servings |
- Build them from data rather than hard-coding: `` `YHC ${product.name} ${LINE_LABEL[line].toLowerCase()}, ${PRODUCT_MEDIA[slug].pack}` `` (`LINE_LABEL`, `PRODUCT_MEDIA.pack` in `src/lib/brand-media.ts`).
- Also check `product-gallery.tsx` thumbnails (`alt=""` inside buttons): the button needs an `aria-label` such as "Show photo 2 of 5".

---

## 6. Integration

### 6.1 Asset table

| ID | Filename convention | Type | Target page + section | Dimensions + format | Priority | Generation status | Integration status |
|---|---|---|---|---|---|---|---|
| E-01 | `img/dr-anil-tyagi-<formal\|formal-square\|desk-review\|desk-consult\|hands>.webp` | Image (real shoot) | Home §5 doctor feature, DoctorCard, /doctor-tyagi, /book | 4:5 1600×2000, 1:1 1200×1200, 4:3; WebP q85 | P0 | Exists (interim portrait); real set Pending | Pending |
| E-02 | `video/scan-walkthrough[-vertical].{webm,mp4}` + `.en.vtt`, `img/poster-scan-walkthrough.jpg` | Video (screen capture) | Home §3 scan invite, /how-it-works, /start | 9:16 1080×1920 + 16:9 1920×1080, < 3 MB | P1 | Pending | Pending |
| E-03 | `video/doctor-intro.mp4` + `.en.vtt`, `img/poster-doctor-intro.jpg` | Video (real shoot, narration) | /doctor-tyagi, home §5, /book | 16:9 1920×1080 + 720p | P1 | Pending | Pending |
| E-04 | `products/<product>-<line>-photo-<view>.webp`, `-lifestyle-<scene>.webp` | Image (real + composite) | /products/[slug] gallery, tiles, home §10 | 4:5 1600×2000; WebP q82–85 | P1 | Exists (renders); photos + composites Pending | Pending |
| E-05 | `results/patient-<x>-<n>-<before\|after>.webp` | Image (real, consented) | Home §8, /results | per `results.ts` | P0 | Exists (5 pairs, durations/consent refs pending) | Pending (client data) |
| E-06 | `og/og-bg-<name>.jpg` + `opengraph-image.tsx` routes | Image (code) | All key routes | 1200×630 JPG ≤ 150 KB | P2 | Pending (optional art) | Pending (dev) |
| E-07 | `illustrations/consult-step-<1-review\|2-call\|3-plan>.{svg,webp}` | Illustration | /book, /plans | 3 × 1:1 1024 | P2 | Pending | Pending |
| E-08 | `illustrations/empty-cart.{svg,webp}`, `checkout-step-<n>-<name>` | Illustration | Cart empty state, checkout strip | 1:1 1024 | P3 | Pending | Pending |
| E-09 | `img/consult-desk.webp` | Image | Home §4 Why choose split 1; /how-it-works intro | 4:3 1520×1140 WebP ≤ 120 KB | P2 | Pending (real clinic photo preferred) | Pending |
| E-10 | `img/scan-session.webp` | Image | Home §4 Why choose split 2; /doctor-tyagi | 4:3 1520×1140 WebP ≤ 140 KB | P3 | Pending | Pending |
| E-11 | `video/science-cellular.{webm,mp4}`, `img/poster-science-cellular.jpg` | Video loop | /science hero, home §7 | 16:9 1280×720, < 800 KB | P2 | Exists (stock 2.9 MB); replacement Pending | Pending |
| E-12 | `video/hero-microscope.{webm,mp4}`, `img/poster-hero-microscope.jpg` | Video loop | Home §2 hero | 16:9 1280×720, < 1 MB | P2 | Exists (stock 5.1 MB); replacement Pending | Pending (pause button done) |
| E-13 | `brand/logo-wordmark[-light].svg` | Vector (client) | Portal sidebars, header | SVG | P3 | Exists (raster WebP); vector Pending (client) | Pending (dev) |
| E-14 | — (code) | Alt text | Home §10 ingredients spread | — | P3 | n/a | Pending (dev) |
| E-15 | `concerns/<hair-fall\|thinning\|receding-hairline\|crown-thinning\|dandruff-scalp>.webp` | Image | /concerns/[slug] header | 4:5 1600×2000 WebP ≤ 160 KB | P2 | Pending | Pending |
| E-16 | `scan/zone-<forehead-left\|…\|back>.webp` | Image | Home §3 scan explorer | 4:5 1000×1250 WebP ≤ 110 KB | P3 | Pending | Pending |
| E-17 | `img/science-hair-cycle.webp`, `img/science-microscope-slide.webp` | Image | /science cycle + "why hair thins" | 16:9 1600×900; 4:3 1520×1140 | P3 | Pending | Pending |
| E-18 | `ingredients/<name>-macro.webp` | Image (optional) | Home §10, product ingredients | 1:1 1200 | P3 | Exists (client flat-lays); optional | Pending |
| E-19 | `journey/journey-<scan\|form\|delivery>.webp` | Image | /how-it-works, home §6 step visuals | 16:9 1600×900 | P3 | Pending | Pending |
| E-20 | `blog/<article-slug>.webp` | Image | /blog, /blog/[slug] header | 16:9 1600×900 | P2 | Pending | Pending |
| E-21 | `video/guarantee-bubbles.{webm,mp4}`, poster | Video loop | /guarantee hero, guarantee panel | 16:9 1280×720, < 800 KB | P3 | Exists (stock 3.1 MB); replacement Pending | Pending |
| E-22 | `video/journey-formulation.{webm,mp4}`; `video/product-solution-texture.{webm,mp4}` | Video | (unused) / product gallery | 720p < 800 KB; 720×900 < 700 KB | P3 | Exists (stock, unused); texture Pending | Pending |

### 6.2 Folders and naming
- Images: `public/media/<category>/<kebab-name>[-<variant>].webp` — categories in use: `img` (editorial/clinical), `products`, `ingredients`, `hair`, `brand`, `results`; new: `concerns`, `scan`, `journey`, `blog`, `illustrations`, `og`.
- Videos: `public/media/video/<name>.webm` + `<name>.mp4` (same base name).
- Posters: `public/media/img/poster-<name>.jpg`.
- Captions: `public/media/video/<name>.<lang>.vtt`.
- Lower-case kebab-case only; concern slugs with underscores (`hair_fall`) become `hair-fall` in filenames.
- Keep raw generations and masters **out of `public/`** (e.g. a local `YHC-assets/generated/` folder, which `.vercelignore` already keeps out of uploads for the client drop — confirm before adding).
- Licensed/stock items stay listed in `public/media/CREDITS.md`; add a row "AI-generated (ChatGPT/Flow), <date>, prompt ID E-xx" for every generated asset.

### 6.3 Step by step for developers
1. Put the optimised files in the folders above.
2. Register them:
   - Editorial/clinical stills → `CLINICAL` or `MEDIA` in `src/lib/images.ts` (with real `width`/`height` and alt).
   - Page imagery → `IMAGES` in `src/lib/images.ts` (blog headers: add keys and update `image` in `src/server/content/articles.ts`).
   - Videos → `VIDEOS` in `src/lib/images.ts`: set `src` (mp4), the optional `webm` field (already supported by `SiteVideo` and `background-video.tsx`), `poster`, `label` (keep "(illustrative footage)").
   - Pack photography, logos, ingredients → `PRODUCT_MEDIA`, `BRAND_LOGO`, `INGREDIENT_MEDIA` in `src/lib/brand-media.ts`.
   - Concerns → add an image map keyed by concern slug and use it instead of `IMAGES.heroStage` in `src/app/(site)/concerns/[slug]/page.tsx`.
   - Scan zones → swap the `image` per zone in `src/components/home/scan-invite/scan-explorer.tsx`.
   - Consented results → `src/server/content/results.ts` only, with consent fields filled.
3. Swap usages: E-09 `CLINICAL.consultNotes` (why-choose split 1, /how-it-works); E-10 `CLINICAL.scalpExam` (why-choose split 2 + add caption, /doctor-tyagi).
4. Alt text rules: describe what is visible, plainly, ≤ 125 characters; prefix "Illustrative image:" for illustrative people/doctor scenes; `alt=""` for purely decorative backgrounds and when adjacent text already names the image; never call an illustrative image "Dr. Tyagi", "our clinic" or "a patient"; product alt = product name + line + pack size.
5. Labelling rules: any image showing a person or doctor (even faceless hands) that is not a real YHC photo shows the visible **"Illustrative image"** chip (`SplitImage caption`, or the same chip style elsewhere). Science illustrations get "Illustrative" in their caption. Videos keep "(illustrative footage)" in `label`.
6. Optimisation: follow `scripts/build-assets.mjs` (sharp, `webp({ quality: 82, effort: 5 })`, prints size). Either add the new files to that script or create a sibling one-off script with the same pattern (sharp is already in `node_modules`; no new dependency).
7. Videos: encode with §6.5, replace files in place (same names = no code changes beyond `webm`), check that `BackgroundVideo` still shows the poster under reduced motion.
8. Run `pnpm typecheck && pnpm lint && pnpm test`, check pages at 360 px and 1440 px, then commit with the E-ID and FR IDs.

### 6.4 Image optimisation reference (sharp)
```js
await sharp('in.png').resize(1520, 1140, { fit: 'cover', position: 'attention' })
  .toColourspace('srgb').webp({ quality: 82, effort: 5 }).toFile('public/media/img/consult-desk.webp');
```
Targets: hero/large ≤ 160–220 KB, split images ≤ 140 KB, thumbnails ≤ 60 KB, illustrations ≤ 40 KB (SVG ≤ 12 KB). Strip metadata (sharp does by default).

### 6.5 Video encoding reference (ffmpeg — local tool, not a project dependency)
```sh
# 1) optional seamless crossfade loop (8 s clip -> 7 s loop)
ffmpeg -i flow.mp4 -filter_complex "[0:v]split[a][b];[a]trim=1:8,setpts=PTS-STARTPTS[main];[b]trim=0:1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=6[v]" -map "[v]" -an loop.mp4

# 2) MP4 H.264 (background loops ~700-900 kbps)
ffmpeg -i loop.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -profile:v high -preset slow -crf 28 -maxrate 900k -bufsize 1800k -pix_fmt yuv420p -movflags +faststart hero-microscope.mp4

# 3) WebM VP9 (two-pass, ~500-700 kbps)
ffmpeg -i loop.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -b:v 600k -pass 1 -row-mt 1 -deadline good -cpu-used 4 -f webm NUL
ffmpeg -i loop.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libvpx-vp9 -b:v 600k -pass 2 -row-mt 1 -deadline good -cpu-used 1 hero-microscope.webm

# 4) poster = frame 0
ffmpeg -i hero-microscope.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 5 poster-hero-microscope.jpg
```
(`NUL` on Windows, `/dev/null` on macOS/Linux.) Size targets: hero < 1 MB, other loops < 800 KB, screen recording < 3 MB, doctor video 720p ~1.5 Mbps. Always drop the audio track (`-an`) for b-roll — Veo can add generated sound.

### 6.6 QA checklist before publishing
- [ ] No text, letters, numbers, watermarks or pseudo-writing anywhere (zoom to 200% on forms, screens, labels).
- [ ] Hands: five fingers, natural joints, no merged or extra fingers; no warped phones/laptops.
- [ ] No faces where not allowed; no reflection showing a face; nobody could be mistaken for Dr. Tyagi.
- [ ] Packaging: only real renders/photos; labels identical to `public/media/products` (letters, colours, mint = men, blush = women). No invented bottles.
- [ ] No before/after, no lush "result" hair, no bald shock imagery, no seals/badges/ratings/certificates.
- [ ] Prescription product (Solution) not shown in lifestyle/promotional contexts beyond its own product page.
- [ ] Captions/scripts free of banned words (PRD §15); guarantee absent or with conditions; fee/price confirmed with client.
- [ ] Negative space where the overlay copy sits; checked at 360 px and 1440 px crops; greyscale check where CSS applies `grayscale`.
- [ ] Videos: silent, seamless loop (watch 3 loops), poster = frame 0, reduced-motion shows poster, Pause button visible, size within target, WebM + MP4 both present.
- [ ] Alt text set per §6.3; "Illustrative image" chip on illustrative people/doctor scenes.
- [ ] Files in the right folder with kebab-case names; sRGB; size targets met; `CREDITS.md` row added.
- [ ] Real-only items (E-01, E-03, E-04 photos, E-05) have written consent on file.
