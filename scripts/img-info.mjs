// Dev helper: print width x height of every image in a folder.
// Usage: node scripts/img-info.mjs <dir>
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
const pnpmDir = join(process.cwd(), 'node_modules', '.pnpm');
const sharp = createRequire(import.meta.url)(join(pnpmDir, readdirSync(pnpmDir).find((d) => d.startsWith('sharp@')), 'node_modules', 'sharp'));
const dir = process.argv[2];
for (const f of readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
  const m = await sharp(join(dir, f)).metadata();
  console.log(`${m.width}x${m.height}\t${m.hasAlpha ? 'alpha' : ''}\t${f}`);
}
