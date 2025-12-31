# Story 10-2: Deep Research Agent

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P0
**Status:** ready
**Effort:** 6-8 hours
**Created:** 2025-12-29

---

## User Story

**As a** content strategist AI,
**I want** to research the client's market, competitors, and proven content strategies,
**So that** I can propose strategic brand pillars based on what actually works, not just what the client said.

## Context

After capturing raw Brand DNA (voice, content), the system needs to enrich this with market intelligence. This transforms Foundry from "voice mirror" to "strategic advisor." The research agent analyzes the client's industry, finds top performers, and identifies content patterns that drive engagement in their niche.

## Acceptance Criteria

### AC1: Trigger on Brand DNA Submission
- [ ] Automatically triggered after Story 10-1 submission completes
- [ ] Runs as background Cloudflare Workflow (non-blocking)
- [ ] Client sees "Researching your market..." status
- [ ] Agency dashboard shows "Brand DNA: Researching"

### AC2: Industry/Market Detection
- [ ] Extract industry signals from:
  - Voice transcription (mentions of market, customers, competitors)
  - Uploaded content themes
  - Client metadata (if provided: company name, website URL)
- [ ] Classify into primary vertical (e.g., "Executive Coaching", "B2B SaaS", "E-commerce")
- [ ] Identify sub-niche if possible (e.g., "Leadership coaching for tech founders")

### AC3: Web Research - Top Performers
- [ ] Search for top content creators in detected niche
- [ ] Analyze 5-10 top performers' content patterns:
  - Hook styles that work
  - Content formats (threads, carousels, videos)
  - Engagement patterns
  - Posting frequency
- [ ] Store findings in research_results table

### AC4: Vectorize Query - Proven Hooks
- [ ] Query existing hook database for client's vertical
- [ ] Find top 20 highest-performing hooks in similar niches
- [ ] Extract patterns: question hooks, contrarian takes, story hooks, etc.
- [ ] Calculate which hook types over-index for this market

### AC5: Competitive Gap Analysis
- [ ] Identify what competitors ARE doing (saturated angles)
- [ ] Identify what competitors are NOT doing (opportunity gaps)
- [ ] Flag potential differentiation opportunities
- [ ] Note: "Everyone does [X], consider [Y] instead"

### AC6: Content Framework Mapping
- [ ] Map research findings to proven content frameworks:

| Framework | Purpose | Example |
|-----------|---------|---------|
| **TEACH** | Build authority | "How to...", "The truth about...", Frameworks |
| **ENTERTAIN** | Build relatability | Stories, hot takes, industry humor |
| **ENGINEER** | Drive action | Pattern interrupts, curiosity gaps, CTAs |

- [ ] Score client's potential fit for each framework based on voice analysis
- [ ] Identify 2-3 primary frameworks that match client personality + market

### AC7: Research Report Generation
- [ ] Generate structured Market Intelligence Report:
```json
{
  "clientId": "...",
  "industry": "Executive Coaching",
  "subNiche": "Leadership for tech founders",
  "topPerformers": [...],
  "hookPatterns": {
    "contrarian": { "prevalence": 0.34, "avgEngagement": 2.3 },
    "story": { "prevalence": 0.28, "avgEngagement": 1.8 },
    ...
  },
  "competitiveGaps": [...],
  "frameworkFit": {
    "teach": 0.85,
    "entertain": 0.72,
    "engineer": 0.68
  },
  "recommendations": [...]
}
```
- [ ] Store report in D1 (client_research_reports table)
- [ ] Report available for Story 10-3 synthesis

### AC8: Status Updates
- [ ] Update client status: "Researching" → "Research Complete"
- [ ] Log research duration and sources used
- [ ] Trigger Story 10-3 (Strategic Pillar Synthesis)

### AC9: Error Handling
- [ ] If web search fails: proceed with Vectorize data only
- [ ] If no industry detected: prompt for manual input from agency
- [ ] If research times out (>5 min): deliver partial results, flag for review
- [ ] Never block on research failure — degrade gracefully

## Technical Implementation

### Database Schema
```sql
CREATE TABLE client_research_reports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  industry TEXT,
  sub_niche TEXT,
  top_performers_json TEXT,
  hook_patterns_json TEXT,
  competitive_gaps_json TEXT,
  framework_fit_json TEXT,
  recommendations_json TEXT,
  status TEXT DEFAULT 'pending', -- pending, complete, failed
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL
);
```

### Cloudflare Workflow
```typescript
// workflows/brand-research.ts
export class BrandResearchWorkflow extends WorkflowEntrypoint {
  async run(event: WorkflowEvent) {
    const { clientId, rawBrandDna } = event.payload;

    // Step 1: Industry detection
    const industry = await this.detectIndustry(rawBrandDna);

    // Step 2: Web research (with timeout)
    const topPerformers = await this.researchTopPerformers(industry);

    // Step 3: Vectorize hook patterns
    const hookPatterns = await this.queryHookDatabase(industry);

    // Step 4: Gap analysis
    const gaps = await this.analyzeCompetitiveGaps(topPerformers);

    // Step 5: Framework mapping
    const frameworkFit = await this.mapToFrameworks(rawBrandDna, hookPatterns);

    // Step 6: Store results
    await this.storeResearchReport(clientId, { ... });

    // Step 7: Trigger synthesis
    await this.triggerPillarSynthesis(clientId);
  }
}
```

### AI Prompts
```
INDUSTRY DETECTION PROMPT:
Given this voice transcription and content, identify:
1. Primary industry/vertical
2. Sub-niche if detectable
3. Target customer profile
4. Key differentiators mentioned

COMPETITIVE GAP PROMPT:
Given these top performers in [industry]:
[top_performers]

And this client's brand stance:
[brand_stance]

Identify:
1. Saturated content angles (everyone does this)
2. Gap opportunities (underserved angles)
3. Differentiation potential for this client
```

## Research Sources

| Source | Purpose | Fallback |
|--------|---------|----------|
| Web Search | Top performers, recent trends | Skip if unavailable |
| Vectorize | Proven hooks in vertical | Required |
| Brand DNA | Voice/tone signals | Required |
| (Future) Social APIs | Real engagement data | Not in MVP |

## Dependencies

- Story 10-1: Client Brand DNA Email Invitation ✅
- Vectorize: Hook database populated
- Workers AI: Text analysis and synthesis
- Web search capability (Workers AI or external)

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Submit Brand DNA for coach | Industry: "Coaching", research completes |
| Submit Brand DNA with unclear industry | Prompt agency for clarification |
| Web search timeout | Proceed with Vectorize data only |
| Research complete | Triggers Story 10-3, status updated |

## Out of Scope

- Real-time social media API integration (future)
- Manual research input from agency (future)
- Research customization settings (future)

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Research completes within 2 minutes for typical client
- [ ] Graceful degradation when sources unavailable
- [ ] Research report properly stored and retrievable
- [ ] Story 10-3 trigger working
- [ ] Agency can view research report in dashboard
