import { test, expect } from '@playwright/test';

function generateRandomEmail() {
  return `e2e-test-${Math.random().toString(36).substring(2, 10)}@example.com`;
}

test.describe('New User Onboarding Flow', () => {
  test('R-14: New user can create first client and access dashboard', async ({ page }) => {
    // 1. Sign up new user
    const email = generateRandomEmail();
    const password = 'Password123!';
    
    await page.goto('/signup');
    await expect(page.locator('h3:has-text("Create an account")')).toBeVisible(); // shadcn CardTitle usually renders as h3
    
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password); // Added confirm password field
    await page.fill('#name', 'New User');
    await page.click('button[type="submit"]');

    // 2. Verify redirection to Onboarding (Create First Client)
    // Should NOT see dashboard or 403 errors
    await page.waitForURL(/\/app/, { timeout: 30000 });
    
    // Debug: Print URL to see where we ended up if it fails
    console.log('Current URL:', page.url());

    try {
      await expect(page.getByText('Welcome to Foundry')).toBeVisible({ timeout: 15000 });
    } catch (e) {
      console.log('Onboarding text not found. Page content excerpt:');
      const content = await page.content();
      console.log(content.substring(0, 2000)); // Print first 2000 chars
      throw e;
    }

    await expect(page.getByText('Create your first client')).toBeVisible();

    // 3. Fill out onboarding form
    const clientName = 'My Startup Inc';
    await page.fill('input[name="clientName"]', clientName);
    await page.fill('input[name="industry"]', 'Tech');
    // Default brand color should be selected, we'll keep it

    // 4. Submit form
    await page.click('button[type="submit"]');

    // 5. Verify redirection to Dashboard with new client active
    // The "Create First Client" header should disappear
    await expect(page.getByText('Welcome to Foundry')).toBeHidden();
    
    // Should see the client name in the selector/header
    await expect(page.getByText(clientName)).toBeVisible();
    
    // 6. Verify Critical User Journey: Create a Hub (AC6)
    // Navigate to Hubs page
    await page.click('a[href="/app/hubs"]');
    await expect(page).toHaveURL('/app/hubs');
    
    // Click "New Hub"
    await page.click('text=New Hub');
    
    // Verify we are on the source selection wizard
    await expect(page.getByText('Add Content Source')).toBeVisible();
  });
});
