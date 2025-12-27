/**
 * Sprint View Mock Data
 *
 * Development data for building the Sprint View UI.
 * Toggle USE_MOCK_DATA to switch between mock and real API data.
 */

import type { SprintItem } from './types';

export const USE_MOCK_DATA = true; // Set to false when backend is ready

export const MOCK_SPRINT_ITEMS: SprintItem[] = [
  {
    id: 'sprint-001',
    hubId: 'hub-1',
    pillarId: 'pillar-1',
    content: `The counterintuitive truth about content that converts:

Most creators obsess over going viral.

But virality is the slot machine of the creator economy.

After analyzing 10,000+ posts from 47 clients:

The posts that drive the MOST revenue?

They rarely break 500 likes.

Here's what they do instead...

#contentmarketing #creatoreconomy #linkedinstrategy`,
    platform: 'linkedin',
    hookScore: 85,
    predictionScore: 9.4,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Podcast Ep.12',
      pillar: 'The Rebellious Gambler'
    },
    criticNotes: 'Strong pattern interrupt. Consider adding a specific data point in line 3 for credibility boost.'
  },
  {
    id: 'sprint-002',
    hubId: 'hub-1',
    pillarId: 'pillar-2',
    content: `5 Things Top CEOs Do Before 6 AM

I interviewed 23 Fortune 500 CEOs last quarter.

One habit showed up in every single conversation:

They all protect their first hour.

No emails. No meetings. No Slack.

Just strategic thinking time.

Here's exactly how they structure it:

#leadership #productivity #ceo #morningroutine`,
    platform: 'linkedin',
    hookScore: 92,
    predictionScore: 8.8,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Executive Series',
      pillar: 'Morning Routines'
    },
    criticNotes: 'Excellent hook with specific numbers. The list format performs well on LinkedIn.'
  },
  {
    id: 'sprint-003',
    hubId: 'hub-1',
    pillarId: 'pillar-3',
    content: `Why your "value-first" content strategy is failing

Everyone says "give value."

But nobody defines what value actually means.

Value isn't information.

It's transformation.

The difference:

Information: "Here are 5 tips"
Transformation: "Here's why you're stuck and how to get unstuck"

Your audience doesn't need more tips.

They need clarity on their specific problem.

#contentstrategy #marketing #personalbrand`,
    platform: 'linkedin',
    hookScore: 78,
    predictionScore: 8.2,
    gates: { g4Passed: true, g5Passed: false },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Content Philosophy',
      pillar: 'Value Redefined'
    },
    criticNotes: 'G5 failed: Post length exceeds optimal for mobile. Consider trimming to 150 words.'
  },
  {
    id: 'sprint-004',
    hubId: 'hub-1',
    pillarId: 'pillar-4',
    content: `The $50K lesson I learned from a failed launch

Last year I launched a course that flopped.

Revenue: $4,200
Expected: $50,000

The problem wasn't the product.

It was the positioning.

I sold features when I should have sold outcomes.

"12 video modules" vs "Land 3 clients in 30 days"

Same content. Different frame.

This year? Same course hit $127K.

Here's what I changed:

#startups #entrepreneur #business #lessons`,
    platform: 'linkedin',
    hookScore: 95,
    predictionScore: 9.1,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Failure Stories',
      pillar: 'Launch Lessons'
    },
    criticNotes: 'Perfect vulnerability + outcome combination. Strong social proof with specific numbers.'
  },
  {
    id: 'sprint-005',
    hubId: 'hub-1',
    pillarId: 'pillar-5',
    content: `Doctors don't give you 47 treatment options.

They give you one prescription.

Your content should work the same way.

Diagnose the problem.
Prescribe the solution.
Set expectations for results.

That's it.

The more specific your prescription, the more trust you build.

#contentcreation #writingtips #marketing`,
    platform: 'twitter',
    hookScore: 88,
    predictionScore: 7.6,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'Twitter',
      hub: 'Content Philosophy',
      pillar: 'Prescriptive Content'
    },
    criticNotes: 'Great metaphor. Consider thread format for Twitter to improve engagement.'
  },
  {
    id: 'sprint-006',
    hubId: 'hub-1',
    pillarId: 'pillar-6',
    content: `["I analyzed 500 viral posts.", "Found 7 patterns that repeat over and over.", "None of them are what you think.", "Let me show you:"]`,
    platform: 'thread',
    hookScore: 90,
    predictionScore: 8.5,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'Twitter',
      hub: 'Research Series',
      pillar: 'Viral Analysis'
    },
    criticNotes: 'Thread opener is strong. Ensure first reply delivers on the promise immediately.'
  },
  {
    id: 'sprint-007',
    hubId: 'hub-1',
    pillarId: 'pillar-7',
    content: `Hot take:

The best personal brands never talk about themselves.

They talk about their audience's problems.
Their audience's dreams.
Their audience's journey.

You're just the guide.

Not the hero.

#personalbrand #branding #marketing`,
    platform: 'linkedin',
    hookScore: 72,
    predictionScore: 6.8,
    gates: { g4Passed: false, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Brand Philosophy',
      pillar: 'Guide Not Hero'
    },
    criticNotes: 'G4 failed: Tone is more aggressive than brand voice. Soften "Hot take" opener.'
  },
  {
    id: 'sprint-008',
    hubId: 'hub-1',
    pillarId: 'pillar-8',
    content: `For 18 months I posted every single day.

Burned out. Content quality dropped.

Then I tried something different:

3 posts per week.
Each one researched for 2+ hours.
Every hook tested with focus groups.

Result?

Less content. More impact.

Quality > Quantity. Always.

#contentcreator #socialmedia #burnout #quality`,
    platform: 'linkedin',
    hookScore: 93,
    predictionScore: 8.9,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'Workflow Series',
      pillar: 'Sustainable Creation'
    },
    criticNotes: 'Counterintuitive claim with proof. Great for engagement and saves.'
  },
  {
    id: 'sprint-009',
    hubId: 'hub-1',
    pillarId: 'pillar-9',
    content: `AI can write faster than you.

AI can research deeper than you.

AI can optimize better than you.

But AI cannot:

• Share your failures
• Reference your 1:1 conversations
• Know what keeps YOUR audience up at night
• Build trust through consistency over years

Your unfair advantage isn't speed.

It's lived experience.

Lean into that.

#artificialintelligence #ai #contentmarketing #humantouch`,
    platform: 'linkedin',
    hookScore: 81,
    predictionScore: 8.6,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'LinkedIn',
      hub: 'AI & Content',
      pillar: 'Human Advantage'
    },
    criticNotes: 'Timely topic with clear differentiation. Consider adding a CTA for discussion.'
  },
  {
    id: 'sprint-010',
    hubId: 'hub-1',
    pillarId: 'pillar-10',
    content: `It's not your:
- Headlines
- Hooks
- Call to actions
- Posting time
- Algorithm

It's your positioning.

If people don't understand what you do in 3 seconds, they scroll.

Clarity beats cleverness. Every time.

#positioning #marketing #clarity #contenttips`,
    platform: 'twitter',
    hookScore: 87,
    predictionScore: 7.9,
    gates: { g4Passed: true, g5Passed: true },
    breadcrumb: {
      client: 'Acme Corp',
      platform: 'Twitter',
      hub: 'Conversion Series',
      pillar: 'Positioning First'
    },
    criticNotes: 'Strong list format. The "3 seconds" claim is powerful. Good Twitter length.'
  }
];

// Helper to get subset for testing different queue sizes
export function getMockItems(count: number = MOCK_SPRINT_ITEMS.length): SprintItem[] {
  return MOCK_SPRINT_ITEMS.slice(0, count);
}

// Helper to generate additional items for larger queue testing
export function generateMockItems(count: number): SprintItem[] {
  const items: SprintItem[] = [];
  for (let i = 0; i < count; i++) {
    const baseItem = MOCK_SPRINT_ITEMS[i % MOCK_SPRINT_ITEMS.length];
    items.push({
      ...baseItem,
      id: `sprint-gen-${i.toString().padStart(3, '0')}`,
    });
  }
  return items;
}