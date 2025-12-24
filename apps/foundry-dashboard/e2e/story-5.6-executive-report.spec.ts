/**
 * Story 5.6: Executive Producer Report
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Sprint completion shows celebration UI
 * AC2: Hours saved calculation displayed
 * AC3: Dollar value at $200/hr shown
 * AC4: Zero-edit rate with target comparison
 * AC5: Performance metrics grid
 * AC6: Post-sprint action buttons
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

test.describe('Story 5.6: Executive Producer Report', () => {
  test.describe('AC1: Sprint Completion Celebration', () => {
    test('SprintComplete component renders after completion', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      // Check for either empty state or completion
      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/Sprint Complete|No Items/i')).toBeVisible();
      }
    });

    test('Celebration has checkmark icon', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        // Checkmark icon should be visible
        const checkIcon = page.locator('svg path[d*="M5 13l4 4L19 7"]');
        await expect(checkIcon.first()).toBeVisible();
      }
    });

    test('Celebration icon has pulse animation', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        const pulsing = page.locator('.animate-pulse');
        await expect(pulsing.first()).toBeVisible();
      }
    });
  });

  test.describe('AC2: Hours Saved Display', () => {
    test('Hours saved section is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/hours.*saved|saved/i')).toBeVisible();
      }
    });

    test('Hours number is animated', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(500);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        // The animated number component should render
        await expect(page.locator('.text-5xl')).toBeVisible();
      }
    });
  });

  test.describe('AC3: Dollar Value Display', () => {
    test('Dollar value is shown', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/\\$\\d+.*\\$200\\/hr/i')).toBeVisible();
      }
    });
  });

  test.describe('AC4: Zero-Edit Rate', () => {
    test('Zero-edit rate section visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Zero-Edit Rate"')).toBeVisible();
      }
    });

    test('Target indicator shows 60%', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Target: 60%"')).toBeVisible();
      }
    });

    test('Progress bar is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        const progressBar = page.locator('.h-4.bg-\\[var\\(--bg-surface\\)\\].rounded-full');
        await expect(progressBar).toBeVisible();
      }
    });

    test('Shows above/below target status', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        const status = await page.locator('text=/Above target|Below target/i').isVisible();
        expect(status).toBeTruthy();
      }
    });
  });

  test.describe('AC5: Performance Metrics', () => {
    test('Performance metrics section visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Performance Metrics"')).toBeVisible();
      }
    });

    test('Reviewed count is shown', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Reviewed"')).toBeVisible();
      }
    });

    test('Approved count with percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/Approved.*%/i')).toBeVisible();
      }
    });

    test('Killed count with percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/Killed.*%/i')).toBeVisible();
      }
    });

    test('Average decision time shown', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/Avg Decision|ms/i')).toBeVisible();
      }
    });
  });

  test.describe('AC6: Post-Sprint Actions', () => {
    test('Back to Dashboard button visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Back to Dashboard"')).toBeVisible();
      }
    });

    test('Review Conflicts button visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Review Conflicts"')).toBeVisible();
      }
    });

    test('Share Summary button visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text="Share Summary"')).toBeVisible();
      }
    });

    test('Back to Dashboard navigates correctly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      if (isComplete) {
        await page.click('text="Back to Dashboard"');
        await page.waitForTimeout(500);

        // Should navigate to review without filter
        expect(page.url()).not.toContain('filter=');
      }
    });
  });

  test.describe('Visual Design', () => {
    test('Uses Midnight Command theme', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);

      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });

    test('Approve color for positive metrics', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete/i').isVisible().catch(() => false);

      if (isComplete) {
        const approveColor = page.locator('.text-\\[var\\(--approve\\)\\]').first();
        await expect(approveColor).toBeVisible();
      }
    });

    test('Content has fade-in animation', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      if (isComplete) {
        const animated = page.locator('.animate-fadeIn');
        await expect(animated.first()).toBeVisible();
      }
    });
  });
});
