// Builds the website media from the client's asset drop (YHC-assets/, 2026-10-18).
// Reproducible: re-run after the client swaps a file. Writes optimised WebP to public/media/{brand,
// products,ingredients,hair} and app icons to src/app. Prints each output's size for src/lib/brand-media.ts.
// Usage: node scripts/build-assets.mjs
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found');
const sharp = createRequire(import.meta.url)(join(pnpmDir, sharpDir, 'node_modules', 'sharp'));

const SRC = 'YHC-assets';
const GRID = join(SRC, '_cropped', 'grids'); // tiles from scripts/crop-grid.mjs
const OUT = join('public', 'media');
for (const d of ['brand', 'products', 'ingredients', 'hair']) mkdirSync(join(OUT, d), { recursive: true });

const report = [];
async function write(pipeline, out, quality = 82) {
  const info = await pipeline.webp({ quality, effort: 5 }).toFile(out);
  report.push(`${info.width}x${info.height}\t${Math.round(info.size / 1024)} KB\t${out}`);
}

/* ---------- brand ---------- */
const logoSrc = join(SRC, 'YHC website logo.png'); // black mark on transparent
const logoTrimmed = await sharp(logoSrc).trim().png().toBuffer();
await write(sharp(logoTrimmed).resize({ width: 1200 }), join(OUT, 'brand', 'logo-dark.webp'), 90);
// Light version for dark surfaces: keep the alpha, paint every pixel pearl.
const { width: lw, height: lh } = await sharp(logoTrimmed).metadata();
const alpha = await sharp(logoTrimmed).extractChannel('alpha').toBuffer();
const pearl = await sharp({ create: { width: lw, height: lh, channels: 3, background: '#f5f3ee' } })
  .joinChannel(alpha)
  .png()
  .toBuffer();
await write(sharp(pearl).resize({ width: 1200 }), join(OUT, 'brand', 'logo-light.webp'), 90);
// App icons from the square rose badge.
const badge = join(SRC, 'your-hair-company (1).png');
await sharp(badge).resize(512, 512).png().toFile(join('src', 'app', 'icon.png'));
await sharp(badge).resize(180, 180).png().toFile(join('src', 'app', 'apple-icon.png'));
// favicon.ico = ICO container holding one 48×48 PNG (supported by every current browser).
const png48 = await sharp(badge).resize(48, 48).ensureAlpha().png().toBuffer(); // ICO PNGs must be RGBA
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); // reserved
ico.writeUInt16LE(1, 2); // type: icon
ico.writeUInt16LE(1, 4); // one image
ico.writeUInt8(48, 6); // width
ico.writeUInt8(48, 7); // height
ico.writeUInt16LE(1, 10); // colour planes
ico.writeUInt16LE(32, 12); // bits per pixel
ico.writeUInt32LE(png48.length, 14); // image size
ico.writeUInt32LE(22, 18); // image offset
writeFileSync(join('src', 'app', 'favicon.ico'), Buffer.concat([ico, png48]));
report.push('512x512\ticon\tsrc/app/icon.png', '180x180\ticon\tsrc/app/apple-icon.png', '48x48\tico\tsrc/app/favicon.ico');

