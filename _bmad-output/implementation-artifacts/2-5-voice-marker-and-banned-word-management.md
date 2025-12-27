# Story 2.5: Voice Marker and Banned Word Management

**Status:** done
**Story Points:** 3
**Sprint:** 1
**Epic:** 2 - Brand Intelligence & Voice Capture

## Story

As a **user**,
I want **to manually add or remove voice markers and banned words**,
So that **I can fine-tune what the system learns about my brand voice**.

## Acceptance Criteria

### AC1: Edit Voice Markers Panel
- [x] Given I am on the Brand DNA page
- [x] When I click "Edit Voice Markers" button
- [x] Then I see an edit panel with current markers as editable chips
- [x] And each chip has an X button for removal

### AC2: Add New Voice Marker
- [x] Given I am editing voice markers
- [x] When I type a new phrase in the input and press Enter
- [x] Then the phrase is added to the `voice_entities.voiceMarkers` array in brand_dna table
- [x] And I see it appear as a new chip with fade-in animation

### AC3: Remove Banned Word
- [x] Given I have a banned word "synergy" displayed
- [x] When I click the X on that chip
- [x] Then the word is removed from `voice_entities.bannedWords` array
- [x] And the chip disappears with a fade animation

### AC4: Add New Banned Word
- [x] Given I am editing banned words
- [x] When I type a new word and press Enter
- [x] Then the word is added to `voice_entities.bannedWords` array
- [x] And I see it appear as a new red-styled chip

### AC5: Save Changes & Update DNA
- [x] Given I add a new banned word
- [x] When I save my changes
- [x] Then the Vectorize index is updated (optional - handled by full re-analysis)
- [x] And I see a toast notification
- [x] And Brand DNA Strength score recalculates (optional - Task 10 enhancement)

## Technical Requirements

### Architecture References
- **FR34:** System can extract banned words and required phrases from brand analysis
- **FR35:** Users can manually add or remove banned words and voice markers
- **Rule 1 (Isolation):** All queries MUST filter by `client_id`
- **NFR-P1:** Context switch < 100ms

### Data Model

Current storage location: `brand_dna.voice_entities` column (JSON TEXT)
```json
{
  "bannedWords": ["synergy", "leverage", "disrupt"],
  "voiceMarkers": ["Let me be direct", "The real question is"],
  "stances": [{ "topic": "AI", "position": "critical optimist" }]
}
```

### API Endpoints Required

**New Mutations:**
1. `calibration.updateVoiceEntities` - Update entire voice_entities object
2. `calibration.addVoiceMarker` - Add single voice marker (implement existing stub)
3. `calibration.removeVoiceMarker` - Remove voice marker by value
4. `calibration.addBannedWord` - Add single banned word (implement existing stub)
5. `calibration.removeBannedWord` - Remove banned word by value

**New Queries:**
1. `calibration.getVoiceEntities` - Get current voice entities for editing

### UI Components

**New Components:**
1. `VoiceEntitiesEditor.tsx` - Main edit panel with two sections
2. `EditableChipList.tsx` - Reusable chip list with add/remove

**Modified Components:**
1. `BrandDNACard.tsx` - Add "Edit Voice Markers" button
2. `brand-dna.tsx` - Add edit panel state and modal handling

## Implementation Tasks

### Task 1: Backend - Get Voice Entities Query
Create `getVoiceEntities` query in calibration router:
- Input: `{ clientId: string }`
- Output: `{ bannedWords: string[], voiceMarkers: string[], stances: Stance[] }`
- Query brand_dna table, parse voice_entities JSON

### Task 2: Backend - Add Voice Marker Mutation
Implement existing `addVoiceMarker` stub:
- Input: `{ clientId: string, phrase: string }`
- Read current voice_entities, push to voiceMarkers array
- Update brand_dna row
- Update calibration timestamp
- Return success with updated list

