# Data Model Reference

> Database schema and relationships for the Market Research SaaS Platform

## Overview

The data model is built on **Drizzle ORM** with **Cloudflare D1** (SQLite). All schemas are defined in `packages/data-ops/src/schema.ts`.

## Entity Relationship Diagram

```
┌─────────────────┐
│    accounts     │ (Better Auth)
│─────────────────│
│ id              │
│ userId          │
│ ...             │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────────┐
│    projects     │──────►│    workflowRuns     │
│─────────────────│  1:N  │─────────────────────│
│ id              │       │ workflowType        │
│ accountId       │       │ status              │
│ name            │       │ currentStep         │
│ industry        │       └─────────────────────┘
│ status          │
└────────┬────────┘
         │
         │ 1:1
    ┌────┴────────────────────────────────────┐
    │                    │                     │
    ▼                    ▼                     ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────────┐
│ haloAnalysis  │  │ dreamBuyerAvatar│  │  godfatherOffer  │
│───────────────│  │─────────────────│  │──────────────────│
│ hopes/dreams  │  │ demographics    │  │ valueBuild       │
│ pains/fears   │  │ psychographics  │  │ pricingTiers     │
│ barriers      │  │ dayInTheLife    │  │ powerGuarantee   │
│ vernacular    │  │ buyingBehavior  │  │ scarcity         │
└───────────────┘  └─────────────────┘  └──────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐          ┌─────────────────────┐
│  researchSources    │          │     hvcoTitles      │
│─────────────────────│          │─────────────────────│
│ sourceType          │          │ title               │
│ rawContent          │          │ formula             │
│ sophisticationClass │          │ criticScore         │
│ reviewRating        │          │ isWinner            │
└─────────┬───────────┘          └─────────────────────┘
          │ 1:N
          ▼
┌─────────────────────┐
│   vectorMetadata    │
│─────────────────────│
│ vectorId            │
│ contentType         │
│ emotionalTrigger    │
└─────────────────────┘

┌─────────────────┐       ┌─────────────────────────┐
│   competitors   │──────►│   competitorOfferMap    │
│─────────────────│  1:1  │─────────────────────────│
│ name            │       │ hvco                    │
│ websiteUrl      │       │ guarantee               │
│ adLibraryUrl    │       │ strengths/weaknesses    │
│ entryProductUrl │       └─────────────────────────┘
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────────────┐
│  goldenPheasantUploads  │
│─────────────────────────│
│ uploadType              │
│ r2Key                   │
│ extractedContent        │
└─────────────────────────┘
```

---

## Core Tables

### `projects`

Central entity representing a research project.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID primary key |
| `accountId` | TEXT NOT NULL | Foreign key to Better Auth account |
| `name` | TEXT NOT NULL | Project display name |
| `industry` | TEXT NOT NULL | Target industry/niche |
| `targetMarket` | TEXT (JSON) | Demographics, psychographics |
| `valueProposition` | TEXT | Core value proposition |
| `status` | TEXT | `research` → `competitor` → `offer` → `complete` |
| `createdAt` | TIMESTAMP | Auto-set on creation |
| `updatedAt` | TIMESTAMP | Auto-set on update |

**Status Flow:**
```
research ──► competitor ──► offer ──► complete
    │            │           │
    └────────────┴───────────┴──► (any phase can loop back)
```

---

### `researchSources`

Raw research data collected from web scraping and searches.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `sourceType` | TEXT NOT NULL | `reddit` \| `quora` \| `amazon` \| `facebook_ads` \| `manual` |
| `sourceUrl` | TEXT | Original URL |
| `rawContent` | TEXT | Original scraped text |
| `processedContent` | TEXT | Cleaned/filtered content |
| `sophisticationClass` | TEXT | `A` (high) \| `B` (medium) \| `C` (low) |
| `sophisticationScore` | REAL | 0.0 - 1.0 numeric score |
| `reviewRating` | REAL | For Amazon reviews (1-5 stars) |
| `whatWasMissing` | TEXT | "Golden Gap" from 3-star reviews |
| `reviewTitle` | TEXT | Amazon review title |
| `status` | TEXT | `pending` → `processing` → `complete` \| `failed` |
| `metadata` | TEXT (JSON) | Source-specific data (subreddit, etc.) |
| `isExcluded` | BOOLEAN | Manual exclusion flag |

