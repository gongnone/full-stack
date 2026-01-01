# Story 10-1: Client Brand DNA Email Invitation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P0
**Status:** done
**Effort:** 4-6 hours
**Created:** 2025-12-29

---

## User Story

**As an** agency owner,
**I want** the system to automatically invite my clients to set up their Brand DNA when I create them,
**So that** clients can self-serve their brand voice capture without me chasing them.

## Context

Currently, agencies create clients but have no automated way to get Brand DNA from them. The agency either guesses at brand voice or manually coordinates with clients. This story creates the automated invitation flow.

## Acceptance Criteria

### AC1: Auto-Send on Client Creation
- [x] When agency creates client with email address, system generates Brand DNA invitation
- [x] Email sent via AWS SES (reuse Story 9-4 infrastructure)
- [x] Email includes agency name, personalized greeting, clear CTA
- [x] Invitation token generated with 7-day expiration

### AC2: Email Content & Design
- [x] Subject: "[Agency Name] invited you to set up your brand voice"
- [x] Mobile-optimized HTML template
- [x] Clear value proposition: "2 minutes to capture YOUR authentic voice"
- [x] Primary CTA button: "Set Up My Brand Voice"
- [x] Explains what they'll do: record voice, upload content, answer questions

### AC3: Token-Gated Landing Page
- [x] Route: `/onboard/:token` (public, no auth required)
- [x] Token validation: check expiry, check not already used
- [x] Invalid/expired token: friendly error with "Request new invite" option
- [x] Valid token: resolves to clientId, loads onboarding UI

### AC4: Voice Recording on Landing Page
- [x] Reuse VoiceRecorder component from Story 2-2
- [x] Guided prompt displayed: "Tell us about the customers you love working with — and the ones who drive you crazy"
- [x] Recording limit: 2 minutes
- [x] Works on mobile browsers (iOS Safari, Chrome Android)
- [x] Upload to R2, trigger Whisper transcription

### AC5: Optional Content Upload
- [x] Allow PDF/text paste as secondary input
- [x] "Already have content? Upload your best posts"
- [x] Same processing as Story 2-1 (multi-source ingestion)

### AC6: Submission & Processing
- [x] On submit: show processing state "Analyzing your brand..."
- [x] Write raw Brand DNA to client's tables (voice_markers, brand_stances, etc.)
- [x] Mark invitation token as used
- [x] Trigger next phase (Story 10-2: Deep Research)

### AC7: Agency Notification
- [x] Agency owner receives email: "Sarah completed Brand DNA setup"
- [x] Client card in dashboard shows status change: "Brand DNA: Processing"
- [x] Include link to view client's Brand DNA results

### AC8: Resend Capability
- [x] Agency can resend invitation from client settings
- [x] Previous token invalidated, new token generated
- [x] "Invitation sent" confirmation shown

## Technical Implementation

### Database Changes
```sql
-- New table for onboarding tokens
CREATE TABLE client_onboard_tokens (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
```

### API Endpoints
```typescript
// tRPC mutations
clients.create → now also sends Brand DNA invite email
clients.resendInvite({ clientId }) → regenerate token, send email

// Public routes (no auth)
GET /onboard/:token → validate token, render onboarding page
POST /api/onboard/:token/submit → process voice/content, write Brand DNA
```

### Email Template
```html
Subject: [Agency Name] invited you to set up your brand voice

Hi [Client Name],

[Agency Name] is setting up AI-powered content generation for your brand.
To make sure every piece sounds authentically YOU, we need 2 minutes of your time.

[Set Up My Brand Voice →]

You'll:
• Record a quick voice note (just talk naturally!)
• Optionally upload your best existing content

The more you share, the better your content will be.

Questions? Reply to this email.
```

## Mobile-First Requirements

- [x] Landing page fully responsive, tested on iPhone/Android
- [x] Voice recording works on mobile browsers
- [x] Large touch targets (44px minimum)
- [x] No horizontal scrolling
- [x] Progress indicator visible on small screens

## Dependencies

- Story 2-2: Voice-to-Grounding Pipeline ✅
- Story 9-4: AWS SES Email Service ✅
- Story 7-6: Token pattern reference ✅

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Create client with email | Invitation email sent within 60 seconds |
| Click invite link (valid) | Landing page loads with voice recorder |
| Click invite link (expired) | Friendly error, "Request new invite" option |
| Record voice on mobile | Audio captured, uploaded successfully |
| Submit Brand DNA | Processing shown, agency notified |
| Resend invite | Old token invalid, new email sent |

## Out of Scope

- SMS notifications (Story 10-4)
- Deep research / pillar synthesis (Stories 10-2, 10-3)
- Pillar approval flow (Story 10-4)

---

## Definition of Done

- [x] All acceptance criteria verified
- [x] Mobile testing on iOS Safari and Chrome Android
- [x] Email deliverability tested (check spam score)
- [x] Token security reviewed (no enumeration, proper expiry)
- [x] Agency notification working
- [x] Integration with Story 10-2 trigger point documented

## Dev Agent Record

### Implementation Notes - 2025-12-30
- Implemented `client_onboard_tokens` table in D1 schema.
- Added `sendBrandDNAInvitation` to email service using AWS SES.
- Updated `clients.create` to generate invitation token and send email.
- Created new `onboarding` router for public token validation and submission.
- Added public upload endpoint in `app.ts` for unauthenticated uploads (token-gated).
- Implemented `onboard.$token.tsx` landing page with Voice Recorder and Content Upload tabs.
- Integrated `VoiceRecorder` component with manual upload logic to public endpoint.

### Implementation Notes - 2026-01-01 (AC7, AC8, Mobile)
- Added `sendBrandDNACompletionEmail` function to notify agency owner when client completes Brand DNA.
- Updated `onboarding.submit` mutation to:
  - Create/update `brand_dna_sessions` record with status 'processing'
  - Send notification email to agency owner with link to view results
- Added `clients.resendBrandDNAInvite` mutation:
  - Invalidates existing tokens
  - Generates new token with 7-day expiry
  - Sends fresh invitation email
- Enhanced mobile-first UI:
  - Added progress indicator (0/2, 1/2, 2/2)
  - All touch targets now 44px minimum
  - `overflow-x-hidden` prevents horizontal scrolling
  - Responsive text sizes and spacing
  - Active states for touch feedback

### File List
- packages/foundry-core/src/schema/index.ts
- apps/foundry-dashboard/worker/email/index.ts
- apps/foundry-dashboard/worker/trpc/routers/clients.ts
- apps/foundry-dashboard/worker/trpc/routers/onboarding.ts
- apps/foundry-dashboard/src/routes/onboard.$token.tsx
- apps/foundry-dashboard/worker/trpc/router.ts
- apps/foundry-dashboard/worker/hono/app.ts
- apps/foundry-dashboard/worker/index.ts
- apps/foundry-dashboard/worker/trpc/routers/__tests__/onboarding.integration.test.ts