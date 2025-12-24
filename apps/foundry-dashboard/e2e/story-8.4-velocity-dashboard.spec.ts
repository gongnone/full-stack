/**
 * Story 8-4: Content Volume and Review Velocity
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Display production volume metrics (hubs, spokes, reviews)
 * AC2: Show average review time per spoke
 * AC3: Chart showing daily production volume
 * AC4: Separate chart for review speed trend
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 8-4: Content Volume and Review Velocity', () => {
  test.describe('AC1: Production Volume Metrics', () => {
    test('displays velocity dashboard title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const title = page.locator('h3:has-text("Content Volume & Review Velocity")');
      await expect(title).toBeVisible();
    });

    test('shows hubs created metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const hubsMetric = page.locator('text=/Hubs Created/i');
      await expect(hubsMetric).toBeVisible();
    });

    test('shows spokes generated metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const spokesMetric = page.locator('text=/Spokes Generated/i');
      await expect(spokesMetric).toBeVisible();
    });

    test('shows spokes reviewed metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const reviewedMetric = page.locator('text=/Spokes Reviewed/i');
      await expect(reviewedMetric).toBeVisible();
    });

    test('shows review rate percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const rateMetric = page.locator('text=/Review Rate/i');
      await expect(rateMetric).toBeVisible();
    });
  });

  test.describe('AC2: Average Review Time', () => {
    test('displays avg review time stat card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const avgTime = page.locator('text=/Avg Review Time/i');
      await expect(avgTime).toBeVisible();
    });

    test('shows time value in seconds', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const avgTime = page.locator('text=/Avg Review Time/i');
      const parentCard = avgTime.locator('..');

      // Should show seconds
      const timeValue = parentCard.locator('text=/s/i');
      await expect(timeValue).toBeVisible();
    });
  });

  test.describe('AC3: Daily Production Volume Chart', () => {
    test('displays production volume chart title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('text=/Daily Production Volume/i');
      await expect(chartTitle).toBeVisible();
    });

    test('renders composed chart with bars and lines', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Should have bars for spokes
      const bars = page.locator('.recharts-bar-rectangle');
      const barCount = await bars.count();
      expect(barCount).toBeGreaterThan(0);

      // Should have line for hubs
      const lines = page.locator('.recharts-line');
      const lineCount = await lines.count();
      expect(lineCount).toBeGreaterThan(0);
    });
  });

  test.describe('AC4: Review Speed Trend Chart', () => {
    test('displays review speed chart subtitle', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('text=/Average Review Time per Spoke/i');
      await expect(chartTitle).toBeVisible();
    });

    test('shows review time trend line', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const velocitySection = page.locator('h3:has-text("Content Volume & Review Velocity")').locator('..');
      const reviewCharts = velocitySection.locator('.recharts-responsive-container');

      // Should have at least 2 charts (volume + review speed)
      const count = await reviewCharts.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });
});
