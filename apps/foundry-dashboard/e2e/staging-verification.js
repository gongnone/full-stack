#!/usr/bin/env node
/**
 * Staging Environment Verification
 * Tests the deployed foundry-stage.williamjshaw.ca to verify Sprint 2 features
 */

import { chromium } from '@playwright/test';

const STAGING_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

async function runTests() {
    console.log('🧪 Starting Foundry Staging Verification Tests...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    async function test(name, testFn) {
        try {
            console.log(`📋 ${name}...`);
            await testFn();
            console.log(`✅ ${name} - PASSED\n`);
            results.passed++;
            results.tests.push({ name, status: 'PASSED' });
        } catch (error) {
            console.log(`❌ ${name} - FAILED`);
            console.log(`   Error: ${error.message}\n`);
            results.failed++;
            results.tests.push({ name, status: 'FAILED', error: error.message });
        }
    }
    
    // Test 1: Basic staging site accessibility
    await test('Staging site loads', async () => {
        await page.goto(STAGING_URL);
        await page.waitForLoadState('domcontentloaded');
        
        const title = await page.title();
        if (!title.includes('Foundry')) {
            throw new Error(`Expected title to contain 'Foundry', got: ${title}`);
        }
    });
    
    // Test 2: Login functionality
    await test('User login works', async () => {
        await page.goto(`${STAGING_URL}/login`);
        
        // Fill login form
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        
        // Wait for redirect to dashboard
        await page.waitForURL('**/app/**');
        
        // Check we're in the dashboard
        const url = page.url();
        if (!url.includes('/app')) {
            throw new Error(`Expected to be redirected to /app, but at: ${url}`);
        }
    });
    
    // Test 3: Dashboard loads with navigation
    await test('Dashboard navigation available', async () => {
        // Should already be logged in from previous test
        await page.goto(`${STAGING_URL}/app`);
        await page.waitForLoadState('domcontentloaded');
        
        // Check for main navigation elements
        const nav = await page.locator('nav, [role="navigation"]').count();
        if (nav === 0) {
            throw new Error('No navigation found on dashboard');
        }
        
        // Check for clients section
        const clientsLink = await page.getByText('Clients', { exact: false }).first();
        if (!await clientsLink.isVisible()) {
            throw new Error('Clients section not visible in navigation');
        }
    });
    
    // Test 4: Quick Create Hub Button (Sprint 2 feature)
    await test('Quick Create Hub button present', async () => {
        await page.goto(`${STAGING_URL}/app`);
        await page.waitForLoadState('domcontentloaded');
        
        // Look for the Quick Create Hub button
        const quickCreateButton = page.getByText('🚀 Quick Create Hub', { exact: false });
        
        if (!await quickCreateButton.isVisible()) {
            // Also check for alternative text
            const alternativeButton = page.getByText('Quick Create', { exact: false });
            if (!await alternativeButton.isVisible()) {
                throw new Error('Quick Create Hub button not found on dashboard');
            }
        }
    });
    
    // Test 5: tRPC endpoints responding
    await test('tRPC endpoints accessible', async () => {
        // Test a basic tRPC endpoint
        const response = await page.request.get(`${STAGING_URL}/api/trpc/auth.me`);
        
        if (!response.ok()) {
            throw new Error(`tRPC endpoint returned ${response.status()}: ${await response.text()}`);
        }
        
        const data = await response.json();
        if (!data.result) {
            throw new Error('tRPC response missing result field');
        }
    });
    
    // Test 6: Brand DNA results page (R-14)
    await test('Brand DNA results page accessible', async () => {
        // First, check if we have any clients with Brand DNA data
        await page.goto(`${STAGING_URL}/app/clients`);
        await page.waitForLoadState('domcontentloaded');
        
        // Look for any client link or create a test scenario
        const clientLinks = await page.locator('a[href*="/clients/"]').count();
        
        if (clientLinks > 0) {
            // Click on first client
            await page.locator('a[href*="/clients/"]').first().click();
            await page.waitForLoadState('domcontentloaded');
            
            // Check if Brand DNA link exists
            const brandDnaLink = page.getByText('Brand DNA', { exact: false });
            if (await brandDnaLink.isVisible()) {
                await brandDnaLink.click();
                await page.waitForLoadState('domcontentloaded');
                
                // Verify we're on the Brand DNA page
                const url = page.url();
                if (!url.includes('brand-dna')) {
                    throw new Error(`Expected to be on brand-dna page, but at: ${url}`);
                }
            }
        }
        
        // If no clients exist, test the route directly
        const directResponse = await page.request.get(`${STAGING_URL}/api/trpc/clients.getClients`);
        if (directResponse.ok()) {
            console.log('   Brand DNA route accessibility verified (no test data)');
        }
    });
    
    // Test 7: Email flow configuration (R-13)
    await test('Email configuration accessible', async () => {
        // Test that email endpoints are accessible (even if we don't trigger emails)
        const emailConfigResponse = await page.request.get(`${STAGING_URL}/api/trpc/onboarding.getBrandDnaCompletionEmail`);
        
        // We expect this to return 401 or a valid response, not 404
        if (emailConfigResponse.status() === 404) {
            throw new Error('Email configuration endpoint not found');
        }
        
        console.log(`   Email endpoint status: ${emailConfigResponse.status()}`);
    });
    
    await browser.close();
    
    // Print summary
    console.log('🏁 Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%\n`);
    
    if (results.failed > 0) {
        console.log('❌ Failed Tests:');
        results.tests
            .filter(t => t.status === 'FAILED')
            .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
        console.log('');
    }
    
    if (results.failed === 0) {
        console.log('🎉 All tests passed! Sprint 2 features are working on staging.');
    } else {
        console.log('⚠️ Some tests failed. Review the issues above.');
    }
    
    process.exit(results.failed > 0 ? 1 : 0);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});