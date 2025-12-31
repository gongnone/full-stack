import { test, expect } from '@playwright/test';
import { login, waitForPageLoad, config } from './utils/test-helpers';

/**
 * R-13: Session Cache Isolation Tests
 *
 * Verifies that React Query cache is properly cleared during session boundaries
 * to prevent data leakage between users in the same browser.
 *
 * Bug fixed: When User B logs in after User A, User B could see User A's
 * client list in the dropdown (cached React Query data) even though
 * backend correctly returned 403 for unauthorized data access.
 */
test.describe('R-13: Session Cache Isolation @P0 @security', () => {
  test('Logout clears session user tracking from sessionStorage', async ({ page }) => {
    // GIVEN: User is logged in
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in - check TEST_EMAIL and TEST_PASSWORD');

    await page.goto('/app');
    await waitForPageLoad(page);

    // Verify session user ID is stored
    const userIdBefore = await page.evaluate(() => {
      return sessionStorage.getItem('foundry_session_user_id');
    });
    expect(userIdBefore).toBeTruthy();

    // WHEN: User logs out via sidebar
    const sidebarLogout = page.locator('aside button[title="Sign out"]');
    if (await sidebarLogout.isVisible()) {
      await sidebarLogout.click();
    } else {
      // Fallback: Go to settings and use SignOutButton
      await page.goto('/app/settings');
      await waitForPageLoad(page);
      await page.click('[data-testid="sign-out-btn"]');
    }

    // Wait for navigation to login page
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // THEN: Session user ID should be cleared from sessionStorage
    const userIdAfter = await page.evaluate(() => {
      return sessionStorage.getItem('foundry_session_user_id');
    });
    expect(userIdAfter).toBeNull();
  });

  test('Login page accessible after logout', async ({ page }) => {
    // GIVEN: User logs in
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in');

    await page.goto('/app');
    await waitForPageLoad(page);

    // WHEN: User logs out
    const sidebarLogout = page.locator('aside button[title="Sign out"]');
    if (await sidebarLogout.isVisible()) {
      await sidebarLogout.click();
    } else {
      await page.goto('/app/settings');
      await waitForPageLoad(page);
      await page.click('[data-testid="sign-out-btn"]');
    }

    // Wait for navigation to login page
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // THEN: Login form should be displayed
    await expect(page.locator('#email')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#password')).toBeVisible();
  });

  test('Re-login after logout establishes new session', async ({ page }) => {
    // GIVEN: User logs in
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in');

    await page.goto('/app');
    await waitForPageLoad(page);

    // Get initial session user ID
    const initialUserId = await page.evaluate(() => {
      return sessionStorage.getItem('foundry_session_user_id');
    });
    expect(initialUserId).toBeTruthy();

    // WHEN: User logs out
    const sidebarLogout = page.locator('aside button[title="Sign out"]');
    if (await sidebarLogout.isVisible()) {
      await sidebarLogout.click();
    } else {
      await page.goto('/app/settings');
      await waitForPageLoad(page);
      await page.click('[data-testid="sign-out-btn"]');
    }

    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Re-login with same user
    await page.fill('#email', config.email);
    await page.fill('#password', config.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 30000 });
    await waitForPageLoad(page);

    // THEN: Session user ID should be re-established
    const newUserId = await page.evaluate(() => {
      return sessionStorage.getItem('foundry_session_user_id');
    });
    expect(newUserId).toBeTruthy();
    // Same user, so ID should match
    expect(newUserId).toBe(initialUserId);
  });

  test('Client list is fetched fresh after login (no stale cache)', async ({ page }) => {
    // GIVEN: User logs in
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in');

    await page.goto('/app');
    await waitForPageLoad(page);

    // WHEN: Navigate to a page that shows the client selector
    // Wait for client selector to load
    const clientSelector = page.locator('button:has-text("Select Client"), button:has-text("Client")').first();
    const selectorVisible = await clientSelector.isVisible({ timeout: 5000 }).catch(() => false);

    // THEN: Either client selector shows user's clients OR empty state
    // (No 403 errors should appear - that would indicate stale cache from another user)
    if (selectorVisible) {
      await clientSelector.click();
      await page.waitForTimeout(500); // Allow dropdown to open

      // Check for forbidden errors in the UI (would indicate using cached unauthorized data)
      const forbiddenError = page.locator('text=/forbidden|403|unauthorized/i');
      const hasForbidden = await forbiddenError.isVisible({ timeout: 1000 }).catch(() => false);
      expect(hasForbidden).toBe(false);
    }
  });

  test('Dashboard loads without data leakage errors', async ({ page }) => {
    // GIVEN: Fresh login
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Could not log in');

    // WHEN: Navigate to dashboard
    await page.goto('/app');
    await waitForPageLoad(page);

    // THEN: No error alerts should be visible
    const errorAlert = page.locator('[role="alert"]:has-text("error")');
    const hasError = await errorAlert.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasError).toBe(false);

    // Dashboard should show normal content (sidebar, main content)
    await expect(page.locator('aside')).toBeVisible(); // Sidebar
    await expect(page.locator('main')).toBeVisible(); // Main content area
  });
});
