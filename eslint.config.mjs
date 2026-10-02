import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import/no-default-export': 'error',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/supabase/admin',
              message: 'Service-role client is only allowed in src/server/** and src/app/api/** (CLAUDE.md).',
            },
          ],
        },
      ],
    },
  },
  {
    // Service role allowed here only.
    files: ['src/server/**', 'src/app/api/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Next.js route files and tool configs need default exports.
    files: [
      'src/app/**/{page,layout,loading,error,not-found,forbidden,global-error,template,default,route,opengraph-image,icon,sitemap,robots}.{ts,tsx}',
      'src/proxy.ts',
      '*.config.{ts,mts,mjs,js}',
    ],
    rules: { 'import/no-default-export': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**', 'playwright-report/**']),
]);

export default eslintConfig;
