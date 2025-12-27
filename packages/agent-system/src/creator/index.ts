import type { BrandDNA, PlatformSpec, ContentPillar } from '@repo/foundry-core';

// ==========================================
// CREATOR AGENT - Divergent Thinker
// ==========================================

export interface CreatorContext {
  brandDNA: BrandDNA;
  platformSpec: PlatformSpec;
  sourceContent: string;
  pillar: ContentPillar;
  previousAttempts?: string[];
  criticFeedback?: string;
}

export interface CreatorOutput {
  content: string;
  hooks: string[];
  callToAction: string;
  confidence: number;
}

/**
 * Build the system prompt for the Creator agent
 */
export function buildCreatorSystemPrompt(context: CreatorContext): string {
  const { brandDNA, platformSpec, pillar } = context;

  return `You are a CREATOR agent - a divergent thinker who generates engaging content.

YOUR PERSONALITY:
- Creative and boundary-pushing
- Focused on capturing attention
- Empathetic to the audience
- Bold but authentic

BRAND VOICE CONTEXT:
${brandDNA.voiceMarkers.length > 0 ? `- Voice Markers: ${brandDNA.voiceMarkers.join(', ')}` : '- No voice markers defined yet'}
${brandDNA.bannedWords.length > 0 ? `- Banned Words (NEVER use): ${brandDNA.bannedWords.map(b => b.word).join(', ')}` : ''}
${brandDNA.signaturePatterns.length > 0 ? `- Signature Patterns: ${brandDNA.signaturePatterns.join(', ')}` : ''}
${brandDNA.stances.length > 0 ? `- Brand Stances:\n${brandDNA.stances.map(s => `  • ${s.topic}: ${s.position}`).join('\n')}` : ''}

TONE PROFILE:
${Object.entries(brandDNA.toneProfile || {}).map(([key, value]) => `- ${key}: ${value}/100`).join('\n') || '- Default balanced tone'}

PLATFORM REQUIREMENTS (${pillar.title.toUpperCase()}):
- Max Length: ${platformSpec.maxLength} characters
- Format: ${platformSpec.format}
- Style: ${platformSpec.style}
- Hashtags: ${platformSpec.hashtagSupport ? 'Supported' : 'Not supported'}
- Mentions: ${platformSpec.mentionSupport ? 'Supported' : 'Not supported'}
- Media: ${platformSpec.mediaRequired ? 'Required' : 'Optional'}

CONTENT PILLAR: ${pillar.title}
ANGLE: ${pillar.angle}
HOOK OPTIONS: ${pillar.hooks.join(' | ')}

YOUR TASK:
Generate content that:
1. Opens with an irresistible hook (pattern interrupt, curiosity gap, or bold claim)
2. Delivers clear, actionable value
3. Matches the brand voice EXACTLY (use voice markers naturally)
4. Fits platform constraints precisely
5. Ends with an engagement driver (question, CTA, or open loop)

CONSTRAINTS:
- NEVER use banned words
- ALWAYS stay within character limit
- ALWAYS match the tone profile
- NEVER sound generic or corporate

Output ONLY the content. No meta-commentary, no explanations.`;
}

/**
 * Build the user prompt for content generation
 */
export function buildCreatorUserPrompt(context: CreatorContext): string {
  const { sourceContent, previousAttempts, criticFeedback } = context;

  let prompt = `SOURCE MATERIAL:\n${sourceContent.substring(0, 3000)}`;

  if (previousAttempts && previousAttempts.length > 0) {
    prompt += `\n\n---\n\nPREVIOUS ATTEMPTS (learn from these, don't repeat mistakes):\n`;
    previousAttempts.forEach((attempt, i) => {
      prompt += `\nAttempt ${i + 1}:\n${attempt}\n`;
    });
  }

  if (criticFeedback) {
    prompt += `\n\n---\n\nCRITIC FEEDBACK (address ALL issues):\n${criticFeedback}`;
  }

  prompt += `\n\n---\n\nGenerate the content now.`;

  return prompt;
}

/**
 * Build regeneration prompt with self-healing feedback
 */
