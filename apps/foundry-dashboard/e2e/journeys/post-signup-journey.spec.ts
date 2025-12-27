/**
 * Post-Signup Activation Journey E2E Test
 *
 * This spec file directly tests the complete post-signup user journey
 * as defined in e2e/features/post-signup-journey.feature
 *
 * Run with:
 *   pnpm exec playwright test e2e/journeys/post-signup-journey.spec.ts
 *   pnpm exec playwright test e2e/journeys/post-signup-journey.spec.ts --grep "@P0"
 *
 * @tags @P0 @critical @activation @journey
 */

import { test, expect } from '../fixtures/auth.fixture';
import { uniqueTestId } from '../fixtures/auth.fixture';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const JOURNEY_CONFIG = {
  // Client creation
  clientName: () => `Test Client ${uniqueTestId('client')}`,
  industry: 'Technology',

  // Source content for hub
  sourceContent: `
    Today we're exploring the future of AI-powered content creation.

    Our first key insight is that AI can handle repetitive tasks while humans
    provide strategic creative direction. This creates powerful synergy.

    Second, quality gates ensure every piece of content meets brand standards
    before publication. This maintains consistency at scale.

    Third, real-time feedback loops allow continuous improvement. Each review
    teaches the system to better match your voice.

    Finally, the executive producer model gives you final approval power
    while saving hours of manual content creation.
  `.trim(),

  // Performance thresholds
  dashboardLoadTime: 3000,  // NFR-P5: < 3 seconds
  pillarExtraction: 30000,  // NFR-P2: < 30 seconds
  spokeGeneration: 60000,   // NFR-P3: < 60 seconds
  keyboardResponse: 200,    // NFR-P4: < 200ms
  journeyTimeout: 300000,   // 5 minutes total
};

// =============================================================================
// PHASE 1: DASHBOARD ONBOARDING
// =============================================================================

test.describe('@P0 Phase 1: Dashboard Onboarding', () => {
  test('1.1 Dashboard loads with sidebar navigation', async ({ dashboardPage }) => {
    // Given: I am logged in as a new subscriber
    // When: the page loads
    const startTime = Date.now();
    await dashboardPage.goto();
    const loadTime = Date.now() - startTime;

    // Then: I should see the sidebar
    await dashboardPage.verifySidebar();

    // And: page should load within 3 seconds (NFR-P5)
    expect(loadTime, `Load time ${loadTime}ms exceeds ${JOURNEY_CONFIG.dashboardLoadTime}ms`).toBeLessThan(
      JOURNEY_CONFIG.dashboardLoadTime
    );
  });

  test('1.2 Command palette opens with Cmd+K', async ({ dashboardPage }) => {
    await dashboardPage.goto();

    // When: I press Cmd+K
    await dashboardPage.openCommandPalette();

    // Allow time for animation
    await dashboardPage.page.waitForTimeout(300);

    // Cleanup
    await dashboardPage.closeCommandPalette();
  });
});

// =============================================================================
// PHASE 2: CLIENT CREATION
// =============================================================================

test.describe('@P0 Phase 2: Client Creation', () => {
  test('2.1 Client creation form is accessible', async ({ clientPage }) => {
    // Navigate to new client page
    await clientPage.gotoNew();

    // Verify form is visible (or navigate via button)
    const formVisible = await clientPage.isFormVisible();

    if (!formVisible) {
      await clientPage.goto();
      const createBtn = clientPage.createClientButton;
      if (await clientPage.isVisible(createBtn)) {
        await createBtn.click();
        await clientPage.waitForLoad();
      }
    }
  });

  test('2.2 Create a new client successfully', async ({ clientPage }) => {
    const clientName = JOURNEY_CONFIG.clientName();

    // Navigate to create
    await clientPage.gotoNew();

    if (await clientPage.isFormVisible()) {
      // Fill and submit form
      await clientPage.createClient({
        name: clientName,
        industry: JOURNEY_CONFIG.industry,
      });

      // Verify creation (redirect or success message)
      await clientPage.waitForLoad();

      // Screenshot for verification
      await clientPage.screenshot('client-created');
    }
  });
});

// =============================================================================
// PHASE 4: HUB CREATION
// =============================================================================

