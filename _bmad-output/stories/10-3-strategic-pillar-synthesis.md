# Story 10-3: Strategic Pillar Synthesis

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P0
**Status:** done
**Effort:** 4-6 hours
**Created:** 2025-12-29

---

## User Story

**As a** client receiving Brand DNA results,
**I want** the system to propose strategic content pillars based on research,
**So that** I get a content strategy that will actually work, not just a mirror of what I said.

## Context

This is the "WOW" moment. After capturing voice and researching the market, the system synthesizes everything into actionable brand pillars. These aren't generic suggestions — they're tailored to the client's voice AND proven to work in their market.

## The WOW Experience

**Before (Generic AI):**
> "Your tone is professional. You mentioned leadership. Here are some content ideas..."

**After (Strategic Synthesis):**
> ## Your Strategic Brand Pillars
>
> Based on your authentic voice + what's crushing it in Executive Coaching:
>
> | Pillar | Strategy | Why It Works |
> |--------|----------|--------------|
> | **"Leadership Myths"** | TEACH + CHALLENGE | Contrarian takes get 3.2x engagement in your niche. Your voice screams "myth-buster." |
> | **"Boardroom Confessions"** | ENTERTAIN + PROVE | You mentioned loving "candid" clients. Story-driven content is underused by competitors. |
> | **"The 3-Second Decision"** | ENGINEER | Framework content drives saves/shares. Your "decisive not stubborn" stance is gold. |
>
> **[Approve These] [Modify a Pillar] [Show Me Different Options]**

## Acceptance Criteria

### AC1: Trigger on Research Complete
- [ ] Automatically triggered when Story 10-2 research completes
- [ ] Has access to: Raw Brand DNA + Market Intelligence Report
- [ ] Client sees status: "Crafting your strategy..."

### AC2: Pillar Generation Logic
- [ ] Generate 3-5 strategic pillars (not more, not fewer)
- [ ] Each pillar must include:
  - **Name**: Memorable, specific to client (e.g., "Leadership Myths" not "Thought Leadership")
  - **Strategy Tag**: Which framework (TEACH, ENTERTAIN, ENGINEER)
  - **Rationale**: Why this works for THEM specifically
  - **Example Hook**: One concrete content example
- [ ] Pillars must be distinct (no overlapping themes)

### AC3: Evidence-Based Rationale
- [ ] Each pillar rationale references specific evidence:
  - Voice signals: "You mentioned X..."
  - Market data: "Top performers in your niche do Y..."
  - Gap opportunity: "Competitors aren't doing Z..."
- [ ] No generic justifications like "this is engaging"

### AC4: Framework Balance
- [ ] At least one TEACH pillar (builds authority)
- [ ] At least one ENTERTAIN pillar (builds relatability)
- [ ] At least one ENGINEER pillar (drives action)
- [ ] Can have hybrid pillars (TEACH + CHALLENGE)

### AC5: Voice Alignment Check
- [ ] Pillars must align with detected brand stances
- [ ] If client is "anti-jargon", no pillars suggesting corporate content
- [ ] If client is "candid/contrarian", emphasize challenger positioning
- [ ] Tone of pillar names matches client voice

### AC6: Storage & Retrieval
- [ ] Store proposed pillars in D1:
```json
{
  "clientId": "...",
  "proposedPillars": [
    {
      "id": "pillar_abc123",
      "name": "Leadership Myths",
      "strategy": ["TEACH", "CHALLENGE"],
      "rationale": "Your voice analysis shows strong contrarian tendencies...",
      "exampleHook": "The advice that got your last CEO fired",
      "confidence": 0.92
    }
  ],
  "status": "pending_approval",
  "generatedAt": 1703865600
}
```
- [ ] Pillars retrievable for approval flow (Story 10-4)

### AC7: Trigger Approval Flow
- [ ] On synthesis complete, trigger Story 10-4 approval notification
- [ ] Client receives email/SMS: "Your brand strategy is ready"
- [ ] Update status: "Strategy Ready for Review"

### AC8: Alternative Generation
- [ ] If client requests different options (Story 10-5), can regenerate
- [ ] Regeneration avoids previously rejected pillars
- [ ] Maximum 3 regeneration rounds before human intervention

## Technical Implementation

### AI Prompt Structure
```
SYSTEM: You are a content strategist synthesizing brand research into actionable pillars.

INPUTS:
1. Raw Brand DNA:
   - Voice transcription: {transcription}
   - Detected tone: {tone_analysis}
   - Brand stances: {stances}
   - Banned words: {banned}
   - Signature phrases: {phrases}

2. Market Intelligence:
   - Industry: {industry}
   - Top performers: {top_performers}
   - Hook patterns that work: {hook_patterns}
   - Competitive gaps: {gaps}
   - Framework fit scores: {framework_fit}

TASK: Generate 3-5 strategic content pillars that:
1. Match this client's authentic voice
2. Leverage proven patterns in their market
3. Fill competitive gaps where possible
4. Balance TEACH/ENTERTAIN/ENGINEER frameworks

OUTPUT FORMAT:
[structured pillar objects with name, strategy, rationale, example]
```

### Database Schema
```sql
CREATE TABLE client_proposed_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  pillars_json TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, modified, rejected
  approved_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE client_approved_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  pillar_name TEXT NOT NULL,
  strategy_tags TEXT NOT NULL, -- JSON array
  rationale TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL
);
```

### Synthesis Workflow
```typescript
async function synthesizePillars(clientId: string) {
  // 1. Gather inputs
  const brandDna = await getBrandDna(clientId);
  const research = await getResearchReport(clientId);

  // 2. Generate pillars via AI
  const prompt = buildSynthesisPrompt(brandDna, research);
  const pillars = await workersAI.generate(prompt);

  // 3. Validate pillars
  const validated = validatePillarStructure(pillars);
  const balanced = ensureFrameworkBalance(validated);

  // 4. Store proposals
  await storeProposedPillars(clientId, balanced);

  // 5. Trigger approval flow
  await triggerApprovalNotification(clientId);
}
```

## Quality Gates

| Check | Requirement |
|-------|-------------|
| Pillar count | 3-5 pillars exactly |
| Framework coverage | At least one of each type |
| Rationale quality | Must reference specific evidence |
| Name uniqueness | No duplicate or generic names |
| Voice alignment | Must match detected stances |

## Dependencies

- Story 10-1: Brand DNA captured ✅
- Story 10-2: Research complete ✅
- Workers AI: Text generation

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Research complete for coach | 3-5 pillars generated within 30 seconds |
| Contrarian voice detected | At least one "CHALLENGE" pillar proposed |
| Pillars generated | Approval notification triggered |
| All pillars generic | Regeneration with stricter prompt |

## Out of Scope

- Client modification of pillars (Story 10-5)
- Pillar performance tracking (future epic)
- A/B testing of pillar options (future)

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Pillars feel "strategic" not "generic" (human review)
- [ ] Rationales reference specific evidence
- [ ] Framework balance achieved
- [ ] Approval notification sent correctly
- [ ] Pillars retrievable for approval flow
