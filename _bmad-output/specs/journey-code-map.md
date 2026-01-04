# Client BrandDNA Journey - Code Map

> **Version:** 1.0.0
> **Last Updated:** 2026-01-04
> **Author:** BMAD-TRACER

---

## File Index

### Email & Invitation

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/worker/email/index.ts` | Email sending (AWS SES) | `sendBrandDNAInvitation()`, `sendBrandDNACompletionEmail()`, `sendStrategyReadyEmail()`, `sendStrategyLockedEmail()` |
| `apps/foundry-dashboard/worker/trpc/routers/clients.ts` | Client CRUD + invitation | `clientsRouter.create`, `clientsRouter.resendInvitation` |

### Token Validation & Onboarding

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts` | Token validation & submission | `onboardingRouter.validateInvite`, `onboardingRouter.submit` |
| `apps/foundry-dashboard/src/routes/onboard.$token.tsx` | Landing page component | `OnboardingPage` component |

### BrandDNA Agent

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/worker/durable-objects/BrandDNAAgent.ts` | Stateful conversation agent | `BrandDNAAgent` class |
| `apps/foundry-dashboard/src/lib/use-brand-dna-agent.ts` | React hook for WebSocket | `useBrandDNAAgent()` |
| `apps/foundry-dashboard/src/components/brand-dna/BrandDNAConversation.tsx` | Conversation UI | `BrandDNAConversation` component |

### Voice Recording

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/src/components/voice/VoiceRecorder.tsx` | Audio recording component | `VoiceRecorder` component |
| `apps/foundry-dashboard/src/components/brand-dna/VoiceRecorder.tsx` | Duplicate/legacy recorder | `VoiceRecorder` component |

