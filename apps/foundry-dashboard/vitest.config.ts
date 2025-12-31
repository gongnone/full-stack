import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineWorkersConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'worker/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    // Default to 'forks' pool for unit tests (fast, no worker runtime needed)
    pool: 'forks',
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityDate: '2024-04-05',
          compatibilityFlags: ['nodejs_compat'],
          d1Databases: ['DB'],
          r2Buckets: ['ASSETS'],
          kvNamespaces: ['KV'],
        },
      },
    },
    // Isolate tests to prevent memory leaks between files
    isolate: true,
    // Retry flaky tests once
    retry: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/components/**/*.tsx'],
      exclude: ['src/components/**/index.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
