import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.tsx'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'worker/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    // Resource management for large test suites (Vitest 4 top-level options)
    pool: 'forks',
    maxWorkers: 4,
    minWorkers: 1,
    testTimeout: 10000,
    hookTimeout: 10000,
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
