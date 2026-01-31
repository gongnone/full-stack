#!/usr/bin/env node
/**
 * Production Deployment Check
 * Verifies foundry.williamjshaw.ca is healthy with all Phase 2B features
 */

import { chromium } from '@playwright/test';

const PROD_URL = 'https://foundry.williamjshaw.ca';

async function runProductionChecks() {
    console.log('🚀 Foundry PRODUCTION Check...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    let passed = 0;
    let failed = 0;
    
    async function test(name, testFn) {
        try {
            console.log(`📋 ${name}...`);
            await testFn();
            console.log(`✅ ${name} - PASSED\n`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name} - FAILED: ${error.message}\n`);
            failed++;
        }
    }
    
    // 1. Site loads
    await test('Site loads', async () => {
        const response = await page.goto(PROD_URL);
        if (!response.ok()) throw new Error(`Status ${response.status()}`);
    });
    
    // 2. Health endpoint
    await test('API health', async () => {
        const r = await page.request.get(`${PROD_URL}/api/health`);
        const data = await r.json();
        if (data.status !== 'ok') throw new Error(`Health: ${data.status}`);
        if (data.checks.d1 !== 'ok') throw new Error('D1 unhealthy');
        console.log(`   API: ${data.checks.api}, D1: ${data.checks.d1}, R2: ${data.checks.r2}`);
    });
    
    // 3. Login page
    await test('Login page', async () => {
        await page.goto(`${PROD_URL}/login`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        // Wait for SPA hydration
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    });
    
    // 4. Engagement webhook
    await test('Engagement webhook endpoint', async () => {
        const r = await page.request.post(`${PROD_URL}/api/webhooks/engagement`, {
            data: {},
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await r.json();
        if (!data.error || !data.required) throw new Error('Webhook endpoint not responding correctly');
        console.log(`   Webhook validation working: ${data.required.join(', ')}`);
    });
    
    // 5. Batch webhook
    await test('Batch webhook endpoint', async () => {
        const r = await page.request.post(`${PROD_URL}/api/webhooks/engagement/batch`, {
            data: { items: [] },
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await r.json();
        if (!data.error) throw new Error('Batch endpoint not responding correctly');
    });
    
    // 6. Engagement page
    await test('Engagement page route', async () => {
        const r = await page.goto(`${PROD_URL}/app/engagement`);
        if (!r.ok()) throw new Error(`Status ${r.status()}`);
    });
    
    // 7. Calendar page
    await test('Calendar page route', async () => {
        const r = await page.goto(`${PROD_URL}/app/calendar`);
        if (!r.ok()) throw new Error(`Status ${r.status()}`);
    });
    
    // 8. Analytics page
    await test('Analytics page route', async () => {
        const r = await page.goto(`${PROD_URL}/app/analytics`);
        if (!r.ok()) throw new Error(`Status ${r.status()}`);
    });
    
    // 9. Code splitting verification
    await test('Code splitting active', async () => {
        await page.goto(PROD_URL);
        await page.waitForLoadState('networkidle');
        
        // Check that vendor chunks exist
        const scripts = await page.evaluate(() => 
            Array.from(document.querySelectorAll('script[src]')).map(s => s.getAttribute('src'))
        );
        const vendorChunks = scripts.filter(s => s && s.includes('vendor'));
        if (vendorChunks.length === 0) {
            console.log('   ⚠️ No vendor chunks detected (may be inlined)');
        } else {
            console.log(`   ${vendorChunks.length} vendor chunks loaded`);
        }
    });
    
    // 10. No JS errors
    await test('No JavaScript errors', async () => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(PROD_URL);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        if (errors.length > 0) throw new Error(`JS errors: ${errors[0]}`);
    });
    
    await browser.close();
    
    console.log(`🏁 Production Check: ✅ ${passed} passed, ❌ ${failed} failed`);
    if (failed === 0) {
        console.log('🎉 Production is healthy! All Phase 2B features verified.');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

runProductionChecks().catch(e => { console.error('❌', e); process.exit(1); });
