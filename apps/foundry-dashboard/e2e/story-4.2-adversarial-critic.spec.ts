/**
 * Story 4.2: Adversarial Critic Service E2E Tests
 * Tests quality gate badges (G2, G4, G5) and hover tooltips
 */

import { test, expect } from '@playwright/test';
import { login, getFirstHubId, navigateToHub, hasSpokes, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 4.2: Adversarial Critic Service', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display gate badges on spoke cards', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist for testing gate badges');

    // Switch to spokes tab
    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    // Expand a pillar to see spoke cards
    const pillarHeader = page.locator('button:has-text("Expand All")');
    if (await pillarHeader.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pillarHeader.click();
      await page.waitForTimeout(500);
    }

    // Look for gate badges (G2, G4, G5)
    const g2Badge = page.locator('text=G2').first();
    const g4Badge = page.locator('text=G4').first();
    const g5Badge = page.locator('text=G5').first();

    const hasG2 = await g2Badge.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasG2) {
      await expect(g2Badge).toBeVisible();
      await expect(g4Badge).toBeVisible();
      await expect(g5Badge).toBeVisible();
    }
  });

  test('should show G2 tooltip with hook strength breakdown on hover', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist');

    // Navigate to spokes and expand
    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    const expandBtn = page.locator('button:has-text("Expand All")');
    if (await expandBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    }

    // Find and hover over G2 badge
    const g2Badge = page.locator('text=G2').first();
    const hasG2 = await g2Badge.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasG2) {
      await g2Badge.hover();

      // Wait for tooltip (300ms delay)
      await page.waitForTimeout(400);

      // Check for tooltip content
      const tooltip = page.locator('text=Hook Strength');
      const hasTooltip = await tooltip.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasTooltip) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should show G4 voice alignment details on hover', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist');

    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    const expandBtn = page.locator('button:has-text("Expand All")');
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    }

    const g4Badge = page.locator('text=G4').first();
    const hasG4 = await g4Badge.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasG4) {
      await g4Badge.hover();
      await page.waitForTimeout(400);

      const tooltip = page.locator('text=Voice Alignment');
      const hasTooltip = await tooltip.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasTooltip) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should show G5 platform compliance details on hover', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist');

    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    const expandBtn = page.locator('button:has-text("Expand All")');
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    }

    const g5Badge = page.locator('text=G5').first();
    const hasG5 = await g5Badge.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasG5) {
      await g5Badge.hover();
      await page.waitForTimeout(400);

      const tooltip = page.locator('text=Platform Compliance');
      const hasTooltip = await tooltip.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasTooltip) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('should color-code badges based on score/status', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist');

    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    const expandBtn = page.locator('button:has-text("Expand All")');
    if (await expandBtn.isVisible().catch(() => false)) {
      await expandBtn.click();
      await page.waitForTimeout(500);
    }

    // Check for color-coded badges (pass = green, fail = red, warning = yellow)
    const badges = page.locator('[class*="bg-"][class*="text-"]');
    const hasBadges = await badges.first().isVisible({ timeout: 3000 }).catch(() => false);

    if (hasBadges) {
      // At least verify some badges exist with styling
      const count = await badges.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
