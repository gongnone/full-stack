# Self-Correction Review: Data Service (2025-12-24)

## Feature Overview
System-wide audit for hardcoded values, magic numbers, and error-handling gaps in `apps/data-service`.

## Findings

### 1. Hardcoded Magic Numbers & Timeouts
- **Location:** `apps/data-service/src/workflows/spoke-generation-workflow.ts`
  - `while (attempt <= 3)` (Line 64) - Maximum generation attempts is hardcoded.
  - `totalTasks = pillars.length * PSYCHOLOGICAL_ANGLES.length` (Line 41) - Logic depends on local array length.

### 2. Lack of Centralized Constants
- **Location:** `apps/data-service/src/workflows/spoke-generation-workflow.ts`
  - `PSYCHOLOGICAL_ANGLES` array (Line 15) is local and should be shared with the frontend.
  - AI model name `@cf/meta/llama-3-8b-instruct` (Line 84) is hardcoded.

### 3. Error Handling Gaps
- **Location:** `apps/data-service/src/workflows/spoke-generation-workflow.ts`
  - Database inserts (Line 138, 160, 183) are not wrapped in transactions or granular try/catch blocks within the step.
  - If `this.env.AI.run` fails, the loop might crash without updating the workflow run status to 'failed' (Line 84).

### 4. Code Quality & Maintenance
- **Location:** `apps/data-service/src/workflows/spoke-generation-workflow.ts`
  - Use of `as any` for CriticAgent initialization (Line 51).
  - Large loop body inside `step.do` (Line 47-198) makes granular step-restarts difficult.

## Recommended Fixes

### Critical
- [ ] Move AI configuration (Model names, attempt limits) to a shared `config.ts`.
- [ ] Align `PSYCHOLOGICAL_ANGLES` between `agent-logic` and `data-service`.
- [ ] Improve error reporting in Workflow steps to ensure `workflowRuns` status is always updated on failure.

### Structural
- [ ] Break down the large `generate-spokes` step into smaller, atomic Workflow steps for better reliability and observability.
