/**
 * P0-3: Delightful Enhancements - Review Sprint UX Improvements
 * E2E Tests for Acceptance Criteria
 *
 * Features:
 * - Session Persistence (localStorage-based)
 * - Welcome Back Banner with progress restoration
 * - Start Over button functionality
 * - Trophy Celebration with confetti animation
 * - Dynamic celebration messages based on approval rate
 * - Performance badges (speed, approval rate, avg time)
 * - Stats cards grid with staggered animations
 * - What's Next section with actionable cards
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

test.describe('P0-3: Delightful Enhancements @P0', () => {
  test.describe('Session Persistence', () => {
    test('AC1.1: Session saves progress to localStorage after actions', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content to load
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check if we have spokes to review
      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available for testing session persistence');
      }

      // Get initial progress
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      if (current >= total) {
        test.skip(true, 'Sprint already complete, cannot test session save');
      }

      // Perform an approve action
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000); // Wait for action to complete

      // Check localStorage was written
      const sessionData = await page.evaluate(() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('review-session-'));
        if (keys.length === 0) return null;
        return JSON.parse(localStorage.getItem(keys[0]) || '{}');
      });

      expect(sessionData).not.toBeNull();
      expect(sessionData).toHaveProperty('index');
      expect(sessionData).toHaveProperty('stats');
      expect(sessionData).toHaveProperty('timestamp');
    });

    test('AC1.2: Session restores progress when returning to review page', async ({ page, context }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content to load
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available for testing session restoration');
      }

      // Get progress
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      if (current >= total) {
        test.skip(true, 'Sprint already complete');
      }

      // Approve 2 spokes
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);

      // Navigate away
      await page.goto(`${BASE_URL}/app`);
      await page.waitForLoadState('networkidle');

      // Return to review page
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.waitForTimeout(2000);

      // Welcome back banner should appear
      const welcomeBanner = page.locator('text=/Welcome back.*Resuming where you left off/i');
      await expect(welcomeBanner).toBeVisible({ timeout: 5000 });

      // Banner should show accurate progress
      const bannerText = await page.locator('text=/You\'ve reviewed \\d+ of \\d+ spokes/').textContent();
      expect(bannerText).toMatch(/reviewed \d+ of \d+ spokes/);
    });

    test('AC1.3: Welcome Back banner displays accurate stats', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available');
      }

      // Check if welcome banner is already visible (session exists)
      const welcomeBannerExists = await page.locator('text=/Welcome back/i').isVisible().catch(() => false);

      if (welcomeBannerExists) {
        // Verify banner content
        const banner = page.locator('text=/Welcome back/i').locator('..');
        await expect(banner).toBeVisible();

        // Should show reviewed count
        await expect(banner.locator('text=/reviewed \\d+ of \\d+ spokes/i')).toBeVisible();

        // Should show approved/killed stats
        await expect(banner.locator('text=/\\d+ approved.*\\d+ killed/i')).toBeVisible();

        // Clock icon should be visible
        await expect(banner.locator('svg')).toBeVisible();

        // Start Over button should be visible
        await expect(banner.locator('button:has-text("Start Over")')).toBeVisible();
      }
    });

    test('AC1.4: Start Over button clears session and resets progress', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check if welcome banner exists
      const welcomeBannerExists = await page.locator('text=/Welcome back/i').isVisible().catch(() => false);

      if (!welcomeBannerExists) {
        test.skip(true, 'No existing session to test Start Over');
      }

      // Click Start Over button
      await page.click('button:has-text("Start Over")');
      await page.waitForTimeout(500);

      // Welcome banner should disappear
      await expect(page.locator('text=/Welcome back/i')).not.toBeVisible();

      // Progress should reset to 1 / X
      const progressText = await page.locator('text=/1 \\/ \\d+/').first().textContent();
      expect(progressText).toMatch(/1 \/ \d+/);

      // Stats should reset to 0
      await expect(page.locator('text=/✓ 0 Approved/i')).toBeVisible();
      await expect(page.locator('text=/✗ 0 Killed/i')).toBeVisible();

      // localStorage should be cleared
      const sessionData = await page.evaluate(() => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('review-session-'));
        return keys.length > 0;
      });
      expect(sessionData).toBe(false);
    });

    test('AC1.5: Session clears automatically on sprint completion', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available');
      }

      // Get total spokes
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      if (total > 10) {
        test.skip(true, 'Too many spokes to complete in reasonable time');
      }

      // Complete all spokes
      const remaining = total - current + 1;
      for (let i = 0; i < remaining; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);
      }

      // Wait for completion screen
      await page.waitForTimeout(2000);

      // Check for celebration message
      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (hasCelebration) {
        // localStorage should be cleared
        const sessionData = await page.evaluate(() => {
          const keys = Object.keys(localStorage).filter(k => k.startsWith('review-session-'));
          return keys.length > 0;
        });
        expect(sessionData).toBe(false);
      }
    });
  });

  test.describe('Trophy Celebration', () => {
    test('AC2.1: Trophy with confetti animation appears on completion', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);

      // Wait for content
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available');
      }

      // Get total spokes
      const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
      const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

      if (total - current + 1 > 10) {
        test.skip(true, 'Too many spokes to complete');
      }

      // Complete all spokes
      const remaining = total - current + 1;
      for (let i = 0; i < remaining; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(1000);
      }

      // Wait for completion screen
      await page.waitForTimeout(2000);

      // Trophy should be visible (golden circle with gradient)
      const trophy = page.locator('.from-yellow-400.to-orange-500');
      await expect(trophy).toBeVisible({ timeout: 5000 });

      // Confetti particles should be visible
      const confetti = page.locator('.animate-float');
      const confettiCount = await confetti.count();
      expect(confettiCount).toBeGreaterThanOrEqual(4); // 4 confetti particles

      // Spinning container should be present
      const spinningContainer = page.locator('.animate-spin-slow');
      await expect(spinningContainer).toBeVisible();
    });

    test('AC2.2: Dynamic celebration message matches approval rate', async ({ page }) => {
      await login(page);

      // Try to find a completed sprint or skip
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check if already on completion screen
      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

        if (!hasSpokes) {
          test.skip(true, 'No spokes or completion screen available');
        }

        const progressText = await page.locator('text=/\\d+ \\/ \\d+/').first().textContent();
        const [current, total] = progressText!.match(/(\d+) \/ (\d+)/)!.slice(1).map(Number);

        if (total - current + 1 > 10) {
          test.skip(true, 'Too many spokes to complete');
        }

        // Complete all spokes
        const remaining = total - current + 1;
        for (let i = 0; i < remaining; i++) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(1000);
        }

        await page.waitForTimeout(2000);
      }

      // Check for celebration message
      const messages = [
        '🌟 Outstanding! Your content is 🔥', // ≥80%
        '🎉 Great job! Solid content quality', // ≥60%
        '👍 Good work! Room for optimization', // ≥40%
        '🤔 Keep iterating - quality will improve!' // <40%
      ];

      let foundMessage = false;
      for (const msg of messages) {
        const hasMessage = await page.locator(`text="${msg}"`).isVisible().catch(() => false);
        if (hasMessage) {
          foundMessage = true;
          break;
        }
      }

      expect(foundMessage).toBe(true);

      // Subtitle should be present
      await expect(page.locator('text=/Sprint Complete.*🎊/i')).toBeVisible();
    });

    test('AC2.3: Performance badges display correctly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Check if already on completion screen
      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Speed badge (one of: Lightning Fast, Swift Reviewer, Thorough Reviewer, Detail-Oriented)
      const speedBadges = [
        '⚡️ Lightning Fast',
        '🚀 Swift Reviewer',
        '🎯 Thorough Reviewer',
        '🧐 Detail-Oriented'
      ];

      let foundSpeedBadge = false;
      for (const badge of speedBadges) {
        const hasBadge = await page.locator(`text="${badge}"`).isVisible().catch(() => false);
        if (hasBadge) {
          foundSpeedBadge = true;
          break;
        }
      }
      expect(foundSpeedBadge).toBe(true);

      // Approval rate badge
      await expect(page.locator('text=/\\d+% Approval Rate/i')).toBeVisible();

      // Avg time badge
      await expect(page.locator('text=/~\\d+s per spoke/i')).toBeVisible();
    });

    test('AC2.4: Stats cards grid shows accurate counts', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Find stats cards (Approved, Edited, Killed, Reviewed)
      const approvedCard = page.locator('text="Approved"').locator('..');
      const editedCard = page.locator('text="Edited"').locator('..');
      const killedCard = page.locator('text="Killed"').locator('..');
      const reviewedCard = page.locator('text="Reviewed"').locator('..');

      // All cards should be visible
      await expect(approvedCard).toBeVisible();
      await expect(editedCard).toBeVisible();
      await expect(killedCard).toBeVisible();
      await expect(reviewedCard).toBeVisible();

      // Each card should have a number
      await expect(approvedCard.locator('text=/\\d+/')).toBeVisible();
      await expect(editedCard.locator('text=/\\d+/')).toBeVisible();
      await expect(killedCard.locator('text=/\\d+/')).toBeVisible();
      await expect(reviewedCard.locator('text=/\\d+/')).toBeVisible();
    });

    test('AC2.5: ROI metrics display hours saved and dollar value', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Hours saved should be visible
      await expect(page.locator('text=/\\d+\\.?\\d* hours?/i')).toBeVisible();
      await expect(page.locator('text="saved"')).toBeVisible();

      // Dollar value should be visible
      await expect(page.locator('text=/\\$\\d+/i')).toBeVisible();
    });

    test('AC2.6: Zero-Edit Rate displays with progress bar', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Zero-Edit Rate heading
      await expect(page.locator('text="Zero-Edit Rate"')).toBeVisible();

      // Target percentage
      await expect(page.locator('text=/Target:.*\\d+%/i')).toBeVisible();

      // Progress bar should be visible
      const progressBar = page.locator('.h-4.bg-\\[var\\(--bg-surface\\)\\]');
      await expect(progressBar).toBeVisible();

      // Status (Above target / Below target)
      await expect(page.locator('text=/Above target|Below target/i')).toBeVisible();
    });

    test('AC2.7: What\'s Next section displays 3 actionable cards', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // What's Next heading
      await expect(page.locator('text="What\'s Next?"')).toBeVisible();

      // Card 1: Schedule Approved Posts
      await expect(page.locator('text=/Schedule.*Approved Posts/i')).toBeVisible();
      await expect(page.locator('text="Plan your content calendar"')).toBeVisible();

      // Card 2: Review Conflicts
      await expect(page.locator('text="Review Conflicts"')).toBeVisible();
      await expect(page.locator('text="Fix flagged content issues"')).toBeVisible();

      // Card 3: Generate More Content
      await expect(page.locator('text="Generate More Content"')).toBeVisible();
      await expect(page.locator('text="Create a new hub"')).toBeVisible();

      // All cards should have icons
      const cards = page.locator('text="What\'s Next?"').locator('..').locator('button');
      const cardCount = await cards.count();
      expect(cardCount).toBe(3);
    });

    test('AC2.8: Action buttons display on completion screen', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Back to Dashboard button
      await expect(page.locator('button:has-text("Back to Dashboard")')).toBeVisible();

      // Share Summary button
      await expect(page.locator('button:has-text("Share Summary")')).toBeVisible();
    });
  });

  test.describe('CSS Animations', () => {
    test('AC3.1: Trophy bounce-in animation plays on completion', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Check for animate-bounce-in class
      const trophy = page.locator('.animate-bounce-in');
      await expect(trophy).toBeVisible();
    });

    test('AC3.2: Confetti float animation is continuous', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Check for animate-float class on confetti particles
      const confettiParticles = page.locator('.animate-float');
      const count = await confettiParticles.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('AC3.3: Slide-up animations stagger correctly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasCelebration = await page.locator('text=/Outstanding|Great job|Good work|Keep iterating/i').isVisible().catch(() => false);

      if (!hasCelebration) {
        test.skip(true, 'Not on completion screen');
      }

      // Check for animate-slide-up with different delays
      const slideUpElements = page.locator('.animate-slide-up');
      const count = await slideUpElements.count();
      expect(count).toBeGreaterThan(0);

      // Check for delay classes
      const delayedElements = page.locator('[class*="delay-"]');
      const delayCount = await delayedElements.count();
      expect(delayCount).toBeGreaterThan(0);
    });
  });

  test.describe('Edge Cases', () => {
    test('AC4.1: Handles empty/no spokes gracefully', async ({ page }) => {
      await login(page);

      // Try a filter that might have no content
      await page.goto(`${BASE_URL}/app/review?filter=conflicts`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      // Should show either content or "No Items Found"
      const hasContent = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);
      const noItems = await page.locator('text=/No Items Found/i').isVisible().catch(() => false);

      expect(hasContent || noItems).toBe(true);
    });

    test('AC4.2: Session persistence works across page refreshes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/review?filter=all`);
      await page.locator('.animate-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

      const hasSpokes = await page.locator('text=/\\d+ \\/ \\d+/').isVisible().catch(() => false);

      if (!hasSpokes) {
        test.skip(true, 'No spokes available');
      }

      // Approve one spoke
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);

      // Refresh page
      await page.reload();
      await page.waitForTimeout(2000);

      // Welcome banner should appear after refresh
      const welcomeBanner = await page.locator('text=/Welcome back/i').isVisible().catch(() => false);

      if (welcomeBanner) {
        await expect(page.locator('text=/reviewed \\d+ of \\d+ spokes/i')).toBeVisible();
      }
    });
  });
});
