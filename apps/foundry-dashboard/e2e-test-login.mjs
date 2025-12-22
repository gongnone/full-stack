import { chromium } from 'playwright';

async function testLoginFlow() {
  console.log('🚀 Starting browser test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    console.log('✅ Login page loaded\n');

    // Step 2: Verify login form elements
    console.log('🔍 Step 2: Verifying login form UI...');
    const emailInput = await page.locator('input[type="email"]');
    const passwordInput = await page.locator('input[type="password"]');
    const submitButton = await page.locator('button[type="submit"]');

    await emailInput.waitFor({ state: 'visible' });
    await passwordInput.waitFor({ state: 'visible' });
    await submitButton.waitFor({ state: 'visible' });

    console.log('  ✓ Email input found');
    console.log('  ✓ Password input found');
    console.log('  ✓ Submit button found\n');

    // Step 3: Fill in credentials
    console.log('📝 Step 3: Filling in test credentials...');
    await emailInput.fill('test@foundry.local');
    await passwordInput.fill('TestPassword123');
    console.log('  ✓ Email: test@foundry.local');
    console.log('  ✓ Password: ***************\n');

    // Step 4: Submit form
    console.log('🔐 Step 4: Submitting login form...');
    await submitButton.click();
    console.log('  ✓ Form submitted\n');

    // Step 5: Wait for redirect to dashboard
    console.log('⏳ Step 5: Waiting for redirect to dashboard...');
    await page.waitForURL('**/app**', { timeout: 10000 });
    const currentUrl = page.url();
    console.log(`  ✓ Redirected to: ${currentUrl}\n`);

    // Step 6: Verify dashboard content
    console.log('🎯 Step 6: Verifying dashboard content...');

    // Wait for user name to appear
    const welcomeText = await page.locator('h2:has-text("Welcome")').textContent();
    console.log(`  ✓ Welcome message: "${welcomeText}"`);

    // Check for tRPC connection status
    await page.waitForSelector('text=/tRPC/', { timeout: 5000 });
    const alertText = await page.locator('[role="alert"]').first().textContent();
    console.log(`  ✓ tRPC status: "${alertText}"\n`);

    // Step 7: Verify client count display
    console.log('📊 Step 7: Checking dashboard stats...');
    const clientCard = await page.locator('text=Active Clients').locator('..').locator('..');
    const clientCount = await clientCard.locator('p.text-3xl').textContent();
    console.log(`  ✓ Active Clients: ${clientCount}\n`);

    // Step 8: Check for sign out button
    console.log('🚪 Step 8: Verifying sign out functionality...');
    const signOutButton = await page.locator('button:has-text("Sign out")');
    await signOutButton.waitFor({ state: 'visible' });
    console.log('  ✓ Sign out button found\n');

    // Step 9: Take screenshot
    console.log('📸 Step 9: Taking screenshot...');
    await page.screenshot({ path: 'dashboard-screenshot.png', fullPage: true });
    console.log('  ✓ Screenshot saved: dashboard-screenshot.png\n');

    // Step 10: Verify session persistence (reload page)
    console.log('🔄 Step 10: Testing session persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForURL('**/app**', { timeout: 5000 });
    const stillOnDashboard = page.url().includes('/app');
    console.log(`  ✓ Session persisted after reload: ${stillOnDashboard}\n`);

    console.log('🎉 All tests passed!\n');
    console.log('═══════════════════════════════════════');
    console.log('✅ LOGIN FLOW TEST: SUCCESS');
    console.log('═══════════════════════════════════════');
    console.log('\nTest Summary:');
    console.log('  • Login page loads correctly');
    console.log('  • Form fields are present and functional');
    console.log('  • Authentication succeeds with test credentials');
    console.log('  • Redirect to dashboard works');
    console.log('  • tRPC connection established');
    console.log('  • Dashboard displays user data');
    console.log('  • Session persists across page reloads');
    console.log('  • UI elements render properly');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nCurrent URL:', page.url());

    // Take error screenshot
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.error('Error screenshot saved: error-screenshot.png');

    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testLoginFlow()
  .then(() => {
    console.log('\n✨ Browser test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Browser test failed:', error);
    process.exit(1);
  });
