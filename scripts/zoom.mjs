// Dev helper: crop a region of an image and scale it up for reading small print.
// Usage: node scripts/zoom.mjs <src> <out> <left> <top> <width> <height> [scale=2]
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharp = createRequire(import.meta.url)(join(pnpmDir, readdirSync(pnpmDir).find((d) => d.startsWith('sharp@')), 'node_modules', 'sharp'));
const [src, out, l, t, w, h, scale = '2'] = process.argv.slice(2);
await sharp(src).extract({ left: +l, top: +t, width: +w, height: +h }).resize(Math.round(+w * +scale)).toFile(out);
console.log('ok', out);
