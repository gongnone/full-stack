import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Use jsdom for React component tests
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.tsx'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'worker/**/*',
      'node_modules/**',
    ],
    // Default to 'forks' pool for unit tests (fast)
    pool: 'forks',
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
