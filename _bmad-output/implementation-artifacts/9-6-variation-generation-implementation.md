# Story 9.6: Variation Generation Implementation

## Status: ready-for-dev

## Story Summary
Implement the spoke variation/regeneration feature. Currently marked with TODO comment - users can trigger variation but it doesn't actually generate new content.

## Business Value
Clone & Variations (FR29, Story 5.5) is a key feature allowing users to generate multiple versions of high-performing content. Without real variation generation, users cannot efficiently scale their best content.

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Clicking "Generate Variation" creates a new spoke with different content | TODO |
| AC2 | Variations maintain core message but vary in style/approach | TODO |
| AC3 | Variation generation triggers CONTENT_ENGINE workflow | TODO |
| AC4 | User can generate up to 5 variations of a spoke | TODO |
| AC5 | Variations linked to parent spoke for tracking | TODO |

## Technical Details

### Current Problem
**File:** `apps/foundry-dashboard/worker/trpc/routers/spokes.ts:180+`

```typescript
// TODO: Trigger variation generation via CONTENT_ENGINE
```

### Required Implementation
1. Create variation request with parent spoke reference
2. Send to CONTENT_ENGINE workflow with variation instructions
3. Store new spoke with `parent_spoke_id` reference
4. Return generated variation to frontend

### Variation Strategy
- Use parent spoke content as seed
- Apply variation prompts: "Create an alternative version that..."
  - Uses different hook approach
  - Varies sentence structure
  - Maintains same key message
  - Adapts to same platform constraints

## Tasks

- [ ] Add `parent_spoke_id` column to spokes table
- [ ] Create `generateVariation` tRPC mutation
- [ ] Implement variation workflow in CONTENT_ENGINE
- [ ] Update UI to show variation relationship
- [ ] Add limit of 5 variations per spoke
- [ ] Write integration tests

## File List
(To be updated during implementation)

## Change Log
| Date | Change |
|------|--------|
| 2025-12-28 | Story created from codebase audit findings |
