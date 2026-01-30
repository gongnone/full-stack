import { test, expect } from '@playwright/test';

const STAGE_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

test('Verify: Generate spokes after P0 fixes', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes

  // Login
  await page.goto(`${STAGE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('input[type="email"], input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[type="password"], input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL('**/app**', { timeout: 15000 });
  console.log('✅ Logged in');

  // Go to Hubs page and find a hub to test
  await page.goto(`${STAGE_URL}/app/hubs`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Use E2E Test Hub 1 which has pillars but we can try regenerate
  // Or find any hub with pillars and click Generate
  // Let's go to first untitled hub — it might have spokes now from old workflows
  await page.goto(`${STAGE_URL}/app/hubs/b2e543d8-2b30-4dd0-b236-39da6d3518ef`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const bodyText = await page.locator('body').textContent() || '';
  console.log('Hub status:', bodyText.match(/\d+\s*Spokes/)?.[0] || 'unknown');
  console.log('Has creative conflicts?', bodyText.includes('creative_conflict') || bodyText.includes('Creative Conflict'));

  // Look for a Regenerate button or Generate Spokes button
  const allBtns = await page.locator('button').allTextContents();
  console.log('Available buttons:', allBtns.filter(b => b.trim()));
  
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/v01-hub-state.png', fullPage: true });

  // Click Generate or Regenerate
  const actionBtn = page.locator('button:has-text("Generate Spokes"), button:has-text("Regenerate"), button:has-text("Retry")').first();
  if (await actionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const btnText = await actionBtn.textContent();
    console.log('🚀 Clicking:', btnText);
    await actionBtn.click();
    await page.waitForTimeout(2000);
  } else {
    console.log('No generate/regenerate button — checking if already processing');
  }

  // Monitor for 2.5 minutes
  let lastStatus = '';
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(5000);
    
    // Reload to get fresh data
    if (i > 0 && i % 6 === 0) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    const text = await page.locator('body').textContent() || '';
    
    const progressMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*spokes/i);
    const spokeCountMatch = text.match(/(\d+)\s*Spokes/);
    
    let status = 'no data';
    if (progressMatch) {
      status = `${progressMatch[1]}/${progressMatch[2]} spokes`;
    } else if (spokeCountMatch) {
      status = spokeCountMatch[0];
    }

    if (status !== lastStatus) {
      console.log(`[${(i+1)*5}s] ${status}`);
      lastStatus = status;
    }
    
    if (i % 5 === 4) {
      await page.screenshot({ path: `e2e/manual-qa/screenshots/v02-progress-${i}.png`, fullPage: true });
    }

    // Check completion
    if (progressMatch) {
      const gen = parseInt(progressMatch[1]);
      const total = parseInt(progressMatch[2]);
      if (gen > 0 && gen === total) {
        console.log(`✅ GENERATION COMPLETE: ${gen}/${total} spokes!`);
        break;
      }
      if (gen > 0) {
        console.log(`📈 Progress: ${gen}/${total}`);
      }
    }
  }

  // Final state
  await page.screenshot({ path: 'e2e/manual-qa/screenshots/v03-final.png', fullPage: true });
  
  // Switch to Generated Spokes tab
  const spokesTab = page.locator('button:has-text("Generated Spokes")');
  if (await spokesTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await spokesTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e/manual-qa/screenshots/v04-spokes-tab.png', fullPage: true });
    
    const tabText = await page.locator('body').textContent() || '';
    console.log('Spokes tab content includes:', 
      tabText.includes('pending_review') ? 'pending_review ✅' : '',
      tabText.includes('creative_conflict') ? 'creative_conflict ⚠️' : '',
      tabText.includes('generating') ? 'generating ⏳' : ''
    );
  }
});
