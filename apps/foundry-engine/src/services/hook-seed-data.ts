/**
 * Hook Seed Data - Epic 12-2
 *
 * High-performing hooks curated from top content creators.
 * These serve as the initial training data for G7 engagement prediction.
 */

import type { HookData } from './hook-database';

// Helper to analyze hook content
function analyzeHook(content: string): Pick<HookData, 'wordCount' | 'characterCount' | 'hasQuestion' | 'hasNumbers' | 'hasCta'> {
  return {
    wordCount: content.split(/\s+/).length,
    characterCount: content.length,
    hasQuestion: content.includes('?'),
    hasNumbers: /\d/.test(content),
    hasCta: /\b(click|get|grab|download|join|sign up|subscribe|follow|share|comment|save|try|start|learn|discover)\b/i.test(content),
  };
}

// Create hook with auto-analysis
function createHook(
  id: string,
  content: string,
  platform: string,
  category: string,
  tier: 'viral' | 'high' | 'curated' | 'community',
  extras: Partial<HookData> = {}
): HookData {
  return {
    id,
    content,
    platform,
    category,
    performanceTier: tier,
    ...analyzeHook(content),
    source: 'seed_data',
    ...extras,
  };
}

// =====================================
// TWITTER HOOKS (High-performing tweets)
// =====================================

