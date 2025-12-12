# Quantum Growth Marketing Intelligence System
## Full Project Plan & Implementation Roadmap

**Project Codename:** HALO-OPS  
**Version:** 1.0  
**Estimated Duration:** 6-8 Weeks  
**Infrastructure:** Cloudflare Workers Ecosystem  

---

## Executive Summary

This project implements the complete "Quantum Growth" methodology as an automated, AI-powered marketing intelligence system. The system transforms Sabri Subie's manual direct-response marketing frameworks into executable workflows on Cloudflare's serverless infrastructure.

### Core Capabilities

| Capability | Description | Automation Level |
|------------|-------------|------------------|
| **Halo Strategy** | Market research & psychological profiling | 90% Automated |
| **Golden Pheasant** | Competitive intelligence gathering | 60% Automated + HITL |
| **Godfather Offer** | Irresistible offer engineering | 95% Automated |
| **HVCO Generation** | High-converting title creation | 100% Automated |
| **Sophistication Filter** | Power 4% targeting | 100% Automated |

### Target Outcomes

- Reduce market research time from 2-3 days to 2-3 hours
- Generate marketing assets that "strike like lightning"
- Systematically out-position competitors
- Target the Power 4% (buyers who generate 64% of revenue)

---

## Phase 1: Foundation & Infrastructure
**Duration:** Week 1  
**Goal:** Establish project structure and core infrastructure

### 1.1 Project Setup

#### Tasks
- [ ] Initialize monorepo with PNPM workspaces
- [ ] Configure Turborepo for build orchestration
- [ ] Set up TypeScript configuration
- [ ] Create package structure (apps/, packages/)
- [ ] Configure ESLint and Prettier

