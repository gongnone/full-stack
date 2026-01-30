import { test, expect } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('E2E Happy Path: Full product walkthrough', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes

  // ═══ PHASE 1: LOGIN ═══
  console.log('\n═══ PHASE 1: LOGIN ═══');
  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });
  console.log('✅ Login successful:', page.url());
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-01-dashboard.png', fullPage: true });

  // ═══ PHASE 2: DASHBOARD ═══
  console.log('\n═══ PHASE 2: DASHBOARD ═══');
  const dashText = await page.locator('body').textContent() || '';
  console.log('Active Clients:', dashText.match(/Active Clients\s*(\d+)/)?.[1] || '?');
  console.log('Content Hubs:', dashText.match(/Content Hubs\s*(\d+)/)?.[1] || '?');
  console.log('Zero-Edit Rate:', dashText.match(/Zero-Edit Rate\s*([\d.]+%)/)?.[1] || '?');
  console.log('Review Queue visible:', dashText.includes('Review Queue'));

  // ═══ PHASE 3: BRAND DNA ═══
  console.log('\n═══ PHASE 3: BRAND DNA ═══');
  await page.locator('a:has-text("Brand DNA")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-02-brand-dna.png', fullPage: true });
  const dnaText = await page.locator('body').textContent() || '';
  console.log('Brand DNA page loaded:', page.url());
  console.log('Has DNA score:', dnaText.includes('DNA') || dnaText.includes('Score') || dnaText.includes('strength'));

  // ═══ PHASE 4: HUB DETAIL + SPOKES ═══
  console.log('\n═══ PHASE 4: HUB DETAIL + GENERATED SPOKES ═══');
  // Go to the hub with generated spokes
  await page.goto(`${STAGE_URL}/app/hubs/b2e543d8-2b30-4dd0-b236-39da6d3518ef`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-03-hub-detail.png', fullPage: true });
  
  const hubText = await page.locator('body').textContent() || '';
  console.log('Hub title:', hubText.match(/Untitled|Hub/)?.[0] || 'unknown');
  console.log('Spoke count:', hubText.match(/(\d+)\s*Spokes/)?.[0] || '0');
  console.log('Pillar count:', hubText.match(/(\d+)\s*Pillars/)?.[0] || '0');

  // Click Generated Spokes tab
  const spokesTab = page.locator('button:has-text("Generated Spokes")');
  if (await spokesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await spokesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-04-spokes-tab.png', fullPage: true });
    
    // Try to expand a pillar to see spoke content
    const expandBtn = page.locator('[class*="pillar"] button, [data-testid*="expand"], [aria-expanded]').first();
    if (await expandBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expandBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-05-spoke-expanded.png', fullPage: true });
    }
    
    // Try clicking on a spoke card
    const spokeCard = page.locator('[class*="spoke"], [class*="card"]').first();
    if (await spokeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await spokeCard.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-06-spoke-detail.png', fullPage: true });
      console.log('Spoke detail visible');
    }
  }

  // ═══ PHASE 5: REVIEW QUEUE ═══
  console.log('\n═══ PHASE 5: REVIEW QUEUE ═══');
  await page.goto(`${STAGE_URL}/app`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Click on review queue items
  const reviewLink = page.locator('a:has-text("Review"), button:has-text("Review"), [class*="review"]').first();
  if (await reviewLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await reviewLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-07-review.png', fullPage: true });
    console.log('Review page URL:', page.url());
  } else {
    console.log('⚠️ No review link found on dashboard');
  }

  // ═══ PHASE 6: ANALYTICS ═══
  console.log('\n═══ PHASE 6: ANALYTICS ═══');
  await page.locator('a:has-text("Analytics")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-08-analytics.png', fullPage: true });
  const analyticsText = await page.locator('body').textContent() || '';
  console.log('Analytics page loaded:', page.url());
  console.log('Has metrics:', analyticsText.includes('Rate') || analyticsText.includes('rate') || analyticsText.includes('%'));

  // ═══ PHASE 7: HUB CREATION FLOW ═══
  console.log('\n═══ PHASE 7: HUB CREATION FLOW ═══');
  await page.locator('a:has-text("Hubs")').click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const newHubBtn = page.locator('a:has-text("New Hub"), button:has-text("New Hub")').first();
  if (await newHubBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await newHubBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-09-new-hub.png', fullPage: true });
    console.log('New Hub wizard URL:', page.url());
    
    const wizardText = await page.locator('body').textContent() || '';
    console.log('Wizard steps visible:', wizardText.includes('Upload') || wizardText.includes('Source'));
    
    // Try pasting text
    const pasteTab = page.locator('button:has-text("Paste Text")');
    if (await pasteTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pasteTab.click();
      await page.waitForTimeout(500);
      
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
        await textarea.fill('This is a test content piece about product management and agile methodology. We believe in iterative development, user feedback loops, and continuous improvement. Our approach combines design thinking with lean startup principles to deliver products that users actually want.');
        await page.screenshot({ path: 'e2e/manual-qa/screenshots/e2e-10-paste-content.png', fullPage: true });
        console.log('✅ Content pasted');
        
        // Look for Next/Continue/Submit button
        const nextBtn = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Analyze"), button:has-text("Extract"), button[type="submit"]').first();
        if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          const btnText = await nextBtn.textContent();
          console.log('Next action:', btnText);
        }
      }
    }
  }

  console.log('\n═══ E2E WALKTHROUGH COMPLETE ═══');
});
