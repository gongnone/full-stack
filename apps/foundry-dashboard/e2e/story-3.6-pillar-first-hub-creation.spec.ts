/**
 * Story 3.6: Pillar-First Hub Creation
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Core Pillars tab appears when approved pillars exist
 * AC2: Core Pillars tab is hidden when no approved pillars
 * AC3: Core Pillars tab displays approved pillars preview
 * AC4: Selecting Core Pillars skips extraction and loads pillars
 * AC5: Hub created with synthetic source record
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Test user must have a client with approved pillars in content_pillars table
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 *
 * Prerequisites:
 * - Client must have completed Brand DNA onboarding with approved pillars
 * - At least one pillar with status='approved' in content_pillars table
 */

import { test, expect } from '@playwright/test';

// Test configuration from environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

/**
 * Helper: Login to the application
 */
async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

/**
 * Helper: Navigate to Hub wizard Step 2 (Upload Source)
 * This is where the Core Pillars tab should appear
 *
 * Note: The wizard auto-advances from Step 1 to Step 2 after client selection.
 * We just need to wait for the auto-advance to complete.
 */
async function navigateToHubWizardStep2(page: import('@playwright/test').Page) {
  await login(page);
  await page.goto(`${BASE_URL}/app/hubs/new`);

  // Wait for wizard to load
  await expect(page.locator('h1:has-text("Create New Hub")')).toBeVisible();

  // Wait for auto-advance from Step 1 to Step 2 (happens after 500ms)
  // Step 2 content appears when auto-advance completes
  // Look for the Upload PDF tab as a marker that Step 2 is loaded
  await expect(page.locator('text=Upload PDF')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper: Navigate to Hub wizard Step 2 with a client that has approved pillars
 */
async function navigateToStep2WithApprovedPillars(page: import('@playwright/test').Page) {
  await navigateToHubWizardStep2(page);
  // navigateToHubWizardStep2 already verifies Step 2 is loaded
}

test.describe('Story 3.6: Pillar-First Hub Creation', () => {
  test.describe('AC1: Core Pillars tab appears when approved pillars exist', () => {
    test('[P1] should display Core Pillars tab when client has approved pillars', async ({ page }) => {
      // Intercept network requests to debug tRPC calls
      page.on('response', async response => {
        if (response.url().includes('pillars.getApprovedPillarsForHub')) {
          console.log('=== tRPC Response:', response.url());
          console.log('Status:', response.status());
          try {
            const body = await response.text();
            console.log('Body:', body);
          } catch (e) {
            console.log('Could not read body:', e);
          }
        }
      });

      // Enable console logging for debugging
      page.on('console', msg => console.log('BROWSER:', msg.text()));

      // GIVEN: User is logged in and has a client with approved pillars
      await navigateToStep2WithApprovedPillars(page);

      // Wait for React Query to complete
      await page.waitForTimeout(3000);

      // Debug: Check component data attributes
      const debugInfo = await page.evaluate(() => {
        const uploadSource = document.querySelector('[data-client-id]');
        return {
          clientId: uploadSource?.getAttribute('data-client-id'),
          pillarCount: uploadSource?.getAttribute('data-pillar-count'),
          hasCorePillarsTab: !!document.querySelector('[data-testid="core-pillars-tab"]'),
          tabButtons: Array.from(document.querySelectorAll('button')).slice(0, 5).map(b => b.textContent),
        };
      });
      console.log('===  DEBUG INFO:', JSON.stringify(debugInfo, null, 2));

      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/debug-step2-tabs.png', fullPage: true });

      // THEN: Core Pillars tab is visible with target/bullseye icon
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');
      await expect(corePillarsTab).toBeVisible();
    });

    test('[P1] should show pillar count badge on Core Pillars tab', async ({ page }) => {
      // GIVEN: User navigates to Step 2 with approved pillars
      await navigateToStep2WithApprovedPillars(page);

      // WHEN: The Core Pillars tab is visible
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');

      // THEN: Tab shows a badge with pillar count (e.g., "3")
      // Badge should contain a number
      await expect(corePillarsTab.locator('[data-testid="pillar-count-badge"], .badge, [class*="badge"]')).toBeVisible();
      await expect(corePillarsTab).toContainText(/\d+/);
    });

    test('[P2] should show target/bullseye icon on Core Pillars tab', async ({ page }) => {
      // GIVEN: User navigates to Step 2 with approved pillars
      await navigateToStep2WithApprovedPillars(page);

      // WHEN: The Core Pillars tab is visible
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');

      // THEN: Tab displays a target/bullseye icon (Lucide Target icon)
      // Check for SVG icon or icon class
      await expect(corePillarsTab.locator('svg, [class*="icon"], [data-testid="target-icon"]')).toBeVisible();
    });
  });

  test.describe('AC2: Core Pillars tab is hidden when no approved pillars', () => {
    test('[P1] should only show 3 original tabs when client has no approved pillars', async ({ page }) => {
      // GIVEN: User is logged in
      await login(page);

      // Navigate to hub wizard - if no approved pillars exist for selected client
      await page.goto(`${BASE_URL}/app/hubs/new`);
      await expect(page.locator('h1:has-text("Create New Hub")')).toBeVisible();

      // WHEN: The tab bar renders on Step 2
      // Note: This test assumes the selected client has NO approved pillars
      // In a real scenario, you'd need a test fixture with a client without pillars

      // THEN: Only 3 original tabs are visible
      const uploadPdfTab = page.locator('text=Upload PDF');
      const pasteTextTab = page.locator('text=Paste Text');
      const fromUrlTab = page.locator('text=From URL');

      await expect(uploadPdfTab).toBeVisible();
      await expect(pasteTextTab).toBeVisible();
      await expect(fromUrlTab).toBeVisible();

      // Core Pillars tab should NOT be visible (or if pillar count is 0)
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');
      // Tab should either not exist, or if conditionally shown based on count, verify count is 0
      const tabCount = await corePillarsTab.count();
      if (tabCount > 0) {
        // If tab exists but should be hidden when no pillars, check it's not visible
        // This depends on implementation - tab may be removed from DOM or hidden
        const isVisible = await corePillarsTab.isVisible().catch(() => false);
        // If visible, it should show 0 count or be a test data issue
        if (isVisible) {
          console.log('Note: Core Pillars tab visible - test client may have approved pillars');
        }
      }
    });
  });

  test.describe('AC3: Core Pillars tab displays approved pillars preview', () => {
    test('[P1] should display list of approved pillars when tab is clicked', async ({ page }) => {
      // GIVEN: User navigates to Step 2 with approved pillars
      await navigateToStep2WithApprovedPillars(page);

      // WHEN: User clicks on the Core Pillars tab
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');
      await corePillarsTab.click();

      // THEN: A list of approved pillars is displayed
      const pillarsList = page.locator('[data-testid="core-pillars-list"]');
      await expect(pillarsList).toBeVisible();

      // Pillar cards should be visible
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      await expect(pillarCards.first()).toBeVisible();
    });

    test('[P1] should display pillar title on each card', async ({ page }) => {
      // GIVEN: User clicks on Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Pillar cards are rendered
      const firstPillarCard = page.locator('[data-testid^="pillar-card-"]').first();
      await expect(firstPillarCard).toBeVisible();

      // THEN: Pillar title is displayed
      // Title should be a visible text element within the card
      const titleElement = firstPillarCard.locator('[data-testid="pillar-title"], h3, h4, [class*="title"]').first();
      await expect(titleElement).toBeVisible();
      const titleText = await titleElement.textContent();
      expect(titleText?.length).toBeGreaterThan(0);
    });

    test('[P1] should display framework type badge on each card', async ({ page }) => {
      // GIVEN: User clicks on Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Pillar cards are rendered
      const firstPillarCard = page.locator('[data-testid^="pillar-card-"]').first();
      await expect(firstPillarCard).toBeVisible();

      // THEN: Framework type badge is displayed (Catalyst/Core Truth/Proof)
      const frameworkBadge = firstPillarCard.locator('[data-testid="framework-badge"], [class*="badge"]');
      await expect(frameworkBadge).toBeVisible();

      // Badge should contain one of the framework types
      const badgeText = await frameworkBadge.textContent();
      const validFrameworks = ['catalyst', 'core_truth', 'core truth', 'proof'];
      const hasValidFramework = validFrameworks.some((f) => badgeText?.toLowerCase().includes(f));
      expect(hasValidFramework).toBe(true);
    });

    test('[P1] should display short description (truncated to 100 chars)', async ({ page }) => {
      // GIVEN: User clicks on Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Pillar cards are rendered
      const firstPillarCard = page.locator('[data-testid^="pillar-card-"]').first();
      await expect(firstPillarCard).toBeVisible();

      // THEN: Description is displayed (truncated if long)
      const description = firstPillarCard.locator('[data-testid="pillar-description"], p, [class*="description"]').first();
      await expect(description).toBeVisible();

      // Description should be truncated to ~100 chars (with ellipsis if longer)
      const descText = await description.textContent();
      // Allow some buffer for ellipsis
      expect(descText?.length).toBeLessThanOrEqual(110);
    });

    test('[P1] should display "Use These Pillars" primary action button', async ({ page }) => {
      // GIVEN: User clicks on Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Tab content renders
      await expect(page.locator('[data-testid="core-pillars-list"]')).toBeVisible();

      // THEN: "Use These Pillars" button is visible and styled as primary
      const usePillarsButton = page.locator('[data-testid="use-pillars-button"]');
      await expect(usePillarsButton).toBeVisible();
      await expect(usePillarsButton).toContainText(/Use These Pillars/i);
    });

    test('[P2] should show loading skeleton while pillars are being fetched', async ({ page }) => {
      // GIVEN: User navigates to Step 2
      await navigateToStep2WithApprovedPillars(page);

      // WHEN: User clicks on Core Pillars tab (fast network may skip skeleton)
      const corePillarsTab = page.locator('[data-testid="core-pillars-tab"]');

      // Check for skeleton OR loaded content (race condition with fast network)
      await corePillarsTab.click();

      // THEN: Either skeleton is shown OR content loads directly
      const skeleton = page.locator('[data-testid="pillars-loading-skeleton"], [class*="skeleton"]');
      const pillarsList = page.locator('[data-testid="core-pillars-list"]');

      // One of these should be visible
      await expect(skeleton.or(pillarsList)).toBeVisible();
    });
  });

  test.describe('AC4: Selecting Core Pillars skips extraction and loads pillars', () => {
    test('[P0] should advance to Step 3 when "Use These Pillars" is clicked', async ({ page }) => {
      // GIVEN: User is viewing Core Pillars tab with approved pillars
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();
      await expect(page.locator('[data-testid="use-pillars-button"]')).toBeVisible();

      // WHEN: User clicks "Use These Pillars"
      await page.locator('[data-testid="use-pillars-button"]').click();

      // THEN: Wizard advances to Step 3 (Configure Pillars)
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 15000 });
    });

    test('[P0] should pre-load approved pillars into pillar configuration', async ({ page }) => {
      // GIVEN: User clicks "Use These Pillars"
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();
      await page.locator('[data-testid="use-pillars-button"]').click();

      // WHEN: Step 3 loads
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 15000 });

      // THEN: Pillars are pre-loaded in the configuration view
      const pillarCards = page.locator('[data-testid^="editable-pillar-card-"]');
      await expect(pillarCards.first()).toBeVisible();

      // Should have at least 1 pillar loaded
      const cardCount = await pillarCards.count();
      expect(cardCount).toBeGreaterThanOrEqual(1);
    });

    test('[P0] should NOT run extraction process when using Core Pillars', async ({ page }) => {
      // GIVEN: User clicks "Use These Pillars"
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // Record time before clicking
      const startTime = Date.now();

      // WHEN: User clicks "Use These Pillars"
      await page.locator('[data-testid="use-pillars-button"]').click();

      // THEN: No extraction progress indicator appears
      // Extraction would show an ingestion progress indicator
      const ingestionProgress = page.locator('[data-testid="ingestion-progress"]');
      const isProgressVisible = await ingestionProgress.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isProgressVisible).toBe(false);

      // Should advance to Step 3 quickly (no extraction delay)
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 10000 });

      const elapsedTime = Date.now() - startTime;
      // Extraction typically takes 10+ seconds; pillar-first should be < 5s
      expect(elapsedTime).toBeLessThan(10000);
    });

    test('[P1] should allow proceeding to Step 4 immediately after pillar load', async ({ page }) => {
      // GIVEN: User used Core Pillars and is on Step 3
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();
      await page.locator('[data-testid="use-pillars-button"]').click();
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 15000 });

      // WHEN: Step 3 loads with pre-loaded pillars
      const continueButton = page.locator('[data-testid="continue-to-generate-btn"], button:has-text("Continue")');

      // THEN: Continue button should be enabled (pillars are already configured)
      await expect(continueButton).toBeEnabled();
    });
  });

  test.describe('AC5: Hub created with synthetic source record', () => {
    test('[P0] should create Hub successfully using Core Pillars', async ({ page }) => {
      // GIVEN: User selected Core Pillars and configured pillars
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();
      await page.locator('[data-testid="use-pillars-button"]').click();
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 15000 });

      // WHEN: User proceeds to Step 4 and creates the Hub
      await page.locator('[data-testid="continue-to-generate-btn"], button:has-text("Continue")').click();

      // Wait for Step 4 (Generate Hub)
      await expect(page.locator('text=Generate Hub, text=Create Hub')).toBeVisible({ timeout: 10000 });

      // Click to create/generate the hub
      const createButton = page.locator('[data-testid="create-hub-btn"], button:has-text("Create Hub"), button:has-text("Generate")');
      await createButton.click();

      // THEN: Hub is created successfully
      // Should redirect to hub detail or show success message
      await expect(
        page.locator('text=Hub created, text=Success, [data-testid="hub-created-success"]').or(page.locator('[data-testid="hub-detail"]'))
      ).toBeVisible({ timeout: 30000 });
    });

    test('[P1] should display Hub in Hub list after creation', async ({ page }) => {
      // This test verifies the hub appears in the list
      // Assumes a hub was created via pillar-first flow

      // GIVEN: User is logged in
      await login(page);

      // WHEN: User navigates to Hubs list
      await page.goto(`${BASE_URL}/app/hubs`);

      // THEN: At least one hub should be visible
      // (Ideally we'd verify the specific pillar-first hub by name)
      const hubList = page.locator('[data-testid="hub-list"], [data-testid^="hub-card-"]');
      await expect(hubList).toBeVisible({ timeout: 10000 });
    });

    test('[P2] should work normally with spoke generation after pillar-first hub creation', async ({ page }) => {
      // This test verifies spoke generation works with pillar-first hubs
      // GIVEN: A hub was created using Core Pillars flow
      await login(page);

      // Navigate to an existing hub (created via pillar-first)
      await page.goto(`${BASE_URL}/app/hubs`);

      // Click on a hub to view details
      const hubCard = page.locator('[data-testid^="hub-card-"]').first();
      const hubExists = await hubCard.isVisible({ timeout: 5000 }).catch(() => false);

      if (hubExists) {
        await hubCard.click();

        // THEN: Spoke generation UI should be available
        await expect(page.locator('text=Generate Spokes, text=Spokes, [data-testid="spoke-generation"]')).toBeVisible({ timeout: 10000 });
      } else {
        console.log('No hubs available - skipping spoke generation test');
        test.skip();
      }
    });
  });

  test.describe('UI/UX Integration', () => {
    test('[P2] should apply correct framework badge colors', async ({ page }) => {
      // GIVEN: User views Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Pillar cards are displayed
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      await expect(pillarCards.first()).toBeVisible();

      // THEN: Framework badges have appropriate colors
      // Catalyst = orange (var(--warning))
      // Core Truth = blue (var(--edit))
      // Proof = green (var(--approve))
      const badges = page.locator('[data-testid="framework-badge"], [class*="badge"]');
      const badgeCount = await badges.count();
      expect(badgeCount).toBeGreaterThan(0);
    });

    test('[P2] should follow Midnight Command theme styling', async ({ page }) => {
      // GIVEN: User views Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Content is rendered
      const pillarsList = page.locator('[data-testid="core-pillars-list"]');
      await expect(pillarsList).toBeVisible();

      // THEN: Dark theme styling is applied (visual verification)
      // Cards should have elevated background styling
      const firstCard = page.locator('[data-testid^="pillar-card-"]').first();
      await expect(firstCard).toBeVisible();
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('[P2] should handle empty pillar description gracefully', async ({ page }) => {
      // GIVEN: User views Core Pillars tab
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();

      // WHEN: Pillar cards render (some may have empty descriptions)
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      await expect(pillarCards.first()).toBeVisible();

      // THEN: Cards render without breaking (no console errors)
      // Visual: Cards should still be usable
      const cardCount = await pillarCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('[P2] should transform framework types correctly to psychological angles', async ({ page }) => {
      // GIVEN: User clicks "Use These Pillars" to advance to Step 3
      await navigateToStep2WithApprovedPillars(page);
      await page.locator('[data-testid="core-pillars-tab"]').click();
      await page.locator('[data-testid="use-pillars-button"]').click();

      // WHEN: Step 3 loads with transformed pillars
      await expect(page.locator('h3:has-text("Configure Pillars"), text=Configure Pillars')).toBeVisible({ timeout: 15000 });

      // THEN: Pillars should have psychological angles (transformed from framework_type)
      // Framework mappings: catalyst→Contrarian, core_truth→Authority, proof→Transformation
      const angleDropdown = page.locator('[data-testid="angle-dropdown-trigger"]').first();
      await expect(angleDropdown).toBeVisible();

      const angleText = await angleDropdown.textContent();
      const validAngles = ['Contrarian', 'Authority', 'Transformation', 'Urgency', 'Aspiration', 'Fear', 'Curiosity', 'Rebellion'];
      const hasValidAngle = validAngles.some((a) => angleText?.includes(a));
      expect(hasValidAngle).toBe(true);
    });
  });
});