#### Deliverables
```
quantum-growth-system/
├── apps/
│   ├── dashboard/         # User-facing application
│   └── halo-service/      # Data processing worker
├── packages/
│   ├── data-ops/          # Database queries & schemas
│   ├── agent-logic/       # LLM prompts & integrations
│   └── shared-types/      # TypeScript types & Zod schemas
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 1.2 Database Setup (Cloudflare D1)

#### Tasks
- [ ] Create D1 database in Cloudflare dashboard
- [ ] Configure Drizzle ORM
- [ ] Create migration files for all tables
- [ ] Run initial migrations
- [ ] Verify schema in D1 Studio

#### Schema Overview

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `projects` | Project management | id, name, industry, status |
| `research_sources` | Raw scraped data | source_type, raw_content, sophistication_class |
| `halo_analysis` | Extracted psychological data | hopes_dreams, pains_fears, vernacular |
| `dream_buyer_avatar` | Target customer profile | demographics, psychographics, day_in_life |
| `competitors` | Competitor tracking | name, website, entry_product_price |
| `competitor_offer_map` | Competitor analysis | hvco, guarantee, pricing, weaknesses |
| `golden_pheasant_uploads` | HITL uploads | r2_key, extracted_content |
| `godfather_offer` | Generated offers | 7 pillars, offer_paragraph |
| `hvco_titles` | Title iterations | title, critic_score, is_winner |
| `workflow_runs` | Workflow state | status, current_step, hitl_request |
| `vector_metadata` | Embedding mappings | vector_id, source_id, emotional_trigger |

### 1.3 Cloudflare Services Setup

#### Tasks
- [ ] Create R2 bucket for asset storage
- [ ] Create KV namespace for caching
- [ ] Create Vectorize index for embeddings
- [ ] Create Queues for async processing
- [ ] Enable Workers AI binding
- [ ] Enable Browser Rendering binding

#### Configuration Checklist

| Service | Binding Name | Purpose |
|---------|--------------|---------|
| D1 Database | `DB` | Structured data storage |
| R2 Bucket | `R2` | PDFs, HTML dumps, images |
| KV Namespace | `CACHE` | API response caching |
| Vectorize | `VECTORIZE` | Semantic search |
| Queues | `RESEARCH_QUEUE` | Async processing pipeline |
| Queues | `NOTIFICATION_QUEUE` | User notifications |
| Workers AI | `AI` | LLM inference |
| Browser | `BROWSER` | JavaScript page rendering |

### 1.4 Authentication Setup

#### Tasks
- [ ] Configure Better Auth with Drizzle adapter
- [ ] Generate auth schema and migrations
- [ ] Implement Google OAuth provider
- [ ] Implement email/password provider
- [ ] Create auth middleware for tRPC

### Milestone 1 Checklist
- [ ] Monorepo builds successfully
- [ ] Database migrations run
- [ ] All Cloudflare services bound
- [ ] Auth flow working (login/logout)
- [ ] Basic dashboard shell renders

---

## Phase 2: Research Engine (Halo Strategy)
**Duration:** Weeks 2-3  
**Goal:** Build automated market research pipeline

### 2.1 Data Source Integrations

#### Reddit API Integration
- [ ] Implement OAuth2 authentication
- [ ] Build subreddit discovery logic
- [ ] Fetch posts with high comment-to-upvote ratio
- [ ] Extract and store comments
- [ ] Handle rate limiting (60 requests/min)

**API Endpoints Used:**
- `GET /r/{subreddit}/{sort}` - Top/controversial posts
- `GET /comments/{article}` - Post comments
- `GET /api/search` - Subreddit discovery

#### Answer The Public Scraper
- [ ] Implement Browser Rendering scraper
- [ ] Extract question clusters (what, why, how)
- [ ] Extract preposition queries
- [ ] Extract comparison queries
- [ ] Store results with metadata

**Rate Limiting:** 1 request per 5 seconds (respect robots.txt)

#### Quora Scraper
- [ ] Implement Browser Rendering scraper
- [ ] Search by keyword
- [ ] Extract top answers
- [ ] Filter by answer length (>100 words)

**Rate Limiting:** 1 request per 10 seconds

#### Amazon Reviews Scraper
- [ ] Implement 3-star filter logic
- [ ] Filter reviews >50 words
- [ ] Extract the "BUT" statements
- [ ] Handle ASIN lookup
- [ ] Implement pagination

**The "BUT" Logic:**
```
"The strategy is sound, BUT it requires too much capital..."
                         ^^^
                    This is the market gap
```

#### Facebook Ad Library Integration
- [ ] Configure Graph API access
- [ ] Fetch active ads by page
- [ ] Extract ad creative (copy, images)
- [ ] Calculate years advertising (longevity signal)
- [ ] Analyze hooks and angles

**Required Permissions:** `ads_read`

### 2.2 Sophistication Filter

#### Implementation
- [ ] Create filter prompt template
- [ ] Implement classification logic (A/B/C)
- [ ] Store classification with sources
- [ ] Weight Class A content 5x in analysis

#### Classification Criteria

| Class | Profile | Action | Weight |
|-------|---------|--------|--------|
| **C** | Tire Kicker | DISCARD | 0x |
| **B** | Intermediate | RETAIN | 1x |
| **A** | Power 4% | PRIORITIZE | 5x |

**Detection Markers:**

| Class A (Power 4%) Markers |
|---------------------------|
| Industry jargon used naturally |
| Discussion of tax/legal structures |
| Mentions specific dollar amounts ($100K+) |
| References to professional advisors |
| Portfolio-level strategy discussion |

| Class C (Discard) Markers |
|--------------------------|
| "How do I start?" questions |
| "Get rich quick" language |
| Poor grammar/spelling |
| Fear of minor/common risks |
| Questions answerable by Google |

### 2.3 Halo Extraction Workflow

#### Workflow Steps
1. **scrape-sources** - Gather raw data from all integrations
2. **store-raw-data** - Persist to D1 with metadata
3. **filter-sophistication** - Classify and weight content
4. **extract-halo-data** - LLM extraction of psychological primitives
5. **extract-visual-cues** - Generate image direction from fears
6. **store-halo-analysis** - Persist structured analysis
7. **generate-embeddings** - Create vectors for RAG
8. **generate-avatar** - Build Dream Buyer profile

#### Output Schema

```typescript
interface HaloAnalysis {
  hopesAndDreams: {
    desire: string;
    verbatim: string;
    frequency: number;
    emotionalIntensity: number; // 1-10
  }[];
  
