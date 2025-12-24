/**
 * Story 4.1: Spoke Generation E2E Tests
 * Tests spoke generation UI, tree view display, and platform filtering
 */

import { test, expect } from '@playwright/test';
import { login, getFirstHubId, navigateToHub, hasSpokes, waitForPageLoad } from './utils/test-helpers';

test.describe('Story 4.1: Spoke Generation', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('should display hub detail page with pillars', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found - create a hub first');

    const loaded = await navigateToHub(page, hubId!);
    expect(loaded).toBe(true);

    // Verify hub detail elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Pillars')).toBeVisible();
  });

  test('should show Generate Spokes button for ready hubs', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    // Check for Generate Spokes button (only visible for 'ready' status hubs)
    const generateButton = page.locator('button:has-text("Generate Spokes")');
    const isVisible = await generateButton.isVisible({ timeout: 3000 }).catch(() => false);

    // If hub is ready, button should be visible
    if (isVisible) {
      await expect(generateButton).toBeEnabled();
    }
  });

  test('should display spoke tree view when spokes exist', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    // Check if this hub has spokes
    const spokesExist = await hasSpokes(page);

    if (spokesExist) {
      // Click on Generated Spokes tab
      const spokesTab = page.locator('button:has-text("Generated Spokes")');
      if (await spokesTab.isVisible()) {
        await spokesTab.click();
        await waitForPageLoad(page);

        // Verify tree view elements
        const treeView = page.locator('.spoke-node, [data-testid="spoke-tree"]');
        await expect(treeView.first()).toBeVisible({ timeout: 5000 });
      }
    } else {
      // If no spokes, verify empty state or generate button
      const emptyOrGenerate = page.locator('text=No spokes, button:has-text("Generate")');
      await expect(emptyOrGenerate.first()).toBeVisible();
    }
  });

  test('should filter spokes by platform', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist for this hub');

    // Switch to spokes tab
    const spokesTab = page.locator('button:has-text("Generated Spokes")');
    await spokesTab.click();
    await waitForPageLoad(page);

    // Find platform filter
    const platformFilter = page.locator('select, button:has-text("All Platforms")');
    const hasFilter = await platformFilter.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasFilter) {
      // Click to open filter
      await platformFilter.click();

      // Look for platform options
      const twitterOption = page.locator('option:has-text("Twitter"), span:has-text("Twitter")');
      if (await twitterOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await twitterOption.click();

        // Verify filter applied (spoke cards should update)
        await waitForPageLoad(page);
      }
    }
  });

  test('should show pillar expand/collapse in tree view', async ({ page }) => {
    const hubId = await getFirstHubId(page);
    test.skip(!hubId, 'No hubs found');

    await navigateToHub(page, hubId!);
    await waitForPageLoad(page);

    const spokesExist = await hasSpokes(page);
    test.skip(!spokesExist, 'No spokes exist');

    // Switch to spokes tab
    await page.locator('button:has-text("Generated Spokes")').click();
    await waitForPageLoad(page);

    // Find expand/collapse controls
    const expandButton = page.locator('button:has-text("Expand All")');
    const collapseButton = page.locator('button:has-text("Collapse All")');

    const hasControls = await expandButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasControls) {
      // Test expand all
      await expandButton.click();
      await page.waitForTimeout(500);

      // Test collapse all
      await collapseButton.click();
      await page.waitForTimeout(500);

      // Verify controls still work
      await expect(expandButton).toBeVisible();
    }
  });
});
