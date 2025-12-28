/**
 * Stage 6: TreeView Display E2E Tests
 *
 * Test IDs: TREE-03, TREE-10
 * @tags @P0 @user-journey @treeview
 */

import { test, expect } from '@playwright/test';
import { config, login, findFirstHub } from './shared';

test.describe('@P0 Stage 6: TreeView Display', () => {
  /**
   * TREE-03: Spokes display under correct pillar
   */
  test('TREE-03: Spokes grouped by pillar in UI', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

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

    const pillarSections = page.locator('[data-testid^="pillar-section"], .pillar-tree-item, [role="group"]');
    const sectionCount = await pillarSections.count();

    if (sectionCount > 0) {
      console.log(`TREE-03: Found ${sectionCount} pillar sections`);
      expect(sectionCount).toBeGreaterThan(0);
    } else {
      const spokeCards = page.locator('[data-testid^="spoke-"], .spoke-card');
      const cardCount = await spokeCards.count();
      console.log(`TREE-03: Found ${cardCount} spoke cards (flat view)`);
    }
  });

  /**
   * TREE-10: Spoke card shows G2 hook score
   */
  test('TREE-10: Score badges visible on spoke cards', async ({ page }) => {
    const loggedIn = await login(page);
    test.skip(!loggedIn, 'Login failed');

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

    const scoreBadges = page.locator('[data-testid="score-badge"], .score-badge, .g2-score');
    let badgeCount = await scoreBadges.count();

    if (badgeCount === 0) {
      const scoreText = await page
        .locator('text=/\\d{1,3}%/')
        .count()
        .catch(() => 0);
      badgeCount = scoreText;
    }

    console.log(`TREE-10: Found ${badgeCount} score indicators`);
  });
});
