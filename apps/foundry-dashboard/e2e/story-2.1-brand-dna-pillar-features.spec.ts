/**
 * Story 2.1: Brand DNA Pillar Selection & Editing
 * E2E Tests for Pillar Proposal Features
 *
 * Tests three critical bug fixes:
 * 1. Individual pillar selection with checkboxes
 * 2. Inline pillar editing (title & description)
 * 3. Re-entry at pillar step without crash
 *
 * Test Setup Requirements:
 * - Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables
 * - Run: E2E_TEST_EMAIL=user@example.com E2E_TEST_PASSWORD=Pass123! pnpm test:e2e
 *
 * @tags @P0 @critical @brand-dna @pillars
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration from environment
const BASE_URL = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const TEST_ONBOARDING_TOKEN = process.env.E2E_ONBOARDING_TOKEN || '';

// NOTE: Before running these tests, create an onboarding token manually:
// cd apps/foundry-dashboard
// npx wrangler d1 execute foundry-global-stage --remote --command "INSERT INTO clients (id, name, email, industry, onboarding_token, onboarding_token_expires_at) VALUES ('$(uuidgen)', 'E2E Pillar Test', 'test@e2e.local', 'Testing', 'e2e-pillar-test-TOKEN', datetime('now', '+24 hours'))"
// Then set E2E_ONBOARDING_TOKEN=e2e-pillar-test-TOKEN when running tests

// Helper to wait for WebSocket connection
async function waitForWebSocketConnection(page: Page, timeout = 10000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const isConnected = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="ws-status"]');
      return el?.textContent?.includes('Connected') || false;
    });

    if (isConnected) {
      return true;
    }

    await page.waitForTimeout(500);
  }

  throw new Error('WebSocket connection timeout');
}

// Helper to navigate through conversation to pillar step
async function navigateToPillarStep(page: Page) {
  // Wait for initial connection
  await page.waitForSelector('text=Hi! I\'m your Brand DNA Agent', { timeout: 10000 });

  // Step 1: Provide brand voice sample (text input)
  const textArea = page.locator('textarea[placeholder*="response"]');
  await textArea.fill('Tast is a revolutionary pizza shop management platform that helps struggling pizza shops transform their business through direct customer communication and simple, effective tools.');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  // Step 2-6: Answer audience questions
  const questions = [
    'Pizza shop owners, typically 35-55 years old, small business entrepreneurs.',
    'Cash flow struggles, inconsistent customer orders, difficulty competing with big chains.',
    'Financial freedom, consistent monthly revenue, loyal repeat customers.',
    'Facebook groups for restaurant owners, YouTube for business tips.',
    'Proven results, testimonials from other pizza shop owners.',
  ];

  for (const answer of questions) {
    await textArea.fill(answer);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
  }

  // Step 7: Select platforms
  await page.waitForSelector('text=Based on your audience, I recommend these platforms', { timeout: 10000 });
  await page.click('button:has-text("YouTube")');
  await page.click('button:has-text("Facebook")');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(2000);

  // Step 8: Skip competitors or provide input
  const skipButton = page.locator('button:has-text("Skip")');
  if (await skipButton.isVisible({ timeout: 5000 })) {
    await skipButton.click();
  } else {
    await textArea.fill('Toast, Square for Restaurants');
    await page.keyboard.press('Enter');
  }

  // Wait for pillar generation
  await page.waitForSelector('text=Here are your content pillars', { timeout: 30000 });
}

test.describe('@P0 Brand DNA Pillar Features', () => {
  test.beforeEach(({ page }, testInfo) => {
    if (!TEST_ONBOARDING_TOKEN) {
      test.skip();
      console.log('Skipping test - E2E_ONBOARDING_TOKEN not set');
    }
    console.log(`Running test: ${testInfo.title}`);
  });

  test.describe('AC1: Individual Pillar Selection', () => {
    test('should display checkboxes for each pillar', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Count pillar checkboxes (should be 5)
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();

      expect(count).toBeGreaterThanOrEqual(5);

      // All checkboxes should be checked by default
      for (let i = 0; i < count; i++) {
        const isChecked = await checkboxes.nth(i).isChecked();
        expect(isChecked).toBe(true);
      }
    });

    test('should allow unchecking individual pillars', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Uncheck the second pillar
      const checkboxes = page.locator('input[type="checkbox"]');
      await checkboxes.nth(1).click();

      // Verify it's unchecked
      const isChecked = await checkboxes.nth(1).isChecked();
      expect(isChecked).toBe(false);

      // Button should show "Approve X of Y"
      const approveButton = page.locator('button:has-text("Approve")');
      const buttonText = await approveButton.textContent();
      expect(buttonText).toMatch(/Approve \d+ of \d+/);
    });

    test('should update button text based on selection count', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      const checkboxes = page.locator('input[type="checkbox"]');
      const approveButton = page.locator('button:has-text("Approve")');

      // Initially all selected - button should say "Approve All Pillars"
      let buttonText = await approveButton.textContent();
      expect(buttonText).toContain('Approve All Pillars');

      // Uncheck one pillar
      await checkboxes.nth(0).click();

      // Button should now show count
      buttonText = await approveButton.textContent();
      expect(buttonText).toMatch(/Approve \d+ of \d+/);

      // Re-check the pillar
      await checkboxes.nth(0).click();

      // Button should go back to "Approve All Pillars"
      buttonText = await approveButton.textContent();
      expect(buttonText).toContain('Approve All Pillars');
    });

    test('should send only selected pillars to backend', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Listen for WebSocket messages
      const wsMessages: any[] = [];
      page.on('websocket', ws => {
        ws.on('framereceived', event => {
          try {
            const msg = JSON.parse(event.payload as string);
            wsMessages.push(msg);
          } catch (e) {
            // Ignore non-JSON messages
          }
        });
      });

      // Uncheck 2 pillars
      const checkboxes = page.locator('input[type="checkbox"]');
      await checkboxes.nth(1).click();
      await checkboxes.nth(3).click();

      // Click approve
      await page.click('button:has-text("Approve")');

      // Wait for WebSocket message
      await page.waitForTimeout(2000);

      // Find the approve message
      const approveMsg = wsMessages.find(m => m.type === 'action' && m.payload?.action === 'approve_selected');

      expect(approveMsg).toBeDefined();
      expect(approveMsg.payload?.data?.pillarIds).toHaveLength(3);
    });
  });

  test.describe('AC2: Pillar Inline Editing', () => {
    test('should display edit button for each pillar', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Count edit buttons (should be 5)
      const editButtons = page.locator('button[title="Edit"]');
      const count = await editButtons.count();

      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('should enter edit mode when edit button clicked', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Click first edit button
      await page.click('button[title="Edit"]').first;

      // Should show input fields
      const titleInput = page.locator('input[type="text"]').first();
      const descriptionTextarea = page.locator('textarea').nth(1); // Skip main chat textarea

      await expect(titleInput).toBeVisible();
      await expect(descriptionTextarea).toBeVisible();

      // Should show Save and Cancel buttons
      await expect(page.locator('button[title="Save"]')).toBeVisible();
      await expect(page.locator('button[title="Cancel"]')).toBeVisible();
    });

    test('should allow editing title and description', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Click first edit button
      const editButtons = page.locator('button[title="Edit"]');
      await editButtons.first().click();

      // Get input fields
      const titleInput = page.locator('input[type="text"]').first();
      const descriptionTextarea = page.locator('textarea').nth(1);

      // Edit the title
      await titleInput.fill('Edited Title [E2E TEST]');

      // Edit the description
      await descriptionTextarea.fill('Edited description for E2E testing purposes.');

      // Verify values were set
      expect(await titleInput.inputValue()).toBe('Edited Title [E2E TEST]');
      expect(await descriptionTextarea.inputValue()).toBe('Edited description for E2E testing purposes.');
    });

    test('should save edits and update pillar display', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Click first edit button
      const editButtons = page.locator('button[title="Edit"]');
      await editButtons.first().click();

      // Edit fields
      const titleInput = page.locator('input[type="text"]').first();
      const descriptionTextarea = page.locator('textarea').nth(1);

      await titleInput.fill('E2E Edited Pillar Title');
      await descriptionTextarea.fill('E2E edited pillar description');

      // Click Save
      await page.click('button[title="Save"]');

      // Wait for agent response (should re-send updated pillars)
      await page.waitForTimeout(3000);

      // Verify updated pillar is displayed
      await expect(page.locator('h4:has-text("E2E Edited Pillar Title")')).toBeVisible();
      await expect(page.locator('text=E2E edited pillar description')).toBeVisible();
    });

    test('should cancel edit without saving changes', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Get original title
      const originalTitle = await page.locator('h4').first().textContent();

      // Click edit
      await page.click('button[title="Edit"]').first;

      // Change title
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill('This Should Not Save');

      // Click Cancel
      await page.click('button[title="Cancel"]');

      // Wait a moment
      await page.waitForTimeout(1000);

      // Original title should still be displayed
      const currentTitle = await page.locator('h4').first().textContent();
      expect(currentTitle).toBe(originalTitle);
    });
  });

  test.describe('AC3: Re-entry Crash Fix', () => {
    test('should not crash when re-entering at pillar step', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Verify pillars are displayed
      await expect(page.locator('text=Here are your content pillars')).toBeVisible();

      // Close and reopen the page (simulates browser close/reopen)
      await page.close();

      // Open a new page
      const context = await page.context();
      const newPage = await context.newPage();

      // Navigate to the same onboarding URL
      await newPage.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);

      // Wait for reconnection and history restoration
      await newPage.waitForTimeout(5000);

      // Should not crash - pillar component should render
      await expect(newPage.locator('text=Here are your content pillars')).toBeVisible({ timeout: 10000 });

      // Verify pillars are displayed (not "Loading content pillars...")
      const checkboxes = newPage.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      expect(count).toBeGreaterThanOrEqual(5);

      // Verify no error messages
      const errorMessages = newPage.locator('text=/Cannot read properties of undefined/');
      expect(await errorMessages.count()).toBe(0);

      await newPage.close();
    });

    test('should preserve pillar data after re-entry', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Get the first pillar title before re-entry
      const originalTitle = await page.locator('h4').first().textContent();

      // Reload the page
      await page.reload();

      // Wait for reconnection
      await page.waitForTimeout(5000);

      // Verify the same pillar title is displayed
      await expect(page.locator('h4').first()).toHaveText(originalTitle || '');
    });

    test('should handle platform selector re-entry without crash', async ({ page }) => {
      // This tests the defensive check in PlatformSelectorComponent
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);

      // Navigate to platform selection step (before pillars)
      await page.waitForSelector('text=Hi! I\'m your Brand DNA Agent', { timeout: 10000 });

      const textArea = page.locator('textarea[placeholder*="response"]');
      await textArea.fill('Test brand voice sample');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Answer questions to reach platform step
      for (let i = 0; i < 5; i++) {
        await textArea.fill('Test answer');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
      }

      // Wait for platform selector
      await page.waitForSelector('text=Based on your audience, I recommend these platforms', { timeout: 10000 });

      // Reload the page
      await page.reload();

      // Wait for reconnection
      await page.waitForTimeout(5000);

      // Platform selector should render without crash
      await expect(page.locator('text=Based on your audience, I recommend these platforms')).toBeVisible({ timeout: 10000 });

      // Verify no "Cannot read properties of undefined" error
      const errorMessages = page.locator('text=/Cannot read properties of undefined/');
      expect(await errorMessages.count()).toBe(0);
    });
  });

  test.describe('Integration: Complete Pillar Workflow', () => {
    test('should complete full workflow: select, edit, approve', async ({ page }) => {
      await page.goto(`${BASE_URL}/onboard/${TEST_ONBOARDING_TOKEN}`);
      await navigateToPillarStep(page);

      // Step 1: Uncheck one pillar
      const checkboxes = page.locator('input[type="checkbox"]');
      await checkboxes.nth(2).click();

      // Verify button shows "Approve 4 of 5"
      let buttonText = await page.locator('button:has-text("Approve")').textContent();
      expect(buttonText).toContain('Approve 4 of 5');

      // Step 2: Edit a pillar
      await page.click('button[title="Edit"]').first;
      const titleInput = page.locator('input[type="text"]').first();
      await titleInput.fill('Integration Test Pillar');
      await page.click('button[title="Save"]');

      // Wait for update
      await page.waitForTimeout(3000);

      // Step 3: Verify edited pillar is visible
      await expect(page.locator('h4:has-text("Integration Test Pillar")')).toBeVisible();

      // Step 4: Re-check the unchecked pillar
      await checkboxes.nth(2).click();

      // Button should now say "Approve All Pillars"
      buttonText = await page.locator('button:has-text("Approve")').textContent();
      expect(buttonText).toContain('Approve All Pillars');

      // Step 5: Approve all pillars
      await page.click('button:has-text("Approve All Pillars")');

      // Wait for next step
      await page.waitForTimeout(3000);

      // Should proceed to review step
      // (Add assertion based on what happens after pillar approval)
    });
  });
});
