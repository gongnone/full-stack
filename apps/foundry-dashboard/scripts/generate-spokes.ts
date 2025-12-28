import { chromium } from '@playwright/test';

const config = {
  baseUrl: process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca',
  testEmail: process.env.TEST_EMAIL || 'e2e-test@foundry.local',
  testPassword: process.env.TEST_PASSWORD || 'TestPassword123!',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    console.log('Logging in...');
    await page.goto(config.baseUrl + '/login');
    await page.waitForLoadState('domcontentloaded');

    const emailInput = page.getByPlaceholder('you@example.com');
    const passwordInput = page.getByPlaceholder('••••••••');

    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill(config.testEmail);
    await passwordInput.fill(config.testPassword);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL(/\/app/, { timeout: 30000 });
    console.log('Logged in successfully');

    // Navigate to hubs list first
    await page.goto(config.baseUrl + '/app/hubs');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Get all hub links and extract IDs
    const hubLinks = await page.locator('a[href*="/app/hubs/"]').all();
    console.log('Found ' + hubLinks.length + ' hub links');

    let hubId: string | null = null;
    for (const link of hubLinks) {
      const href = await link.getAttribute('href');
      console.log('  Link href: ' + href);
      const match = href?.match(/\/app\/hubs\/([a-f0-9-]+)$/);
      if (match) {
        hubId = match[1];
        break;
      }
    }

    if (!hubId) {
      console.log('No valid hub ID found');
      await page.screenshot({ path: 'test-results/spoke-generation-no-hub.png' });
      return;
    }

    console.log('Using hub ID: ' + hubId);

    // Navigate directly to hub detail page
    await page.goto(config.baseUrl + '/app/hubs/' + hubId);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    console.log('Current URL: ' + page.url());
    await page.screenshot({ path: 'test-results/spoke-generation-hub-detail.png' });

    // Look for generate button - try multiple selectors
    let generateBtn = page.getByRole('button', { name: /Generate Spokes/i });

    if (!await generateBtn.isVisible().catch(() => false)) {
      generateBtn = page.locator('button', { hasText: 'Generate Spokes' });
    }
    if (!await generateBtn.isVisible().catch(() => false)) {
      generateBtn = page.locator('text=Generate Spokes');
    }

    if (await generateBtn.isVisible().catch(() => false)) {
      console.log('Found generate button, clicking...');
      await generateBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/spoke-generation-started.png' });

      // Wait for generation
      console.log('Waiting for generation to complete (up to 90 seconds)...');
      try {
        await page.waitForSelector('text=/complete|success|generated|spokes created/i', { timeout: 90000 });
        console.log('Generation complete!');
      } catch {
        console.log('Timeout - checking current state...');
      }

      await page.screenshot({ path: 'test-results/spoke-generation-result.png' });
    } else {
      console.log('No generate button visible. Checking page...');

      // Check for spokes tab
      const spokesTab = page.locator('[role="tab"]:has-text("Spokes")');
      if (await spokesTab.isVisible()) {
        console.log('Found Spokes tab');
        await spokesTab.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/spoke-generation-spokes-tab.png' });
      }

      // Look for any buttons
      const buttons = await page.locator('button').allTextContents();
      console.log('Available buttons: ' + buttons.filter(b => b.trim()).join(', '));
    }

  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'test-results/spoke-generation-error.png' });
  } finally {
    await browser.close();
  }
}

main();
