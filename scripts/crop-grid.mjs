// Dev helper: split a collage with white gutters into its tiles (gutters are detected, not guessed).
// Usage: node scripts/crop-grid.mjs <image> <outDir> <prefix>
import { mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found');
const sharp = createRequire(import.meta.url)(join(pnpmDir, sharpDir, 'node_modules', 'sharp'));

const [src, outDir, prefix] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const lum = (x, y) => {
  const i = (y * W + x) * C;
  return (data[i] + data[i + 1] + data[i + 2]) / 3;
};

// A line is a gutter when at least 97% of its pixels are near-white.
const isWhiteCol = (x) => {
  let n = 0;
  for (let y = 0; y < H; y += 2) if (lum(x, y) > 238) n++;
  return n / Math.ceil(H / 2) > 0.97;
};
const isWhiteRow = (y) => {
  let n = 0;
  for (let x = 0; x < W; x += 2) if (lum(x, y) > 238) n++;
  return n / Math.ceil(W / 2) > 0.97;
};

/** Contiguous non-gutter spans longer than 15% of the side. */
function spans(len, white) {
  const out = [];
  let start = -1;
  for (let i = 0; i <= len; i++) {
    const w = i === len || white(i);
    if (!w && start < 0) start = i;
    if (w && start >= 0) {
      if (i - start > len * 0.15) out.push([start, i]);
      start = -1;
    }
  }
  return out;
}

const cols = spans(W, isWhiteCol);
const rows = spans(H, isWhiteRow);
console.log(`${W}x${H} → ${cols.length} cols × ${rows.length} rows`);
let n = 0;
for (const [y0, y1] of rows) {
  for (const [x0, x1] of cols) {
    n++;
    const inset = 2; // drop anti-aliased gutter edges
    const name = join(outDir, `${prefix}-${String(n).padStart(2, '0')}.png`);
    await sharp(src)
      .extract({ left: x0 + inset, top: y0 + inset, width: x1 - x0 - inset * 2, height: y1 - y0 - inset * 2 })
      .toFile(name);
    console.log(name, `${x1 - x0}x${y1 - y0}`);
  }
}
