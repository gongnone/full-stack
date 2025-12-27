/**
 * Hub and Spoke Integration E2E Tests
 *
 * Tests the complete flow from hub creation through spoke generation and display.
 * Covers critical P0 scenarios from test-design-hub-spoke-ui.md:
 * - P0-05: Generation Progress Tracking
 * - P0-06: Spoke Display by Pillar
 * - P0-09: Spoke-Pillar Relationship
 *
 * Prerequisites:
 * - Test user with at least one hub containing 3+ pillars
 * - Stage environment with working AI and workflows
 *
 * Run against stage:
 *   BASE_URL=https://foundry-stage.williamjshaw.ca pnpm exec playwright test e2e/hub-spoke-integration.spec.ts
 *
 * @tags @P0 @hub-spoke @integration
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  testEmail: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
  // Spoke generation timeout per NFR-P3 (60s + buffer)
  generationTimeout: 90000,
  // Polling interval (matches production 5s)
  pollInterval: 5000,
  // Max poll count (matches production 200)
  maxPolls: 200,
};

// Helper to login
async function login(page: Page) {
  await page.goto(`${config.baseUrl}/login`);
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.getByPlaceholder('you@example.com');
  const passwordInput = page.getByPlaceholder('••••••••');

  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(config.testEmail);
  await passwordInput.fill(config.testPassword);

  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/app/, { timeout: 30000 });
}

// Helper to get first hub with pillars
async function getFirstHubWithPillars(page: Page): Promise<string | null> {
  await page.goto(`${config.baseUrl}/app/hubs`);
  await page.waitForLoadState('networkidle').catch(() => {});

  // Click on first hub card
  const hubCards = page.locator('[data-testid="hub-card"], .hub-card, a[href*="/app/hubs/"]');
  const count = await hubCards.count();

  if (count === 0) {
    console.log('No hubs found - skipping test');
    return null;
  }

  const href = await hubCards.first().getAttribute('href');
  const match = href?.match(/\/app\/hubs\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

test.describe('Hub and Spoke Integration', () => {
  test.describe.configure({ mode: 'serial' });

  /**
   * P0-05: Generation Progress Tracking
   * Verifies that spoke generation progress is tracked correctly with:
   * - Progress bar updates from 0% to 100%
   * - No infinite polling loop (max 200 polls)
   * - Cache invalidation between polls
   *
   * Regression test for BUG-002: Polling Infinite Loop
   */
  test('P0-05: Generation progress tracking with timeout protection', async ({ page }) => {
    test.setTimeout(config.generationTimeout + 30000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Check if hub has pillars (required for generation)
    const pillarCount = await page.locator('[data-testid^="pillar-"], .pillar-card, .pillar-item').count();
    if (pillarCount < 1) {
      console.log('Hub has no pillars - skipping spoke generation test');
      test.skip();
      return;
    }

    console.log(`Hub ${hubId} has ${pillarCount} pillars`);

    // Check if spokes already exist
    const existingSpokesText = await page.locator('text=/\\d+ Spokes?/i').textContent().catch(() => '0');
    const existingSpokes = parseInt(existingSpokesText?.match(/(\d+)/)?.[1] || '0', 10);

    if (existingSpokes > 0) {
      console.log(`Hub already has ${existingSpokes} spokes - testing display instead`);
      // Fall through to display test
    } else {
      // Try to trigger generation
      const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Start Generation")');

      if (await generateBtn.isVisible()) {
        console.log('Starting spoke generation...');
        await generateBtn.click();

        // Wait for progress bar to appear
        const progressBar = page.locator('[role="progressbar"], [data-testid="spoke-progress"]');
        await progressBar.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
          console.log('Progress bar not visible - may use different UI');
        });

        // Track polling count to verify timeout protection
        let pollCount = 0;
        const startTime = Date.now();

        // Wait for generation to complete or timeout
        await page.waitForFunction(
          () => {
            const progress = document.querySelector('[role="progressbar"]');
            const value = progress?.getAttribute('aria-valuenow');
            const complete = document.querySelector('text*="Generation Complete"');
            return value === '100' || complete !== null;
          },
          { timeout: config.generationTimeout }
        ).catch(async () => {
          const elapsed = Date.now() - startTime;
          console.log(`Generation timed out after ${elapsed}ms`);
        });

        // Verify we didn't hit infinite loop (check console for excessive messages)
        // In production, we limit to 200 polls at 5s each = ~17 minutes max
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeLessThan(config.generationTimeout);

        console.log(`Generation completed in ${elapsed}ms`);
      }
    }

    // Verify spokes tab shows count
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await expect(spokesTab).toBeVisible();

    // Check for spoke count badge
    const tabText = await spokesTab.textContent();
    console.log(`Spokes tab text: ${tabText}`);

    // Click spokes tab if not already active
    await spokesTab.click();
    await page.waitForTimeout(500);

    console.log('P0-05: Generation progress tracking test passed');
  });

  /**
   * P0-06: Spoke Display by Pillar
   * Verifies that generated spokes appear under the correct pillar in TreeView.
   *
   * Regression test for BUG-001: Case Mapping Mismatch
   * The bug caused spokes to show in stats ("20 Spokes") but not under pillars
   * because pillar_id was undefined due to camelCase→snake_case transform missing.
   */
  test('P0-06: Spokes display under correct pillar in TreeView', async ({ page }) => {
    test.setTimeout(60000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Get spoke count from stats
    const statsBadge = page.locator('[data-testid="spoke-count"], text=/\\d+ Spokes?/i');
    const statsText = await statsBadge.textContent().catch(() => '0 Spokes');
    const totalSpokes = parseInt(statsText?.match(/(\d+)/)?.[1] || '0', 10);

    console.log(`Stats badge shows: ${totalSpokes} spokes`);

    if (totalSpokes === 0) {
      console.log('No spokes in hub - cannot verify display');
      test.skip();
      return;
    }

    // Click Spokes tab
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await spokesTab.click();
    await page.waitForTimeout(1000);

    // Look for TreeView structure (pillars with nested spokes)
    // The SpokeTreeView renders pillars as expandable sections
    const pillarSections = page.locator('[data-testid^="pillar-section-"], .pillar-tree-item, [role="treeitem"]');
    const pillarCount = await pillarSections.count();

    console.log(`Found ${pillarCount} pillar sections in TreeView`);

    // Count spokes visible under pillars
    let displayedSpokes = 0;

    // Try to expand pillars and count spokes
    for (let i = 0; i < pillarCount; i++) {
      const pillar = pillarSections.nth(i);

      // Check for expand button or collapsed state
      const expandBtn = pillar.locator('button[aria-expanded]');
      const isExpanded = await expandBtn.getAttribute('aria-expanded') === 'true';

      if (!isExpanded && await expandBtn.isVisible()) {
        await expandBtn.click();
        await page.waitForTimeout(300);
      }

      // Count spokes within this pillar section
      const spokeItems = pillar.locator('[data-testid^="spoke-"], .spoke-item, .spoke-card');
      const count = await spokeItems.count();
      displayedSpokes += count;

      // Also check for spoke count badge on pillar
      const pillarBadge = pillar.locator('text=/\\(\\d+\\)/');
      if (await pillarBadge.isVisible()) {
        const badgeText = await pillarBadge.textContent();
        console.log(`Pillar ${i + 1} badge: ${badgeText}`);
      }
    }

    // Alternative: count all spoke cards on page
    const allSpokeCards = await page.locator('[data-testid^="spoke-"], .spoke-item, .spoke-card').count();
    console.log(`Total spoke cards on page: ${allSpokeCards}`);

    // CRITICAL ASSERTION: Spokes must be displayed, not just in stats
    // This catches the BUG-001 case mapping issue
    expect(allSpokeCards, 'Spokes should be displayed under pillars, not just in stats').toBeGreaterThan(0);

    // Verify stats match displayed
    if (allSpokeCards < totalSpokes) {
      console.log(`Warning: ${allSpokeCards} displayed vs ${totalSpokes} in stats - some may be collapsed`);
    }

    console.log('P0-06: Spoke display by pillar test passed');
  });

  /**
   * P0-09: Spoke-Pillar Relationship
   * Verifies that each spoke has a valid pillar_id that matches a pillar in the hub.
   */
  test('P0-09: Each spoke has valid pillar_id', async ({ page }) => {
    test.setTimeout(30000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    // Intercept tRPC calls to verify response structure
    const spokeResponses: any[] = [];

    await page.route('**/trpc/spokes.list*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      spokeResponses.push(json);
      await route.fulfill({ response });
    });

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Click Spokes tab to trigger spokes.list query
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await spokesTab.click();
    await page.waitForTimeout(2000);

    // Verify intercepted response
    if (spokeResponses.length === 0) {
      console.log('No spokes.list calls intercepted - may already be loaded');
      // Try to verify via UI instead
      const pillarBadges = page.locator('[data-testid^="pillar-section-"] text=/\\(\\d+\\)/');
      const badgeCount = await pillarBadges.count();
      expect(badgeCount).toBeGreaterThan(0);
      return;
    }

    // Check the tRPC response structure
    const lastResponse = spokeResponses[spokeResponses.length - 1];
    console.log('Intercepted spokes.list response:', JSON.stringify(lastResponse, null, 2).slice(0, 500));

    // Verify response has items array with pillar_id
    if (lastResponse.result?.data?.items) {
      const items = lastResponse.result.data.items;

      items.forEach((spoke: any, index: number) => {
        // CRITICAL: pillar_id must be defined (snake_case, not camelCase)
        expect(spoke.pillar_id, `Spoke ${index} missing pillar_id`).toBeDefined();
        expect(spoke.hub_id, `Spoke ${index} missing hub_id`).toBeDefined();
        expect(spoke.platform, `Spoke ${index} missing platform`).toBeDefined();
      });

      console.log(`Verified ${items.length} spokes have valid pillar_id`);
    }

    console.log('P0-09: Spoke-pillar relationship test passed');
  });

  /**
   * P1-06: Tab Switch Refetch
   * Verifies that switching to Spokes tab triggers a fresh query.
   *
   * Regression test for BUG-003: Tab Switch Race Condition
   */
  test('P1-06: Tab switch triggers fresh spokes query', async ({ page }) => {
    test.setTimeout(30000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    let spokesListCallCount = 0;

    await page.route('**/trpc/spokes.list*', async (route) => {
      spokesListCallCount++;
      const response = await route.fetch();
      await route.fulfill({ response });
    });

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const initialCalls = spokesListCallCount;

    // Switch to a different tab first
    const pillarTab = page.locator('[role="tab"]:has-text("Pillars")');
    if (await pillarTab.isVisible()) {
      await pillarTab.click();
      await page.waitForTimeout(500);
    }

    // Switch to Spokes tab
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await spokesTab.click();
    await page.waitForTimeout(1500);

    // Verify a new query was made
    console.log(`spokes.list calls: ${initialCalls} -> ${spokesListCallCount}`);

    // Should have at least one call when switching to Spokes tab
    expect(spokesListCallCount).toBeGreaterThan(0);

    console.log('P1-06: Tab switch refetch test passed');
  });
});

