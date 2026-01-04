import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Worker unit tests configuration
 *
 * These tests mock all dependencies and don't need the Workers runtime.
 * Run with: pnpm test:worker
 */
export default defineConfig({
  test: {
    globals: true,
    // Node environment for worker unit tests with mocked dependencies
    environment: 'node',
    include: [
      'worker/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'worker/**/*.integration.test.ts',
      'node_modules/**',
    ],
    pool: 'forks',
    isolate: true,
    retry: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
