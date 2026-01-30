const { test, expect } = require('@playwright/test');

test('Test Zero-Edit Rate Display', async ({ page }) => {
  // Step 1: Login to staging
  await page.goto('https://foundry-stage.williamjshaw.ca/login');
  await page.fill('input[name="email"]', 'e2e-test@foundry.local');
  await page.fill('input[name="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/app/clients*', { timeout: 10000 });

  // Step 2: Go to analytics page to check zero-edit display there first
  await page.goto('https://foundry-stage.williamjshaw.ca/app/analytics');
  await page.waitForSelector('text=Zero-Edit Rate', { timeout: 15000 });
  
  // Check that analytics shows real data
  const analyticsMetric = page.locator('[data-testid="zero-edit-metric"], text="Zero-Edit Rate"').first();
  const analyticsValue = await analyticsMetric.locator('..').locator('.text-3xl').textContent();
  console.log('Analytics Zero-Edit Rate:', analyticsValue);

  // Step 3: Create a quick review session to get SprintComplete
  await page.goto('https://foundry-stage.williamjshaw.ca/app/review');
  await page.waitForSelector('[data-testid="review-queue"]', { timeout: 15000 });
  
  // Check if there are spokes to review
  const spokeCards = await page.locator('[data-testid^="spoke-card"]').count();
  
  if (spokeCards > 0) {
    // Approve one spoke to get to SprintComplete
    await page.click('[data-testid="approve-btn"]');
    await page.waitForTimeout(1000);
    
    // End session to see SprintComplete
    const endSessionBtn = page.locator('button:has-text("End Session")');
    if (await endSessionBtn.isVisible()) {
      await endSessionBtn.click();
      await page.waitForSelector('text=Sprint Complete!', { timeout: 10000 });
      
      // Check Zero-Edit Rate section in SprintComplete
      const zeroEditSection = page.locator('text=Zero-Edit Rate');
      await expect(zeroEditSection).toBeVisible();
      
      // Check for "Real data" badge
      const realDataBadge = page.locator('text=Real data');
      if (await realDataBadge.isVisible()) {
        console.log('✅ SprintComplete showing real zero-edit data');
      } else {
        console.log('⚠️ SprintComplete not showing real data badge');
      }
      
      // Get the percentage value
      const zeroEditPercentage = await page.locator('text=Zero-Edit Rate').locator('..').locator('text=%').textContent();
      console.log('SprintComplete Zero-Edit Rate:', zeroEditPercentage);
      
    } else {
      console.log('No End Session button found');
    }
  } else {
    console.log('No spokes available for review');
  }
});
