/**
 * Diagnostic test to debug wizard client auto-selection
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test('debug wizard client selection', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  // Login
  console.log('1. Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
  console.log('✅ Login successful');

  // Navigate to wizard
  console.log('2. Navigating to wizard...');
  await page.goto(`${BASE_URL}/app/hubs/new`);
  await expect(page.locator('h1:has-text("Create New Hub")')).toBeVisible();
  console.log('✅ Wizard page loaded');

  // Wait and check button state
  console.log('3. Checking Step 2 button state...');
  const step2Button = page.locator('[data-testid="wizard-step-2"]');
  await step2Button.waitFor({ state: 'visible', timeout: 5000 });

  // Check if disabled
  const isDisabled = await step2Button.getAttribute('disabled');
  console.log(`Step 2 button disabled: ${isDisabled}`);

  // Wait 10 seconds and check again
  console.log('4. Waiting 10 seconds for auto-selection...');
  await page.waitForTimeout(10000);

  const stillDisabled = await step2Button.getAttribute('disabled');
  console.log(`Step 2 button still disabled: ${stillDisabled}`);

  // Try to get clientId from the page
  const clientId = await page.evaluate(() => {
    // Access React state if possible
    return (window as any).__CLIENT_ID__ || 'NOT SET';
  });
  console.log(`ClientId in page: ${clientId}`);

  // Check if there are any network errors
  console.log('5. Checking for tRPC errors in network tab...');

  // Take screenshot
  await page.screenshot({ path: '/tmp/wizard-debug.png' });
  console.log('Screenshot saved to /tmp/wizard-debug.png');
});
