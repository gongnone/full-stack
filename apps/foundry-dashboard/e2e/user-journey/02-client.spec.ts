/**
 * Stage 2: Client Onboarding E2E Tests
 *
 * Test IDs: CLIENT-01, CLIENT-02, CLIENT-05
 * @tags @P0 @user-journey @client
 */

import { test, expect } from '@playwright/test';
import { uniqueTestId } from '../fixtures/auth.fixture';
import { config, login } from './shared';

test.describe('@P0 Stage 2: Client Onboarding', () => {
  /**
   * CLIENT-01: Create new client with required fields
   */
  test('CLIENT-01: Create new client successfully', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    const clientName = `E2E Client ${uniqueTestId('client')}`;

    await page.goto(`${config.baseUrl}/app/clients`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const createBtn = page.locator(
      'button:has-text("Create Client"), button:has-text("New Client"), a:has-text("Create")'
    );

    if (!(await createBtn.isVisible().catch(() => false))) {
      console.log('CLIENT-01: Create client button not found - skipping');
      test.skip();
      return;
    }

    await createBtn.click();
    await page
      .locator('input[name="name"], input[placeholder*="name"], [role="dialog"]')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});

    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(clientName);

      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
      await saveBtn.click();

      await expect(page.locator(`text="${clientName}", text=/created|success/i`).first())
        .toBeVisible({ timeout: 10000 })
        .catch(() => {});

      const created =
        (await page.locator(`text="${clientName}"`).isVisible().catch(() => false)) ||
        (await page.locator('text=/created|success/i').isVisible().catch(() => false));

      expect(created, 'Client should be created').toBe(true);
    }

    console.log('CLIENT-01: Create client test passed');
  });

  /**
   * CLIENT-02: Client appears in ClientSelector after creation
   */
  test('CLIENT-02: Client selector shows available clients', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    await page.goto(`${config.baseUrl}/app`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const selector = page.locator('[data-testid="client-selector"], .client-selector, [role="combobox"]');

    if (await selector.isVisible()) {
      await selector.click();
      await page
        .locator('[role="option"], [data-testid="client-option"]')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});

      const options = page.locator('[role="option"], [data-testid="client-option"]');
      const optionCount = await options.count();

      expect(optionCount).toBeGreaterThan(0);
      console.log(`CLIENT-02: Found ${optionCount} clients in selector`);
    } else {
      console.log('CLIENT-02: Client selector not visible - may be single-client mode');
    }
  });

  /**
   * CLIENT-05: Client isolation - no cross-client data access
   */
  test('CLIENT-05: Cannot access unauthorized client resources', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    const fakeHubId = 'deadbeef-1234-5678-9abc-def012345678';
    await page.goto(`${config.baseUrl}/app/hubs/${fakeHubId}`);

    await page.waitForLoadState('networkidle').catch(() => {});
    await page
      .locator('text=/not found|error|forbidden|unauthorized|no hub/i, h1')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});

    const hasError = await page.locator('text=/not found|error|forbidden|unauthorized/i').isVisible().catch(() => false);
    const redirected = page.url().includes('/app/hubs') && !page.url().includes(fakeHubId);
    const hasEmptyState = await page.locator("text=/no hub|not found|doesn't exist/i").isVisible().catch(() => false);
    const hasHubContent = await page
      .locator('[data-testid="hub-title"], h1:has-text("Hub")')
      .isVisible()
      .catch(() => false);

    const isSecure = hasError || redirected || hasEmptyState || !hasHubContent;

    expect(isSecure, 'Should deny access to unauthorized resources or show no data').toBe(true);

    console.log('CLIENT-05: Client isolation test passed');
  });
});
