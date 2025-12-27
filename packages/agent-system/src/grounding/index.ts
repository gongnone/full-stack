import type { BrandDNA, Stance, BannedWord } from '@repo/foundry-core';

// ==========================================
// GROUNDING AGENT - Brand DNA Extraction
// ==========================================

export interface GroundingContext {
  contentType: 'posts' | 'articles' | 'transcripts' | 'voice';
  content: string[];
  existingDNA?: BrandDNA;
}

export interface ExtractedEntities {
  voiceMarkers: string[];
  bannedWords: BannedWord[];
  stances: Stance[];
  signaturePatterns: string[];
  toneProfile: {
    formal_casual: number;
    serious_playful: number;
    technical_accessible: number;
    reserved_expressive: number;
  };
}

// ==========================================
// VOICE EXTRACTION PROMPTS
// ==========================================

export function buildVoiceExtractionPrompt(content: string, contentType: string): string {
  return `You are a GROUNDING agent specializing in brand voice analysis.

Analyze the following ${contentType} content to extract the author's distinctive voice characteristics.

CONTENT TO ANALYZE:
${content}

EXTRACT THE FOLLOWING:

1. VOICE MARKERS (unique phrases, expressions, verbal tics)
- Look for repeated phrases or expressions
- Identify signature openings or closings
- Note unusual word choices or coinages
- Find characteristic transitions or connectors

2. BANNED WORDS (words that would feel off-brand)
- Identify words/phrases the author deliberately avoids
- Note corporate jargon or buzzwords they reject
- Mark severity: 'hard' (never use) or 'soft' (generally avoid)
- Provide reasoning for each

3. STANCES (clear positions on industry topics)
- Identify strong opinions or beliefs
- Note contrarian positions
- Find recurring themes or arguments

4. SIGNATURE PATTERNS (structural communication patterns)
- How do they typically open content?
- How do they structure arguments?
- What patterns do they repeat?
- How do they close or call to action?

5. TONE PROFILE (rate 0-100 on each dimension)
- formal_casual: 0=very formal → 100=very casual
- serious_playful: 0=very serious → 100=very playful
- technical_accessible: 0=highly technical → 100=very accessible
- reserved_expressive: 0=reserved/understated → 100=highly expressive

OUTPUT JSON ONLY:
{
  "voiceMarkers": ["phrase1", "phrase2", ...],
  "bannedWords": [
    {"word": "synergy", "severity": "hard", "reason": "corporate buzzword"},
    ...
  ],
  "stances": [
    {"topic": "remote work", "position": "strongly advocates for async-first teams"},
    ...
  ],
  "signaturePatterns": [
    "Always opens with a provocative question",
    "Uses numbered lists for key points",
    ...
  ],
  "toneProfile": {
    "formal_casual": 75,
    "serious_playful": 40,
    "technical_accessible": 60,
    "reserved_expressive": 80
  }
}`;
}

// ==========================================
// VOICE-TO-GROUNDING PIPELINE
// ==========================================

export function buildTranscriptAnalysisPrompt(transcript: string): string {
  return `You are a GROUNDING agent analyzing a voice recording transcript.

Voice recordings capture authentic, unfiltered communication style. Pay special attention to:
- Natural speech patterns and filler words (may indicate authenticity markers)
- Spontaneous expressions and reactions
- How they explain complex ideas verbally
- Emotional language and emphasis

TRANSCRIPT:
${transcript}

EXTRACT with extra attention to:
1. Natural speech patterns that could translate to writing
2. Authentic expressions vs. formal alternatives
3. How they naturally structure explanations
4. Emotional indicators and emphasis patterns

OUTPUT JSON (same format as voice extraction):
{
  "voiceMarkers": [...],
  "bannedWords": [...],
  "stances": [...],
  "signaturePatterns": [...],
  "toneProfile": {...}
}`;
}

// ==========================================
// DNA MERGING LOGIC
// ==========================================

export function mergeBrandDNA(
  existing: BrandDNA,
  extracted: ExtractedEntities
): BrandDNA {
  // Merge voice markers (deduplicate, keep unique)
  const voiceMarkers = [
    ...new Set([
      ...existing.voiceMarkers,
      ...extracted.voiceMarkers,
    ]),
  ];

  // Merge banned words (deduplicate by word, prefer harder severity)
  const bannedWordsMap = new Map<string, BannedWord>();

  for (const word of [...existing.bannedWords, ...extracted.bannedWords]) {
    const key = word.word.toLowerCase();
    const existing = bannedWordsMap.get(key);

    if (!existing) {
      bannedWordsMap.set(key, word);
    } else if (word.severity === 'hard' && existing.severity === 'soft') {
      // Upgrade to hard severity if new extraction says so
      bannedWordsMap.set(key, word);
    }
  }
  const bannedWords = Array.from(bannedWordsMap.values());

  // Merge stances (deduplicate by topic, prefer newer position)
  const stancesMap = new Map<string, Stance>();

  for (const stance of [...existing.stances, ...extracted.stances]) {
    const key = stance.topic.toLowerCase();
    // Later entries (extracted) will override
    stancesMap.set(key, stance);
  }
  const stances = Array.from(stancesMap.values());

  // Merge signature patterns (deduplicate)
  const signaturePatterns = [
    ...new Set([
      ...existing.signaturePatterns,
      ...extracted.signaturePatterns,
    ]),
  ];

  // Blend tone profiles (weighted average: 30% old, 70% new)
  const toneProfile: BrandDNA['toneProfile'] = {};
  const keys = ['formal_casual', 'serious_playful', 'technical_accessible', 'reserved_expressive'] as const;

  for (const key of keys) {
    const oldVal = existing.toneProfile[key] ?? 50;
    const newVal = extracted.toneProfile[key] ?? 50;
    toneProfile[key] = Math.round(oldVal * 0.3 + newVal * 0.7);
  }

  return {
    voiceMarkers,
    bannedWords,
    stances,
    signaturePatterns,
    toneProfile,
    lastCalibration: new Date().toISOString(),
  };
}

