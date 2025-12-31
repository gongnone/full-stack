import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersConfig({
  test: {
    globals: true,
    // Use the workers pool for integration tests
    pool: '@cloudflare/vitest-pool-workers',
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          compatibilityDate: '2024-04-05',
          compatibilityFlags: ['nodejs_compat'],
        },
      },
    },
    include: [
      'worker/**/*.integration.test.{js,ts}',
      'worker/**/routers/__tests__/*.test.ts'
    ],
    exclude: [
      'src/**/*',
      'worker/**/*.spec.ts'
    ],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
