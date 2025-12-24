/**
 * Story 8-5: Kill Chain Analytics
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Display kill statistics (total, hubs, spokes)
 * AC2: Show kill rate trend over time
 * AC3: Display top kill reasons with percentages
 * AC4: Bar chart visualizing kill reasons
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

test.describe('Story 8-5: Kill Chain Analytics', () => {
  test.describe('AC1: Kill Statistics', () => {
    test('displays kill chain analytics title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const title = page.locator('h3:has-text("Kill Chain Analytics")');
      await expect(title).toBeVisible();
    });

    test('shows subtitle about learning opportunities', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const subtitle = page.locator('text=/Learning from rejected content patterns/i');
      await expect(subtitle).toBeVisible();
    });

    test('displays total kills metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const totalKills = page.locator('text=/Total Kills/i');
      await expect(totalKills).toBeVisible();
    });

    test('displays hub kills metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const hubKills = page.locator('text=/Hub Kills/i');
      await expect(hubKills).toBeVisible();
    });

    test('displays spoke kills metric', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const spokeKills = page.locator('text=/Spoke Kills/i');
      await expect(spokeKills).toBeVisible();
    });

    test('displays trend indicator', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const trend = page.locator('text=/Trend/i');
      await expect(trend).toBeVisible();

      // Should have up or down arrow
      const parentCard = trend.locator('..');
      const arrow = parentCard.locator('text=/[↑↓]/');
      await expect(arrow).toBeVisible();
    });
  });

  test.describe('AC2: Kill Rate Trend', () => {
    test('displays kill rate trend chart title', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('text=/Kill Rate Trend/i');
      await expect(chartTitle).toBeVisible();
    });

    test('includes "Lower is Better" indicator', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const lowerBetter = page.locator('text=/Lower is Better/i');
      await expect(lowerBetter).toBeVisible();
    });

    test('renders multi-line chart for kill trends', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const killSection = page.locator('h3:has-text("Kill Chain Analytics")').locator('..');
      const lines = killSection.locator('.recharts-line');

      // Should have multiple lines (total, hub, spoke kills)
      const count = await lines.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('AC3: Top Kill Reasons', () => {
    test('displays top kill reasons section', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const reasonsTitle = page.locator('text=/Top Kill Reasons/i');
      await expect(reasonsTitle).toBeVisible();
    });

    test('shows kill reasons with percentages', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const reasonsSection = page.locator('text=/Top Kill Reasons/i').locator('..');

      // Should show Voice Mismatch as a common reason
      const voiceMismatch = reasonsSection.locator('text=/Voice Mismatch/i');
      await expect(voiceMismatch).toBeVisible();

      // Should show percentage
      const percentage = reasonsSection.locator('text=/%\\)/');
      await expect(percentage.first()).toBeVisible();
    });

    test('displays progress bars for kill reasons', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for progress bars (rounded-full elements)
      const killSection = page.locator('h3:has-text("Kill Chain Analytics")').locator('..');
      const progressBars = killSection.locator('.rounded-full');
      const count = await progressBars.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('AC4: Kill Reasons Bar Chart', () => {
    test('displays bar chart for kill reasons', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const killSection = page.locator('h3:has-text("Kill Chain Analytics")').locator('..');
      const bars = killSection.locator('.recharts-bar-rectangle');
      const count = await bars.count();
      expect(count).toBeGreaterThan(0);
    });

    test('bar chart uses varied colors', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const killSection = page.locator('h3:has-text("Kill Chain Analytics")').locator('..');
      const bars = killSection.locator('.recharts-bar-rectangle');
      const colors = new Set();

      for (let i = 0; i < Math.min(5, await bars.count()); i++) {
        const fill = await bars.nth(i).getAttribute('fill');
        if (fill) colors.add(fill);
      }

      // Should have multiple colors
      expect(colors.size).toBeGreaterThanOrEqual(2);
    });
  });
});
