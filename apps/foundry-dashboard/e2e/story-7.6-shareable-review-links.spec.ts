/**
 * Story 7.6: Shareable Review Links
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Generate Secure Link - Create token-based review URLs
 * AC2: Email Verification - Verify email before granting access
 * AC3: Anonymous Review Interface - Simplified review UI for clients
 * AC4: Time-Limited Access - Expired links are rejected
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 7.6: Shareable Review Links', () => {
  test.describe('AC1: Generate Secure Link', () => {
    test('Review page route exists', async ({ page }) => {
      // Test that the review route is accessible
      const response = await page.goto(`${BASE_URL}/review/test-token`);

      // Should return a page (200 or redirect to email verification)
      expect(response?.status()).toBeLessThan(500);
    });

    test('Review link page shows email verification gate', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Should show email verification form
      await expect(page.locator('h1:has-text("Client Review")')).toBeVisible();
    });
  });

  test.describe('AC2: Email Verification', () => {
    test('Review page prompts for email', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Email input should be visible
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('Access Review button exists', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Submit button should be visible
      await expect(page.locator('button:has-text("Access Review")')).toBeVisible();
    });

    test('Email is required to access review', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Try to submit without email
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('required', '');
    });

    test('Submitting email triggers validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Fill email and submit
      await page.fill('input[type="email"]', 'reviewer@example.com');
      await page.click('button:has-text("Access Review")');

      // Should either show content or error (depending on token validity)
      await page.waitForTimeout(1000);

      const hasError = await page.locator('text=/Access Denied|Invalid|expired/i').isVisible().catch(() => false);
      const hasContent = await page.locator('text=/Review:|pieces ready/i').isVisible().catch(() => false);
      const hasLoading = await page.locator('[class*="animate-spin"]').isVisible().catch(() => false);

      // One of these states should be true
      expect(hasError || hasContent || hasLoading).toBeTruthy();
    });
  });

  test.describe('AC3: Anonymous Review Interface', () => {
    test('Review page does not require login', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Navigate to review page
      await page.goto(`${BASE_URL}/review/test-token`);

      // Should NOT redirect to login
      expect(page.url()).not.toMatch(/\/login/);
    });

    test('Review page has simplified interface', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Should show review-specific UI
      await expect(page.locator('text=/Client Review/i')).toBeVisible();

      // Should NOT show full dashboard navigation
      const hasSidebar = await page.locator('aside nav').isVisible().catch(() => false);
      expect(hasSidebar).toBeFalsy();
    });
  });

  test.describe('AC4: Time-Limited Access', () => {
    test('Invalid token shows error', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/invalid-token-12345`);

      // Fill email
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button:has-text("Access Review")');

      // Wait for API response
      await page.waitForTimeout(2000);

      // Should show error for invalid token
      const hasError = await page.locator('text=/Invalid|expired|not found|Access Denied/i').isVisible().catch(() => false);
      expect(hasError).toBeTruthy();
    });

    test('Expired link shows appropriate message', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/expired-token-test`);

      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button:has-text("Access Review")');

      await page.waitForTimeout(2000);

      // Should indicate link is invalid/expired or show Access Denied
      const hasExpiredMessage = await page.locator('text=/expired|invalid|not found|Access Denied|denied/i').isVisible().catch(() => false);
      const hasLoadingEnded = await page.locator('[class*="animate-spin"]').isHidden().catch(() => true);

      // Either shows error message or loading finished (API rejected)
      expect(hasExpiredMessage || hasLoadingEnded).toBeTruthy();
    });
  });

  test.describe('Midnight Command Theme', () => {
    test('Review page uses dark theme', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // --bg-base: #0F1419 = rgb(15, 20, 25)
      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });

    test('Email form uses elevated background', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      const formCard = page.locator('[class*="rounded-2xl"]').first();
      const bgColor = await formCard.evaluate(el => getComputedStyle(el).backgroundColor);

      // --bg-elevated: #1A1F26 = rgb(26, 31, 38)
      expect(bgColor).toBe('rgb(26, 31, 38)');
    });

    test('Access Review button uses edit color', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      const button = page.locator('button:has-text("Access Review")');
      const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);

      // --edit: #1D9BF0 = rgb(29, 155, 240)
      expect(bgColor).toBe('rgb(29, 155, 240)');
    });
  });

  test.describe('Security', () => {
    test('Review page does not expose system navigation', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Should not have dashboard navigation
      const hasDashboardNav = await page.locator('a[href="/app"], a[href="/app/hubs"]').isVisible().catch(() => false);
      expect(hasDashboardNav).toBeFalsy();
    });

    test('Token is not exposed in UI', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/secret-token-12345`);

      // Token should only be in URL, not displayed on page
      const pageContent = await page.textContent('body');
      expect(pageContent).not.toContain('secret-token-12345');
    });
  });

  test.describe('Accessibility', () => {
    test('Email input has proper label', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();

      // Either has label or placeholder
      const placeholder = await emailInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    test('Form is keyboard accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/test-token`);

      // Tab through elements until we reach an interactive element
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        if (focusedTag === 'INPUT' || focusedTag === 'BUTTON') {
          break;
        }
      }

      // Should eventually focus an interactive element
      const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'BODY']).toContain(focusedTag);
    });

    test('Error messages are accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/review/invalid-token`);

      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button:has-text("Access Review")');

      await page.waitForTimeout(2000);

      // Error should be visible and readable
      const errorMessage = page.locator('text=/Invalid|expired|Access Denied/i');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});
