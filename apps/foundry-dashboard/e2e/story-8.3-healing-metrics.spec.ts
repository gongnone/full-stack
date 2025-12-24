/**
 * Story 8-3: Self-Healing Efficiency Metrics
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Display average loops per spoke metric
 * AC2: Show healing success rate percentage
 * AC3: Chart showing loops trend over time (lower is better)
 * AC4: Bar chart of top failure gates triggering heals
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 8-3: Self-Healing Efficiency Metrics', () => {
  test.describe('AC1: Average Loops Metric', () => {
    test('displays avg loops per spoke stat card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const loopsLabel = page.locator('text=/Avg Loops per Spoke/i');
      await expect(loopsLabel).toBeVisible();
    });

    test('shows numeric value for average loops', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const loopsLabel = page.locator('text=/Avg Loops per Spoke/i');
      const parentCard = loopsLabel.locator('..');

      // Should have a numeric display
      const numericValue = parentCard.locator('.text-2xl');
      await expect(numericValue).toBeVisible();
    });
  });

  test.describe('AC2: Success Rate Percentage', () => {
    test('displays success rate stat card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const successLabel = page.locator('text=/Success Rate/i');
      await expect(successLabel).toBeVisible();
    });

    test('shows percentage value for success rate', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const successLabel = page.locator('text=/Success Rate/i');
      const parentCard = successLabel.locator('..');

      // Should have percentage display
      const percentValue = parentCard.locator('text=/%/');
      await expect(percentValue).toBeVisible();
    });
  });

  test.describe('AC3: Loops Trend Chart', () => {
    test('displays self-healing efficiency title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('h3:has-text("Self-Healing Efficiency")');
      await expect(chartTitle).toBeVisible();
    });

    test('shows loops per spoke trend subtitle', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const subtitle = page.locator('text=/Loops per Spoke Trend/i');
      await expect(subtitle).toBeVisible();
    });

    test('displays line chart for loops trend', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for recharts line in healing metrics section
      const healingSection = page.locator('h3:has-text("Self-Healing Efficiency")').locator('..');
      const chartLine = healingSection.locator('.recharts-line');
      await expect(chartLine).toBeVisible();
    });

    test('includes "Lower is Better" indicator', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const lowerBetter = page.locator('text=/Lower is Better/i');
      await expect(lowerBetter).toBeVisible();
    });
  });

  test.describe('AC4: Top Failure Gates Bar Chart', () => {
    test('displays top healing triggers section', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const triggersTitle = page.locator('text=/Top Healing Triggers/i');
      await expect(triggersTitle).toBeVisible();
    });

    test('shows bar chart for failure gates', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for recharts bars
      const bars = page.locator('.recharts-bar-rectangle');
      const count = await bars.count();
      expect(count).toBeGreaterThan(0);
    });

    test('displays total heals metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const totalHeals = page.locator('text=/Total Heals/i');
      await expect(totalHeals).toBeVisible();
    });
  });
});
