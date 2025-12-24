/**
 * Story 5.5: Clone Best & Variations
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Clone button visible for high G7 spokes (>= 9.0)
 * AC2: C key opens clone modal
 * AC3: Variation count selector (1-5)
 * AC4: Platform selection (LinkedIn, X/Twitter, Threads)
 * AC5: Vary angle toggle option
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

test.describe('Story 5.5: Clone Best & Variations', () => {
  test.describe('AC1: Clone Button for High G7', () => {
    test('Clone button visible for high scoring spokes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Clone button should be visible for high confidence spokes
        const cloneButton = page.locator('button:has-text("Clone")');
        await expect(cloneButton).toBeVisible();
      }
    });
  });

  test.describe('AC2: C Key Opens Modal', () => {
    test('Pressing C opens clone modal', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Clone Best"')).toBeVisible();
      }
    });

    test('Clicking Clone button opens modal', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.click('button:has-text("Clone")');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Clone Best"')).toBeVisible();
      }
    });

    test('Modal shows original spoke preview', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Original Spoke"')).toBeVisible();
      }
    });

    test('Modal shows G7 score badge', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text=/G7:/i')).toBeVisible();
      }
    });
  });

  test.describe('AC3: Variation Count Selector', () => {
    test('Variation count buttons are visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Number of Variations"')).toBeVisible();
      }
    });

    test('Can select variation counts 1-5', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        // Check all 5 buttons exist
        for (let i = 1; i <= 5; i++) {
          await expect(page.locator(`button:has-text("${i}")`).first()).toBeVisible();
        }
      }
    });

    test('Default variation count is 3', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        // Button 3 should be selected (has edit color)
        const selectedButton = page.locator('button.bg-\\[var\\(--edit\\)\\]:has-text("3")');
        await expect(selectedButton).toBeVisible();
      }
    });
  });

  test.describe('AC4: Platform Selection', () => {
    test('Platform selection section is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Target Platforms"')).toBeVisible();
      }
    });

    test('LinkedIn platform option visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="LinkedIn"')).toBeVisible();
      }
    });

    test('X/Twitter platform option visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text=/X \\/ Twitter|Twitter/i')).toBeVisible();
      }
    });

    test('Threads platform option visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Threads"')).toBeVisible();
      }
    });
  });

  test.describe('AC5: Vary Angle Toggle', () => {
    test('Vary angle checkbox is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Vary Psychological Angle"')).toBeVisible();
      }
    });

    test('Vary angle description is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await expect(page.locator('text=/variations in hook and angle/i')).toBeVisible();
      }
    });
  });

  test.describe('Modal Actions', () => {
    test('Cancel button closes modal', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        await page.click('button:has-text("Cancel")');
        await page.waitForTimeout(300);

        await expect(page.locator('text="Clone Best"')).not.toBeVisible();
      }
    });

    test('Clone button shows variation count', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        // Default is 3 variations
        await expect(page.locator('button:has-text("Clone 3 Variations")')).toBeVisible();
      }
    });

    test('Clone button disabled without platform', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        // Deselect default platform
        await page.click('button:has-text("LinkedIn")');
        await page.waitForTimeout(100);

        // Clone button should be disabled
        const cloneButton = page.locator('button:has-text("Clone"):not(:has-text("Clone Best"))');
        await expect(cloneButton).toBeDisabled();
      }
    });
  });

  test.describe('Visual Design', () => {
    test('Modal has approve glow for G7 badge', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('C');
        await page.waitForTimeout(300);

        const badge = page.locator('.bg-\\[var\\(--approve-glow\\)\\]');
        await expect(badge).toBeVisible();
      }
    });
  });
});
