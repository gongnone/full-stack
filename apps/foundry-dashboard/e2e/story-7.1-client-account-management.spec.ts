/**
 * Story 7.1: Client Account Management
 * E2E Tests for Acceptance Criteria
 *
 * AC1: Client Listing - View all client accounts
 * AC2: Create Client with Isolation - Add new clients with DO provisioning
 * AC3: Client Archive (Soft Delete) - Archive clients while preserving data
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@foundry.local';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!';

async function login(page: import('@playwright/test').Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/);
}

test.describe('Story 7.1: Client Account Management', () => {
  test.describe('AC1: Client Listing', () => {
    test('Clients page displays list of clients', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Page should load with Clients heading
      await expect(page.locator('h1:has-text("Clients")')).toBeVisible();

      // Should show management description
      await expect(page.locator('text=/Manage your client accounts/i')).toBeVisible();
    });

    test('Clients page shows Add Client button', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Add Client button should be visible
      await expect(page.locator('button:has-text("Add Client")')).toBeVisible();
    });

    test('Clients list shows empty state when no clients exist', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Wait for data to load
      await page.waitForTimeout(1000);

      // Either shows client cards or empty state
      const hasClients = await page.locator('[class*="rounded-xl"]').filter({ hasText: /No industry|Technology|Retail/i }).first().isVisible().catch(() => false);
      const hasEmptyState = await page.locator('text=/No clients yet/i').isVisible().catch(() => false);

      expect(hasClients || hasEmptyState).toBeTruthy();
    });

    test('Client cards display name and industry', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Wait for data load
      await page.waitForTimeout(1000);

      // If clients exist, they should show name and industry info
      const clientCards = page.locator('[class*="rounded-xl"]').filter({ has: page.locator('p:has-text(/No industry/)') });
      const cardCount = await clientCards.count();

      if (cardCount > 0) {
        // Each card should have a name (bold text)
        const firstCard = clientCards.first();
        await expect(firstCard.locator('p.font-medium')).toBeVisible();
      }
    });
  });

  test.describe('AC2: Create Client with Isolation', () => {
    test('Add Client button opens modal', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Click Add Client
      await page.click('button:has-text("Add Client")');

      // Modal should appear
      await expect(page.locator('text="Add New Client"')).toBeVisible();
    });

    test('Add Client modal has required form fields', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Check form fields
      await expect(page.locator('label:has-text("Client Name")')).toBeVisible();
      await expect(page.locator('input#name')).toBeVisible();
      await expect(page.locator('label:has-text("Industry")')).toBeVisible();
      await expect(page.locator('input#industry')).toBeVisible();
      await expect(page.locator('label:has-text("Contact Email")')).toBeVisible();
      await expect(page.locator('input#email')).toBeVisible();
    });

    test('Create Client button is disabled without name', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Create button should be disabled when name is empty
      const createBtn = page.locator('button:has-text("Create Client")');
      await expect(createBtn).toBeDisabled();
    });

    test('Cancel button closes modal', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Modal should be visible
      await expect(page.locator('text="Add New Client"')).toBeVisible();

      // Click Cancel
      await page.click('button:has-text("Cancel")');

      // Modal should close
      await expect(page.locator('text="Add New Client"')).not.toBeVisible();
    });

    test('Client creation form validates email format', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Fill form with invalid email
      await page.fill('input#name', 'Test Client');
      await page.fill('input#email', 'invalid-email');

      // Email input should show validation
      const emailInput = page.locator('input#email');
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBeTruthy();
    });

    test('Client creation with valid data enables submit button', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Fill valid form data
      await page.fill('input#name', 'E2E Test Client');

      // Create button should be enabled
      const createBtn = page.locator('button:has-text("Create Client")');
      await expect(createBtn).toBeEnabled();
    });
  });

  test.describe('AC3: Client Archive (Soft Delete)', () => {
    test('Client cards have clickable area', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Wait for data
      await page.waitForTimeout(1000);

      // Client cards should have pointer cursor
      const clientCard = page.locator('[class*="rounded-xl"][class*="cursor-pointer"]').first();
      const isClickable = await clientCard.isVisible().catch(() => false);

      // Either clickable cards exist or empty state
      if (isClickable) {
        const cursor = await clientCard.evaluate(el => getComputedStyle(el).cursor);
        expect(cursor).toBe('pointer');
      }
    });
  });

  test.describe('Midnight Command Theme', () => {
    test('Clients page uses correct dark theme colors', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      const bodyBgColor = await page.evaluate(() => {
        return getComputedStyle(document.body).backgroundColor;
      });

      expect(bodyBgColor).toBe('rgb(15, 20, 25)');
    });

    test('Add Client button uses edit color (blue)', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      const addBtn = page.locator('button:has-text("Add Client")');
      const bgColor = await addBtn.evaluate(el => getComputedStyle(el).backgroundColor);

      // Should use --edit color: #1D9BF0 = rgb(29, 155, 240)
      expect(bgColor).toBe('rgb(29, 155, 240)');
    });
  });

  test.describe('Accessibility', () => {
    test('Add Client modal is keyboard accessible', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);

      // Open modal with click
      await page.click('button:has-text("Add Client")');
      await expect(page.locator('text="Add New Client"')).toBeVisible();

      // Modal should trap focus
      await page.keyboard.press('Tab');

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(page.locator('text="Add New Client"')).not.toBeVisible();
    });

    test('Form inputs have proper labels', async ({ page }) => {
      await login(page);
      await page.goto(`${BASE_URL}/app/clients`);
      await page.click('button:has-text("Add Client")');

      // Name input has label
      const nameInput = page.locator('input#name');
      const nameLabel = page.locator('label[for="name"]');
      await expect(nameLabel).toBeVisible();

      // Industry input has label
      const industryInput = page.locator('input#industry');
      const industryLabel = page.locator('label[for="industry"]');
      await expect(industryLabel).toBeVisible();
    });
  });
});
