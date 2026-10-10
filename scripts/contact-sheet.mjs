// Dev helper: numbered contact sheets for reviewing a folder of images.
// Usage: node scripts/contact-sheet.mjs <inDir> <outDir> [perSheet=12]
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found');
const sharp = createRequire(import.meta.url)(join(pnpmDir, sharpDir, 'node_modules', 'sharp'));

const [inDir, outDir, perArg] = process.argv.slice(2);
const per = Number(perArg ?? 12);
mkdirSync(outDir, { recursive: true });
const files = readdirSync(inDir)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();
writeFileSync(join(outDir, 'index.txt'), files.map((f, i) => `${i + 1}\t${f}`).join('\n'));

const cell = 320;
const cols = 4;
for (let s = 0; s * per < files.length; s++) {
  const batch = files.slice(s * per, s * per + per);
  const rows = Math.ceil(batch.length / cols);
  const tiles = await Promise.all(
    batch.map(async (f, i) => {
      const n = s * per + i + 1;
      const img = await sharp(join(inDir, f)).rotate().resize(cell, cell, { fit: 'contain', background: '#222' }).toBuffer();
      const label = Buffer.from(
        `<svg width="${cell}" height="${cell}"><rect x="0" y="0" width="56" height="34" fill="#000" opacity="0.75"/><text x="8" y="25" font-size="22" font-family="Arial" fill="#fff">${n}</text></svg>`,
      );
      return {
        input: await sharp(img).composite([{ input: label }]).toBuffer(),
        left: (i % cols) * cell,
        top: Math.floor(i / cols) * cell,
      };
    }),
  );
  await sharp({ create: { width: cols * cell, height: rows * cell, channels: 3, background: '#111' } })
    .composite(tiles)
    .jpeg({ quality: 82 })
    .toFile(join(outDir, `sheet-${s + 1}.jpg`));
  console.log(`sheet-${s + 1}.jpg (${batch.length})`);
}
