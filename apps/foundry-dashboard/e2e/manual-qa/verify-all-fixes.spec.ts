import { test, expect } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('Verify all fixes', async ({ page }) => {
  test.setTimeout(120000);

  // Login
  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });
  
  // 1. Dashboard
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/verify-01-dashboard.png', fullPage: true });
  const dashText = await page.locator('body').textContent() || '';
  console.log('Dashboard - Pending Review visible:', dashText.includes('Pending Review'));
  console.log('Dashboard - Review Queue visible:', dashText.includes('Review Queue'));
  console.log('Dashboard - Needs Review count:', dashText.match(/Needs Review.*?(\d+)/s)?.[1] || 'not found');

  // 2. Hubs list - spoke counts
  await page.locator('a:has-text("Hubs")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/verify-02-hubs.png', fullPage: true });
  const hubsText = await page.locator('body').textContent() || '';
  const spokeCounts = hubsText.match(/\d+\s*spokes/gi);
  console.log('Hubs - spoke counts:', spokeCounts);

  // 3. Review page
  await page.goto(`${STAGE_URL}/app/review?filter=needs-review`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/verify-03-review.png', fullPage: true });
  const reviewText = await page.locator('body').textContent() || '';
  console.log('Review - has items:', !reviewText.includes('No Items Found'));
  console.log('Review - progress:', reviewText.match(/\d+\s*\/\s*\d+/)?.[0] || 'not found');

  // 4. Hub detail spoke count
  await page.goto(`${STAGE_URL}/app/hubs/b2e543d8-2b30-4dd0-b236-39da6d3518ef`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const hubText = await page.locator('body').textContent() || '';
  console.log('Hub detail - spoke count:', hubText.match(/(\d+)\s*Spokes/)?.[0] || 'not found');
});
