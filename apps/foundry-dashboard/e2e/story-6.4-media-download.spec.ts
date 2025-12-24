/**
 * Story 6.4: Media Asset Download E2E Tests
 * Tests downloading associated images/media with exports
 */

import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 6.4: Media Asset Download', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display download media assets toggle', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify media assets section
    await expect(page.locator('text=Download Media Assets')).toBeVisible();
    await expect(page.locator('text=Include images, videos, and other media files')).toBeVisible();

    // Verify toggle exists
    const toggle = page.locator('[data-testid="include-visuals-toggle"]');
    await expect(toggle).toBeVisible();
  });

  test('should have media download disabled by default', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const toggle = page.locator('[data-testid="include-visuals-toggle"]');
    const classes = await toggle.getAttribute('class');

    // Should be disabled (no approve color)
    expect(classes).not.toContain('approve');

    // Verify in preview
    const previewSection = page.locator('text=Export Preview').locator('..');
    await expect(previewSection.locator('text=Media').locator('..').locator('text=Excluded')).toBeVisible();
  });

  test('should toggle media download setting', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const toggle = page.locator('[data-testid="include-visuals-toggle"]');

    // Initially disabled
    let classes = await toggle.getAttribute('class');
    expect(classes).not.toContain('approve');

    // Click to enable
    await toggle.click();

    // Should now be enabled
    classes = await toggle.getAttribute('class');
    expect(classes).toContain('approve');
  });

  test('should update export preview when toggling media', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const previewSection = page.locator('text=Export Preview').locator('..');

    // Initially excluded
    await expect(previewSection.locator('text=Media').locator('..').locator('text=Excluded')).toBeVisible();

    // Toggle on
    await page.click('[data-testid="include-visuals-toggle"]');

    // Should now show included
    await expect(previewSection.locator('text=Media').locator('..').locator('text=Included')).toBeVisible();
  });

  test('should maintain media setting when changing format', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Enable media
    await page.click('[data-testid="include-visuals-toggle"]');

    // Change format to JSON
    await page.click('[data-testid="format-json"]');

    // Media should still be enabled
    const toggle = page.locator('[data-testid="include-visuals-toggle"]');
    const classes = await toggle.getAttribute('class');
    expect(classes).toContain('approve');
  });

  test('should show media status in export history', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Check if export history has items
    const exportItems = page.locator('[data-testid^="export-"]');
    const hasItems = await exportItems.first().isVisible({ timeout: 2000 }).catch(() => false);

    if (hasItems) {
      // Verify media column exists in at least one export
      await expect(page.locator('text=Media').first()).toBeVisible();

      // Should show Yes or No
      const mediaValue = page.locator('text=Media').first().locator('..');
      const hasYes = await mediaValue.locator('text=Yes').isVisible().catch(() => false);
      const hasNo = await mediaValue.locator('text=No').isVisible().catch(() => false);

      expect(hasYes || hasNo).toBe(true);
    }
  });

  test('should display media download description', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify descriptive text
    await expect(page.locator('text=Include images, videos, and other media files')).toBeVisible();
  });

  test('should work independently from scheduling setting', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Enable media
    await page.click('[data-testid="include-visuals-toggle"]');

    // Disable scheduling
    await page.click('[data-testid="include-scheduling-toggle"]');

    // Verify both settings are independent
    const mediaToggle = page.locator('[data-testid="include-visuals-toggle"]');
    const schedulingToggle = page.locator('[data-testid="include-scheduling-toggle"]');

    const mediaClasses = await mediaToggle.getAttribute('class');
    const schedulingClasses = await schedulingToggle.getAttribute('class');

    expect(mediaClasses).toContain('approve');
    expect(schedulingClasses).not.toContain('approve');
  });

  test('should work with all export formats', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Test with CSV (default)
    let toggle = page.locator('[data-testid="include-visuals-toggle"]');
    await expect(toggle).toBeVisible();
    await toggle.click();

    // Switch to JSON
    await page.click('[data-testid="format-json"]');

    // Toggle should still be visible and enabled
    toggle = page.locator('[data-testid="include-visuals-toggle"]');
    await expect(toggle).toBeVisible();

    const classes = await toggle.getAttribute('class');
    expect(classes).toContain('approve');
  });

  test('should show preview with all settings combined', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Enable media and keep scheduling enabled
    await page.click('[data-testid="include-visuals-toggle"]');

    const previewSection = page.locator('text=Export Preview').locator('..');

    // Both should show as included
    await expect(previewSection.locator('text=Scheduling').locator('..').locator('text=Included')).toBeVisible();
    await expect(previewSection.locator('text=Media').locator('..').locator('text=Included')).toBeVisible();
  });
});