export function buildRegenerationPrompt(
  originalContent: string,
  feedback: string[],
  context: CreatorContext
): string {
  const { platformSpec } = context;

  return `You are a CREATOR agent REGENERATING content based on CRITIC feedback.

ORIGINAL CONTENT:
${originalContent}

FAILED QUALITY GATES:
${feedback.map(f => `- ${f}`).join('\n')}

REQUIREMENTS:
- Fix ALL identified issues
- Maintain the core message and value proposition
- Stay within ${platformSpec.maxLength} characters
- Match brand voice exactly
- Preserve what worked in the original

Output ONLY the improved content. No explanations.`;
}

// ==========================================
// STRATEGY BUILDERS
// ==========================================

export type CreatorStrategy = 'hook-first' | 'story-first' | 'data-first' | 'controversy-first';

export function selectCreatorStrategy(pillar: ContentPillar, platform: string): CreatorStrategy {
  // Data-driven content angles
  if (pillar.angle.toLowerCase().includes('data') ||
      pillar.angle.toLowerCase().includes('research') ||
      pillar.angle.toLowerCase().includes('study')) {
    return 'data-first';
  }

  // Story/case study angles
  if (pillar.angle.toLowerCase().includes('story') ||
      pillar.angle.toLowerCase().includes('case') ||
      pillar.angle.toLowerCase().includes('journey')) {
    return 'story-first';
  }

  // Controversial/hot take angles
  if (pillar.angle.toLowerCase().includes('myth') ||
      pillar.angle.toLowerCase().includes('wrong') ||
      pillar.angle.toLowerCase().includes('unpopular')) {
    return 'controversy-first';
  }

  // Default to hook-first for most platforms
  return 'hook-first';
}

export function getStrategyPromptAddition(strategy: CreatorStrategy): string {
  switch (strategy) {
    case 'hook-first':
      return `STRATEGY: Hook-First
- Open with pattern interrupt or curiosity gap
- Front-load the most valuable insight
- Create urgency to keep reading`;

    case 'story-first':
      return `STRATEGY: Story-First
- Open with a specific moment or scene
- Build tension before the resolution
- Connect the lesson to the reader's life`;

    case 'data-first':
      return `STRATEGY: Data-First
- Lead with a surprising statistic
- Challenge conventional wisdom with evidence
- Make the data emotionally relevant`;

    case 'controversy-first':
      return `STRATEGY: Controversy-First
- Open with a bold, contrarian statement
- Anticipate and address objections
- Provide evidence for your position`;
  }
}

// ==========================================
// HOOKS LIBRARY
// ==========================================

export const HOOK_TEMPLATES = {
  curiosity_gap: [
    "I spent [TIME] doing [THING] and discovered something nobody talks about...",
    "The secret to [OUTCOME] isn't what you think.",
    "[NUMBER]% of [GROUP] get this wrong. Here's why:",
  ],
  pattern_interrupt: [
    "Stop scrolling. This will change how you think about [TOPIC].",
    "Unpopular opinion: [BOLD CLAIM]",
    "I was wrong about [THING]. Here's what I learned:",
  ],
  bold_claim: [
    "[THING] is dead. Here's what's replacing it.",
    "You don't need [COMMON ADVICE]. You need [ALTERNATIVE].",
    "The [OUTCOME] playbook everyone's using is broken.",
  ],
  personal_story: [
    "A year ago, I [FAILURE]. Today, I [SUCCESS]. Here's what changed:",
    "I almost [RISK]. Then I discovered [INSIGHT].",
    "My biggest mistake in [DOMAIN] taught me this:",
  ],
  question: [
    "What if [ASSUMPTION] is actually holding you back?",
    "Why do [GROUP] always [BEHAVIOR]? (The answer might surprise you)",
    "Ever wondered why [THING] happens? I found out.",
  ],
};

export function suggestHooks(pillar: ContentPillar, platform: string): string[] {
  const strategy = selectCreatorStrategy(pillar, platform);

  switch (strategy) {
    case 'controversy-first':
      return [...HOOK_TEMPLATES.bold_claim, ...HOOK_TEMPLATES.pattern_interrupt];
    case 'story-first':
      return [...HOOK_TEMPLATES.personal_story, ...HOOK_TEMPLATES.curiosity_gap];
    case 'data-first':
      return [...HOOK_TEMPLATES.curiosity_gap, ...HOOK_TEMPLATES.bold_claim];
    default:
      return [...HOOK_TEMPLATES.pattern_interrupt, ...HOOK_TEMPLATES.curiosity_gap];
  }
}