const twitterHooks: HookData[] = [
  // Business & Entrepreneurship
  createHook('tw_biz_001', "I spent $50,000 on business courses. Here's what actually works:", 'twitter', 'business', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Authority' }),
  createHook('tw_biz_002', "Most people think they need more ideas. They don't. They need more execution.", 'twitter', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_biz_003', "The biggest lie in entrepreneurship? \"Follow your passion.\"", 'twitter', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Contrarian' }),
  createHook('tw_biz_004', "I've hired 200+ people. Here's what I look for in the first 30 seconds:", 'twitter', 'business', 'viral', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('tw_biz_005', "Your network is not your net worth. Your skills are.", 'twitter', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_biz_006', "Built a $1M business in 12 months. The strategy is embarrassingly simple:", 'twitter', 'business', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('tw_biz_007', "Stop trying to be interesting. Start trying to be interested.", 'twitter', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Wisdom' }),
  createHook('tw_biz_008', "The fastest way to grow? Help someone else grow first.", 'twitter', 'business', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Wisdom' }),
  createHook('tw_biz_009', "99% of business problems are people problems in disguise.", 'twitter', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Insight' }),
  createHook('tw_biz_010', "The best entrepreneurs I know are the laziest. Here's why that works:", 'twitter', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),

  // Tech & AI
  createHook('tw_tech_001', "AI won't replace you. Someone using AI will.", 'twitter', 'tech', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Urgency' }),
  createHook('tw_tech_002', "I just automated my entire workflow with 5 tools. Total cost: $0", 'twitter', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('tw_tech_003', "ChatGPT is not the future. Here's what's actually coming:", 'twitter', 'tech', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Contrarian' }),
  createHook('tw_tech_004', "The code that changed everything was only 12 lines.", 'twitter', 'tech', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Curiosity' }),
  createHook('tw_tech_005', "Every developer needs to know this debugging trick:", 'twitter', 'tech', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Value' }),
  createHook('tw_tech_006', "I've reviewed 1000+ GitHub profiles. 90% make this mistake:", 'twitter', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('tw_tech_007', "Unpopular opinion: Most \"10x developers\" are just better at saying no.", 'twitter', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_tech_008', "The best code I ever wrote was the code I deleted.", 'twitter', 'tech', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Wisdom' }),
  createHook('tw_tech_009', "Stop learning new frameworks. Master this one thing instead:", 'twitter', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_tech_010', "My side project just hit 100k users. Here's the ugly truth:", 'twitter', 'tech', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),

  // Finance
  createHook('tw_fin_001', "I lost $100k in the stock market. Here's what it taught me:", 'twitter', 'finance', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('tw_fin_002', "The richest people I know have the most boring portfolios.", 'twitter', 'finance', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_fin_003', "Stop budgeting. Start earning more. Here's how:", 'twitter', 'finance', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Contrarian' }),
  createHook('tw_fin_004', "Your salary is not your wealth. Your assets are.", 'twitter', 'finance', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Wisdom' }),
  createHook('tw_fin_005', "I read every Warren Buffett letter. The secret isn't what you think:", 'twitter', 'finance', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),

  // Marketing
  createHook('tw_mkt_001', "Your content isn't bad. Your hooks are.", 'twitter', 'marketing', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Direct' }),
  createHook('tw_mkt_002', "I've written 10,000+ tweets. Here are the 5 formats that work:", 'twitter', 'marketing', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Authority' }),
  createHook('tw_mkt_003', "The best marketing doesn't feel like marketing.", 'twitter', 'marketing', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Wisdom' }),
  createHook('tw_mkt_004', "Stop trying to go viral. Start trying to be valuable.", 'twitter', 'marketing', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_mkt_005', "The headline is 80% of your content's success. Here's why:", 'twitter', 'marketing', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Data' }),

  // Lifestyle & Productivity
  createHook('tw_life_001', "I wake up at 5am. But that's not why I'm successful.", 'twitter', 'lifestyle', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_life_002', "Your morning routine is overrated. Your evening routine isn't.", 'twitter', 'lifestyle', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('tw_life_003', "The most productive people aren't busy. They're focused.", 'twitter', 'lifestyle', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Wisdom' }),
  createHook('tw_life_004', "I deleted social media for 30 days. Here's what changed:", 'twitter', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('tw_life_005', "Stop optimizing your calendar. Start optimizing your energy.", 'twitter', 'lifestyle', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),

  // Health
  createHook('tw_health_001', "I lost 50 lbs without counting calories. The secret is boring:", 'twitter', 'health', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('tw_health_002', "The gym won't fix your mental health. But it helps. Here's how:", 'twitter', 'health', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Nuanced' }),
  createHook('tw_health_003', "Sleep is the most underrated performance enhancer.", 'twitter', 'health', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Wisdom' }),
  createHook('tw_health_004', "Your diet doesn't need to be perfect. It needs to be consistent.", 'twitter', 'health', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Practical' }),
  createHook('tw_health_005', "Walking is the most underrated exercise. No debate.", 'twitter', 'health', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
];

// =====================================
// LINKEDIN HOOKS (Professional content)
// =====================================

const linkedinHooks: HookData[] = [
  // Business & Leadership
  createHook('li_biz_001', "I fired our top performer yesterday. Here's why it was the right call.", 'linkedin', 'business', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('li_biz_002', "After interviewing 500+ candidates, I've learned that skills are overrated.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('li_biz_003', "The best leaders I know ask this one question every day:", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Curiosity' }),
  createHook('li_biz_004', "Our company failed. But it taught me more than any success ever could.", 'linkedin', 'business', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Vulnerability' }),
  createHook('li_biz_005', "Stop hiring for culture fit. Start hiring for culture add.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('li_biz_006', "The meeting that changed everything wasn't a meeting at all.", 'linkedin', 'business', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Curiosity' }),
  createHook('li_biz_007', "My mentor gave me advice that seemed crazy. 5 years later, I understand.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Story' }),
  createHook('li_biz_008', "The org chart is a lie. Here's how work actually gets done:", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('li_biz_009', "Remote work isn't about location. It's about trust.", 'linkedin', 'business', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Insight' }),
  createHook('li_biz_010', "The most valuable skill in 2024? It's not what LinkedIn tells you.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),

  // Career
  createHook('li_career_001', "I turned down a $300K offer. Here's what I chose instead:", 'linkedin', 'business', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('li_career_002', "Your resume is not your career. Your reputation is.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Wisdom' }),
  createHook('li_career_003', "The best career advice I ever received was the hardest to accept.", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Curiosity' }),
  createHook('li_career_004', "I made a lateral move. Everyone thought I was crazy. Here's what happened:", 'linkedin', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Story' }),
  createHook('li_career_005', "Stop networking. Start contributing.", 'linkedin', 'business', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),

  // Tech Leadership
  createHook('li_tech_001', "We rewrote our entire codebase. It was a mistake. Here's why:", 'linkedin', 'tech', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('li_tech_002', "The best engineers I manage don't write the most code.", 'linkedin', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('li_tech_003', "Tech debt isn't a bug. It's a feature of fast-moving teams.", 'linkedin', 'tech', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Contrarian' }),
  createHook('li_tech_004', "I've scaled 3 engineering teams from 5 to 50. The pattern is always the same:", 'linkedin', 'tech', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('li_tech_005', "The stack doesn't matter. The team does.", 'linkedin', 'tech', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Wisdom' }),

  // Marketing & Sales
  createHook('li_mkt_001', "Our marketing budget is $0. Here's how we got to $10M ARR:", 'linkedin', 'marketing', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('li_mkt_002', "The best salespeople don't sell. They solve.", 'linkedin', 'marketing', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Wisdom' }),
  createHook('li_mkt_003', "I analyzed 1,000 cold emails. Only 3 patterns work:", 'linkedin', 'marketing', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('li_mkt_004', "Content marketing isn't about content. It's about consistency.", 'linkedin', 'marketing', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Insight' }),
  createHook('li_mkt_005', "Stop creating content. Start creating conversations.", 'linkedin', 'marketing', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
];

// =====================================
// TIKTOK/INSTAGRAM HOOKS (Short-form)
// =====================================

const shortFormHooks: HookData[] = [
  // Attention-grabbing openers
  createHook('sf_001', "POV: You just discovered the hack that took me 10 years to learn", 'tiktok', 'lifestyle', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('sf_002', "Wait for it... this changes everything", 'tiktok', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Curiosity' }),
  createHook('sf_003', "Nobody talks about this but...", 'tiktok', 'lifestyle', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Secret' }),
  createHook('sf_004', "The algorithm doesn't want you to see this", 'tiktok', 'marketing', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Forbidden' }),
  createHook('sf_005', "I was today years old when I learned...", 'tiktok', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Discovery' }),
  createHook('sf_006', "This is your sign to finally...", 'tiktok', 'lifestyle', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Motivation' }),
  createHook('sf_007', "Storytime: How I went from broke to...", 'tiktok', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('sf_008', "Things that just hit different:", 'tiktok', 'lifestyle', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Relatable' }),
  createHook('sf_009', "Controversial opinion but hear me out...", 'tiktok', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Contrarian' }),
  createHook('sf_010', "Watch till the end... you won't believe the result", 'tiktok', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Curiosity' }),

  // Business/Hustle
  createHook('sf_biz_001', "Side hustle ideas that actually work in 2024:", 'tiktok', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('sf_biz_002', "How I made my first $1000 online (and you can too):", 'tiktok', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('sf_biz_003', "Your 9-5 is training you for this skill:", 'tiktok', 'business', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Reframe' }),
  createHook('sf_biz_004', "Rich people don't work harder. They do this instead:", 'tiktok', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Secret' }),
  createHook('sf_biz_005', "The passive income strategy everyone's missing:", 'tiktok', 'finance', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Secret' }),

  // Health & Wellness
  createHook('sf_health_001', "Day 1 of trying this viral morning routine:", 'tiktok', 'health', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Story' }),
  createHook('sf_health_002', "The workout that changed my body (gym bros hate this):", 'tiktok', 'health', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Contrarian' }),
  createHook('sf_health_003', "What I eat in a day to stay lean (no restrictions):", 'tiktok', 'health', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Value' }),
  createHook('sf_health_004', "The 2-minute habit that changed my life:", 'tiktok', 'health', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('sf_health_005', "Mental health tip your therapist won't tell you:", 'tiktok', 'health', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Secret' }),

  // Education
  createHook('sf_edu_001', "The math trick they should teach in school:", 'tiktok', 'education', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('sf_edu_002', "History facts that sound fake but aren't:", 'tiktok', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Curiosity' }),
  createHook('sf_edu_003', "Why you keep forgetting what you learn (and how to fix it):", 'tiktok', 'education', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Problem' }),
  createHook('sf_edu_004', "Learn this language hack in 60 seconds:", 'tiktok', 'education', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Value' }),
  createHook('sf_edu_005', "The study method top students use:", 'tiktok', 'education', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
];

// =====================================
// YOUTUBE SCRIPT HOOKS
// =====================================

const youtubeHooks: HookData[] = [
  createHook('yt_001', "What I'm about to show you took me 5 years to figure out...", 'youtube_script', 'education', 'viral', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('yt_002', "By the end of this video, you'll understand exactly how...", 'youtube_script', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Promise' }),
  createHook('yt_003', "I spent $10,000 testing this so you don't have to...", 'youtube_script', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Authority' }),
  createHook('yt_004', "This video will save you years of trial and error...", 'youtube_script', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('yt_005', "Warning: What you're about to see might change how you think about...", 'youtube_script', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Curiosity' }),
  createHook('yt_006', "I almost didn't make this video because...", 'youtube_script', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Vulnerability' }),
  createHook('yt_007', "In the next 10 minutes, I'll show you exactly how to...", 'youtube_script', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Promise' }),
  createHook('yt_008', "Most people get this completely wrong. Here's the truth:", 'youtube_script', 'education', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Contrarian' }),
  createHook('yt_009', "The strategy that took me from zero to...", 'youtube_script', 'business', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('yt_010', "This is the exact system I use every day to...", 'youtube_script', 'business', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
];

// =====================================
// INSTAGRAM CAROUSEL HOOKS
// =====================================

const carouselHooks: HookData[] = [
  createHook('ig_001', "Save this before it gets deleted 📌", 'instagram_carousel', 'education', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Urgency' }),
  createHook('ig_002', "The complete guide to... (swipe to learn more)", 'instagram_carousel', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('ig_003', "10 things I wish I knew before starting...", 'instagram_carousel', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Story' }),
  createHook('ig_004', "Mistakes I made so you don't have to ⬇️", 'instagram_carousel', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Value' }),
  createHook('ig_005', "This changed my [life/career/health] forever:", 'instagram_carousel', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Story' }),
  createHook('ig_006', "The only [X] guide you'll ever need:", 'instagram_carousel', 'education', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Authority' }),
  createHook('ig_007', "Stop scrolling if you want to...", 'instagram_carousel', 'lifestyle', 'high', { emotionalIntensity: 'high', psychologicalAngle: 'Direct' }),
  createHook('ig_008', "Your sign to finally start [X] 🚀", 'instagram_carousel', 'lifestyle', 'curated', { emotionalIntensity: 'medium', psychologicalAngle: 'Motivation' }),
  createHook('ig_009', "The roadmap that took me from [A] to [B]:", 'instagram_carousel', 'business', 'high', { emotionalIntensity: 'medium', psychologicalAngle: 'Story' }),
  createHook('ig_010', "Everything you need to know about... in one post:", 'instagram_carousel', 'education', 'curated', { emotionalIntensity: 'low', psychologicalAngle: 'Value' }),
];

// =====================================
// EXPORT ALL HOOKS
// =====================================

export const SEED_HOOKS: HookData[] = [
  ...twitterHooks,
  ...linkedinHooks,
  ...shortFormHooks,
  ...youtubeHooks,
  ...carouselHooks,
];

// Summary stats
export const SEED_STATS = {
  total: SEED_HOOKS.length,
  byPlatform: {
    twitter: twitterHooks.length,
    linkedin: linkedinHooks.length,
    tiktok: shortFormHooks.length,
    youtube_script: youtubeHooks.length,
    instagram_carousel: carouselHooks.length,
  },
  byTier: {
    viral: SEED_HOOKS.filter(h => h.performanceTier === 'viral').length,
    high: SEED_HOOKS.filter(h => h.performanceTier === 'high').length,
    curated: SEED_HOOKS.filter(h => h.performanceTier === 'curated').length,
    community: SEED_HOOKS.filter(h => h.performanceTier === 'community').length,
  },
};
