#!/usr/bin/env node
/**
 * Test Pipeline V2 — Verify gpt-oss-120b Creator + simplified scoring
 */
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const CLIENT_ID = 'test-client-001';

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

  // Use existing hub — startOver to trigger new pipeline
  const hubs = await page.evaluate(async (clientId) => {
    const r = await fetch(`/trpc/hubs.list?input=${encodeURIComponent(JSON.stringify({ clientId }))}`, { credentials: 'include' });
    const data = await r.json();
    return data.result?.data?.items || [];
  }, CLIENT_ID);

  if (!hubs.length) {
    console.log('❌ No hubs found');
    await browser.close();
    return;
  }

  const hubId = hubs[0].id;
  console.log(`📋 Using hub: ${hubId} (${hubs[0].title})`);
  console.log('🔄 Starting over with Pipeline V2...');

  const startOver = await page.evaluate(async ({ clientId, hubId }) => {
    const r = await fetch('/trpc/hubs.startOverSpokeGeneration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ clientId, hubId }),
    });
    return r.json();
  }, { clientId: CLIENT_ID, hubId });
  console.log('StartOver result:', JSON.stringify(startOver?.result?.data || startOver?.error || 'ok'));

  // Trigger generation
  console.log('🚀 Triggering spoke generation (Pipeline V2)...');
  const triggerResult = await page.evaluate(async ({ clientId, hubId }) => {
    const r = await fetch('/trpc/hubs.triggerSpokeGeneration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ clientId, hubId }),
    });
    return r.json();
  }, { clientId: CLIENT_ID, hubId });

  if (triggerResult?.error) {
    console.log('⚠️ Trigger response:', JSON.stringify(triggerResult));
  } else {
    console.log('✅ Generation triggered');
  }

  // Wait for generation — check every 15s for up to 5 minutes
  console.log('\n⏳ Waiting for spokes (gpt-oss-120b may take 30-60s each)...');
  let spokes = [];
  for (let i = 0; i < 20; i++) {
    await sleep(15000);
    
    // Get spokes via review router  
    spokes = await page.evaluate(async ({ clientId, hubId }) => {
      const input = encodeURIComponent(JSON.stringify({ clientId, hubId }));
      const r = await fetch(`/trpc/review.getReviewQueue?input=${input}`, { credentials: 'include' });
      const data = await r.json();
      return data.result?.data?.items || data.result?.data || [];
    }, { clientId: CLIENT_ID, hubId });

    const done = spokes.filter(s => s.status !== 'generating').length;
    const total = spokes.length;
    console.log(`  [${(i+1)*15}s] ${done}/${total} spokes complete`);

    if (total > 0 && done === total) break;
    if (total === 0 && i > 4) {
      console.log('  ⚠️ No spokes found after 75s, checking hub status...');
    }
  }

  if (spokes.length === 0) {
    console.log('❌ No spokes generated. Pipeline may have failed.');
    await browser.close();
    return;
  }

  // Audit results
  console.log('\n' + '='.repeat(60));
  console.log('📊 PIPELINE V2 QUALITY AUDIT');
  console.log('='.repeat(60));

  let leakageCount = 0;
  let totalG2 = 0, totalG7 = 0, g2Count = 0, g7Count = 0;

  const leakagePatterns = [
    /^here is/i, /^sure/i, /^let me/i, /^i'm ready/i, /^here's/i,
    /^of course/i, /^absolutely/i, /^certainly/i, /^great/i,
    /as requested/i, /as an ai/i, /note:/i, /disclaimer/i,
  ];

  for (const spoke of spokes) {
    const q = spoke.qualityScores || {};
    const content = spoke.content?.trim() || '';
    const hasLeakage = leakagePatterns.some(p => p.test(content));
    if (hasLeakage) leakageCount++;

    if (q.g2_hook != null) { totalG2 += q.g2_hook; g2Count++; }
    if (q.g7_engagement != null) { totalG7 += q.g7_engagement; g7Count++; }

    const ql = q.quality_level || '?';
    const emoji = ql === 'high' ? '🟢' : ql === 'medium' ? '🟡' : '🔴';

    console.log(`\n${emoji} [${spoke.platform}] ${spoke.status} | G2:${q.g2_hook ?? '?'} G7:${q.g7_engagement?.toFixed?.(1) ?? '?'} | ${ql}`);
    if (content) {
      console.log(`  "${content.substring(0, 200).replace(/\n/g, ' ')}${content.length > 200 ? '...' : ''}"`);
    }
    if (hasLeakage) console.log('  ⚠️ PROMPT LEAKAGE');
    if (q.polished) console.log('  🔄 Polished');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total spokes: ${spokes.length}`);
  const statuses = spokes.reduce((a, s) => { a[s.status] = (a[s.status]||0)+1; return a; }, {});
  console.log(`Statuses: ${JSON.stringify(statuses)}`);
  console.log(`Avg G2: ${g2Count ? (totalG2/g2Count).toFixed(1) : 'N/A'}`);
  console.log(`Avg G7: ${g7Count ? (totalG7/g7Count).toFixed(1) : 'N/A'}`);
  console.log(`Leakage: ${leakageCount}/${spokes.length} (${spokes.length ? ((leakageCount/spokes.length)*100).toFixed(0) : 0}%)`);
  const quality = spokes.reduce((a, s) => { const q = s.qualityScores?.quality_level || '?'; a[q] = (a[q]||0)+1; return a; }, {});
  console.log(`Quality: ${JSON.stringify(quality)}`);

  await browser.close();
  console.log('\n✅ Done');
}

run().catch(e => { console.error(e); process.exit(1); });
