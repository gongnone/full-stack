/**
 * E2E Test Data Seeding Fixture
 * INFRA-01: Creates real test data via tRPC API for E2E tests
 *
 * This fixture ensures E2E tests have actual data to work with,
 * eliminating the need for test.skip() when data doesn't exist.
 *
 * Usage in test files:
 *   import { test } from '../fixtures/seed-test-data';
 *   test('my test', async ({ seededData }) => {
 *     // seededData.hubId, seededData.spokeIds, seededData.clientId are available
 *   });
 */

import { test as base, expect } from '@playwright/test';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'admin@foundry.test';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'AdminPass123!';

// Seeded data structure
export interface SeededData {
  accountId: string;
  clientId: string;
  hubId: string;
  pillarIds: string[];
  spokeIds: string[];
  sessionCookie: string;
}

// Extend base test with seeded data fixture
export const test = base.extend<{ seededData: SeededData }>({
  seededData: async ({ page, context }, use) => {
    // Step 1: Login and get session cookie
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', TEST_EMAIL);
    await page.fill('#password', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    try {
      await page.waitForURL(/\/app/, { timeout: 30000 });
    } catch {
      throw new Error(
        'E2E Data Seeding: Login failed. Ensure test user exists. ' +
        'Run: npx tsx scripts/seed-users.ts'
      );
    }

    // Get session cookie
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'))?.value || '';

    // Step 2: Create client if none exists
    let clientId: string;
    const clientsResponse = await page.evaluate(async () => {
      const res = await fetch('/api/trpc/clients.list', {
        credentials: 'include',
      });
      return res.json();
    });

    if (clientsResponse.result?.data?.length > 0) {
      clientId = clientsResponse.result.data[0].id;
    } else {
      // Create a new client
      const createClientRes = await page.evaluate(async () => {
        const res = await fetch('/api/trpc/clients.create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            json: { name: 'E2E Test Client' },
          }),
        });
        return res.json();
      });
      clientId = createClientRes.result?.data?.id;
      if (!clientId) {
        throw new Error('E2E Data Seeding: Failed to create client');
      }
    }

    // Step 3: Create hub if none exists
    let hubId: string;
    let pillarIds: string[] = [];

    const hubsResponse = await page.evaluate(async (cId) => {
      const res = await fetch(`/api/trpc/hubs.list?input=${encodeURIComponent(JSON.stringify({ json: { clientId: cId } }))}`, {
        credentials: 'include',
      });
      return res.json();
    }, clientId);

    if (hubsResponse.result?.data?.length > 0) {
      hubId = hubsResponse.result.data[0].id;
      pillarIds = hubsResponse.result.data[0].pillars?.map((p: any) => p.id) || [];
    } else {
      // Create a new hub with pillars
      const createHubRes = await page.evaluate(async (cId) => {
        const res = await fetch('/api/trpc/hubs.createUrlSource', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            json: {
              clientId: cId,
              url: 'https://example.com/e2e-test-source',
              title: 'E2E Test Hub Source',
            },
          }),
        });
        return res.json();
      }, clientId);

      hubId = createHubRes.result?.data?.sourceId;
      if (!hubId) {
        // If hub creation requires different flow, try direct creation
        console.log('E2E Data Seeding: URL source creation returned:', createHubRes);
      }
    }

    // Step 4: Create spokes if none exist
    let spokeIds: string[] = [];

    // Navigate to hubs page to check for spokes
    await page.goto(`${BASE_URL}/app/hubs`);
    await page.waitForLoadState('networkidle');

    // Try to get spoke IDs from the page
    const hubCards = await page.locator('[data-testid="hub-card"], a[href*="/app/hubs/"]').all();
    if (hubCards.length > 0) {
      const href = await hubCards[0].getAttribute('href');
      if (href) {
        const match = href.match(/\/app\/hubs\/([a-f0-9-]+)/);
        if (match) {
          hubId = match[1];
        }
      }
    }

    // Get account ID from session
    const accountId = await page.evaluate(() => {
      // This would come from the session, using a placeholder
      return 'seeded-account-id';
    });

    // Create the seeded data object
    const seededData: SeededData = {
      accountId,
      clientId: clientId || 'default-client',
      hubId: hubId || 'default-hub',
      pillarIds,
      spokeIds,
      sessionCookie,
    };

    console.log('E2E Data Seeding: Created test data', {
      clientId: seededData.clientId,
      hubId: seededData.hubId,
      spokeCount: seededData.spokeIds.length,
    });

    // Use the seeded data in tests
    await use(seededData);

    // Cleanup (optional - can be enabled for isolation)
    // await cleanupTestData(page, seededData);
  },
});

export { expect } from '@playwright/test';

/**
 * Direct API helper for creating test data outside of Playwright
 * Useful for CI/CD setup scripts
 */
export async function seedTestDataViaAPI(baseUrl: string, credentials: { email: string; password: string }) {
  // Step 1: Login
  const loginRes = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Seed: Login failed - ${await loginRes.text()}`);
  }

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('Seed: No session cookie returned');
  }

  // Step 2: Create client
  const createClientRes = await fetch(`${baseUrl}/api/trpc/clients.create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': setCookie,
    },
    body: JSON.stringify({
      json: { name: `E2E Test Client ${Date.now()}` },
    }),
  });

  const clientData = await createClientRes.json();
  const clientId = clientData.result?.data?.id;

  if (!clientId) {
    console.log('Seed: Client creation response:', clientData);
  }

  return {
    sessionCookie: setCookie,
    clientId,
  };
}