  painsAndFears: {
    pain: string;
    verbatim: string;
    frequency: number;
    emotionalIntensity: number;
  }[];
  
  barriersAndUncertainties: {
    barrier: string;
    verbatim: string;
    type: 'trust' | 'timing' | 'capability' | 'knowledge' | 'resource';
  }[];
  
  vernacular: {
    terms: { term: string; definition: string; usage: string }[];
    phrases: string[];
  };
  
  unexpectedInsights: {
    insight: string;
    evidence: string;
    opportunity: string;
  }[];
  
  visualCues: {
    environmentDescriptors: string[];
    objectAnchors: string[];
    emotionalBodyLanguage: string[];
    lightingMood: string[];
    timeOfDay: string;
    soundscape: string[];
    colorPalette: string[];
  };
}
```

### 2.4 Vector Embeddings (RAG Setup)

#### Tasks
- [ ] Configure Vectorize index settings
- [ ] Implement embedding generation (bge-base-en-v1.5)
- [ ] Store metadata mappings in D1
- [ ] Build similarity search function
- [ ] Implement RAG retrieval for later phases

**Index Configuration:**
```javascript
{
  dimensions: 768,
  metric: 'cosine',
  metadata_keys: ['projectId', 'sourceId', 'sophisticationClass', 'emotionalTrigger']
}
```

### 2.5 Research Dashboard UI

#### Components to Build
- [ ] `ProjectList` - All projects with status indicators
- [ ] `NewProjectWizard` - Multi-step project creation
- [ ] `HaloAnalysisView` - Visualize extracted insights
- [ ] `SourcesTable` - View/filter raw sources
- [ ] `AvatarProfile` - Dream Buyer visualization
- [ ] `VernacularGlossary` - Searchable term dictionary
- [ ] `WorkflowProgress` - Real-time workflow status

### Milestone 2 Checklist
- [ ] All data source integrations working
- [ ] Sophistication Filter classifying accurately
- [ ] Halo Workflow running end-to-end
- [ ] Embeddings stored in Vectorize
- [ ] Research UI displaying results

---

## Phase 3: Competitor Intelligence (Golden Pheasant)
**Duration:** Week 4  
**Goal:** Build competitive analysis with Human-in-the-Loop

### 3.1 Automated Intelligence Gathering

#### Tasks
- [ ] Build competitor discovery (Google/SEMRush patterns)
- [ ] Implement website scraping via Browser Rendering
- [ ] Facebook Ad Library deep analysis
- [ ] Extract offer components automatically
- [ ] Store in competitor_offer_map

#### Automated Extraction Points

| Data Point | Source | Method |
|------------|--------|--------|
| Entry Product URL | Website | Browser scraping |
| Entry Product Price | Website | LLM extraction |
| Phone Number | Website | Regex + LLM |
| HVCO Presence | Website | Pattern detection |
| Primary CTA | Website | DOM analysis |
| Years Advertising | FB Ad Library | Page Transparency |
| Ad Hooks | FB Ad Library | Copy extraction |
| Longevity Signal | FB Ad Library | First ad date |

### 3.2 Human-in-the-Loop System

#### HITL Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW RUNNING                          │
├─────────────────────────────────────────────────────────────┤
│  Step 1: Automated Scraping         ✓ Complete              │
│  Step 2: Ad Library Analysis        ✓ Complete              │
│  Step 3: Store Automated Intel      ✓ Complete              │
├─────────────────────────────────────────────────────────────┤
│  Step 4: HITL PAUSE                 ⏸️ AWAITING USER         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  🔔 ACTION REQUIRED                                     │ │
│  │                                                          │ │
│  │  To complete competitive analysis for "Competitor X":    │ │
│  │                                                          │ │
│  │  □ Purchase their $7 report                             │ │
│  │    URL: https://competitor.com/offer                    │ │
│  │    [Upload PDF when received]                           │ │
│  │                                                          │ │
│  │  □ Call their sales line                                │ │
│  │    Phone: 555-0199                                      │ │
│  │    Script: Ask about high-tier pricing, guarantees...   │ │
│  │    [Enter notes when complete]                          │ │
│  │                                                          │ │
│  │  [Submit Completed Actions]                              │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Step 5: Process Uploads            ⏳ Waiting               │
│  Step 6: Merge Intelligence         ⏳ Waiting               │
│  Step 7: Update Offer Map           ⏳ Waiting               │
└─────────────────────────────────────────────────────────────┘
```

