# AI Workflow & Agent System

> Multi-phase AI orchestration for HALO Strategy market research

## Overview

The platform uses **Cloudflare Workflows** to orchestrate a 6-phase AI research pipeline. Each phase is an independent agent with its own retry logic and persistence.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         HALO RESEARCH WORKFLOW V2                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────┐   ┌────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│   │  Phase 1   │──►│ Phase 1.5  │──►│   Phase 2    │──►│    Phase 3      │  │
│   │ Discovery  │   │ Competitor │   │  Listening   │   │ Classification  │  │
│   └────────────┘   └────────────┘   └──────────────┘   └─────────────────┘  │
│         │                                                       │           │
│         │                                                       ▼           │
│         │              ┌─────────────────────────────────────────────────┐  │
│         │              │                                                 │  │
│         │              │  ┌────────────┐   ┌────────────┐   ┌────────┐  │  │
│         │              │  │  Phase 4   │──►│  Phase 5   │──►│Phase 6 │  │  │
│         │              │  │   Avatar   │   │  Problem   │   │  HVCO  │  │  │
│         │              │  └────────────┘   └────────────┘   └────────┘  │  │
│         │              │                                                 │  │
│         │              └─────────────────────────────────────────────────┘  │
│         │                                                       │           │
│         └────────────────────── Save Results ◄──────────────────┘           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Entry Point

**Location**: `apps/data-service/src/workflows/halo-workflow-v2.ts`

```typescript
export class HaloResearchWorkflowV2 extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // 6-phase orchestration
  }
}
```

### Input Parameters

```typescript
type Params = {
  projectId: string;     // Database project ID
  topic: string;         // Research topic/niche
  userId: string;        // Authenticated user ID
  runId: string;         // Workflow run ID for tracking
  additionalContext?: {
    targetAudience?: string;      // Target audience description
    productDescription?: string;  // Product/service context
  };
};
```

### Triggering the Workflow

```typescript
// From user-application worker via Service Binding
await ctx.env.BACKEND_SERVICE.startHaloResearchV2(
  projectId,
  topic,
  userId,
  runId,
  { targetAudience, productDescription }
);
```

---

## Agent Architecture

All agents are located in `packages/agent-logic/src/agents/`.

### Shared Types

```typescript
// Environment passed to all agents
type AgentEnv = {
  AI: any;              // Cloudflare Workers AI
  TAVILY_API_KEY: string;  // Web search API
  DB: D1Database;       // Database access
};

// Context for research
type AgentContext = {
  topic: string;
  targetAudience?: string;
  productDescription?: string;
  projectId: string;
  runId: string;
};
```

---

## Phase Details

### Phase 1: Discovery Agent

**Purpose**: Find "watering holes" where dream buyers congregate online.

**File**: `packages/agent-logic/src/agents/discovery-agent.ts`

**Process**:
1. Generate strategic search queries using LLM
2. Execute parallel web searches via Tavily API
3. Process results into watering holes with relevance scoring
4. Recursive discovery - reflect on findings to identify missed angles
5. Sort by relevance, return top 20

**Input**: `AgentContext` (topic, audience, product)

**Output**:
```typescript
type DiscoveryResult = {
  wateringHoles: WateringHole[];
  searchQueriesUsed: string[];
  timestamp: string;
};

type WateringHole = {
  platform: 'reddit' | 'youtube' | 'facebook' | 'quora' | 'amazon_book' | 'forum' | 'other';
  url: string;
  name: string;
  relevanceScore: number;     // 0-100
  estimatedAudience: string;
  sampleTopics: string[];
};
```

**AI Model**: `@cf/meta/llama-3.1-70b-instruct`

**Retry Config**: 2 retries, 10s delay, exponential backoff

---

### Phase 1.5: Competitor Recon Agent

**Purpose**: Analyze competitors discovered in watering holes (Funnel Hacking).

**File**: `packages/agent-logic/src/agents/competitor-recon-agent.ts`

**Process**:
1. Extract competitor mentions from discovery results
2. Research each competitor's offer structure
3. Identify strengths, weaknesses, and gaps

**Input**: `AgentEnv`, `AgentContext`, `DiscoveryResult`

**Output**:
```typescript
type CompetitorReconResult = {
  competitors: Competitor[];
  competitorUrls: string[];
};

type Competitor = {
  name: string;
  url: string;
  entryOffer: string;
  strengths: string[];
  weaknesses: string[];
  yearsAdvertising?: number;
};
```

---

### Phase 2: Deep Listening Agent

**Purpose**: Extract verbatim quotes and emotional content from watering holes.

**File**: `packages/agent-logic/src/agents/listening-agent.ts`

