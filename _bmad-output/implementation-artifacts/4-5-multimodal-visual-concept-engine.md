# Story 4.5: Multimodal Visual Concept Engine

Status: done

## Story

As a **user**,
I want **visual concepts and image prompts generated for my content**,
So that **I have complete assets ready for publishing**.

## Acceptance Criteria

### AC1: Visual Concept Generation
**Given** a spoke is being generated
**When** the Creator Agent finishes the text content
**Then** it automatically generates a visual concept including:
- Visual Archetype (e.g., Bold Contrast, Minimalist)
- Thumbnail Concept description
- Detailed Image Prompt for AI generation

### AC2: G6 Quality Gate
**Given** a visual concept is generated
**When** the Critic Agent evaluates it
**Then** the G6 (Visual Metaphor) gate checks for:
- AI visual clichés (robot brains, handshakes, lightbulbs, etc.)
- Brand alignment with visual identity
- Returns a score 0-100

### AC3: Self-Healing for Visuals
**Given** a visual concept fails the G6 gate
**When** the Self-Healing Loop triggers
**Then** the Creator Agent regenerates the visual concept addressing the Critic's feedback
**And** avoids the detected clichés.

### AC4: Multi-Tenant Schema Support
**Given** the Durable Object stores spokes
**When** a new spoke is created
**Then** the SQLite schema supports storing visual archetype, concept, and prompt.

### AC5: Visual Display in Review
**Given** I am in the Sprint Review
**When** I view a content card
**Then** I see the visual concept, archetype, and image prompt displayed
**And** the G6 score is visible.

## Tasks / Subtasks

- [x] **Task 1: Foundry Core Types**
  - [x] Update `spokeSchema` in `zod/index.ts` to include visual fields
  - [x] Ensure types are re-exported

- [x] **Task 2: Agent System Gates**
  - [x] Enhance `runG6Visual` in `packages/agent-system/src/quality-gates/index.ts`
  - [x] Implement cliché detection prompt for LLM

- [x] **Task 3: Foundry Engine DO Schema**
  - [x] Update `ClientAgent` to include visual concept fields in `spokes` table
  - [x] Update CRUD methods (`getSpoke`, `updateSpoke`, `listSpokes`)

- [x] **Task 4: Spoke Generation Workflow**
  - [x] Add Step 3.5: Visual Concept Generation to `SpokeGenerationWorkflow.ts`
  - [x] Integrate G6 evaluation into the quality gate loop
  - [x] Implement self-healing logic for visual concept failures

- [x] **Task 5: Frontend Component**
  - [x] Create `ContentCard.tsx` in `apps/foundry-dashboard/src/components/review/`
  - [x] Implement visual concept engine display section

## Implementation Notes

- **G6 Gate:** Threshold set to 70. Fails if score < 70 or if clichés are detected.
- **AI Models:** Using `llama-3.1-70b-instruct` for visual strategy and `llama-3.1-8b-instruct` for critique.
- **Schema:** Added `visual_archetype`, `image_prompt`, and `thumbnail_concept` to `spokes` table.
