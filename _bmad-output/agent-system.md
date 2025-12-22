# Agent System Architecture - The Agentic Content Foundry

> Adversarial AI architecture with Creator/Critic conflict resolution

## Overview

The Foundry uses an **adversarial agent architecture** where two specialized agents work in creative tension:

- **Creator Agent** (Divergent) — Generates content, optimizes for volume and creativity
- **Critic Agent** (Convergent) — Evaluates quality, enforces brand alignment and standards

This conflict-resolution loop produces higher-quality content than single-agent systems through **self-healing**: the Creator learns from Critic feedback in real-time.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ADVERSARIAL AGENT LOOP                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                         ┌───────────────────────────┐                           │
│                         │      HUB (Source)         │                           │
│                         │   Themes, Claims, Angles  │                           │
│                         └─────────────┬─────────────┘                           │
│                                       │                                          │
│                                       ▼                                          │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         CREATOR AGENT                                    │   │
│   │                                                                          │   │
│   │  1. Query Brand DNA (voice_markers, banned_words, personas)             │   │
│   │  2. Query past failures (feedback_log WHERE resolved = 0)               │   │
│   │  3. Query Vectorize for similar high-performers                         │   │
│   │  4. Generate platform-specific content                                  │   │
│   │  5. Apply Visual Archetype selection                                    │   │
│   │                                                                          │   │
│   │  Tools: Workers AI (LLM), Vectorize (similarity), SQLite (Brand DNA)    │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│                                      │ Generated Spoke                           │
│                                      ▼                                           │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                         CRITIC AGENT                                     │   │
│   │                                                                          │   │
│   │  Evaluation Pipeline:                                                    │   │
│   │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌───────────┐            │   │
│   │  │ G2  │→ │ G4  │→ │ G5  │→ │ G6  │→ │ G7  │→ │G-Compliance│            │   │
│   │  │Hook │  │Voice│  │Plat │  │Vis  │  │Engmt│  │(Optional) │            │   │
│   │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └───────────┘            │   │
│   │                                                                          │   │
│   │  Tools: Workers AI, Vectorize (10K hooks), SQLite (rubric_overrides)    │   │
│   └──────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│                         ┌────────────┴────────────┐                             │
│                         │                         │                             │
│                         ▼                         ▼                             │
│                   ┌──────────┐             ┌──────────┐                         │
│                   │   PASS   │             │   FAIL   │                         │
│                   │ (≥80 G2) │             │ (<80 G2) │                         │
│                   └────┬─────┘             └────┬─────┘                         │
│                        │                        │                               │
│                        ▼                        ▼                               │
│               ┌─────────────────┐     ┌─────────────────────────┐               │
│               │  REVIEW QUEUE   │     │   SELF-HEALING LOOP     │               │
│               │  (Human Ready)  │     │                         │               │
│               └─────────────────┘     │  1. Write to feedback_log              │
│                                       │  2. Creator re-queries   │               │
│                                       │  3. Regenerate with fix  │               │
│                                       │                         │               │
│                                       │  Max 3 attempts, then:  │               │
│                                       │  → Human "Creative       │               │
│                                       │    Conflict" flag       │               │
│                                       └────────────┬────────────┘               │
│                                                    │                             │
│                                                    └──────► (back to Creator)   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Specifications

### Creator Agent

**Purpose:** Generate high-volume, brand-aligned content from Hub source material.

**File:** `packages/agent-system/src/creator/creator-agent.ts`

**Capabilities:**
- Platform-specific content generation (Twitter, LinkedIn, TikTok, etc.)
- Visual Archetype selection and image prompting
- Self-improvement through feedback querying
- Multi-format output (posts, threads, carousels, scripts)

**Context Inputs:**

```typescript
interface CreatorContext {
  hub: {
    id: string;
    themes: string[];
    claims: string[];
    sourceContent: string;
  };
  pillar: {
    id: string;
    angle: string;
    keyPoints: string[];
  };
  platform: Platform;
  contentType: ContentType;
  brandDNA: {
    voiceMarkers: VoiceMarker[];
    bannedWords: BannedWord[];
    stances: BrandStance[];
    personas: Persona[];
  };
  pastFailures: FeedbackEntry[];  // From feedback_log
  similarContent: VectorMatch[];  // From Vectorize
}
```