### Research & Strategy

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/worker/trpc/routers/research.ts` | Deep research agent | `researchRouter`, `triggerResearchFromOnboarding()` |
| `apps/foundry-dashboard/worker/trpc/routers/strategy.ts` | Strategy approval flow | `strategyRouter` |
| `apps/foundry-dashboard/worker/trpc/routers/pillars.ts` | Pillar management | `pillarsRouter` |

### Testimonials (Partial)

| File | Purpose | Key Functions/Exports |
|------|---------|----------------------|
| `apps/foundry-dashboard/worker/trpc/routers/testimonials.ts` | Testimonial CRUD | `testimonialsRouter` |
| `apps/foundry-dashboard/src/components/testimonials/TestimonialGrid.tsx` | Agency testimonial view | `TestimonialGrid` component |

### Database Schema

| File | Purpose | Key Exports |
|------|---------|-------------|
| `packages/foundry-core/src/schema/index.ts` | Drizzle ORM schema | All table definitions |
| `apps/foundry-dashboard/worker/db/schema.ts` | Extended D1 schema | Additional table definitions |
| `apps/foundry-dashboard/migrations/*.sql` | Migration files | SQL migrations |

---

## Dependency Graph

```
Client Click Email
       │
       ▼
┌─────────────────────────────────────────────────┐
│  onboard.$token.tsx (Landing Page)              │
│  └─ imports: BrandDNAConversation               │
│  └─ uses: trpc.onboarding.validateInvite        │
│  └─ uses: trpc.onboarding.submit                │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  BrandDNAConversation.tsx                       │
│  └─ imports: useBrandDNAAgent                   │
│  └─ imports: VoiceRecorder                      │
│  └─ renders: MessageBubble, ComponentRenderer   │
└─────────────────────────────────────────────────┘
       │
       ▼ (WebSocket)
┌─────────────────────────────────────────────────┐
│  BrandDNAAgent.ts (Durable Object)              │
│  └─ uses: env.AI (Whisper, LLaMA)               │
│  └─ uses: env.MEDIA (R2)                        │
│  └─ uses: env.CONTENT_ENGINE (ClientAgent)      │
│  └─ persists: SQLite (session_state, etc.)      │
└─────────────────────────────────────────────────┘
       │
       ▼ (Completion)
┌─────────────────────────────────────────────────┐
│  onboarding.submit                              │
│  └─ marks token as used                         │
│  └─ sends agency notification email             │
│  └─ triggers research agent                     │
└─────────────────────────────────────────────────┘
       │
       ▼ (Async)
┌─────────────────────────────────────────────────┐
│  research.ts: triggerResearchFromOnboarding()   │
│  └─ runs AI research pipeline                   │
│  └─ triggers pillar synthesis                   │
│  └─ creates strategy approval token             │
│  └─ sends strategy ready email                  │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────┐
│  /strategy/{token} (Strategy Approval Page)     │
│  └─ validateStrategyToken                       │
│  └─ approvePillar (per pillar)                  │
│  └─ lockStrategy (min 3 pillars)                │
└─────────────────────────────────────────────────┘
```

---

## Line-by-Line Key References

### Email Sending

```typescript
// apps/foundry-dashboard/worker/email/index.ts

// Line ~50-80: sendBrandDNAInvitation()
export async function sendBrandDNAInvitation(
  env: Env,
  email: string,
  clientName: string,
  inviteUrl: string,
  agencyName: string
): Promise<void>

// Line ~100-130: sendBrandDNACompletionEmail()
export async function sendBrandDNACompletionEmail(
  env: Env,
  email: string,
  clientName: string,
  clientId: string,
  dashboardUrl: string
): Promise<void>
```

### Token Validation

```typescript
// apps/foundry-dashboard/worker/trpc/routers/onboarding.ts

// Line 10-47: validateInvite
validateInvite: publicProcedure
  .input(z.object({ token: z.string() }))
  .query(async ({ ctx, input }) => {
    // Line 16-27: Query token from DB
    const invite = await ctx.db.prepare(`
      SELECT t.*, c.name as client_name
      FROM client_onboard_tokens t
      JOIN clients c ON t.client_id = c.id
      WHERE t.token = ?
    `).bind(input.token).first();

    // Line 29-40: Validation checks
    if (!invite) throw new TRPCError({ code: 'NOT_FOUND' });
    if (invite.expires_at < now) throw new TRPCError({ code: 'FORBIDDEN' });
    if (invite.used_at) throw new TRPCError({ code: 'FORBIDDEN' });

    // Line 42-46: Return valid result
    return { valid: true, clientId, clientName };
  })
```

### BrandDNA Agent Step Handlers

```typescript
// apps/foundry-dashboard/worker/durable-objects/BrandDNAAgent.ts

// Line 223-312: onConnect() - Welcome & session resume
// Line 317-373: onMessage() - Message router
// Line 395-476: handleVoiceSample() - Voice recording handler
// Line 481-569: analyzeVoicePersonality() - AI personality extraction
// Line 574-607: handleTextInput() - Text response router
// Line 612-637: handleSelection() - Button/platform selection
// Line 642-720: handleAction() - Action message handler
// Line 726-753: sendVoiceCapturePrompt() - Voice capture step
// Line 802-833: sendAudienceQuestion() - Audience questions
// Line 858-918: sendPlatformSelection() - Platform selection
// Line 967-1046: generatePillars() - AI pillar generation
// Line 1098-1222: completeSession() - Sync to ClientAgent & complete
```

### Research Pipeline

```typescript
// apps/foundry-dashboard/worker/trpc/routers/research.ts

// Line 602-664: triggerResearchFromOnboarding()
export async function triggerResearchFromOnboarding(
  ctx: Context,
  clientId: string
): Promise<{ reportId: string; status: string }>

// Line 396-500: runResearchPipeline() - AI research execution
async function runResearchPipeline(ctx, clientId, reportId, data)

// Line 504-532: triggerPillarSynthesis() - Generate strategic pillars
async function triggerPillarSynthesis(ctx, clientId, report)

// Line 667-710: createStrategyApprovalAndNotify() - Token + email
async function createStrategyApprovalAndNotify(ctx, clientId)
```

---

## Environment Dependencies

### Workers AI Models

| Model | Usage | Location |
|-------|-------|----------|
| `@cf/openai/whisper` | Voice transcription | BrandDNAAgent.ts:416, research.ts:422 |
| `@cf/meta/llama-3.1-8b-instruct` | Personality analysis, pillar generation | BrandDNAAgent.ts:502, research.ts:133 |

### R2 Storage

| Bucket | Purpose | Path Pattern |
|--------|---------|--------------|
| `MEDIA` | Voice recordings | `/voice-samples/{client_id}/{uuid}.webm` |
| `MEDIA` | Content uploads | `/content/{client_id}/{filename}` |

### Durable Objects

| DO Class | Purpose | Namespace |
|----------|---------|-----------|
| `BrandDNAAgent` | Per-client conversation state | `BRAND_DNA_AGENT` |
| `ClientAgent` | Per-client content state | `CONTENT_ENGINE` |

---

## Test Coverage

### Unit Tests

| File | Test File | Status |
|------|-----------|--------|
| BrandDNAAgent.ts | BrandDNAAgent.test.ts | EXISTS |
| research.ts | research.test.ts | EXISTS |
| pillars.ts | pillars.test.ts | EXISTS |

### E2E Tests

| Flow | Test File | Status |
|------|-----------|--------|
| Onboarding flow | e2e/onboarding.spec.ts | CHECK NEEDED |
| BrandDNA conversation | e2e/brand-dna.spec.ts | CHECK NEEDED |

---

*Generated by BMAD-TRACER - Claude Opus 4.5*
