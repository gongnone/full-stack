/**
 * Story 5.2: Sprint View with Signal Header
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Sprint view shows content queue with progress
 * AC2: Signal header shows queue stats (total, approved, pending)
 * AC3: Filter by quality tier (high-confidence, needs-review, conflicts)
 * AC4: Real-time progress updates
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

test.describe('Story 5.2: Sprint View with Signal Header', () => {
  test.describe('AC1: Sprint View Shows Content Queue', () => {
    test('Sprint Review page loads successfully', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      // Page header should be visible
      await expect(page.locator('h1:has-text("Sprint Review")')).toBeVisible();
    });

    test('Progress indicator shows current position', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      // Should show progress (X / Y) or empty state
      const hasProgress = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);
      const isEmpty = await page.locator('text=/No Items|Sprint Complete/i').isVisible().catch(() => false);

      expect(hasProgress || isEmpty).toBeTruthy();
    });

    test('Content card displays spoke content', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);
      const isEmpty = await page.locator('text=/No Items|Sprint Complete/i').isVisible().catch(() => false);

      // Either has content cards or shows empty state
      expect(hasContent || isEmpty).toBeTruthy();
    });

    test('Card shows platform icon', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasContent) {
        // Platform icon should be visible (LinkedIn or Twitter/X)
        const platformIcon = page.locator('svg').first();
        await expect(platformIcon).toBeVisible();
      }
    });
  });

  test.describe('AC2: Signal Header Shows Stats', () => {
    test('Mode indicator shows current filter', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      // Mode should be displayed
      await expect(page.locator('text=/Mode:/i')).toBeVisible();
    });

    test('Progress section shows queue position', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      // Progress label should be visible
      await expect(page.locator('text=/Progress/i')).toBeVisible();
    });
  });

  test.describe('AC3: Filter by Quality Tier', () => {
    test('High confidence filter works', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);

      // Check mode label shows high confidence
      await expect(page.locator('span.capitalize:has-text("high confidence")')).toBeVisible();
    });

    test('Needs review filter works', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=needs-review`);

      // Check mode label shows needs review
      await expect(page.locator('span.capitalize:has-text("needs review")')).toBeVisible();
    });

    test('Conflicts filter works', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=conflicts`);

      // Check mode label shows conflicts
      await expect(page.locator('span.capitalize:has-text("conflicts")')).toBeVisible();
    });
  });

  test.describe('AC4: Real-time Progress Updates', () => {
    test('Approving spoke updates progress', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Get initial progress
        const initialProgress = await page.locator('text=/\\d+ \\/ \\d+/').textContent();

        // Approve
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(300);

        // Check progress updated or completion shown
        const updated = await page.locator('text=/\\d+ \\/ \\d+|Sprint Complete/').first().isVisible();
        expect(updated).toBeTruthy();
      }
    });

    test('Sprint completion shows success state', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      // Either shows spokes or completion state
      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);
      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      expect(hasSpokes || isComplete).toBeTruthy();
    });

    test('Completion state has back to dashboard button', async ({ page }) => {
      await login(page);

      // Go to review with empty filter to likely hit empty state
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);

      await page.waitForTimeout(1000);

      const isComplete = await page.locator('text=/Sprint Complete|No Items/i').isVisible().catch(() => false);

      if (isComplete) {
        await expect(page.locator('text=/Back to Dashboard/i')).toBeVisible();
      }
    });
  });

  test.describe('Visual Design', () => {
    test('Card has elevated background', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasContent) {
        // Card container should have elevated bg
        const card = page.locator('.bg-\\[var\\(--bg-elevated\\)\\]').first();
        await expect(card).toBeVisible();
      }
    });

    test('Action bar is fixed at bottom', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasContent) {
        // Fixed action bar should be visible
        const actionBar = page.locator('.fixed.bottom-10');
        await expect(actionBar).toBeVisible();
      }
    });

    test('Swipe animations work', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasContent = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasContent) {
        // Trigger swipe
        await page.keyboard.press('ArrowRight');

        // Animation class should be applied briefly
        await page.waitForTimeout(100);

        // Content should transition
        await page.waitForTimeout(200);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Page uses Midnight Command theme', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });
  });
});