#### Implementation Tasks
- [ ] Implement `step.waitForEvent()` for HITL pause
- [ ] Build R2 upload endpoint for PDFs
- [ ] Create sales call notes form
- [ ] Implement notification dispatch (email/Slack)
- [ ] Build PDF text extraction pipeline
- [ ] Create LLM analysis for uploaded content
- [ ] Implement intelligence merging logic

#### HITL Timeout Configuration
```typescript
const hitlResponse = await step.waitForEvent('hitl-complete', {
  timeout: '7 days', // Allow up to 7 days for physical actions
});
```

### 3.3 Competitor Offer Mapping

#### Mapping Schema
```typescript
interface CompetitorOfferMap {
  // Front-end Intelligence (Automated)
  hvco: string | null;
  primaryCta: string;
  guarantee: string | null;
  scarcity: string | null;
  
  // Back-end Intelligence (HITL)
  valueBuild: {
    components: { name: string; value: number }[];
    totalValue: number;
    offerPrice: number;
  };
  bonuses: string[];
  pricing: {
    entry: number;
    mid: number;
    deluxe: number;
  };
  paymentPlan: string | null;
  
  // Strategic Analysis
  strengths: string[];
  weaknesses: string[]; // THESE ARE YOUR OPPORTUNITIES
}
```

### 3.4 Competitor UI Components

#### Components to Build
- [ ] `CompetitorList` - All tracked competitors
- [ ] `CompetitorCard` - Quick view with status
- [ ] `AddCompetitorForm` - Manual competitor entry
- [ ] `OfferMapComparison` - Side-by-side comparison
- [ ] `GoldenPheasantUpload` - PDF upload interface
- [ ] `SalesCallNotesForm` - Structured notes entry
- [ ] `HITLTaskPanel` - Pending action queue
- [ ] `WeaknessHighlighter` - Gap identification

### Milestone 3 Checklist
- [ ] Automated competitor scraping working
- [ ] HITL pause/resume functioning
- [ ] PDF upload and extraction working
- [ ] Sales call notes processing
- [ ] Offer map populated correctly
- [ ] Competitor comparison UI complete

---

## Phase 4: Offer Generation (Godfather Strategy)
**Duration:** Week 5  
**Goal:** Generate irresistible offers with adversarial refinement

### 4.1 Godfather Offer Generation

#### The 7 Pillars

| Pillar | Description | Data Source |
|--------|-------------|-------------|
| **1. Rationale** | Why the generous offer | Business model analysis |
| **2. Value Build** | Stacked component values | Market pricing research |
| **3. Pricing Tiers** | Entry/Mid/Deluxe structure | Competitor pricing |
| **4. Payment Options** | Full pay + installments | Industry standards |
| **5. Premiums** | Bonuses addressing barriers | Halo barriers |
| **6. Power Guarantee** | Risk reversal promise | Halo fears |
| **7. Scarcity** | Genuine limits | Capacity/time/quantity |

