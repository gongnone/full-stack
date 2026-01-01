# Story 10.3: Strategic Pillar Synthesis Implementation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Status:** IMPLEMENTED
**Created:** 2026-01-01
**Lead:** @bmad-agent-bmm-dev

---

## 1. Summary

This document outlines the implementation of the "Strategy Agent," which is responsible for synthesizing the client's raw Brand DNA and the Market Intelligence Report into a set of actionable, strategic content pillars.

This agent is the core "brains" of the onboarding pipeline, translating raw data into strategic recommendations for the client to approve. It is triggered upon the successful completion of the Deep Research Agent (Story 10-2).

## 2. Technical Implementation

### High-Level Architecture

A new `strategyAgent.ts` module is created within the `packages/agent-logic` package. This agent is designed to be called by the `researchAgent` as the final step in its process, creating a chained sequence of asynchronous agent executions. The primary dependency is a powerful text-generation LLM capable of complex synthesis.

### Files Modified

| File Path | Change Description |
|-----------|--------------------|
| `packages/agent-logic/src/strategyAgent.ts` | Created |
| `packages/agent-logic/src/prompts/strategyPrompts.ts`| Created |
| `packages/agent-logic/src/researchAgent.ts` | Modified |
| `apps/foundry-dashboard/worker/db/schema.ts` | Modified |

### Implementation Details

**1. Triggering the Agent:**
- The `researchAgent.runMarketAnalysis` function (from Story 10-2) is modified.
- On successful creation of the `MarketIntelligenceReport`, it makes an asynchronous call to the new `strategyAgent.generatePillars`, passing the `clientId`.

**2. Strategy Agent (`strategyAgent.ts`):**
- The main function `generatePillars(clientId)` orchestrates the synthesis:
    - **a. Fetch Inputs:** It queries the database to retrieve:
        - The client's raw Brand DNA (e.g., tone analysis, keywords, stances from the voice capture).
        - The completed `MarketIntelligenceReport` from the `market_intelligence_reports` table.
    - **b. Formulate Synthesis Prompt:** A detailed prompt is constructed using `strategyPrompts.getSynthesisPrompt`. This is the most critical part of the implementation. The prompt instructs the LLM to act as an "AI Brand Strategist" and provides it with:
        - **Context:** "You are an expert brand strategist. Your job is to create 3 to 5 distinct, actionable content pillars for a client."
        - **Input Data:** The raw Brand DNA and the Market Intelligence Report are injected directly into the prompt as structured data (e.g., JSON).
        - **Frameworks:** The prompt explicitly introduces the **TEACH, ENTERTAIN, ENGINEER** frameworks, explaining what each one means (e.g., "TEACH pillars establish authority...", "ENTERTAIN pillars build community...").
        - **Instructions:** "For each proposed pillar, provide a `name`, a `rationale` explaining why it's a good fit based on the brand's voice and market gaps, and assign it to one of the frameworks (`TEACH`, `ENTERTAIN`, or `ENGINEER`)."
        - **Output Format:** The prompt specifies a strict JSON output format: `Array<{name: string, rationale: string, framework: 'TEACH' | 'ENTERTAIN' | 'ENGINEER'}>`.
    - **c. Generate Pillars:** The prompt is sent to a powerful LLM (e.g., via an abstracted `llm.generateJSON` call) to get the structured pillar suggestions.
    - **d. Store Proposed Pillars:** The resulting JSON array of pillar suggestions is saved to a new database table.

**3. Database Schema (`schema.ts`):**
- A new table, `brand_pillar_suggestions`, is added.
- **Columns:**
    - `id` (PK)
    - `client_id` (FK to `clients`)
    - `status` ('pending', 'awaiting_approval', 'approved', 'rejected')
    - `suggestions_data` (JSON) - Stores the array of pillar suggestions from the LLM.
    - `version` (Integer, default 1) - To track iterations if the client requests changes (Story 10-5).
    - `created_at`
    - `updated_at`

### Code Snippet: Conceptual `generatePillars`

```typescript
// packages/agent-logic/src/strategyAgent.ts

import { getSynthesisPrompt } from './prompts/strategyPrompts';
import { db, brand_pillar_suggestions, brand_dna, market_intelligence_reports } from 'db-schema';

export async function generatePillars(clientId: string) {
    // 1. Fetch inputs from DB
    const dna = await db.query.brand_dna.findFirst({ where: eq(brand_dna.clientId, clientId) });
    const marketIntel = await db.query.market_intelligence_reports.findFirst({ where: eq(market_intelligence_reports.clientId, clientId) });

    if (!dna || !marketIntel) {
        // Handle error: set status to failed
        return { success: false, error: 'Missing required inputs.' };
    }

    // 2. Create the synthesis prompt
    const prompt = getSynthesisPrompt(dna.data, marketIntel.report_data);

    // 3. Generate pillar suggestions via LLM
    // This function would be robust, with error handling and JSON parsing
    const pillarSuggestions = await llm.generateJSON(prompt); 

    // 4. Save suggestions to the database
    await db.insert(brand_pillar_suggestions).values({
        clientId,
        status: 'awaiting_approval',
        suggestions_data: pillarSuggestions,
        version: 1,
    });

    // 5. Trigger notification to client (handled in Story 10-4)
    // await notifyClientPillarsReady(clientId);

    return { success: true };
}
```

## 3. Tooling and Dependencies

- **High-Capability LLM:** This task requires a powerful text-generation model (e.g., GPT-4, Claude 3, Gemini Advanced) that excels at synthesis and following complex instructions with structured JSON output.
- **Database:** The system's primary database is used to orchestrate the state between the different agents and store the final output.

## 4. Testing

- **Unit Tests:**
    - `strategyPrompts.test.ts` will be created to ensure the prompt is correctly formatted with all required inputs.
    - `strategyAgent.test.ts` will test the main orchestration, mocking the database calls and the LLM response to ensure it handles success and failure cases correctly.
- **Integration Test:** An integration test will cover the chain from `researchAgent` to `strategyAgent`, verifying that the `brand_pillar_suggestions` table is populated after the sequence is triggered.

---
**END OF ARTIFACT**