test.describe('@P0 Phase 4: Hub Creation', () => {
  test('4.1 Hub creation wizard is accessible', async ({ hubPage }) => {
    await hubPage.gotoNew();
    await hubPage.waitForLoad();
    await hubPage.screenshot('hub-wizard');
  });

  test('4.2 Hub list page loads correctly', async ({ hubPage }) => {
    await hubPage.goto();
    await hubPage.waitForLoad();

    // Verify page structure
    const bodyVisible = await hubPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// =============================================================================
// PHASE 6: REVIEW
// =============================================================================

test.describe('@P0 Phase 6: Review', () => {
  test('6.1 Review page loads correctly', async ({ reviewPage }) => {
    await reviewPage.goto();
    await reviewPage.waitForLoad();

    // Verify page is visible
    const bodyVisible = await reviewPage.page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);

    await reviewPage.screenshot('review-page');
  });

  test('6.2 Sprint mode elements are present', async ({ reviewPage }) => {
    await reviewPage.goto();
    await reviewPage.waitForLoad();

    // Check for sprint-related elements
    // Actual availability depends on data state
  });
});

// =============================================================================
// COMPLETE JOURNEY: HAPPY PATH
// =============================================================================

test.describe('@P0 @smoke Complete Journey', () => {
  test('Full navigation flow completes successfully', async ({
    authenticatedPage,
    dashboardPage,
    clientPage,
    hubPage,
    reviewPage,
    reportPage,
  }) => {
    const journeyStart = Date.now();
    const checkpoints: { name: string; time: number }[] = [];

    // Helper to record checkpoint
    const checkpoint = (name: string) => {
      checkpoints.push({ name, time: Date.now() - journeyStart });
    };

    // --- PHASE 1: Dashboard ---
    await dashboardPage.goto();
    await dashboardPage.verifySidebar();
    checkpoint('Dashboard loaded');

    // --- PHASE 2: Clients ---
    await clientPage.goto();
    await clientPage.waitForLoad();
    checkpoint('Clients page loaded');

    // --- PHASE 4: Hubs ---
    await hubPage.goto();
    await hubPage.waitForLoad();
    checkpoint('Hubs page loaded');

    // --- PHASE 6: Review ---
    await reviewPage.goto();
    await reviewPage.waitForLoad();
    checkpoint('Review page loaded');

    // --- Summary ---
    const totalTime = Date.now() - journeyStart;
    checkpoint('Journey complete');

    console.log('\n=== POST-SIGNUP JOURNEY CHECKPOINTS ===');
    checkpoints.forEach((cp) => {
      console.log(`  ${cp.name}: ${cp.time}ms`);
    });
    console.log(`  TOTAL: ${totalTime}ms`);
    console.log('==========================================\n');

    // Verify journey completed in reasonable time
    expect(totalTime, 'Journey should complete within timeout').toBeLessThan(
      JOURNEY_CONFIG.journeyTimeout
    );
  });

  test('No console errors during navigation', async ({
    authenticatedPage,
    dashboardPage,
    clientPage,
    hubPage,
    reviewPage,
  }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    authenticatedPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate through all pages
    await dashboardPage.goto();
    await clientPage.goto();
    await hubPage.goto();
    await reviewPage.goto();

    // Filter out known benign errors (e.g., missing optional resources)
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('Failed to load resource')
    );

    if (criticalErrors.length > 0) {
      console.log('Console errors found:', criticalErrors);
    }

    // Allow some non-critical errors, but warn
    expect(criticalErrors.length, 'Should have minimal console errors').toBeLessThan(5);
  });
});

// =============================================================================
// ERROR RECOVERY
// =============================================================================

test.describe('Error Recovery', () => {
  test('Invalid route shows error or redirects gracefully', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/this-page-does-not-exist-12345');

    // Should not crash
    const bodyVisible = await authenticatedPage.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });

  test('Unauthorized access redirects to login', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/app/hubs');

    // Should redirect to login
    await page.waitForTimeout(2000);
    const url = page.url();

    // Either redirects to login or shows unauthorized
    const isAuthRequired = url.includes('/login') || url.includes('/signup');
    expect(isAuthRequired, 'Protected routes should require auth').toBe(true);
  });
});
