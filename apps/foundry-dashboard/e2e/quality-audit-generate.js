#!/usr/bin/env node
/**
 * Quality Audit — Trigger real content generation and evaluate outputs
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const EMAIL = 'e2e-test@foundry.local';
const PASSWORD = 'TestPassword123!';
const CLIENT_ID = 'd0913561-8dca-41ab-80e7-67b8e4fe3429'; // Test Client MVP

async function trpcGet(page, path, input = {}) {
  return page.evaluate(async ({ path, input }) => {
    try {
      const url = `/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`;
      const r = await fetch(url, { credentials: 'include' });
      return await r.json();
    } catch (e) { return { error: e.message }; }
  }, { path, input });
}

async function trpcPost(page, path, input = {}) {
  return page.evaluate(async ({ path, input }) => {
    try {
      const r = await fetch(`/trpc/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      return await r.json();
    } catch (e) { return { error: e.message }; }
  }, { path, input });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function audit() {
  console.log(`🔍 Quality Audit — Real Content Generation\n`);
  console.log(`Target: ${BASE}`);
  console.log(`Client: ${CLIENT_ID}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  console.log('📋 Logging in...');
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  console.log(`   ✅ Logged in\n`);

  // Step 1: Check current pillars
  console.log('📋 Step 1: Checking pillars...');
  const pillars = await trpcGet(page, 'hubs.getPillars', { clientId: CLIENT_ID });
  const pillarList = pillars?.result?.data || [];
  console.log(`   Pillars: ${JSON.stringify(pillarList).substring(0, 500)}`);

  if (!Array.isArray(pillarList) || pillarList.length === 0) {
    console.log('   ⚠️ No pillars found. Need to create approved pillars first.');
    
    // Check if test-setup created them
    const testPillars = await trpcGet(page, 'hubs.getPillars', { clientId: CLIENT_ID });
    console.log(`   Test pillars: ${JSON.stringify(testPillars).substring(0, 300)}`);
    
    // Initialize test data to create pillars
    console.log('\n   Initializing test data...');
    const initResult = await trpcPost(page, 'testSetup.initializeTestData', {});
    console.log(`   Init: ${JSON.stringify(initResult?.result?.data || initResult?.error).substring(0, 300)}`);
    
    // Re-check pillars
    const pillars2 = await trpcGet(page, 'hubs.getPillars', { clientId: CLIENT_ID });
    console.log(`   Pillars after init: ${JSON.stringify(pillars2?.result?.data).substring(0, 300)}`);
  }

  // Step 2: Check existing hubs
  console.log('\n📋 Step 2: Checking existing hubs...');
  const hubs = await trpcGet(page, 'hubs.list', { clientId: CLIENT_ID });
  const hubList = hubs?.result?.data?.hubs || hubs?.result?.data || [];
  console.log(`   Hubs: ${JSON.stringify(hubList).substring(0, 500)}`);

  let hubId;
  
  if (Array.isArray(hubList) && hubList.length > 0) {
    // Check if any hub has spokes
    for (const hub of hubList) {
      console.log(`\n   📦 Hub "${hub.title}" — status: ${hub.status}, spokes: ${hub.spoke_count || hub.total_spokes || '?'}`);
      if (hub.spoke_count > 0 || hub.total_spokes > 0) {
        hubId = hub.id;
      }
    }
  }

  // Step 3: If no hub with spokes, create one and trigger generation
  if (!hubId) {
    console.log('\n📋 Step 3: Creating hub and triggering generation...');
    
    // Use createPillarFirstHub 
    const createResult = await trpcPost(page, 'hubs.createPillarFirstHub', {
      clientId: CLIENT_ID,
      title: 'Quality Audit Test Hub',
      pillarIds: ['test-pillar-catalyst-001', 'test-pillar-core-truth-001'],
    });
    console.log(`   Create result: ${JSON.stringify(createResult?.result?.data || createResult?.error).substring(0, 300)}`);
    
    hubId = createResult?.result?.data?.hubId || createResult?.result?.data?.id;
    
    if (hubId) {
      console.log(`   ✅ Hub created: ${hubId}`);
      
      // Trigger spoke generation
      console.log('   Triggering spoke generation...');
      const genResult = await trpcPost(page, 'hubs.triggerSpokeGeneration', {
        clientId: CLIENT_ID,
        hubId: hubId,
      });
      console.log(`   Generation trigger: ${JSON.stringify(genResult?.result?.data || genResult?.error).substring(0, 300)}`);
      
      // Poll for completion
      console.log('   Waiting for generation...');
      for (let i = 0; i < 30; i++) {
        await sleep(10000); // 10 seconds
        
        const progress = await trpcGet(page, 'hubs.getGenerationProgress', {
          clientId: CLIENT_ID,
          hubId: hubId,
        });
        const data = progress?.result?.data;
        console.log(`   [${(i+1)*10}s] Progress: ${JSON.stringify(data).substring(0, 200)}`);
        
        if (data?.status === 'complete' || data?.status === 'completed' || data?.completed) {
          console.log('   ✅ Generation complete!');
          break;
        }
        if (data?.status === 'failed' || data?.status === 'error') {
          console.log('   ❌ Generation failed');
          break;
        }
      }
    } else {
      console.log('   ❌ Hub creation failed');
    }
  }

  // Step 4: Fetch generated spokes and evaluate
  if (hubId) {
    console.log(`\n📋 Step 4: Fetching generated content from hub ${hubId}...`);
    
    const queue = await trpcGet(page, 'review.getQueue', {
      clientId: CLIENT_ID,
      filter: 'all',
    });
    const spokes = queue?.result?.data?.spokes || queue?.result?.data?.items || queue?.result?.data || [];
    
    console.log(`   Queue result keys: ${JSON.stringify(Object.keys(queue?.result?.data || {}))}`);
    console.log(`   Found: ${Array.isArray(spokes) ? spokes.length : 'N/A'} spokes`);
    
    if (Array.isArray(spokes) && spokes.length > 0) {
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CONTENT QUALITY EVALUATION');
      console.log('='.repeat(80));
      
      const platforms = {};
      let totalG2 = 0, g2Count = 0;
      
      for (const spoke of spokes.slice(0, 12)) {
        const platform = spoke.platform || 'unknown';
        platforms[platform] = (platforms[platform] || 0) + 1;
        if (spoke.g2_score) { totalG2 += spoke.g2_score; g2Count++; }
        
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`📱 ${platform.toUpperCase()} | G2: ${spoke.g2_score || 'N/A'} | G7: ${spoke.g7_score || 'N/A'} | Angle: ${spoke.psychological_angle || 'N/A'}`);
        console.log(`Status: ${spoke.status} | Hub: ${spoke.hub_id?.substring(0, 8)}`);
        console.log(`${'─'.repeat(70)}`);
        console.log(`\n${spoke.content || '[NO CONTENT]'}\n`);
        
        if (spoke.visual_metadata) {
          try {
            const vm = typeof spoke.visual_metadata === 'string' ? JSON.parse(spoke.visual_metadata) : spoke.visual_metadata;
            console.log(`🎨 Archetype: ${vm.archetype || vm.visual_archetype || 'N/A'}`);
            console.log(`   Thumbnail: ${(vm.thumbnail_concept || vm.thumbnailConcept || '').substring(0, 200)}`);
            console.log(`   Image: ${(vm.image_prompt || vm.imagePrompt || '').substring(0, 200)}`);
          } catch {}
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('📊 SUMMARY');
      console.log('='.repeat(80));
      console.log(`Total spokes: ${spokes.length}`);
      console.log(`Platforms: ${JSON.stringify(platforms)}`);
      console.log(`Avg G2 hook score: ${g2Count > 0 ? (totalG2 / g2Count).toFixed(1) : 'N/A'}`);
      console.log(`Status breakdown: ${JSON.stringify(spokes.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}))}`);
    } else {
      console.log(`   Raw result: ${JSON.stringify(queue).substring(0, 500)}`);
    }
  }

  await browser.close();
  console.log('\n🏁 Quality audit complete.');
}

audit().catch(e => { console.error('❌', e); process.exit(1); });
