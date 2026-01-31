#!/usr/bin/env node
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const CLIENT_ID = 'test-client-001';
const HUB_ID = '9e630576-7faf-4e0f-ad1c-fbfda13386df';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.fill('input[type="email"]', 'e2e-test@foundry.local');
  await page.fill('input[type="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  console.log('✅ Logged in\n');

  // Trigger generation
  console.log('📋 Triggering spoke generation...');
  const gen = await page.evaluate(async ({ clientId, hubId }) => {
    const r = await fetch('/trpc/hubs.triggerSpokeGeneration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ clientId, hubId }),
    });
    return r.json();
  }, { clientId: CLIENT_ID, hubId: HUB_ID });
  
  console.log(`Result: ${JSON.stringify(gen?.result?.data || gen?.error).substring(0, 500)}\n`);

  if (gen?.result?.data?.success) {
    console.log(`✅ Workflow started: ${gen.result.data.workflowInstanceId}`);
    
    // Poll progress
    for (let i = 0; i < 60; i++) {
      await sleep(10000);
      
      const progress = await page.evaluate(async ({ clientId, hubId }) => {
        const url = `/trpc/hubs.getGenerationProgress?input=${encodeURIComponent(JSON.stringify({ clientId, hubId }))}`;
        const r = await fetch(url, { credentials: 'include' });
        return r.json();
      }, { clientId: CLIENT_ID, hubId: HUB_ID });
      
      const d = progress?.result?.data;
      const elapsed = `${(i+1)*10}s`;
      
      if (d?.completedSpokes !== undefined) {
        console.log(`[${elapsed}] ${d.completedSpokes}/${d.totalSpokes} spokes | status: ${d.status || 'running'} | phase: ${d.currentPhase || '-'}`);
      } else {
        console.log(`[${elapsed}] ${JSON.stringify(d || progress?.error).substring(0, 200)}`);
      }
      
      if (d?.status === 'complete' || d?.status === 'completed' || d?.completedSpokes >= d?.totalSpokes) {
        console.log('\n✅ GENERATION COMPLETE!');
        break;
      }
    }
    
    // Fetch generated spokes
    console.log('\n📋 Fetching generated content from Durable Object...');
    // The review queue reads from DO, not D1
    const queue = await page.evaluate(async ({ clientId }) => {
      const url = `/trpc/review.getQueue?input=${encodeURIComponent(JSON.stringify({ clientId, filter: 'all' }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, { clientId: CLIENT_ID });
    
    console.log(`Queue keys: ${JSON.stringify(Object.keys(queue?.result?.data || {}))}`);
    console.log(`Queue (500): ${JSON.stringify(queue?.result?.data).substring(0, 500)}`);
    
    // Also try getSortedQueue
    const sorted = await page.evaluate(async ({ clientId }) => {
      const url = `/trpc/review.getSortedQueue?input=${encodeURIComponent(JSON.stringify({ clientId, sortBy: 'g7_score', limit: 10 }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, { clientId: CLIENT_ID });
    
    console.log(`\nSorted queue: ${JSON.stringify(sorted?.result?.data || sorted?.error).substring(0, 500)}`);
    
    // Try getting spokes directly from hub page
    await page.goto(`${BASE}/app/hubs/${HUB_ID}`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const hubContent = await page.textContent('body');
    console.log(`\nHub page (500): ${hubContent?.substring(0, 500)}`);
    
  } else {
    console.log('❌ Generation trigger failed');
  }

  await browser.close();
}

run().catch(e => { console.error('❌', e); process.exit(1); });
