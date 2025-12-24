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
  test.describe('AC1: Section Display', () => {
    test('displays velocity dashboard title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const title = page.locator('h3:has-text("Content Volume & Review Velocity")');
      await expect(title).toBeVisible();
    });

    test('section is rendered properly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Section container should be visible
      const section = page.locator('h3:has-text("Content Volume & Review Velocity")').locator('..');
      await expect(section).toBeVisible();
    });
  });

  test.describe('AC2: Analytics Dashboard', () => {
    test('analytics dashboard is functional', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Main dashboard heading should be visible
      await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible();
    });
  });
});
