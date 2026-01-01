# Story 10.2: Deep Research Agent Implementation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Status:** IMPLEMENTED
**Created:** 2026-01-01
**Lead:** @bmad-agent-bmm-dev

---

## 1. Summary

This document outlines the implementation of the "Deep Research Agent," a core component of the Strategic Brand Onboarding pipeline. This agent's purpose is to autonomously research a client's market based on the initial signals from their Brand DNA capture, producing a "Market Intelligence Report" that will inform the subsequent strategy synthesis phase.

The agent is triggered after a client successfully completes the Brand DNA voice capture.

## 2. Technical Implementation

### High-Level Architecture

The Deep Research Agent is implemented as a new module within the `agent-logic` package. It leverages a new tRPC procedure to orchestrate the research process, which involves web searches and data analysis.

### Files Modified

| File Path | Change Description |
|-----------|--------------------|
| `packages/agent-logic/src/researchAgent.ts` | Created |
| `packages/agent-logic/src/prompts/researchPrompts.ts` | Created |
| `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts` | Modified |
| `apps/foundry-dashboard/worker/db/schema.ts` | Modified |

### Implementation Details

**1. Triggering the Agent:**
- The `onboarding.submitBrandDNA` tRPC procedure in `onboarding.ts` is modified.
- After successfully processing the Brand DNA data, it now makes an asynchronous call to a new `researchAgent.runMarketAnalysis` procedure, passing the `clientId` and key signals extracted from the Brand DNA (e.g., `industry`, `market_keywords`).

**2. Research Agent (`researchAgent.ts`):**
- A new file `packages/agent-logic/src/researchAgent.ts` contains the core orchestration logic.
- The main function `runMarketAnalysis` executes a series of steps:
    - **a. Identify Industry:** Takes the `industry` string provided by the client (e.g., "Executive Coaching for Tech Leaders").
    - **b. Formulate Search Queries:** Uses a simple prompt-based approach (from `researchPrompts.ts`) to generate a set of search queries. Examples:
        - "top performers in executive coaching for tech leaders"
        - "common challenges for tech leaders 2026"
        - "proven content marketing hooks for B2B coaching"
    - **c. Execute Web Search:** Iterates through the queries and uses the `google_web_search` tool to fetch the top 5 results for each.
    - **d. Synthesize Findings:** The search results (snippets and URLs) are compiled. A secondary prompt is used to synthesize this information into a structured `MarketIntelligenceReport`. This prompt asks the LLM to identify:
        - Key Competitors
        - Common Customer Pain Points
        - Popular Content Themes/Topics
        - Winning Content Formats (e.g., "blog posts", "short-form video", "podcasts")
    - **e. Store Report:** The resulting JSON report is saved to a new database table.

**3. Database Schema (`schema.ts`):**
- A new table, `market_intelligence_reports`, is added to the database schema.
- **Columns:**
    - `id` (PK)
    - `client_id` (FK to `clients`)
    - `status` ('pending', 'in_progress', 'completed', 'failed')
    - `report_data` (JSON) - Stores the structured report.
    - `created_at`
    - `updated_at`

### Code Snippet: Conceptual `runMarketAnalysis`

```typescript
// packages/agent-logic/src/researchAgent.ts

import { google_web_search } from 'some-tool-wrapper'; // Assumes a wrapper for the tool
import { getResearchQueries, getSynthesisPrompt } from './prompts/researchPrompts';
import { db, market_intelligence_reports } from 'db-schema'; // Assumed db access

export async function runMarketAnalysis(clientId: string, industry: string, keywords: string[]) {
    // 1. Set status to in_progress
    await db.update(market_intelligence_reports).set({ status: 'in_progress' }).where(eq(market_intelligence_reports.clientId, clientId));

    // 2. Generate search queries
    const queries = getResearchQueries(industry, keywords);

    // 3. Perform web searches
    let searchResults = [];
    for (const query of queries) {
        const results = await google_web_search.run({ query, max_results: 5 });
        searchResults.push(...results.snippets); // simplified
    }

    // 4. Synthesize results with an LLM call
    const synthesisPrompt = getSynthesisPrompt(searchResults.join('\n'));
    const reportData = await llm.generate(synthesisPrompt); // llm is a placeholder

    // 5. Save the report
    await db.update(market_intelligence_reports)
        .set({ status: 'completed', report_data: reportData })
        .where(eq(market_intelligence_reports.clientId, clientId));
    
    return { success: true };
}
```

## 3. Tooling and Dependencies

- **`google_web_search`:** This is the primary external tool used for market research. The implementation relies on its ability to return relevant snippets and URLs.
- **LLM for Synthesis:** A text-generation model is required to process the raw search results into a structured report. The specific model is abstracted via an `llm.generate` call.
- **Database:** The system's primary database (SQLite/Turso) is used to store the resulting report.

## 4. Testing

- **Unit Tests:**
    - Test query generation in `researchPrompts.test.ts`.
    - Test the orchestration in `researchAgent.test.ts`, mocking the `google_web_search` tool and the LLM call.
- **Integration Test:** An integration test will verify that calling `onboarding.submitBrandDNA` correctly inserts a 'pending' record into the `market_intelligence_reports` table and triggers the research agent.

---
**END OF ARTIFACT**
