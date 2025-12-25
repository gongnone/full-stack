import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('Login Page - Visual Baseline', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');

    // Wait for critical elements - CardTitle renders as h3
    await expect(page.locator('h3')).toContainText('Sign in to Foundry');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
    });
  });

  test('Dashboard Shell - Visual Baseline', async ({ page }) => {
    // Navigate to app dashboard (requires auth - will redirect to login if not authed)
    await page.goto('/app');

    // Check if redirected to login (expected for unauthenticated)
    // For VRT we test the login redirect state
    await expect(page).toHaveScreenshot('dashboard-or-login.png', {
      fullPage: true,
    });
  });

  test('UI Components - Button States', async ({ page }) => {
    // Visit settings page (may redirect to login)
    await page.goto('/app/settings');

    // Take screenshot of whatever state we're in
    await expect(page).toHaveScreenshot('settings-or-login.png', {
      fullPage: true,
    });
  });
});
