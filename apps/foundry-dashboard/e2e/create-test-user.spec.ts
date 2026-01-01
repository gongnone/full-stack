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
  await page.waitForSelector('#email', { timeout: 10000 });

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
    return true;
  } catch {
    // Check for error messages
    const errorText = await page.locator('[role="alert"]').textContent().catch(() => null);
    if (errorText?.toLowerCase().includes('exists') || errorText?.toLowerCase().includes('already')) {
      // Verify login works
      await page.goto('/login');
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      await page.click('button[type="submit"]');
      try {
        await page.waitForURL(/\/app/, { timeout: 10000 });
        console.log(`✅ Verified: ${user.email} (already exists)`);
        return true;
      } catch {
        console.log(`❌ Failed to login: ${user.email}`);
        return false;
      }
    }
    console.log(`❌ Failed to create: ${user.email} - ${errorText}`);
    return false;
  }
}

test('create legacy test user', async ({ page }) => {
  const success = await createOrVerifyUser(page, LEGACY_USER);
  expect(success).toBe(true);
  console.log('\n📋 Legacy credentials for GitHub secrets:');
  console.log(`   E2E_TEST_EMAIL: ${LEGACY_USER.email}`);
  console.log(`   E2E_TEST_PASSWORD: ${LEGACY_USER.password}`);
});

test('create shard test users for parallel execution', async ({ page }) => {
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
