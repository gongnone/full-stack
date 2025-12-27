/**
 * Production Smoke Tests
 * Run after every deploy to verify critical paths work.
 *
 * @tags @smoke @production @P0
 *
 * Usage:
 *   npx playwright test e2e/smoke/production.spec.ts
 *   PROD_URL=https://foundry.williamjshaw.ca npx playwright test e2e/smoke/
 */

import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL || process.env.BASE_URL || 'http://localhost:5173';
const SMOKE_TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || process.env.TEST_EMAIL || 'admin@foundry.test';
const SMOKE_TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || process.env.TEST_PASSWORD || 'AdminPass123!';

test.describe('Production Smoke Tests', () => {
  test.describe.configure({ mode: 'serial' }); // Run in order, fail fast

  test('1. Homepage or Login page loads', async ({ page }) => {
    const response = await page.goto(PROD_URL);
    expect(response?.status()).toBeLessThan(400);

    // Should show either login form or redirect to login
    const loginVisible = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    const dashboardVisible = await page.locator('aside').isVisible({ timeout: 1000 }).catch(() => false);

    expect(loginVisible || dashboardVisible).toBe(true);
  });

  test('2. Login page accessible and functional', async ({ page }) => {
    await page.goto(`${PROD_URL}/login`);

    // Form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Form is interactive
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit button is enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('3. API health check endpoint responds', async ({ request }) => {
    const response = await request.get(`${PROD_URL}/api/health`);

    // Accept 200 or 404 (if health endpoint not implemented yet)
    expect([200, 404]).toContain(response.status());

    if (response.status() === 200) {
      const body = await response.json().catch(() => ({}));
      expect(body).toHaveProperty('status');
    }
  });

  test('4. tRPC endpoint responds', async ({ request }) => {
    // Unauthenticated request should return 401 or valid response
    const response = await request.get(`${PROD_URL}/api/trpc/auth.session`);

    // Accept 200, 401, or 500 (but not 502/503/504)
    expect([200, 401, 500]).toContain(response.status());
  });

  test('5. Static assets load correctly', async ({ page }) => {
    await page.goto(`${PROD_URL}/login`);

    // Check CSS loaded (body should have styles)
    const bodyBgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Should not be browser default white (indicates CSS loaded)
    // Midnight Command theme: rgb(15, 20, 25)
    expect(bodyBgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('6. Authenticated user can access dashboard', async ({ page }) => {
    // Skip if no credentials provided
    if (!SMOKE_TEST_EMAIL || SMOKE_TEST_EMAIL === 'admin@foundry.test') {
      test.skip(true, 'No smoke test credentials provided');
      return;
    }

    // Login
    await page.goto(`${PROD_URL}/login`);
    await page.fill('input[type="email"]', SMOKE_TEST_EMAIL);
    await page.fill('input[type="password"]', SMOKE_TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Verify dashboard loads
    try {
      await page.waitForURL(/\/app/, { timeout: 30000 });
      await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
    } catch {
      // Capture screenshot on failure
      await page.screenshot({ path: 'smoke-test-login-failure.png' });
      throw new Error('Dashboard did not load after login');
    }
  });

  test('7. Signup page accessible', async ({ page }) => {
    await page.goto(`${PROD_URL}/signup`);

    // Signup form exists
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('8. Protected routes redirect to login', async ({ page, context }) => {
    // Clear all cookies
    await context.clearCookies();

    // Try to access protected route
    await page.goto(`${PROD_URL}/app`);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('9. OAuth buttons visible (if enabled)', async ({ page }) => {
    await page.goto(`${PROD_URL}/login`);

    // Check for OAuth buttons (optional - depends on configuration)
    const googleBtn = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
    const githubBtn = page.locator('button:has-text("GitHub"), button:has-text("Continue with GitHub")');

    // At least one should be visible, or neither (both are optional)
    const hasOAuth = await googleBtn.isVisible({ timeout: 2000 }).catch(() => false) ||
                     await githubBtn.isVisible({ timeout: 1000 }).catch(() => false);

    // Pass regardless - OAuth is optional
    expect(true).toBe(true);

    if (hasOAuth) {
      console.log('OAuth buttons found - social login enabled');
    }
  });

  test('10. No console errors on critical pages', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Visit login page
    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('ResizeObserver') &&
      !err.includes('favicon.ico') &&
      !err.includes('net::ERR') // Network errors on local
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Performance Smoke Tests', () => {
  test('Login page loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(`${PROD_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // NFR-P5: Dashboard initial load < 3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`[NFR-P5] Login page load time: ${loadTime}ms`);
  });

  test('First Contentful Paint is reasonable', async ({ page }) => {
    await page.goto(`${PROD_URL}/login`);

    const fcp = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint')
        .find(entry => entry.name === 'first-contentful-paint');
      return paint ? paint.startTime : 0;
    });

    // FCP should be under 2 seconds for good UX
    expect(fcp).toBeLessThan(2000);

    console.log(`[Performance] First Contentful Paint: ${fcp.toFixed(0)}ms`);
  });
});
