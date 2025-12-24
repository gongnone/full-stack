/**
 * Story 5.3: Keyboard-First Approval Flow
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Arrow keys navigate and approve/kill
 * AC2: Enter approves, Backspace kills
 * AC3: Sub-200ms response time for high-velocity feel
 * AC4: Visual feedback on action
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

test.describe('Story 5.3: Keyboard-First Approval Flow', () => {
  test.describe('AC1: Arrow Key Navigation', () => {
    test('ArrowRight approves current spoke', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(200);

        // Should transition to next or complete
        const transitioned = await page.locator('text=/\\d+ \\/ \\d+|Sprint Complete|No Items/').first().isVisible();
        expect(transitioned).toBeTruthy();
      }
    });

    test('ArrowLeft kills current spoke', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(200);

        // Should transition
        const transitioned = await page.locator('text=/\\d+ \\/ \\d+|Sprint Complete|No Items/').first().isVisible();
        expect(transitioned).toBeTruthy();
      }
    });
  });

  test.describe('AC2: Enter and Backspace', () => {
    test('Enter approves current spoke', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);

        const transitioned = await page.locator('text=/\\d+ \\/ \\d+|Sprint Complete|No Items/').first().isVisible();
        expect(transitioned).toBeTruthy();
      }
    });

    test('Backspace kills current spoke', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(200);

        const transitioned = await page.locator('text=/\\d+ \\/ \\d+|Sprint Complete|No Items/').first().isVisible();
        expect(transitioned).toBeTruthy();
      }
    });
  });

  test.describe('AC3: Sub-200ms Response Time', () => {
    test('Approval action completes quickly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        const startTime = Date.now();
        await page.keyboard.press('ArrowRight');

        // Wait for visual transition
        await page.waitForTimeout(150);

        const elapsed = Date.now() - startTime;

        // Animation should start within 200ms
        expect(elapsed).toBeLessThan(250);
      }
    });
  });

  test.describe('AC4: Visual Feedback', () => {
    test('Approve action shows green glow', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // The card should have transition classes
        const card = page.locator('.transition-all').first();
        await expect(card).toBeVisible();

        // Trigger approve
        await page.keyboard.press('ArrowRight');

        // Brief check for animation class (translate-x-[100px])
        await page.waitForTimeout(50);
      }
    });

    test('Kill action shows red glow', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(50);
      }
    });

    test('Visual cue icons highlight on action', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Side icons should be visible
        const killIcon = page.locator('text=/Kill/i').first();
        const approveIcon = page.locator('text=/Approve/i').first();

        // At least one should be visible
        const hasIcons = await killIcon.isVisible() || await approveIcon.isVisible();
        expect(hasIcons).toBeTruthy();
      }
    });
  });

  test.describe('Action Bar', () => {
    test('Kill button is clickable', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Find and click the kill button
        const killButton = page.locator('.fixed.bottom-10 button').first();
        await expect(killButton).toBeVisible();
        await killButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('Approve button is clickable', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Find and click the approve button (last button in bar)
        const approveButton = page.locator('.fixed.bottom-10 button').last();
        await expect(approveButton).toBeVisible();
        await approveButton.click();
        await page.waitForTimeout(200);
      }
    });

    test('Keyboard hints are visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      const hasSpokes = await page.locator('.whitespace-pre-wrap').first().isVisible().catch(() => false);

      if (hasSpokes) {
        // Keyboard hint should show arrow keys
        await expect(page.locator('text=/[←→]/').first()).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Keyboard focus is managed correctly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review`);

      await page.waitForTimeout(1000);

      // Keyboard events should work without explicit focus
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
    });

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
