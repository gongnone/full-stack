import { test } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('Verify analytics page', async ({ page }) => {
  test.setTimeout(60000);
  
  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });

  await page.goto(`${STAGE_URL}/app/analytics`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // Wait for charts to load
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/analytics-full.png', fullPage: true });
  
  const text = await page.locator('body').textContent() || '';
  console.log('Zero-Edit Rate:', text.match(/Zero-Edit Rate\s*[:\s]*([\d.]+%)/)?.[1] || 'not found');
  console.log('Critic Pass Rate:', text.match(/Critic Pass Rate\s*[:\s]*([\d.]+%)/)?.[1] || 'not found');
  console.log('Healing Efficiency:', text.match(/Self-Healing Efficiency\s*[:\s]*([\d.]+)/)?.[1] || 'not found');
  console.log('Has chart data:', text.includes('avg rate') || text.includes('Avg') || text.includes('best'));
});
