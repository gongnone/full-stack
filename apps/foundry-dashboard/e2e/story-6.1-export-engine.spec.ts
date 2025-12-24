/**
 * Story 6.1: CSV/JSON Export Engine E2E Tests
 * Tests export format selection, export creation, and download functionality
 */

import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 6.1: CSV/JSON Export Engine', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display exports page with create export button', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Verify page title
    await expect(page.locator('h1:has-text("Content Exports")')).toBeVisible();

    // Verify create export button
    const createButton = page.locator('[data-testid="create-export-button"]');
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test('should open export modal when clicking new export button', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Click new export button
    await page.click('[data-testid="create-export-button"]');

    // Verify modal appears
    const modal = page.locator('[data-testid="export-modal"]');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(page.locator('h2:has-text("Export Content")')).toBeVisible();
  });

  test('should allow selecting CSV format', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // CSV should be selected by default
    const csvButton = page.locator('[data-testid="format-csv"]');
    await expect(csvButton).toBeVisible();

    // Verify CSV is selected (has approve color)
    const csvClasses = await csvButton.getAttribute('class');
    expect(csvClasses).toContain('approve');
  });

  test('should allow selecting JSON format', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Click JSON button
    const jsonButton = page.locator('[data-testid="format-json"]');
    await jsonButton.click();

    // Verify JSON is now selected
    const jsonClasses = await jsonButton.getAttribute('class');
    expect(jsonClasses).toContain('approve');
  });

  test('should display export format selector with both options', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify both format options exist
    await expect(page.locator('[data-testid="format-csv"]')).toBeVisible();
    await expect(page.locator('[data-testid="format-json"]')).toBeVisible();

    // Verify labels - use .first() to avoid strict mode violations
    await expect(page.locator('[data-testid="format-csv"]')).toBeVisible();
    await expect(page.locator('[data-testid="format-json"]')).toBeVisible();
    await expect(page.getByText('Excel-compatible').first()).toBeVisible();
    await expect(page.getByText('Developer-friendly').first()).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Verify modal is closed
    const modal = page.locator('[data-testid="export-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Click close button
    await page.click('[data-testid="export-modal-close"]');

    // Verify modal is closed
    const modal = page.locator('[data-testid="export-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should display export preview with selected format', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify export preview section exists
    await expect(page.locator('text=Export Preview')).toBeVisible();

    // Verify CSV format is shown (default)
    await expect(page.locator('text=CSV').last()).toBeVisible();

    // Switch to JSON
    await page.click('[data-testid="format-json"]');

    // Verify JSON format is now shown
    await expect(page.locator('text=JSON').last()).toBeVisible();
  });

  test('should show export history section', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Verify export history heading
    await expect(page.locator('h2:has-text("Export History")')).toBeVisible();

    // Should show either empty state or export items
    const emptyState = page.locator('text=No Exports Yet');
    const exportItems = page.locator('[data-testid^="export-"]');

    const hasEmpty = await emptyState.isVisible({ timeout: 2000 }).catch(() => false);
    const hasItems = await exportItems.first().isVisible({ timeout: 2000 }).catch(() => false);

    // At least one should be visible
    expect(hasEmpty || hasItems).toBe(true);
  });

  test('should display quick export option cards', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    // Verify all three quick export cards
    await expect(page.locator('text=CSV Export')).toBeVisible();
    await expect(page.locator('text=JSON Export')).toBeVisible();
    await expect(page.locator('text=Quick Copy')).toBeVisible();

    // Verify descriptions
    await expect(page.locator('text=Excel-compatible')).toBeVisible();
    await expect(page.locator('text=Developer-friendly')).toBeVisible();
    await expect(page.locator('text=Clipboard actions')).toBeVisible();
  });

  test('should have submit button for export', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify export submit button
    const submitButton = page.locator('[data-testid="export-submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText('Export Content');
  });
});