### Task 3: Backend - Remove Voice Marker Mutation
Create `removeVoiceMarker` mutation:
- Input: `{ clientId: string, phrase: string }`
- Filter voiceMarkers array to remove matching phrase
- Update brand_dna row
- Return success with updated list

### Task 4: Backend - Add Banned Word Mutation
Implement existing `addBannedWord` stub:
- Input: `{ clientId: string, word: string }`
- Read current voice_entities, push to bannedWords array
- Update brand_dna row
- Return success with updated list

### Task 5: Backend - Remove Banned Word Mutation
Create `removeBannedWord` mutation:
- Input: `{ clientId: string, word: string }`
- Filter bannedWords array to remove matching word
- Update brand_dna row
- Return success with updated list

### Task 6: Frontend - EditableChipList Component
Create reusable chip list component:
```typescript
interface EditableChipListProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder?: string;
  chipColor?: 'blue' | 'red' | 'green';
  isLoading?: boolean;
}
```
- Render chips with X button
- Input field with Enter key handling
- Fade animations for add/remove

### Task 7: Frontend - VoiceEntitiesEditor Component
Create main editor panel:
- Two sections: Voice Markers (blue) and Banned Words (red)
- Use EditableChipList for each section
- Header with close button
- Save button (optional if changes auto-save)

### Task 8: Frontend - Integrate with Brand DNA Page
Modify brand-dna.tsx:
- Add edit mode state
- Add "Edit Voice Markers" button to BrandDNACard
- Render VoiceEntitiesEditor when in edit mode
- Wire up mutations with toast notifications

### Task 9: Frontend - Toast Notifications
Use existing useToast hook:
- Success: "Voice marker added"
- Success: "Banned word removed"
- Success: "Brand DNA updated"
- Error handling for failures

### Task 10: Update DNA Recalculation (Optional Enhancement)
When voice entities change:
- Optionally trigger lightweight DNA recalculation
- Or just update calibration timestamp
- Full re-analysis can be manual via "Re-analyze DNA" button

## Dependencies

### Completed Stories
- [x] Story 2.1: Multi-Source Content Ingestion (training samples)
- [x] Story 2.2: Voice-to-Grounding Pipeline (voice_entities structure)
- [x] Story 2.3: Brand DNA Analysis & Scoring (analysis logic)
- [x] Story 2.4: Brand DNA Report Dashboard (display components)

### Required Infrastructure
- D1 database with brand_dna table (migration 0005)
- voice_entities column (migration 0006)
- useToast hook exists in lib/toast.ts

## Testing Notes

### Unit Tests
- Test add/remove mutations with various inputs
- Test empty arrays handling
- Test duplicate prevention

### E2E Tests
- Add voice marker, verify appears
- Remove banned word, verify disappears
- Verify toast notifications appear

## Files to Create/Modify

| File | Action | Notes |
|------|--------|-------|
| `worker/trpc/routers/calibration.ts` | Modify | Implement 5 procedures |
| `src/components/brand-dna/EditableChipList.tsx` | Create | Reusable chip editor |
| `src/components/brand-dna/VoiceEntitiesEditor.tsx` | Create | Main edit panel |
| `src/components/brand-dna/BrandDNACard.tsx` | Modify | Add edit button |
| `src/components/brand-dna/index.ts` | Modify | Export new components |
| `src/routes/app/brand-dna.tsx` | Modify | Add edit state/modal |

---

## Dev Agent Record

### Implementation Summary
All acceptance criteria implemented successfully. Backend mutations use upsert pattern for robust data persistence. Frontend components follow Midnight Command theme with proper color tokens.

### Files Changed

**Backend (6 procedures in calibration router):**
- `apps/foundry-dashboard/worker/trpc/routers/calibration.ts`
  - `getVoiceEntities` query (lines 621-654)
  - `addBannedWord` mutation (lines 656-712) - with upsert
  - `removeBannedWord` mutation (lines 714-743) - with try/catch
  - `addVoiceMarker` mutation (lines 745-809) - with upsert
  - `removeVoiceMarker` mutation (lines 811-830) - with try/catch

