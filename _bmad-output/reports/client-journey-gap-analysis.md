# Client BrandDNA Journey - Gap Analysis Report

> **Version:** 1.0.0
> **Last Updated:** 2026-01-04
> **Author:** BMAD-TRACER

---

## Executive Summary

This report identifies gaps between documented requirements and actual implementation for the Client BrandDNA user journey.

| Gap Type | Critical | Major | Minor |
|----------|----------|-------|-------|
| Missing in Code | 1 | 2 | 1 |
| Missing in Docs | 0 | 2 | 3 |
| Contradictions | 0 | 1 | 2 |

---

## Requirement Cross-Reference Matrix

| Journey Step | PRD Req | Story/AC | Code Exists | Match | Notes |
|--------------|---------|----------|-------------|-------|-------|
| Email Invitation | FR-1.5.10a | Story 10-1 | ✅ clients.ts:141 | ✅ | Complete |
| Token Generation | FR-1.5.10b | Story 10-1, AC-3 | ✅ clients.ts:148-163 | ✅ | 7-day expiry |
| Token Validation | FR-1.5.10c | Story 10-1, AC-4 | ✅ onboarding.ts:10-47 | ✅ | Complete |
| Landing Page | FR-1.5.10d | Story 10-1, AC-5 | ✅ onboard.$token.tsx | ✅ | Complete |
| Voice Recording (Full) | FR-1.5.1a | - | ✅ BrandDNAAgent.ts:726-753 | ✅ | 120s max |
| Voice Recording (Express) | FR-1.5.1a | - | ✅ BrandDNAAgent.ts:733 | ✅ | 60s max |
| Transcription | FR-1.5.1b | - | ✅ BrandDNAAgent.ts:416-421 | ✅ | Whisper |
| Personality Extraction | FR-1.5.1c | - | ✅ BrandDNAAgent.ts:481-569 | ✅ | LLaMA 3.1 |
| Re-record Option | FR-1.5.1d | - | ✅ BrandDNAAgent.ts:742-743 | ✅ | Skip/retry |
| Audience Questions | FR-1.5.2a-e | - | ✅ BrandDNAAgent.ts:802-833 | ✅ | 5 questions |
| Platform Selection | FR-1.5.4a-c | - | ✅ BrandDNAAgent.ts:858-918 | ✅ | 2-4 platforms |
| Pillar Generation | FR-1.5.5a-d | Story 10-3 | ✅ BrandDNAAgent.ts:967-1046 | ✅ | AI-generated |
| Session Completion | FR-1.5.6a-c | - | ✅ BrandDNAAgent.ts:1098-1222 | ✅ | Complete |
| Research Agent | FR-1.5.11 | Story 10-2 | ✅ research.ts | ✅ | Complete |
| Strategy Approval | FR-1.5.12 | Story 10-4 | ✅ strategy.ts | ✅ | Token-gated |
| **Private Win Video** | **FR-1.5.15** | **Story 1.5-8-1** | **❌ DESCOPED** | **❌** | **See descope doc** |
| Testimonial Request | FR-1.5.16 | Story 1.5-8-5-7 | ⚠️ Partial | ⚠️ | Backend only |
| Agency Notification | FR-1.5.10e | Story 10-1, AC-7 | ✅ onboarding.ts:120-139 | ✅ | Email sent |

---

## CRITICAL: Missing in Code (P0)

### Gap 1: Private Win Video (FR-1.5.15) - DESCOPED

| Aspect | Detail |
|--------|--------|
| PRD Reference | FR-1.5.15a-e |
| Story Reference | Story 1.5-8-1-victory-video-capture.md |
| Status | **FORMALLY DESCOPED** |
| Descope Document | `_bmad-output/descope/FR-1.5.15-private-win-video.md` |

**What's Missing:**
- No agent prompt after BrandDNA completion for victory video
- No video recording integration in BrandDNA flow
- No skip functionality for victory video
- No private storage logic (separate from testimonials)

**Impact:**
- Users do NOT receive motivational prompt to capture win moment
- No private momentum-building experience
- Does NOT affect core BrandDNA functionality

**Resolution:** Target Phase 1.6 or Phase 2

---

## MAJOR: Missing in Code (P1)

### Gap 2: Testimonial Request Flow (FR-1.5.16)

| Aspect | Detail |
|--------|--------|
| PRD Reference | FR-1.5.16a-c |
| Story Reference | Story 1.5-8-5-testimonial-request-after-approval.md |
| Status | **PARTIAL IMPLEMENTATION** |

**What Exists:**
- `testimonials.ts` router with CRUD operations
- `TestimonialGrid.tsx` for agency viewing
- Database tables for testimonial storage

**What's Missing:**
- No prompt to client after strategy approval completion
- No "accept/decline/ask me later" options in completion flow
- No video recording UI in testimonial request flow
- No integration with strategy.lockStrategy completion

**Impact:**
- Agencies cannot collect testimonials via automated flow
- Manual outreach required for testimonials

**Resolution Required:**
1. Add testimonial prompt to `strategy.lockStrategy` completion
2. Create client-facing testimonial recording UI
3. Implement accept/decline/later state machine

---

### Gap 3: Express Path Missing Full Pillar Approval

| Aspect | Detail |
|--------|--------|
| Code Reference | BrandDNAAgent.ts:719 |
| Status | **BEHAVIOR GAP** |

