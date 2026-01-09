/**
 * Playwright Global Setup
 * Creates E2E test user via signup API
 */
import { chromium, FullConfig } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

async function globalSetup(config: FullConfig) {
  console.log('\n🔧 Setting up E2E test environment...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for server to be fully ready
    console.log('⏳ Waiting for server to be ready...');
    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.request.get(`${BASE_URL}/login`);
        // Any response means server is ready (even 404 or redirect)
        serverReady = true;
        console.log(`✅ Server ready after ${i + 1} attempts (status: ${response.status()})`);
        break;
      } catch (e) {
        // Server not ready yet, connection refused
      }
      await page.waitForTimeout(1000);
    }

    if (!serverReady) {
      console.error('❌ Server did not become ready in time');
      return;
    }

    // Try to sign up the test user
    console.log(`📝 Creating test user: ${TEST_EMAIL}`);

    const response = await page.request.post(`${BASE_URL}/api/auth/sign-up/email`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: 'E2E Test User',
      },
      failOnStatusCode: false,
    });

    const responseText = await response.text();
    console.log(`   Response status: ${response.status()}`);

    if (response.ok()) {
      console.log('✅ Test user created successfully\n');
    } else if (response.status() === 400 && responseText.includes('already exists')) {
      console.log('ℹ️  Test user already exists\n');
    } else {
      console.error(`❌ Failed to create test user (${response.status()}):`, responseText, '\n');
    }
  } catch (error: any) {
    console.error('❌ Error in global setup:', error.message, '\n');
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup complete\n');
}

export default globalSetup;
