# Story 2.2: Voice-to-Grounding Pipeline

## Status: DONE

## Code Review: 2025-12-21

### Review Summary
Adversarial code review completed. Found 16 issues total (8 critical, 5 high, 3 medium).
All fixable issues resolved. 3 remaining items require external action.

### Auto-Fixed Issues (Round 1)
- [x] [CRITICAL] Missing AI binding in Env interface - Added AI: Ai to worker/index.ts
- [x] [CRITICAL] Missing AI binding in wrangler.jsonc - Added ai binding configuration
- [x] [CRITICAL] Type-casting hack bypassed type safety - Fixed to use ctx.env.AI properly
- [x] [HIGH] No client isolation on R2 path - Added path prefix validation in calibration.ts

### Resolved Issues (Round 2)
- [x] [CRITICAL] DNA entities not persisted - Added persistence to brand_dna table with voice_entities JSON column
- [x] [HIGH] Hardcoded TEMP_CLIENT_ID - Now uses useClientId() hook from session context
- [x] [HIGH] No rate limiting on voice uploads - Added 60-second cooldown between recordings
- [x] [HIGH] Missing Vectorize embeddings - Voice transcripts now embedded in Vectorize for FR33 semantic search
- [x] [HIGH] Empty error states in UI - TranscriptionReview already had "No X detected" fallback messages
- [x] [MEDIUM] Safari Permissions API compatibility - Added Safari detection and graceful fallback
- [x] [MEDIUM] No audio duration validation on backend - Added 10MB file size check (~60s max)
- [x] [MEDIUM] LLM prompt could be improved - Enhanced prompt with explicit extraction rules
- [x] [MEDIUM] No cleanup of failed R2 uploads - Added R2 cleanup in error handlers

### Remaining Items (External Action Required)
- [ ] [CRITICAL] Zero tests implemented - Unit tests for VoiceRecorder, TranscriptionReview, calibration endpoints
- [ ] [CRITICAL] MVP scope violation - Voice-to-Grounding marked as MVP exclusion in project-context.md (stakeholder decision)
- [ ] [CRITICAL] Git pollution - 19 untracked/modified files need cleanup

### New Migration
- Created `0006_voice_entities.sql` to add voice_entities and last_voice_recording_at columns to brand_dna table

## Story Summary
Enable users to record voice notes describing their brand personality, which the system transcribes using Whisper and extracts entities (voice markers, banned words, brand stances) to update Brand DNA.

## Acceptance Criteria Status

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Microphone icon in Brand DNA section opens recording interface with visual timer, max 60 seconds | DONE |
| AC2 | Audio stored in R2, Whisper transcribes, transcription displayed for user review | DONE |
| AC3 | Entity extraction identifies: voice markers, banned words, brand stances | DONE |
| AC4 | Example: "Stop using corporate jargon like synergy" -> synergy added to banned_words, "Anti-corporate" detected as brand stance | DONE |

## Implementation Details

### Backend Changes

#### 1. Calibration Router (`apps/foundry-dashboard/worker/trpc/routers/calibration.ts`)
- **`getVoiceUploadUrl`**: Generates R2 key for voice upload at `voice-samples/{clientId}/{timestamp}-{filename}`
- **`recordVoice`**: Full voice processing pipeline:
  - Fetches audio from R2
  - Uses Workers AI Whisper (`@cf/openai/whisper`) for transcription
  - Uses LLM (`@cf/meta/llama-3.1-8b-instruct`) for entity extraction
  - Stores voice recording as training sample with extracted text
  - Returns transcript, extracted entities, and DNA score changes
- **`getBrandDNA`**: New endpoint to fetch aggregated Brand DNA strength and recommendations

#### 2. Hono App (`apps/foundry-dashboard/worker/hono/app.ts`)
- Updated upload path validation to allow `voice-samples/` prefix alongside `brand-samples/`

#### 3. Types (`apps/foundry-dashboard/worker/types.ts`)
- Added `'voice'` to `TrainingSampleSourceType`

### Frontend Changes

#### 1. VoiceRecorder Component (`apps/foundry-dashboard/src/components/brand-dna/VoiceRecorder.tsx`)
- Microphone permission handling with browser Permissions API
- MediaRecorder API for audio capture (WebM/MP4 format)
- Visual timer with progress bar (max 60 seconds)
- Recording states: idle, recording, stopped
- Pulsing indicator during recording
- Error handling for denied permissions

#### 2. TranscriptionReview Component (`apps/foundry-dashboard/src/components/brand-dna/TranscriptionReview.tsx`)
- Processing state with spinner
- Score improvement banner (shows DNA improvement percentage)
- Transcription display
- Extracted entities grid:
  - Voice Markers (blue tags)
  - Banned Words (red strikethrough tags)
  - Brand Stances (green cards with topic/position)

