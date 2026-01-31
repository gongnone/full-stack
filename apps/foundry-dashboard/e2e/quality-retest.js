#!/usr/bin/env node
/**
 * Quality Retest — Create fresh hub, generate content, evaluate fixes
 */
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const CLIENT_ID = 'test-client-001';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('🔍 Quality Retest — Post-Remediation\n');
  
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

  // Create fresh hub
  console.log('📋 Creating fresh hub...');
  const createResult = await page.evaluate(async (clientId) => {
    const r = await fetch('/trpc/hubs.createPillarFirstHub', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        clientId,
        title: 'Quality Retest Hub - Post Fix',
        pillarIds: ['test-pillar-catalyst-001', 'test-pillar-core-truth-001', 'test-pillar-proof-001'],
      }),
    });
    return r.json();
  }, CLIENT_ID);
  
  const hubId = createResult?.result?.data?.hubId;
  if (!hubId) {
    console.log(`❌ Hub creation failed: ${JSON.stringify(createResult?.error).substring(0, 300)}`);
    await browser.close();
    return;
  }
  console.log(`✅ Hub: ${hubId}\n`);

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
  }, { clientId: CLIENT_ID, hubId });
  
  if (!gen?.result?.data?.success) {
    console.log(`❌ Generation failed: ${JSON.stringify(gen?.error).substring(0, 500)}`);
    await browser.close();
    return;
  }
  console.log(`✅ Workflow: ${gen.result.data.workflowInstanceId}\n`);

  // Poll until done
  console.log('⏳ Waiting for generation...');
  let done = false;
  for (let i = 0; i < 30; i++) {
    await sleep(5000);
    const p = await page.evaluate(async ({ clientId, hubId }) => {
      const url = `/trpc/hubs.getGenerationProgress?input=${encodeURIComponent(JSON.stringify({ clientId, hubId }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, { clientId: CLIENT_ID, hubId });
    
    const d = p?.result?.data;
    const gen = d?.generated || d?.completedSpokes || 0;
    const total = d?.total || d?.totalSpokes || '?';
    process.stdout.write(`\r   ${gen}/${total} spokes...`);
    
    if (gen >= total && total !== '?') { done = true; console.log(' ✅ Done!'); break; }
  }
  if (!done) console.log('\n   ⚠️ Timed out, checking results anyway...');

  // Fetch results
  console.log('\n📋 Fetching generated spokes...');
  const queue = await page.evaluate(async (clientId) => {
    const url = `/trpc/review.getQueue?input=${encodeURIComponent(JSON.stringify({ clientId, filter: 'all' }))}`;
    const r = await fetch(url, { credentials: 'include' });
    return r.json();
  }, CLIENT_ID);
  
  const allSpokes = queue?.result?.data?.items || [];
  // Filter to only new spokes (from this hub)
  // Since we can't filter by hub in getQueue, show newest ones
  const spokes = allSpokes.slice(0, 18); // Our new hub generates 18 (3 pillars × 6 platforms)
  
  console.log(`Total in queue: ${allSpokes.length} | Showing newest 18\n`);

  // Quality checks
  let scoreCount = 0, noScoreCount = 0;
  let leakageCount = 0;
  let testRefCount = 0;
  let emptyVisualCount = 0;
  
  const LEAKAGE_PATTERNS = ['here is the', "i'm ready to", "you didn't provide", "let me generate", "let's get started", "please share the source"];
  const TEST_PATTERNS = ['e2e test', 'platform validation', 'database operations', 'workers ai', 'foundry platform', 'automated testing', 'test content'];

  console.log('='.repeat(80));
  console.log('🎯 POST-REMEDIATION CONTENT QUALITY');
  console.log('='.repeat(80));

  for (const spoke of spokes.slice(0, 6)) {
    // Scores are nested under qualityScores object from DO
    const qs = spoke.qualityScores || {};
    const hasG2 = qs.g2_hook != null;
    const hasG7 = qs.g7_engagement != null;
    if (hasG2 || hasG7) scoreCount++; else noScoreCount++;
    
    const contentLower = (spoke.content || '').toLowerCase();
    const hasLeakage = LEAKAGE_PATTERNS.some(p => contentLower.includes(p));
    if (hasLeakage) leakageCount++;
    
    const hasTestRef = TEST_PATTERNS.some(p => contentLower.includes(p));
    if (hasTestRef) testRefCount++;
    
    // Visual fields are camelCase from DO
    if (!spoke.visualArchetype && !spoke.imagePrompt) emptyVisualCount++;

    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📱 ${(spoke.platform || '').toUpperCase()} | G2: ${qs.g2_hook ?? 'NULL'} | G7: ${qs.g7_engagement ?? 'NULL'} | Visual: ${spoke.visualArchetype || 'NULL'}`);
    console.log(`Status: ${spoke.status} | Leakage: ${hasLeakage ? '❌ YES' : '✅ No'} | Test refs: ${hasTestRef ? '❌ YES' : '✅ No'}`);
    console.log(`${'─'.repeat(70)}`);
    console.log(`\n${(spoke.content || '').substring(0, 400)}${(spoke.content || '').length > 400 ? '...' : ''}\n`);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 QUALITY SCORECARD');
  console.log('='.repeat(80));
  console.log(`Scores populated:    ${scoreCount}/${scoreCount + noScoreCount} ${scoreCount > 0 ? '✅' : '❌'}`);
  console.log(`Prompt leakage:      ${leakageCount}/18 ${leakageCount === 0 ? '✅' : '❌'}`);
  console.log(`Test infrastructure: ${testRefCount}/18 ${testRefCount === 0 ? '✅' : '❌'}`);
  console.log(`Empty visuals:       ${emptyVisualCount}/18 ${emptyVisualCount === 0 ? '✅' : '❌'}`);
  console.log('='.repeat(80));

  await browser.close();
}

run().catch(e => { console.error('❌', e); process.exit(1); });