**Process**:
1. Visit each watering hole URL
2. Extract raw content using web scraping
3. Identify verbatim quotes that express emotions
4. Capture the language/vernacular of the market

**Input**: `AgentEnv`, `DiscoveryResult`

**Output**:
```typescript
type ListeningResult = {
  rawExtracts: RawExtract[];
  totalSourcesAnalyzed: number;
};

type RawExtract = {
  sourceUrl: string;
  platform: string;
  verbatimQuotes: string[];
  emotionalIntensity: 'low' | 'medium' | 'high';
  topicsCovered: string[];
};
```

**Retry Config**: 2 retries, 15s delay (longer due to web scraping)

---

### Phase 3: Classification Agent

**Purpose**: Categorize content by buyer sophistication and awareness levels.

**File**: `packages/agent-logic/src/agents/classification-agent.ts`

**Process**:
1. Analyze each extract for sophistication indicators
2. Score awareness level (unaware → most aware)
3. Tag emotional states and content categories
4. Generate classification distribution

**Input**: `AgentEnv`, `ListeningResult`, `AgentContext`

**Output**:
```typescript
type ClassificationResult = {
  classifiedContent: ClassifiedContent[];
  sophisticationDistribution: Record<SophisticationLevel, number>;
};

type ClassifiedContent = {
  sourceId: string;
  sophisticationLevel: 'A' | 'B' | 'C';  // A=high, C=low
  awarenessLevel: 'unaware' | 'problem_aware' | 'solution_aware' | 'product_aware' | 'most_aware';
  emotionalState: EmotionalState;
  categories: ContentCategory[];
  relevanceScore: number;
};
```

---

### Phase 4: Avatar Agent

**Purpose**: Synthesize a 9-dimensional Dream Buyer Avatar.

**File**: `packages/agent-logic/src/agents/avatar-agent.ts`

**Process**:
1. Aggregate patterns from classified content
2. Build demographic profile from signals
3. Create psychographic profile from emotional content
4. Generate day-in-the-life narrative
5. Identify media consumption habits
6. Map buying behavior patterns

**Input**: `AgentEnv`, `AgentContext`, `ClassificationResult`, `ListeningResult`

**Output**:
```typescript
type AvatarSynthesisResult = {
  avatar: DreamBuyerAvatar;
  dimensionsCovered: number;  // Out of 9
};

type DreamBuyerAvatar = {
  name: string;              // Persona name
  demographics: {
    ageRange: string;
    gender: string;
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  psychographics: {
    values: string[];
    interests: string[];
    lifestyle: string;
    personality: string;
  };
  dayInTheLife: {
    wakeTime: string;
    morningRoutine: string;
    workHours: string;
    painMoments: string[];
    eveningRoutine: string;
    bedTime: string;
  };
  dimensions: {
    vernacular: string[];         // Market-specific language
    painPoints: string[];
    desires: string[];
    fears: string[];
    currentSolutions: string[];
    objections: string[];
  };
  summaryParagraph: string;
};
```

---

### Phase 5: Problem Agent

**Purpose**: Identify the #1 "Hair on Fire" problem.

**File**: `packages/agent-logic/src/agents/problem-agent.ts`

**Process**:
1. Analyze all pain points from avatar and classification
2. Score problems by frequency, intensity, and urgency
3. Gather supporting evidence quotes
4. Calculate problem-solution fit score

**Input**: `AgentEnv`, `AgentContext`, `AvatarSynthesisResult`, `ClassificationResult`, `ListeningResult`

**Output**:
```typescript
type ProblemIdentificationResult = {
  primaryProblem: HairOnFireProblem;
  secondaryProblems: HairOnFireProblem[];
};

type HairOnFireProblem = {
  statement: string;           // Problem statement
  frequency: number;           // How often mentioned (0-100)
  emotionalIntensity: number;  // How painful (0-100)
  urgency: number;             // How urgent (0-100)
  totalScore: number;          // Combined score
  evidenceQuotes: string[];    // Supporting verbatim quotes
  solutionFit: string;         // How product solves this
};
```

---

### Phase 6: HVCO Agent

**Purpose**: Generate High-Value Content Offer titles.

**File**: `packages/agent-logic/src/agents/hvco-agent.ts`

**Process**:
1. Apply proven title formulas to problem/avatar
2. Generate multiple title variations
3. AI critic scores each title
4. Refine top performers
5. Select recommended winner

**Input**: `AgentEnv`, `AgentContext`, `ProblemIdentificationResult`, `AvatarSynthesisResult`

