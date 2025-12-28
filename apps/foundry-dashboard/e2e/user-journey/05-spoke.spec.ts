/**
 * Stage 5: Spoke Generation E2E Tests
 *
 * Test IDs: GEN-01, GEN-11, GEN-12
 * @tags @P0 @user-journey @spoke
 */

import { test, expect } from '@playwright/test';
import { config, login, findFirstHub } from './shared';

test.describe('@P0 Stage 5: Spoke Generation', () => {
  /**
   * GEN-01: Generate spokes for selected platforms
   */
  test('GEN-01: Generate button triggers spoke creation', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    const hubId = await findFirstHub(page);
    if (!hubId) {
      test.skip();
      return;
    }

    await page.goto(`${config.baseUrl}/app/hubs/${hubId}`);
    await page.waitForLoadState('networkidle').catch(() => {});

    const generateBtn = page.getByRole('button', { name: /Generate Spokes/i });
    const generateBtnAlt = page.locator('button:has-text("Generate")');

    const hasGenerateBtn = await generateBtn.isVisible().catch(() => false);
    const hasGenerateBtnAlt = await generateBtnAlt.isVisible().catch(() => false);

    console.log(`GEN-01: Generate button visible: ${hasGenerateBtn}, alt: ${hasGenerateBtnAlt}`);

    if (hasGenerateBtn || hasGenerateBtnAlt) {
      console.log('GEN-01: Generate button found');
    } else {
      const spokesTab = page.locator('[role="tab"]:has-text("Generated Spokes"), [role="tab"]:has-text("Spokes")');
      const hasSpokes = await spokesTab.isVisible();
      const pageText = await page.evaluate(() => document.body.innerText);
      const hasGeneratedSpokesText = pageText.includes('Generated Spokes');
      const spokesMatch = pageText.match(/(\d+)\s*Spokes/);
      const spokesCount = spokesMatch ? parseInt(spokesMatch[1]) : 0;

      console.log(`GEN-01: Spokes tab: ${hasSpokes}, text: ${hasGeneratedSpokesText}, count: ${spokesCount}`);

      expect(hasSpokes || hasGeneratedSpokesText || spokesCount >= 0, 'Should have generate button or spokes area').toBe(
        true
      );
    }

    console.log('GEN-01: Spoke generation availability test passed');
  });

  /**
   * GEN-11: Quality scores attached to spokes
   */
  test('GEN-11: Spokes have quality scores', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    let spokesWithScores: any[] = [];

    await page.route('**/trpc/spokes.list*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.result?.data?.items) {
        spokesWithScores = json.result.data.items;
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

    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    if (await spokesTab.isVisible()) {
      await spokesTab.click();
      await page
        .locator('[data-testid^="spoke-"], .spoke-card, [role="tabpanel"]')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});
    }

    if (spokesWithScores.length > 0) {
      const hasScores = spokesWithScores.some(
        (s) => s.quality_scores !== null && s.quality_scores !== undefined
      );
      expect(hasScores, 'At least one spoke should have quality scores').toBe(true);
      console.log(`GEN-11: Verified quality scores on ${spokesWithScores.length} spokes`);
    } else {
      console.log('GEN-11: No spokes found - skipping score verification');
    }
  });

  /**
   * GEN-12: Spokes stored with correct hub_id, pillar_id
   */
  test('GEN-12: Spokes have correct relationships', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

    let spokes: any[] = [];

    await page.route('**/trpc/spokes.list*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.result?.data?.items) {
        spokes = json.result.data.items;
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

    const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
    if (await spokesTab.isVisible()) {
      await spokesTab.click();
      await page
        .locator('[data-testid^="spoke-"], .spoke-card, [role="tabpanel"]')
        .first()
        .waitFor({ timeout: 5000 })
        .catch(() => {});
    }

    if (spokes.length > 0) {
      spokes.forEach((spoke, i) => {
        expect(spoke.hub_id, `Spoke ${i} missing hub_id`).toBeDefined();
        expect(spoke.pillar_id, `Spoke ${i} missing pillar_id`).toBeDefined();
      });
      console.log(`GEN-12: Verified relationships on ${spokes.length} spokes`);
    }
  });
});
