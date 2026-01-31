#!/usr/bin/env node
/**
 * Quality Audit v3 — Get client context, create hub, trigger generation, evaluate output
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
  console.log(`🔍 Quality Audit v3 — ${BASE}\n`);
  
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
  console.log(`   ✅ Logged in: ${page.url()}\n`);

  // Get all tRPC router names
  console.log('📋 1. Discovering available endpoints...');
  
  // Get client via the clients list
  const clientsResult = await trpcGet(page, 'clients.list', {});
  console.log(`   clients.list: ${JSON.stringify(clientsResult?.result?.data || clientsResult?.error).substring(0, 300)}`);
  
  // Try getting clients another way
  const sessionResult = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/auth/get-session', { credentials: 'include' });
      return await r.json();
    } catch (e) { return { error: e.message }; }
  });
  console.log(`   Session: ${JSON.stringify(sessionResult).substring(0, 300)}`);

  // Get active client from the app context
  const activeClient = await page.evaluate(async () => {
    try {
      // Try the stored client ID
      const stored = sessionStorage.getItem('foundry_active_client_id') || localStorage.getItem('foundry_active_client_id');
      if (stored) return { source: 'storage', clientId: stored };
      
      // Try listing clients
      const r = await fetch('/trpc/clients.list?input=%7B%7D', { credentials: 'include' });
      const data = await r.json();
      return { source: 'api', data: data?.result?.data };
    } catch (e) { return { error: e.message }; }
  });
  console.log(`   Active client: ${JSON.stringify(activeClient).substring(0, 400)}`);

  // Get the client ID from context
  let clientId;
  const clients = activeClient?.data?.clients || activeClient?.data || [];
  if (Array.isArray(clients) && clients.length > 0) {
    clientId = clients[0].id;
  } else if (activeClient?.clientId) {
    clientId = activeClient.clientId;
  }

  if (!clientId) {
    // Try from the session user
    const userId = sessionResult?.user?.id;
    if (userId) {
      console.log(`   User ID: ${userId}`);
      // Try listing clients for this user directly  
      const clientsById = await page.evaluate(async () => {
        const r = await fetch('/trpc/clients.list?input=%7B%7D', { credentials: 'include' });
        const text = await r.text();
        return text.substring(0, 500);
      });
      console.log(`   Raw clients response: ${clientsById}`);
    }
  }

  if (!clientId) {
    console.log('\n❌ Cannot find client ID. Checking router names...');
    
    // List all router endpoints
    const routerEndpoints = [
      'clients.list', 'clients.getActive', 'clients.getCurrent',
      'onboarding.getStatus', 'onboarding.getProgress',
      'hubs.list', 'hubs.getAll',
      'brandDna.get', 'brandDna.getReport', 'brandDna.getStatus',
      'review.getSpokes', 'review.list',
      'pillars.list', 'pillars.getAll',
      'analytics.getZeroEditRate', 'analytics.getDashboard',
    ];
    
    for (const endpoint of routerEndpoints) {
      const result = await trpcGet(page, endpoint, {});
      const status = result?.error ? `❌ ${result.error?.message?.substring(0, 60) || result.error}` : `✅ ${JSON.stringify(result?.result?.data).substring(0, 80)}`;
      console.log(`   ${endpoint}: ${status}`);
    }
    
    await browser.close();
    return;
  }

  console.log(`\n✅ Client ID: ${clientId}`);
  
  // Get Brand DNA
  console.log('\n📋 2. Brand DNA...');
  const dna = await trpcGet(page, 'brandDna.get', { clientId });
  console.log(`   ${JSON.stringify(dna?.result?.data || dna?.error).substring(0, 500)}`);

  // Get pillars
  console.log('\n📋 3. Pillars...');
  const pillars = await trpcGet(page, 'pillars.list', { clientId });
  console.log(`   ${JSON.stringify(pillars?.result?.data || pillars?.error).substring(0, 500)}`);

  // Get hubs
  console.log('\n📋 4. Hubs...');
  const hubsResult = await trpcGet(page, 'hubs.list', { clientId });
  console.log(`   ${JSON.stringify(hubsResult?.result?.data || hubsResult?.error).substring(0, 500)}`);

  // Get spokes
  console.log('\n📋 5. Spokes...');
  const spokesResult = await trpcGet(page, 'review.getSpokes', { clientId, filter: 'all', limit: 10 });
  const spokes = spokesResult?.result?.data?.spokes || spokesResult?.result?.data || [];
  
  if (Array.isArray(spokes) && spokes.length > 0) {
    console.log(`   Found ${spokes.length} spokes!\n`);
    console.log('='.repeat(80));
    console.log('🎯 CONTENT QUALITY EVALUATION');
    console.log('='.repeat(80));
    
    for (const spoke of spokes.slice(0, 8)) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Platform: ${spoke.platform} | Status: ${spoke.status}`);
      console.log(`G2: ${spoke.g2_score || 'N/A'} | G7: ${spoke.g7_score || 'N/A'} | Angle: ${spoke.psychological_angle || 'N/A'}`);
      console.log(`${'─'.repeat(60)}`);
      console.log(`\n${spoke.content || '[NO CONTENT]'}\n`);
      
      if (spoke.visual_metadata) {
        try {
          const vm = typeof spoke.visual_metadata === 'string' ? JSON.parse(spoke.visual_metadata) : spoke.visual_metadata;
          console.log(`🎨 Archetype: ${vm.archetype || vm.visual_archetype || 'N/A'}`);
          console.log(`   Thumbnail: ${(vm.thumbnail_concept || vm.thumbnailConcept || '').substring(0, 150)}`);
        } catch {}
      }
    }
  } else {
    console.log(`   No spokes found. Raw: ${JSON.stringify(spokesResult).substring(0, 300)}`);
  }

  await browser.close();
  console.log('\n🏁 Quality audit complete.');
}

audit().catch(e => { console.error('❌', e); process.exit(1); });
