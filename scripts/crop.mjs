// Dev helper: crop a region of a screenshot. Usage: node scripts/crop.mjs <in> <out> <top> <height> [left] [width]
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharpDir = readdirSync(pnpmDir).find((d) => d.startsWith('sharp@'));
if (!sharpDir) throw new Error('sharp not found');
const sharp = createRequire(import.meta.url)(join(pnpmDir, sharpDir, 'node_modules', 'sharp'));
const [input, output, top, height, left = '0', width] = process.argv.slice(2);
const meta = await sharp(input).metadata();
const w = Number(width ?? meta.width);
const h = Math.min(Number(height), meta.height - Number(top));
await sharp(input)
  .extract({ left: Number(left), top: Number(top), width: w, height: h })
  .toFile(output);
console.log(`${meta.width}x${meta.height} → ${w}x${h}`);
