import { test, expect } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('Smoke: Open hub detail and generate spokes', async ({ page }) => {
  // 1. Login
  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });
  console.log('✅ Logged in');

  // 2. Go directly to an untitled hub with 4 pillars, 0 spokes
  await page.goto(`${STAGE_URL}/app/hubs/b2e543d8-2b30-4dd0-b236-39da6d3518ef`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/01-hub-detail.png', fullPage: true });
  console.log('Hub detail URL:', page.url());

  // 3. Catalog everything on the page
  const allButtons = await page.locator('button').allTextContents();
  console.log('Buttons:', allButtons.filter(b => b.trim()));

  const allLinks = await page.locator('a[href]').evaluateAll(els =>
    els.map(e => ({ text: e.textContent?.trim()?.slice(0, 60), href: e.getAttribute('href') }))
  );
  console.log('Links:', JSON.stringify(allLinks, null, 2));

  const headings = await page.locator('h1, h2, h3, h4').allTextContents();
  console.log('Headings:', headings.filter(h => h.trim()));

  // 4. Look for any generate/spoke related action
  const generateBtn = page.locator('button:has-text("Generate"), button:has-text("Spoke"), button:has-text("Create"), button:has-text("Start Sprint")').first();
  if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const txt = await generateBtn.textContent();
    console.log('🎯 Found action button:', txt);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/02-before-action.png', fullPage: true });
    await generateBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/03-after-action.png', fullPage: true });
    console.log('After action URL:', page.url());

    // Monitor progress for 30s
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(5000);
      await page.screenshot({ path: `e2e/manual-qa/screenshots/04-progress-${i}.png`, fullPage: true });
      console.log(`Progress ${i}: URL=${page.url()}`);
      const body = await page.locator('body').textContent();
      if (body?.includes('Complete') || body?.includes('100%') || body?.includes('complete')) {
        console.log('✅ Generation complete!');
        break;
      }
    }
  } else {
    console.log('❌ No generate button found');
    // Check for the API endpoint directly
    console.log('Checking /api/hubs/generate-spokes endpoint...');
  }
});