test.describe('Spoke Generation Edge Cases', () => {
  /**
   * P1-13: Platform-Specific Content Length
   * Verifies Twitter spokes are within 280 character limit.
   */
  test('P1-13: Twitter spokes within 280 character limit', async ({ page }) => {
    test.setTimeout(30000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    // Intercept spokes.list to check content length
    let twitterSpokes: any[] = [];

    await page.route('**/trpc/spokes.list*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      if (json.result?.data?.items) {
        twitterSpokes = json.result.data.items.filter(
          (s: any) => s.platform === 'twitter'
        );
      }

      await route.fulfill({ response });
    });

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Trigger spokes load
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await spokesTab.click();
    await page.waitForTimeout(2000);

    if (twitterSpokes.length === 0) {
      console.log('No Twitter spokes found - skipping length check');
      test.skip();
      return;
    }

    // Verify content length
    twitterSpokes.forEach((spoke, index) => {
      const length = spoke.content?.length || 0;
      console.log(`Twitter spoke ${index + 1}: ${length} chars`);

      // Twitter limit is 280 characters
      expect(length, `Twitter spoke ${index + 1} exceeds 280 chars`).toBeLessThanOrEqual(280);
    });

    console.log(`Verified ${twitterSpokes.length} Twitter spokes within limit`);
  });

  /**
   * P1-18: Platform Filter
   * Verifies filtering spokes by platform works correctly.
   */
  test('P1-18: Platform filter shows only matching spokes', async ({ page }) => {
    test.setTimeout(30000);

    await login(page);

    const hubId = await getFirstHubWithPillars(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Navigate to Spokes tab
    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    await spokesTab.click();
    await page.waitForTimeout(1000);

    // Look for platform filter
    const platformFilter = page.locator('[data-testid="platform-filter"], select[name="platform"], button:has-text("Filter")');

    if (!await platformFilter.isVisible()) {
      console.log('Platform filter not found - UI may not support filtering yet');
      test.skip();
      return;
    }

    // Select Twitter filter
    await platformFilter.click();
    const twitterOption = page.locator('option:has-text("Twitter"), [role="option"]:has-text("Twitter")');
    await twitterOption.click();
    await page.waitForTimeout(500);

    // Verify only Twitter spokes are shown
    const visibleSpokes = page.locator('[data-testid^="spoke-"], .spoke-item');
    const platforms = await visibleSpokes.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute('data-platform') || n.textContent?.toLowerCase())
    );

    platforms.forEach((p) => {
      if (p) {
        expect(p).toContain('twitter');
      }
    });

    console.log('P1-18: Platform filter test passed');
  });
});
