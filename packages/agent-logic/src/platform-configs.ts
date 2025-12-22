export const PLATFORM_CONFIGS = {
  twitter: { maxChars: 280, format: 'single-post', tone: 'punchy' },
  linkedin: { maxChars: 3000, format: 'professional', tone: 'authoritative' },
  tiktok: { maxDuration: 60, format: 'script', tone: 'conversational' },
  instagram: { maxChars: 2200, format: 'caption', tone: 'visual' },
  newsletter: { maxWords: 500, format: 'long-form', tone: 'value-dense' },
  thread: { posts: [5, 7], format: 'sequential', tone: 'storytelling' },
  carousel: { slides: [5, 8], format: 'visual-slides', tone: 'educational' },
} as const;