/* ---------- products (front-of-pack photography only; no back labels) ---------- */
const P = (file) => join(SRC, file);
const T = (file) => join(GRID, file);
const PRODUCTS = {
  'solution-men': [
    P('YHC_3D_Solution_Men.png'),
    P('YHC_Solution_Men_Mockup_2.png'),
    P('exec-626ab085-a25c-476f-9ae3-7d5fc6babfb1.png'),
    T('solution-men-04.png'),
    T('solution-men-b-07.png'),
  ],
  'solution-women': [
    P('YHC_3D_Solution_Women.png'),
    P('YHC_Solution_Women_Mockup_2.png'),
    P('exec-79d82236-3857-4d56-a7b7-0eb2ff6d786e.png'),
    P('exec-e2a93e4a-1fc9-48e1-960c-b07f75718e8d.png'),
    T('solution-women-01.png'),
  ],
  'tablets-men': [
    P('YHC_3D_Tablets_Men.png'),
    P('exec-9b874eb2-3f41-460e-b5d3-31dbf18ec8a8.png'),
    P('exec-dce1b0a3-ffaf-4840-9706-0ae956ea25ed.png'),
    P('YHC_Mockup_Tablets_Men.png'),
    T('grid-c-07.png'),
  ],
  'tablets-women': [
    P('YHC_3D_Tablets_Women.png'),
    P('exec-dafb9e34-a593-4e22-ab1e-35c290af5d11.png'),
    P('exec-32ffc8f2-aba9-42cd-8815-01ce3805624f.png'),
    P('YHC_Mockup_Tablets_Women.png'),
    T('grid-b-07.png'),
  ],
  'capsules-men': [
    P('exec-54259283-6a41-458b-bd7a-84d56c4e317f.png'),
    P('exec-0213cd24-9522-4763-8c48-07c3a22925f3.png'),
    P('exec-d1f91da4-6ca2-4c53-b0af-a1af932dcdbb.png'),
    P('YHC_Mockup_Capsules_Men.png'),
    T('capsules-men-09.png'),
  ],
  'capsules-women': [
    P('exec-924d07a5-6a72-4554-beed-b7bcac36cf8c.png'),
    P('exec-2bd412f0-c4f5-4dc3-8107-f32428c8d4b3.png'),
    P('exec-8e09ee37-c238-4413-8833-e5132b8f30c8.png'),
    P('YHC_Mockup_Capsules_Women.png'),
    T('grid-a-06.png'),
  ],
  'powder-men': [P('YHC_3D_Powder_Men.png')],
  'powder-women': [P('YHC_3D_Powder_Women.png')],
};
for (const [key, files] of Object.entries(PRODUCTS)) {
  for (const [i, file] of files.entries()) {
    // Hero = consistent 4:5 frame; gallery keeps each photo's own composition.
    const pipe = i === 0 ? sharp(file).resize(1000, 1250, { fit: 'cover' }) : sharp(file).resize({ width: 1000, withoutEnlargement: true });
    await write(pipe, join(OUT, 'products', `${key}-${i}.webp`));
  }
}

/* ---------- ingredient crops [left, top, width, height] from the client's flat-lay boards ---------- */
const BOARDS = {
  capsule: P('exec-9397c4a7-4437-4458-b731-42f26a55bb27.png'),
  tablet: P('exec-4780c7ab-a960-40ac-b83f-c2977fdd0459.png'),
  solution: P('exec-bde2820f-dd7c-40ab-8169-82f055573ffe.png'),
};
const CROPS = {
  amla: ['capsule', 0, 50, 440, 560],
  arjun: ['capsule', 430, 70, 400, 540],
  bhringraj: ['capsule', 810, 30, 444, 590],
  shatavari: ['capsule', 0, 610, 480, 620],
  'shuddh-lakh': ['capsule', 420, 660, 400, 500],
  ashwagandha: ['capsule', 800, 600, 454, 620],
  'green-tea': ['tablet', 80, 0, 540, 260],
  'bhringraj-herb': ['tablet', 640, 0, 570, 260],
  'pumpkin-seed': ['tablet', 80, 250, 540, 250],
  iron: ['tablet', 650, 250, 520, 250],
  zinc: ['tablet', 80, 490, 540, 230],
  'vitamin-a': ['tablet', 650, 485, 570, 230],
  copper: ['tablet', 150, 715, 420, 230],
  'folic-acid': ['tablet', 650, 690, 570, 270],
  'vitamin-b5': ['tablet', 100, 920, 480, 270],
  biotin: ['tablet', 680, 940, 540, 270],
  anagain: ['solution', 20, 30, 660, 570],
  'capilia-longa': ['solution', 650, 60, 590, 560],
  'botanical-oil': ['solution', 80, 630, 420, 470],
  'lab-vials': ['solution', 560, 590, 350, 490],
  molecule: ['solution', 900, 630, 330, 500],
};
for (const [key, [board, left, top, width, height]] of Object.entries(CROPS)) {
  await write(
    sharp(BOARDS[board]).extract({ left, top, width, height }).resize({ width: 640, withoutEnlargement: true }),
    join(OUT, 'ingredients', `${key}.webp`),
  );
}
// Whole boards for the ingredients spread.
await write(sharp(BOARDS.capsule).resize(1200), join(OUT, 'ingredients', 'board-capsule.webp'));
await write(sharp(BOARDS.tablet).resize(1200), join(OUT, 'ingredients', 'board-tablet.webp'));
await write(sharp(BOARDS.solution).resize(1200), join(OUT, 'ingredients', 'board-solution.webp'));
await write(sharp(P('exec-ba7f2969-57ec-4d47-8b0f-32e719618e50.png')).resize(1200), join(OUT, 'ingredients', 'board-bowls.webp'));

/* ---------- hair ---------- */
await write(sharp(P('exec-b59e4705-a228-4a11-9564-b6c64ac4510d.png')).resize({ width: 1000 }), join(OUT, 'hair', 'parting-thinning.webp'));

console.log(report.join('\n'));
