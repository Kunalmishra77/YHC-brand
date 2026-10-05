// Sets demo environment variables on the linked Vercel project without trailing newlines.
// Usage: node scripts/vercel-env.mjs <scope>
import { spawnSync } from 'node:child_process';

const scope = process.argv[2];
const VARS = {
  DEMO_MODE: 'true',
  APP_ENV: 'staging',
  NEXT_PUBLIC_SITE_URL: 'https://yhc-brand.vercel.app',
  ENABLE_EXPERIMENTAL_COREPACK: '1',
};
const run = (args, input) =>
  spawnSync('vercel', [...args, '--scope', scope], { input, encoding: 'utf8', shell: true });

for (const [key, value] of Object.entries(VARS)) {
  for (const target of ['production', 'preview']) {
    run(['env', 'remove', key, target, '--yes']);
    const res = run(['env', 'add', key, target], value);
    console.log(
      `${key} (${target}): ${res.status === 0 ? 'set' : `failed — ${res.stderr.trim().split('\n').pop()}`}`,
    );
  }
}
