// Upserts KEY=VALUE pairs into .env.local without printing values.
// Usage: node scripts/set-env-local.mjs KEY=VALUE [KEY=VALUE…]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const file = '.env.local';
const lines = existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/) : [];
for (const pair of process.argv.slice(2)) {
  const i = pair.indexOf('=');
  const key = pair.slice(0, i);
  const value = pair.slice(i + 1);
  const at = lines.findIndex((l) => l.startsWith(`${key}=`));
  if (at >= 0) lines[at] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
  console.log(`set ${key}`);
}
writeFileSync(file, lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n'));
