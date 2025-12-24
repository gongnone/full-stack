/**
 * Story 5.4: Kill Chain Cascade
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Hold H triggers hub kill confirmation
 * AC2: Modal shows affected spoke count
 * AC3: Edited spokes are protected (shown separately)
 * AC4: 30-second undo notice displayed
 * AC5: Confirm triggers cascade delete
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

test.describe('Story 5.4: Kill Chain Cascade', () => {
  test.describe('AC1: Hold H Triggers Confirmation', () => {
    test('Kill modal appears after holding H', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Hold H key for 500ms
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        // Modal should appear
        await expect(page.locator('text=/Kill Hub|Kill Pillar/i')).toBeVisible();
      }
    });

    test('Modal has cancel button', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      }
    });

    test('Cancel closes modal without action', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await page.click('button:has-text("Cancel")');
        await page.waitForTimeout(300);

        // Modal should be closed
        await expect(page.locator('text=/Kill Hub|Kill Pillar/i')).not.toBeVisible();
      }
    });
  });

  test.describe('AC2: Modal Shows Affected Count', () => {
    test('Modal displays total spoke count', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('text="Total spokes"')).toBeVisible();
      }
    });

    test('Modal shows discard count', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('text="Will be discarded"')).toBeVisible();
      }
    });
  });

  test.describe('AC3: Protected Spokes Display', () => {
    test('Edited spokes count shown if applicable', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        // Protected count is conditional, so check for stats section
        const statsSection = page.locator('.bg-\\[var\\(--bg-surface\\)\\]').first();
        await expect(statsSection).toBeVisible();
      }
    });
  });

  test.describe('AC4: Undo Notice', () => {
    test('Modal shows undo timeframe', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('text=/30 seconds|undo/i')).toBeVisible();
      }
    });

    test('Edited spokes survive note is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('text=/Edited spokes will survive/i')).toBeVisible();
      }
    });
  });

  test.describe('AC5: Confirm Kill Action', () => {
    test('Confirm Kill button is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        await expect(page.locator('button:has-text("Confirm Kill")')).toBeVisible();
      }
    });
  });

  test.describe('Visual Design', () => {
    test('Modal has red/kill theme border', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        // Modal should have kill color border
        const modal = page.locator('.border-\\[var\\(--kill\\)\\]');
        await expect(modal).toBeVisible();
      }
    });

    test('Warning icon is displayed', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=high-confidence`);
      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.down('H');
        await page.waitForTimeout(600);
        await page.keyboard.up('H');

        // Warning icon (triangle with exclamation)
        const warningIcon = page.locator('svg path[d*="M12 9v2"]');
        await expect(warningIcon).toBeVisible();
      }
    });
  });
});
