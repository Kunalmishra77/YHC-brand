// Runs the Supabase CLI with .env.local loaded (SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, SUPABASE_PROJECT_REF).
// Usage: node scripts/supabase.mjs <args…>   — `{ref}` is replaced by SUPABASE_PROJECT_REF;
// `--write <file>` saves stdout to a file (used by db:types).
import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const ref = process.env.SUPABASE_PROJECT_REF ?? '';
const args = process.argv.slice(2).map((a) => a.replaceAll('{ref}', ref));
if (!ref && process.argv.slice(2).some((a) => a.includes('{ref}'))) {
  console.error('SUPABASE_PROJECT_REF is missing in .env.local');
  process.exit(1);
}
const outIndex = args.indexOf('--write');
const outFile = outIndex >= 0 ? args.splice(outIndex, 2)[1] : undefined;
const result = spawnSync('supabase', args, {
  stdio: outFile ? ['inherit', 'pipe', 'inherit'] : 'inherit',
  shell: process.platform === 'win32',
  encoding: 'utf8',
});
if (outFile && result.status === 0) writeFileSync(outFile, result.stdout);
process.exit(result.status ?? 1);
