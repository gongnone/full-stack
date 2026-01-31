#!/usr/bin/env node
/**
 * Trigger real spoke generation on staging and poll for results
 */
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const EMAIL = 'e2e-test@foundry.local';
const PASSWORD = 'TestPassword123!';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('🚀 Triggering real content generation on staging...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  console.log('✅ Logged in\n');

  // Use the latest hub for test-client-001
  const hubId = 'f82f2052-853b-40a4-b197-cbd77fe08bef'; // Latest E2E Test Hub
  const clientId = 'test-client-001';

  // Trigger spoke generation via tRPC
  console.log(`📋 Triggering generation for hub ${hubId}...`);
  const genResult = await page.evaluate(async ({ clientId, hubId }) => {
    try {
      const r = await fetch('/trpc/hubs.triggerSpokeGeneration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clientId, hubId }),
      });
      return await r.json();
    } catch (e) { return { error: e.message }; }
  }, { clientId, hubId });
  
  console.log(`   Result: ${JSON.stringify(genResult?.result?.data || genResult?.error).substring(0, 500)}\n`);

  if (genResult?.error) {
    // Try creating a new hub first
    console.log('📋 Creating fresh hub via Quick Create...');
    const createResult = await page.evaluate(async ({ clientId }) => {
      try {
        const r = await fetch('/trpc/hubs.createPillarFirstHub', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            clientId,
            title: 'Quality Audit Hub - Real Generation',
            pillarIds: ['test-pillar-catalyst-001', 'test-pillar-core-truth-001', 'test-pillar-proof-001'],
          }),
        });
        return await r.json();
      } catch (e) { return { error: e.message }; }
    }, { clientId });
    console.log(`   Create: ${JSON.stringify(createResult?.result?.data || createResult?.error).substring(0, 500)}`);
    
    const newHubId = createResult?.result?.data?.hubId || createResult?.result?.data?.id;
    if (!newHubId) {
      console.log('❌ Could not create hub');
      await browser.close();
      return;
    }
    
    console.log(`   ✅ Hub created: ${newHubId}`);
    console.log('   Triggering generation...');
    
    const gen2 = await page.evaluate(async ({ clientId, hubId }) => {
      try {
        const r = await fetch('/trpc/hubs.triggerSpokeGeneration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ clientId, hubId }),
        });
        return await r.json();
      } catch (e) { return { error: e.message }; }
    }, { clientId, hubId: newHubId });
    console.log(`   Generation: ${JSON.stringify(gen2?.result?.data || gen2?.error).substring(0, 500)}`);
  }

  // Poll for progress
  console.log('\n📋 Polling generation progress...');
  for (let i = 0; i < 60; i++) {
    await sleep(5000);
    
    const progress = await page.evaluate(async ({ clientId, hubId }) => {
      try {
        const url = `/trpc/hubs.getGenerationProgress?input=${encodeURIComponent(JSON.stringify({ clientId, hubId }))}`;
        const r = await fetch(url, { credentials: 'include' });
        return await r.json();
      } catch (e) { return { error: e.message }; }
    }, { clientId, hubId });
    
    const d = progress?.result?.data;
    if (d) {
      console.log(`   [${(i+1)*5}s] Status: ${d.status} | Completed: ${d.completedSpokes || d.completed || 0}/${d.totalSpokes || d.total || '?'} | Phase: ${d.currentPhase || 'N/A'}`);
      
      if (d.status === 'complete' || d.status === 'completed') {
        console.log('\n✅ Generation complete!');
        break;
      }
      if (d.status === 'failed' || d.status === 'error') {
        console.log(`\n❌ Generation failed: ${d.error || d.message || 'unknown'}`);
        break;
      }
    } else {
      console.log(`   [${(i+1)*5}s] ${JSON.stringify(progress?.error).substring(0, 200)}`);
    }
  }

  // Fetch the actual generated spokes from the review queue
  console.log('\n📋 Fetching generated content...');
  const queue = await page.evaluate(async ({ clientId }) => {
    try {
      const url = `/trpc/review.getQueue?input=${encodeURIComponent(JSON.stringify({ clientId, filter: 'all' }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return await r.json();
    } catch (e) { return { error: e.message }; }
  }, { clientId });

  const spokes = queue?.result?.data?.items || queue?.result?.data?.spokes || queue?.result?.data || [];
  console.log(`   Found ${Array.isArray(spokes) ? spokes.length : 0} spokes in queue`);
  console.log(`   Raw keys: ${JSON.stringify(Object.keys(queue?.result?.data || {}))}`);
  console.log(`   Raw (500 chars): ${JSON.stringify(queue?.result?.data).substring(0, 500)}`);

  if (Array.isArray(spokes) && spokes.length > 0) {
    const realSpokes = spokes.filter(s => !s.content?.startsWith('Test '));
    console.log(`   Real (non-fixture) spokes: ${realSpokes.length}`);
    
    for (const spoke of realSpokes.slice(0, 8)) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📱 ${(spoke.platform || '').toUpperCase()} | G2: ${spoke.g2_score || 'N/A'} | G7: ${spoke.g7_score || 'N/A'}`);
      console.log(`Angle: ${spoke.psychological_angle || 'N/A'} | Status: ${spoke.status}`);
      console.log(`${'─'.repeat(70)}`);
      console.log(`\n${spoke.content || '[NO CONTENT]'}\n`);
    }
  }

  await browser.close();
  console.log('\n🏁 Done.');
}

run().catch(e => { console.error('❌', e); process.exit(1); });
