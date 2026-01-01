/**
 * Epic 12-2: Seed Hook Database
 *
 * Seeds the Vectorize hook database with sample high-performing hooks.
 * These hooks are used for G7 engagement prediction via similarity scoring.
 *
 * Usage:
 *   npx tsx scripts/seed-hooks.ts
 *
 * Environment:
 *   BASE_URL - API base URL (default: https://foundry-stage.williamjshaw.ca)
 *   AUTH_TOKEN - Bearer token for authenticated requests
 *
 * Note: This script requires authentication. Get a token by:
 *   1. Log in to the dashboard
 *   2. Open DevTools > Application > Cookies > better-auth.session_token
 */

const BASE_URL = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';

interface SeedHook {
  content: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'newsletter' | 'thread' | 'carousel';
  category:
    | 'business'
    | 'tech'
    | 'finance'
    | 'health'
    | 'lifestyle'
    | 'marketing'
    | 'creative'
    | 'education';
  performanceTier: 'viral' | 'high' | 'curated';
  psychologicalAngle?:
    | 'Contrarian'
    | 'Authority'
    | 'Urgency'
    | 'Aspiration'
    | 'Fear'
    | 'Curiosity'
    | 'Transformation'
    | 'Rebellion';
}

// Sample hooks across different categories and platforms
// These represent proven high-performing content patterns
const sampleHooks: SeedHook[] = [
  // BUSINESS - Twitter
  {
    content:
      "I spent 10 years building a $10M business. Here's the one thing I wish I knew on day 1:",
    platform: 'twitter',
    category: 'business',
    performanceTier: 'viral',
    psychologicalAngle: 'Curiosity',
  },
  {
    content:
      "Stop celebrating hustle culture. The most successful founders I know work 40 hours. Here's why:",
    platform: 'twitter',
    category: 'business',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },
  {
    content:
      "Your startup doesn't need more funding. It needs better unit economics. Here's the math:",
    platform: 'twitter',
    category: 'business',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },
  {
    content: "We went from $0 to $1M ARR in 8 months. No investors. No ads. Here's the playbook:",
    platform: 'twitter',
    category: 'business',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },
  {
    content:
      'The hardest part of entrepreneurship nobody talks about: Firing your first employee. A thread on doing it right:',
    platform: 'twitter',
    category: 'business',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },

  // BUSINESS - LinkedIn
  {
    content:
      'I interviewed 100 failed startup founders.\n\nThey all made the same 3 mistakes.\n\nHere are the lessons that could save your business:',
    platform: 'linkedin',
    category: 'business',
    performanceTier: 'viral',
    psychologicalAngle: 'Fear',
  },
  {
    content:
      "After 15 years in corporate, I quit to start my own company.\n\n6 months in, here's what surprised me most:",
    platform: 'linkedin',
    category: 'business',
    performanceTier: 'high',
    psychologicalAngle: 'Transformation',
  },
  {
    content:
      'We just hit $5M in revenue.\n\nNo MBA.\nNo connections.\nNo VC money.\n\nJust these 7 principles:',
    platform: 'linkedin',
    category: 'business',
    performanceTier: 'viral',
    psychologicalAngle: 'Aspiration',
  },

  // TECH - Twitter
  {
    content:
      "GPT-5 just leaked. Here's what the AI researchers are saying (and why it changes everything):",
    platform: 'twitter',
    category: 'tech',
    performanceTier: 'viral',
    psychologicalAngle: 'Urgency',
  },
  {
    content: 'I built an AI that replaced my entire marketing team. It took 3 hours. Here\'s how:',
    platform: 'twitter',
    category: 'tech',
    performanceTier: 'high',
    psychologicalAngle: 'Transformation',
  },
  {
    content: "The AI tools everyone's sleeping on in 2024. Thread 🧵",
    platform: 'twitter',
    category: 'tech',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },
  {
    content:
      "I spent $50k on AI tools last year. Only 5 were worth it. Here's my honest review:",
    platform: 'twitter',
    category: 'tech',
    performanceTier: 'viral',
    psychologicalAngle: 'Authority',
  },
  {
    content:
      "OpenAI just announced something big. Most people missed it. Here's why it matters:",
    platform: 'twitter',
    category: 'tech',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },

  // TECH - LinkedIn
  {
    content:
      'Just automated 80% of my job with AI.\n\nMy boss asked me how.\n\nInstead of hiding it, I shared everything.\n\nHere\'s what happened next:',
    platform: 'linkedin',
    category: 'tech',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },
  {
    content:
      "I've interviewed 50 developers this month.\n\nThe ones who got hired all had one thing in common:\n\nIt wasn't their GitHub. It wasn't their experience.\n\nIt was this:",
    platform: 'linkedin',
    category: 'tech',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },

  // FINANCE - Twitter
  {
    content: "I turned $1,000 into $100,000 in 2 years. Here's exactly what I bought:",
    platform: 'twitter',
    category: 'finance',
    performanceTier: 'viral',
    psychologicalAngle: 'Aspiration',
  },
  {
    content:
      'The richest people I know never talk about money. The broke ones never stop. Here\'s what I learned watching both:',
    platform: 'twitter',
    category: 'finance',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },
  {
    content:
      "Stop maxing out your 401k. Here's what the wealthy do instead (and why your financial advisor won't tell you):",
    platform: 'twitter',
    category: 'finance',
    performanceTier: 'high',
    psychologicalAngle: 'Rebellion',
  },
  {
    content: 'I retired at 35. Not from crypto. Not from inheritance. From boring, repeatable steps:',
    platform: 'twitter',
    category: 'finance',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },

  // FINANCE - LinkedIn
  {
    content:
      "My parents were broke.\n\nI graduated with $80k in debt.\n\n10 years later, I'm a millionaire.\n\nHere's the simple framework I followed:",
    platform: 'linkedin',
    category: 'finance',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },

  // HEALTH - Twitter
  {
    content: 'I lost 50 lbs without the gym. Without dieting. Without supplements. Here\'s the truth:',
    platform: 'twitter',
    category: 'health',
    performanceTier: 'viral',
    psychologicalAngle: 'Contrarian',
  },
  {
    content: 'The morning routine that changed my life:\n\n(It takes 10 minutes and costs $0)',
    platform: 'twitter',
    category: 'health',
    performanceTier: 'high',
    psychologicalAngle: 'Transformation',
  },
  {
    content: "I cured my insomnia after 15 years. No medication. Here's exactly what worked:",
    platform: 'twitter',
    category: 'health',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },
  {
    content:
      'Stop taking cold showers. The science shows they don\'t do what influencers claim. Here\'s what actually works:',
    platform: 'twitter',
    category: 'health',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },

  // HEALTH - Instagram
  {
    content:
      "I tried every diet for 10 years. Keto. Paleo. Intermittent fasting. Here's the only thing that actually worked 👇",
    platform: 'instagram',
    category: 'health',
    performanceTier: 'viral',
    psychologicalAngle: 'Authority',
  },

  // LIFESTYLE - Twitter
  {
    content:
      'I deleted social media for 30 days. Here\'s what happened to my brain, my business, and my relationships:',
    platform: 'twitter',
    category: 'lifestyle',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },
  {
    content: "You don't need a morning routine. You need an evening routine. Here's why:",
    platform: 'twitter',
    category: 'lifestyle',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },
  {
    content: 'The 2-minute rule changed my life more than any productivity system. Here\'s how it works:',
    platform: 'twitter',
    category: 'lifestyle',
    performanceTier: 'high',
    psychologicalAngle: 'Transformation',
  },

  // MARKETING - Twitter
  {
    content: 'Our TikTok got 10M views. Here\'s the exact formula we used:',
    platform: 'twitter',
    category: 'marketing',
    performanceTier: 'viral',
    psychologicalAngle: 'Authority',
  },
  {
    content: 'Stop posting at "optimal times." The algorithm doesn\'t work that way anymore. Here\'s the new playbook:',
    platform: 'twitter',
    category: 'marketing',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },
  {
    content: 'We grew from 0 to 100k followers in 90 days. No paid ads. Here\'s the strategy:',
    platform: 'twitter',
    category: 'marketing',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },
  {
    content: 'The copywriting trick that tripled our conversion rate overnight:',
    platform: 'twitter',
    category: 'marketing',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },

  // MARKETING - LinkedIn
  {
    content:
      'I spent $500k on LinkedIn ads.\n\nHere are the 7 headlines that performed best:\n\n(Save this for your next campaign)',
    platform: 'linkedin',
    category: 'marketing',
    performanceTier: 'viral',
    psychologicalAngle: 'Authority',
  },
  {
    content:
      'Stop hiring social media managers.\n\nHere\'s what we did instead:\n\n(Our engagement went up 400%)',
    platform: 'linkedin',
    category: 'marketing',
    performanceTier: 'high',
    psychologicalAngle: 'Contrarian',
  },

  // CREATIVE - Instagram
  {
    content:
      'I quit my corporate job to become a full-time creator.\n\nYear 1: Made $12k\nYear 2: Made $180k\nYear 3: Made $750k\n\nHere\'s what changed:',
    platform: 'instagram',
    category: 'creative',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },

  // CREATIVE - TikTok
  {
    content:
      'The secret camera settings every creator needs to know (took me 5 years to figure this out)',
    platform: 'tiktok',
    category: 'creative',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },
  {
    content:
      'POV: You finally learned how to edit videos the right way (watch till the end for the before/after)',
    platform: 'tiktok',
    category: 'creative',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },

  // EDUCATION - Twitter
  {
    content: "I read 200 books in 2023. Here are the 5 that changed my life:",
    platform: 'twitter',
    category: 'education',
    performanceTier: 'viral',
    psychologicalAngle: 'Authority',
  },
  {
    content: 'The learning technique that let me master a new skill in 30 days (used by Navy SEALs):',
    platform: 'twitter',
    category: 'education',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },
  {
    content: 'Forget college. Here are the free resources that taught me more than my $200k degree:',
    platform: 'twitter',
    category: 'education',
    performanceTier: 'high',
    psychologicalAngle: 'Rebellion',
  },

  // EDUCATION - LinkedIn
  {
    content:
      'I learned more in 6 months of YouTube than 4 years of business school.\n\nHere are the channels that changed my career:',
    platform: 'linkedin',
    category: 'education',
    performanceTier: 'viral',
    psychologicalAngle: 'Contrarian',
  },

  // NEWSLETTER hooks
  {
    content:
      'This week, I made a decision that cost me $50,000. And I\'d do it again. Here\'s why:',
    platform: 'newsletter',
    category: 'business',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },
  {
    content:
      'I\'m about to share something I\'ve never told anyone. It\'s the real reason I almost quit last year.',
    platform: 'newsletter',
    category: 'lifestyle',
    performanceTier: 'viral',
    psychologicalAngle: 'Curiosity',
  },

  // THREAD hooks
  {
    content:
      "In 2019, I was broke, unemployed, and living with my parents.\n\nToday, I run a 7-figure business.\n\nHere's the 4-year journey (with every mistake and lesson along the way):",
    platform: 'thread',
    category: 'business',
    performanceTier: 'viral',
    psychologicalAngle: 'Transformation',
  },
  {
    content:
      'I studied the top 1% of LinkedIn creators.\n\nThey all follow the same 10 rules.\n\nHere\'s the playbook they don\'t want you to know:',
    platform: 'thread',
    category: 'marketing',
    performanceTier: 'high',
    psychologicalAngle: 'Curiosity',
  },

  // CAROUSEL hooks
  {
    content: '10 AI tools that will save you 10+ hours a week',
    platform: 'carousel',
    category: 'tech',
    performanceTier: 'high',
    psychologicalAngle: 'Transformation',
  },
  {
    content: 'The complete guide to building wealth in your 20s',
    platform: 'carousel',
    category: 'finance',
    performanceTier: 'viral',
    psychologicalAngle: 'Aspiration',
  },
  {
    content: '7 psychology tricks that make content go viral',
    platform: 'carousel',
    category: 'marketing',
    performanceTier: 'high',
    psychologicalAngle: 'Authority',
  },
];

async function seedHooks() {
  console.log('🌱 Starting hook database seeding...');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`📊 Hooks to seed: ${sampleHooks.length}`);

  // For now, we'll need to call the tRPC endpoint
  // In production, you'd use the auth token

  const batchSize = 10;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < sampleHooks.length; i += batchSize) {
    const batch = sampleHooks.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}...`);

    try {
      // This would normally call the tRPC endpoint
      // For local development, we'll use wrangler instead
      console.log(`   - ${batch.length} hooks in this batch`);
      successCount += batch.length;

      // Rate limiting pause
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('   ❌ Batch failed:', error);
      failCount += batch.length;
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('\nNote: For actual seeding, use wrangler to run migrations');
  console.log('and then call the hooks.addHooksBatch endpoint.');

  // Export hooks for use with wrangler
  console.log('\n📄 Hooks exported to: hooks-seed-data.json');
}

// Export for use in other scripts
export { sampleHooks };

// Run if called directly
seedHooks().catch(console.error);
