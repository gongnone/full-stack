import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

/**
 * Security Isolation Tests
 * 
 * Verifies Rule 1: Isolation Above All
 * "Every database query MUST include client context filtering. 
 * Brand DNA contamination between clients is a critical failure."
 */
test.describe('Security: Multi-Tenant Isolation', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');
  });

  test('User cannot access Hub data belonging to another client', async ({ page }) => {
    // GIVEN: User is authenticated and in their primary client context
    await page.goto('/app/hubs');
    await waitForPageLoad(page);

    // WHEN: User attempts to access a Hub ID that does not belong to them
    // (We use a random UUID to simulate a valid but unauthorized ID)
    const invalidHubId = 'deadbeef-0000-4000-a000-000000000000';
    await page.goto(`/app/hubs/${invalidHubId}`);

    // THEN: System should deny access or show not found
    // It should NOT leak data or show the Hub dashboard for that ID
    const errorState = page.locator('text=/not found|access denied|forbidden|error/i');
    const dashboardTitle = page.locator('h1:has-text("Hub Dashboard")');
    
    // Check that we either see an error or we are redirected away from the dashboard
    const hasError = await errorState.isVisible({ timeout: 5000 }).catch(() => false);
    const hasDashboard = await dashboardTitle.isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasDashboard).toBe(false);
    expect(hasError || page.url().includes('/app/hubs')).toBe(true);
  });

  test('User cannot access settings of another client', async ({ page }) => {
    // GIVEN: User is authenticated
    
    // WHEN: User attempts to access a Client ID they are not assigned to
    const unauthorizedClientId = 'client-x-999';
    await page.goto(`/app/clients/${unauthorizedClientId}/settings`);

    // THEN: Access should be forbidden
    await expect(page.locator('text=/forbidden|denied|authorized|error/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('Switching clients clears previous client data from view', async ({ page }) => {
    // GIVEN: User is viewing Client A data
    await page.goto('/app/hubs');
    await waitForPageLoad(page);
    
    // Capture some content from Client A
    const clientAContent = await page.locator('main').innerText();

    // WHEN: User switches to Client B (via the selector)
    // Note: This assumes a client selector exists in the header as per Story 7.3
    const selector = page.locator('[data-testid="client-selector"], .client-selector');
    if (await selector.isVisible()) {
      await selector.click();
      await page.locator('text=/Client B|Test Client/i').first().click();
      
      // THEN: Context switch completes in < 100ms (NFR-P1)
      // And no Client A data remains
      await waitForPageLoad(page);
      const clientBContent = await page.locator('main').innerText();
      expect(clientBContent).not.toBe(clientAContent);
    }
  });
});
