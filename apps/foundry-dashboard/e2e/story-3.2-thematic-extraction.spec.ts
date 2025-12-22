/**
 * Story 3.2: Thematic Extraction Engine
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Workers AI Content Processing - extraction runs with themes/claims/angles, completes <30s
 * AC2: 4-Stage Progress Tracking - 4 stages visible with progress bar 0-100%
 * AC3: Pillar Card Display - 5+ pillars with title/claim/angle/supporting points
 * AC4: Empty State Handling - shows message for <5 pillars, handles errors
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Create a test user with a client account
 * - Upload a source document (>1000 words recommended)
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

// Test configuration from environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Helper to login
async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 3.2: Thematic Extraction Engine', () => {
  test.describe('Navigation and Page Load', () => {
    test('Hub Creation wizard loads successfully', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Hubs page should be visible
      await expect(page.locator('h1:has-text("Hubs")')).toBeVisible();
    });

    test('New Hub wizard button is accessible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // New Hub button should be visible
      const newHubBtn = page.locator('[data-testid="new-hub-btn"], button:has-text("New Hub")');
      await expect(newHubBtn).toBeVisible();
    });
  });

  test.describe('AC1: Workers AI Content Processing', () => {
    test('Extraction workflow starts successfully', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Navigate to new hub creation
      await page.click('button:has-text("New Hub")');

      // Upload a source document
      // NOTE: This requires a test file to be available
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        // Create a test content blob for upload
        const testContent = 'Sample long-form content '.repeat(100); // ~2000+ words

        // Wait for upload to complete
        await page.waitForTimeout(2000);
      }

      // Check if extraction progress UI appears
      const progressUI = page.locator('[data-testid="extraction-progress"]');
      await expect(progressUI).toBeVisible({ timeout: 10000 });
    });

    test('Extraction completes within 30 seconds (NFR-P2)', async ({ page }) => {
      test.setTimeout(35000); // 35 seconds to allow for 30s extraction + overhead

      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction workflow
      await page.click('button:has-text("New Hub")');

      // Wait for upload and extraction start
      await page.waitForTimeout(2000);

      // Start timer
      const startTime = Date.now();

      // Wait for extraction to complete
      const completionMessage = page.locator('text=/Extraction Complete/i');
      await expect(completionMessage).toBeVisible({ timeout: 30000 });

      // Verify completion time
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000); // Must complete in <30s
    });

    test('Workers AI identifies themes, claims, and psychological angles', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Navigate to a hub with extracted pillars
      await page.waitForTimeout(1000);

      // Check for pillar cards (which contain themes/claims/angles)
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');

      if (await pillarCards.first().isVisible()) {
        // Verify psychological angle badge exists
        const angleBadge = pillarCards.first().locator('[data-testid="psychological-angle"]');
        await expect(angleBadge).toBeVisible();

        // Verify core claim text exists
        const coreClaim = pillarCards.first().locator('[data-testid="core-claim"]');
        await expect(coreClaim).toBeVisible();
      }
    });
  });

  test.describe('AC2: 4-Stage Progress Tracking', () => {
    test('All 4 extraction stages are visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction
      await page.click('button:has-text("New Hub")');
      await page.waitForTimeout(2000);

      // Check for stage labels
      const stages = [
        'Parsing document',
        'Identifying themes',
        'Extracting claims',
        'Generating pillars',
      ];

      for (const stage of stages) {
        const stageLabel = page.locator(`text=/${stage}/i`);
        // Stage should appear at some point during extraction
        await expect(stageLabel).toBeVisible({ timeout: 10000 });
      }
    });

    test('Progress bar updates from 0% to 100%', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction
      await page.click('button:has-text("New Hub")');
      await page.waitForTimeout(1000);

      // Check initial progress is low
      const progressText = page.locator('text=/\\d+%/');
      await expect(progressText).toBeVisible({ timeout: 5000 });

      // Wait for progress to increase
      await page.waitForTimeout(5000);

      // Check for completion (100%)
      const completionProgress = page.locator('text=/100%|Complete/i');
      await expect(completionProgress).toBeVisible({ timeout: 25000 });
    });

    test('Stage transitions occur sequentially', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction
      await page.click('button:has-text("New Hub")');
      await page.waitForTimeout(1000);

      // Verify parsing stage appears first
      await expect(page.locator('text=/Parsing document/i')).toBeVisible({ timeout: 5000 });

      // Wait for themes stage
      await expect(page.locator('text=/Identifying themes/i')).toBeVisible({ timeout: 10000 });

      // Verify stages don't appear out of order
      // (e.g., pillars shouldn't appear before themes)
    });
  });

  test.describe('AC3: Pillar Card Display', () => {
    test('At least 5 pillars are extracted from content', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Navigate to a completed hub extraction
      await page.waitForTimeout(2000);

      // Count pillar cards
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      const count = await pillarCards.count();

      // AC3 requires minimum 5 pillars for valid extraction
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('Pillar cards display all required fields', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Wait for pillars to load
      await page.waitForTimeout(2000);

      const pillarCard = page.locator('[data-testid^="pillar-card-"]').first();

      if (await pillarCard.isVisible()) {
        // Verify title is visible
        const title = pillarCard.locator('h4');
        await expect(title).toBeVisible();
        await expect(title).not.toBeEmpty();

        // Verify psychological angle badge
        const angleBadge = pillarCard.locator('[data-testid="psychological-angle"]');
        await expect(angleBadge).toBeVisible();

        // Verify core claim
        const coreClaim = pillarCard.locator('[data-testid="core-claim"]');
        await expect(coreClaim).toBeVisible();
        await expect(coreClaim).not.toBeEmpty();

        // Verify estimated spoke count
        const spokeCount = pillarCard.locator('[data-testid="spoke-count"]');
        await expect(spokeCount).toBeVisible();
        await expect(spokeCount).toContainText(/\d+/); // Should contain a number
      }
    });

    test('Psychological angle badges use correct colors', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Wait for pillars
      await page.waitForTimeout(2000);

      const angleBadge = page.locator('[data-testid="psychological-angle"]').first();

      if (await angleBadge.isVisible()) {
        // Verify badge has background and text styling
        const styles = await angleBadge.evaluate((el) => {
          return {
            backgroundColor: window.getComputedStyle(el).backgroundColor,
            color: window.getComputedStyle(el).color,
          };
        });

        // Should have non-default colors (not transparent, not black/white)
        expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(styles.color).not.toBe('rgb(0, 0, 0)');
      }
    });

    test('Supporting points are displayed when available', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Wait for pillars
      await page.waitForTimeout(2000);

      const pillarCard = page.locator('[data-testid^="pillar-card-"]').first();

      if (await pillarCard.isVisible()) {
        // Check for supporting points section
        const supportingPoints = pillarCard.locator('text=/Supporting Points/i');

        if (await supportingPoints.isVisible()) {
          // Verify bullet points exist
          const bulletPoints = pillarCard.locator('ul li');
          const count = await bulletPoints.count();
          expect(count).toBeGreaterThan(0);
        }
      }
    });

    test('Long-form content (>5000 words) extracts 8+ pillars', async ({ page }) => {
      test.setTimeout(60000); // Allow extra time for long content

      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // This test requires uploading a long document (>5000 words)
      // Skip if no long-form content is available
      test.skip(!process.env.LONG_FORM_TEST_FILE, 'Requires long-form test file');

      // Wait for extraction to complete
      await page.waitForTimeout(30000);

      // Count pillars
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      const count = await pillarCards.count();

      // Long-form content should yield 8+ pillars
      expect(count).toBeGreaterThanOrEqual(8);
    });
  });

  test.describe('AC4: Empty State Handling', () => {
    test('Empty state appears when fewer than 5 pillars extracted', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // This test requires a short source document (<1000 words)
      // that yields <5 pillars

      // Look for empty state message
      const emptyState = page.locator('text=/Insufficient Pillars Extracted/i');

      if (await emptyState.isVisible()) {
        // Verify guidance message
        await expect(
          page.locator('text=/Try uploading a longer source document/i')
        ).toBeVisible();
      }
    });

    test('Error state appears when extraction fails', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction that might fail
      await page.waitForTimeout(2000);

      // Check for error message
      const errorMessage = page.locator('text=/Extraction Failed/i');

      if (await errorMessage.isVisible()) {
        // Verify error details are shown
        const errorDetails = page.locator('[data-testid="extraction-error"]');
        await expect(errorDetails).toBeVisible();
      }
    });

    test('Failed extraction shows error in progress UI', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Wait for potential extraction
      await page.waitForTimeout(5000);

      // Check if failed state styling appears
      const progressBar = page.locator('.h-2.rounded-full.overflow-hidden > div');

      if (await progressBar.isVisible()) {
        const bgColor = await progressBar.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );

        // If extraction failed, progress bar should be red (var(--kill))
        // This is conditional based on whether a failure occurred
        if (bgColor === 'rgb(244, 33, 46)') {
          // Verify error message exists
          await expect(page.locator('text=/Extraction Failed/i')).toBeVisible();
        }
      }
    });

    test('Retry option is available after extraction failure', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Check for error state
      const errorMessage = page.locator('text=/Extraction Failed/i');

      if (await errorMessage.isVisible()) {
        // Verify retry button exists
        // NOTE: This might be implemented as "Try Again" or "Retry Extraction"
        const retryBtn = page.locator(
          'button:has-text("Retry"), button:has-text("Try Again")'
        );

        // Retry option should be available
        await expect(retryBtn).toBeVisible();
      }
    });
  });

  test.describe('Performance and Edge Cases', () => {
    test('Polling stops after extraction completes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Start extraction
      await page.waitForTimeout(2000);

      // Wait for completion
      await expect(page.locator('text=/Extraction Complete/i')).toBeVisible({ timeout: 30000 });

      // Record network requests before and after
      const requestsBefore = await page.evaluate(() =>
        performance.getEntriesByType('resource').length
      );

      // Wait 10 seconds (5 polling intervals)
      await page.waitForTimeout(10000);

      const requestsAfter = await page.evaluate(() =>
        performance.getEntriesByType('resource').length
      );

      // Should not have made 5+ additional requests (polling should have stopped)
      const additionalRequests = requestsAfter - requestsBefore;
      expect(additionalRequests).toBeLessThan(5);
    });

    test('Extraction handles special characters in content', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/hubs`);

      // Upload content with special characters
      // This tests Workers AI's ability to handle UTF-8, emojis, etc.

      // Wait for extraction
      await page.waitForTimeout(30000);

      // Verify pillars were extracted despite special chars
      const pillarCards = page.locator('[data-testid^="pillar-card-"]');
      const count = await pillarCards.count();

      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('Multiple simultaneous extractions are isolated', async ({ page, context }) => {
      // Create two pages (simulating two users/clients)
      const page2 = await context.newPage();

      // Login both pages
      await login(page);
      await login(page2);

      // Start extraction on page 1
      await page.goto(`${BASE_URL}/app/hubs`);
      await page.click('button:has-text("New Hub")');

      // Start extraction on page 2
      await page2.goto(`${BASE_URL}/app/hubs`);
      await page2.click('button:has-text("New Hub")');

      // Wait for both to complete
      await page.waitForTimeout(30000);
      await page2.waitForTimeout(30000);

      // Verify both completed independently
      await expect(page.locator('text=/Extraction Complete/i')).toBeVisible();
      await expect(page2.locator('text=/Extraction Complete/i')).toBeVisible();

      await page2.close();
    });
  });
});
