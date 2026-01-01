# Code Review: Story 10.2 - Deep Research Agent

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Story:** 10-2 - Deep Research Agent
**Author:** @bmad-agent-bmm-dev
**Reviewer:** @bmad-agent-bmm-dev
**Status:** ✅ **Approved with Conditions**
**Date:** 2026-01-01

---

## 1. Review Summary

The conceptual implementation for the Deep Research Agent is **approved**. The proposed architecture is sound, fits within our existing agent-based patterns, and correctly identifies the necessary components and external tooling (`google_web_search`, LLM).

The plan to create a new `researchAgent.ts` module inside the `agent-logic` package is the correct approach. The proposed database schema for `market_intelligence_reports` is appropriate and includes the necessary status tracking.

This is a strong conceptual foundation for a critical feature.

## 2. Checklist

| Category | Item | Status | Notes |
|---|---|:---:|---|
| **Clarity** | Follows existing patterns | ✅ | Proposes a new agent module, similar to other agent logic. Uses tRPC for orchestration. |
| | Clear separation of concerns | ✅ | Correctly separates orchestration (`researchAgent.ts`), prompts (`researchPrompts.ts`), and triggering logic (`onboarding.ts`). |
| **Correctness** | Meets all Acceptance Criteria | ✅ | The concept covers analyzing the market, performing web searches, and producing a report. |
| | Handles state management | ✅ | The proposed `market_intelligence_reports` table with a `status` column is crucial for tracking this long-running, asynchronous job. |
| **Security** | No secrets in code | ✅ | Assumes API keys for search/LLMs will be handled via environment variables, consistent with existing practice. |
| | Data handling | ✅ | Proposes storing the final report in our own DB, which is good. We are not storing raw search results long-term. |
| **Performance** | Avoids blocking operations | ✅ | The agent is correctly designed to be triggered asynchronously from the main onboarding flow. |
| **Tooling** | Appropriate tool selection | ✅ | `google_web_search` is the right tool for this job. The abstraction of an `llm.generate` call is also correct. |
| **Testing** | Testability | ✅ | The proposed design is highly testable, with clear boundaries for mocking external services. |

## 3. Actionable Feedback & Conditions for Approval

The concept is approved, but the following conditions must be met during actual implementation.

1.  **🔴 CRITICAL: Cost and Performance Guardrails:** Web search and powerful LLM calls can be expensive and slow.
    - **Action:** The implementation **must** include strict guardrails.
        - Limit the number of search queries (e.g., max 5 per run).
        - Limit the number of search results processed (e.g., top 3-5 snippets per query).
        - Use a faster, cheaper LLM for the synthesis step if possible. The goal is a "good enough" report, not a perfect dissertation.
        - Implement a timeout for the entire process (e.g., 5 minutes) to prevent runaway jobs.

2.  **🟡 MAJOR: Error Handling & State:**
    - **Action:** The `market_intelligence_reports` table's `status` must be robustly managed. If a search fails or the LLM call errors out, the status must be set to `failed` and the error message should be logged. The user/agency needs to see that something went wrong. A retry mechanism (e.g., once after a 60-second delay) should be considered.

3.  **🟡 MAJOR: Prompt Engineering:**
    - **Action:** The prompts in `researchPrompts.ts` are critical. They must be carefully engineered to be concise and produce structured, predictable JSON output from the synthesis LLM. Use few-shot examples in the prompt to guide the model.

4.  **🟢 MINOR: Vectorization:**
    - The epic mentions "Vectorize: Proven hooks in their vertical." This conceptual artifact defers that work. This is an acceptable simplification for the initial implementation, but we must create a follow-up story to build the vector database of "proven hooks" to make this agent truly powerful.

---

**Conclusion: Concept approved. Proceed with implementation, ensuring the above conditions are met.**
