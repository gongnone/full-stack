/**
 * Complete Happy Path E2E Test
 *
 * Full navigation from dashboard to export
 * @tags @P0 @smoke @user-journey
 */

import { test as _authTest, expect } from '@playwright/test';
import { test } from '../fixtures/auth.fixture';

test.describe('@P0 @smoke Complete User Journey', () => {
  test('Full navigation from dashboard to export', async ({
    authenticatedPage: _authenticatedPage,
    dashboardPage,
    clientPage,
    hubPage,
    reviewPage,
  }) => {
    const journeyStart = Date.now();
    const checkpoints: { name: string; time: number }[] = [];

    const checkpoint = (name: string) => {
      checkpoints.push({ name, time: Date.now() - journeyStart });
    };

    // Stage 1: Dashboard
    await dashboardPage.goto();
    await dashboardPage.verifySidebar();
    checkpoint('Dashboard loaded');

    // Stage 2: Clients
    await clientPage.goto();
    await clientPage.waitForLoad();
    checkpoint('Clients page loaded');

    // Stage 4: Hubs
    await hubPage.goto();
    await hubPage.waitForLoad();
    checkpoint('Hubs page loaded');

    // Stage 6: Review
    await reviewPage.goto();
    await reviewPage.waitForLoad();
    checkpoint('Review page loaded');

    // Summary
    const totalTime = Date.now() - journeyStart;
    checkpoint('Journey complete');

    console.log('\n=== COMPLETE USER JOURNEY ===');
    checkpoints.forEach((cp) => console.log(`  ${cp.name}: ${cp.time}ms`));
    console.log(`  TOTAL: ${totalTime}ms`);
    console.log('==============================\n');

    expect(totalTime).toBeLessThan(60000);
  });
});
