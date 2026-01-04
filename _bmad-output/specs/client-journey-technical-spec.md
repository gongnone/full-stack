# Client BrandDNA User Journey - Technical Specification

> **Version:** 1.0.0
> **Last Updated:** 2026-01-04
> **Author:** BMAD-TRACER (Claude Opus 4.5)

---

## Overview

This document traces the complete client journey from email invitation through BrandDNA completion, with code references and data flow.

## Prerequisites

- Client has been created in the system by an agency owner
- Invitation email has been sent via `sendBrandDNAInvitation()`
- Token is valid and not expired (7-day expiry)

---

## Journey Flow

```
Email Click → Token Validation → BrandDNA Agent Conversation → Completion → Post-Completion Flows
```

---

## Step 0: Email Invitation

### Trigger
Client creation with `contactEmail` in `clients.create` mutation.

### Email Generation

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Template Location | `apps/foundry-dashboard/worker/email/index.ts` | `sendBrandDNAInvitation()` |
| Send Function | `apps/foundry-dashboard/worker/trpc/routers/clients.ts:141-181` | Inside `create` mutation |
| Resend Function | `apps/foundry-dashboard/worker/trpc/routers/clients.ts:683-745` | `resendInvitation` mutation |

### Token Generation

```typescript
// clients.ts:148-163
const token = crypto.randomUUID().replace(/-/g, '');
const tokenId = crypto.randomUUID();
const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

await ctx.db.prepare(`
  INSERT INTO client_onboard_tokens (id, client_id, token, expires_at, created_at)
  SELECT ?, ?, ?, ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM client_onboard_tokens t
    JOIN clients c ON c.id = t.client_id
    WHERE c.contact_email = ? AND t.created_at > ?
  )
`).bind(tokenId, clientId, token, expiresAt, now, input.contactEmail, recentWindow).run();
```

### Email Content

| Field | Value |
|-------|-------|
| Subject | `[Client Name] - Your Brand Voice Setup` |
| Sender | `noreply@foundry.williamjshaw.ca` (AWS SES) |
| CTA Button | `Set Up My Brand Voice` |
| URL Format | `${BETTER_AUTH_URL}/onboard/${token}` |

---

## Step 1: Landing Page & Token Validation

### Route Definition
```
apps/foundry-dashboard/src/routes/onboard.$token.tsx
```

### URL Pattern
```
/onboard/:token
```

### Token Validation

**tRPC Procedure:** `onboarding.validateInvite`

**Location:** `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts:10-47`

**Validation Steps:**
1. Query `client_onboard_tokens` table with token
2. Check if token exists → `NOT_FOUND` error
3. Check if token expired → `FORBIDDEN` error
4. Check if token already used → `FORBIDDEN` error
5. Return `{ valid: true, clientId, clientName }`

**Error Responses:**

| Condition | Error Code | Message |
|-----------|------------|---------|
| Token not found | `NOT_FOUND` | "Invalid invitation link." |
| Token expired | `FORBIDDEN` | "Invitation expired." |
| Token used | `FORBIDDEN` | "Invitation already used." |

---

## Step 2: BrandDNA Agent Conversation

### Entry Point
When `useAgentFlow` is true (default) and `clientId` is valid:

```tsx
// onboard.$token.tsx:162-171
if (useAgentFlow && data?.clientId) {
  return (
    <BrandDNAConversation
      clientId={data.clientId}
      clientName={data.clientName}
      onComplete={handleAgentFlowComplete}
      onboardingToken={token}
    />
  )
}
```

### BrandDNA Agent Durable Object

**Location:** `apps/foundry-dashboard/worker/durable-objects/BrandDNAAgent.ts`

### Conversation Steps

#### Full Path (10-15 minutes)
```
welcome → voice_capture → brand_description → audience_questions →
platform_selection → competitor_input → pillar_proposal → review → complete
```

#### Express Path (2-3 minutes)
```
welcome → voice_capture → express_brand → express_audience →
express_platform → complete
```

---

### Step 2.1: Welcome

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `onConnect()` | Line 223-312 |
| Agent Message | "Hi! I'm your Brand DNA Agent..." | Line 258-259 |
| User Action | Choose path (Full/Express) | ButtonChoice component |
| Data Collected | None | - |
| PRD Reference | FR-1.5.1 | Voice capture introduction |

### Step 2.2: Voice Capture (P0 for ALL paths)

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `sendVoiceCapturePrompt()` | Line 726-753 |
| Max Duration (Full) | 120 seconds | Line 733 |
| Max Duration (Express) | 60 seconds | Line 733 |
| Skip Option | Yes - "I'd rather type" | Line 742-743 |
| Transcription | Whisper via Workers AI | Line 416-421 |
| Personality Analysis | LLaMA 3.1 8B | Line 502-505 |