**Generation Process:**

```typescript
class CreatorAgent {
  async generate(ctx: CreatorContext): Promise<GeneratedSpoke> {
    // 1. Build context-aware prompt
    const prompt = this.buildPrompt(ctx);

    // 2. Query Vectorize for similar high-performers
    const examples = await this.vectorize.query({
      namespace: 'hooks/',
      vector: await this.embed(ctx.pillar.angle),
      topK: 5,
      filter: { platform: ctx.platform, g7_score: { $gte: 85 } }
    });

    // 3. Inject past failure learnings
    const antiPatterns = ctx.pastFailures
      .filter(f => !f.resolved)
      .map(f => `AVOID: ${f.reason}`);

    // 4. Generate with Workers AI
    const content = await this.ai.run('@cf/meta/llama-3.1-70b-instruct', {
      messages: [
        { role: 'system', content: this.systemPrompt(ctx.brandDNA) },
        { role: 'user', content: prompt },
        { role: 'assistant', content: `Examples of high-performers:\n${examples.join('\n')}` },
        { role: 'user', content: `Anti-patterns to avoid:\n${antiPatterns.join('\n')}` }
      ]
    });

    // 5. Select Visual Archetype
    const archetype = this.selectArchetype(ctx, content);

    return {
      content,
      platform: ctx.platform,
      contentType: ctx.contentType,
      visualArchetype: archetype,
      metadata: { examples, antiPatterns }
    };
  }
}
```

**Platform-Specific Strategies:**

| Platform | Max Length | Hook Position | Special Requirements |
|----------|------------|---------------|---------------------|
| Twitter/X | 280 chars | First 50 chars | < 3 hashtags |
| LinkedIn | 3,000 chars | First line | Professional tone |
| TikTok Script | 150 words | First 3 seconds | Visual hooks |
| Instagram Carousel | 2,200 caption | First slide | 10 slides max |
| Thread | 25K total | First tweet | Logical flow |

---

### Critic Agent

**Purpose:** Evaluate content quality and enforce brand standards through quality gates.

**File:** `packages/agent-system/src/critic/critic-agent.ts`

**Capabilities:**
- Multi-gate quality evaluation (G2, G4, G5, G6, G7)
- Detailed feedback generation for self-healing
- Rubric override support for brand customization
- Compliance checking for regulated industries

**Evaluation Pipeline:**

```typescript
class CriticAgent {
  async evaluate(spoke: GeneratedSpoke, ctx: CriticContext): Promise<EvaluationResult> {
    const scores: QualityScores = {};

    // G2: Hook Strength
    scores.g2 = await this.evaluateHookStrength(spoke.content, ctx.platform);
    if (scores.g2 < this.getThreshold('g2', ctx)) {
      return this.fail('g2', scores.g2, 'Hook lacks pattern interrupt or curiosity gap');
    }

    // G4: Voice Alignment
    scores.g4 = await this.evaluateVoiceAlignment(spoke.content, ctx.brandDNA);
    if (!scores.g4.pass) {
      return this.fail('g4', 0, scores.g4.reason);
    }

    // G5: Platform Compliance
    scores.g5 = await this.evaluatePlatformCompliance(spoke, ctx.platform);
    if (!scores.g5.pass) {
      return this.fail('g5', 0, scores.g5.reason);
    }

    // G6: Visual Metaphor (if applicable)
    if (spoke.visualArchetype) {
      scores.g6 = await this.evaluateVisualMetaphor(spoke.visualArchetype, ctx);
      if (scores.g6 < this.getThreshold('g6', ctx)) {
        return this.fail('g6', scores.g6, 'Visual contains AI clichés');
      }
    }

    // G7: Engagement Prediction
    scores.g7 = await this.predictEngagement(spoke.content, ctx.platform);

    // G-Compliance (if regulated industry)
    if (ctx.compliance) {
      scores.gCompliance = await this.evaluateCompliance(spoke.content, ctx.compliance);
      if (!scores.gCompliance.pass) {
        return this.fail('g_compliance', 0, scores.gCompliance.reason);
      }
    }

    return { pass: true, scores };
  }
}
```

---

## Quality Gates

