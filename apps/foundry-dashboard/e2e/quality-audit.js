#!/usr/bin/env node
/**
 * Quality Audit — Full product walkthrough on production
 * Tests the ACTUAL output quality, not just "does it render"
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const EMAIL = 'e2e-test@foundry.local';
const PASSWORD = 'TestPassword123!';

async function audit() {
  console.log(`🔍 Quality Audit — ${BASE}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 1: Login
  console.log('📋 Step 1: Login...');
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForURL(/\/app/, { timeout: 30000 });
    console.log('✅ Logged in\n');
  } catch {
    if (page.url().includes('/app')) {
      console.log('✅ Logged in (slow redirect)\n');
    } else {
      console.log(`❌ Login failed — URL: ${page.url()}`);
      await browser.close();
      return;
    }
  }

  // Step 2: Check dashboard state
  console.log('📋 Step 2: Dashboard overview...');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const dashboardHTML = await page.content();
  
  // Check for clients
  const hasClients = dashboardHTML.includes('client') || dashboardHTML.includes('Client');
  console.log(`   Has clients: ${hasClients}`);
  
  // Step 3: Check existing hubs & spokes
  console.log('\n📋 Step 3: Checking hubs...');
  await page.goto(`${BASE}/app/hubs`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  
  // Get hub list
  const hubsContent = await page.textContent('body');
  console.log(`   Page text (first 500 chars): ${hubsContent?.substring(0, 500)}`);
  
  // Step 4: Check review queue for actual spoke content
  console.log('\n📋 Step 4: Checking review queue for actual content...');
  await page.goto(`${BASE}/app/review`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  
  const reviewContent = await page.textContent('body');
  console.log(`   Review page (first 500 chars): ${reviewContent?.substring(0, 500)}`);

  // Step 5: Check Brand DNA results
  console.log('\n📋 Step 5: Checking Brand DNA...');
  await page.goto(`${BASE}/app/brand-dna`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  
  const brandDnaContent = await page.textContent('body');
  console.log(`   Brand DNA (first 500 chars): ${brandDnaContent?.substring(0, 500)}`);

  // Step 6: Try to find actual generated content via tRPC
  console.log('\n📋 Step 6: Fetching spokes via API...');
  
  // Get client ID first
  const clientData = await page.evaluate(async () => {
    try {
      const r = await fetch('/trpc/onboarding.getClientSetupStatus', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await r.json();
      return data;
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log(`   Client setup: ${JSON.stringify(clientData).substring(0, 300)}`);

  // Get hubs list via tRPC
  const hubsData = await page.evaluate(async () => {
    try {
      const r = await fetch('/trpc/hubs.listHubs?input=%7B%7D', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await r.json();
      return data;
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log(`   Hubs: ${JSON.stringify(hubsData).substring(0, 500)}`);

  // If we have hubs, get spokes
  const hubs = hubsData?.result?.data?.hubs || [];
  if (hubs.length > 0) {
    console.log(`\n   Found ${hubs.length} hub(s). Fetching spokes...`);
    
    for (const hub of hubs.slice(0, 3)) {
      console.log(`\n   📦 Hub: "${hub.title || hub.name}" (${hub.id})`);
      
      const spokesData = await page.evaluate(async (hubId) => {
        try {
          const r = await fetch(`/trpc/review.getSpokesByHub?input=${encodeURIComponent(JSON.stringify({ hubId }))}`, {
            method: 'GET',
            credentials: 'include',
          });
          return await r.json();
        } catch (e) {
          return { error: e.message };
        }
      }, hub.id);
      
      const spokes = spokesData?.result?.data || [];
      console.log(`   ${spokes.length} spoke(s) found`);
      
      // Print first 3 spokes content for quality review
      for (const spoke of (Array.isArray(spokes) ? spokes : []).slice(0, 3)) {
        console.log(`\n   --- Spoke: ${spoke.platform} (G2: ${spoke.g2_score}, G7: ${spoke.g7_score || 'N/A'}) ---`);
        console.log(`   Content:\n${(spoke.content || '').substring(0, 600)}`);
        console.log(`   Visual: ${spoke.visual_metadata ? JSON.stringify(JSON.parse(spoke.visual_metadata)).substring(0, 200) : 'None'}`);
        console.log(`   Status: ${spoke.status}`);
      }
    }
  } else {
    console.log('   ⚠️ No hubs found — need to create one to test content generation');
    
    // Try to create a hub and trigger generation
    console.log('\n📋 Step 7: Creating a test hub to evaluate content quality...');
    
    // Check if we have pillars first
    const pillarsData = await page.evaluate(async () => {
      try {
        const r = await fetch('/trpc/onboarding.getClientSetupStatus', {
          method: 'GET',
          credentials: 'include',
        });
        return await r.json();
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log(`   Setup status: ${JSON.stringify(pillarsData).substring(0, 300)}`);
  }

  // Step 7: Check analytics for real data
  console.log('\n📋 Step 7: Analytics check...');
  await page.goto(`${BASE}/app/analytics`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const analyticsContent = await page.textContent('body');
  console.log(`   Analytics (first 300 chars): ${analyticsContent?.substring(0, 300)}`);

  // Step 8: Check engagement dashboard
  console.log('\n📋 Step 8: Engagement dashboard...');
  await page.goto(`${BASE}/app/engagement`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const engagementContent = await page.textContent('body');
  console.log(`   Engagement (first 300 chars): ${engagementContent?.substring(0, 300)}`);

  // Step 9: Calendar
  console.log('\n📋 Step 9: Calendar...');
  await page.goto(`${BASE}/app/calendar`);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const calendarContent = await page.textContent('body');
  console.log(`   Calendar (first 300 chars): ${calendarContent?.substring(0, 300)}`);

  await browser.close();
  console.log('\n🏁 Quality audit complete.');
}

audit().catch(e => { console.error('❌', e); process.exit(1); });
