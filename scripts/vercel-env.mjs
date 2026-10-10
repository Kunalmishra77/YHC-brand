// Sets demo environment variables on the linked Vercel project without trailing newlines.
// Usage: node scripts/vercel-env.mjs <scope>
import { spawnSync } from 'node:child_process';

const scope = process.argv[2];
import { readFileSync } from 'node:fs';

const local = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const fromLocal = (key) => {
  if (!local[key]) throw new Error(`${key} missing in .env.local`);
  return local[key];
};
const VARS = {
  DEMO_MODE: 'true',
  APP_ENV: 'staging',
  NEXT_PUBLIC_SITE_URL: 'https://yourhaircompany.com',
  ENABLE_EXPERIMENTAL_COREPACK: '1',
  NEXT_PUBLIC_SUPABASE_URL: fromLocal('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: fromLocal('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: fromLocal('SUPABASE_SERVICE_ROLE_KEY'),
};
const only = process.argv.slice(3);
const run = (args, input) =>
  spawnSync('vercel', [...args, '--scope', scope], { input, encoding: 'utf8', shell: true });

for (const [key, value] of Object.entries(VARS).filter(([k]) => only.length === 0 || only.includes(k))) {
  for (const target of ['production', 'preview']) {
    run(['env', 'remove', key, target, '--yes']);
    const res = run(['env', 'add', key, target], value);
    console.log(
      `${key} (${target}): ${res.status === 0 ? 'set' : `failed — ${res.stderr.trim().split('\n').pop()}`}`,
    );
  }
}
