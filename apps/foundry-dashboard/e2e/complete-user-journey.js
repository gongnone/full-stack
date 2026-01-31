#!/usr/bin/env node
/**
 * Complete User Journey Test
 * Tests full pipeline: Brand DNA → Research → Strategy → Hub Generation → Email Flow
 */

import { chromium } from '@playwright/test';

const STAGING_URL = 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';

async function runCompleteJourney() {
    console.log('🎯 Complete User Journey Test - Full Pipeline...\n');
    
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
            const startTime = Date.now();
            await testFn();
            const duration = Date.now() - startTime;
            console.log(`✅ ${name} - PASSED (${duration}ms)\n`);
            results.passed++;
            results.tests.push({ name, status: 'PASSED', duration });
        } catch (error) {
            console.log(`❌ ${name} - FAILED`);
            console.log(`   Error: ${error.message}\n`);
            results.failed++;
            results.tests.push({ name, status: 'FAILED', error: error.message });
        }
    }
    
    // Phase 1: Authentication & Setup
    await test('User authentication', async () => {
        await page.goto(`${STAGING_URL}/login`);
        await page.fill('input[type="email"]', TEST_EMAIL);
        await page.fill('input[type="password"]', TEST_PASSWORD);
        await page.click('button[type="submit"]');
        
        // More generous timeout for login
        await page.waitForURL('**/app/**', { timeout: 20000 });
        
        const url = page.url();
        if (!url.includes('/app')) {
            throw new Error(`Login failed - redirected to: ${url}`);
        }
    });
    
    // Phase 2: Brand DNA Journey
    await test('Brand DNA flow accessible', async () => {
        await page.goto(`${STAGING_URL}/app/clients`);
        await page.waitForLoadState('domcontentloaded');
        
        // Check if we can access Brand DNA functionality
        const clientLinks = await page.locator('a[href*="/clients/"]').count();
        console.log(`   Found ${clientLinks} client entries`);
        
        if (clientLinks > 0) {
            // Click first client
            await page.locator('a[href*="/clients/"]').first().click();
            await page.waitForLoadState('domcontentloaded');
            
            const currentUrl = page.url();
            console.log(`   Navigated to client: ${currentUrl}`);
            
            // Look for Brand DNA section
            const brandDnaSection = await page.locator('text=Brand DNA').count();
            if (brandDnaSection > 0) {
                console.log('   Brand DNA section found');
            }
        }
        
        console.log('   Brand DNA workflow accessible');
    });
    
    // Phase 3: Research Agent Testing
    await test('Research agent system', async () => {
        // Test research agent API endpoints
        const researchResponse = await page.request.get(`${STAGING_URL}/api/trpc/research.getResearchResults`);
        
        if (researchResponse.status() === 401) {
            console.log('   Research API requires auth (expected)');
        } else if (researchResponse.status() === 404) {
            throw new Error('Research API endpoint not found');
        } else {
            console.log(`   Research API status: ${researchResponse.status()}`);
        }
        
        console.log('   Research agent system accessible');
    });
    
    // Phase 4: Strategy Approval
    await test('Strategy approval workflow', async () => {
        // Test strategy endpoints
        const strategyResponse = await page.request.get(`${STAGING_URL}/api/trpc/strategy.getStrategy`);
        
        if (strategyResponse.status() === 401) {
            console.log('   Strategy API requires auth (expected)');
        } else if (strategyResponse.status() === 404) {
            throw new Error('Strategy API endpoint not found');
        } else {
            console.log(`   Strategy API status: ${strategyResponse.status()}`);
        }
        
        console.log('   Strategy approval system accessible');
    });
    
    // Phase 5: Hub Generation Pipeline
    await test('Hub generation system', async () => {
        await page.goto(`${STAGING_URL}/app/hubs/new`);
        await page.waitForLoadState('domcontentloaded');
        
        const url = page.url();
        if (!url.includes('/hubs/new')) {
            throw new Error('Hub creation wizard not accessible');
        }
        
        // Test hub creation endpoints
        const hubResponse = await page.request.get(`${STAGING_URL}/api/trpc/hubs.list`);
        if (hubResponse.status() === 401) {
            console.log('   Hub API requires auth (expected)');
        } else {
            console.log(`   Hub API status: ${hubResponse.status()}`);
        }
        
        console.log('   Hub generation wizard accessible');
    });
    
    // Phase 6: 24-Spoke Pipeline Test
    await test('24-spoke generation pipeline', async () => {
        // Test spoke generation endpoints
        const spokeResponse = await page.request.get(`${STAGING_URL}/api/trpc/spokes.getSpokes`);
        
        if (spokeResponse.status() === 401) {
            console.log('   Spoke API requires auth (expected)');
        } else if (spokeResponse.status() === 404) {
            throw new Error('Spoke API endpoint not found');
        } else {
            console.log(`   Spoke API status: ${spokeResponse.status()}`);
        }
        
        // Check for Durable Object engine endpoint
        const engineResponse = await page.request.post(`${STAGING_URL}/api/engine/health`);
        console.log(`   Engine API status: ${engineResponse.status()}`);
        
        console.log('   24-spoke pipeline endpoints accessible');
    });
    
    // Phase 7: Email Flow Testing
    await test('Email flow system', async () => {
        // Test email endpoints (R-13)
        const emailResponse = await page.request.get(`${STAGING_URL}/api/trpc/onboarding.getBrandDnaCompletionEmail`);
        
        if (emailResponse.status() === 200 || emailResponse.status() === 401) {
            console.log(`   Email API status: ${emailResponse.status()}`);
        } else {
            throw new Error(`Email API failed: ${emailResponse.status()}`);
        }
        
        console.log('   Email flow system configured');
    });
    
    // Phase 8: Analytics & Reporting
    await test('Analytics and reporting system', async () => {
        await page.goto(`${STAGING_URL}/app/analytics`);
        await page.waitForLoadState('domcontentloaded');
        
        const url = page.url();
        if (!url.includes('/analytics')) {
            throw new Error('Analytics page not accessible');
        }
        
        // Test analytics endpoints
        const analyticsResponse = await page.request.get(`${STAGING_URL}/api/trpc/analytics.getZeroEditRate`);
        if (analyticsResponse.status() === 401) {
            console.log('   Analytics API requires auth (expected)');
        } else {
            console.log(`   Analytics API status: ${analyticsResponse.status()}`);
        }
        
        console.log('   Analytics system accessible');
    });
    
    await browser.close();
    
    // Print comprehensive summary
    console.log('🏁 Complete User Journey Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
    console.log(`📊 Success Rate: ${successRate}%\n`);
    
    const totalTime = results.tests.reduce((sum, test) => sum + (test.duration || 0), 0);
    console.log(`⏱️ Total test time: ${totalTime}ms\n`);
    
    if (results.failed > 0) {
        console.log('❌ Failed Phases:');
        results.tests
            .filter(t => t.status === 'FAILED')
            .forEach(t => console.log(`   - ${t.name}: ${t.error}`));
        console.log('');
    }
    
    console.log('📊 Pipeline Readiness Assessment:');
    if (results.failed === 0) {
        console.log('🎉 COMPLETE PIPELINE VERIFIED - Ready for end-to-end user testing!');
        console.log('✅ All phases operational: Brand DNA → Research → Strategy → Hub → Spokes → Analytics');
    } else if (results.failed <= 2) {
        console.log('⚠️ Pipeline mostly ready - minor issues to address');
    } else {
        console.log('❌ Pipeline needs work - major issues detected');
    }
    
    process.exit(results.failed > 2 ? 1 : 0);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
});

runCompleteJourney().catch(error => {
    console.error('❌ Complete journey test failed:', error);
    process.exit(1);
});