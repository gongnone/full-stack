import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Foundry Dashboard E2E tests
 * @see https://playwright.dev/docs/test-configuration
 *
 * Environment variables:
 * - BASE_URL: Target URL (default: http://localhost:5173)
 * - TEST_EMAIL: Test user email
 * - TEST_PASSWORD: Test user password
 */

const isRemote = !!process.env.BASE_URL && !process.env.BASE_URL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  /* Ignore draft test specifications until features are implemented */
  testIgnore: /.*\.spec\.draft\.ts$/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests to catch transient network issues (2 retries on CI, 0 locally) */
  retries: process.env.CI ? 2 : 0,
  /*
   * Workers: Use parallel execution on CI with sharding for test isolation
   * Each shard gets its own worker, preventing login race conditions
   * Locally: unlimited workers for fast feedback
   */
  workers: process.env.CI ? '50%' : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['list'],
        ['blob'], // For merging sharded reports
        ['github'], // GitHub Actions annotations
      ]
    : 'html',
  /*
   * Timeout: 60s for remote/CI to account for Cloudflare staging latency
   * 30s locally where network is fast
   */
  timeout: process.env.CI || isRemote ? 60000 : 30000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on retry to debug flaky tests */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  /* On CI: Only run Chromium to stay within 30min timeout per shard */
  /* Locally: Run all browsers for comprehensive testing */
  projects: process.env.CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
          retries: 1,
        },
      ],

  /* Run your local dev server before starting the tests - skip for remote URLs */
  webServer: isRemote ? undefined : [
    {
      command: 'pnpm exec wrangler dev --local --port 5173',
      url: 'http://localhost:5173/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm exec wrangler dev --local --port 8787',
      url: 'http://localhost:8787/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      cwd: '../foundry-engine'
    }
  ],
});
