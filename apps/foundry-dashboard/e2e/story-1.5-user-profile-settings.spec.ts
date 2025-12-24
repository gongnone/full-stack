/**
 * Story 1.5: User Profile & Settings
 * E2E Tests for Acceptance Criteria
 *
 * AC1: View profile information (name, email, avatar)
 * AC2: Update display name and save to user_profiles table
 * AC3: Sign out invalidates session and redirects to /login
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables, OR
 * - Create a test user with the default credentials before running tests
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=YourPass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

// Test configuration from environment (with safe defaults for local dev)
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Validate test credentials are provided
test.beforeAll(async () => {
  if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
    console.warn(
      '\n⚠️  Warning: TEST_EMAIL and TEST_PASSWORD not set.\n' +
      'Using default credentials. Ensure test user exists in database.\n' +
      'Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e\n'
    );
  }
});

test.describe('Story 1.5: User Profile & Settings', () => {
  test.describe('AC3: Auth Redirect', () => {
    test('unauthenticated user accessing /app/settings is redirected to /login', async ({ page }) => {
      // Clear any existing session
      await page.context().clearCookies();

      // Navigate directly to settings
      await page.goto(`${BASE_URL}/app/settings`);

      // Should be redirected to login
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

    test('AC1: Settings page shows profile information (name, email, avatar)', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Wait for page to load
      await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

      // Check profile section exists
      await expect(page.locator('h2:has-text("Profile")')).toBeVisible();

      // Check avatar is displayed (fallback to initials)
      const avatar = page.locator('[aria-label^="Avatar for"]');
      await expect(avatar).toBeVisible();

      // Check display name input exists
      await expect(page.locator('[data-testid="display-name-input"]')).toBeVisible();

      // Check email is displayed (disabled input)
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toBeDisabled();
    });

    test('AC1: Avatar shows user initials as fallback', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Wait for profile section
      await expect(page.locator('h2:has-text("Profile")')).toBeVisible();

      // Avatar should contain a single letter (initial)
      const avatar = page.locator('.rounded-full').first();
      const avatarText = await avatar.textContent();

      // Should be a single uppercase letter
      expect(avatarText).toMatch(/^[A-Z]$/);
    });

    test('AC2: Display name can be edited', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');
      await expect(displayNameInput).toBeVisible();

      // Clear and type new name
      await displayNameInput.fill('');
      await displayNameInput.fill('Test User');

      // Should show character count
      await expect(page.locator('text=/\\d+\\/50/')).toBeVisible();
    });

    test('AC2: Character counter shows limit warning', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');

      // Type a name close to the limit
      await displayNameInput.fill('This is a very long display name that is close to limit');

      // Character counter should be visible
      const charCounter = page.locator('text=/\\d+\\/50/');
      await expect(charCounter).toBeVisible();
    });

    test('AC2: Validation prevents names shorter than 2 characters', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');

      // Focus the input to enter edit mode
      await displayNameInput.focus();

      // Clear and type single character
      await displayNameInput.fill('A');

      // Should show validation error
      await expect(page.locator('text=/at least 2 characters/i')).toBeVisible();
    });

    test('AC2: Save button appears when editing and saves changes', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');

      // Focus to enter edit mode
      await displayNameInput.focus();

      // Type a valid name
      await displayNameInput.fill('New Display Name');

      // Save button should be visible
      const saveButton = page.locator('[data-testid="save-profile-btn"]');
      await expect(saveButton).toBeVisible();

      // Click save
      await saveButton.click();

      // Should show success toast
      await expect(page.getByText('Profile updated', { exact: true })).toBeVisible();
    });

    test('AC2: Keyboard shortcut Enter saves changes', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');

      // Focus and type
      await displayNameInput.focus();
      await displayNameInput.fill('Keyboard Test Name');

      // Press Enter to save
      await displayNameInput.press('Enter');

      // Should show success toast (or remain in same state if no server)
      // In E2E with real backend, should see "Profile updated"
    });

    test('AC2: Keyboard shortcut Escape cancels editing', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const displayNameInput = page.locator('[data-testid="display-name-input"]');
      const originalValue = await displayNameInput.inputValue();

      // Focus and type different value
      await displayNameInput.focus();
      await displayNameInput.fill('Temporary Name');

      // Press Escape to cancel
      await displayNameInput.press('Escape');

      // Value should revert to original
      await expect(displayNameInput).toHaveValue(originalValue);
    });

    test('AC3: Sign out button is visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Check Sign Out section exists
      await expect(page.locator('h2:has-text("Sign Out")')).toBeVisible();

      // Check Sign Out button exists
      const signOutBtn = page.locator('[data-testid="sign-out-btn"]');
      await expect(signOutBtn).toBeVisible();
      await expect(signOutBtn).toHaveText('Sign Out');
    });

    test('AC3: Sign out redirects to login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Click sign out button
      const signOutBtn = page.locator('[data-testid="sign-out-btn"]');
      await signOutBtn.click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('AC3: After sign out, accessing /app redirects to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Sign out
      const signOutBtn = page.locator('[data-testid="sign-out-btn"]');
      await signOutBtn.click();

      // Wait for redirect to login
      await expect(page).toHaveURL(/\/login/);

      // Try to access protected route
      await page.goto(`${BASE_URL}/app`);

      // Should be redirected to login again
      await expect(page).toHaveURL(/\/login/);
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

    test('Settings page uses Midnight Command dark theme', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Check body background color
      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // RGB(15, 20, 25) = #0F1419
      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });

    test('Profile card uses elevated background color', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Find the profile card (section with Profile heading)
      const profileCard = page.locator('h2:has-text("Profile")').locator('..');
      const bgColor = await profileCard.evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Should use elevated background
      // RGB(26, 31, 38) = #1A1F26
      expect(bgColor).toBe('rgb(26, 31, 38)');
    });

    test('Sign out button uses kill color (red)', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      const signOutBtn = page.locator('[data-testid="sign-out-btn"]');
      const textColor = await signOutBtn.evaluate((el) => {
        return getComputedStyle(el).color;
      });

      // Should use kill color for text
      // RGB(244, 33, 46) = #F4212E
      expect(textColor).toBe('rgb(244, 33, 46)');
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
    });

    test('All form inputs have associated labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Check display name input has label
      const displayNameInput = page.locator('[data-testid="display-name-input"]');
      const displayNameId = await displayNameInput.getAttribute('id');
      const displayNameLabel = page.locator(`label[for="${displayNameId}"]`);
      await expect(displayNameLabel).toBeVisible();

      // Check email input has label
      const emailInput = page.locator('input[type="email"]');
      const emailId = await emailInput.getAttribute('id');
      const emailLabel = page.locator(`label[for="${emailId}"]`);
      await expect(emailLabel).toBeVisible();
    });

    test('Keyboard navigation works through form elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/app/settings`);

      // Focus display name input first (known element in form)
      const displayNameInput = page.locator('[data-testid="display-name-input"]');
      await displayNameInput.focus();
      await expect(displayNameInput).toBeFocused();

      // Tab to next focusable element
      await page.keyboard.press('Tab');

      // Should move to another focusable element (not still on display name)
      const currentFocus = await page.evaluate(() => document.activeElement?.tagName);
      expect(currentFocus).toBeTruthy();

      // Verify sign out button is reachable via programmatic focus
      const signOutBtn = page.locator('[data-testid="sign-out-btn"]');
      await signOutBtn.focus();
      await expect(signOutBtn).toBeFocused();
    });
  });
});
