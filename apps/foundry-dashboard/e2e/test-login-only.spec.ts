/**
 * Simple test to verify login works with stable servers
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('login via UI', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for navigation to /app with a generous timeout
  await page.waitForURL(/\/app/, { timeout: 30000 });

  console.log('✅ Successfully logged in and navigated to /app');

  // Verify we're on the app page
  expect(page.url()).toContain('/app');
});
