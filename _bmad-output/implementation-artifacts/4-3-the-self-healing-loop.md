# Story 4.3: The Self-Healing Loop

**Status:** completed
**Story Points:** 5
**Sprint:** 3
**Epic:** 4 - Spoke Generation & Quality Assurance

## Story

As a **system**,
I want **failed spokes to be automatically regenerated with corrective feedback**,
So that **the final review queue contains only high-quality, compliant content**.

## Acceptance Criteria

### AC1: Trigger Regeneration on Gate Failure
**Given** a spoke has been evaluated by the Critic Agent (Story 4.2)
**When** one or more quality gates (G2, G4, G5) fail
**Then** the Self-Healing Loop is triggered
**And** a new generation attempt is started for that spoke

### AC2: Contextual Feedback Injection
**Given** a spoke is being regenerated due to failure
**When** the prompt is constructed for the Creator Agent
**Then** the specific feedback and violations from `feedback_log` are included
**And** the prompt explicitly instructs the AI to fix these specific issues

### AC3: Iteration Capping
**Given** a spoke is in the healing loop
**When** the `generation_attempt` reaches 3
**Then** the loop stops
**And** the spoke status is set to `failed_qa`
**And** it is flagged for manual intervention in the Creative Conflict Escalation (Story 4.4)

### AC4: Success Transition
**Given** a healed spoke passes all quality gates
**When** the evaluation completes
**Then** status is set to `ready_for_review`
**And** the `feedback_log` is updated with `healing_attempt` incremented

## Tasks / Subtasks

- [x] **Task 1: Workflow Extension** (AC: #1, #3)
  - [x] Update `SpokeGenerationWorkflow` to include a healing loop
  - [x] Implement retry logic using `generation_attempt` counter
  - [x] Add condition to stop loop after 3 attempts

- [x] **Task 2: Feedback Prompting** (AC: #2)
  - [x] Create `buildHealedPrompt` function in `packages/agent-logic/prompts/spoke-prompts.ts`
  - [x] Integrate feedback from `feedback_log` into the prompt
  - [x] Add "Critic's Notes" section to the creator prompt

- [x] **Task 3: Status Management** (AC: #4)
  - [x] Implement transition to `failed_qa` when cap is reached
  - [x] Ensure `ready_for_review` is set only after all gates pass

## Dev Notes

### Healing Loop Logic

```typescript
async function healingLoop(spoke, attempt = 1) {
  if (attempt > 3) {
    await updateSpokeStatus(spoke.id, 'failed_qa');
    return;
  }

  const feedback = await getLatestFeedback(spoke.id);
  const newContent = await creator.regenerate(spoke, feedback);
  const evaluation = await critic.evaluate(newContent);

  if (evaluation.overallPass) {
    await saveSpoke(spoke.id, newContent, 'ready_for_review');
  } else {
    await saveFeedback(spoke.id, evaluation.feedback);
    await healingLoop(spoke, attempt + 1);
  }
}
```

### Prompt Construction

```typescript
const HEALED_PROMPT = `
You previously generated content that FAILED quality assurance.
You must REWRITE it following the instructions below.

ORIGINAL CONTENT:
"""
${originalContent}
"""

CRITIC FEEDBACK:
${feedback}

SPECIFIC VIOLATIONS TO FIX:
${violations.map(v => `- ${v}`).join('\n')}

INSTRUCTION:
Rewrite the content to maximize hook strength while ensuring strict voice alignment and platform compliance.
`;
```