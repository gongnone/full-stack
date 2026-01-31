#!/usr/bin/env node
/**
 * Fetch generated content from Durable Object for quality review
 */
import { chromium } from '@playwright/test';

const BASE = 'https://foundry-stage.williamjshaw.ca';
const CLIENT_ID = 'test-client-001';

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

  // Try review queue (reads from DO)
  console.log('📋 Fetching review queue...');
  const queue = await page.evaluate(async (clientId) => {
    const url = `/trpc/review.getQueue?input=${encodeURIComponent(JSON.stringify({ clientId, filter: 'all' }))}`;
    const r = await fetch(url, { credentials: 'include' });
    return r.json();
  }, CLIENT_ID);
  
  const data = queue?.result?.data;
  console.log(`Keys: ${JSON.stringify(Object.keys(data || {}))}`);
  
  // Try different data shapes
  const spokes = data?.spokes || data?.items || (Array.isArray(data) ? data : []);
  console.log(`Spokes: ${spokes.length}`);
  
  if (spokes.length === 0) {
    // Try getSortedQueue
    console.log('\n📋 Trying getSortedQueue...');
    const sorted = await page.evaluate(async (clientId) => {
      const url = `/trpc/review.getSortedQueue?input=${encodeURIComponent(JSON.stringify({ clientId, sortBy: 'created_at', limit: 20 }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, CLIENT_ID);
    console.log(`SortedQueue: ${JSON.stringify(sorted?.result?.data || sorted?.error).substring(0, 500)}`);
    
    // Try getFilteredQueue
    console.log('\n📋 Trying getFilteredQueue...');
    const filtered = await page.evaluate(async (clientId) => {
      const url = `/trpc/review.getFilteredQueue?input=${encodeURIComponent(JSON.stringify({ clientId, filter: 'all', limit: 20 }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, CLIENT_ID);
    console.log(`FilteredQueue: ${JSON.stringify(filtered?.result?.data || filtered?.error).substring(0, 500)}`);
    
    // Try getDashboardStats
    console.log('\n📋 Dashboard stats...');
    const stats = await page.evaluate(async (clientId) => {
      const url = `/trpc/review.getDashboardStats?input=${encodeURIComponent(JSON.stringify({ clientId }))}`;
      const r = await fetch(url, { credentials: 'include' });
      return r.json();
    }, CLIENT_ID);
    console.log(`Stats: ${JSON.stringify(stats?.result?.data || stats?.error).substring(0, 500)}`);
    
    // Navigate to hub page to see if spokes render
    console.log('\n📋 Hub page...');
    await page.goto(`${BASE}/app/hubs/9e630576-7faf-4e0f-ad1c-fbfda13386df`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const hubText = await page.textContent('body');
    console.log(`Hub page text:\n${hubText?.substring(0, 1000)}`);
    
    // Navigate to review page
    console.log('\n📋 Review page...');
    await page.goto(`${BASE}/app/review`);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const reviewText = await page.textContent('body');
    console.log(`Review page text:\n${reviewText?.substring(0, 1000)}`);
  }
  
  // Print actual content
  if (spokes.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 AI-GENERATED CONTENT — QUALITY EVALUATION');
    console.log('='.repeat(80));
    
    for (const spoke of spokes) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`📱 ${(spoke.platform || '').toUpperCase()} | G2: ${spoke.g2_score || 'N/A'} | G7: ${spoke.g7_score || 'N/A'}`);
      console.log(`Angle: ${spoke.psychological_angle || 'N/A'} | Status: ${spoke.status}`);
      console.log(`${'─'.repeat(70)}`);
      console.log(`\n${spoke.content || '[NO CONTENT]'}\n`);
      
      if (spoke.visual_metadata) {
        try {
          const vm = typeof spoke.visual_metadata === 'string' ? JSON.parse(spoke.visual_metadata) : spoke.visual_metadata;
          console.log(`🎨 Archetype: ${vm.archetype || vm.visual_archetype || 'N/A'}`);
          console.log(`   Thumbnail: ${(vm.thumbnail_concept || vm.thumbnailConcept || '').substring(0, 200)}`);
          console.log(`   Image prompt: ${(vm.image_prompt || vm.imagePrompt || '').substring(0, 200)}`);
        } catch {}
      }
    }
    
    // Summary
    const platforms = {};
    let totalG2 = 0, g2Count = 0, totalG7 = 0, g7Count = 0;
    for (const s of spokes) {
      platforms[s.platform] = (platforms[s.platform] || 0) + 1;
      if (s.g2_score) { totalG2 += s.g2_score; g2Count++; }
      if (s.g7_score) { totalG7 += s.g7_score; g7Count++; }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log(`Total: ${spokes.length} | Platforms: ${JSON.stringify(platforms)}`);
    console.log(`Avg G2: ${g2Count > 0 ? (totalG2/g2Count).toFixed(1) : 'N/A'} | Avg G7: ${g7Count > 0 ? (totalG7/g7Count).toFixed(1) : 'N/A'}`);
    console.log('='.repeat(80));
  }

  await browser.close();
}

run().catch(e => { console.error('❌', e); process.exit(1); });
