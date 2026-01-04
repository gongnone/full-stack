# GitHub Issue: Testimonial Request Flow

## Issue Details

**Title:** `feat(testimonials): Complete Testimonial Request Flow`

**Labels:** `phase-1.5.1`, `feature`, `P0`

**Milestone:** Phase 1.5.1

---

## Body

### Summary

Complete the testimonial request flow that triggers after content batch approval. **Backend exists but client-facing UI integration is missing.**

This is **P0 for Phase 1.5 completeness** - the primary gap preventing Phase 1.5 completion.

### User Story

**As a** client who just approved my first batch of content,
**I want** to be asked if I'd like to provide a testimonial,
**So that** I can share my experience while feeling positive about the results.

### Requirements

| ID | Description | Status |
|----|-------------|--------|
| FR-1.5.16a | Agent asks for testimonial after user approves first batch of content | MISSING |
| FR-1.5.16b | Request is transparent: "Would you share your experience to help others?" | MISSING |
| FR-1.5.16c | User can accept, decline, or "ask me later" | PARTIAL |
| FR-1.5.16d | If accepted, user records testimonial video | MISSING |
| FR-1.5.16e | User can optionally give permission for public use | PARTIAL |

### What Exists

- `testimonialsRouter` - CRUD operations in `worker/trpc/routers/testimonials.ts`
- `TestimonialGrid.tsx` - Agency viewing component
- `client_testimonials` table - D1 schema
- `VideoRecorder` component - exists

### What's Missing

1. **Trigger Logic** - No code to prompt client after batch approval
2. **Sentiment Check Flow** - No UI for "How are you feeling?" question
3. **Testimonial Prompt UI** - No client-facing prompt component
4. **Response Handling** - Accept/Decline/Later state machine not wired
5. **VideoRecorder Integration** - Not connected to testimonial flow
6. **Reminder System** - "Ask me later" doesn't schedule follow-up

### Technical Tasks

#### Backend (2-3 hours)
- [ ] Add `checkTestimonialTrigger()` function
- [ ] Add `testimonials.requestStatus` endpoint
- [ ] Add `testimonials.respond` endpoint
- [ ] Add `testimonials.submit` endpoint

#### Frontend (3-4 hours)
- [ ] Create `TestimonialRequestModal.tsx`
- [ ] Create `TestimonialRecorder.tsx`
- [ ] Add trigger hook in Review page
- [ ] Handle all response states

#### Integration (1-2 hours)
- [ ] Wire trigger to review/approval flow
- [ ] E2E testing

### Effort Estimate
6-9 hours total

### Acceptance Criteria

- [ ] After 10+ spokes approved, trigger testimonial flow
- [ ] Sentiment check shown first (positive → show request)
- [ ] Three clear options: Accept, Decline, Ask Me Later
- [ ] Accept opens VideoRecorder with preview
- [ ] Decline shows gracious message, no follow-up
- [ ] Snooze schedules reminder (max 2)

### References

- Sprint Item: `_bmad-output/sprints/phase-1.5.1/testimonial-flow-completion.md`
- Stories: `_bmad-output/stories/phase-1.5/1.5-8-5-*`, `1.5-8-6-*`, `1.5-8-7-*`
- Gap Analysis: `_bmad-output/reports/client-journey-gap-analysis.md` (Gap 2)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