**Sophistication Classes:**
- **Class A**: High awareness - knows solutions exist, evaluating options
- **Class B**: Medium awareness - aware of problem, seeking solutions
- **Class C**: Low awareness - unaware of problem or early stage

---

### `haloAnalysis`

HALO framework analysis output (Hopes, Afflictions, Limitations, Observations).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id (1:1) |
| `hopesAndDreams` | TEXT (JSON) | Array of aspirations |
| `painsAndFears` | TEXT (JSON) | Array of pain points |
| `barriersAndUncertainties` | TEXT (JSON) | Array of obstacles |
| `vernacular` | TEXT (JSON) | Market-specific terminology glossary |
| `unexpectedInsights` | TEXT (JSON) | Array of surprising findings |
| `primalDesires` | TEXT (JSON) | Core emotional drivers |

**JSON Structure Example:**
```json
{
  "hopesAndDreams": [
    {
      "desire": "Financial freedom to quit day job",
      "frequency": 47,
      "emotionalIntensity": "high",
      "verbatimQuotes": ["I just want to...", "..."]
    }
  ]
}
```

---

### `dreamBuyerAvatar`

9-dimensional buyer persona synthesis.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id (1:1) |
| `demographics` | TEXT (JSON) | Age, gender, location, income, education |
| `psychographics` | TEXT (JSON) | Values, interests, lifestyle, personality |
| `dayInTheLife` | TEXT (JSON) | Hour-by-hour timeline |
| `competitorGapsTheyFeel` | TEXT (JSON) | What they hate about current solutions |
| `mediaConsumption` | TEXT (JSON) | Platforms, influencers, publications |
| `buyingBehavior` | TEXT (JSON) | Triggers, objections, decision process |
| `summaryParagraph` | TEXT | Narrative avatar summary |

**Day-in-the-Life JSON:**
```json
{
  "dayInTheLife": {
    "wakeTime": "6:30 AM",
    "morningRoutine": "Check email, scroll social...",
    "workHours": "9-5 corporate job, feels trapped",
    "eveningRoutine": "Side hustle after kids sleep",
    "bedTime": "11:30 PM",
    "painMoments": ["3 PM slump when boss micromanages"]
  }
}
```

---

### `competitors`

Competitor tracking (Golden Pheasant methodology).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `name` | TEXT NOT NULL | Competitor name |
| `websiteUrl` | TEXT | Main website |
| `adLibraryUrl` | TEXT | Facebook Ad Library URL |
| `yearsAdvertising` | INTEGER | Years running ads |
| `entryProductUrl` | TEXT | Front-end offer URL |
| `entryProductPrice` | REAL | Entry price point |
| `phoneNumber` | TEXT | Sales contact |
| `status` | TEXT | `identified` → `researching` → `purchased` → `analyzed` |

---

### `competitorOfferMap`

Detailed offer breakdown for each competitor.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `competitorId` | TEXT FK | → competitors.id (1:1) |
| `hvco` | TEXT | Their high-value content offer |
| `primaryCta` | TEXT | Main call-to-action |
| `guarantee` | TEXT | Risk reversal offer |
| `scarcity` | TEXT | Urgency/scarcity mechanism |
| `valueBuild` | TEXT | How they stack value |
| `bonuses` | TEXT (JSON) | Array of bonus items |
| `pricing` | TEXT (JSON) | `{entry, mid, deluxe}` tiers |
| `paymentPlan` | TEXT | Payment options offered |
| `strengths` | TEXT (JSON) | What they do well |
| `weaknesses` | TEXT (JSON) | Gaps to exploit |

---

### `godfatherOffer`

Generated irresistible offer (Godfather methodology).

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id (1:1) |
| `rationale` | TEXT | Strategic reasoning |
| `valueBuild` | TEXT (JSON) | Component stacking breakdown |
| `pricingTiers` | TEXT (JSON) | `{entry, mid, deluxe}` |
| `paymentOptions` | TEXT (JSON) | Payment plan array |
| `premiums` | TEXT (JSON) | Bonuses addressing barriers |
| `powerGuarantee` | TEXT | Risk reversal description |
| `guaranteeName` | TEXT | Branded guarantee name |
| `scarcity` | TEXT (JSON) | `{type, deadline, quantity}` |
| `offerParagraph` | TEXT | Condensed irresistible offer |

---

### `hvcoTitles`