### G2: Hook Strength (0-100)

Evaluates the opening for Pattern Interrupt, Specific Benefit, and Curiosity Gap.

```typescript
async evaluateHookStrength(content: string, platform: Platform): Promise<number> {
  const hook = this.extractHook(content, platform);

  // Query Vectorize for similarity to top 10K hooks
  const hookEmbedding = await this.embed(hook);
  const matches = await this.vectorize.query({
    namespace: 'hooks/top_performers',
    vector: hookEmbedding,
    topK: 10
  });

  // Calculate similarity score
  const avgSimilarity = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;

  // LLM evaluation for structural elements
  const structureScore = await this.ai.run('@cf/meta/llama-3.1-70b-instruct', {
    messages: [{
      role: 'system',
      content: `Score this hook 0-100 based on:
        - Pattern Interrupt (30 pts): Does it stop scrolling?
        - Specific Benefit (40 pts): Clear value proposition?
        - Curiosity Gap (30 pts): Compels reading more?`
    }, {
      role: 'user',
      content: hook
    }]
  });

  // Blend Vectorize similarity with LLM structure analysis
  return (avgSimilarity * 100 * 0.4) + (structureScore * 0.6);
}
```

**Scoring Rubric:**

| Score | Criteria | Action |
|-------|----------|--------|
| 90-100 | Pattern Interrupt + Specific Benefit + Curiosity Gap | Pass |
| 80-89 | Two of three elements present | Pass |
| 70-79 | Generic but relevant | Borderline (check rubric_overrides) |
| 0-69 | AI Slop / No hook | Fail → Self-Healing |

---

### G4: Voice Alignment (Pass/Fail)

Validates content against Brand DNA.

```typescript
async evaluateVoiceAlignment(content: string, brandDNA: BrandDNA): Promise<G4Result> {
  // Check banned words (hard fail)
  for (const banned of brandDNA.bannedWords) {
    if (content.toLowerCase().includes(banned.word.toLowerCase())) {
      return {
        pass: false,
        reason: `Contains banned word: "${banned.word}"`,
        severity: banned.severity
      };
    }
  }

  // Check required voice markers
  const markerHits = brandDNA.voiceMarkers.filter(m =>
    content.toLowerCase().includes(m.phrase.toLowerCase())
  );

  // Tone similarity check via embeddings
  const contentEmbedding = await this.embed(content);
  const voiceEmbedding = await this.vectorize.query({
    namespace: `client:${this.clientId}/brand_voice`,
    vector: contentEmbedding,
    topK: 5
  });

  const toneSimilarity = voiceEmbedding.reduce((sum, m) => sum + m.score, 0) / voiceEmbedding.length;

  if (toneSimilarity < 0.7) {
    return {
      pass: false,
      reason: `Tone mismatch (similarity: ${toneSimilarity.toFixed(2)}). Expected: ${brandDNA.stances[0]?.stance}`
    };
  }

  return { pass: true };
}
```

---

### G5: Platform Compliance (Pass/Fail)

Validates format and length requirements.

```typescript
const PLATFORM_RULES: Record<Platform, PlatformRules> = {
  twitter: {
    maxChars: 280,
    maxHashtags: 3,
    threadMaxChars: 25000,
    threadMaxPosts: 25
  },
  linkedin: {
    maxChars: 3000,
    requiredTone: 'professional',
    maxHashtags: 5
  },
  tiktok: {
    maxScriptWords: 150,
    hookSeconds: 3,
    maxDuration: 60
  },
  instagram: {
    captionMaxChars: 2200,
    carouselMaxSlides: 10,
    aspectRatios: ['1:1', '4:5']
  }
};

async evaluatePlatformCompliance(spoke: GeneratedSpoke, platform: Platform): Promise<G5Result> {
  const rules = PLATFORM_RULES[platform];

  // Character count
  if (spoke.content.length > rules.maxChars) {
    return {
      pass: false,
      reason: `Exceeds ${platform} limit: ${spoke.content.length}/${rules.maxChars} chars`
    };
  }

  // Hashtag count
  const hashtags = (spoke.content.match(/#\w+/g) || []).length;
  if (hashtags > rules.maxHashtags) {
    return {
      pass: false,
      reason: `Too many hashtags: ${hashtags}/${rules.maxHashtags}`
    };
  }

  // Platform-specific checks
  if (platform === 'tiktok') {
    const wordCount = spoke.content.split(/\s+/).length;
    if (wordCount > rules.maxScriptWords) {
      return {
        pass: false,
        reason: `Script too long: ${wordCount}/${rules.maxScriptWords} words`
      };
    }
  }

  return { pass: true };
}
```

