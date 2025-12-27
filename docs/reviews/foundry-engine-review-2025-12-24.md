# Self-Correction Review: Foundry Engine (2025-12-24)

## Feature Overview
System-wide audit for hardcoded values, magic numbers, and error-handling gaps in `apps/foundry-engine`.

## Findings

### 1. Hardcoded Magic Numbers & Timeouts
- **Location:** `apps/foundry-engine/src/workflows/hub-ingestion.ts`
  - Extraction prompt asks for "3-5 unique content pillars" (Line 92).

### 2. Lack of Centralized Constants
- **Location:** `apps/foundry-engine/src/workflows/hub-ingestion.ts`
  - Embedding model `@cf/baai/bge-base-en-v1.5` (Line 75) is hardcoded.
  - LLM model `@cf/meta/llama-3.1-70b-instruct` (Line 103) is hardcoded.
  - Platforms array `['twitter', 'linkedin', 'tiktok', 'instagram', 'thread']` (Line 132) is hardcoded.

### 3. Error Handling Gaps
- **Location:** `apps/foundry-engine/src/workflows/hub-ingestion.ts`
  - Regex for JSON parsing `responseText.match(/\[[\s\S]*\]/)` (Line 111) is fragile and could fail if AI outputs multiple arrays or malformed text.
  - Fallback logic (Line 116) just returns a default object without logging the specific failure reason or alerting the user via `broadcastHubStatus`.

### 4. Code Quality & Maintenance
- **Location:** `apps/foundry-engine/src/workflows/hub-ingestion.ts`
  - Step 5 and Step 7 are marked as "simplifications" (Line 127, 164) and lack full implementation for Hub status updates.

## Recommended Fixes

### Critical
- [ ] Centralize model names into `repo/agent-logic`.
- [ ] Use a more robust JSON parsing utility for AI responses.
- [ ] Implement the missing Hub status updates in the ingestion workflow to prevent UI desync.

### Structural
- [ ] Unify the `platforms` and `psychological_angles` definitions between `data-service` and `foundry-engine` to prevent divergent logic.
