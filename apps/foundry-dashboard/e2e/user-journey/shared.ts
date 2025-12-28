/**
 * Shared helpers and configuration for user journey tests
 */

import { Page } from '@playwright/test';

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  testEmail: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
  timeouts: {
    pillarExtraction: 30000, // NFR-P2: < 30 seconds
    spokeGeneration: 60000, // NFR-P3: < 60 seconds
    dashboardLoad: 3000, // NFR-P5: < 3 seconds
    uiResponse: 200, // NFR-P4: < 200ms
  },
};

export async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${config.baseUrl}/login`);
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.getByPlaceholder('you@example.com');
    const passwordInput = page.locator('input#password');

    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(config.testEmail);
    await passwordInput.fill(config.testPassword);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/app/, { timeout: 30000 });
    return true;
  } catch (error) {
    console.log('Login failed:', error);
    return false;
  }
}

export async function findFirstHub(page: Page): Promise<string | null> {
  await page.goto(`${config.baseUrl}/app/hubs`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page
    .locator('a[href*="/app/hubs/"], [data-testid="empty-state"], h1')
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});

  const hubLinks = page.locator('a[href*="/app/hubs/"]');
  const count = await hubLinks.count();
  console.log(`findFirstHub: Found ${count} hub links`);

  if (count === 0) {
    console.log(`findFirstHub: Current URL = ${page.url()}`);
    return null;
  }

  for (let i = 0; i < count; i++) {
    const href = await hubLinks.nth(i).getAttribute('href');
    console.log(`findFirstHub: Link ${i} = ${href}`);
    const match = href?.match(/\/app\/hubs\/([a-f0-9-]+)$/);
    if (match) {
      console.log(`findFirstHub: Found hub ID = ${match[1]}`);
      return match[1];
    }
  }

  return null;
}