---

### G6: Visual Metaphor Quality (0-100)

Detects AI clichés and ensures brand alignment.

```typescript
const VISUAL_CLICHE_BLACKLIST = [
  'robot brain',
  'handshake overlay',
  'generic gradient',
  'stock photo business people',
  'lightbulb ideas',
  'puzzle pieces',
  'rocket ship growth',
  'target bullseye',
  'chess pieces strategy'
];

async evaluateVisualMetaphor(archetype: VisualArchetype, ctx: CriticContext): Promise<number> {
  let score = 100;

  // Check for clichés
  for (const cliche of VISUAL_CLICHE_BLACKLIST) {
    if (archetype.description.toLowerCase().includes(cliche)) {
      score -= 30;
    }
  }

  // Brand alignment check
  const archetypeEmbedding = await this.embed(archetype.description);
  const brandVisuals = await this.vectorize.query({
    namespace: `client:${this.clientId}/brand_voice`,
    vector: archetypeEmbedding,
    topK: 3,
    filter: { type: 'visual' }
  });

  const brandAlignment = brandVisuals.length > 0
    ? brandVisuals.reduce((sum, m) => sum + m.score, 0) / brandVisuals.length
    : 0.5;

  score = score * brandAlignment;

  return Math.max(0, Math.min(100, score));
}
```

---

### G7: Engagement Prediction (0-100)

Predicts viral potential using Vectorize similarity.

```typescript
async predictEngagement(content: string, platform: Platform): Promise<number> {
  const contentEmbedding = await this.embed(content);

  // Query top performers in this platform
  const similar = await this.vectorize.query({
    namespace: 'hooks/top_performers',
    vector: contentEmbedding,
    topK: 20,
    filter: { platform, engagement_tier: 'top_10_percent' }
  });

  // Calculate weighted similarity
  const avgSimilarity = similar.reduce((sum, m) => sum + m.score, 0) / similar.length;

  // Boost for "Golden Nugget" potential (very high similarity to viral content)
  const goldenNuggetBoost = similar.filter(m => m.score > 0.9).length * 5;

  return Math.min(100, (avgSimilarity * 100) + goldenNuggetBoost);
}
```

**Golden Nugget Detection:**

| G7 Score | Classification | Meaning |
|----------|----------------|---------|
| 95-100 | Golden Nugget | Predicted 3x+ viral potential |
| 85-94 | High Performer | Strong engagement predicted |
| 70-84 | Solid | Reliable baseline performance |
| < 70 | Standard | Average expected engagement |

---

### G-Compliance: Regulatory Gate (Regulated Industries)

For financial services, healthcare, legal content.

```typescript
interface ComplianceConfig {
  industry: 'financial' | 'healthcare' | 'legal';
  rules: ComplianceRule[];
  requiredDisclosures: string[];
}

const FINANCIAL_COMPLIANCE: ComplianceConfig = {
  industry: 'financial',
  rules: [
    { pattern: /guarantee.*return/i, action: 'reject', rule: 'SEC 206(4)-1' },
    { pattern: /risk.?free/i, action: 'reject', rule: 'FINRA 2210' },
    { pattern: /outperform.*market/i, action: 'reject', rule: 'Anti-Promissory' },
    { pattern: /\d+%.*return/i, action: 'flag', rule: 'Requires disclosure' }
  ],
  requiredDisclosures: [
    'Past performance does not guarantee future results',
    'Investment involves risk'
  ]
};

async evaluateCompliance(content: string, config: ComplianceConfig): Promise<GComplianceResult> {
  // Check banned patterns
  for (const rule of config.rules) {
    if (rule.pattern.test(content)) {
      if (rule.action === 'reject') {
        return {
          pass: false,
          reason: `Violates ${rule.rule}: ${rule.pattern}`,
          suggestedRevisions: await this.suggestCompliantRevision(content, rule)
        };
      } else if (rule.action === 'flag') {
        return {
          pass: false,
          reason: `Requires review for ${rule.rule}`,
          requiresHumanReview: true
        };
      }
    }
  }

  return { pass: true };
}
```

