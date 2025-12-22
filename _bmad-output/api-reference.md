# API Reference - The Agentic Content Foundry

> tRPC procedures and Cloudflare Workflows

## Overview

The API layer uses **tRPC** for end-to-end type safety. All procedures require authentication via Better Auth session.

**Base Path:** `/trpc`

**Router Location:** `apps/dashboard/worker/trpc/routers/`

---

## Authentication

All requests require a valid session cookie:

```typescript
// worker/hono/app.ts
app.use('/trpc/*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('userId', session.user.id);
  c.set('accountId', session.user.accountId);
  return next();
});
```

---

## Router Structure

```typescript
export const appRouter = t.router({
  hubs: hubsRouter,           // Hub management
  spokes: spokesRouter,       // Spoke management
  review: reviewRouter,       // Bulk approval
  clients: clientsRouter,     // Multi-client management
  calibration: calibrationRouter,  // Brand DNA calibration
  analytics: analyticsRouter, // Metrics & Zero-Edit Rate
  exports: exportsRouter,     // Content export
});
```

---

## Hubs Router

**Prefix:** `hubs.*`

### `hubs.create`

Create a new Hub from source material.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, sourceType: 'pdf' | 'url' | 'transcript' | 'text', source: string | File, title?: string }` |
| **Output** | `{ hubId: string, status: 'processing' }` |

```typescript
const createHub = trpc.hubs.create.useMutation();
await createHub.mutateAsync({
  clientId: 'client-123',
  sourceType: 'pdf',
  source: pdfFile,
  title: 'Q1 Strategy Document'
});
```

**Side Effects:**
- Uploads source to R2 (`/assets/{clientId}/sources/{hubId}/`)
- Creates hub_registry entry in D1
- Creates hub record in Durable Object SQLite
- Triggers `HubIngestionWorkflow`

---

### `hubs.list`

List all Hubs for a client.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, status?: 'processing' | 'ready' | 'killed', limit?: number, cursor?: string }` |
| **Output** | `{ items: Hub[], nextCursor?: string }` |

```typescript
const { data } = trpc.hubs.list.useQuery({
  clientId: 'client-123',
  status: 'ready',
  limit: 20
});
```

---

### `hubs.get`

Get a single Hub with pillars and spoke counts.

| Type | Query |
|------|-------|
| **Input** | `{ hubId: string }` |
| **Output** | `{ hub: Hub, pillars: Pillar[], spokeCount: number, pendingCount: number }` |

---

### `hubs.kill`

Kill a Hub (cascade delete all child spokes).

| Type | Mutation |
|------|----------|
| **Input** | `{ hubId: string, reason?: string }` |
| **Output** | `{ success: boolean, killedSpokes: number, survivedSpokes: number }` |

**Kill Chain Behavior:**
1. All non-mutated spokes → `status: 'killed'`
2. Mutated spokes → Promoted to manual assets (survive kill)
3. All pillars → `status: 'killed'`
4. Hub → `status: 'killed'`, `killed_at`, `kill_reason`

---

### `hubs.getProgress`

Get Hub processing progress (polling).

| Type | Query |
|------|-------|
| **Input** | `{ hubId: string }` |
| **Output** | `{ status: string, currentPhase: string, progress: number, error?: string }` |

```typescript
const { data } = trpc.hubs.getProgress.useQuery(
  { hubId },
  {
    refetchInterval: (data) =>
      data?.status === 'processing' ? 2000 : false
  }
);
```

---

## Spokes Router

**Prefix:** `spokes.*`

### `spokes.list`

List spokes with filtering.

| Type | Query |
|------|-------|
| **Input** | `{ hubId?: string, pillarId?: string, platform?: Platform, status?: SpokeStatus, g7Min?: number, limit?: number, cursor?: string }` |
| **Output** | `{ items: SpokeWithScores[], nextCursor?: string }` |

```typescript
// Get top performers (G7 > 90)
const { data } = trpc.spokes.list.useQuery({
  hubId: 'hub-123',
  g7Min: 90,
  status: 'pending'
});
```

---

### `spokes.get`

Get a single spoke with quality scores and feedback.

| Type | Query |
|------|-------|
| **Input** | `{ spokeId: string }` |
| **Output** | `{ spoke: Spoke, scores: QualityScores, feedback: FeedbackEntry[] }` |

---

### `spokes.approve`

Approve a single spoke.

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeId: string }` |
| **Output** | `{ success: boolean }` |

---

### `spokes.reject`

Reject a spoke (removes from queue).

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeId: string, reason?: string }` |
| **Output** | `{ success: boolean }` |

---

### `spokes.edit`

Edit spoke content (marks as mutated for Kill Chain survival).

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeId: string, content: string }` |
| **Output** | `{ success: boolean, editDistance: number }` |

**Side Effects:**
- Sets `is_mutated = 1`
- Creates entry in `mutation_registry`
- Updates Drift Metric calculation

---

### `spokes.clone`

Clone a high-performing spoke to generate variations.

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeId: string, count?: number }` |
| **Output** | `{ newSpokeIds: string[], status: 'processing' }` |