**Issue:**
Express path (`express_platform → complete`) skips:
- Pillar proposal step
- Pillar approval/rejection
- Review summary

**Documented Behavior:** PRD suggests all paths should end with pillar generation and approval.

**Current Behavior:** Express path generates pillars asynchronously via research pipeline AFTER session completion.

**Impact:** Express path users don't see/approve pillars until separate strategy email arrives.

**Resolution Options:**
1. Document this as intentional express behavior ✓
2. Add mini-pillar review to express path

---

## MAJOR: Missing in Docs (P1)

### Gap 4: Express Path Not Fully Documented

| Aspect | Detail |
|--------|--------|
| Code Location | BrandDNAAgent.ts:266-274 |
| Doc Location | PRD mentions express path but lacks detail |

**Current Implementation:**
```
Express Path Steps:
1. welcome
2. voice_capture (60s max)
3. express_brand (single text question)
4. express_audience (single text question)
5. express_platform (streamlined selection)
6. complete (triggers async research)
```

**Documentation Needed:**
- Add express path to PRD as formal FR-1.5.X
- Document 2-3 minute target vs 10-15 minute full path
- Document async pillar generation behavior

---

### Gap 5: Voice Recorder Duplicate Components

| Aspect | Detail |
|--------|--------|
| Location 1 | `src/components/voice/VoiceRecorder.tsx` |
| Location 2 | `src/components/brand-dna/VoiceRecorder.tsx` |

**Issue:** Two VoiceRecorder components exist with potential divergence.

**Resolution:**
- Audit both components
- Consolidate to single shared component
- Update imports in BrandDNAConversation.tsx

---

## MINOR: Missing in Docs

### Gap 6: Session Recovery Not Documented

| Aspect | Detail |
|--------|--------|
| Code Location | BrandDNAAgent.ts:229-245 |

**Behavior:** If client closes browser mid-session and returns with same token, agent resumes from last step.

**Documentation Needed:** Add to PRD as NFR for session persistence.

---

### Gap 7: Rate Limiting Behavior

| Aspect | Detail |
|--------|--------|
| Code Location | BrandDNAAgent.ts:317-326 |

**Behavior:** 10 messages per 60 seconds per connection. Returns "Too many messages" error.

**Documentation Needed:** Add to PRD as NFR for abuse prevention.

---

### Gap 8: AI Fallback Behavior

| Aspect | Detail |
|--------|--------|
| Code Location | BrandDNAAgent.ts:557-567 |

**Behavior:** If AI analysis fails, agent proceeds to next step with empty/default personality data.

**Documentation Needed:** Document graceful degradation behavior.

---

## Contradictions

### Contradiction 1: Voice Duration Labels

| Source | Value |
|--------|-------|
| PRD FR-1.5.1a | "2-minute voice note" (120 seconds) |
| Express Path Code | 60 seconds max |
| UI Label (need to verify) | May show "2 minutes" for express |

**Resolution:** Verify UI labels match actual limits. Express should show "1 minute".

---

### Contradiction 2: Pillar Count

| Source | Value |
|--------|-------|
| PRD | "3-5 strategic pillars" |
| BrandDNAAgent.ts:974-979 | Generates 4 by default |
| strategy.ts:337 | Requires minimum 3 to lock |

**Status:** Acceptable - 4 default is within 3-5 range. Min 3 is documented.

---

### Contradiction 3: Token Expiry Display

| Source | Behavior |
|--------|----------|
| Code (clients.ts:149) | 7 days |
| Email Template | Says "This link expires in 7 days" |
| Error Message | "Invitation expired" (no duration shown) |

**Resolution:** Consider showing remaining time or expiry date in error.

---

## Priority Resolution Matrix

| # | Gap | Priority | Effort | Owner | Target |
|---|-----|----------|--------|-------|--------|
| 1 | Private Win Video | P0 (DESCOPED) | 4-6h | TBD | Phase 1.6 |
| 2 | Testimonial Flow | P1 | 6-8h | TBD | Phase 1.5.1 |
| 3 | Express Pillar Flow | P2 | 2h | TBD | Document as-is |
| 4 | Express Path Docs | P2 | 1h | TBD | Next sprint |
| 5 | Duplicate VoiceRecorder | P3 | 2h | TBD | Tech debt |
| 6-8 | Doc gaps | P3 | 2h | TBD | Next sprint |

---

## Stories Needing Updates

### Story 10-1 Updates Needed

**Add Acceptance Criteria:**
- AC-NEW-1: Token validation returns friendly error for expired tokens with resend option
- AC-NEW-2: Session resumes from last step if client returns mid-session
- AC-NEW-3: Express path available as alternative to full onboarding

### Story 1.5-8-5 Updates Needed

**Current Status:** Story exists but implementation incomplete

**Update Required:**
- Mark as "In Progress" or "Blocked"
- Add implementation tasks for UI integration
- Link to strategy.lockStrategy completion trigger

---

## Recommendations

1. **Prioritize Testimonial Flow** - High business value, moderate effort
2. **Document Express Path** - Quick win, reduces confusion
3. **Consolidate VoiceRecorder** - Tech debt before it diverges further
4. **Accept Private Win Descope** - Product owner to sign off
5. **Add E2E Tests** - Critical path needs test coverage

---

*Generated by BMAD-TRACER - Claude Opus 4.5*
