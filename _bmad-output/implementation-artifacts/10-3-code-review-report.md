# Code Review: Story 10.3 - Strategic Pillar Synthesis

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Story:** 10-3 - Strategic Pillar Synthesis
**Author:** @bmad-agent-bmm-dev
**Reviewer:** @bmad-agent-bmm-dev
**Status:** ✅ **Approved with Conditions**
**Date:** 2026-01-01

---

## 1. Review Summary

The conceptual implementation for the Strategic Pillar Synthesis agent is **approved**. This is a well-designed concept that correctly identifies the inputs (Brand DNA, Market Intel) and outputs (Pillar Suggestions) for this critical step.

The proposed architecture, featuring a `strategyAgent.ts` triggered by the `researchAgent`, is an excellent example of our desired asynchronous, chained-agent workflow. The plan to use a dedicated prompt to enforce the **TEACH, ENTERTAIN, ENGINEER** framework is a key insight and is crucial for delivering value.

## 2. Checklist

| Category | Item | Status | Notes |
|---|---|:---:|---|
| **Clarity** | Follows existing patterns | ✅ | Continues the agent-based architecture. |
| | Clear separation of concerns | ✅ | `strategyAgent` is distinct from `researchAgent`; `strategyPrompts` is also separate. |
| **Correctness** | Meets all Acceptance Criteria | ✅ | The concept directly addresses mapping inputs to frameworks and generating pillar options. |
| | Handles state management | ✅ | Proposes a `brand_pillar_suggestions` table with `status` and `version` columns, which is essential for the approval flow (10-4) and iteration (10-5). |
| **Security** | PII Handling | ✅ | The agent correctly uses data already in our system (`clientId`) and doesn't introduce new PII exposure. |
| **Performance**| Avoids blocking operations | ✅ | The asynchronous trigger from the previous agent is the correct pattern. |
| | Scalability | ⚠️ | A high-capability LLM is specified. We need to monitor latency and cost for this step. |
| **Tooling** | Appropriate tool selection| ✅ | Acknowledges the need for a powerful LLM for this synthesis task. |
| **Testing** | Testability | ✅ | The design is modular and testable, with clear mocking points for the DB and LLM. |

## 3. Actionable Feedback & Conditions for Approval

The concept is approved, but the implementation must address the following:

1.  **🔴 CRITICAL: Prompt Robustness & Output Parsing:** The success of this ENTIRE story hinges on the quality of the prompt in `strategyPrompts.ts` and our ability to reliably parse the LLM's output.
    - **Action:**
        - The prompt **must** be extensively tested. Use multiple examples of Brand DNA and Market Intel reports to see how it performs.
        - The prompt **must** include few-shot examples demonstrating the exact JSON output structure required.
        - The `llm.generateJSON` function **must** be wrapped in a Zod schema or similar validation library to parse the output. Implement a retry mechanism (e.g., up to 3 times) if the output does not match the schema. If it still fails, the job must be marked as `failed` in the `brand_pillar_suggestions` table.

2.  **🟡 MAJOR: Cost & Latency Monitoring:** This step is likely to be the most expensive and slowest part of the onboarding pipeline.
    - **Action:**
        - Wrap the `llm.generateJSON` call in timers and log the duration and cost (if available from the provider) for each run.
        - Set a hard timeout (e.g., 3 minutes) for the `generatePillars` function. A user should not be waiting indefinitely.

3.  **🟢 MINOR: Input Data Sanitization:**
    - **Action:** Before injecting the Brand DNA and Market Intel into the prompt, ensure the data is truncated to a reasonable length to avoid excessively long (and expensive) prompts. The LLM doesn't need every single word, just the key signals and summaries.

---

**Conclusion: Concept approved. This is the heart of the "AI Strategist" feature; robust implementation of the prompting and parsing is non-negotiable.**
