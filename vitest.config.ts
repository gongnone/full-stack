import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/e2e/**', // Global exclude for Playwright E2E tests
      '**/*.spec.ts', // Convention: .spec.ts for Playwright, .test.ts for Vitest
    ],
  },
});
