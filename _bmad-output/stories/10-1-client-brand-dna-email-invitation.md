# Story 10-1: Client Brand DNA Email Invitation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P0
**Status:** ready
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
- [ ] When agency creates client with email address, system generates Brand DNA invitation
- [ ] Email sent via AWS SES (reuse Story 9-4 infrastructure)
- [ ] Email includes agency name, personalized greeting, clear CTA
- [ ] Invitation token generated with 7-day expiration

### AC2: Email Content & Design
- [ ] Subject: "[Agency Name] invited you to set up your brand voice"
- [ ] Mobile-optimized HTML template
- [ ] Clear value proposition: "2 minutes to capture YOUR authentic voice"
- [ ] Primary CTA button: "Set Up My Brand Voice"
- [ ] Explains what they'll do: record voice, upload content, answer questions

### AC3: Token-Gated Landing Page
- [ ] Route: `/onboard/:token` (public, no auth required)
- [ ] Token validation: check expiry, check not already used
- [ ] Invalid/expired token: friendly error with "Request new invite" option
- [ ] Valid token: resolves to clientId, loads onboarding UI

### AC4: Voice Recording on Landing Page
- [ ] Reuse VoiceRecorder component from Story 2-2
- [ ] Guided prompt displayed: "Tell us about the customers you love working with — and the ones who drive you crazy"
- [ ] Recording limit: 2 minutes
- [ ] Works on mobile browsers (iOS Safari, Chrome Android)
- [ ] Upload to R2, trigger Whisper transcription

### AC5: Optional Content Upload
- [ ] Allow PDF/text paste as secondary input
- [ ] "Already have content? Upload your best posts"
- [ ] Same processing as Story 2-1 (multi-source ingestion)

### AC6: Submission & Processing
- [ ] On submit: show processing state "Analyzing your brand..."
- [ ] Write raw Brand DNA to client's tables (voice_markers, brand_stances, etc.)
- [ ] Mark invitation token as used
- [ ] Trigger next phase (Story 10-2: Deep Research)

### AC7: Agency Notification
- [ ] Agency owner receives email: "Sarah completed Brand DNA setup"
- [ ] Client card in dashboard shows status change: "Brand DNA: Processing"
- [ ] Include link to view client's Brand DNA results

### AC8: Resend Capability
- [ ] Agency can resend invitation from client settings
- [ ] Previous token invalidated, new token generated
- [ ] "Invitation sent" confirmation shown

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

- [ ] Landing page fully responsive, tested on iPhone/Android
- [ ] Voice recording works on mobile browsers
- [ ] Large touch targets (44px minimum)
- [ ] No horizontal scrolling
- [ ] Progress indicator visible on small screens

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

- [ ] All acceptance criteria verified
- [ ] Mobile testing on iOS Safari and Chrome Android
- [ ] Email deliverability tested (check spam score)
- [ ] Token security reviewed (no enumeration, proper expiry)
- [ ] Agency notification working
- [ ] Integration with Story 10-2 trigger point documented
