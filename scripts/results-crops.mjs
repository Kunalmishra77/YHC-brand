// Reproducible crops for the consented before/after results (ADR-27).
// The client confirmed written consent on the condition that FACES ARE NEVER SHOWN, so every box below
// stops above the eyebrows (front/top views), behind the eye line (side views) or excludes other people
// and legible print in the background (crown views). Boxes are in ORIGINAL pixels after EXIF rotation,
// all 4:5, and before/after boxes of a pair are framed to a comparable scale.
//
// Usage: node scripts/results-crops.mjs <sourceDir>   (sourceDir = the 58 WhatsApp JPEGs; numbering is the
// sorted filename order, as in yhc-review-photos/index.txt)
// Output: public/media/results/<patient>-<n>-before.webp / -after.webp — 1000×1250, WebP q80, no metadata.
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found');
const sharp = createRequire(import.meta.url)(join(pnpmDir, sharpDir, 'node_modules', 'sharp'));

const OUT_W = 1000;
const OUT_H = 1250;

/** n = photo number (sorted filename order). Box = { left, top, width, height } in original px, 4:5. */
const PAIRS = [
  // Patient A — top-front view (#10 → #18)
  {
    name: 'patient-a-1',
    before: { n: 10, left: 292, top: 130, width: 416, height: 520 },
    after: { n: 18, left: 448, top: 340, width: 304, height: 380 },
  },
  // Patient A — front hairline / parting (#14 → #15)
  {
    name: 'patient-a-2',
    before: { n: 14, left: 340, top: 290, width: 320, height: 400 },
    after: { n: 15, left: 476, top: 330, width: 312, height: 390 },
  },
  // Patient B — top-front view (#23 → #50)
  {
    name: 'patient-b-1',
    before: { n: 23, left: 378, top: 230, width: 480, height: 600 },
    after: { n: 50, left: 336, top: 150, width: 468, height: 585 },
  },
  // Patient B — side view (#21 → #33). Note: the two photos show opposite sides of the head.
  {
    name: 'patient-b-2',
    before: { n: 21, left: 468, top: 130, width: 492, height: 615 },
    after: { n: 33, left: 168, top: 285, width: 480, height: 600 },
  },
  // Patient C — crown, back view (#36 → #48). #36: excludes the person seated opposite (face top-left) and
  // the clinic leaflet; #48: right edge stops before a brochure that carries a printed face.
  {
    name: 'patient-c-1',
    before: { n: 36, left: 180, top: 310, width: 400, height: 500 },
    after: { n: 48, left: 296, top: 335, width: 316, height: 395 },
  },
];

const srcDir = process.argv[2];
if (!srcDir) throw new Error('Usage: node scripts/results-crops.mjs <sourceDir>');
const files = readdirSync(srcDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();
const outDir = join(process.cwd(), 'public', 'media', 'results');
mkdirSync(outDir, { recursive: true });

async function crop(box, outFile) {
  const file = files[box.n - 1];
  if (!file) throw new Error(`photo #${box.n} not found`);
  const ratio = box.width / box.height;
  if (Math.abs(ratio - 0.8) > 0.01) throw new Error(`#${box.n}: box is not 4:5 (${ratio.toFixed(3)})`);
  // rotate() applies EXIF orientation first; sharp writes no metadata unless asked (no EXIF/GPS kept).
  const rotated = await sharp(join(srcDir, file)).rotate().toBuffer();
  await sharp(rotated)
    .extract({ left: box.left, top: box.top, width: box.width, height: box.height })
    .resize(OUT_W, OUT_H, { fit: 'cover', kernel: 'lanczos3' })
    .webp({ quality: 80 })
    .toFile(join(outDir, outFile));
  console.log(`${outFile} ← #${box.n} [${box.left},${box.top},${box.width}×${box.height}]`);
}

for (const pair of PAIRS) {
  await crop(pair.before, `${pair.name}-before.webp`);
  await crop(pair.after, `${pair.name}-after.webp`);
}
