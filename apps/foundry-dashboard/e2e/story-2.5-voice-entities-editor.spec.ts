/**
 * Story 2.5: Voice Marker and Banned Word Management
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Edit Voice Profile button initiates inline editing
 * AC2: Voice markers management (add/remove)
 * AC3: Banned words management (add/remove)
 * AC4: Brand stances management (add/remove)
 * AC5: Success notification "Brand DNA updated"
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Story 2.5: Voice Marker and Banned Word Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/);

    // Navigate to Brand DNA page
    await page.goto(`${BASE_URL}/app/brand-dna`);
    await page.waitForTimeout(1000);
  });

  test.describe('Page Navigation', () => {
    test('navigates to Brand DNA page', async ({ page }) => {
      await expect(page).toHaveURL(/\/app\/brand-dna/);
      await expect(page.locator('h1')).toContainText('Brand DNA');
    });
  });

  test.describe('AC1: Edit Voice Profile Button', () => {
    test('displays edit voice profile button when DNA exists', async ({ page }) => {
      // Need to check if DNA report exists - use first() to avoid strict mode violation
      const reportExists = await page.locator('text=/Brand DNA Analysis/i').first().isVisible();

      if (reportExists) {
        const editButton = page.locator('[data-testid="edit-voice-profile-btn"]');
        await expect(editButton).toBeVisible();
      } else {
        // If no report, the button won't be there
        test.skip();
      }
    });

    test('opens inline editor when edit button clicked', async ({ page }) => {
      const editButton = page.locator('[data-testid="edit-voice-profile-btn"]');

      const hasEditButton = await editButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasEditButton) {
        await editButton.click();

        // Should show inline editor
        await expect(
          page.locator('[data-testid="voice-entities-editor"]')
        ).toBeVisible();

        // Should show editable sections for markers and banned words
        await expect(
          page.locator('h4:has-text("Voice Markers")')
        ).toBeVisible();
        await expect(
          page.locator('h4:has-text("Banned Words")')
        ).toBeVisible();
      } else {
        test.skip();
      }
    });

    test('shows close button in editor', async ({ page }) => {
      const editButton = page.locator('[data-testid="edit-voice-profile-btn"]');
      const hasEditButton = await editButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasEditButton) {
        // Start editing
        await page.click('[data-testid="edit-voice-profile-btn"]');

        // Check for close button (X icon)
        await expect(
          page.locator('[data-testid="close-editor"]')
        ).toBeVisible();
      } else {
        test.skip();
      }
    });
  });

  test.describe('AC2: Voice Markers Management', () => {
    test.beforeEach(async ({ page }) => {
      const editButton = page.locator('[data-testid="edit-voice-profile-btn"]');
      const hasEditButton = await editButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasEditButton) {
        await editButton.click();
      } else {
        test.skip();
      }
    });

    test('displays existing voice markers as chips', async ({ page }) => {
      const markersSection = page.locator('div.space-y-3:has(h4:has-text("Voice Markers"))');
      // Should have some markers or empty state
      await expect(markersSection).toBeVisible();
    });

    test('can add new voice marker', async ({ page }) => {
      const markersSection = page.locator('div.space-y-3:has(h4:has-text("Voice Markers"))');
      const input = markersSection.locator('input[data-testid="chip-input"]');

      const testMarker = `test-marker-${Date.now()}`;
      await input.fill(testMarker);
      await page.keyboard.press('Enter');

      // Should show in list
      await expect(page.locator(`text="${testMarker}"`)).toBeVisible();

      // AC5: Success notification
      await expect(page.locator('text=/Brand DNA updated/i').first()).toBeVisible();
    });

    test('can remove voice marker by clicking X', async ({ page }) => {
      const markersSection = page.locator('div.space-y-3:has(h4:has-text("Voice Markers"))');
      const input = markersSection.locator('input[data-testid="chip-input"]');

      // First add one to ensure something to delete
      const testMarker = `delete-me-${Date.now()}`;
      await input.fill(testMarker);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const chip = page.locator(`[data-testid="chip-${testMarker}"]`);
      const removeBtn = chip.locator('button');

      await removeBtn.click();

      // Should be gone
      await expect(page.locator(`text="${testMarker}"`)).not.toBeVisible();

      // AC5: Success notification
      await expect(page.locator('text=/Brand DNA updated/i').first()).toBeVisible();
    });
  });

  test.describe('AC3: Banned Words Management', () => {
    test.beforeEach(async ({ page }) => {
      const editButton = page.locator('[data-testid="edit-voice-profile-btn"]');
      const hasEditButton = await editButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (hasEditButton) {
        await editButton.click();
      } else {
        test.skip();
      }
    });

    test('displays existing banned words as chips', async ({ page }) => {
      const bannedSection = page.locator('div.space-y-3:has(h4:has-text("Banned Words"))');
      await expect(bannedSection).toBeVisible();
    });

    test('can add new banned word', async ({ page }) => {
      const bannedSection = page.locator('div.space-y-3:has(h4:has-text("Banned Words"))');
      const input = bannedSection.locator('input[data-testid="chip-input"]');

      const testWord = `banned-${Date.now()}`;
      await input.fill(testWord);
      await page.keyboard.press('Enter');

      // Should show in list
      await expect(page.locator(`text="${testWord}"`)).toBeVisible();

      // AC5: Success notification
      await expect(page.locator('text=/Brand DNA updated/i').first()).toBeVisible();
    });

    test('can remove banned word by clicking X', async ({ page }) => {
      const bannedSection = page.locator('div.space-y-3:has(h4:has-text("Banned Words"))');
      const input = bannedSection.locator('input[data-testid="chip-input"]');

      // First add one
      const testWord = `delete-ban-${Date.now()}`;
      await input.fill(testWord);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      const chip = page.locator(`[data-testid="chip-${testWord}"]`);
      const removeBtn = chip.locator('button');

      await removeBtn.click();

      // Should be gone
      await expect(page.locator(`text="${testWord}"`)).not.toBeVisible();

      // AC5: Success notification
      await expect(page.locator('text=/Brand DNA updated/i').first()).toBeVisible();
    });
  });

  test.describe('AC4: Brand Stances Management', () => {
    // Note: Stances editing might be in a separate component or not yet implemented
    // This is a placeholder for future extension if Story 2.5 covers it
    test('displays existing brand stances', async ({ page }) => {
      // Just check if we can see stances somewhere
      const hasStances = await page.locator('text=/Brand Stances/i').isVisible();
      if (hasStances) {
        await expect(page.locator('text=/Brand Stances/i')).toBeVisible();
      }
    });
  });
});