#### Generation Logic

```typescript
// Premium generation tied to barriers
const premiums = haloAnalysis.barriers.map(barrier => ({
  name: generatePremiumName(barrier),
  value: calculatePremiumValue(barrier),
  addressesBarrier: barrier.barrier,
  description: generatePremiumDescription(barrier),
}));

// Guarantee generation tied to fears
const primaryFear = haloAnalysis.painsAndFears[0];
const guarantee = {
  name: generateGuaranteeName(industry),
  promise: `If ${negateFeear(primaryFear)}, we will ${compensation}`,
  condition: 'Must complete all program requirements',
  duration: '180 days',
};
```

### 4.2 HVCO Title Generation

#### Writer Agent Formulas

```typescript
const HVCO_FORMULAS = [
  // Formula 1: X ways without Y
  '{X} Ways to {Achieve Desirable Thing} Without {Doing Undesirable Thing}',
  
  // Formula 2: Do X in Y even if Z
  '{Do Difficult Thing} in {Specific Period} Even if {Shortcoming}',
  
  // Formula 3: Achieve X like Y without Z
  'Achieve {Desirable Thing} Like {Expert} Even Without {Expected Requirement}',
  
  // Formula 4: Eliminate X without Y within Z
  'How to Eliminate {Biggest Problem} Without {Thing They Hate} Within {Timeframe}',
  
  // Formula 5: The exact method
  'The Exact {Method/System/Process} {Specific Group} Uses to {Achieve Result}',
  
  // Formula 6: Revealed
  'Revealed: {Surprising Mechanism} That {Achieves Outcome} in {Timeframe}',
  
  // Formula 7: Warning
  'WARNING: {Common Mistake} Is Costing You {Loss}. Here\'s How to Fix It',
  
  // Formula 8: How I
  'How I {Achieved Result} in {Timeframe} (And How You Can Too)',
];
```

#### Critic Agent Loop

