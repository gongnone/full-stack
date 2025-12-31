# Story 10-5: Iterative Pillar Refinement

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P1
**Status:** ready
**Effort:** 3-4 hours
**Created:** 2025-12-29

---

## User Story

**As a** client reviewing my proposed pillars,
**I want** to modify pillars that don't quite fit or request entirely different options,
**So that** my content strategy feels authentically mine, not just AI-generated.

## Context

Not every AI-proposed pillar will be perfect. Clients need the ability to:
1. Tweak a pillar (change name, adjust focus)
2. Replace a pillar entirely
3. Request completely different options if nothing fits

This keeps the client in control while still leveraging AI intelligence.

## Acceptance Criteria

### AC1: Modify Pillar Modal
- [ ] Accessible from pillar card "Modify" button
- [ ] Opens full-screen modal on mobile (slide-up)
- [ ] Shows current pillar details (editable)
- [ ] Pre-fills with AI-generated content

### AC2: Editable Fields
- [ ] **Pillar Name**: Text input (max 50 chars)
- [ ] **Strategy Focus**: Multi-select chips (TEACH, ENTERTAIN, ENGINEER, CHALLENGE, PROVE)
- [ ] **Personal Note**: Optional text area for client to explain their vision
- [ ] Rationale and example are NOT editable (AI-generated context)

### AC3: AI Refinement Option
- [ ] "Help me refine this" button
- [ ] Opens chat-like interface for iterative refinement
- [ ] Client can type: "Make it more about challenging industry norms"
- [ ] AI regenerates pillar based on feedback
- [ ] Shows before/after comparison

### AC4: Replace Pillar
- [ ] "Show me different options" action
- [ ] AI generates 2-3 alternative pillars for this slot
- [ ] Displayed as swipeable cards
- [ ] Client selects preferred option or goes back to modify

### AC5: Voice Note for Refinement
- [ ] Client can record short voice note (30 sec max)
- [ ] "Tell us what you're thinking..."
- [ ] AI incorporates voice feedback into refined pillar
- [ ] Mobile-first: large record button, visual feedback

### AC6: Global "Start Over" Option
- [ ] If client rejects 3+ pillars: suggest "Would you like completely different options?"
- [ ] Triggers full regeneration with adjusted parameters
- [ ] Avoids previously rejected pillar themes
- [ ] Maximum 3 full regenerations before human escalation

### AC7: Modification Tracking
- [ ] Track all modifications for analytics:
```json
{
  "pillarId": "...",
  "originalName": "Leadership Myths",
  "modifiedName": "Boardroom Confessions",
  "modificationType": "renamed",
  "voiceNoteUsed": false,
  "aiRefinementRounds": 1
}
```
- [ ] Agency can see which pillars were modified
- [ ] Informs future synthesis improvements

### AC8: Save & Continue
- [ ] Modified pillar saves automatically
- [ ] Returns to approval flow at same position
- [ ] Progress indicator updates (shows modified state)
- [ ] No data loss on accidental close

## Mobile UX

### Modification Modal
```
┌─────────────────────────────────┐
│  ✕                    Modify    │
├─────────────────────────────────┤
│                                 │
│  Pillar Name                    │
│  ┌─────────────────────────────┐│
│  │ Leadership Myths        ✎  ││
│  └─────────────────────────────┘│
│                                 │
│  Strategy Focus                 │
│  ┌──────┐ ┌─────────┐ ┌──────┐ │
│  │TEACH │ │CHALLENGE│ │PROVE │ │
│  └──────┘ └─────────┘ └──────┘ │
│  (tap to toggle)               │
│                                 │
│  Your Vision (optional)         │
│  ┌─────────────────────────────┐│
│  │ I want to focus more on... ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │  🎤 Record a voice note    ││
│  └─────────────────────────────┘│
│                                 │
│  ┌──────────────┐ ┌────────────┐│
│  │Show Different│ │Save Changes││
│  └──────────────┘ └────────────┘│
└─────────────────────────────────┘
```

### AI Refinement Chat
```
┌─────────────────────────────────┐
│  Refining: "Leadership Myths"   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ Current: Leadership Myths   ││
│  │ A contrarian approach to... ││
│  └─────────────────────────────┘│
│                                 │
│  🧑 "Make it more personal,    │
│      about my own failures"    │
│                                 │
│  🤖 "How about 'Lessons I      │
│      Learned the Hard Way' -   │
│      focuses on your authentic │
│      failure stories..."       │
│                                 │
│  ┌─────────────────────────────┐│
│  │ Type your feedback...   ➤  ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

## Technical Implementation

### API Endpoints
```typescript
// Modification endpoints
POST /api/strategy/:token/modify/:pillarId
  body: { name?, strategyTags?, personalNote?, voiceNoteUrl? }

POST /api/strategy/:token/refine/:pillarId
  body: { feedback: string }
  returns: { refinedPillar: Pillar }

POST /api/strategy/:token/alternatives/:pillarId
  returns: { alternatives: Pillar[] }

POST /api/strategy/:token/regenerate-all
  body: { rejectedThemes: string[] }
  returns: { newPillars: Pillar[] }
```

### AI Refinement Prompt
```
CONTEXT:
Original pillar: {original}
Client feedback: {feedback}
Voice note transcript: {voice_note}
Brand DNA: {brand_dna}

TASK:
Refine this pillar based on client feedback.
Keep the strategic foundation but adjust to match their vision.
Maintain alignment with their authentic voice.

OUTPUT:
Refined pillar with updated name, rationale, and example.
```

### Database Updates
```sql
-- Track modifications
CREATE TABLE pillar_modifications (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  pillar_id TEXT NOT NULL,
  original_json TEXT NOT NULL,
  modified_json TEXT NOT NULL,
  modification_type TEXT, -- renamed, replaced, refined
  feedback_text TEXT,
  voice_note_url TEXT,
  created_at INTEGER NOT NULL
);
```

## Refinement Limits

| Limit | Value | Reason |
|-------|-------|--------|
| Max voice note length | 30 seconds | Keep feedback focused |
| Max refinement rounds per pillar | 5 | Prevent infinite loops |
| Max full regenerations | 3 | Human escalation after |
| Max alternative pillars shown | 3 | Decision paralysis prevention |

## Dependencies

- Story 10-3: Initial pillars generated ✅
- Story 10-4: Approval flow UI ✅
- Story 2-2: Voice recording (reuse) ✅

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Modify pillar name | Saves, returns to approval flow |
| Record voice refinement | Transcribed, AI incorporates feedback |
| Request alternatives | 3 new options displayed |
| Reject all pillars | "Start over" option appears |
| Close modal mid-edit | Changes preserved on return |

## Out of Scope

- Agency editing client pillars (different permission model)
- Historical pillar versioning (future)
- A/B testing of pillar variations (future)

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Modification modal works on mobile
- [ ] Voice recording integration working
- [ ] AI refinement produces quality results
- [ ] Modification tracking captured
- [ ] No data loss on accidental close
- [ ] Regeneration limits enforced
