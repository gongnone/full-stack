/**
 * One-time script to create a test user on stage
 * Run with: BASE_URL=https://stage.williamjshaw.ca npx playwright test e2e/create-test-user.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'E2E Test User';

test('create test user via signup form', async ({ page }) => {
  // Navigate to signup page
  await page.goto('/signup');

  // Wait for the form to load
  await page.waitForSelector('#email', { timeout: 10000 });

  // Fill signup form using correct IDs
  await page.fill('#name', TEST_NAME);
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);
  await page.fill('#confirmPassword', TEST_PASSWORD);

  // Take screenshot before submit
  await page.screenshot({ path: 'test-results/signup-before.png' });

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for either success (redirect to app) or error message
  try {
    await page.waitForURL(/\/app/, { timeout: 15000 });
    console.log('✅ User created successfully! Redirected to app.');

    // Log the credentials for reference
    console.log(`\nTest Credentials:`);
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);

  } catch {
    // Check for error messages
    const errorText = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorText) {
      console.log(`⚠️ Signup response: ${errorText}`);

      // If user already exists, try to login instead
      if (errorText.toLowerCase().includes('exists') || errorText.toLowerCase().includes('already')) {
        console.log('User already exists, attempting login...');
        await page.goto('/login');
        await page.fill('#email', TEST_EMAIL);
        await page.fill('#password', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/app/, { timeout: 10000 });
        console.log('✅ Logged in with existing user!');
      }
    }

    await page.screenshot({ path: 'test-results/signup-result.png' });
  }

  // Verify we're logged in
  const currentUrl = page.url();
  expect(currentUrl).toContain('/app');
});
