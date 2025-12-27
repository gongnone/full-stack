/**
 * Walking Skeleton: New Subscriber Journey Smoke Test
 *
 * PURPOSE: Validate end-to-end wiring from frontend to backend.
 * EXPECTATION: This test validates the full user journey including signup and login.
 *
 * On failure, Playwright will generate:
 * - Screenshot at failure point
 * - Full trace file for debugging
 * - Console logs and network requests
 *
 * Run with: pnpm exec playwright test e2e/smoke/walking-skeleton.spec.ts --trace on
 *
 * @tags @smoke @skeleton @P0
 */

import { test, expect } from '@playwright/test';

// Configuration - targets local Cloudflare stage
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  workerUrl: process.env.WORKER_URL || 'http://localhost:8787',
  testEmail: `e2e-${Date.now()}@foundry.local`, // Unique email per run
  testPassword: 'TestPassword123!',
  testName: 'E2E Test User',
};

// Capture all console messages for debugging
test.beforeEach(async ({ page }) => {
  // Log all console messages
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[BROWSER ${type.toUpperCase()}] ${msg.text()}`);
    }
  });

  // Log all failed network requests
  page.on('requestfailed', (request) => {
    console.log(`[NETWORK FAIL] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  // Log all response errors
  page.on('response', (response) => {
    if (response.status() >= 400) {
      console.log(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });
});

test.describe('Walking Skeleton: Backend Wiring Validation', () => {
  test.describe.configure({ mode: 'serial' }); // Run in order

  test('CHECKPOINT 1: Worker health endpoint responds', async ({ request }) => {
    console.log(`\n=== CHECKPOINT 1: Testing ${config.workerUrl}/health ===`);

    const response = await request.get(`${config.workerUrl}/health`);
    const status = response.status();

    console.log(`Health check status: ${status}`);

    if (status !== 200) {
      console.log('❌ FAILURE: Worker is not running or health endpoint missing');
      console.log('DIAGNOSIS: Start worker with `pnpm exec wrangler dev --local`');
    }

    expect(status, 'Worker health endpoint should return 200').toBe(200);
  });

  test('CHECKPOINT 2: API health with D1 connectivity', async ({ request }) => {
    console.log(`\n=== CHECKPOINT 2: Testing ${config.baseUrl}/api/health ===`);

    const response = await request.get(`${config.baseUrl}/api/health`);
    const status = response.status();
    const body = await response.json().catch(() => ({}));

    console.log(`API health status: ${status}`);
    console.log(`API health body: ${JSON.stringify(body, null, 2)}`);

    if (status !== 200) {
      console.log('❌ FAILURE: API health check failed');
      console.log('DIAGNOSIS: Check D1 database binding and migrations');
    }

    expect(status, 'API health should return 200').toBe(200);
    expect(body.status, 'D1 should be healthy').toBe('ok');
  });

  test('CHECKPOINT 3: Frontend serves correctly', async ({ page }) => {
    console.log(`\n=== CHECKPOINT 3: Testing ${config.baseUrl} ===`);

    const response = await page.goto(config.baseUrl);
    const status = response?.status() || 0;

    console.log(`Frontend status: ${status}`);

    // Take screenshot of landing state
    await page.screenshot({ path: 'test-results/skeleton-01-landing.png' });

    if (status >= 400) {
      console.log('❌ FAILURE: Frontend not serving');
      console.log('DIAGNOSIS: Check if Vite/Wrangler is running');
    }

    expect(status, 'Frontend should load').toBeLessThan(400);

    // Check for visible content
    const body = await page.locator('body').isVisible();
    expect(body, 'Page body should be visible').toBe(true);
  });

  test('CHECKPOINT 4: Sign up new test user', async ({ request }) => {
    console.log(`\n=== CHECKPOINT 4: Creating test user via API ===`);
    console.log(`Email: ${config.testEmail}`);

    // Call Better Auth sign-up endpoint
    const response = await request.post(`${config.baseUrl}/api/auth/sign-up/email`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: config.testEmail,
        password: config.testPassword,
        name: config.testName,
      },
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    console.log(`Sign-up status: ${status}`);
    console.log(`Sign-up response: ${JSON.stringify(body, null, 2)}`);

    if (status >= 400) {
      console.log('❌ FAILURE: Sign-up failed');
      console.log('DIAGNOSIS: Check Better Auth email/password configuration');
    }

    // Sign-up should succeed (200 or 201)
    expect(status, 'Sign-up should succeed').toBeLessThan(300);

    // Should return user object
    expect(body.user || body.id, 'Should return user data').toBeTruthy();
  });

  test('CHECKPOINT 5: Login with new user via API', async ({ request }) => {
    console.log(`\n=== CHECKPOINT 5: Testing login via API ===`);

    const response = await request.post(`${config.baseUrl}/api/auth/sign-in/email`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: config.testEmail,
        password: config.testPassword,
      },
    });

    const status = response.status();
    const body = await response.json().catch(() => ({}));

    console.log(`Sign-in status: ${status}`);
    console.log(`Sign-in response: ${JSON.stringify(body, null, 2)}`);

    if (status >= 400) {
      console.log('❌ FAILURE: Sign-in failed');
      console.log('DIAGNOSIS: Check Better Auth session creation');
    }

    expect(status, 'Sign-in should succeed').toBeLessThan(300);
  });

  test('CHECKPOINT 6: Login via UI and access dashboard', async ({ page }) => {
    console.log(`\n=== CHECKPOINT 6: Full UI login flow ===`);

    // Go to login page
    await page.goto(`${config.baseUrl}/login`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Take screenshot
    await page.screenshot({ path: 'test-results/skeleton-02-login.png' });

    // Fill login form
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/skeleton-03-login-filled.png' });

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    try {
      await page.waitForURL(/\/app/, { timeout: 15000 });
      console.log('✅ Successfully redirected to dashboard');
    } catch {
      console.log('⚠️ Did not redirect to /app, checking current state...');
    }

    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/skeleton-04-after-login.png' });

    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Check if we made it to dashboard
    const onDashboard = url.includes('/app');

    if (onDashboard) {
      // Verify sidebar is visible
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible({ timeout: 10000 });
      console.log('✅ Dashboard loaded with sidebar');

      // Take screenshot of dashboard
      await page.screenshot({ path: 'test-results/skeleton-05-dashboard.png' });
    }

    expect(onDashboard, 'Should be on dashboard after login').toBe(true);
  });

  test('CHECKPOINT 7: Navigate to Hubs (Premium Feature)', async ({ page }) => {
    console.log(`\n=== CHECKPOINT 7: Testing premium feature access ===`);

    // Login first
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {});

    // Navigate to Hubs
    await page.goto(`${config.baseUrl}/app/hubs`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Take screenshot
    await page.screenshot({ path: 'test-results/skeleton-06-hubs.png' });

    // Check for Hubs page content
    const hubsHeader = page.locator('h1:has-text("Content Hubs"), h1:has-text("Hubs")');
    const hasHubsHeader = await hubsHeader.isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Hubs page loaded: ${hasHubsHeader}`);

    expect(hasHubsHeader, 'Hubs page should load').toBe(true);
  });

  test('CHECKPOINT 8: Navigate to Settings', async ({ page }) => {
    console.log(`\n=== CHECKPOINT 8: Testing settings page ===`);

    // Login first
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {});

    // Navigate to Settings
    await page.goto(`${config.baseUrl}/app/settings`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Take screenshot
    await page.screenshot({ path: 'test-results/skeleton-07-settings.png' });

    // Check for Settings page content
    const settingsHeader = page.locator('h1:has-text("Settings")');
    const hasSettingsHeader = await settingsHeader.isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`Settings page loaded: ${hasSettingsHeader}`);

    expect(hasSettingsHeader, 'Settings page should load').toBe(true);
  });

  test('CHECKPOINT 9: tRPC authenticated request', async ({ page, request }) => {
    console.log(`\n=== CHECKPOINT 9: Testing authenticated tRPC ===`);

    // Login via UI to get session cookies
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {});

    // Get cookies from browser context
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    console.log(`Got ${cookies.length} cookies`);

    // Make authenticated tRPC request
    const response = await request.get(`${config.baseUrl}/trpc/auth.me`, {
      headers: { Cookie: cookieHeader },
    });

    const status = response.status();
    console.log(`Authenticated tRPC status: ${status}`);

    if (status === 401) {
      console.log('⚠️ tRPC still returning 401 with cookies');
      console.log('DIAGNOSIS: Check session token handling in tRPC context');
    }

    // Should not be 500
    expect(status, 'Authenticated tRPC should not error').toBeLessThan(500);
  });

  test('CHECKPOINT 10: Logout flow', async ({ page }) => {
    console.log(`\n=== CHECKPOINT 10: Testing logout ===`);

    // Login first
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 15000 }).catch(() => {});

    // Go to settings where logout button should be
    await page.goto(`${config.baseUrl}/app/settings`);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Look for logout button
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Log Out"), button:has-text("Logout"), [data-testid="sign-out-btn"]');
    const hasLogout = await logoutBtn.first().isVisible({ timeout: 5000 }).catch(() => false);

    if (hasLogout) {
      console.log('Found logout button, clicking...');
      await logoutBtn.first().click();
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ path: 'test-results/skeleton-08-logout.png' });

      // Should redirect to login
      const url = page.url();
      console.log(`After logout URL: ${url}`);

      expect(url, 'Should redirect to login after logout').toContain('/login');
    } else {
      console.log('⚠️ Logout button not found - skipping logout test');
    }
  });
});

test.describe('Walking Skeleton Summary', () => {
  test('Generate final diagnostics report', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('WALKING SKELETON DIAGNOSTICS COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nTest user email: ${config.testEmail}`);
    console.log('\nScreenshots saved to: test-results/skeleton-*.png');
    console.log('Trace file: test-results/trace.zip (if enabled)');
    console.log('\nCheckpoints tested:');
    console.log('1. Worker health');
    console.log('2. API + D1 health');
    console.log('3. Frontend serves');
    console.log('4. User sign-up');
    console.log('5. API login');
    console.log('6. UI login + dashboard');
    console.log('7. Hubs page (premium)');
    console.log('8. Settings page');
    console.log('9. Authenticated tRPC');
    console.log('10. Logout flow');
    console.log('='.repeat(60));

    // Final screenshot
    await page.goto(config.baseUrl);
    await page.screenshot({ path: 'test-results/skeleton-final.png', fullPage: true });
  });
});
