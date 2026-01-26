/**
 * One-time script to create E2E test users on staging
 *
 * Creates shard-specific test users for parallel E2E execution:
 * - e2e-shard-1@test.foundry.com through e2e-shard-4@test.foundry.com
 *
 * Run with:
 *   BASE_URL=https://foundry-stage.williamjshaw.ca pnpm exec playwright test e2e/create-test-user.spec.ts --project=chromium
 *
 * After running, add these secrets to GitHub:
 *   E2E_TEST_EMAIL_1, E2E_TEST_PASSWORD_1, etc.
 */

import { test, expect } from '@playwright/test';

// Test users for parallel execution
const TEST_USERS = [
  { email: 'e2e-shard-1@test.foundry.com', password: 'TestShard1Pass!', name: 'E2E Shard 1' },
  { email: 'e2e-shard-2@test.foundry.com', password: 'TestShard2Pass!', name: 'E2E Shard 2' },
  { email: 'e2e-shard-3@test.foundry.com', password: 'TestShard3Pass!', name: 'E2E Shard 3' },
  { email: 'e2e-shard-4@test.foundry.com', password: 'TestShard4Pass!', name: 'E2E Shard 4' },
];

// Legacy single user (backwards compatible)
const LEGACY_USER = { email: 'e2e-test@foundry.local', password: 'TestPassword123!', name: 'E2E Test User' };

async function createOrVerifyUser(
  page: import('@playwright/test').Page,
  user: { email: string; password: string; name: string }
): Promise<boolean> {
  // Navigate to signup page
  await page.goto('/signup');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  console.log(`[createOrVerifyUser] Current URL after goto('/signup'): ${page.url()}`);

  // Check if we got redirected to /app (already logged in)
  if (page.url().includes('/app')) {
    console.log(`✅ Already logged in: ${user.email}`);
    try {
      await initializeTestData(page);
      console.log(`   📊 Test data initialized`);
      return true;
    } catch (error) {
      console.log(`   ⚠️  Failed to initialize test data: ${error}`);
      // Still return true since user is logged in - data might already exist
      return true;
    }
  }

  const emailInput = await page.waitForSelector('#email', { timeout: 10000 }).catch(() => null);
  if (!emailInput) {
    console.log(`[createOrVerifyUser] No email input found, current URL: ${page.url()}`);
    return false;
  }

  // Fill signup form
  await page.fill('#name', user.name);
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  await page.fill('#confirmPassword', user.password);
  await page.click('button[type="submit"]');

  // Wait for result
  try {
    await page.waitForURL(/\/app/, { timeout: 15000 });
    console.log(`✅ Created: ${user.email}`);

    // Initialize test data (client, pillars, client_members association)
    await initializeTestData(page);

    return true;
  } catch {
    // Wait for and check error messages
    const alert = page.locator('[role="alert"]');
    await alert.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    const errorText = await alert.textContent().catch(() => null);
    console.log(`[createOrVerifyUser] Error text from signup: "${errorText}"`);

    if (errorText?.toLowerCase().includes('exists') || errorText?.toLowerCase().includes('already')) {
      console.log(`[createOrVerifyUser] User exists, attempting login...`);
      // Verify login works
      await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});

      console.log(`[createOrVerifyUser] After goto('/login'), URL: ${page.url()}`);

      // Check if we got redirected to /app (already logged in)
      if (page.url().includes('/app')) {
        console.log(`✅ Verified: ${user.email} (already logged in after /login redirect)`);
        try {
          await initializeTestData(page);
          console.log(`   📊 Test data initialized`);
        } catch (error) {
          console.log(`   ⚠️  Failed to initialize test data: ${error}`);
        }
        return true;
      }

      await page.fill('#email', user.email);
      await page.fill('#password', user.password);

      // Click sign in and wait for response
      const signInButton = page.getByRole('button', { name: 'Sign in' });
      await signInButton.click();

      // Wait for navigation to /app
      try {
        await page.waitForURL(/\/app/, { timeout: 30000 });
      } catch (e) {
        // Check if we're at /app anyway (might have redirected after timeout)
        if (page.url().includes('/app')) {
          console.log(`✅ Verified: ${user.email} (at /app after slow navigation)`);
        } else {
          // Check for login errors
          const loginAlert = page.locator('[role="alert"]');
          const loginError = await loginAlert.textContent().catch(() => null);
          console.log(`❌ Failed to login: ${user.email} - ${loginError || 'timeout'}`);
          console.log(`   Current URL: ${page.url()}`);
          return false;
        }
      }

      // Check if we navigated successfully
      if (page.url().includes('/app')) {
        console.log(`✅ Verified: ${user.email} (already exists)`);

        // Initialize test data for existing user too
        await initializeTestData(page);

        return true;
      } else {
        const loginAlert = page.locator('[role="alert"]');
        const loginError = await loginAlert.textContent().catch(() => null);
        console.log(`❌ Failed to login: ${user.email} - ${loginError || 'did not navigate to /app'}`);
        return false;
      }
    }
    console.log(`❌ Failed to create: ${user.email} - ${errorText}`);
    return false;
  }
}

async function initializeTestData(page: import('@playwright/test').Page): Promise<void> {
  try {
    // Step 1: Initialize client, pillars, and brand DNA
    const initResponse = await page.evaluate(async () => {
      const res = await fetch('/trpc/testSetup.initializeTestData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return res.json();
    });

    if (initResponse.result?.data) {
      console.log(`   📊 Test data initialized: ${initResponse.result.data.pillarsCreated} pillars created`);
    } else {
      console.log(`   ⚠️  Test data initialization response: ${JSON.stringify(initResponse).substring(0, 100)}`);
    }

    // Step 2: Generate test spokes for review sprint tests
    const spokesResponse = await page.evaluate(async () => {
      const res = await fetch('/trpc/testSetup.generateTestSpokes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return res.json();
    });

    if (spokesResponse.result?.data) {
      const data = spokesResponse.result.data;
      console.log(`   🎯 Test spokes generated: ${data.spokesCreated} spokes, ${data.hubsCreated} hubs`);
    } else {
      console.log(`   ⚠️  Test spokes generation response: ${JSON.stringify(spokesResponse).substring(0, 100)}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Failed to initialize test data: ${error.message}`);
  }
}

test('create legacy test user', async ({ page }) => {
  const success = await createOrVerifyUser(page, LEGACY_USER);
  expect(success).toBe(true);
  console.log('\n📋 Legacy credentials for GitHub secrets:');
  console.log(`   E2E_TEST_EMAIL: ${LEGACY_USER.email}`);
  console.log(`   E2E_TEST_PASSWORD: ${LEGACY_USER.password}`);
});

test.skip('create shard test users for parallel execution', async ({ page }) => {
  console.log('\n🔧 Creating shard test users for parallel E2E...\n');

  const results: string[] = [];

  for (let i = 0; i < TEST_USERS.length; i++) {
    const user = TEST_USERS[i];
    const success = await createOrVerifyUser(page, user);
    if (success) {
      results.push(`   E2E_TEST_EMAIL_${i + 1}: ${user.email}`);
      results.push(`   E2E_TEST_PASSWORD_${i + 1}: ${user.password}`);
    }
    // Logout before next user
    await page.goto('/');
  }

  console.log('\n📋 Add these secrets to GitHub:');
  results.forEach((r) => console.log(r));

  expect(results.length).toBeGreaterThan(0);
});
