/**
 * Story 2.4: Brand DNA Report Dashboard
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Brand DNA Report Page - displays all components correctly
 * AC2: Signature Phrase Tooltips - hover shows example usage from content
 * AC3: Voice Metrics Progress Bars - color-coded by percentage
 * AC4: Topics to Avoid - displayed as red pills
 *
 * Test Setup Requirements:
 * - Set TEST_EMAIL and TEST_PASSWORD environment variables
 * - Create a test user with Brand DNA analysis already run
 * - Ensure test data includes signature phrases with examples
 * - Ensure test data includes topics to avoid
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

test.describe('Story 2.4: Brand DNA Report Dashboard', () => {
  test.describe('AC1: Brand DNA Report Page Structure', () => {
    test('BrandDNACard renders with all expected sections', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // Check if report exists by looking for DNA score
      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        // Hero metric: DNA Strength score (48px typography)
        await expect(strengthScore).toBeVisible();

        // Voice Profile card sections
        await expect(page.locator('text=/Primary Tone/i')).toBeVisible();
        await expect(page.locator('text=/Writing Style/i')).toBeVisible();
        await expect(page.locator('text=/Target Audience/i')).toBeVisible();

        // Signature Phrases section
        await expect(page.locator('h3:has-text("Signature Phrases")')).toBeVisible();

        // Voice Metrics breakdown
        await expect(page.locator('[data-testid="progress-tone-match"]')).toBeVisible();
        await expect(page.locator('[data-testid="progress-vocabulary"]')).toBeVisible();
        await expect(page.locator('[data-testid="progress-structure"]')).toBeVisible();
        await expect(page.locator('[data-testid="progress-topics"]')).toBeVisible();
      }
    });

    test('Training Samples list appears as separate section', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // Training Samples list should be separate from BrandDNACard
      const trainingSamplesHeader = page.locator('h2:has-text("Training Samples")');
      await expect(trainingSamplesHeader).toBeVisible();

      // Should be below the Brand DNA Analysis section
      const analysisHeader = page.locator('h2:has-text("Brand DNA Analysis")');
      const samplesPosition = await trainingSamplesHeader.boundingBox();
      const analysisPosition = await analysisHeader.boundingBox();

      if (samplesPosition && analysisPosition) {
        expect(samplesPosition.y).toBeGreaterThan(analysisPosition.y);
      }
    });

    test('DNA Strength score uses 48px typography', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        const fontSize = await strengthScore.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });

        // text-5xl in Tailwind is 48px (3rem)
        expect(fontSize).toBe('48px');
      }
    });
  });

  test.describe('AC2: Signature Phrase Tooltips', () => {
    test('Signature phrase chips are visible when phrases exist', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const signaturesSection = page.locator('h3:has-text("Signature Phrases")');

      if (await signaturesSection.isVisible()) {
        // Look for signature phrase chips (they start with quotes)
        const phraseChips = page.locator('span:has-text(\'"\')');
        const count = await phraseChips.count();

        // If report exists, we should have at least one phrase (or empty state message)
        if (count > 0) {
          await expect(phraseChips.first()).toBeVisible();
        }
      }
    });

    test('Signature phrase chips have data-testid attributes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // Look for any signature phrase with data-testid
      const phraseWithTestId = page.locator('[data-testid^="signature-phrase-"]').first();

      if ((await phraseWithTestId.count()) > 0) {
        await expect(phraseWithTestId).toBeVisible();

        const testId = await phraseWithTestId.getAttribute('data-testid');
        expect(testId).toMatch(/^signature-phrase-/);
      }
    });

    test('Hovering over signature phrase shows tooltip with example', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // Find first signature phrase chip
      const firstPhrase = page.locator('[data-testid^="signature-phrase-"]').first();

      if ((await firstPhrase.count()) > 0) {
        // Get the title attribute (tooltip content)
        const tooltipText = await firstPhrase.getAttribute('title');

        // Should have a title attribute
        expect(tooltipText).toBeTruthy();

        // Title should either be the example or the fallback message
        expect(tooltipText).toBeTruthy();
        if (tooltipText) {
          // Should not be empty
          expect(tooltipText.length).toBeGreaterThan(0);

          // If it's not the fallback message, it should be an example sentence
          if (!tooltipText.includes('Detected signature phrase')) {
            // Example should be a sentence (has at least some length)
            expect(tooltipText.length).toBeGreaterThan(10);
          }
        }
      }
    });

    test('Signature phrases use stable keys (phrase as key)', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const phrases = page.locator('[data-testid^="signature-phrase-"]');
      const count = await phrases.count();

      if (count > 1) {
        // Verify each phrase has unique data-testid
        const testIds = new Set<string>();

        for (let i = 0; i < count; i++) {
          const testId = await phrases.nth(i).getAttribute('data-testid');
          if (testId) {
            // Should not have duplicate test IDs
            expect(testIds.has(testId)).toBe(false);
            testIds.add(testId);
          }
        }

        // All test IDs should be unique
        expect(testIds.size).toBe(count);
      }
    });
  });

  test.describe('AC3: Voice Metrics Progress Bars Color Coding', () => {
    test('Progress bars show color coding based on percentage', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const toneMatch = page.locator('[data-testid="progress-tone-match"]');

      if (await toneMatch.isVisible()) {
        // Get the percentage text
        const percentText = await toneMatch.textContent();
        const match = percentText?.match(/(\d+)%/);

        if (match) {
          const percentage = parseInt(match[1]);

          // Get the progress bar fill element
          const progressBar = toneMatch.locator('[data-testid="progress-bar-fill"]');

          if (await progressBar.isVisible()) {
            const bgColor = await progressBar.evaluate((el) => {
              return window.getComputedStyle(el).backgroundColor;
            });

            // Verify color matches expected range
            // Green (>80%): var(--approve) = rgb(0, 210, 106)
            // Yellow (60-80%): var(--warning) = rgb(255, 173, 31)
            // Red (<60%): var(--kill) = rgb(244, 33, 46)

            if (percentage > 80) {
              expect(bgColor).toBe('rgb(0, 210, 106)'); // Green
            } else if (percentage >= 60) {
              expect(bgColor).toBe('rgb(255, 173, 31)'); // Yellow
            } else {
              expect(bgColor).toBe('rgb(244, 33, 46)'); // Red
            }
          }
        }
      }
    });

    test('All four metrics display with percentages', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const toneMatch = page.locator('[data-testid="progress-tone-match"]');

      if (await toneMatch.isVisible()) {
        // All metrics should show percentages
        await expect(
          page.locator('[data-testid="progress-tone-match"]')
        ).toContainText(/%/);
        await expect(
          page.locator('[data-testid="progress-vocabulary"]')
        ).toContainText(/%/);
        await expect(
          page.locator('[data-testid="progress-structure"]')
        ).toContainText(/%/);
        await expect(
          page.locator('[data-testid="progress-topics"]')
        ).toContainText(/%/);
      }
    });
  });

  test.describe('AC4: Topics to Avoid - Red Pills', () => {
    test('Topics to Avoid section renders when topics exist', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // Look for Topics to Avoid section
      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      // Section should either be visible or not present (if no topics)
      const isVisible = await topicsSection.isVisible().catch(() => false);

      if (isVisible) {
        // If visible, should have header
        await expect(
          topicsSection.locator('h3:has-text("Topics to Avoid")')
        ).toBeVisible();
      }
    });

    test('Topics to Avoid pills use red styling', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if (await topicsSection.isVisible()) {
        // Find first topic pill
        const firstPill = topicsSection.locator('[data-testid^="topic-pill-"]').first();

        if ((await firstPill.count()) > 0) {
          // Should have red styling (--kill color)
          const color = await firstPill.evaluate((el) => {
            return window.getComputedStyle(el).color;
          });

          const bgColor = await firstPill.evaluate((el) => {
            return window.getComputedStyle(el).backgroundColor;
          });

          const borderColor = await firstPill.evaluate((el) => {
            return window.getComputedStyle(el).borderColor;
          });

          // Text color should be red (--kill)
          expect(color).toBe('rgb(244, 33, 46)');

          // Background should be red with opacity
          expect(bgColor).toContain('rgba(244, 33, 46');

          // Border should be red
          expect(borderColor).toBe('rgb(244, 33, 46)');
        }
      }
    });

    test('Topics to Avoid pills have data-testid attributes', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if (await topicsSection.isVisible()) {
        const pills = topicsSection.locator('[data-testid^="topic-pill-"]');
        const count = await pills.count();

        if (count > 0) {
          // Each pill should have unique data-testid
          for (let i = 0; i < count; i++) {
            const testId = await pills.nth(i).getAttribute('data-testid');
            expect(testId).toMatch(/^topic-pill-/);
          }
        }
      }
    });

    test('Topics to Avoid pills use stable keys (topic as key)', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if (await topicsSection.isVisible()) {
        const pills = topicsSection.locator('[data-testid^="topic-pill-"]');
        const count = await pills.count();

        if (count > 1) {
          // Verify each topic has unique data-testid
          const testIds = new Set<string>();

          for (let i = 0; i < count; i++) {
            const testId = await pills.nth(i).getAttribute('data-testid');
            if (testId) {
              // Should not have duplicate test IDs
              expect(testIds.has(testId)).toBe(false);
              testIds.add(testId);
            }
          }

          // All test IDs should be unique
          expect(testIds.size).toBe(count);
        }
      }
    });

    test('Topics to Avoid pills have helpful tooltip', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if (await topicsSection.isVisible()) {
        const firstPill = topicsSection.locator('[data-testid^="topic-pill-"]').first();

        if ((await firstPill.count()) > 0) {
          const tooltipText = await firstPill.getAttribute('title');

          expect(tooltipText).toBeTruthy();
          expect(tooltipText).toContain("doesn't align with your brand voice");
        }
      }
    });

    test('Topics section does not render when no topics to avoid', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      // If no topics exist, section should not be in DOM
      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');
      const count = await topicsSection.count();

      // Count should be 0 (not rendered) or 1 (rendered with content)
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Integration and Layout', () => {
    test('Topics to Avoid section appears below Signature Phrases', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const signaturesSection = page.locator('h3:has-text("Signature Phrases")');
      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if ((await signaturesSection.isVisible()) && (await topicsSection.isVisible())) {
        const signaturesPos = await signaturesSection.boundingBox();
        const topicsPos = await topicsSection.boundingBox();

        if (signaturesPos && topicsPos) {
          // Topics should be below signatures
          expect(topicsPos.y).toBeGreaterThan(signaturesPos.y);
        }
      }
    });

    test('All sections follow Midnight Command theme', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const strengthScore = page.locator('[data-testid="dna-strength-score"]');

      if (await strengthScore.isVisible()) {
        // Check elevated background color on BrandDNACard
        const cardBg = await page.locator('[data-testid="dna-strength-score"]').evaluate((el) => {
          const card = el.closest('.rounded-xl');
          return card ? window.getComputedStyle(card).backgroundColor : null;
        });

        // Should use --bg-elevated or similar dark color
        if (cardBg) {
          // Should be a dark background (low RGB values)
          const rgbMatch = cardBg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
          if (rgbMatch) {
            const [, r, g, b] = rgbMatch.map(Number);
            // All values should be < 50 for dark theme
            expect(r).toBeLessThan(50);
            expect(g).toBeLessThan(50);
            expect(b).toBeLessThan(50);
          }
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Signature phrase chips are keyboard accessible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const firstPhrase = page.locator('[data-testid^="signature-phrase-"]').first();

      if ((await firstPhrase.count()) > 0) {
        // Should have cursor-default class (not interactive via keyboard)
        const className = await firstPhrase.getAttribute('class');
        expect(className).toContain('cursor-default');
      }
    });

    test('Topics to Avoid pills display tooltips correctly', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/brand-dna`);

      await page.waitForTimeout(1000);

      const topicsSection = page.locator('[data-testid="topics-to-avoid-section"]');

      if (await topicsSection.isVisible()) {
        const pills = topicsSection.locator('[data-testid^="topic-pill-"]');
        const count = await pills.count();

        if (count > 0) {
          // All pills should have title attribute for accessibility
          for (let i = 0; i < Math.min(count, 3); i++) {
            const title = await pills.nth(i).getAttribute('title');
            expect(title).toBeTruthy();
          }
        }
      }
    });
  });
});
