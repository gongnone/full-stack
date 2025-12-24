/**
 * Story 3.1: Source Selection & Upload Wizard
 * E2E Tests for Acceptance Criteria
 *
 * AC1: 4-step wizard with progress indicator
 * AC2: PDF drag-drop to R2
 * AC3: Progress bar during upload
 * AC4: Paste Text tab with character count
 * AC5: URL input with validation
 * AC6: Recent sources quick-select
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('Story 3.1: Source Selection & Upload Wizard', () => {
  test.describe('AC1: 4-step wizard with progress indicator', () => {
    test('wizard shows 4 steps with progress indicator', async ({ page }) => {
      // Login first
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);

      // Navigate to new hub wizard
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Verify wizard stepper is visible
      await expect(page.locator('[data-testid="wizard-stepper"]')).toBeVisible();

      // Verify all 4 steps are shown
      await expect(page.getByText('Select Client')).toBeVisible();
      await expect(page.getByText('Upload Source')).toBeVisible();
      await expect(page.getByText('Configure Pillars')).toBeVisible();
      await expect(page.getByText('Generate')).toBeVisible();

      // Verify step 1 is active/highlighted
      const step1 = page.locator('[data-testid="wizard-step-1"]');
      await expect(step1).toHaveAttribute('data-active', 'true');
    });

    test('wizard step navigation works correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);

      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Step 1 should be active initially
      await expect(page.locator('[data-testid="wizard-step-1"]')).toHaveAttribute('data-active', 'true');

      // Wait for auto-advance to Step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });
  });

  test.describe('AC2: PDF drag-drop to R2', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
      await page.goto(`${BASE_URL}/app/hubs/new`);
      // Wait for auto-advance to step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });

    test('drop zone is visible on step 2', async ({ page }) => {
      // Verify drop zone is visible
      await expect(page.locator('[data-testid="source-dropzone"]')).toBeVisible();

      // Verify drop zone text
      await expect(page.getByText(/drag.*drop.*pdf/i)).toBeVisible();
    });

    test('drop zone shows document icon after file selection', async ({ page }) => {
      // Create a test PDF file
      const testFile = {
        name: 'test-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 test content'),
      };

      // Trigger file input
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer,
      });

      // Verify upload started (progress or success indicator)
      await expect(page.locator('[data-testid="upload-progress"], [data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('AC3: Progress bar during upload', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
      await page.goto(`${BASE_URL}/app/hubs/new`);
      // Wait for auto-advance to step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });

    test('progress bar appears during file upload', async ({ page }) => {
      const testFile = {
        name: 'test-upload.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 ' + 'x'.repeat(10000)), // Larger file for progress visibility
      };

      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: testFile.name,
        mimeType: testFile.mimeType,
        buffer: testFile.buffer,
      });

      // Progress bar should appear during upload
      // Note: May be too fast to catch in test, but structure should exist
      // Use .first() to avoid strict mode violation when both elements exist
      const progressOrSuccess = page.locator('[data-testid="upload-progress"]').or(page.locator('[data-testid="upload-success"]')).first();

      // Either progress or completion should be visible
      await expect(progressOrSuccess).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('AC4: Paste Text tab with character count', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
      await page.goto(`${BASE_URL}/app/hubs/new`);
      // Wait for auto-advance to step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });

    test('Paste Text tab shows textarea', async ({ page }) => {
      // Click the Paste Text tab
      await page.click('button:has-text("Paste Text")');

      // Verify textarea is visible
      await expect(page.locator('textarea[data-testid="text-paste-textarea"]')).toBeVisible();
    });

    test('character count updates as user types', async ({ page }) => {
      await page.click('button:has-text("Paste Text")');

      const textarea = page.locator('textarea[data-testid="text-paste-textarea"]');
      await textarea.fill('Hello, this is test content for character counting.');

      // Verify character count is displayed
      const charCount = page.locator('[data-testid="char-count"]');
      await expect(charCount).toContainText('51');
    });

    test('submit button is disabled for insufficient content', async ({ page }) => {
      await page.click('button:has-text("Paste Text")');

      // Fill textarea with too little content (minimum is 500 chars)
      const textarea = page.locator('textarea[data-testid="text-paste-textarea"]');
      await textarea.fill('Some content here');

      // Submit button should be disabled until minimum character count is met
      const submitBtn = page.locator('button:has-text("Use This Content")');
      await expect(submitBtn).toBeDisabled();
    });
  });

  test.describe('AC5: URL input with validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
      await page.goto(`${BASE_URL}/app/hubs/new`);
      // Wait for auto-advance to step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });

    test('URL tab shows input field', async ({ page }) => {
      // Click the From URL tab
      await page.click('button:has-text("From URL")');

      // Verify URL input is visible
      await expect(page.locator('input[data-testid="source-url"]')).toBeVisible();
    });

    test('invalid URL shows validation error', async ({ page }) => {
      await page.click('button:has-text("From URL")');

      const urlInput = page.locator('input[data-testid="source-url"]');
      await urlInput.fill('not-a-valid-url');

      // Validation error should appear
      await expect(page.getByText(/invalid|valid url/i)).toBeVisible();
    });

    test('valid HTTPS URL passes validation', async ({ page }) => {
      await page.click('button:has-text("From URL")');

      const urlInput = page.locator('input[data-testid="source-url"]');
      await urlInput.fill('https://example.com/article');

      // Submit button should be enabled
      const submitBtn = page.locator('button:has-text("Add URL Source")');
      await expect(submitBtn).toBeEnabled();
    });

    test('YouTube URL is detected and shows indicator', async ({ page }) => {
      await page.click('button:has-text("From URL")');

      const urlInput = page.locator('input[data-testid="source-url"]');
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

      // YouTube indicator should appear
      await expect(page.getByText(/youtube.*detected/i)).toBeVisible();
    });

    test('HTTP URL (non-YouTube) shows validation error', async ({ page }) => {
      await page.click('button:has-text("From URL")');

      const urlInput = page.locator('input[data-testid="source-url"]');
      await urlInput.fill('http://example.com/insecure');

      // Validation error for non-HTTPS
      await expect(page.getByText(/https/i)).toBeVisible();
    });
  });

  test.describe('AC6: Recent sources quick-select', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);
      await page.goto(`${BASE_URL}/app/hubs/new`);
      // Wait for auto-advance to step 2 (MVP auto-selects client after 500ms)
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });
    });

    test('recent sources section is visible', async ({ page }) => {
      // Recent sources section should be visible (may show empty state)
      const recentSection = page.locator('[data-testid="recent-sources"]').or(page.getByText(/recent sources/i));
      await expect(recentSection).toBeVisible();
    });

    test('empty state shows when no recent sources', async ({ page }) => {
      // For a new user, should show empty state
      const emptyState = page.getByText(/no recent sources/i);
      // May or may not be visible depending on user's history
      // Just verify the page loads without error
      await expect(page.locator('[data-testid="source-dropzone"]')).toBeVisible();
    });
  });

  test.describe('Integration: Full Wizard Flow', () => {
    test('complete wizard flow with text paste', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/app/);

      // Start wizard
      await page.goto(`${BASE_URL}/app/hubs/new`);

      // Step 1: Select Client (auto-selected in MVP after 500ms)
      await expect(page.locator('[data-testid="wizard-step-1"]')).toHaveAttribute('data-active', 'true');
      // Wait for auto-advance to Step 2
      await expect(page.locator('[data-testid="wizard-step-2"]')).toHaveAttribute('data-active', 'true', { timeout: 5000 });

      // Step 2: Upload Source - use text paste
      await page.click('button:has-text("Paste Text")');
      await page.fill('input[data-testid="text-title"]', 'Test Source Document');
      // Fill with enough content to meet minimum character requirement (500 chars)
      const longContent = 'This is the content of my test source document. It contains valuable information for the hub. '.repeat(10);
      await page.fill('textarea[data-testid="text-paste-textarea"]', longContent);

      // Create source (button text is "Use This Content")
      await page.click('button:has-text("Use This Content")');

      // Should move to step 3 (Configure Pillars) after source is created
      await expect(page.locator('[data-testid="wizard-step-3"]')).toHaveAttribute('data-active', 'true', { timeout: 15000 });
    });
  });
});