**Default:** 5 variations

---

## Review Router

**Prefix:** `review.*`

### `review.getQueue`

Get the bulk approval queue.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, filter?: 'all' | 'top10' | 'flagged', limit?: number }` |
| **Output** | `{ items: ReviewItem[], totalCount: number, estimatedReviewTime: string }` |

```typescript
// G7 Filter: Top 10% performers
const { data } = trpc.review.getQueue.useQuery({
  clientId: 'client-123',
  filter: 'top10',
  limit: 50
});
```

**ReviewItem Shape:**
```typescript
interface ReviewItem {
  spoke: Spoke;
  hub: { id: string; title: string };
  pillar: { id: string; angle: string };
  scores: QualityScores;
  visualAsset?: ContentAsset;
}
```

---

### `review.bulkApprove`

Approve multiple spokes at once.

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeIds: string[] }` |
| **Output** | `{ approved: number }` |

---

### `review.bulkReject`

Reject multiple spokes.

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeIds: string[], reason?: string }` |
| **Output** | `{ rejected: number }` |

---

### `review.killHub`

Kill entire Hub from review queue (cascade).

| Type | Mutation |
|------|----------|
| **Input** | `{ hubId: string, reason?: string }` |
| **Output** | `{ killed: number, survived: number }` |

---

### `review.swipeAction`

Single swipe action (optimized for mobile).

| Type | Mutation |
|------|----------|
| **Input** | `{ spokeId: string, action: 'approve' | 'reject' | 'skip' }` |
| **Output** | `{ success: boolean, nextSpoke?: ReviewItem }` |

**Pre-fetching:** Returns next spoke for seamless UX.

---

## Clients Router

**Prefix:** `clients.*`

### `clients.list`

List all clients for an account.

| Type | Query |
|------|-------|
| **Input** | `{ status?: 'active' | 'paused' | 'archived' }` |
| **Output** | `{ items: Client[], usage: { hubsThisMonth: number, limit: number } }` |

---

### `clients.create`

Create a new client (provisions Durable Object).

| Type | Mutation |
|------|----------|
| **Input** | `{ name: string }` |
| **Output** | `{ clientId: string, durableObjectId: string }` |

**Side Effects:**
- Creates client record in D1
- Provisions Durable Object with SQLite schema
- Creates Vectorize namespace
- Creates R2 path prefix

---

### `clients.switch`

Switch active client context.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string }` |
| **Output** | `{ success: boolean, hydrationTime: number }` |

**Target:** < 100ms hydration time

---

### `clients.getDNAReport`

Get Brand DNA Report for a client.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string }` |
| **Output** | `BrandDNAReport` |

```typescript
interface BrandDNAReport {
  strengthScore: number;
  toneProfile: Record<string, number>;
  voiceMarkers: VoiceMarker[];
  bannedWords: BannedWord[];
  stances: BrandStance[];
  signaturePatterns: string[];
  lastCalibration: Date;
}
```

---

## Calibration Router

**Prefix:** `calibration.*`

### `calibration.uploadContent`

Upload existing content for Brand DNA analysis.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, content: string[], contentType: 'posts' | 'articles' | 'transcripts' }` |
| **Output** | `{ analysisId: string, status: 'processing' }` |

---

### `calibration.recordVoice`

Submit voice note for calibration.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, audioBlob: Blob }` |
| **Output** | `{ calibrationId: string, transcript: string, entitiesExtracted: ExtractedEntities, dnaScoreBefore: number, dnaScoreAfter: number }` |

**Voice-to-Grounding Pipeline:**
1. Store audio in R2 (temporary)
2. Transcribe with Whisper
3. Extract entities (banned words, voice markers, stances)
4. Update SQLite tables
5. Refresh Vectorize embeddings
6. Re-evaluate pending spokes

---

### `calibration.addBannedWord`

Manually add a banned word.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, word: string, reason?: string, severity?: 'hard' | 'soft' }` |
| **Output** | `{ success: boolean }` |

---

### `calibration.addVoiceMarker`

Manually add a required phrase.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, phrase: string, category?: 'signature' | 'tone' | 'structure' }` |
| **Output** | `{ success: boolean }` |

---

### `calibration.getDriftStatus`

Get current drift status and calibration recommendation.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string }` |
| **Output** | `{ driftScore: number, needsCalibration: boolean, trigger?: string, suggestion?: string }` |

---

## Analytics Router

**Prefix:** `analytics.*`

### `analytics.getZeroEditRate`

Get Zero-Edit Rate metrics.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, periodDays?: number }` |
| **Output** | `{ rate: number, total: number, withoutEdit: number, trend: 'up' | 'down' | 'stable' }` |

---

### `analytics.getCriticPassRate`

Get quality gate pass rates.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, periodDays?: number }` |
| **Output** | `{ g2: number, g4: number, g5: number, g6: number, g7: number, overall: number }` |

---