```
┌─────────────────────────────────────────────────────────────┐
│                   HVCO REFINEMENT LOOP                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WRITER AGENT                    CRITIC AGENT                │
│  ┌──────────────┐               ┌──────────────┐            │
│  │              │               │              │            │
│  │  Generate    │──── Title ───>│   Evaluate   │            │
│  │  10 Titles   │               │   (0-10)     │            │
│  │              │               │              │            │
│  └──────────────┘               └──────┬───────┘            │
│         ▲                              │                     │
│         │                              ▼                     │
│         │                       Score >= 8?                  │
│         │                       /         \                  │
│         │                     YES          NO                │
│         │                      │            │                │
│         │                      ▼            ▼                │
│         │               ┌──────────┐  ┌──────────────┐      │
│         │               │  PASS    │  │   Feedback   │      │
│         │               │  Store   │  │   "Too       │      │
│         │               │  Winner  │  │   generic"   │      │
│         │               └──────────┘  └──────┬───────┘      │
│         │                                    │               │
│         └────────────── Refine ──────────────┘               │
│                        (Max 3 iterations)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Critic Scoring Guide

| Score | Verdict | Criteria |
|-------|---------|----------|
| 0-4 | FAIL | Boring, clickbait, unbelievable, scammy |
| 5-7 | FAIL | Average, looks like a standard ad |
| 8-10 | PASS | Genuine intrigue, implies insider knowledge |

### 4.3 Offer UI Components

#### Components to Build
- [ ] `GodfatherOfferBuilder` - 7-pillar form
- [ ] `PillarCard` - Individual pillar editor
- [ ] `ValueStackVisualizer` - Value build diagram
- [ ] `GuaranteeBuilder` - Guarantee generator
- [ ] `HVCOTitleGenerator` - Title creation interface
- [ ] `CriticFeedbackPanel` - Show critique history
- [ ] `TitleIterationTimeline` - Refinement progress
- [ ] `OfferPreview` - Final offer card
- [ ] `ExportPanel` - PDF/Markdown export

### 4.4 Export Functionality

#### Export Formats
- [ ] PDF Report (full marketing package)
- [ ] Markdown (for documentation)
- [ ] JSON (for integrations)
- [ ] Copy-paste snippets (for ads)

### Milestone 4 Checklist
- [ ] Godfather Offer generating all 7 pillars
- [ ] HVCO titles passing Critic (score ≥8)
- [ ] Iteration history tracked
- [ ] Offer Preview rendering correctly
- [ ] Export functionality working

---

## Phase 5: Polish & Production
**Duration:** Week 6  
**Goal:** Production-ready deployment

### 5.1 Real-time Updates

#### Durable Objects for WebSockets
- [ ] Implement WorkflowCoordinator DO
- [ ] Implement RealtimeUpdates DO
- [ ] Connect dashboard to WebSocket
- [ ] Push workflow progress updates
- [ ] Push HITL notifications

### 5.2 Error Handling

#### Retry Logic
```typescript
// Workflow step with retry
const result = await step.do('scrape-reddit', {
  retries: {
    limit: 3,
    delay: '10 seconds',
    backoff: 'exponential',
  },
}, async () => {
  return await redditAPI.fetchPosts(subreddit);
});
```

#### Error Categories
| Category | Handling |
|----------|----------|
| Rate Limit | Exponential backoff, queue retry |
| API Error | Log, retry 3x, mark failed |
| Scraping Blocked | Notify user, request manual data |
| LLM Error | Retry with simpler prompt |
| Timeout | Extend timeout, retry |

### 5.3 Rate Limiting

#### Per-Service Limits
| Service | Limit | Implementation |
|---------|-------|----------------|
| Reddit API | 60/min | Token bucket |
| Facebook API | 200/hour | Sliding window |
| Browser Rendering | 1/5s | Queue with delay |
| Workers AI | Based on plan | Batch requests |
| OpenAI | Based on tier | Queue with priority |

### 5.4 Performance Optimization

#### Caching Strategy
- [ ] Cache API responses in KV (TTL: 1 hour)
- [ ] Cache LLM responses for identical inputs
- [ ] Pre-compute embeddings during scrape
- [ ] Lazy load dashboard components

#### Batching
- [ ] Batch D1 writes (max 100 per batch)
- [ ] Batch embedding generation
- [ ] Batch queue messages

### 5.5 Testing

#### Test Coverage
- [ ] Unit tests for prompts
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
- [ ] Load testing for concurrent workflows

#### Critical Path Tests
1. Project creation → Research completion
2. Competitor addition → HITL → Analysis complete
3. Offer generation → HVCO refinement → Export

### 5.6 Documentation

#### Documentation Deliverables
- [ ] API documentation (tRPC routes)
- [ ] Workflow documentation (step descriptions)
- [ ] Prompt documentation (inputs/outputs)
- [ ] User guide (dashboard walkthrough)
- [ ] Deployment guide (Cloudflare setup)

### Milestone 5 Checklist
- [ ] Real-time updates working
- [ ] Error handling comprehensive
- [ ] Rate limiting enforced
- [ ] Performance acceptable (<3s page loads)
- [ ] Tests passing (>80% coverage)
- [ ] Documentation complete

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scraping blocked | High | Multiple fallbacks, manual upload option |
| LLM hallucination | Medium | Structured outputs, validation, Critic loop |
| Workflow timeout | Medium | Break into smaller steps, increase limits |
| D1 row limits | Low | Pagination, archival strategy |
| API rate limits | Medium | Queue-based processing, caching |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data accuracy | High | Multiple sources, human verification |
| Competitor TOS | Medium | Manual HITL for sensitive data |
| LLM costs | Medium | Workers AI first, OpenAI for complex only |
| User adoption | Medium | Clear onboarding, quick wins |

---

## Success Metrics

### Quantitative

| Metric | Target |
|--------|--------|
| Research completion time | <3 hours (vs 2-3 days manual) |
| Sophistication Filter accuracy | >85% correct classification |
| HVCO titles passing Critic | >50% on first attempt |
| Workflow completion rate | >95% |
| User time to first offer | <4 hours |

### Qualitative

- Users report "feeling understood" by generated copy
- Generated offers outperform manual offers in A/B tests
- Users successfully identify competitor weaknesses
- Vernacular glossary improves ad copy performance

---

## Resource Requirements

### Cloudflare Services (Estimated Monthly)

| Service | Usage | Cost |
|---------|-------|------|
| Workers | ~1M requests | $5/mo (included) |
| D1 | ~10GB storage | $0.75/mo |
| R2 | ~50GB storage | $0.75/mo |
| Vectorize | ~100K vectors | $0.01/1K queries |
| Queues | ~100K messages | $0.40/mo |
| Workers AI | ~50K requests | Variable |
| Browser Rendering | ~10K pages | $0.02/page |

**Estimated Total:** $50-100/month at moderate scale

### External APIs

| API | Purpose | Cost |
|-----|---------|------|
| Reddit | Forum data | Free (API limits) |
| Facebook | Ad Library | Free |
| OpenAI | Complex LLM tasks | ~$0.01/1K tokens |

---

## Appendix A: Data Source Priority Matrix

| Source | Data Type | Automation | Value |
|--------|-----------|------------|-------|
| Reddit | Forum discussions | ✅ Full | ⭐⭐⭐⭐⭐ |
| Amazon Reviews | Product feedback | ✅ Full | ⭐⭐⭐⭐⭐ |
| Answer The Public | Question patterns | ✅ Full | ⭐⭐⭐⭐ |
| Quora | Q&A content | ✅ Full | ⭐⭐⭐⭐ |
| Facebook Ad Library | Competitor ads | ✅ Full | ⭐⭐⭐⭐⭐ |
| Facebook Groups | Private discussions | ❌ Manual | ⭐⭐⭐⭐⭐ |
| Competitor Products | Backend intel | 🔄 HITL | ⭐⭐⭐⭐⭐ |
| Sales Calls | Pricing/process | 🔄 HITL | ⭐⭐⭐⭐⭐ |

---

## Appendix B: LLM Model Selection

| Task | Recommended Model | Fallback |
|------|-------------------|----------|
| Sophistication Filter | Workers AI llama-3.1-70b | OpenAI GPT-4 |
| Halo Extraction | Workers AI llama-3.1-70b | OpenAI GPT-4 |
| Visual Cues | Workers AI llama-3.1-8b | Workers AI 70b |
| Dream Buyer Avatar | Workers AI llama-3.1-70b | OpenAI GPT-4 |
| Competitor Analysis | Workers AI llama-3.1-70b | OpenAI GPT-4 |
| Godfather Offer | OpenAI GPT-4 | Workers AI 70b |
| HVCO Generation | OpenAI GPT-4 | Workers AI 70b |
| Skeptical Critic | OpenAI GPT-4 | - |
| Embeddings | Workers AI bge-base-en | - |

---

## Appendix C: Key Terminology

| Term | Definition |
|------|------------|
| **Halo Strategy** | Market research methodology to "camp out inside the mind of the dream buyer" |
| **Golden Pheasant** | Competitive intelligence gathering by purchasing competitor products |
| **Godfather Offer** | An irresistible offer with 7 pillars that "only a lunatic would refuse" |
| **HVCO** | High-Value Content Offer (free report, video, etc.) |
| **Power 4%** | Top 4% of market who generate 64% of revenue (Pareto²) |
| **HITL** | Human-in-the-Loop - manual user actions within automated workflow |
| **Sophistication Filter** | LLM classifier that separates Power 4% from tire kickers |
| **Vernacular** | Industry-specific jargon that signals insider status |
| **Crack Bait** | HVCO title compelling enough to stop scrolling |

---

*End of Project Plan*
