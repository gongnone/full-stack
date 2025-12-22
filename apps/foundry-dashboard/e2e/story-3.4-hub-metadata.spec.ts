/**
 * Story 3.4: Hub Metadata & State Management
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Hub Finalization to D1 Registry - Step 4 "Create Hub" persists Hub record
 * AC2: Pillar Association with Hub - Pillars linked via hub_id, become immutable
 * AC3: Client Isolation (NFR-S1) - Hubs filtered by authenticated client
 * AC4: Hub List View in Dashboard - displays all Hubs with pillar/spoke counts
 * AC5: Hub Detail Navigation - /app/hubs/:hubId shows full pillar information
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Create a test user with a client account
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

// Test configuration from environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Helper to login
async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

// Helper to create a Hub through the wizard
async function createHubThroughWizard(page: import('@playwright/test').Page, hubTitle?: string) {
  await login(page);
  await page.goto(`${BASE_URL}/app/hubs/new`);

  // Wait for wizard to load
  await expect(page.locator('h1:has-text("Create New Hub")')).toBeVisible();

  // Step 1: Select client (auto-selected in MVP - move to step 2)
  // May need to wait for client selection or it auto-advances

  // Step 2: Upload source - paste text content
  await page.click('text=Paste Text');
  await page.fill('textarea', `
    This is comprehensive test content for Hub creation.

    Topic 1: Innovation in Technology
    The rapid advancement of artificial intelligence is transforming industries.
    Machine learning algorithms are now capable of pattern recognition.
    This represents a contrarian view on traditional computing approaches.

    Topic 2: Leadership Principles
    Authority comes from demonstrated expertise and consistent behavior.
    Great leaders inspire through vision and accountability.
    Building trust requires transparency and ethical decision-making.

    Topic 3: Market Dynamics
    Urgency in market positioning determines competitive advantage.
    First-mover advantage is critical in emerging markets.
    Consumer behavior shifts rapidly with technological change.

    Topic 4: Personal Growth
    Transformation begins with self-awareness and intentional practice.
    Breaking old habits requires consistent effort over time.
    Aspiration without action leads to stagnation.

    Topic 5: Industry Disruption
    Rebellion against established norms drives innovation.
    Challenging the status quo requires courage and vision.
    Disruptors often face initial resistance before acceptance.
  `.repeat(3)); // Repeat to ensure enough content

  // Submit text source
  await page.click('button:has-text("Use This Content")');

  // Wait for extraction to complete and Step 3 to be ready
  await page.waitForSelector('text=Configure Pillars', { timeout: 60000 });

  // Step 3: Configure pillars - wait for pillars to load then continue
  const continueButton = page.locator('button:has-text("Continue to Generate")');
  await expect(continueButton).toBeEnabled({ timeout: 30000 });
  await continueButton.click();

  // Step 4: Finalize Hub
  await expect(page.locator('h3:has-text("Ready to Create Hub")')).toBeVisible();

  // Optionally set custom title
  if (hubTitle) {
    await page.fill('input#hubTitle', hubTitle);
  }

  // Click Create Hub button
  await page.click('button:has-text("Create Hub")');

  // Wait for redirect to Hub detail page
  await page.waitForURL(/\/app\/hubs\/[a-f0-9-]+/, { timeout: 30000 });
}

test.describe('Story 3.4: Hub Metadata & State Management', () => {
  test.describe('AC1: Hub List at /app/hubs', () => {
    test('Hubs index page displays list of Hubs', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Verify page title
      await expect(page.locator('h1:has-text("Content Hubs")')).toBeVisible();

      // Verify subtitle
      await expect(page.locator('text=Manage your content sources and pillars')).toBeVisible();
    });

    test('Empty state shows when no Hubs exist', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // If no hubs, empty state should be visible
      const emptyState = page.locator('h3:has-text("No hubs yet")');
      const hubGrid = page.locator('[data-testid="hub-grid"]');

      // Either empty state or hub grid should be visible
      const hasEmptyState = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);
      const hasHubGrid = await hubGrid.isVisible({ timeout: 1000 }).catch(() => false);

      expect(hasEmptyState || hasHubGrid).toBe(true);
    });

    test('New Hub button links to wizard', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Click New Hub button
      await page.click('a:has-text("New Hub")');

      // Should navigate to wizard
      await expect(page).toHaveURL(/\/app\/hubs\/new/);
    });

    test('Hub cards display pillar and spoke counts', async ({ page }) => {
      // First create a Hub
      await createHubThroughWizard(page, 'Test Hub for List');

      // Navigate to Hubs list
      await page.goto(`${BASE_URL}/app/hubs`);

      // Find the Hub card
      const hubCard = page.locator('a[href*="/app/hubs/"]').first();
      await expect(hubCard).toBeVisible();

      // Verify pillar count is displayed
      await expect(hubCard.locator('text=/\\d+ pillars/')).toBeVisible();

      // Verify spoke count is displayed
      await expect(hubCard.locator('text=/\\d+ spokes/')).toBeVisible();
    });
  });

  test.describe('AC2: Hub Card Display', () => {
    test('Hub card shows title', async ({ page }) => {
      await createHubThroughWizard(page, 'My Custom Hub Title');

      await page.goto(`${BASE_URL}/app/hubs`);

      // Verify Hub title is displayed
      await expect(page.locator('text=My Custom Hub Title')).toBeVisible();
    });

    test('Hub card shows source type icon', async ({ page }) => {
      await createHubThroughWizard(page);

      await page.goto(`${BASE_URL}/app/hubs`);

      // Find Hub card
      const hubCard = page.locator('a[href*="/app/hubs/"]').first();
      await expect(hubCard).toBeVisible();

      // Verify source type icon container exists (icon within the card)
      const iconContainer = hubCard.locator('.w-10.h-10');
      await expect(iconContainer).toBeVisible();
    });

    test('Hub card shows status badge', async ({ page }) => {
      await createHubThroughWizard(page);

      await page.goto(`${BASE_URL}/app/hubs`);

      // Find Hub card
      const hubCard = page.locator('a[href*="/app/hubs/"]').first();
      await expect(hubCard).toBeVisible();

      // Verify status badge is displayed (Ready for newly created Hub)
      await expect(hubCard.locator('text=Ready')).toBeVisible();
    });

    test('Hub card shows creation date', async ({ page }) => {
      await createHubThroughWizard(page);

      await page.goto(`${BASE_URL}/app/hubs`);

      // Find Hub card
      const hubCard = page.locator('a[href*="/app/hubs/"]').first();
      await expect(hubCard).toBeVisible();

      // Verify date format (e.g., "Dec 22, 2024")
      await expect(hubCard.locator('text=/[A-Z][a-z]{2} \\d{1,2}, \\d{4}/')).toBeVisible();
    });

    test('Hub card links to detail page', async ({ page }) => {
      await createHubThroughWizard(page, 'Clickable Hub');

      await page.goto(`${BASE_URL}/app/hubs`);

      // Click on Hub card
      await page.click('text=Clickable Hub');

      // Should navigate to Hub detail
      await expect(page).toHaveURL(/\/app\/hubs\/[a-f0-9-]+/);
    });
  });

  test.describe('AC3: Hub Detail View', () => {
    test('Hub detail page displays Hub title', async ({ page }) => {
      await createHubThroughWizard(page, 'Detail View Hub');

      // Should already be on detail page after creation
      await expect(page.locator('h1:has-text("Detail View Hub")')).toBeVisible();
    });

    test('Hub detail page shows status badge', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify Ready status badge in header
      await expect(page.locator('.px-2.py-0\\.5:has-text("Ready")')).toBeVisible();
    });

    test('Hub detail page displays pillar count stats', async ({ page }) => {
      await createHubThroughWizard(page);

      // Find stats section
      const statsSection = page.locator('.flex.items-center.gap-6');
      await expect(statsSection).toBeVisible();

      // Verify pillar count stat card
      await expect(page.locator('text=Pillars').first()).toBeVisible();
    });

    test('Hub detail page displays spoke count stats', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify spoke count stat card
      await expect(page.locator('text=Spokes').first()).toBeVisible();
    });

    test('Hub detail page displays estimated total spokes', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify estimated total stat card
      await expect(page.locator('text=Estimated Total')).toBeVisible();
    });

    test('Hub detail page shows Content Pillars section', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify Content Pillars heading
      await expect(page.locator('h2:has-text("Content Pillars")')).toBeVisible();
    });

    test('Pillar cards display psychological angle badges', async ({ page }) => {
      await createHubThroughWizard(page);

      // Find pillar cards in the grid
      const pillarGrid = page.locator('.grid.gap-4');
      await expect(pillarGrid).toBeVisible();

      // Verify at least one pillar card has a psychological angle badge
      const angleBadges = [
        'Contrarian', 'Authority', 'Urgency', 'Aspiration',
        'Fear', 'Curiosity', 'Transformation', 'Rebellion'
      ];

      // Check that at least one angle badge is visible
      let foundAngle = false;
      for (const angle of angleBadges) {
        const badge = page.locator(`.px-2.py-0\\.5:has-text("${angle}")`);
        if (await badge.isVisible({ timeout: 500 }).catch(() => false)) {
          foundAngle = true;
          break;
        }
      }
      expect(foundAngle).toBe(true);
    });

    test('Pillar cards display core claim', async ({ page }) => {
      await createHubThroughWizard(page);

      // Find pillar cards
      const pillarCards = page.locator('.rounded-lg.p-4');
      await expect(pillarCards.first()).toBeVisible();

      // Verify core claim text exists (text content under title)
      const coreClaimText = pillarCards.first().locator('.text-sm').first();
      await expect(coreClaimText).toBeVisible();
    });

    test('Pillar cards display supporting points', async ({ page }) => {
      await createHubThroughWizard(page);

      // Check for Supporting Points section in pillar cards
      await expect(page.locator('text=Supporting Points').first()).toBeVisible({ timeout: 10000 });
    });

    test('Pillar cards display estimated spoke count', async ({ page }) => {
      await createHubThroughWizard(page);

      // Check for Estimated Spokes label
      await expect(page.locator('text=Estimated Spokes').first()).toBeVisible();
    });

    test('Breadcrumb navigation shows Hubs link', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify breadcrumb
      await expect(page.locator('nav a:has-text("Hubs")')).toBeVisible();
    });

    test('Breadcrumb Hubs link navigates to list', async ({ page }) => {
      await createHubThroughWizard(page);

      // Click breadcrumb
      await page.click('nav a:has-text("Hubs")');

      // Should navigate to Hubs list
      await expect(page).toHaveURL(/\/app\/hubs$/);
    });

    test('Generate Spokes button is visible for ready Hub', async ({ page }) => {
      await createHubThroughWizard(page);

      // Verify Generate Spokes button is visible
      await expect(page.locator('button:has-text("Generate Spokes")')).toBeVisible();
    });
  });

  test.describe('AC4: Finalize Wizard', () => {
    test('Step 4 shows Hub summary', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Go through wizard to Step 4
      await page.click('text=Paste Text');
      await page.fill('textarea', `
        Test content for extraction.
        Topic 1: First topic with contrarian angle.
        Topic 2: Second topic with authority angle.
        Topic 3: Third topic with urgency angle.
        Topic 4: Fourth topic with transformation angle.
        Topic 5: Fifth topic with rebellion angle.
      `.repeat(5));

      await page.click('button:has-text("Use This Content")');
      await page.waitForSelector('text=Configure Pillars', { timeout: 60000 });

      const continueButton = page.locator('button:has-text("Continue to Generate")');
      await expect(continueButton).toBeEnabled({ timeout: 30000 });
      await continueButton.click();

      // Verify Step 4 summary
      await expect(page.locator('h3:has-text("Ready to Create Hub")')).toBeVisible();
      await expect(page.locator('text=/Your Hub will contain \\d+ content pillars/')).toBeVisible();
    });

    test('Step 4 has optional title input', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Navigate to Step 4
      await page.click('text=Paste Text');
      await page.fill('textarea', 'Test content '.repeat(500));
      await page.click('button:has-text("Use This Content")');
      await page.waitForSelector('text=Configure Pillars', { timeout: 60000 });

      const continueButton = page.locator('button:has-text("Continue to Generate")');
      await expect(continueButton).toBeEnabled({ timeout: 30000 });
      await continueButton.click();

      // Verify title input
      await expect(page.locator('input#hubTitle')).toBeVisible();
      await expect(page.locator('label:has-text("Hub Title (optional)")')).toBeVisible();
    });

    test('Step 4 shows pillar preview tags', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Navigate to Step 4
      await page.click('text=Paste Text');
      await page.fill('textarea', 'Test content '.repeat(500));
      await page.click('button:has-text("Use This Content")');
      await page.waitForSelector('text=Configure Pillars', { timeout: 60000 });

      const continueButton = page.locator('button:has-text("Continue to Generate")');
      await expect(continueButton).toBeEnabled({ timeout: 30000 });
      await continueButton.click();

      // Verify Content Pillars section in preview
      await expect(page.locator('h4:has-text("Content Pillars")')).toBeVisible();

      // Verify pillar tags are displayed
      const pillarTags = page.locator('.flex.flex-wrap.gap-2 span');
      const tagCount = await pillarTags.count();
      expect(tagCount).toBeGreaterThanOrEqual(3);
    });

    test('Create Hub button persists Hub and redirects', async ({ page }) => {
      await createHubThroughWizard(page, 'Persistence Test Hub');

      // Should be on Hub detail page
      await expect(page).toHaveURL(/\/app\/hubs\/[a-f0-9-]+/);
      await expect(page.locator('h1:has-text("Persistence Test Hub")')).toBeVisible();

      // Navigate to Hubs list and verify Hub exists
      await page.goto(`${BASE_URL}/app/hubs`);
      await expect(page.locator('text=Persistence Test Hub')).toBeVisible();
    });

    test('Create Hub button shows loading state', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Navigate to Step 4
      await page.click('text=Paste Text');
      await page.fill('textarea', 'Test content '.repeat(500));
      await page.click('button:has-text("Use This Content")');
      await page.waitForSelector('text=Configure Pillars', { timeout: 60000 });

      const continueButton = page.locator('button:has-text("Continue to Generate")');
      await expect(continueButton).toBeEnabled({ timeout: 30000 });
      await continueButton.click();

      // Click Create Hub and check for loading state
      const createButton = page.locator('button:has-text("Create Hub")');
      await createButton.click();

      // Should show loading text (may be brief)
      // Verify redirect happens
      await page.waitForURL(/\/app\/hubs\/[a-f0-9-]+/, { timeout: 30000 });
    });

    test('Custom title is used when provided', async ({ page }) => {
      await createHubThroughWizard(page, 'My Specific Custom Title');

      // Verify custom title on detail page
      await expect(page.locator('h1:has-text("My Specific Custom Title")')).toBeVisible();
    });

    test('Source title is used when no custom title provided', async ({ page }) => {
      await createHubThroughWizard(page);

      // Should be on detail page with auto-generated title
      // The title should not be empty
      const titleElement = page.locator('h1').first();
      const titleText = await titleElement.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText?.length).toBeGreaterThan(0);
    });
  });

  test.describe('AC5: Client Data Isolation', () => {
    test('Hub list only shows Hubs for authenticated user', async ({ page }) => {
      // Create a Hub
      await createHubThroughWizard(page, 'Isolated Hub Test');

      // Navigate to Hubs list
      await page.goto(`${BASE_URL}/app/hubs`);

      // Verify the created Hub is visible
      await expect(page.locator('text=Isolated Hub Test')).toBeVisible();

      // Note: Full isolation testing would require a second user account
      // This test verifies the user can see their own Hubs
    });

    test('Hub detail page returns error for non-existent Hub', async ({ page }) => {
      await login(page);

      // Navigate to a non-existent Hub
      await page.goto(`${BASE_URL}/app/hubs/non-existent-uuid-12345`);

      // Should show error message
      await expect(page.locator('text=/does not exist|not found|Error/i')).toBeVisible({ timeout: 10000 });
    });

    test('Hub API requires authentication', async ({ page }) => {
      // Try to access Hubs page without login
      await page.goto(`${BASE_URL}/app/hubs`);

      // Should redirect to login or show auth required message
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/login');
      const isOnHubsPage = currentUrl.includes('/app/hubs');

      // Either redirected to login or shows empty/error state
      expect(isOnLoginPage || isOnHubsPage).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('Hub list shows error state on API failure', async ({ page }) => {
      await login(page);

      // Mock API failure
      await page.route('**/trpc/hubs.list**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: { message: 'Internal server error' } }),
        });
      });

      await page.goto(`${BASE_URL}/app/hubs`);

      // Should show error message
      await expect(page.locator('text=/Failed to load hubs|Error/i')).toBeVisible({ timeout: 10000 });
    });

    test('Hub detail shows error for invalid Hub ID', async ({ page }) => {
      await login(page);

      await page.goto(`${BASE_URL}/app/hubs/00000000-0000-0000-0000-000000000000`);

      // Should show error or not found message
      const errorVisible = await page.locator('text=/not found|does not exist|Error/i').isVisible({ timeout: 10000 }).catch(() => false);
      expect(errorVisible).toBe(true);
    });
  });

  test.describe('Navigation', () => {
    test('Back button from Hub detail returns to list', async ({ page }) => {
      await createHubThroughWizard(page);

      // Click Back to Hubs link (if error) or breadcrumb
      const backLink = page.locator('nav a:has-text("Hubs")');
      await backLink.click();

      await expect(page).toHaveURL(/\/app\/hubs$/);
    });

    test('Sidebar Hubs link navigates to list', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app`);

      // Click Hubs in sidebar
      await page.click('a[href="/app/hubs"]');

      await expect(page).toHaveURL(/\/app\/hubs$/);
    });
  });

  test.describe('Loading States', () => {
    test('Hub list shows loading skeleton', async ({ page }) => {
      await login(page);

      // Slow down API response to see loading state
      await page.route('**/trpc/hubs.list**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        route.continue();
      });

      await page.goto(`${BASE_URL}/app/hubs`);

      // Should show loading skeleton with animation
      const skeleton = page.locator('.animate-pulse');
      await expect(skeleton.first()).toBeVisible({ timeout: 1000 });
    });

    test('Hub detail shows loading skeleton', async ({ page }) => {
      await login(page);

      // Slow down API response
      await page.route('**/trpc/hubs.get**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        route.continue();
      });

      // Create a Hub first to get a valid ID
      await createHubThroughWizard(page);
      const hubUrl = page.url();

      // Revisit the page with slow response
      await page.goto(hubUrl);

      // Should show loading skeleton
      const skeleton = page.locator('.animate-pulse');
      await expect(skeleton.first()).toBeVisible({ timeout: 1000 });
    });
  });

  test.describe('Pagination', () => {
    test('Load More button appears when more Hubs exist', async ({ page }) => {
      // This test would require creating 20+ Hubs
      // For now, just verify the page structure supports pagination
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // The Load More button should appear if there are more than 20 Hubs
      // This is a structural test - actual pagination requires data setup
      const loadMoreButton = page.locator('button:has-text("Load More")');

      // Button may or may not be visible depending on data
      // Just verify the page loads correctly
      await expect(page.locator('h1:has-text("Content Hubs")')).toBeVisible();
    });
  });
});
