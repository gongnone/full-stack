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
  test.describe('AC1: Multi-Line Chart Display', () => {
    test('displays critic pass rate trends chart', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const chartTitle = page.locator('h3:has-text("Critic Pass Rate Trends")');
      await expect(chartTitle).toBeVisible();

      // Check for subtitle
      const subtitle = page.locator('text=/First-pass approval rates by quality gate/i');
      await expect(subtitle).toBeVisible();
    });

    test('renders multiple lines for different gates', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Should have 4 lines (G2, G4, G5, G7)
      const lines = page.locator('.recharts-line-curve');
      const count = await lines.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('displays legend with gate names', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Check legend items
      await expect(page.locator('text=/G2 Hook/i')).toBeVisible();
      await expect(page.locator('text=/G4 Voice/i')).toBeVisible();
      await expect(page.locator('text=/G5 Platform/i')).toBeVisible();
      await expect(page.locator('text=/G7 Predicted/i')).toBeVisible();
    });
  });

  test.describe('AC2: Distinct Colors', () => {
    test('each gate line has unique color', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const lines = page.locator('.recharts-line-curve');
      const colors = new Set();

      for (let i = 0; i < Math.min(4, await lines.count()); i++) {
        const stroke = await lines.nth(i).getAttribute('stroke');
        if (stroke) colors.add(stroke);
      }

      // Should have at least 4 unique colors
      expect(colors.size).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('AC3: Gate Cards Display', () => {
    test('displays gate card for G2 Hook', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const g2Card = page.locator('text=/G2 Hook/i').last();
      await expect(g2Card).toBeVisible();

      // Should show percentage
      const parentDiv = g2Card.locator('..');
      await expect(parentDiv.locator('text=/%/')).toBeVisible();
    });

    test('displays gate card for G4 Voice', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const g4Card = page.locator('text=/G4 Voice/i').last();
      await expect(g4Card).toBeVisible();
    });

    test('displays gate card for G5 Platform', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const g5Card = page.locator('text=/G5 Platform/i').last();
      await expect(g5Card).toBeVisible();
    });

    test('displays gate card for G7 Predicted', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      const g7Card = page.locator('text=/G7 Predicted/i').last();
      await expect(g7Card).toBeVisible();
    });
  });

  test.describe('AC4: Progress Bars', () => {
    test('gate cards include visual progress bars', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/analytics`);
      await page.waitForTimeout(1500);

      // Look for progress bar elements (rounded-full divs)
      const progressBars = page.locator('.rounded-full');
      const count = await progressBars.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
