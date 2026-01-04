# Sprint Item: Testimonial Flow Completion

## Sprint
Phase 1.5.1

## Priority
P0 - Required for Phase 1.5 completeness

## Overview
Complete the testimonial request flow that triggers after content batch approval. Backend exists but client-facing UI integration is missing.

---

## User Story

**As a** client who just approved my first batch of content,
**I want** to be asked if I'd like to provide a testimonial,
**So that** I can share my experience while feeling positive about the results.

---

## Requirements Reference

| ID | Description | Status |
|----|-------------|--------|
| FR-1.5.16a | Agent asks for testimonial after user approves first batch of content | MISSING |
| FR-1.5.16b | Request is transparent: "Would you share your experience to help others?" | MISSING |
| FR-1.5.16c | User can accept, decline, or "ask me later" | PARTIAL (`snoozed` exists in schema) |
| FR-1.5.16d | If accepted, user records testimonial video | MISSING |
| FR-1.5.16e | User can optionally give permission for public use | PARTIAL (schema exists) |

---

## Current Implementation Status

### What Exists

| Component | Location | Status |
|-----------|----------|--------|
| `testimonialsRouter` | `worker/trpc/routers/testimonials.ts` | EXISTS - CRUD operations |
| `TestimonialGrid.tsx` | `src/components/testimonials/` | EXISTS - Agency viewing |
| `client_testimonials` table | D1 Schema | EXISTS |
| `video_submissions` table | D1 Schema | EXISTS |
| `VideoRecorder` component | `src/components/` | EXISTS |

### What's Missing

1. **Trigger Logic** - No code to prompt client after batch approval
2. **Sentiment Check Flow** - No UI for "How are you feeling?" question
3. **Testimonial Prompt UI** - No client-facing prompt component
4. **Response Handling** - Accept/Decline/Later state machine not wired
5. **VideoRecorder Integration** - Not connected to testimonial flow
6. **Reminder System** - "Ask me later" doesn't schedule follow-up

---

## Acceptance Criteria

### AC-1: Testimonial Trigger After Batch Approval
- [ ] After 10+ spokes approved, trigger testimonial flow
- [ ] Trigger happens once per client (don't re-ask after declined)
- [ ] Trigger stored in `client_testimonial_requests` or similar

### AC-2: Sentiment Check First (Story 1.5-8-5)
- [ ] Display "How are you feeling about the content?"
- [ ] Options: "Excited to post!", "They're solid", "Need some work"
- [ ] Positive sentiment → Show testimonial request
- [ ] Lukewarm/Negative → Defer request, no pressure

### AC-3: Testimonial Request UI
- [ ] Display transparent request: "Would you share your experience?"
- [ ] Explain how testimonials help other business owners
- [ ] Three clear options: Accept, Decline, Ask Me Later
- [ ] No guilt or pressure on any option

### AC-4: Accept Flow
- [ ] Open VideoRecorder component
- [ ] Allow re-record before submit
- [ ] Show preview before final submission
- [ ] Store with `permission_public: false` initially
- [ ] Ask about public permission after recording

### AC-5: Decline Flow
- [ ] Save response as `declined`
- [ ] Show gracious message ("No problem!")
- [ ] No follow-up reminders
- [ ] Continue to content as normal

### AC-6: Ask Me Later Flow
- [ ] Save response as `snoozed` with timestamp
- [ ] Schedule reminder after next batch approval
- [ ] Max 2 reminders then auto-decline

### AC-7: Data Integrity
- [ ] Testimonial linked to client_id
- [ ] Request timestamp recorded
- [ ] Response status tracked
- [ ] Video stored in R2 with proper path

---

## Technical Tasks

### Backend (2-3 hours)

```
[ ] 1. Add `checkTestimonialTrigger()` function
    - Check if client has 10+ approved spokes
    - Check if testimonial not already requested/declined
    - Return trigger decision

[ ] 2. Add `testimonials.requestStatus` endpoint
    - Get current request status for client
    - Return: 'none' | 'pending' | 'snoozed' | 'accepted' | 'declined'

[ ] 3. Add `testimonials.respond` endpoint
    - Accept response: 'accept' | 'decline' | 'snooze'
    - Update request status
    - Handle snooze scheduling

[ ] 4. Add `testimonials.submit` endpoint
    - Accept video upload details
    - Create testimonial record
    - Handle permission_public flag
```

### Frontend (3-4 hours)

```
[ ] 1. Create `TestimonialRequestModal.tsx`
    - Sentiment check step
    - Request display step
    - Three response buttons

[ ] 2. Create `TestimonialRecorder.tsx`
    - Wrap VideoRecorder for testimonial context
    - Add preview and re-record
    - Submit flow with permission question

[ ] 3. Add trigger hook in Review page
    - After batch approval, check trigger
    - Show modal if trigger conditions met

[ ] 4. Handle all response states
    - Accept → Open recorder
    - Decline → Show thank you, close
    - Snooze → Show "we'll ask later", close
```

### Integration (1-2 hours)

```
[ ] 1. Wire trigger to review/approval flow
[ ] 2. Test complete happy path
[ ] 3. Test decline path
[ ] 4. Test snooze path
[ ] 5. Verify data in database
```

---

## Estimation

| Task | Effort |
|------|--------|
| Backend endpoints | 2-3 hours |
| Frontend components | 3-4 hours |
| Integration + testing | 1-2 hours |
| **Total** | **6-9 hours** |

---

## Dependencies

- VideoRecorder component (exists, may need consolidation - see TD-001)
- Batch approval flow (exists)
- R2 storage (exists)
- Email service for reminders (exists)

---

## Out of Scope

- Testimonial approval workflow (agency moderation)
- Public testimonial gallery
- Testimonial analytics/metrics
- Social sharing integration

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests for new endpoints
- [ ] E2E test for happy path
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Documentation updated

---

## Related Documents

- Story 1.5-8-5: `_bmad-output/stories/phase-1.5/1.5-8-5-testimonial-request-after-approval.md`
- Story 1.5-8-6: `_bmad-output/stories/phase-1.5/1.5-8-6-accept-decline-later-options.md`
- Story 1.5-8-7: `_bmad-output/stories/phase-1.5/1.5-8-7-record-testimonial-video.md`
- PRD: `_bmad-output/prd-phase-1.5-mvf.md` (FR-1.5.16a-e)
- Gap Analysis: `_bmad-output/reports/client-journey-gap-analysis.md` (Gap 2)