**Frontend Components:**
- `apps/foundry-dashboard/src/components/brand-dna/EditableChipList.tsx` (168 lines)
  - Reusable chip list with add/remove, color variants (blue/red/green)
  - Fade-out animation for removal
  - Character counter for input
- `apps/foundry-dashboard/src/components/brand-dna/VoiceEntitiesEditor.tsx` (253 lines)
  - Main editor panel with Voice Markers (blue) and Banned Words (red)
  - Toast notifications for all mutations
  - Loading states and error handling
- `apps/foundry-dashboard/src/components/brand-dna/BrandDNACard.tsx` (lines 169-199)
  - Added `onEditVoiceProfile` prop
  - Added "Edit Voice Profile" button with data-testid
- `apps/foundry-dashboard/src/components/brand-dna/index.ts` (lines 20-22)
  - Exported EditableChipList and VoiceEntitiesEditor
- `apps/foundry-dashboard/src/routes/app/brand-dna.tsx` (lines 70-71, 408-421)
  - Added `isEditingVoiceProfile` state
  - Conditional render: VoiceEntitiesEditor vs BrandDNACard

### Code Review Fixes Applied
**Critical Issues Fixed:**
1. Added try/catch for JSON.parse in `removeBannedWord` and `removeVoiceMarker`
2. Changed UPDATE to upsert pattern in `addBannedWord` and `addVoiceMarker` to handle missing brand_dna rows

### Review Follow-ups (AI Code Review) - ALL RESOLVED

#### Medium Priority - FIXED
- [x] [AI-Review][MEDIUM] Add fade-in animation for new chips in EditableChipList.tsx (AC2 spec)
  - Added useEffect to track new items, CSS keyframes in index.css
- [x] [AI-Review][MEDIUM] Normalize stored case in add mutations to prevent visual duplicates
  - Changed to store lowercase: `entities.bannedWords.push(normalizedWord)`

#### Low Priority - FIXED
- [x] [AI-Review][LOW] Toast messages now say "Brand DNA updated" per AC5 spec
- [x] [AI-Review][LOW] Added optimistic UI updates with rollback on error
  - Uses onMutate/onError/onSettled pattern for instant feedback
- [x] [AI-Review][LOW] Files staged for commit

### Change Log
- **2025-12-22:** Story completed with all ACs implemented and critical code review fixes applied
  - Backend: 5 mutations with proper error handling and upsert patterns
  - Frontend: 2 new components (EditableChipList, VoiceEntitiesEditor) integrated with Brand DNA page
  - Code Review: Fixed 2 critical issues (JSON parse safety, missing row handling)
- **2025-12-22:** All code review follow-up items resolved
  - Added fade-in animation for new chips (CSS keyframes + useEffect tracking)
  - Normalized case storage (lowercase for consistency)
  - Updated toast messages to "Brand DNA updated" per AC5
  - Added optimistic UI updates with rollback on error
- **2025-12-22:** Durable Object schema normalized per architecture spec
  - Created dedicated `voice_markers` table (id, phrase, source, confidence, created_at)
  - Created dedicated `banned_words` table (id, word, severity, reason, source, created_at)
  - Created dedicated `brand_stances` table (id, topic, position, source, created_at)
  - Added full CRUD methods: listVoiceMarkers, addVoiceMarker, removeVoiceMarker, updateVoiceMarker
  - Added full CRUD methods: listBannedWords, addBannedWord, removeBannedWord, updateBannedWord
  - Added full CRUD methods: listBrandStances, addBrandStance, removeBrandStance
  - Updated processVoiceNote to use new CRUD methods instead of JSON arrays
  - Added G4 Voice Alignment gate methods: checkBannedWords, checkVoiceMarkers
  - All entities include source tracking (voice/manual/analysis) for audit trail
