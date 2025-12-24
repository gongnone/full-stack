/**
 * Story 6.2: Platform-Organized Export E2E Tests
 * Tests platform selection and grouping functionality
 */

import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 6.2: Platform-Organized Export', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display platform selection grid', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify platform selection label
    await expect(page.locator('text=Select Platforms')).toBeVisible();

    // Verify major platforms exist
    await expect(page.locator('[data-testid="platform-twitter"]')).toBeVisible();
    await expect(page.locator('[data-testid="platform-linkedin"]')).toBeVisible();
    await expect(page.locator('[data-testid="platform-tiktok"]')).toBeVisible();
    await expect(page.locator('[data-testid="platform-instagram"]')).toBeVisible();
  });

  test('should allow selecting individual platforms', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Click twitter platform
    const twitterButton = page.locator('[data-testid="platform-twitter"]');
    await twitterButton.click();

    // Verify it's selected (should have edit color)
    const twitterClasses = await twitterButton.getAttribute('class');
    expect(twitterClasses).toContain('edit');
  });

  test('should allow selecting multiple platforms', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Select multiple platforms
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="platform-linkedin"]');
    await page.click('[data-testid="platform-instagram"]');

    // Verify all are selected
    const twitter = await page.locator('[data-testid="platform-twitter"]').getAttribute('class');
    const linkedin = await page.locator('[data-testid="platform-linkedin"]').getAttribute('class');
    const instagram = await page.locator('[data-testid="platform-instagram"]').getAttribute('class');

    expect(twitter).toContain('edit');
    expect(linkedin).toContain('edit');
    expect(instagram).toContain('edit');
  });

  test('should allow deselecting platforms', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Select and deselect twitter
    const twitterButton = page.locator('[data-testid="platform-twitter"]');
    await twitterButton.click();
    await twitterButton.click();

    // Verify it's deselected
    const twitterClasses = await twitterButton.getAttribute('class');
    expect(twitterClasses).not.toContain('edit');
  });

  test('should display group by platform toggle', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify group by platform section
    await expect(page.locator('text=Group by Platform')).toBeVisible();
    await expect(page.locator('text=Organize export into separate files per platform')).toBeVisible();

    // Verify toggle exists
    const toggle = page.locator('[data-testid="group-by-platform-toggle"]');
    await expect(toggle).toBeVisible();
  });

  test('should toggle group by platform setting', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    const toggle = page.locator('[data-testid="group-by-platform-toggle"]');

    // Get initial state (should be off by default)
    const initialClasses = await toggle.getAttribute('class');
    const isInitiallyOn = initialClasses?.includes('approve');

    // Click toggle
    await toggle.click();

    // Verify state changed
    const newClasses = await toggle.getAttribute('class');
    const isNowOn = newClasses?.includes('approve');

    expect(isNowOn).toBe(!isInitiallyOn);
  });

  test('should update export preview with platform count', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Initially should show "All"
    const previewSection = page.locator('text=Export Preview').locator('..');
    await expect(previewSection.locator('text=All')).toBeVisible();

    // Select platforms
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="platform-linkedin"]');

    // Should now show count
    await expect(previewSection.locator('text=2')).toBeVisible();
  });

  test('should display all platform options', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Verify all 7 platforms
    const platforms = [
      'twitter',
      'linkedin',
      'tiktok',
      'instagram',
      'carousel',
      'thread',
      'youtube_thumbnail',
    ];

    for (const platform of platforms) {
      await expect(page.locator(`[data-testid="platform-${platform}"]`)).toBeVisible();
    }
  });

  test('should maintain platform selection when toggling grouping', async ({ page }) => {
    await page.goto('/app/exports');
    await waitForPageLoad(page);

    await page.click('[data-testid="create-export-button"]');
    await waitForPageLoad(page);

    // Select platforms
    await page.click('[data-testid="platform-twitter"]');
    await page.click('[data-testid="platform-linkedin"]');

    // Toggle grouping
    await page.click('[data-testid="group-by-platform-toggle"]');

    // Verify platforms still selected
    const twitter = await page.locator('[data-testid="platform-twitter"]').getAttribute('class');
    const linkedin = await page.locator('[data-testid="platform-linkedin"]').getAttribute('class');

    expect(twitter).toContain('edit');
    expect(linkedin).toContain('edit');
  });
});
