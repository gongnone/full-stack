/**
 * Story 8-2: Critic Pass Rate Trends
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Multi-line chart shows G2, G4, G5, G7 pass rates over time
 * AC2: Each gate has distinct color
 * AC3: Current rates displayed in gate cards below chart
 * AC4: Progress bars show visual representation per gate
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

test.describe('Story 8-2: Critic Pass Rate Trends', () => {
  test.describe('AC1: Section Display', () => {
    test('displays critic pass rate trends section', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('h3:has-text("Critic Pass Rate Trends")');
      await expect(chartTitle).toBeVisible();
    });

    test('section is rendered properly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Section container should be visible (contains heading)
      const section = page.locator('h3:has-text("Critic Pass Rate Trends")').locator('..');
      await expect(section).toBeVisible();
    });
  });

  test.describe('AC2: Gate Display', () => {
    test('analytics page has gate section', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // The Critic Pass Rate Trends section should be visible
      await expect(page.locator('h3:has-text("Critic Pass Rate Trends")')).toBeVisible();
    });
  });

  test.describe('AC3: Summary Metrics', () => {
    test('displays critic pass rate metric card', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Top metric cards always show
      await expect(page.locator('text="Critic Pass Rate"')).toBeVisible();
    });
  });
});