// ==========================================
// DNA STRENGTH SCORING
// ==========================================

export function calculateDNAStrengthScore(dna: BrandDNA): number {
  let score = 0;

  // Voice markers (up to 30 points)
  if (dna.voiceMarkers.length > 0) score += 15;
  if (dna.voiceMarkers.length >= 5) score += 10;
  if (dna.voiceMarkers.length >= 10) score += 5;

  // Banned words (up to 15 points)
  if (dna.bannedWords.length > 0) score += 10;
  if (dna.bannedWords.some(b => b.severity === 'hard')) score += 5;

  // Stances (up to 25 points)
  if (dna.stances.length > 0) score += 10;
  if (dna.stances.length >= 3) score += 10;
  if (dna.stances.length >= 5) score += 5;

  // Signature patterns (up to 15 points)
  if (dna.signaturePatterns.length > 0) score += 10;
  if (dna.signaturePatterns.length >= 3) score += 5;

  // Tone profile (up to 15 points)
  const toneKeys = Object.keys(dna.toneProfile);
  if (toneKeys.length > 0) score += 5;
  if (toneKeys.length >= 4) score += 10;

  return Math.min(score, 100);
}

// ==========================================
// DRIFT DETECTION
// ==========================================

export interface DriftAnalysis {
  driftScore: number;
  needsCalibration: boolean;
  triggers: string[];
  suggestions: string[];
}

export function analyzeDrift(
  dna: BrandDNA,
  recentContent: string[],
  recentApprovalRate: number
): DriftAnalysis {
  const triggers: string[] = [];
  const suggestions: string[] = [];
  let driftScore = 0;

  // Check calibration freshness
  if (dna.lastCalibration) {
    const daysSinceCalibration = Math.floor(
      (Date.now() - new Date(dna.lastCalibration).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCalibration > 30) {
      driftScore += 20;
      triggers.push(`${daysSinceCalibration} days since last calibration`);
      suggestions.push('Consider uploading recent content for recalibration');
    }
  } else {
    driftScore += 30;
    triggers.push('No calibration on record');
    suggestions.push('Upload existing content to establish Brand DNA baseline');
  }

  // Check DNA completeness
  const strengthScore = calculateDNAStrengthScore(dna);
  if (strengthScore < 50) {
    driftScore += 25;
    triggers.push(`DNA strength score: ${strengthScore}/100`);
    suggestions.push('Upload more content samples to strengthen Brand DNA');
  }

  // Check approval rate
  if (recentApprovalRate < 0.6) {
    driftScore += 25;
    triggers.push(`Low approval rate: ${Math.round(recentApprovalRate * 100)}%`);
    suggestions.push('Review rejected content patterns and recalibrate voice');
  }

  return {
    driftScore: Math.min(driftScore, 100),
    needsCalibration: driftScore >= 40,
    triggers,
    suggestions,
  };
}

// ==========================================
// VECTORIZE HELPERS
// ==========================================

export function prepareForVectorization(dna: BrandDNA): string {
  const parts: string[] = [];

  // Voice markers
  if (dna.voiceMarkers.length > 0) {
    parts.push(`Voice markers: ${dna.voiceMarkers.join(', ')}`);
  }

  // Signature patterns
  if (dna.signaturePatterns.length > 0) {
    parts.push(`Communication patterns: ${dna.signaturePatterns.join(', ')}`);
  }

  // Stances
  if (dna.stances.length > 0) {
    parts.push(`Brand positions: ${dna.stances.map(s => `${s.topic} - ${s.position}`).join('; ')}`);
  }

  // Tone description
  if (Object.keys(dna.toneProfile).length > 0) {
    const toneDescriptions: string[] = [];
    const tp = dna.toneProfile;

    if (tp.formal_casual !== undefined) {
      toneDescriptions.push(tp.formal_casual > 60 ? 'casual' : tp.formal_casual < 40 ? 'formal' : 'balanced formality');
    }
    if (tp.serious_playful !== undefined) {
      toneDescriptions.push(tp.serious_playful > 60 ? 'playful' : tp.serious_playful < 40 ? 'serious' : 'balanced seriousness');
    }
    if (tp.technical_accessible !== undefined) {
      toneDescriptions.push(tp.technical_accessible > 60 ? 'accessible' : tp.technical_accessible < 40 ? 'technical' : 'balanced complexity');
    }
    if (tp.reserved_expressive !== undefined) {
      toneDescriptions.push(tp.reserved_expressive > 60 ? 'expressive' : tp.reserved_expressive < 40 ? 'reserved' : 'balanced expression');
    }

    parts.push(`Tone: ${toneDescriptions.join(', ')}`);
  }

  return parts.join('\n');
}
