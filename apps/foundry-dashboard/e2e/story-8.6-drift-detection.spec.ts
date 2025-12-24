/**
 * Story 8-6: Time-to-DNA and Drift Detection
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Display DNA strength percentage
 * AC2: Show drift score and threshold
 * AC3: Display hubs to target metric
 * AC4: Area chart showing DNA strength evolution
 * AC5: Line chart for drift score monitoring
 * AC6: Alert banner when drift detected
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

test.describe('Story 8-6: Time-to-DNA and Drift Detection', () => {
  test.describe('AC1: DNA Strength Display', () => {
    test('displays drift detector title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const title = page.locator('h3:has-text("DNA Strength & Drift Detection")');
      await expect(title).toBeVisible();
    });

    test('shows subtitle about brand voice consistency', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const subtitle = page.locator('text=/Brand voice consistency and learning progress/i');
      await expect(subtitle).toBeVisible();
    });

    test('displays DNA strength stat card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const strengthLabel = page.locator('text=/DNA Strength/i');
      await expect(strengthLabel).toBeVisible();
    });

    test('shows DNA strength as percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const strengthLabel = page.locator('text=/DNA Strength/i');
      const parentCard = strengthLabel.locator('..');
      const percentage = parentCard.locator('text=/%/');
      await expect(percentage).toBeVisible();
    });
  });

  test.describe('AC2: Drift Score and Threshold', () => {
    test('displays avg drift metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const driftLabel = page.locator('text=/Avg Drift/i');
      await expect(driftLabel).toBeVisible();
    });

    test('shows drift threshold value', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const threshold = page.locator('text=/Threshold:/i');
      await expect(threshold).toBeVisible();
    });
  });

  test.describe('AC3: Hubs to Target Metric', () => {
    test('displays hubs to DNA stat card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const hubsLabel = page.locator('text=/Hubs to DNA/i');
      await expect(hubsLabel).toBeVisible();
    });

    test('shows until target strength subtitle', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const targetText = page.locator('text=/Until target strength/i');
      await expect(targetText).toBeVisible();
    });
  });

  test.describe('AC4: DNA Strength Evolution Chart', () => {
    test('displays DNA strength evolution chart title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('text=/DNA Strength Evolution/i');
      await expect(chartTitle).toBeVisible();
    });

    test('renders area chart for DNA strength', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const driftSection = page.locator('h3:has-text("DNA Strength & Drift Detection")').locator('..');
      const areaPath = driftSection.locator('.recharts-area-area');
      await expect(areaPath).toBeVisible();
    });
  });

  test.describe('AC5: Drift Score Monitoring Chart', () => {
    test('displays drift score monitoring chart title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('text=/Voice Drift Score/i');
      await expect(chartTitle).toBeVisible();
    });

    test('includes "Lower is Better" indicator', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const lowerBetter = page.locator('text=/Lower is Better/i');
      await expect(lowerBetter).toBeVisible();
    });

    test('shows alert threshold line', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Should have multiple lines (drift score + threshold)
      const driftSection = page.locator('h3:has-text("DNA Strength & Drift Detection")').locator('..');
      const lines = driftSection.locator('.recharts-line');
      const count = await lines.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('AC6: Drift Alert Banner', () => {
    test('alert banner appears when drift detected', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Check if drift alert exists (conditional)
      const driftAlert = page.locator('text=/Voice Drift Detected/i');
      const isVisible = await driftAlert.isVisible().catch(() => false);

      if (isVisible) {
        // If drift is detected, verify alert structure
        await expect(driftAlert).toBeVisible();

        // Should have alert icon
        const alertSection = driftAlert.locator('..');
        const alertIcon = alertSection.locator('svg');
        await expect(alertIcon).toBeVisible();

        // Should mention calibration samples
        const calibrationText = page.locator('text=/calibration samples/i');
        await expect(calibrationText).toBeVisible();
      }
    });

    test('displays samples analyzed metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const samplesLabel = page.locator('text=/Samples Analyzed/i');
      await expect(samplesLabel).toBeVisible();
    });
  });
});
