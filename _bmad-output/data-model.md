# Data Model - The Agentic Content Foundry

> Database schema for multi-tenant content production with Brand DNA isolation

## Overview

The Foundry uses a **hybrid database architecture**:

1. **D1 (Global)** — Shared metadata: users, billing, Hub IDs (no client content)
2. **Durable Object SQLite (Per-Client)** — Isolated Brand DNA, content, feedback
3. **Vectorize (Per-Client Namespace)** — Brand embeddings, research vectors
4. **R2 (Per-Client Path)** — Media assets, exports, voice recordings

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                              D1 (GLOBAL)                                     ││
│  │                                                                              ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ││
│  │  │   accounts  │  │    users    │  │subscriptions│  │    hub_registry     │  ││
│  │  │             │  │             │  │             │  │   (IDs only)        │  ││
│  │  │ • id        │  │ • id        │  │ • id        │  │ • id                │  ││
│  │  │ • name      │  │ • email     │  │ • tier      │  │ • account_id        │  ││
│  │  │ • type      │  │ • role      │  │ • status    │  │ • client_id         │  ││
│  │  │ • created   │  │ • account_id│  │ • stripe_id │  │ • created_at        │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  │                                                                              ││
│  │  NO CLIENT CONTENT — Only references to Durable Objects                      ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    DURABLE OBJECT SQLite (PER-CLIENT)                        ││
│  │                                                                              ││
│  │  Each client gets isolated SQLite with full schema:                          ││
│  │                                                                              ││
│  │  Brand DNA:        │  Content:           │  Quality:                         ││
│  │  • brand_dna       │  • hubs             │  • quality_scores                 ││
│  │  • voice_markers   │  • pillars          │  • feedback_log                   ││
│  │  • banned_words    │  • spokes           │  • mutation_registry              ││
│  │  • brand_stances   │  • content_assets   │  • rubric_overrides               ││
│  │  • personas        │                     │                                    ││
│  │                                                                              ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## D1 Global Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────────┐
│    accounts     │──────►│     users       │       │   subscriptions     │
│─────────────────│  1:N  │─────────────────│       │─────────────────────│
│ id              │       │ id              │       │ id                  │
│ name            │◄──────│ account_id      │       │ account_id          │
│ type            │       │ email           │       │ stripe_customer_id  │
│ owner_id        │       │ name            │       │ stripe_sub_id       │
│ created_at      │       │ role            │       │ tier                │
│ updated_at      │       │ created_at      │       │ status              │
└────────┬────────┘       └─────────────────┘       │ hubs_limit          │
         │                                          │ current_period_end  │
         │ 1:N                                      └─────────────────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────────┐