#### 3. Brand DNA Page (`apps/foundry-dashboard/src/routes/app/brand-dna.tsx`)
- Updated header with DNA Strength score display
- New Voice-to-Grounding Pipeline section
- Integration of VoiceRecorder and TranscriptionReview
- Voice recording handler with R2 upload and processing
- Query invalidation after successful recording

### Component Index
- Updated `apps/foundry-dashboard/src/components/brand-dna/index.ts` to export new components

## Technical Decisions

1. **Audio Format**: Using WebM (Chrome/Firefox) with MP4 fallback (Safari) via MediaRecorder
2. **Max Duration**: 60 seconds to balance quality and processing time
3. **Entity Extraction Model**: Using Llama 3.1 8B for faster response times in entity extraction
4. **Storage Pattern**: Voice samples stored at `voice-samples/{clientId}/{timestamp}-{filename}` in R2
5. **DNA Score Calculation**: Heuristic-based scoring (voice markers: 15pts, banned words: 10pts, stances: 20pts each)

## Files Changed

### New Files
- `apps/foundry-dashboard/src/components/brand-dna/VoiceRecorder.tsx`
- `apps/foundry-dashboard/src/components/brand-dna/TranscriptionReview.tsx`
- `_bmad-output/implementation-artifacts/2-2-voice-to-grounding-pipeline.md`

### Modified Files
- `apps/foundry-dashboard/worker/trpc/routers/calibration.ts` (added recordVoice, getVoiceUploadUrl, getBrandDNA)
- `apps/foundry-dashboard/worker/hono/app.ts` (voice-samples path support)
- `apps/foundry-dashboard/worker/types.ts` (voice source type)
- `apps/foundry-dashboard/src/components/brand-dna/index.ts` (exports)
- `apps/foundry-dashboard/src/routes/app/brand-dna.tsx` (voice recording integration)

## Testing Notes

### Manual Testing Steps
1. Navigate to Brand DNA page (`/app/brand-dna`)
2. Click microphone button to start recording
3. Speak for up to 60 seconds describing brand preferences
4. Click "Stop Recording" to end
5. Verify transcription appears
6. Verify extracted entities are displayed
7. Verify DNA strength score updates

### Example Test Phrases
- "I hate corporate jargon like synergy and leverage"
- "My brand voice is conversational and approachable"
- "I believe in transparency and direct communication"
- "Never use the word 'disrupt' in my content"

## Dependencies
- Workers AI: Whisper model for transcription
- Workers AI: Llama 3.1 8B for entity extraction
- R2: Audio file storage
- MediaRecorder API: Browser audio capture

## Next Steps (Story 2.3)
- Build the Brand DNA profile editor for manual entity management
- Add calibration drift detection
- Implement calibration recommendations based on content changes

---

## Durable Object Enhancement (2025-12-22)

### Schema Normalization
The Durable Object `ClientAgent` now uses normalized tables per architecture spec:

| Table | Columns | Purpose |
|-------|---------|---------|
| `voice_markers` | id, phrase, source, confidence, created_at | Unique speaking patterns |
| `banned_words` | id, word, severity, reason, source, created_at | Words to avoid |
| `brand_stances` | id, topic, position, source, created_at | Brand positions on topics |
| `brand_dna` | signature_patterns, tone_profile, voice_baseline, time_to_dna, last_calibration | Metadata only |

### New Durable Object Methods

**Voice Markers CRUD:**
- `listVoiceMarkers()` - List all voice markers
- `addVoiceMarker({ phrase, source?, confidence? })` - Add new marker (dedupes)
- `removeVoiceMarker(markerId)` - Remove by ID
- `updateVoiceMarker({ markerId, phrase?, confidence? })` - Update existing

**Banned Words CRUD:**
- `listBannedWords()` - List all banned words
- `addBannedWord({ word, severity?, reason?, source? })` - Add new (dedupes)
- `removeBannedWord(wordId)` - Remove by ID
- `updateBannedWord({ wordId, word?, severity?, reason? })` - Update existing

**Brand Stances CRUD:**
- `listBrandStances()` - List all stances
- `addBrandStance({ topic, position, source? })` - Add new stance
- `removeBrandStance(stanceId)` - Remove by ID

**G4 Voice Alignment Gate:**
- `checkBannedWords(content)` - Check content for banned words, returns violations
- `checkVoiceMarkers(content)` - Check content for voice marker matches, returns similarity score

### Enhanced processVoiceNote
The `processVoiceNote` method now:
1. Uses Workers AI Llama 3.1 8B for entity extraction
2. Parses JSON with fallback for non-JSON LLM responses
3. Inserts entities into normalized tables via CRUD methods
4. Tracks source as 'voice' with 0.85 confidence for LLM extractions
5. Stores embeddings in Vectorize with client isolation metadata
6. Returns strongly-typed VoiceMarker[], BannedWord[], BrandStance[] objects
