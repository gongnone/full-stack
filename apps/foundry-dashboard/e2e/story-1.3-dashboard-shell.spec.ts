/**
 * Story 1.3: Dashboard Shell with Routing
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Logged in → navigate to /app → see dashboard shell with sidebar navigation, loads < 3 seconds
 * AC2: View sidebar → see: Dashboard, Hubs, Review, Clients, Analytics, Settings
 * AC3: Unauthenticated → access /app/* → redirect to /login
 * AC4: Press Cmd+K → command palette opens
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Story 1.3: Dashboard Shell with Routing', () => {
  test.describe('AC3: Auth Redirect', () => {
    test('unauthenticated user accessing /app is redirected to /login', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Navigate directly to protected route
      await page.goto(`${BASE_URL}/app`);

      // Should be redirected to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('unauthenticated user accessing /app/hubs is redirected to /login', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/app/hubs`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('unauthenticated user accessing /app/settings is redirected to /login', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(`${BASE_URL}/app/settings`);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Authenticated User Tests', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
    });

    test('AC1: Dashboard loads with sidebar navigation in < 3 seconds (NFR-P5)', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(`${BASE_URL}/app`);

      // Wait for dashboard content to be visible
      await expect(page.locator('aside')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();

      const loadTime = Date.now() - startTime;

      // NFR-P5: Must load in < 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify sidebar is present
      await expect(page.locator('aside')).toBeVisible();

      // Verify main content area is present
      await expect(page.locator('main')).toBeVisible();
    });

    test('AC2: Sidebar shows all required navigation items', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Wait for sidebar to load
      await expect(page.locator('aside')).toBeVisible();

      // Check all 6 navigation items exist
      const navItems = ['Dashboard', 'Hubs', 'Review', 'Clients', 'Analytics', 'Settings'];

      for (const item of navItems) {
        const navLink = page.locator(`aside a:has-text("${item}")`);
        await expect(navLink).toBeVisible();
      }
    });

    test('AC2: Navigation links route to correct pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Test each navigation link
      const routes = [
        { name: 'Hubs', path: '/app/hubs' },
        { name: 'Review', path: '/app/review' },
        { name: 'Clients', path: '/app/clients' },
        { name: 'Analytics', path: '/app/analytics' },
        { name: 'Settings', path: '/app/settings' },
        { name: 'Dashboard', path: '/app' },
      ];

      for (const route of routes) {
        await page.click(`aside a:has-text("${route.name}")`);
        await expect(page).toHaveURL(new RegExp(route.path));
      }
    });

    test('AC4: Cmd+K opens command palette', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Command palette should be closed initially
      await expect(page.locator('[role="dialog"], .command-palette-overlay')).not.toBeVisible();

      // Press Cmd+K (Meta+K)
      await page.keyboard.press('Meta+k');

      // Command palette should now be visible
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('AC4: Ctrl+K also opens command palette (Windows/Linux)', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Press Ctrl+K
      await page.keyboard.press('Control+k');

      // Command palette should be visible
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('AC4: ESC closes command palette', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Open command palette
      await page.keyboard.press('Meta+k');
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

      // Press ESC to close
      await page.keyboard.press('Escape');

      // Command palette should be hidden
      await expect(page.locator('input[placeholder*="Search"]')).not.toBeVisible();
    });

    test('AC4: Command palette search button opens palette', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Click the search button in header
      await page.click('button:has-text("Search")');

      // Command palette should be visible
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    });

    test('Command palette navigation works', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Open command palette
      await page.keyboard.press('Meta+k');
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

      // Type search query
      await page.fill('input[placeholder*="Search"]', 'Hubs');

      // Should see Hubs in results
      await expect(page.locator('button:has-text("Go to Hubs")')).toBeVisible();

      // Click the result
      await page.click('button:has-text("Go to Hubs")');

      // Should navigate to Hubs
      await expect(page).toHaveURL(/\/app\/hubs/);
    });
  });

  test.describe('Midnight Command Theme', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
    });

    test('Dashboard uses Midnight Command dark theme', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      // Check body background color is #0F1419
      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // RGB(15, 20, 25) = #0F1419
      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });

    test('Sidebar uses elevated background color', async ({ page }) => {
      await page.goto(`${BASE_URL}/app`);

      const sidebar = page.locator('aside');
      const bgColor = await sidebar.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // RGB(26, 31, 38) = #1A1F26
      expect(bgColor).toBe('rgb(26, 31, 38)');
    });
  });
});