### `analytics.getReviewVelocity`

Get review speed metrics.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, periodDays?: number }` |
| **Output** | `{ avgTimePerDecision: number, bulkApproveRate: number, killChainUsage: number }` |

---

### `analytics.getSelfHealingEfficiency`

Get self-healing loop metrics.

| Type | Query |
|------|-------|
| **Input** | `{ clientId: string, periodDays?: number }` |
| **Output** | `{ avgLoops: number, successRate: number, topFailureReasons: { gate: string, count: number }[] }` |

---

## Exports Router

**Prefix:** `exports.*`

### `exports.create`

Create a content export.

| Type | Mutation |
|------|----------|
| **Input** | `{ clientId: string, hubIds?: string[], platforms?: Platform[], format: 'csv' | 'json', includeVisuals?: boolean }` |
| **Output** | `{ exportId: string, status: 'processing' }` |

---

### `exports.getDownloadUrl`

Get signed download URL for completed export.

| Type | Query |
|------|-------|
| **Input** | `{ exportId: string }` |
| **Output** | `{ url: string, expiresAt: Date }` |

---

## Cloudflare Workflows

### HubIngestionWorkflow

Processes uploaded source material into structured Hub.

**Binding:** `HUB_INGESTION_WORKFLOW`

**Params:**
```typescript
interface HubIngestionParams {
  hubId: string;
  clientId: string;
  sourceType: 'pdf' | 'url' | 'transcript' | 'text';
  sourceR2Key: string;
}
```

**Phases:**
1. **Extract Content** — Parse PDF/URL/text
2. **Identify Themes** — AI extraction of key themes
3. **Extract Claims** — Core claims and angles
4. **Create Pillars** — Generate psychological angles
5. **Save Hub** — Store in Durable Object

**Duration:** < 30 seconds

---

### SpokeGenerationWorkflow

Generates platform-specific spokes from Hub.

**Binding:** `SPOKE_GENERATION_WORKFLOW`

**Params:**
```typescript
interface SpokeGenerationParams {
  hubId: string;
  clientId: string;
  platforms: Platform[];
  pillarIds?: string[];  // Optional: generate for specific pillars
}
```

**Phases:**
1. **Load Context** — Hub, Brand DNA, past failures
2. **Generate Spokes** — Parallel by pillar (Creator Agent)
3. **Quality Gate** — Evaluate all (Critic Agent)
4. **Self-Healing** — Regenerate failures (max 3 attempts)
5. **Save Results** — Store in Durable Object
6. **Notify** — WebSocket broadcast

**Duration:** < 60 seconds for 25 spokes

---

### CalibrationWorkflow

Processes voice note or content upload for Brand DNA calibration.

**Binding:** `CALIBRATION_WORKFLOW`

**Params:**
```typescript
interface CalibrationParams {
  clientId: string;
  inputType: 'voice' | 'content';
  inputR2Key?: string;  // For voice
  content?: string[];   // For content upload
}
```

**Phases:**
1. **Transcribe** (voice) — Whisper transcription
2. **Extract Entities** — AI entity extraction
3. **Update Brand DNA** — SQLite updates
4. **Refresh Vectorize** — New embeddings
5. **Re-evaluate** — Check pending spokes
6. **Calculate Score** — New DNA strength

**Duration:** < 2 minutes

---

## WebSocket Events

### Production Queue Events

Connect to Durable Object WebSocket for real-time updates:

```typescript
const ws = new WebSocket(`wss://api.example.com/ws/${clientId}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'GENERATION_STARTED':
      // { hubId, platforms, estimatedTime }
      break;
    case 'GENERATION_PROGRESS':
      // { hubId, phase, progress, currentPillar }
      break;
    case 'GENERATION_COMPLETE':
      // { hubId, spokeCount, failedCount }
      break;
    case 'CALIBRATION_COMPLETE':
      // { dnaScoreBefore, dnaScoreAfter, entitiesExtracted }
      break;
    case 'DRIFT_ALERT':
      // { driftScore, trigger, suggestion }
      break;
    case 'CREATIVE_CONFLICT':
      // { spokeId, gate, reason }
      break;
  }
};
```

---

## Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `UNAUTHORIZED` | Missing or invalid session | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource doesn't exist | 404 |
| `QUOTA_EXCEEDED` | Hub limit reached | 402 |
| `PROCESSING` | Resource still processing | 409 |
| `VALIDATION_ERROR` | Invalid input | 400 |
| `INTERNAL_ERROR` | Server error | 500 |

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Read operations | 1000/min | Per account |
| Write operations | 100/min | Per account |
| Hub creation | 10/min | Per account |
| Bulk operations | 50/min | Per account |
| Voice calibration | 10/hour | Per client |

---

## Related Documentation

- [Architecture](./architecture.md) — System overview
- [Data Model](./data-model.md) — Database schemas
- [Agent System](./agent-system.md) — Creator/Critic architecture
- [Quality Gates](./quality-gates.md) — G2/G4/G5/G6/G7 specifications
