# PRD Update: Express Path Documentation

## Update ID
UPDATE-001

## Date
2026-01-04

## Status
READY FOR MERGE

---

## Context

The BrandDNA Agent implements two completion paths - Full Path and Express Path. The Express Path is fully implemented in code but not documented in the PRD.

---

## Current PRD State

The PRD mentions "BrandDNA Agent Conversation Flow" but does not explicitly document the Express Path option. Voice recording requirements (FR-1.5.1) mention "2-minute voice note" without clarifying path-specific durations.

---

## Proposed Addition

### Insert After: Section 3.1.1 (BrandDNA Agent)

```markdown
#### Path Options

BrandDNA offers two completion paths to accommodate different user needs:

| Path | Duration | Steps | Best For |
|------|----------|-------|----------|
| Full Path | 10-15 minutes | 9 steps | Comprehensive brand capture, detailed audience analysis |
| Express Path | 2-3 minutes | 6 steps | Quick setup, time-constrained users, initial onboarding |

##### Full Path Steps
1. Welcome + Path Selection
2. Voice Capture (120 seconds max)
3. Brand Description
4. Audience Questions (5 questions)
5. Platform Selection
6. Competitor Input
7. Pillar Proposal + Approval
8. Review Summary
9. Complete

##### Express Path Steps
1. Welcome + Path Selection
2. Voice Capture (60 seconds max)
3. Express Brand Question (single text input)
4. Express Audience Question (single text input)
5. Express Platform Selection (streamlined)
6. Complete

**Note:** Express Path triggers the same async research and pillar synthesis pipeline, but pillars are generated asynchronously and presented via separate Strategy Approval flow (FR-1.5.12).

##### Voice Recording Duration by Path
- **Full Path:** 120 seconds maximum (FR-1.5.1a)
- **Express Path:** 60 seconds maximum

Both paths support re-record and skip-to-text options.
```

---

## Updated Requirements

### FR-1.5.1a (Clarification)

**Current:**
> Users can record a 2-minute voice note (P0)

**Updated:**
> Users can record a voice note with path-appropriate duration:
> - Full Path: 2 minutes (120 seconds) maximum
> - Express Path: 1 minute (60 seconds) maximum
> (P0)

### New Functional Requirements

| ID | Description | Priority |
|----|-------------|----------|
| **FR-1.5.Xa** | Users can choose between Full Path and Express Path at BrandDNA start | P1 |
| **FR-1.5.Xb** | Express Path completes core capture in under 3 minutes | P1 |
| **FR-1.5.Xc** | Both paths trigger research/pillar synthesis (async for Express) | P1 |
| **FR-1.5.Xd** | Path selection is stored and influences content generation context | P2 |

---

## Code References

| Feature | File | Lines |
|---------|------|-------|
| Path constants | `BrandDNAAgent.ts` | 44-64 |
| Path selection handling | `BrandDNAAgent.ts` | 617-624 |
| Voice capture duration logic | `BrandDNAAgent.ts` | 726-734 |
| Express brand handler | `BrandDNAAgent.ts` | 1248-1269 |
| Express audience handler | `BrandDNAAgent.ts` | 1271-1291 |
| Express platform handler | `BrandDNAAgent.ts` | Uses shared `handlePlatformSelection` |
| Express completion skip | `BrandDNAAgent.ts` | 929-934 |

---

## Implementation Status

| Feature | Status | Verified |
|---------|--------|----------|
| Path selection UI | IMPLEMENTED | Yes |
| Express voice capture (60s) | IMPLEMENTED | Yes |
| Express brand question | IMPLEMENTED | Yes |
| Express audience question | IMPLEMENTED | Yes |
| Express platform selection | IMPLEMENTED | Yes |
| Express → Complete | IMPLEMENTED | Yes |
| Async research trigger | IMPLEMENTED | Yes |

---

## Files to Update

1. `_bmad-output/prd-phase-1.5-mvf.md`
   - Add Path Options section under BrandDNA Agent
   - Update FR-1.5.1a with duration clarification
   - Add FR-1.5.Xa-Xd if desired

2. `_bmad-output/epics/phase-1.5-epics.md`
   - Add Express Path acceptance criteria to Epic 1

---

## Approval

- [ ] Product Owner reviewed
- [ ] Engineering verified accuracy
- [ ] Ready to merge into PRD

---

## Notes for Future

Consider tracking path selection in analytics to understand:
- Which path users prefer
- Completion rates by path
- Correlation between path and content quality
