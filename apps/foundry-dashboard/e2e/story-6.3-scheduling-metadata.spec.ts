/**
 * Story 6.3: Scheduling Metadata Export E2E Tests
 * Tests inclusion of scheduling dates/times in exports
 */

import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 6.3: Scheduling Metadata Export', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display include scheduling toggle', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify scheduling metadata section
    await expect(page.locator('text=Include Scheduling Metadata')).toBeVisible();
    await expect(page.locator('text=Add suggested posting times and scheduling dates')).toBeVisible();

    // Verify toggle exists
    const toggle = page.locator('[data-testid="include-scheduling-toggle"]');
    await expect(toggle).toBeVisible();
  });

  test('should have scheduling enabled by default', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const toggle = page.locator('[data-testid="include-scheduling-toggle"]');
    const classes = await toggle.getAttribute('class');

    // Should be enabled (approve color)
    expect(classes).toContain('approve');

    // Verify in preview
    const previewSection = page.locator('text=Export Preview').locator('..');
    await expect(previewSection.locator('text=Included').first()).toBeVisible();
  });

  test('should toggle scheduling metadata inclusion', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const toggle = page.locator('[data-testid="include-scheduling-toggle"]');

    // Initially enabled
    let classes = await toggle.getAttribute('class');
    expect(classes).toContain('approve');

    // Click to disable
    await toggle.click();

    // Should now be disabled
    classes = await toggle.getAttribute('class');
    expect(classes).not.toContain('approve');
  });

  test('should update export preview when toggling scheduling', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const previewSection = page.locator('text=Export Preview').locator('..');

    // Initially included
    await expect(previewSection.locator('text=Scheduling').locator('..').locator('text=Included')).toBeVisible();

    // Toggle off
    await page.click('[data-testid="include-scheduling-toggle"]');

    // Should now show excluded
    await expect(previewSection.locator('text=Scheduling').locator('..').locator('text=Excluded')).toBeVisible();
  });

  test('should maintain scheduling setting when changing format', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Disable scheduling
    await page.click('[data-testid="include-scheduling-toggle"]');

    // Change format to JSON
    await page.click('[data-testid="format-json"]');

    // Scheduling should still be disabled
    const toggle = page.locator('[data-testid="include-scheduling-toggle"]');
    const classes = await toggle.getAttribute('class');
    expect(classes).not.toContain('approve');
  });

  test('should show scheduling status in export history', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Check if export history has items
    const exportItems = page.locator('[data-testid^="export-"]');
    const hasItems = await exportItems.first().isVisible({ timeout: 2000 }).catch(() => false);

    if (hasItems) {
      // Verify scheduling column exists in at least one export
      await expect(page.locator('text=Scheduling').first()).toBeVisible();

      // Should show Yes or No
      const schedulingValue = page.locator('text=Scheduling').first().locator('..');
      const hasYes = await schedulingValue.locator('text=Yes').isVisible().catch(() => false);
      const hasNo = await schedulingValue.locator('text=No').isVisible().catch(() => false);

      expect(hasYes || hasNo).toBe(true);
    }
  });

  test('should display scheduling metadata description', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify descriptive text
    await expect(page.locator('text=Add suggested posting times and scheduling dates')).toBeVisible();
  });

  test('should work with both CSV and JSON formats', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Test with CSV (default)
    let toggle = page.locator('[data-testid="include-scheduling-toggle"]');
    await expect(toggle).toBeVisible();

    // Switch to JSON
    await page.click('[data-testid="format-json"]');

    // Toggle should still be visible and functional
    toggle = page.locator('[data-testid="include-scheduling-toggle"]');
    await expect(toggle).toBeVisible();

    // Should be able to toggle
    await toggle.click();
    const classes = await toggle.getAttribute('class');
    expect(classes).not.toContain('approve');
  });
});
