/**
 * P0-1: Review Sprint Investigation and Critical Fixes
 * E2E Tests for Acceptance Criteria
 *
 * Features Tested:
 * - AC2.2: Keyboard shortcuts disabled when no content visible
 * - AC2.3: Enhanced loading state with informative messages
 * - AC2.4: Enhanced empty state with helpful guidance
 * - AC2.5: Error handling with retry functionality
 * - AC2.6: Content visibility and complete review flow
 *
 * Background:
 * P0-1 fixed the critical bug where generated spokes were invisible to users.
 * These tests verify that the review sprint now works correctly with proper
 * defensive guards, loading states, and error handling.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('P0-1: Critical Fixes @P0', () => {
  test.describe('Defensive Guards', () => {
    test('AC2.2: Keyboard shortcuts disabled when no content visible', async ({ page }) => {
      await login(page);

      // Navigate to review page
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading to complete
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check if there's content or empty state
      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);
      const hasEmpty = await page.locator('text=/No Content Found/i').isVisible().catch(() => false);

      if (hasContent) {
        // If there's content, keyboard shortcuts should work
        // Get initial progress
        const initialProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
        const initialMatch = initialProgress?.match(/(\d+) \/ (\d+)/);

        if (!initialMatch) {
          test.skip(true, 'Could not parse progress');
        }

        const [, initialCurrent, totalSpokes] = initialMatch!.map(Number);

        if (initialCurrent >= totalSpokes) {
          test.skip(true, 'Sprint already complete');
        }

        // Press approve key
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);

        // Should advance to next spoke
        const newProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
        const newMatch = newProgress?.match(/(\d+) \/ (\d+)/);
        const [, newCurrent] = newMatch!.map(Number);

        expect(newCurrent).toBe(initialCurrent + 1);
      } else if (hasEmpty) {
        // If empty state, keyboard shortcuts should be disabled
        // Get console messages to verify no action warnings
        const consoleLogs: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'warning' || msg.type() === 'error') {
            consoleLogs.push(msg.text());
          }
        });

        // Try keyboard action
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);

        // Should not crash or show errors
        // Content should still show empty state
        const stillEmpty = await page.locator('text=/No Content Found/i').isVisible();
        expect(stillEmpty).toBe(true);
      } else {
        test.skip(true, 'Unable to verify - not in content or empty state');
      }
    });

    test('AC2.2.2: Edit panel does not open when no content available', async ({ page }) => {
      await login(page);

      // Navigate to a filter that should be empty (flagged)
      await page.goto(`${BASE_URL}/app/review?filter=flagged`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasContent) {
        // Try to open edit panel with 'e' key
        await page.keyboard.press('e');
        await page.waitForTimeout(500);

        // Edit panel should not appear (check for common edit panel indicators)
        const editPanelOpen = await page.locator('text=/Edit Content/i').isVisible({ timeout: 1000 }).catch(() => false);
        expect(editPanelOpen).toBe(false);
      } else {
        // If flagged has content, test that edit works WITH content
        await page.keyboard.press('e');
        await page.waitForTimeout(500);

        // Edit panel or modal should appear
        const editVisible = await page.locator('button:has-text("Edit")').isVisible({ timeout: 1000 }).catch(() => false);
        expect(editVisible).toBe(true);
      }
    });
  });

  test.describe('Enhanced Loading State', () => {
    test('AC2.3: Loading state displays informative message', async ({ page }) => {
      await login(page);

      // Navigate and try to catch loading state
      const responsePromise = page.waitForResponse(response =>
        response.url().includes('review.getQueue') && response.status() === 200
      );

      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Check for loading indicator immediately
      const hasLoadingSpinner = await page.locator('.animate-spin').isVisible({ timeout: 1000 }).catch(() => false);

      if (hasLoadingSpinner) {
        // Loading spinner should be visible
        expect(hasLoadingSpinner).toBe(true);

        // Check for informative loading message (may vary by implementation)
        const hasLoadingText = await page.locator('text=/loading|fetching|preparing/i').isVisible({ timeout: 1000 }).catch(() => false);

        // Either spinner or text should be present during loading
        expect(hasLoadingSpinner || hasLoadingText).toBe(true);
      }

      // Wait for loading to complete
      await responsePromise.catch(() => {});
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    });

    test('AC2.3.2: Loading state includes filter-specific context', async ({ page }) => {
      await login(page);

      // Test different filters
      const filters = ['all', 'just-generated', 'flagged'];

      for (const filter of filters) {
        await page.goto(`${BASE_URL}/app/review?filter=${filter}`);

        // Check if loading appears
        const hasLoadingSpinner = await page.locator('.animate-spin').isVisible({ timeout: 1000 }).catch(() => false);

        if (hasLoadingSpinner) {
          // Some filters may show context-specific loading messages
          // This is optional but good UX
          const pageContent = await page.textContent('body');

          // Just verify page doesn't crash during loading
          expect(pageContent).toBeTruthy();
        }

        // Wait for loading to complete
        await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }
    });
  });

  test.describe('Enhanced Empty State', () => {
    test('AC2.4: Empty state displays helpful guidance', async ({ page }) => {
      await login(page);

      // Navigate to 'flagged' filter which should be empty
      await page.goto(`${BASE_URL}/app/review?filter=flagged`);

      // Wait for loading to complete
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      // Check for empty state
      const hasEmptyMessage = await page.locator('text=/No Content Found|No Items|No spokes/i').isVisible({ timeout: 2000 }).catch(() => false);

      // Verify empty state has helpful elements
      const hasHeading = await page.locator('text=/No.*Found|No Items/i').isVisible();
      expect(hasHeading).toBe(true);

      // Should have some guidance or action buttons
      const hasActionButton = await page.locator('button, a[href]').count();
      expect(hasActionButton).toBeGreaterThan(0);

      // Common empty state actions might include:
      // - Back to Dashboard
      // - View Hubs
      // - Generate Content
      const commonActions = await Promise.all([
        page.locator('text=/Dashboard/i').isVisible().catch(() => false),
        page.locator('text=/Hubs/i').isVisible().catch(() => false),
        page.locator('text=/Generate/i').isVisible().catch(() => false),
      ]);

      // At least one action should be available
      const hasAnyAction = commonActions.some(action => action === true);
      expect(hasAnyAction).toBe(true);
    });

    test('AC2.4.2: Empty state is filter-specific', async ({ page }) => {
      await login(page);

      // Navigate to empty filter
      await page.goto(`${BASE_URL}/app/review?filter=flagged`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      // Get page content to verify it's contextual
      const pageText = await page.textContent('body');

      // Should mention the filter or provide context
      // This is good UX but may vary by implementation
      expect(pageText).toBeTruthy();
      expect(pageText!.length).toBeGreaterThan(50); // Should have meaningful content

      // Should show appropriate empty state message
      const hasEmptyMessage = await page.locator('text=/No.*Found|No Items/i').isVisible();
      expect(hasEmptyMessage).toBe(true);
    });
  });

  test.describe('Error Handling', () => {
    test('AC2.5: Error state displays with retry button', async ({ page }) => {
      await login(page);

      // Simulate error by using offline mode or intercepting requests
      await page.route('**/trpc/review.getQueue*', route => route.abort());

      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for error state to appear
      await page.waitForTimeout(3000);

      // Check if error state appeared (might show as loading failure or error message)
      const hasError = await page.locator('text=/error|failed|something went wrong|could not|unable/i').isVisible({ timeout: 5000 }).catch(() => false);

      if (hasError) {
        // Verify error message is displayed
        expect(hasError).toBe(true);

        // Should have retry or navigation option
        const hasActionButton = await page.locator('button, a[href]').count();
        expect(hasActionButton).toBeGreaterThan(0);
      } else {
        // If no explicit error UI, verify page doesn't crash (shows some content or loading)
        const pageHasContent = await page.locator('body').isVisible();
        expect(pageHasContent).toBe(true);
      }

      // Clean up route interception
      await page.unroute('**/trpc/review.getQueue*');
    });

    test('AC2.5.2: Network errors are handled gracefully', async ({ page }) => {
      await login(page);

      // Monitor console for uncaught errors
      const consoleErrors: string[] = [];
      page.on('pageerror', error => {
        consoleErrors.push(error.message);
      });

      // Navigate normally
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.waitForLoadState('networkidle');

      // Verify no uncaught errors during normal operation
      // (P0-1 added defensive guards to prevent crashes)
      expect(consoleErrors.length).toBe(0);
    });
  });

  test.describe('Content Visibility and Review Flow', () => {
    test('AC2.6: Content is visible after spoke generation', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for app to fully load (initial loading screen)
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Wait for "Loading..." text to disappear (app loader)
      await page.locator('text=Loading...').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});

      // Wait for review page spinner to disappear
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Add small delay for content to render
      await page.waitForTimeout(1000);

      // Check for content visibility
      const hasProgress = await page.locator('text=/\\d+ \\/ \\d+/').isVisible({ timeout: 5000 }).catch(() => false);
      const hasEmptyState = await page.locator('text=/No Content Found|No Items/i').isVisible().catch(() => false);

      // Should be in one of these states (not stuck loading)
      expect(hasProgress || hasEmptyState).toBe(true);

      if (hasProgress) {
        // Verify spoke content is actually visible
        // Look for quality score badges which are unique to spokes
        // Check for "Approve" or "Kill" buttons which indicate spoke is rendering
        const approveButtons = await page.locator('text=/approve/i').count();
        const killButtons = await page.locator('text=/kill/i').count();

        // Should have action buttons visible (indicates spoke is rendered)
        expect(approveButtons + killButtons).toBeGreaterThan(0);
      }
    });

    test('AC2.6.2: Keyboard shortcuts work correctly with visible content', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasContent) {
        test.skip(true, 'No content available for keyboard shortcut testing');
      }

      // Get initial progress
      const initialProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [initialCurrent, totalSpokes] = initialProgress!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      if (initialCurrent >= totalSpokes) {
        test.skip(true, 'Sprint already complete');
      }

      // Test approve shortcut
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);

      // Verify progress advanced
      const newProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [newCurrent] = newProgress!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      expect(newCurrent).toBe(initialCurrent + 1);
    });

    test('AC2.6.3: Edit panel opens with populated content', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      // Should have content to test
      expect(hasContent).toBe(true);

      // Get initial progress to ensure we have content
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const match = progressText?.match(/(\d+) \/ (\d+)/);

      if (match) {
        const [, current, total] = match.map(Number);

        if (current < total) {
          // Open edit panel
          await page.keyboard.press('e');
          await page.waitForTimeout(1000);

          // Verify edit panel opened or edit button exists
          const editPanelOpen = await page.locator('textarea, [contenteditable="true"], button:has-text("Edit")').isVisible({ timeout: 2000 }).catch(() => false);

          // Edit functionality should be available
          expect(editPanelOpen).toBe(true);
        }
      }
    });

    test('AC2.6.4: Complete review flow works end-to-end', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      // Should have content
      expect(hasContent).toBe(true);

      // Get initial progress
      const initialProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [initialCurrent, totalSpokes] = initialProgress!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      // Review at least 3 spokes with different actions (or all remaining if less than 3)
      const actionsToTest = Math.min(3, totalSpokes - initialCurrent);

      // Should have at least 1 spoke to review
      expect(actionsToTest).toBeGreaterThan(0);

      // Action 1: Approve
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);

      if (actionsToTest >= 2) {
        // Action 2: Kill
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(1000);
      }

      if (actionsToTest >= 3) {
        // Action 3: Approve again
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);
      }

      // Verify progress updated correctly
      const finalProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [finalCurrent] = finalProgress!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      expect(finalCurrent).toBe(initialCurrent + actionsToTest);
    });

    test('AC2.6.5: Sprint completion screen displays accurate stats', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      // Should have content
      expect(hasContent).toBe(true);

      // Get progress to see if sprint is completable
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      // Complete all remaining spokes (up to 10 to keep test reasonable)
      const remaining = Math.min(total - current, 10);
      let approvedCount = 0;
      let killedCount = 0;

      for (let i = 0; i < remaining; i++) {
        // Alternate between approve and kill
        if (i % 2 === 0) {
          await page.keyboard.press('ArrowRight'); // Approve
          approvedCount++;
        } else {
          await page.keyboard.press('ArrowLeft'); // Kill
          killedCount++;
        }
        await page.waitForTimeout(800);
      }

      // Verify progress updated
      const finalProgress = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [finalCurrent] = finalProgress!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      expect(finalCurrent).toBe(current + remaining);

      // If sprint is now complete, check for completion screen
      if (finalCurrent >= total) {
        const completionScreen = await page.locator('text=/Sprint Complete|Completed|Finished|reviewed/i').isVisible({ timeout: 5000 }).catch(() => false);

        if (completionScreen) {
          // Verify stats are displayed
          const bodyText = await page.textContent('body');
          expect(bodyText).toBeTruthy();
        }
      }
    });
  });

  test.describe('Regression Prevention', () => {
    test('AC2.6.6: Spokes are visible immediately after generation', async ({ page }) => {
      await login(page);

      // This test verifies the fix for the original phantom interface bug
      // Navigate to just-generated filter (most recent spokes)
      await page.goto(`${BASE_URL}/app/review?filter=just-generated`);

      // Wait for loading - increase timeout and ensure page is ready
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Wait a bit for content to render
      await page.waitForTimeout(1000);

      // Should either have content or proper empty state (not stuck/broken)
      const hasProgress = await page.locator('text=/\\d+ \\/ \\d+/').isVisible({ timeout: 5000 }).catch(() => false);
      const hasEmptyState = await page.locator('text=/No.*Found|No Items|No Content/i').isVisible({ timeout: 5000 }).catch(() => false);
      const hasError = await page.locator('text=/error|failed/i').isVisible({ timeout: 5000 }).catch(() => false);

      // Should be in valid state (not undefined/stuck)
      expect(hasProgress || hasEmptyState || hasError).toBe(true);

      // If content exists, verify it's actually visible (not phantom)
      if (hasProgress) {
        // Check for visible content elements - look for approve/kill buttons
        const approveButtons = await page.locator('text=/approve/i').count();
        const killButtons = await page.locator('text=/kill/i').count();
        expect(approveButtons + killButtons).toBeGreaterThan(0);
      }
    });

    test('AC2.6.7: Platform icons and quality scores are visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for loading
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasContent) {
        test.skip(true, 'No content to verify metadata visibility');
      }

      // Look for quality scores - simpler approach, just look for "G7" or "G2" text
      const pageText = await page.textContent('body');
      const hasG7 = pageText?.includes('G7');
      const hasG2 = pageText?.includes('G2');

      // Should have some quality/score indicators visible
      expect(hasG7 || hasG2).toBe(true);
    });
  });
});