**Voice Recording Flow:**
1. Client records audio via `VoiceRecorder` component
2. Audio uploaded to R2 via `/api/upload/onboarding/${token}/${filename}`
3. BrandDNA Agent receives `r2Key` via WebSocket
4. Agent fetches audio from R2, transcribes with Whisper
5. Personality extracted using LLaMA prompt
6. Results stored in session state

**Data Collected:**
```typescript
{
  voiceSamples: Array<{
    r2Key: string;
    transcript: string;
    durationMs: number;
  }>;
  brandPersonality: {
    tone: string;
    vocabulary: string[];
    style: string;
    uniquePhrases: string[];
    summary: string;
  };
}
```

### Step 2.3: Audience Questions (Full Path Only)

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `sendAudienceQuestion()` | Line 802-833 |
| Total Questions | 5 | `AUDIENCE_QUESTIONS` array, Line 72-98 |
| Skip Option | Yes (next_question action) | Line 397-398 |

**Questions:**
1. Demographics - "Who is your ideal customer?"
2. Pain Points - "What are the biggest challenges?"
3. Aspirations - "What does success look like?"
4. Content Habits - "Where do they spend time online?"
5. Decision Factors - "What influences their buying decisions?"

### Step 2.4: Platform Selection

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `sendPlatformSelection()` | Line 858-918 |
| Min Selection | 2 | Line 907 |
| Max Selection | 4 | Line 907 |
| AI Recommendations | LLaMA 3.1 8B | Line 863-896 |

**Platform Options:**
- LinkedIn, Twitter/X, Instagram, TikTok, YouTube, Threads, Newsletter

### Step 2.5: Competitor Input (Full Path Only)

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `handleCompetitorInput()` | Line 959-965 |
| Skip Option | Yes | QuestionCard with skipOption |
| Data Collected | `competitors: string` | SESSION_KEYS.COMPETITORS |

### Step 2.6: Pillar Proposal (Full Path Only)

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `generatePillars()` | Line 967-1046 |
| Default Pillars | 4 | Line 974-979 |
| AI Generation | LLaMA 3.1 8B | Line 1005-1008 |
| Regenerate Option | Yes | allowRegenerate: true |

### Step 2.7: Review Summary (Full Path Only)

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `sendReviewSummary()` | Line 1062-1096 |
| Component | `BrandDNAReport` | Line 1069-1086 |
| Actions | Complete / Make Changes | Line 1083-1085 |

### Step 2.8: Completion

| Aspect | Detail | Code Reference |
|--------|--------|----------------|
| Handler | `completeSession()` | Line 1098-1222 |
| Sync to ClientAgent | Yes | Line 1100-1202 |
| Final Message | "Congratulations! Your Brand DNA is now captured..." | Line 1210 |

---

## Step 3: Post-Completion Flows

### 3.1 Token Marked as Used

**Location:** `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts:84-89`

```sql
UPDATE client_onboard_tokens SET used_at = ? WHERE id = ?
```

### 3.2 Agency Notification

**Location:** `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts:120-139`

- Queries `client_members` for `agency_owner` role
- Sends `sendBrandDNACompletionEmail()` to agency owner

### 3.3 Research Agent Trigger (Story 10-2)

**Location:** `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts:148-161`

```typescript
const { triggerResearchFromOnboarding } = await import('./research');
await triggerResearchFromOnboarding(ctx, invite.client_id);
```

**Research Pipeline Steps:**
1. Industry detection via AI
2. Framework fit analysis (TEACH/ENTERTAIN/ENGINEER/CHALLENGE)
3. Pillar synthesis trigger (Story 10-3)
4. Strategy approval token creation (Story 10-4)
5. Strategy ready email sent to client

### 3.4 Strategy Approval Flow (Story 10-4)

**Location:** `apps/foundry-dashboard/worker/trpc/routers/strategy.ts`

**Public Endpoints:**
- `validateStrategyToken` - Validate token and get pillars
- `approvePillar` - Approve individual pillar
- `lockStrategy` - Finalize strategy (min 3 pillars required)

### 3.5 Private Win Video (FR-1.5.15)

**STATUS: DESCOPED**

See: `_bmad-output/descope/FR-1.5.15-private-win-video.md`

### 3.6 Testimonial Request (FR-1.5.16)

**STATUS: PARTIAL**

- Backend exists: `apps/foundry-dashboard/worker/trpc/routers/testimonials.ts`
- NOT integrated into BrandDNA completion flow
- No client-facing prompt after BrandDNA completion