High-Value Content Offer title generation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `title` | TEXT NOT NULL | Generated title |
| `formula` | TEXT | Template used (e.g., "How to X without Y") |
| `criticScore` | REAL | AI critic rating (0-10) |
| `criticFeedback` | TEXT | Improvement suggestions |
| `iteration` | INTEGER | Version number |
| `isWinner` | BOOLEAN | Selected as final title |

---

### `workflowRuns`

Cloudflare Workflow execution tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `workflowType` | TEXT NOT NULL | `halo_research` \| `competitor_analysis` \| `offer_generation` |
| `cloudflareWorkflowId` | TEXT | Cloudflare's instance ID |
| `status` | TEXT | `running` → `paused_hitl` → `complete` \| `failed` |
| `currentStep` | TEXT | Current phase name |
| `hitlRequest` | TEXT (JSON) | Human-in-the-loop action required |
| `errorMessage` | TEXT | Failure details |
| `startedAt` | TIMESTAMP | Workflow start time |
| `completedAt` | TIMESTAMP | Workflow end time |

---

### `vectorMetadata`

Cloudflare Vectorize embedding metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `vectorId` | TEXT NOT NULL | ID in Vectorize index |
| `sourceId` | TEXT FK | → researchSources.id |
| `contentType` | TEXT | `comment` \| `review` \| `forum_post` \| `ad_copy` |
| `sophisticationClass` | TEXT | `A` \| `B` \| `C` |
| `emotionalTrigger` | TEXT | `fear` \| `desire` \| `frustration` \| `hope` |

---

### `generatedContent`

Content generation data lineage tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PK | UUID |
| `projectId` | TEXT FK | → projects.id |
| `content` | TEXT NOT NULL | Generated content |
| `citedSourceId` | TEXT FK | → researchSources.id |
| `status` | TEXT | `DRAFT` \| `PUBLISHED` |

---

## Query Patterns

### Get Full Research (with all related data)

```typescript
// packages/data-ops/src/queries/market-research-v2.ts
export async function getMarketResearchV2(db: DrizzleD1Database, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      haloAnalysis: true,
      dreamBuyerAvatar: true,
      researchSources: true,
      workflowRuns: {
        orderBy: desc(workflowRuns.startedAt),
        limit: 1
      }
    }
  });
  return project;
}
```

### Create Project with Workflow

```typescript
export async function createProject(
  db: DrizzleD1Database,
  accountId: string,
  data: { name: string; industry: string }
) {
  const id = crypto.randomUUID();

  await db.insert(projects).values({
    id,
    accountId,
    name: data.name,
    industry: data.industry,
    status: 'research'
  });

  return id;
}
```

### Cascade Delete

```typescript
export async function deleteProject(db: DrizzleD1Database, projectId: string) {
  await db.transaction(async (tx) => {
    await tx.delete(researchSources).where(eq(researchSources.projectId, projectId));
    await tx.delete(haloAnalysis).where(eq(haloAnalysis.projectId, projectId));
    await tx.delete(dreamBuyerAvatar).where(eq(dreamBuyerAvatar.projectId, projectId));
    await tx.delete(competitors).where(eq(competitors.projectId, projectId));
    await tx.delete(workflowRuns).where(eq(workflowRuns.projectId, projectId));
    await tx.delete(projects).where(eq(projects.id, projectId));
  });
}
```

---

## Schema Migrations

Migrations are managed by Drizzle Kit:

```bash
# Generate migration from schema changes
pnpm --filter @repo/data-ops drizzle-kit generate

# Apply migrations (via wrangler d1 migrations)
wrangler d1 migrations apply DB --local
wrangler d1 migrations apply DB --remote
```

---

## JSON Field Schemas

Zod schemas for JSON fields are defined in `packages/data-ops/src/zod/`.

```typescript
// Example: halo-schema-v2.ts
export const HopeAndDreamSchema = z.object({
  desire: z.string(),
  frequency: z.number(),
  emotionalIntensity: z.enum(['low', 'medium', 'high']),
  verbatimQuotes: z.array(z.string())
});

export const HaloAnalysisSchema = z.object({
  hopesAndDreams: z.array(HopeAndDreamSchema),
  painsAndFears: z.array(PainAndFearSchema),
  barriersAndUncertainties: z.array(BarrierSchema),
  vernacular: VernacularSchema,
  unexpectedInsights: z.array(z.string()),
  primalDesires: z.array(z.string())
});
```
