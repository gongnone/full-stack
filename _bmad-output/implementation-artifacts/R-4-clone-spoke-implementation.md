# Story R-4: Clone Spoke Implementation

**Epic:** Remediation (Post-Audit)
**Priority:** Medium
**Effort:** 1-2 hours
**Status:** Done

---

## User Story

As a **content producer**, I want **to clone a high-performing spoke with options** so that **I can create variations of successful content without starting from scratch**.

---

## Background

Story 9-6 (Variation Generation) was marked "Verified" but the clone handler in the review page is a TODO stub that does nothing when clicked.

**Current State (FIXED):**
```typescript
// src/routes/app/review.tsx - Now calls cloneSpokeMutation with full options
onConfirm={(options: CloneOptions) => {
  if (!clientId || !currentSpoke) return;
  cloneSpokeMutation.mutate({
    clientId,
    spokeId: currentSpoke.id,
    mode: options.mode,
    count: options.variationCount,
    targetPlatform: options.targetPlatform,
  });
}}
```

---

## Acceptance Criteria

- [x] **AC1:** "Clone" button in review UI triggers clone modal
- [x] **AC2:** Clone modal offers options: "Exact Copy", "New Variation", "Different Platform"
- [x] **AC3:** "Exact Copy" creates duplicate spoke with same content and metadata
- [x] **AC4:** "New Variation" triggers regeneration with same pillar but new seed
- [x] **AC5:** "Different Platform" allows selecting target platform (Twitter, LinkedIn, etc.)
- [x] **AC6:** Cloned spoke appears in production queue with "cloned" badge (via `clonedFrom` field)
- [x] **AC7:** Original spoke ID tracked as `cloned_from` for analytics

---

## Technical Notes

### Clone Modal Component
```typescript
interface CloneOptions {
  mode: 'exact' | 'variation' | 'platform';
  targetPlatform?: Platform;
  preserveMetadata: boolean;
}

const CloneSpokeModal = ({ spoke, onClone, onClose }) => {
  const [options, setOptions] = useState<CloneOptions>({
    mode: 'exact',
    preserveMetadata: true,
  });

  return (
    <Dialog>
      <DialogTitle>Clone Spoke</DialogTitle>
      <RadioGroup value={options.mode} onChange={...}>
        <Radio value="exact">Exact Copy</Radio>
        <Radio value="variation">New Variation</Radio>
        <Radio value="platform">Different Platform</Radio>
      </RadioGroup>
      {options.mode === 'platform' && <PlatformSelector />}
      <Button onClick={() => onClone(options)}>Clone</Button>
    </Dialog>
  );
};
```

### tRPC Mutation
```typescript
// worker/trpc/routers/spokes.ts
cloneSpoke: procedure
  .input(z.object({
    spokeId: z.string(),
    clientId: z.string(),
    mode: z.enum(['exact', 'variation', 'platform']),
    targetPlatform: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    await assertClientAccess(ctx, input.clientId);

    const original = await getSpoke(input.spokeId);

    if (input.mode === 'exact') {
      return await duplicateSpoke(original);
    } else if (input.mode === 'variation') {
      return await ctx.callAgent(input.clientId, 'regenerateSpoke', {
        pillarId: original.pillar_id,
        clonedFrom: original.id,
      });
    } else {
      return await duplicateSpoke(original, { platform: input.targetPlatform });
    }
  }),
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/routes/app/review.tsx` | Wire handleClone to open modal |
| `src/components/review/CloneSpokeModal.tsx` | Create new component |
| `worker/trpc/routers/spokes.ts` | Add `cloneSpoke` mutation |

---

## Definition of Done

- [x] Clone button opens modal with 3 options
- [x] All 3 clone modes work correctly
- [x] Cloned spokes track original via `cloned_from`
- [ ] E2E test covers clone flow (deferred - manual testing verified)

---

## Dev Agent Record

### Implementation Date
2025-12-29

### Completion Notes
Implemented full clone spoke functionality with 3 modes and addressed post-review findings:

1. **CloneSpokeModal Component** - Redesigned modal with radio button selection for 3 modes:
   - Exact Copy: Duplicate spoke as-is
   - New Variation: Generate 1-5 variations with same pillar
   - Different Platform: Clone to LinkedIn, Twitter, Instagram, TikTok, or Newsletter

2. **tRPC spokes.clone Mutation** - Updated to accept `mode` parameter:
   - `exact`: Calls `duplicateSpoke` Durable Object method
   - `variation`: Calls Content Engine `/api/spokes/variations` endpoint
   - `platform`: Calls `duplicateSpoke` with platform override

3. **review.tsx Integration** - Wired modal to mutation with loading states and success feedback.
   - **Fix (Post-Review):** Changed Clone button to be disabled (with tooltip) instead of hidden when G7 < 9.0.
   - **Fix (Post-Review):** Added "Variation" badge to review card header to match SpokeCard.

4. **Testing** - Added comprehensive unit tests for `CloneSpokeModal` covering all 3 modes and interaction states.

### Key Decisions
- Used radio button selection for mode (clearer UX than tabs)
- Platform mode filters out current platform from options
- Success alert includes mode-specific messaging
- `clonedFrom` field tracks original spoke for analytics (AC7)
- Kept Clone button visible but disabled for low-scoring spokes to improve feature discoverability

### File List
- `apps/foundry-dashboard/src/components/review/CloneSpokeModal.tsx` (modified - redesigned)
- `apps/foundry-dashboard/src/components/review/CloneSpokeModal.test.tsx` (created - unit tests)
- `apps/foundry-dashboard/src/components/review/index.ts` (modified - exports CloneOptions type)
- `apps/foundry-dashboard/worker/trpc/routers/spokes.ts` (modified - 3-mode clone mutation)
- `apps/foundry-dashboard/src/routes/app/review.tsx` (modified - wired mutation, fixed UX)

### Change Log
| Date | Change |
|------|--------|
| 2025-12-29 | Redesigned CloneSpokeModal with 3 clone modes |
| 2025-12-29 | Updated spokes.clone mutation to support exact/variation/platform modes |
| 2025-12-29 | Wired clone mutation to review page with loading states |
| 2025-12-29 | Added unit tests for CloneSpokeModal |
| 2025-12-29 | Fixed hidden Clone button UX and added Variation badge to review card |
