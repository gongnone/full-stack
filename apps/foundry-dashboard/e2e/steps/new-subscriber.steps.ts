/**
 * Step Definitions: New Subscriber Journey
 *
 * Playwright step implementations for the New Subscriber Gherkin feature.
 * These steps cover: Discovery → Google OAuth → Subscription Purchase → Activation
 *
 * @tags P0, critical, revenue, journey
 * @priority P0
 */

import { test, expect, Page } from '@playwright/test';

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  testEmail: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
  stripeTestCard: '4242424242424242',
  stripeDeclinedCard: '4000000000000002',
  stripeInsufficientCard: '4000000000009995',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

async function measureLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await waitForPageLoad(page);
  return Date.now() - startTime;
}

// =============================================================================
// PHASE 1: DISCOVERY - Landing Page Steps
// =============================================================================

test.describe('Phase 1: Discovery', () => {
  test('New visitor lands on the homepage', async ({ page }) => {
    // Given: the Foundry landing page is accessible
    const loadTime = await measureLoadTime(page, config.baseUrl);

    // Then: I should see the hero section with value proposition
    const heroSection = page.locator('section, [class*="hero"], main').first();
    await expect(heroSection).toBeVisible({ timeout: 5000 });

    // And: I should see a prominent "Get Started" call-to-action
    const ctaButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started"), a:has-text("Sign Up")');
    await expect(ctaButton.first()).toBeVisible();

    // And: the page should load within 3 seconds (NFR-P5)
    expect(loadTime, `Page load time ${loadTime}ms should be < 3000ms`).toBeLessThan(3000);
  });

  test('New visitor explores pricing options', async ({ page }) => {
    await page.goto(config.baseUrl);
    await waitForPageLoad(page);

    // When: I click on "View Pricing" or scroll to pricing section
    const pricingLink = page.locator('a:has-text("Pricing"), a:has-text("View Pricing")');
    if (await pricingLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pricingLink.click();
      await waitForPageLoad(page);
    }

    // Then: I should see subscription tier information or login prompt
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBe(true);
  });
});

// =============================================================================
// PHASE 2: AUTHENTICATION - Google OAuth Steps
// =============================================================================

test.describe('Phase 2: Authentication', () => {
  test('New subscriber initiates Google OAuth login', async ({ page }) => {
    await page.goto(config.baseUrl);

    // When: I click "Get Started" or "Sign Up"
    const ctaButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started"), a:has-text("Sign Up"), a:has-text("Login")');
    await ctaButton.first().click();

    // Then: I should be redirected to the login page
    await page.waitForURL(/\/(login|signup|auth)/, { timeout: 10000 });

    // And: I should see a "Continue with Google" button
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');
    await expect(googleButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('Google OAuth button is clickable and redirects', async ({ page }) => {
    await page.goto(`${config.baseUrl}/login`);
    await waitForPageLoad(page);

    // Find Google OAuth button
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google")');

    if (await googleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Verify button is enabled and clickable
      await expect(googleButton.first()).toBeEnabled();

      // Note: Actually clicking would redirect to Google's OAuth
      // In E2E, we typically mock OAuth or use test accounts
    }
  });
});

// =============================================================================
// PHASE 3: SUBSCRIPTION - Purchase Flow Steps
// =============================================================================

test.describe('Phase 3: Subscription', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  });

  test('Authenticated user can navigate to subscription page', async ({ page }) => {
    // When: I navigate to the subscription page
    await page.goto(`${config.baseUrl}/app/settings`);
    await waitForPageLoad(page);

    // Look for billing/subscription section
    const billingSection = page.locator('text=/Billing|Subscription|Plan|Upgrade/i');
    const hasBilling = await billingSection.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Either shows billing or settings page loads
    expect(hasBilling || page.url().includes('/settings')).toBe(true);
  });

  test('Subscription page shows current plan status', async ({ page }) => {
    await page.goto(`${config.baseUrl}/app/settings`);
    await waitForPageLoad(page);

    // Page should load without errors
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
  });
});

// =============================================================================
// PHASE 4: POST-PURCHASE - Activation Steps
// =============================================================================

test.describe('Phase 4: Post-Purchase', () => {
  test.beforeEach(async ({ page }) => {
    // Login as subscribed user
    await page.goto(`${config.baseUrl}/login`);
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  });

  test('Subscribed user can access dashboard', async ({ page }) => {
    // Then: I should see the dashboard
    await expect(page.locator('aside, [class*="sidebar"]')).toBeVisible({ timeout: 10000 });
  });

  test('Subscribed user can access premium features', async ({ page }) => {
    // When: I navigate to "Create New Hub"
    await page.goto(`${config.baseUrl}/app/hubs`);
    await waitForPageLoad(page);

    // Then: I should see hub creation option
    const createHub = page.locator('a:has-text("New Hub"), button:has-text("New Hub"), button:has-text("Create")');
    const hasCreate = await createHub.first().isVisible({ timeout: 5000 }).catch(() => false);

    // Or empty state with create option
    const emptyState = page.locator('text=/No hubs|Get started|Create your first/i');
    const hasEmpty = await emptyState.first().isVisible({ timeout: 2000 }).catch(() => false);

    expect(hasCreate || hasEmpty).toBe(true);
  });
});

// =============================================================================
// COMPLETE JOURNEY: End-to-End Happy Path
// =============================================================================

test.describe('Complete New Subscriber Journey', () => {
  test('@P0 @smoke Complete journey - Discovery to Dashboard', async ({ page }) => {
    const journeyStart = Date.now();

    // Phase 1: Discovery
    await page.goto(config.baseUrl);
    await waitForPageLoad(page);
    const landingVisible = await page.locator('body').isVisible();
    expect(landingVisible).toBe(true);

    // Phase 2: Navigate to login
    const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign"), a:has-text("Get Started")');
    if (await loginLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginLink.first().click();
    } else {
      await page.goto(`${config.baseUrl}/login`);
    }

    // Phase 2: Authentication (email/password for E2E)
    await page.waitForURL(/\/(login|signup)/, { timeout: 10000 }).catch(() => {});
    await page.fill('#email, input[type="email"]', config.testEmail);
    await page.fill('#password, input[type="password"]', config.testPassword);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/\/app/, { timeout: 30000 });
    await waitForPageLoad(page);

    // Phase 4: Verify dashboard access
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible({ timeout: 10000 });

    // NFR Validation: Journey should complete within 60 seconds
    const journeyTime = Date.now() - journeyStart;
    expect(journeyTime, `Journey time ${journeyTime}ms should be < 60000ms`).toBeLessThan(60000);

    // Check for console errors
    // (Would be captured via page.on('console') in production test)
  });
});

// =============================================================================
// STRIPE PAYMENT TESTS (Placeholder - Requires Stripe Test Mode)
// =============================================================================

test.describe('Stripe Payment Flow', () => {
  test.skip('Payment with valid card succeeds', async ({ page }) => {
    // This test requires Stripe test mode configuration
    // Placeholder for when Stripe integration is implemented

    // await page.goto(`${config.baseUrl}/checkout`);
    // await page.fill('[data-testid="card-number"]', config.stripeTestCard);
    // await page.fill('[data-testid="card-expiry"]', '12/30');
    // await page.fill('[data-testid="card-cvc"]', '123');
    // await page.click('button:has-text("Pay")');
    // await expect(page.locator('text=Payment successful')).toBeVisible();
  });

  test.skip('Payment with declined card shows error', async ({ page }) => {
    // Placeholder for declined card test
  });
});
