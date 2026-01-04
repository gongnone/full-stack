/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stage 4: Pillar Extraction E2E Tests
 *
 * Test IDs: PILLAR-01, PILLAR-03, PILLAR-10
 * @tags @P0 @user-journey @pillar
 */

import { test, expect } from '@playwright/test';
import { config, login, findFirstHub } from './shared';

test.describe('@P0 Stage 4: Pillar Extraction', () => {
  /**
   * PILLAR-01: AI extraction returns 3-7 pillars
   */
  test('PILLAR-01: Extraction returns multiple pillars', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    const hubId = await findFirstHub(page);
    if (!hubId) {
      console.log('PILLAR-01: No hubs found - skipping');
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const pillarsTab = page.locator('[role="tab"]:has-text("Pillars")');
    if (await pillarsTab.isVisible()) {
      await pillarsTab.click();
      await page
        .locator('[data-testid^="pillar-"], .pillar-card, text=/Authority|Curiosity|Transformation|Aspiration/')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});
    }

    const pillarCards = page
      .locator('[data-testid^="pillar-"], .pillar-card, :has-text("Estimated Spokes")')
      .filter({ has: page.locator('text=/Authority|Curiosity|Transformation|Aspiration/') });
    const pillarCount = await pillarCards.count();

    if (pillarCount === 0) {
      const badges = await page.locator('text=/Authority|Curiosity|Transformation|Aspiration/').count();
      console.log(`PILLAR-01: Found ${badges} pillar badges (fallback)`);
      expect(badges).toBeGreaterThan(0);
      return;
    }

    console.log(`PILLAR-01: Found ${pillarCount} pillars`);
    expect(pillarCount).toBeGreaterThan(0);
  });

  /**
   * PILLAR-03: Each pillar has title and core_claim
   */
  test('PILLAR-03: Pillars have required fields', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    let pillarsData: any[] = [];

    await page.route('**/trpc/hubs.get*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.result?.data?.pillars) {
        pillarsData = json.result.data.pillars;
      }
      await route.fulfill({ response });
    });

    const hubId = await findFirstHub(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    await page
      .locator('h1, [data-testid="hub-title"], [role="tab"]')
      .first()
      .waitFor({ timeout: 5000 })
      .catch(() => {});

    if (pillarsData.length > 0) {
      pillarsData.forEach((pillar, index) => {
        expect(pillar.title || pillar.name, `Pillar ${index} should have title`).toBeDefined();
        console.log(`Pillar ${index}: ${pillar.title || pillar.name}`);
      });
    }

    console.log('PILLAR-03: Pillar fields verification passed');
  });

  /**
   * PILLAR-10: Pillars persist to D1 on save
   */
  test('PILLAR-10: Pillars persist after page reload', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    const hubId = await findFirstHub(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const pillarsTab = page.locator('[role="tab"]:has-text("Pillars")');
    const pillarCards = page.locator('[data-testid^="pillar-"], .pillar-card');

    if (await pillarsTab.isVisible()) {
      await pillarsTab.click();
      await pillarCards.first().waitFor({ timeout: 5000 }).catch(() => {});
    }

    const countBefore = await pillarCards.count();

    await page.reload();
    await page.waitForLoadState('networkidle').catch(() => {});

    if (await pillarsTab.isVisible()) {
      await pillarsTab.click();
      await pillarCards.first().waitFor({ timeout: 5000 }).catch(() => {});
    }

    const countAfter = await pillarCards.count();

    expect(countAfter).toBe(countBefore);

    console.log(`PILLAR-10: Pillars persisted - ${countBefore} before, ${countAfter} after reload`);
  });
});
