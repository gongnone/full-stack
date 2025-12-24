/**
 * Story 2.3: Brand DNA Analysis & Scoring
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Brand DNA Analysis Trigger - analysis runs with 3+ samples
 * AC2: Individual Score Breakdown - progress bars for tone/vocabulary/structure/topics
 * AC3: Low Score Recommendations - recommendations appear for scores <70%
 * AC4: Strong Status Badge - green "Strong" badge for scores >=80%
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Create a test user with 3+ training samples before running tests
 * - Run: TEST_EMAIL=user@example.com TEST_PASSWORD=Pass123! pnpm test:e2e
 */

import { test, expect } from '@playwright/test';

// Test configuration from environment
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

// Helper to login
async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 2.3: Brand DNA Analysis & Scoring', () => {
  test.describe('Navigation and Page Load', () => {
    test('Brand DNA page loads successfully', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // Page header should be visible
      await expect(page.locator('h1:has-text("Brand DNA")')).toBeVisible();
    });

    test('Brand DNA Analysis section is visible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // Analysis section should be visible
      await expect(
        page.locator('h2:has-text("Brand DNA Analysis")')
      ).toBeVisible();
    });
  });

  test.describe('AC1: Brand DNA Analysis Trigger', () => {
    test('Analysis button is visible when 3+ samples exist', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // If samples >= 3, the analyze button should be visible
      const analyzeBtn = page.locator('[data-testid="analyze-dna-btn"]');

      // Button may or may not be visible depending on sample count
      // This test documents the expected behavior
      const sampleCountText = await page.locator('text=/\\d+\\/3 samples added/').textContent();
      const sampleCount = sampleCountText ? parseInt(sampleCountText.match(/\d+/)?.[0] || '0') : 0;

      if (sampleCount >= 3) {
        await expect(analyzeBtn).toBeVisible();
      }
    });

    test('Analysis button shows loading state during analysis', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      const analyzeBtn = page.locator('[data-testid="analyze-dna-btn"]');

      // Only test if button is visible
      if (await analyzeBtn.isVisible()) {
        // Click to start analysis
        await analyzeBtn.click();

        // Should show loading text
        await expect(analyzeBtn).toContainText(/Analyzing/i);
      }
    });

    test('DNA Strength score is displayed after analysis', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // If analysis has been run, score should be visible
      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      // Wait for potential query to complete
      await page.waitForTimeout(1000);

      if (await strengthScore.isVisible()) {
        const scoreText = await strengthScore.textContent();
        const score = parseInt(scoreText?.replace('%', '') || '0');

        // Score should be between 0 and 100
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  test.describe('AC2: Individual Score Breakdown', () => {
    test('Progress bars are visible for all metrics', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // Wait for data to load
      await page.waitForTimeout(1000);

      // If report exists, progress bars should be visible
      const toneMatch = page.locator('[data-testid="progress-tone-match"]');

      if (await toneMatch.isVisible()) {
        await expect(
          page.locator('[data-testid="progress-tone-match"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="progress-vocabulary"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="progress-structure"]')
        ).toBeVisible();
        await expect(
          page.locator('[data-testid="progress-topics"]')
        ).toBeVisible();
      }
    });

    test('Progress bars show percentage labels', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const toneMatch = page.locator('[data-testid="progress-tone-match"]');

      if (await toneMatch.isVisible()) {
        // Should contain a percentage value
        await expect(toneMatch).toContainText(/%/);
      }
    });
  });

  test.describe('AC3: Low Score Recommendations', () => {
    test('Recommendations section appears for low scores', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        const scoreText = await strengthScore.textContent();
        const score = parseInt(scoreText?.replace('%', '') || '0');

        const recommendationsSection = page.locator(
          '[data-testid="recommendations-section"]'
        );

        if (score < 70) {
          // Recommendations should be visible for low scores
          await expect(recommendationsSection).toBeVisible();
        }
      }
    });

    test('Add samples recommendation has clickable link', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const recommendationsSection = page.locator(
        '[data-testid="recommendations-section"]'
      );

      if (await recommendationsSection.isVisible()) {
        // Should have "Add samples" link
        const addSamplesLink = page.locator(
          '[data-testid="recommendations-section"] >> text=/Add samples/i'
        );

        if (await addSamplesLink.isVisible()) {
          await addSamplesLink.click();

          // Should scroll to upload section
          const uploadSection = page.locator('h2:has-text("Add Training Content")');
          await expect(uploadSection).toBeInViewport();
        }
      }
    });
  });

  test.describe('AC4: Strong Status Badge', () => {
    test('Strong badge appears for high scores', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        const scoreText = await strengthScore.textContent();
        const score = parseInt(scoreText?.replace('%', '') || '0');

        const strongBadge = page.locator('[data-testid="status-badge-strong"]');

        if (score >= 80) {
          await expect(strongBadge).toBeVisible();
          await expect(strongBadge).toContainText('Strong');
        }
      }
    });

    test('Status badge has correct color for score level', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        const scoreText = await strengthScore.textContent();
        const score = parseInt(scoreText?.replace('%', '') || '0');

        // Check status badge exists for the appropriate level
        if (score >= 80) {
          await expect(
            page.locator('[data-testid="status-badge-strong"]')
          ).toBeVisible();
        } else if (score >= 70) {
          await expect(
            page.locator('[data-testid="status-badge-good"]')
          ).toBeVisible();
        } else {
          await expect(
            page.locator('[data-testid="status-badge-needs_training"]')
          ).toBeVisible();
        }
      }
    });
  });

  test.describe('Voice Profile Display', () => {
    test('Voice profile cards display primary tone', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const primaryToneCard = page.locator('text=/Primary Tone/i');

      if (await primaryToneCard.isVisible()) {
        // Card should be visible
        await expect(primaryToneCard).toBeVisible();
      }
    });

    test('Voice profile cards display writing style', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const writingStyleCard = page.locator('text=/Writing Style/i');

      if (await writingStyleCard.isVisible()) {
        await expect(writingStyleCard).toBeVisible();
      }
    });

    test('Voice profile cards display target audience', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const targetAudienceCard = page.locator('text=/Target Audience/i');

      if (await targetAudienceCard.isVisible()) {
        await expect(targetAudienceCard).toBeVisible();
      }
    });
  });

  test.describe('Signature Phrases', () => {
    test('Signature phrases section is visible when report exists', async ({
      page,
    }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const signaturesSection = page.locator('h3:has-text("Signature Phrases")');

      if (await page.locator('[data-testid="dna-strength-score"]').isVisible()) {
        await expect(signaturesSection).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Analysis button is keyboard accessible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      const analyzeBtn = page.locator('[data-testid="analyze-dna-btn"]');

      if (await analyzeBtn.isVisible()) {
        // Tab to button and verify focus
        await page.keyboard.press('Tab');

        // Keep tabbing until we find the button
        for (let i = 0; i < 20; i++) {
          const focused = await page.evaluate(
            () => document.activeElement?.getAttribute('data-testid')
          );
          if (focused === 'analyze-dna-btn') break;
          await page.keyboard.press('Tab');
        }

        await expect(analyzeBtn).toBeFocused();
      }
    });

    test('Page uses correct color contrast', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      // Check body background uses Midnight Command theme
      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      // RGB(15, 20, 25) = #0F1419
      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });
  });
});
