import { test, expect } from '@playwright/test';
import { login } from './setup/auth-helpers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Debug auth.me endpoint', () => {
  test('should return clientId for test user', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    await login(page);

    // Navigate to hub wizard
    await page.goto(`${BASE_URL}/app/hubs/new`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Inject script to check what trpc.auth.me returns
    const authData = await page.evaluate(async () => {
      // Access the tRPC client from window (if exposed) or make direct API call
      const response = await fetch('/api/trpc/auth.me', {
        credentials: 'include',
      });
      const data = await response.json();
      return data;
    });

    console.log('Auth data from API:', JSON.stringify(authData, null, 2));

    // Also check what React Query returns
    const reactQueryState = await page.evaluate(() => {
      // @ts-ignore - accessing React Query dev tools data
      return window.__REACT_QUERY_STATE__;
    });

    console.log('React Query state:', JSON.stringify(reactQueryState, null, 2));

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/debug-auth-me.png', fullPage: true });
  });
});