---

## Data Model

### Database Tables

#### client_onboard_tokens
```sql
CREATE TABLE client_onboard_tokens (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);
```

#### brand_dna_sessions
```sql
CREATE TABLE brand_dna_sessions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'processing', 'researching', 'pillars_ready', 'complete', 'failed')),
  current_step TEXT,
  total_transcription TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### client_research_reports
```sql
CREATE TABLE client_research_reports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  industry TEXT,
  sub_niche TEXT,
  top_performers_json TEXT,
  hook_patterns_json TEXT,
  competitive_gaps_json TEXT,
  framework_fit_json TEXT,
  recommendations_json TEXT,
  status TEXT CHECK(status IN ('researching', 'complete', 'failed')),
  started_at INTEGER,
  completed_at INTEGER,
  created_at INTEGER NOT NULL
);
```

#### client_proposed_pillars
```sql
CREATE TABLE client_proposed_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  pillars_json TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'approved', 'rejected')),
  generation_round INTEGER DEFAULT 1,
  approved_at INTEGER,
  created_at INTEGER NOT NULL
);
```

#### strategy_approval_tokens
```sql
CREATE TABLE strategy_approval_tokens (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  locked_at INTEGER,
  created_at INTEGER NOT NULL
);
```

### Durable Object State (BrandDNAAgent)

**SQLite Tables within DO:**

```sql
-- Session State (key-value)
session_state(key, value, updated_at)

-- Conversation History
conversation_history(id, role, content, component_type, created_at)

-- Voice Samples
voice_samples(id, r2_key, transcript, duration_ms, analyzed, created_at)

-- Audience Answers
audience_answers(id, question_id, answer, created_at)

-- Rate Limits
rate_limits(connection_id, timestamps, updated_at)
```

---

## API Endpoints

### Public (No Auth Required)

| Method | Endpoint | tRPC Procedure | Description |
|--------|----------|----------------|-------------|
| GET | `/api/trpc/onboarding.validateInvite` | `onboarding.validateInvite` | Validate invite token |
| POST | `/api/trpc/onboarding.submit` | `onboarding.submit` | Submit BrandDNA data |
| WS | `/brand-dna/{clientId}` | BrandDNAAgent DO | WebSocket conversation |
| POST | `/api/upload/onboarding/{token}/{filename}` | Direct upload | Upload voice/content |
| GET | `/api/trpc/strategy.validateStrategyToken` | `strategy.validateStrategyToken` | Validate strategy token |
| POST | `/api/trpc/strategy.approvePillar` | `strategy.approvePillar` | Approve pillar |
| POST | `/api/trpc/strategy.lockStrategy` | `strategy.lockStrategy` | Lock strategy |

### Authenticated (Agency)

| Method | Endpoint | tRPC Procedure | Description |
|--------|----------|----------------|-------------|
| POST | `/api/trpc/clients.create` | `clients.create` | Create client + send invite |
| POST | `/api/trpc/clients.resendInvitation` | `clients.resendInvitation` | Resend invite |
| POST | `/api/trpc/research.startResearch` | `research.startResearch` | Trigger research |
| GET | `/api/trpc/research.getReport` | `research.getReport` | Get research report |
| GET | `/api/trpc/strategy.getApprovedPillars` | `strategy.getApprovedPillars` | Get approved pillars |

---

## Error Handling

| Error Case | User Message | Code Location |
|------------|--------------|---------------|
| Token not found | "Invalid invitation link." | onboarding.ts:30 |
| Token expired | "Invitation expired." | onboarding.ts:35 |
| Token used | "Invitation already used." | onboarding.ts:39 |
| Voice transcription failed | "Voice transcription failed. Please try again or use text input." | BrandDNAAgent.ts:452 |
| AI analysis failed | Graceful fallback to next step | BrandDNAAgent.ts:557-567 |
| Rate limited | "Too many messages. Please wait X seconds." | BrandDNAAgent.ts:323-326 |

---

## Related Documents

- PRD Phase 1.5: `_bmad-output/prd-phase-1.5-mvf.md`
- Story 10-1 (Email Invitation): `_bmad-output/stories/10-1-client-brand-dna-email-invitation.md`
- Story 10-2 (Deep Research): `_bmad-output/stories/10-2-deep-research-agent.md`
- Epic 10 (Strategic Brand Onboarding): `_bmad-output/epics/epic-10-strategic-brand-onboarding.md`
- Descope FR-1.5.15: `_bmad-output/descope/FR-1.5.15-private-win-video.md`

---

*Generated by BMAD-TRACER - Claude Opus 4.5*
