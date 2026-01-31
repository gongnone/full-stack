#!/usr/bin/env node
/**
 * E2E Quality Flow Test
 * Tests: Login → Content Library (add examples + audience) → Trigger Generation → Audit Output
 */
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const CLIENT_ID = 'test-client-001';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function trpcCall(page, path, input, method = 'GET') {
  return page.evaluate(async ({ path, input, method }) => {
    if (method === 'POST') {
      const r = await fetch(`/trpc/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      });
      return r.json();
    }
    const r = await fetch(`/trpc/${path}?input=${encodeURIComponent(JSON.stringify(input))}`, { credentials: 'include' });
    return r.json();
  }, { path, input, method });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  // 1. Login
  await page.goto(`${BASE}/login`);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.fill('input[type="email"]', 'e2e-test@foundry.local');
  await page.fill('input[type="password"]', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/app/, { timeout: 30000 }).catch(() => {});
  console.log('✅ 1. Logged in\n');

  // 2. Check content library
  const examples = await trpcCall(page, 'contentExamples.list', { clientId: CLIENT_ID });
  const audience = await trpcCall(page, 'contentExamples.getAudience', { clientId: CLIENT_ID });
  console.log(`✅ 2. Content Library: ${(examples?.result?.data || []).length} examples, audience: ${audience?.result?.data?.persona ? 'set' : 'empty'}\n`);

  // 3. Trigger generation
  console.log('🚀 3. Triggering generation...');
  const trigger = await trpcCall(page, 'hubs.triggerSpokeGeneration', { clientId: CLIENT_ID, hubId: '7b129cb0-f5d1-4c74-ae32-e7cc2d07782c' }, 'POST');
  console.log(`   Result: ${trigger?.result?.data?.success ? '✅' : '❌ ' + (trigger?.error?.message || 'failed')}\n`);

  // 4. Wait for generation
  console.log('⏳ 4. Waiting for generation (30s)...');
  await sleep(30000);

  // 5. Fetch all spokes and audit
  const queue = await trpcCall(page, 'review.getQueue', { clientId: CLIENT_ID, limit: 200 });
  const items = queue?.result?.data?.items || [];
  const withContent = items.filter(i => (i.content || '').trim().length > 0);

  console.log(`\n✅ 5. Got ${items.length} spokes (${withContent.length} with content)\n`);

  // Quality audit
  const leakagePatterns = [
    /^here is/i, /^sure/i, /^let me/i, /^i'm ready/i, /^here's/i,
    /^of course/i, /as requested/i, /as an ai/i, /note:/i,
    /here is the regenerated/i,
  ];

  let leakage = 0, g2Total = 0, g7Total = 0, g2n = 0, g7n = 0;
  const statusCounts = {};
  const platformCounts = {};

  for (const item of withContent) {
    const c = (item.content || '').trim();
    if (leakagePatterns.some(p => p.test(c))) leakage++;

    const g2 = item.qualityScores?.g2_hook;
    const g7 = item.qualityScores?.g7_engagement;
    if (g2 != null) { g2Total += g2; g2n++; }
    if (g7 != null) { g7Total += g7; g7n++; }

    statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
  }

  console.log('═══════════════════════════════════════');
  console.log('📊 FULL QUALITY SCORECARD');
  console.log('═══════════════════════════════════════');
  console.log(`Spokes with content: ${withContent.length}`);
  console.log(`G2 Hook Score avg: ${g2n ? (g2Total / g2n).toFixed(1) : 'N/A'} (n=${g2n})`);
  console.log(`G7 Engagement avg: ${g7n ? (g7Total / g7n).toFixed(2) : 'N/A'} (n=${g7n})`);
  console.log(`Prompt leakage: ${leakage}/${withContent.length} (${((leakage / withContent.length) * 100).toFixed(0)}%)`);
  console.log(`Statuses: ${JSON.stringify(statusCounts)}`);
  console.log(`Platforms: ${JSON.stringify(platformCounts)}`);

  // Show 3 best recent spokes
  const sorted = [...withContent].sort((a, b) => (b.qualityScores?.g2_hook || 0) - (a.qualityScores?.g2_hook || 0));
  console.log('\n🏆 TOP 5 SPOKES:');
  for (const s of sorted.slice(0, 5)) {
    console.log(`  [${s.platform}] G2:${s.qualityScores?.g2_hook} G7:${s.qualityScores?.g7_engagement?.toFixed(1)}`);
    console.log(`  "${(s.content || '').substring(0, 160).replace(/\n/g, ' ')}"\n`);
  }

  await browser.close();
  console.log('✅ E2E Quality Flow complete');
}

run().catch(e => { console.error(e); process.exit(1); });