---

## Self-Healing Loop

When content fails a quality gate, the system attempts automatic correction.

```typescript
class SelfHealingLoop {
  private maxAttempts = 3;

  async heal(spoke: GeneratedSpoke, failure: EvaluationFailure): Promise<HealingResult> {
    // 1. Log failure to feedback_log
    await this.logFeedback({
      spokeId: spoke.id,
      gate: failure.gate,
      score: failure.score,
      reason: failure.reason,
      suggestion: await this.generateSuggestion(failure),
      attemptNumber: spoke.regenerationAttempt || 1
    });

    // 2. Check attempt limit
    if (spoke.regenerationAttempt >= this.maxAttempts) {
      return {
        success: false,
        action: 'human_review',
        reason: 'Max regeneration attempts reached',
        flag: 'creative_conflict'
      };
    }

    // 3. Regenerate with feedback context
    const newSpoke = await this.creator.generate({
      ...spoke.context,
      pastFailures: [...spoke.context.pastFailures, {
        gate: failure.gate,
        reason: failure.reason,
        resolved: false
      }],
      regenerationAttempt: (spoke.regenerationAttempt || 0) + 1
    });

    // 4. Re-evaluate
    const result = await this.critic.evaluate(newSpoke, spoke.context);

    if (result.pass) {
      // Mark previous failures as resolved
      await this.resolveFeedback(spoke.id);
      return { success: true, spoke: newSpoke };
    }

    // 5. Recurse
    return this.heal(newSpoke, result);
  }

  private async generateSuggestion(failure: EvaluationFailure): Promise<string> {
    const suggestions: Record<string, string> = {
      g2: 'Add pattern interrupt in first 50 chars. Include specific benefit and curiosity gap.',
      g4: `Remove banned word or adjust tone. Current issue: ${failure.reason}`,
      g5: `Reduce length or adjust format for platform requirements.`,
      g6: 'Replace visual with brand-aligned, non-cliché alternative.',
      g7: 'Study top performers in this niche. Incorporate proven hook patterns.'
    };

    return suggestions[failure.gate] || 'Review and adjust based on feedback.';
  }
}
```

---

## Grounding Agent

**Purpose:** Manage Brand DNA through voice calibration and drift detection.

**File:** `packages/agent-system/src/grounding/grounding-agent.ts`

### Voice-to-Grounding Pipeline

```typescript
class GroundingAgent {
  async processVoiceNote(audioBlob: Blob, clientId: string): Promise<CalibrationResult> {
    // 1. Store audio temporarily
    const r2Key = await this.r2.put(`voice/${clientId}/${Date.now()}.webm`, audioBlob);

    // 2. Transcribe with Whisper
    const transcript = await this.ai.run('@cf/openai/whisper', {
      audio: await audioBlob.arrayBuffer()
    });

    // 3. Entity extraction
    const entities = await this.extractEntities(transcript.text);

    // 4. Update Brand DNA
    await this.updateBrandDNA(clientId, entities);

    // 5. Refresh Vectorize
    await this.refreshVectorize(clientId, entities);

    // 6. Re-evaluate pending spokes
    const reEvaluated = await this.reEvaluatePending(clientId);

    return {
      transcript: transcript.text,
      entities,
      dnaScoreBefore: this.previousScore,
      dnaScoreAfter: await this.calculateDNAScore(clientId),
      spokesReEvaluated: reEvaluated.length
    };
  }

  private async extractEntities(transcript: string): Promise<ExtractedEntities> {
    const result = await this.ai.run('@cf/meta/llama-3.1-70b-instruct', {
      messages: [{
        role: 'system',
        content: `Extract brand calibration entities from this voice note:
          - banned_words: Words/phrases to never use
          - voice_markers: Required phrases or patterns
          - brand_stances: Positioning statements
          - tone_adjustments: Tone direction changes

          Return as JSON.`
      }, {
        role: 'user',
        content: transcript
      }]
    });

    return JSON.parse(result);
  }
}
```

