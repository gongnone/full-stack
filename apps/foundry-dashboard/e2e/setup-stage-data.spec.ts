import { test, expect } from '@playwright/test';
import { login, waitForPageLoad } from './utils/test-helpers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

test.describe('Stage Data Setup', () => {
  test('Ensure Hub and Spokes exist', async ({ page }) => {
    // 1. Login
    const loggedIn = await login(page);
    expect(loggedIn, 'Login failed').toBe(true);

    // 2. Check if Hub exists
    await page.goto(`${BASE_URL}/app/hubs`);
    await waitForPageLoad(page);

    const hubCard = page.locator('[data-testid="hub-card"], a[href*="/app/hubs/"]').first();
    let hubExists = await hubCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hubExists) {
      console.log('Creating new Hub...');
      // Click "New Hub" or "Create Hub"
      await page.click('a:has-text("New Hub"), a:has-text("Create Hub")');
      await waitForPageLoad(page);

      // Fill Hub Form
      await page.fill('input[name="name"]', 'E2E Test Hub');
      await page.fill('textarea[name="description"]', 'Hub created for E2E testing of Epic 4.');
      
      // Submit
      await page.click('button[type="submit"]');
      await waitForPageLoad(page);

      // Verify creation
      await expect(page.locator('h1:has-text("E2E Test Hub")')).toBeVisible();
      hubExists = true;
    } else {
      console.log('Hub already exists.');
    }

    // 3. Generate Spokes
    // Navigate to the first hub
    await page.goto(`${BASE_URL}/app/hubs`);
    await waitForPageLoad(page);
    await page.locator('[data-testid="hub-card"], a[href*="/app/hubs/"]').first().click();
    await waitForPageLoad(page);

    // Check if spokes already exist
    const spokesTab = page.locator('button:has-text("Generated Spokes")');
    await spokesTab.click();
    await waitForPageLoad(page);

    const hasSpokes = await page.locator('[data-testid="spoke-tree"], .spoke-node, [data-testid="spoke-card"]').first().isVisible({ timeout: 3000 }).catch(() => false);

    if (!hasSpokes) {
       console.log('Generating Spokes...');
       // Look for Generate Button
       // Note: Might need to switch back to "Content Pillars" tab if that's where the button is
       const pillarsTab = page.locator('button:has-text("Content Pillars")');
       await pillarsTab.click();
       await waitForPageLoad(page);

       const generateButton = page.locator('button:has-text("Generate Spokes")');
       if (await generateButton.isEnabled()) {
         await generateButton.click();
         // Wait for some confirmation or progress
         await expect(page.locator('text=Generation in Progress').or(page.locator('text=Generating'))).toBeVisible({ timeout: 10000 });
         console.log('Spoke generation triggered.');
       } else {
         console.log('Generate button not enabled. Check Pillar configuration.');
       }
    } else {
      console.log('Spokes already exist.');
    }
  });
});
