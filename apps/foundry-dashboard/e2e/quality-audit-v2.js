#!/usr/bin/env node
/**
 * Quality Audit v2 — Fetch actual generated content and evaluate
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const EMAIL = 'e2e-test@foundry.local';
const PASSWORD = 'TestPassword123!';

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

async function audit() {
  console.log(`🔍 Quality Audit v2 — ${BASE}\n`);
  
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
  console.log(`   URL: ${page.url()}\n`);

  // 1. Get hubs
  console.log('📋 1. Fetching hubs...');
  const hubsResult = await trpcGet(page, 'hubs.list', {});
  const hubs = hubsResult?.result?.data?.hubs || hubsResult?.result?.data || [];
  console.log(`   Result keys: ${JSON.stringify(Object.keys(hubsResult?.result?.data || {}))}`);
  console.log(`   Hubs found: ${Array.isArray(hubs) ? hubs.length : 'N/A'}`);
  
  if (Array.isArray(hubs)) {
    for (const hub of hubs.slice(0, 5)) {
      console.log(`   📦 "${hub.title || hub.name}" — pillars: ${hub.pillar_count || '?'}, spokes: ${hub.spoke_count || hub.total_spokes || '?'}, status: ${hub.status}`);
    }
  }

  // 2. Get review spokes (all pending)
  console.log('\n📋 2. Fetching review queue...');
  const reviewResult = await trpcGet(page, 'review.getSpokes', { filter: 'all', limit: 20 });
  const spokes = reviewResult?.result?.data?.spokes || reviewResult?.result?.data || [];
  console.log(`   Result keys: ${JSON.stringify(Object.keys(reviewResult?.result?.data || {}))}`);
  console.log(`   Spokes found: ${Array.isArray(spokes) ? spokes.length : 'N/A'}`);

  // 3. If we have spokes, evaluate quality
  if (Array.isArray(spokes) && spokes.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONTENT QUALITY EVALUATION');
    console.log('='.repeat(80));
    
    for (const spoke of spokes.slice(0, 10)) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Platform: ${spoke.platform} | Status: ${spoke.status}`);
      console.log(`G2 Hook Score: ${spoke.g2_score || 'N/A'} | G7 Engagement: ${spoke.g7_score || 'N/A'}`);
      console.log(`Psych Angle: ${spoke.psychological_angle || 'N/A'}`);
      console.log(`${'─'.repeat(60)}`);
      console.log(`\n${spoke.content || '[NO CONTENT]'}\n`);
      
      if (spoke.visual_metadata) {
        try {
          const vm = JSON.parse(spoke.visual_metadata);
          console.log(`🎨 Visual: archetype="${vm.archetype || vm.visual_archetype}", thumbnail="${(vm.thumbnail_concept || vm.thumbnailConcept || '').substring(0, 100)}"`);
          console.log(`   Image prompt: "${(vm.image_prompt || vm.imagePrompt || '').substring(0, 150)}"`);
        } catch { console.log(`🎨 Visual: ${spoke.visual_metadata.substring(0, 200)}`); }
      }
    }
  } else {
    console.log('\n⚠️ No spokes found in review queue.');
    
    // Try fetching from spokes router directly
    console.log('\n📋 3. Trying spokes.list...');
    const spokesResult = await trpcGet(page, 'spokes.list', { limit: 20 });
    console.log(`   Result: ${JSON.stringify(spokesResult).substring(0, 500)}`);
  }

  // 4. Get Brand DNA report
  console.log('\n📋 4. Brand DNA report...');
  const brandDnaResult = await trpcGet(page, 'brandDna.getReport', {});
  const report = brandDnaResult?.result?.data;
  if (report) {
    console.log('\n' + '='.repeat(80));
    console.log('🧬 BRAND DNA REPORT');
    console.log('='.repeat(80));
    console.log(`   Voice Archetype: ${report.voice_archetype || report.voiceArchetype || 'N/A'}`);
    console.log(`   Strength Score: ${report.strength_score || report.strengthScore || 'N/A'}`);
    console.log(`   Core Values: ${report.core_values || report.coreValues || 'N/A'}`);
    console.log(`   Target Audience: ${report.target_audience || report.targetAudience || 'N/A'}`);
    console.log(`   Key Themes: ${report.key_themes || report.keyThemes || 'N/A'}`);
    console.log(`   Signature Patterns: ${(report.signature_patterns || report.signaturePatterns || '').substring(0, 300)}`);
    console.log(`   Emotional Triggers: ${report.emotional_triggers || report.emotionalTriggers || 'N/A'}`);
  } else {
    console.log(`   No report: ${JSON.stringify(brandDnaResult).substring(0, 300)}`);
  }

  // 5. Get zero-edit rate / analytics
  console.log('\n📋 5. Analytics...');
  const analyticsResult = await trpcGet(page, 'analytics.getZeroEditRate', { periodDays: 30 });
  console.log(`   Zero-edit rate: ${JSON.stringify(analyticsResult?.result?.data).substring(0, 200)}`);

  // 6. Get pillars
  console.log('\n📋 6. Pillars...');
  const pillarsResult = await trpcGet(page, 'pillars.list', {});
  const pillars = pillarsResult?.result?.data || [];
  if (Array.isArray(pillars)) {
    for (const p of pillars) {
      console.log(`   📌 "${p.title}" — ${p.description || 'no desc'}`);
    }
  } else {
    console.log(`   Result: ${JSON.stringify(pillarsResult).substring(0, 300)}`);
  }

  await browser.close();
  console.log('\n🏁 Quality audit complete.');
}

audit().catch(e => { console.error('❌', e); process.exit(1); });
