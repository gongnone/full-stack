/**
 * E2E Test Utilities
 * Provides authentication, data fetching, and common test helpers
 */

import { Page, expect } from '@playwright/test';

// Environment configuration
export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  email: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  password: process.env.TEST_PASSWORD || 'TestPassword123!',
};

/**
 * Login to the application
 * Handles both successful login and already-authenticated state
 */
export async function login(page: Page): Promise<boolean> {
  // Check if already logged in
  const currentUrl = page.url();
  if (currentUrl.includes('/app')) {
    return true;
  }

  // Navigate to login
  await page.goto('/login');

  // Wait for login form or redirect to app
  const loginForm = page.locator('#email');
  const isLoginPage = await loginForm.isVisible({ timeout: 5000 }).catch(() => false);

  if (!isLoginPage) {
    // May already be logged in and redirected
    if (page.url().includes('/app')) {
      return true;
    }
    return false;
  }

  // Fill login form using ID selectors (shadcn Input components)
  await page.fill('#email', config.email);
  await page.fill('#password', config.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to app or error
  try {
    await page.waitForURL(/\/app/, { timeout: 10000 });
    return true;
  } catch {
    // Check for error message
    const errorVisible = await page.locator('text=Invalid').isVisible().catch(() => false);
    if (errorVisible) {
      console.error('Login failed: Invalid credentials');
    }
    return false;
  }
}

/**
 * Fetch a real hub ID from the API
 * Returns null if no hubs exist
 */
export async function getFirstHubId(page: Page): Promise<string | null> {
  // Navigate to hubs page and wait for data
  await page.goto('/app/hubs');

  // Wait for either hub cards or empty state
  const hubCard = page.locator('[data-testid="hub-card"], .hub-card, a[href*="/app/hubs/"]').first();
  const emptyState = page.locator('text=Create Hub, text=No Hubs, text=Get started');

  // Wait for either
  const foundHub = await hubCard.isVisible({ timeout: 5000 }).catch(() => false);

  if (foundHub) {
    // Extract hub ID from the card's link
    const href = await hubCard.getAttribute('href');
    if (href) {
      const match = href.match(/\/app\/hubs\/([a-f0-9-]+)/);
      if (match) {
        return match[1];
      }
    }
  }

  return null;
}

/**
 * Navigate to hub detail page
 * Returns true if hub exists and page loaded
 */
export async function navigateToHub(page: Page, hubId: string): Promise<boolean> {
  await page.goto(`/app/hubs/${hubId}`);

  // Wait for hub content or error
  const hubTitle = page.locator('h1').first();
  const errorState = page.locator('text=does not exist, text=Error');

  const foundHub = await hubTitle.isVisible({ timeout: 5000 }).catch(() => false);
  const foundError = await errorState.isVisible({ timeout: 1000 }).catch(() => false);

  return foundHub && !foundError;
}

/**
 * Check if spokes exist for a hub
 */
export async function hasSpokes(page: Page): Promise<boolean> {
  // Look for spoke count or spoke tree
  const spokeCount = page.locator('text=/\\d+ spokes?/i');
  const spokeTree = page.locator('.spoke-node, [data-testid="spoke-card"]');

  const hasCount = await spokeCount.isVisible({ timeout: 2000 }).catch(() => false);
  const hasTree = await spokeTree.first().isVisible({ timeout: 1000 }).catch(() => false);

  return hasCount || hasTree;
}

/**
 * Navigate to review page
 */
export async function navigateToReview(page: Page): Promise<boolean> {
  await page.goto('/app/review');

  // Wait for review page content
  const reviewTitle = page.locator('text=Sprint Review, text=Review');
  const loaded = await reviewTitle.isVisible({ timeout: 5000 }).catch(() => false);

  return loaded;
}

/**
 * Navigate to creative conflicts page
 */
export async function navigateToCreativeConflicts(page: Page): Promise<boolean> {
  await page.goto('/app/creative-conflicts');

  // Wait for page content
  const title = page.locator('text=Creative Conflicts');
  const loaded = await title.isVisible({ timeout: 5000 }).catch(() => false);

  return loaded;
}

/**
 * Check if review queue has items
 */
export async function hasReviewItems(page: Page): Promise<boolean> {
  const progressText = page.locator('text=/\\d+ \\/ \\d+/');
  const emptyState = page.locator('text=No Items Found, text=Sprint Complete');

  const hasProgress = await progressText.isVisible({ timeout: 3000 }).catch(() => false);
  const isEmpty = await emptyState.isVisible({ timeout: 1000 }).catch(() => false);

  return hasProgress && !isEmpty;
}

/**
 * Wait for page to be fully loaded (no loading spinners)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  // Wait for loading indicators to disappear
  const spinner = page.locator('.animate-spin, [data-loading="true"]');
  await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

/**
 * Skip test if condition is not met
 */
export function skipIf(condition: boolean, reason: string): void {
  if (condition) {
    console.log(`Skipping test: ${reason}`);
  }
}
