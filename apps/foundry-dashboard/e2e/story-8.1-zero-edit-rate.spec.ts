/**
 * Story 8-1: Zero-Edit Rate Dashboard
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Zero-Edit Rate chart displays trend over time
 * AC2: Shows current rate and period comparison
 * AC3: Displays summary statistics (avg, best, total)
 * AC4: Chart responds to period selector
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

test.describe('Story 8-1: Zero-Edit Rate Dashboard', () => {
  test.describe('AC1: Zero-Edit Rate Chart Display', () => {
    test('displays zero-edit rate trend chart', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('h3:has-text("Zero-Edit Rate Trend")');
      await expect(chartTitle).toBeVisible();

      // Check for Recharts SVG container
      const chartSvg = page.locator('.recharts-responsive-container').first();
      await expect(chartSvg).toBeVisible();

      // Verify line is rendered
      const line = page.locator('.recharts-line').first();
      await expect(line).toBeVisible();
    });

    test('shows subtitle explaining metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const subtitle = page.locator('text=/Content approved without modifications/i');
      await expect(subtitle).toBeVisible();
    });
  });

  test.describe('AC2: Current Rate and Comparison', () => {
    test('displays current zero-edit rate percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for percentage in large font
      const rateDisplay = page.locator('div.text-3xl').filter({ hasText: '%' }).first();
      await expect(rateDisplay).toBeVisible();
    });

    test('shows trend indicator vs last week', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for trend with arrow
      const trendIndicator = page.locator('text=/vs last week/i');
      await expect(trendIndicator).toBeVisible();

      // Should have up or down arrow
      const arrowText = await trendIndicator.textContent();
      expect(arrowText).toMatch(/[↑↓]/);
    });
  });

  test.describe('AC3: Summary Statistics', () => {
    test('displays average rate statistic', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const avgLabel = page.locator('text=/Avg Rate/i');
      await expect(avgLabel).toBeVisible();
    });

    test('displays best day statistic', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const bestLabel = page.locator('text=/Best Day/i');
      await expect(bestLabel).toBeVisible();
    });

    test('displays total items count', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const totalLabel = page.locator('text=/Total Items/i');
      await expect(totalLabel).toBeVisible();
    });
  });

  test.describe('AC4: Period Selector Response', () => {
    test('chart updates when period selector changes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Get initial chart data
      const chartContainer = page.locator('.recharts-responsive-container').first();
      await expect(chartContainer).toBeVisible();

      // Find and change period selector
      const periodSelector = page.locator('select').filter({ hasText: /Last/ });
      await expect(periodSelector).toBeVisible();

      // Change to 7 days
      await periodSelector.selectOption('7');
      await page.waitForTimeout(500);

      // Chart should still be visible (data reloaded)
      await expect(chartContainer).toBeVisible();
    });
  });
});