### Drift Detection

```typescript
class DriftDetector {
  async checkDrift(clientId: string): Promise<DriftResult> {
    // 1. Get recent mutations
    const mutations = await this.sql.exec`
      SELECT * FROM mutation_registry
      WHERE created_at > ${Date.now() - 7 * 24 * 60 * 60 * 1000}
      ORDER BY created_at DESC
    `.all();

    // 2. Calculate drift metric
    const avgEditDistance = mutations.reduce((sum, m) => sum + m.edit_distance, 0) / mutations.length;

    // 3. Calculate Zero-Edit Rate trend
    const zeroEditRate = await this.calculateZeroEditRate(clientId, 7);

    // 4. Determine if calibration needed
    const driftScore = (avgEditDistance * 0.6) + ((1 - zeroEditRate) * 0.4);

    if (driftScore > 0.4) {
      return {
        needsCalibration: true,
        driftScore,
        trigger: avgEditDistance > 0.5 ? 'high_edit_distance' : 'low_zero_edit_rate',
        suggestion: 'Record a voice note to recalibrate Brand DNA'
      };
    }

    return { needsCalibration: false, driftScore };
  }
}
```

---

## Agent Orchestration

### Hub-to-Spoke Workflow

```typescript
// apps/content-engine/src/workflows/spoke-generation.ts
export class SpokeGenerationWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { hubId, clientId, platforms } = event.payload;

    // 1. Load Hub and Brand DNA
    const [hub, brandDNA] = await step.do('load-context', async () => {
      const agent = this.env.CLIENT_AGENT.get(clientId);
      return Promise.all([
        agent.getHub(hubId),
        agent.getBrandDNA()
      ]);
    });

    // 2. Generate Spokes in parallel (by pillar)
    const spokePromises = hub.pillars.map(pillar =>
      step.do(`generate-pillar-${pillar.id}`, async () => {
        const spokes: GeneratedSpoke[] = [];

        for (const platform of platforms) {
          const creator = new CreatorAgent(this.env, clientId);
          const spoke = await creator.generate({
            hub,
            pillar,
            platform,
            brandDNA,
            pastFailures: await this.getPastFailures(clientId)
          });
          spokes.push(spoke);
        }

        return spokes;
      })
    );

    const allSpokes = (await Promise.all(spokePromises)).flat();

    // 3. Quality Gate evaluation (parallel)
    const evaluationPromises = allSpokes.map(spoke =>
      step.do(`evaluate-${spoke.id}`, async () => {
        const critic = new CriticAgent(this.env, clientId);
        const result = await critic.evaluate(spoke, { brandDNA });

        if (!result.pass) {
          // Self-healing loop
          const healer = new SelfHealingLoop(this.env, clientId);
          return healer.heal(spoke, result);
        }

        return { success: true, spoke };
      })
    );

    const results = await Promise.all(evaluationPromises);

    // 4. Save to Durable Object
    await step.do('save-spokes', async () => {
      const agent = this.env.CLIENT_AGENT.get(clientId);
      await agent.saveSpokes(results.filter(r => r.success).map(r => r.spoke));
    });

    // 5. Notify via WebSocket
    await step.do('notify', async () => {
      const agent = this.env.CLIENT_AGENT.get(clientId);
      await agent.broadcast({
        type: 'GENERATION_COMPLETE',
        hubId,
        spokeCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length
      });
    });

    return { success: true, generated: results.length };
  }
}
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Spoke Generation (single) | < 3s | Workers AI latency |
| Spoke Generation (25 batch) | < 60s | Parallel Workflow steps |
| Critic Evaluation | < 500ms | Per-gate evaluation |
| Self-Healing Loop | < 10s/iteration | Regeneration + re-evaluation |
| Vectorize Query | < 50ms | Hook similarity search |
| Critic Pass Rate (G2) | > 85% | First-pass approval |
| Self-Healing Efficiency | < 1.2 loops | Average regeneration attempts |

---

## Related Documentation

- [Architecture](./architecture.md) — System overview
- [Data Model](./data-model.md) — Database schemas
- [Quality Gates](./quality-gates.md) — Detailed gate specifications
- [API Reference](./api-reference.md) — tRPC procedures