│    clients      │       │    hub_registry     │
│─────────────────│       │─────────────────────│
│ id              │──────►│ id                  │
│ account_id      │  1:N  │ client_id           │
│ name            │       │ source_type         │
│ durable_object_ │       │ status              │
│   id            │       │ created_at          │
│ created_at      │       │ completed_at        │
│ status          │       │ spoke_count         │
└─────────────────┘       └─────────────────────┘
```

### `accounts`

Agency or individual account (billing entity).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `name` | TEXT NOT NULL | Account display name |
| `type` | TEXT NOT NULL | `individual` \| `agency` |
| `owner_id` | TEXT FK | → users.id (account owner) |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

### `users`

Individual users within accounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `account_id` | TEXT FK | → accounts.id |
| `email` | TEXT NOT NULL UNIQUE | Email address |
| `name` | TEXT | Display name |
| `role` | TEXT NOT NULL | `owner` \| `admin` \| `manager` \| `creator` \| `viewer` |
| `created_at` | INTEGER | Unix timestamp |
| `last_login_at` | INTEGER | Unix timestamp |

### `clients`

Client entities for agencies (each gets a Durable Object).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `account_id` | TEXT FK | → accounts.id |
| `name` | TEXT NOT NULL | Client name |
| `durable_object_id` | TEXT NOT NULL | Durable Object ID for isolation |
| `vectorize_namespace` | TEXT NOT NULL | Vectorize namespace prefix |
| `r2_prefix` | TEXT NOT NULL | R2 storage path prefix |
| `status` | TEXT | `active` \| `paused` \| `archived` |
| `created_at` | INTEGER | Unix timestamp |

### `subscriptions`

Stripe subscription tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `account_id` | TEXT FK | → accounts.id |
| `stripe_customer_id` | TEXT NOT NULL | Stripe customer ID |
| `stripe_subscription_id` | TEXT | Stripe subscription ID |
| `tier` | TEXT NOT NULL | `creator` \| `pro` \| `agency` \| `enterprise` |
| `status` | TEXT NOT NULL | `active` \| `past_due` \| `canceled` |
| `hubs_limit` | INTEGER | Monthly Hub limit |
| `clients_limit` | INTEGER | Max clients |
| `current_period_start` | INTEGER | Unix timestamp |
| `current_period_end` | INTEGER | Unix timestamp |

### `hub_registry`

Global Hub ID registry (content stored in Durable Object).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `client_id` | TEXT FK | → clients.id |
| `source_type` | TEXT NOT NULL | `pdf` \| `url` \| `transcript` \| `text` |
| `status` | TEXT NOT NULL | `processing` \| `ready` \| `archived` |
| `spoke_count` | INTEGER DEFAULT 0 | Number of generated spokes |
| `created_at` | INTEGER | Unix timestamp |
| `completed_at` | INTEGER | Unix timestamp |

### `usage_events`

Usage tracking for billing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `account_id` | TEXT FK | → accounts.id |
| `client_id` | TEXT FK | → clients.id |
| `event_type` | TEXT NOT NULL | `hub_created` \| `spoke_generated` \| `voice_calibration` |
| `quantity` | INTEGER DEFAULT 1 | Event count |
| `created_at` | INTEGER | Unix timestamp |

---

## Durable Object SQLite Schema (Per-Client)

Each client's Durable Object contains a complete SQLite database with isolated Brand DNA and content.

### Brand DNA Tables

#### `brand_dna`

Core brand identity configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | Always 'primary' (singleton) |
| `strength_score` | REAL | Brand DNA strength (0-100) |
| `tone_profile` | TEXT (JSON) | `{candid: 92, contrarian: 85, ...}` |
| `signature_patterns` | TEXT (JSON) | Detected phrase patterns |
| `last_calibration_at` | INTEGER | Unix timestamp |
| `calibration_source` | TEXT | `content_upload` \| `voice_note` \| `manual` |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

#### `voice_markers`

Required phrases and voice patterns.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `phrase` | TEXT NOT NULL | Required phrase or pattern |
| `category` | TEXT | `signature` \| `tone` \| `structure` |
| `weight` | REAL DEFAULT 1.0 | Importance weight |
| `source` | TEXT | `detected` \| `manual` \| `voice` |
| `created_at` | INTEGER | Unix timestamp |

#### `banned_words`

Words and phrases to avoid.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `word` | TEXT NOT NULL | Banned word or phrase |
| `reason` | TEXT | Why banned |
| `severity` | TEXT | `hard` (auto-reject) \| `soft` (flag) |
| `source` | TEXT | `detected` \| `manual` \| `voice` |
| `created_at` | INTEGER | Unix timestamp |

#### `brand_stances`

Brand positioning and attitudes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `stance` | TEXT NOT NULL | Brand stance description |
| `category` | TEXT | `contrarian` \| `authority` \| `challenger` \| `mentor` |
| `keywords` | TEXT (JSON) | Related keywords array |
| `source` | TEXT | `detected` \| `manual` \| `voice` |
| `created_at` | INTEGER | Unix timestamp |

#### `personas`

Brand voice personas.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `name` | TEXT NOT NULL | Persona name |
| `description` | TEXT | Persona description |
| `attributes` | TEXT (JSON) | `{formality: 0.3, humor: 0.7, ...}` |
| `is_primary` | INTEGER DEFAULT 0 | Primary persona flag |
| `created_at` | INTEGER | Unix timestamp |

### Content Tables

#### `hubs`

Source of Truth content containers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `registry_id` | TEXT NOT NULL | → D1 hub_registry.id |
| `title` | TEXT | Extracted/assigned title |
| `source_content` | TEXT | Original source text |
| `source_r2_key` | TEXT | R2 key for uploaded file |
| `themes` | TEXT (JSON) | Extracted themes array |
| `claims` | TEXT (JSON) | Core claims array |
| `status` | TEXT NOT NULL | `processing` \| `ready` \| `killed` |
| `killed_at` | INTEGER | Kill timestamp |
| `kill_reason` | TEXT | Reason for kill |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

#### `pillars`

Psychological angles/themes within a Hub.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `hub_id` | TEXT FK | → hubs.id |
| `title` | TEXT NOT NULL | Pillar title |
| `angle` | TEXT NOT NULL | Psychological angle |
| `key_points` | TEXT (JSON) | Main points array |
| `order_index` | INTEGER | Display order |
| `status` | TEXT | `active` \| `killed` |
| `created_at` | INTEGER | Unix timestamp |

#### `spokes`

Platform-specific content pieces.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `hub_id` | TEXT FK | → hubs.id |
| `pillar_id` | TEXT FK | → pillars.id |
| `platform` | TEXT NOT NULL | `twitter` \| `linkedin` \| `tiktok` \| `instagram` \| `carousel` \| `thread` |
| `content_type` | TEXT NOT NULL | `post` \| `script` \| `carousel` \| `thread` \| `thumbnail` |
| `content` | TEXT NOT NULL | Generated content |
| `content_json` | TEXT (JSON) | Structured content (carousels, threads) |
| `character_count` | INTEGER | Content length |
| `status` | TEXT NOT NULL | `pending` \| `approved` \| `rejected` \| `killed` |
| `is_mutated` | INTEGER DEFAULT 0 | Manually edited (survives kill chain) |
| `approved_at` | INTEGER | Approval timestamp |
| `approved_by` | TEXT | User ID who approved |
| `created_at` | INTEGER | Unix timestamp |
| `updated_at` | INTEGER | Unix timestamp |

#### `content_assets`

Generated images and thumbnails.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `spoke_id` | TEXT FK | → spokes.id |
| `asset_type` | TEXT NOT NULL | `thumbnail` \| `carousel_slide` \| `quote_card` |
| `r2_key` | TEXT NOT NULL | R2 storage key |
| `visual_archetype` | TEXT | Archetype used for generation |
| `alt_text` | TEXT | Accessibility description |
| `created_at` | INTEGER | Unix timestamp |

### Quality Tables

#### `quality_scores`

Quality gate scores for each spoke.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `spoke_id` | TEXT FK | → spokes.id |
| `g2_hook_strength` | REAL | Hook strength score (0-100) |
| `g4_voice_alignment` | INTEGER | Pass (1) / Fail (0) |
| `g5_platform_compliance` | INTEGER | Pass (1) / Fail (0) |
| `g6_visual_metaphor` | REAL | Visual quality (0-100) |
| `g7_engagement_prediction` | REAL | Predicted engagement (0-100) |
| `g_compliance_status` | TEXT | `pass` \| `fail` \| `flagged` \| `n/a` |
| `overall_pass` | INTEGER | All gates passed |
| `evaluated_at` | INTEGER | Unix timestamp |

#### `feedback_log`

Critic rejection reasons for self-healing loop.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `spoke_id` | TEXT FK | → spokes.id |
| `gate` | TEXT NOT NULL | `g2` \| `g4` \| `g5` \| `g6` \| `g7` \| `g_compliance` |
| `score` | REAL | Score that triggered failure |
| `reason` | TEXT NOT NULL | Detailed rejection reason |
| `suggestion` | TEXT | Improvement suggestion |
| `attempt_number` | INTEGER | Regeneration attempt (1-3) |
| `resolved` | INTEGER DEFAULT 0 | Issue resolved |
| `created_at` | INTEGER | Unix timestamp |

#### `mutation_registry`

Tracks manual edits for Drift Metric.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `spoke_id` | TEXT FK | → spokes.id |
| `original_content` | TEXT NOT NULL | Content before edit |
| `edited_content` | TEXT NOT NULL | Content after edit |
| `edit_distance` | REAL | Levenshtein distance ratio |
| `editor_user_id` | TEXT | Who made the edit |
| `created_at` | INTEGER | Unix timestamp |

#### `rubric_overrides`

Client-specific quality gate adjustments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `gate` | TEXT NOT NULL | `g2` \| `g4` \| `g5` \| `g6` \| `g7` |
| `threshold` | REAL | Custom threshold |
| `reason` | TEXT | Why override exists |
| `created_at` | INTEGER | Unix timestamp |

### Workflow Tables

#### `generation_queue`

Pending Hub→Spoke workflows.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `hub_id` | TEXT FK | → hubs.id |
| `workflow_id` | TEXT | Cloudflare Workflow instance ID |
| `status` | TEXT NOT NULL | `queued` \| `processing` \| `complete` \| `failed` |
| `current_phase` | TEXT | Current generation phase |
| `progress_percent` | INTEGER | 0-100 progress |
| `error_message` | TEXT | Error if failed |
| `started_at` | INTEGER | Unix timestamp |
| `completed_at` | INTEGER | Unix timestamp |

#### `calibration_events`

Voice-to-Grounding calibration history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `trigger_type` | TEXT NOT NULL | `manual` \| `drift_alert` \| `zero_edit_drop` |
| `input_type` | TEXT NOT NULL | `voice` \| `text` |
| `input_r2_key` | TEXT | R2 key for voice recording |
| `transcript` | TEXT | Transcribed content |
| `entities_extracted` | TEXT (JSON) | Extracted entities |
| `dna_score_before` | REAL | Brand DNA score before |
| `dna_score_after` | REAL | Brand DNA score after |
| `created_at` | INTEGER | Unix timestamp |

---

## Analytics Tables (Durable Object SQLite)

#### `zero_edit_tracking`

Zero-Edit Rate calculation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `period_start` | INTEGER | Period start timestamp |
| `period_end` | INTEGER | Period end timestamp |
| `total_approved` | INTEGER | Total approved spokes |
| `approved_without_edit` | INTEGER | Approved without changes |
| `zero_edit_rate` | REAL | Calculated rate |
| `created_at` | INTEGER | Unix timestamp |

#### `review_velocity`

Review speed metrics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `session_id` | TEXT | Review session ID |
| `decisions_count` | INTEGER | Number of decisions |
| `total_time_ms` | INTEGER | Total session time |
| `avg_time_per_decision_ms` | INTEGER | Average per decision |
| `bulk_approve_count` | INTEGER | Bulk approvals used |
| `kill_chain_count` | INTEGER | Kill chains triggered |
| `created_at` | INTEGER | Unix timestamp |

---

## Vectorize Namespaces

### Per-Client Namespace: `client:{client_id}/`

| Index | Content | Dimensions |
|-------|---------|------------|
| `brand_voice` | Voice marker embeddings | 768 |
| `content_samples` | Approved content for similarity | 768 |
| `research` | Research material embeddings | 768 |

### Shared Namespace: `hooks/`

| Index | Content | Dimensions |
|-------|---------|------------|
| `top_performers` | 10,000+ top-performing hooks | 768 |
| `platform_specific` | Platform-specific hook patterns | 768 |

---

## R2 Storage Structure

```
/assets/
├── {client_id}/
│   ├── sources/
│   │   ├── {hub_id}/
│   │   │   ├── original.pdf
│   │   │   └── processed.json
│   ├── images/
│   │   ├── {spoke_id}/
│   │   │   ├── thumbnail.png
│   │   │   └── slide_{n}.png
│   ├── voice/
│   │   ├── {calibration_id}.webm
│   │   └── {calibration_id}.json  # transcript
│   └── exports/
│       ├── {export_id}.csv
│       └── {export_id}.json
```

---

## Query Patterns

### Get Full Hub with Spokes

```typescript
// Durable Object SQLite query
async function getHubWithSpokes(hubId: string) {
  const hub = await this.sql.exec`
    SELECT * FROM hubs WHERE id = ${hubId}
  `.one();

  const pillars = await this.sql.exec`
    SELECT * FROM pillars
    WHERE hub_id = ${hubId}
    ORDER BY order_index
  `.all();

  const spokes = await this.sql.exec`
    SELECT s.*, q.g2_hook_strength, q.g7_engagement_prediction
    FROM spokes s
    LEFT JOIN quality_scores q ON q.spoke_id = s.id
    WHERE s.hub_id = ${hubId}
    ORDER BY s.pillar_id, s.platform
  `.all();

  return { hub, pillars, spokes };
}
```

### Calculate Zero-Edit Rate

```typescript
async function calculateZeroEditRate(periodDays: number = 7) {
  const periodStart = Date.now() - (periodDays * 24 * 60 * 60 * 1000);

  const result = await this.sql.exec`
    SELECT
      COUNT(*) as total_approved,
      SUM(CASE WHEN is_mutated = 0 THEN 1 ELSE 0 END) as without_edit
    FROM spokes
    WHERE status = 'approved'
      AND approved_at >= ${periodStart}
  `.one();

  return {
    zeroEditRate: result.without_edit / result.total_approved,
    total: result.total_approved,
    withoutEdit: result.without_edit
  };
}
```

### Kill Chain Cascade

```typescript
async function killHub(hubId: string, reason: string) {
  await this.sql.exec`BEGIN TRANSACTION`;

  try {
    // Kill all non-mutated spokes
    await this.sql.exec`
      UPDATE spokes
      SET status = 'killed'
      WHERE hub_id = ${hubId}
        AND is_mutated = 0
    `;

    // Promote mutated spokes to "manual asset"
    await this.sql.exec`
      UPDATE spokes
      SET hub_id = NULL
      WHERE hub_id = ${hubId}
        AND is_mutated = 1
    `;

    // Kill pillars
    await this.sql.exec`
      UPDATE pillars
      SET status = 'killed'
      WHERE hub_id = ${hubId}
    `;

    // Kill hub
    await this.sql.exec`
      UPDATE hubs
      SET status = 'killed',
          killed_at = ${Date.now()},
          kill_reason = ${reason}
      WHERE id = ${hubId}
    `;

    await this.sql.exec`COMMIT`;
  } catch (e) {
    await this.sql.exec`ROLLBACK`;
    throw e;
  }
}
```

### Brand DNA Calibration Update

```typescript
async function updateBrandDNA(calibrationResult: CalibrationResult) {
  // Add new voice markers
  for (const marker of calibrationResult.newMarkers) {
    await this.sql.exec`
      INSERT INTO voice_markers (id, phrase, category, source, created_at)
      VALUES (${crypto.randomUUID()}, ${marker.phrase}, ${marker.category}, 'voice', ${Date.now()})
    `;
  }

  // Add banned words
  for (const word of calibrationResult.bannedWords) {
    await this.sql.exec`
      INSERT INTO banned_words (id, word, reason, severity, source, created_at)
      VALUES (${crypto.randomUUID()}, ${word.word}, ${word.reason}, 'soft', 'voice', ${Date.now()})
    `;
  }

  // Update brand DNA strength
  await this.sql.exec`
    UPDATE brand_dna
    SET strength_score = ${calibrationResult.newScore},
        last_calibration_at = ${Date.now()},
        calibration_source = 'voice_note',
        updated_at = ${Date.now()}
    WHERE id = 'primary'
  `;
}
```

---

## Migration Strategy

### Initial Setup

```bash
# Generate D1 migrations
pnpm --filter @repo/foundry-core drizzle-kit generate

# Apply to D1
wrangler d1 migrations apply FOUNDRY_DB --local
wrangler d1 migrations apply FOUNDRY_DB --remote

# Durable Object SQLite schema applied via code
# in ClientAgent.ts constructor
```

### Schema Evolution

Durable Object SQLite migrations are handled in code:

```typescript
class ClientAgent extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.initializeSchema();
  }

  private async initializeSchema() {
    const version = await this.getSchemaVersion();

    if (version < 1) {
      await this.sql.exec`
        CREATE TABLE IF NOT EXISTS brand_dna (...)
      `;
      await this.setSchemaVersion(1);
    }

    if (version < 2) {
      await this.sql.exec`
        ALTER TABLE spokes ADD COLUMN is_mutated INTEGER DEFAULT 0
      `;
      await this.setSchemaVersion(2);
    }
    // Continue for each migration
  }
}
```

---

## Related Documentation

- [Architecture](./architecture.md) — System overview
- [Agent System](./agent-system.md) — Creator/Critic architecture
- [Quality Gates](./quality-gates.md) — G2/G4/G5/G6/G7 specifications
- [API Reference](./api-reference.md) — tRPC procedures
