import { test, expect } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';
// First hub — has 24 completed workflows
const HUB_ID = 'b2e543d8-2b30-4dd0-b236-39da6d3518ef';

test('Verify: Spoke count shows after dashboard fix', async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });

  // Go directly to hub detail
  await page.goto(`${STAGE_URL}/app/hubs/${HUB_ID}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'e2e/manual-qa/screenshots/final-01-hub.png', fullPage: true });
  
  const bodyText = await page.locator('body').textContent() || '';
  const spokeMatch = bodyText.match(/(\d+)\s*Spokes/);
  const progressMatch = bodyText.match(/(\d+)\s*\/\s*(\d+)\s*spokes/i);
  
  console.log('Spoke count:', spokeMatch?.[0] || 'not found');
  console.log('Progress:', progressMatch ? `${progressMatch[1]}/${progressMatch[2]}` : 'not found');
  
  // Check Generated Spokes tab
  const spokesTab = page.locator('button:has-text("Generated Spokes")');
  if (await spokesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await spokesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/final-02-spokes.png', fullPage: true });
    
    // Count visible spoke cards/items
    const allText = await page.locator('body').textContent() || '';
    console.log('Has pending_review:', allText.includes('pending_review') || allText.includes('Pending'));
    console.log('Has creative_conflict:', allText.includes('creative_conflict') || allText.includes('Conflict'));
    console.log('Has content:', allText.includes('AI') || allText.includes('content') || allText.includes('business'));
  }

  // Also check the hubs list page
  await page.goto(`${STAGE_URL}/app/hubs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/final-03-hubs-list.png', fullPage: true });
  
  const hubListText = await page.locator('body').textContent() || '';
  const hubSpokes = hubListText.match(/\d+\s*spokes/gi);
  console.log('Hub spoke counts on list:', hubSpokes);
});