**Output**:
```typescript
type HVCOGenerationResult = {
  titles: HVCOTitle[];
  recommendedTitle: HVCOTitle;
};

type HVCOTitle = {
  title: string;
  formula: HVCOFormula;
  criticScore: number;           // 0-100
  criticFeedback: string;
  iteration: number;
};

type HVCOFormula =
  | 'how_to_x_without_y'      // "How to X without Y"
  | 'the_secret_to'           // "The Secret to X"
  | 'number_ways'             // "7 Ways to X"
  | 'ultimate_guide'          // "The Ultimate Guide to X"
  | 'problem_agitate_solve';  // Pain → Agitate → Solution
```

---

## Workflow Status Tracking

Each phase updates the `workflowRuns` table with progress:

```typescript
// Status values
type WorkflowStatus =
  | 'running'       // Currently executing
  | 'paused_hitl'   // Waiting for human input
  | 'complete'      // Successfully finished
  | 'failed';       // Error occurred

// Step names
type WorkflowStep =
  | 'init'
  | 'discovery_complete'
  | 'competitor_complete'
  | 'listening_complete'
  | 'classification_complete'
  | 'avatar_complete'
  | 'problem_complete'
  | 'hvco_complete';
```

Progress is calculated as `Math.round((phaseNum / 6) * 100)`.

---

## Error Handling & Retries

Each phase has independent retry configuration:

```typescript
await step.do('phase-1-discovery', {
  retries: {
    limit: 2,           // Max 2 retry attempts
    delay: '10 seconds', // Initial delay
    backoff: 'exponential'  // Exponential backoff
  }
}, async () => {
  // Phase logic
});
```

**Retry Strategy**:
- Phase 1: 2 retries, 10s delay
- Phase 1.5: 2 retries, 10s delay
- Phase 2: 2 retries, 15s delay (web scraping needs more time)
- Phases 3-6: 2 retries, 10s delay

If a phase fails after all retries, the workflow fails and records the error.

---

## Quality Score Calculation

The workflow calculates an overall quality score (0-100):

| Component | Max Points | Scoring |
|-----------|------------|---------|
| Discovery | 15 | 1 point per watering hole |
| Listening | 20 | 1 point per verbatim quote |
| Classification | 15 | 0.5 points per classified item |
| Avatar | 20 | 2 points per dimension + vernacular bonus |
| Problems | 15 | 3 points per evidence quote + score bonus |
| HVCO | 15 | 1 point per title + score bonus |

---

## RAG System

**Location**: `packages/agent-logic/src/rag.ts`

The platform includes a RAG (Retrieval Augmented Generation) system using Cloudflare Vectorize.

```typescript
// Search knowledge base
export async function searchKnowledge(
  env: AgentEnv,
  query: string,
  topK: number = 5,
  phaseTag?: string
): Promise<SearchResult[]>;

// Index new content
export async function upsertKnowledge(
  env: AgentEnv,
  documents: Document[]
): Promise<void>;

// Generate embeddings
export async function embedText(
  env: AgentEnv,
  text: string
): Promise<number[]>;
```

**Embedding Model**: `@cf/baai/bge-base-en-v1.5` (Workers AI)

---

## Tool Integrations

### Tavily Web Search

```typescript
// packages/agent-logic/src/tools/tools.ts
export async function performWebSearch(
  query: string,
  apiKey: string
): Promise<TavilySearchResult>;
```

### Browser Automation

```typescript
// packages/agent-logic/src/tools/browser-tools.ts
export async function extractPageContent(
  url: string,
  browser: Browser
): Promise<string>;
```

---

## Deployment

### Wrangler Configuration

```toml
# apps/data-service/wrangler.toml

[[workflows]]
binding = "HALO_RESEARCH_WORKFLOW_V2"
name = "halo-research-v2"
class_name = "HaloResearchWorkflowV2"

[[workflows]]
binding = "GOLDEN_PHEASANT_WORKFLOW"
name = "golden-pheasant"
class_name = "GoldenPheasantWorkflow"

[[workflows]]
binding = "GODFATHER_OFFER_WORKFLOW"
name = "godfather-offer"
class_name = "GodfatherOfferWorkflow"
```

### Environment Variables

```env
TAVILY_API_KEY=tvly-xxx      # Web search API
OPENAI_API_KEY=sk-xxx        # OpenAI (via Workers AI)
```

---

## Monitoring

### Logs

Each phase logs progress with consistent prefixes:

```
[Workflow V2] Starting 6-Phase Halo Research
[Phase 1] Starting Discovery Agent for topic: fitness
[Phase 1] Generated 10 search queries
[Phase 1] Found 20 unique watering holes
[Phase 2] Starting Listening Agent
[Phase 2] Extracted 45 content pieces
...
[Workflow V2] Results saved successfully
```

### Dashboard

Use Cloudflare dashboard to monitor:
- Workflow execution status
- Step-by-step progress
- Error rates and retry counts
- Execution duration
