# Story 4.1: Deterministic Spoke Fracturing

**Status:** done
**Story Points:** 8
**Sprint:** 3
**Epic:** 4 - Spoke Generation & Quality Assurance

## Story

As a **user**,
I want **each Pillar to automatically fracture into platform-specific spokes**,
So that **I get comprehensive content coverage from a single idea**.

## Acceptance Criteria

### AC1: Trigger Spoke Generation from Hub
**Given** a Hub with configured Pillars exists (from Story 3.4)
**When** I click "Generate Spokes" on the Hub detail page
**Then** the spoke generation workflow starts
**And** I see a "Generation in Progress" state with pillar-by-pillar progress

### AC2: Platform-Specific Spoke Types
**Given** spoke generation is triggered for a Pillar
**When** the Creator Agent generates content
**Then** spokes are created for each platform type:
- Twitter/X post (280 chars max)
- LinkedIn post (3000 chars max)
- TikTok script (60 sec, ~150 words)
- Instagram caption (2200 chars max)
- Newsletter snippet (500 words)
- Thread (5-7 sequential posts)
- Carousel (5-8 slides)

### AC3: Psychological Angle Preservation
**Given** a Pillar has psychological angle "Contrarian"
**When** spokes are generated for that Pillar
**Then** each spoke maintains the Contrarian angle
**And** content tone matches the psychological framing
**And** the angle is stored in `spokes.psychological_angle`

### AC4: Performance Target (NFR-P3)
**Given** a Hub with 10 Pillars
**When** I trigger spoke generation
**Then** all 25 spokes per Pillar (250 total) generate in < 60 seconds
**And** generation uses parallel Workers AI calls

### AC5: Hub/Pillar/Spoke Tree View
**Given** spokes have been generated
**When** I view the Hub detail page
**Then** I see a Tree Map hierarchy (UX Pattern 4):
- Hub node at top
- Pillar nodes as children
- Spoke nodes as leaves
**And** I can expand/collapse each level
**And** counts are shown at each level

### AC6: Platform Filter
**Given** I am viewing spokes in the tree view
**When** I select "LinkedIn" from the platform filter dropdown
**Then** only LinkedIn spokes are displayed
**And** the spoke count updates to show filtered results
**And** other platform spokes are hidden but not deleted

### AC7: Real-Time Generation Progress
**Given** spoke generation is in progress
**When** the workflow processes each Pillar
**Then** I see progress updates:
- Pillar name being processed
- Spoke count incrementing
- Platform completion indicators
**And** spokes animate into the tree view as they complete

## Tasks / Subtasks

- [x] Backend: Spoke generation workflow (AC: #1, #2, #4)
  - [x] Create `spokes` D1 table migration (id, hub_id, pillar_id, client_id, platform, content, psychological_angle, status, created_at)
  - [x] Create `spokes.generate` tRPC procedure to trigger generation
  - [x] Implement Cloudflare Workflow for parallel spoke generation
  - [x] Add Creator Agent prompts for each platform type
  - [x] Ensure client_id filtering on all spoke queries (Rule 1)

- [x] Backend: Platform-specific generation logic (AC: #2, #3)
  - [x] Create platform config with constraints (char limits, format rules)
  - [x] Implement Twitter generator (280 chars, punchy hooks)
  - [x] Implement LinkedIn generator (professional tone, 3000 chars)
  - [x] Implement TikTok script generator (60 sec script format)
  - [x] Implement Instagram caption generator (emoji-friendly)
  - [x] Implement Newsletter snippet generator (500 words, value-dense)
  - [x] Implement Thread generator (5-7 post sequence)
  - [x] Implement Carousel generator (5-8 slide structure)
  - [x] Pass psychological angle to all generators

- [x] Frontend: Hub detail page with generation trigger (AC: #1)
  - [x] Create `/app/hubs/$hubId` route
  - [x] Add "Generate Spokes" button with loading state
  - [x] Show generation progress indicator
  - [x] Poll for completion status (MVP - no WebSocket)

- [x] Frontend: Tree Map hierarchy view (AC: #5)
  - [x] Create `SpokeTreeView.tsx` component
  - [x] Implement Hub → Pillar → Spoke hierarchy
  - [x] Add expand/collapse functionality per level
  - [x] Show counts at each node (e.g., "10 spokes")
  - [x] Apply Midnight Command styling

- [x] Frontend: Platform filter (AC: #6)
  - [x] Add platform dropdown filter to tree view
  - [x] Implement client-side filtering by platform
  - [x] Update spoke count display on filter
  - [x] Preserve filter state in URL params

- [x] Frontend: Generation progress UI (AC: #7)
  - [x] Create `GenerationProgress.tsx` component
  - [x] Show pillar-by-pillar progress
  - [x] Animate new spokes into tree view
  - [x] Display platform completion indicators

- [x] Testing: E2E test coverage
  - [x] Test spoke generation trigger
  - [x] Test platform filtering
  - [x] Test tree view expand/collapse
  - [x] Test generation progress states

## Dev Notes

### Dependencies

**Prerequisites (Epic 3 Complete):**
- Hub creation working (Story 3.1-3.4)
- Pillars stored in `extracted_pillars` table
- Client isolation established

**New Infrastructure Needed:**
- `spokes` D1 table
- Cloudflare Workflow for parallel generation
- Workers AI integration for content generation

### Database Schema

```sql
-- Migration: 0010_spokes.sql
CREATE TABLE spokes (
  id TEXT PRIMARY KEY,
  hub_id TEXT NOT NULL,
  pillar_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL,  -- 'twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter', 'thread', 'carousel'
  content TEXT NOT NULL,
  psychological_angle TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending', 'generating', 'ready', 'failed'
  generation_attempt INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (hub_id) REFERENCES hub_registry(id) ON DELETE CASCADE,
  FOREIGN KEY (pillar_id) REFERENCES extracted_pillars(id) ON DELETE CASCADE
);

CREATE INDEX idx_spokes_hub ON spokes(hub_id);
CREATE INDEX idx_spokes_pillar ON spokes(pillar_id);
CREATE INDEX idx_spokes_client ON spokes(client_id);
CREATE INDEX idx_spokes_platform ON spokes(platform);
```

### Platform Constraints

```typescript
const PLATFORM_CONFIGS = {
  twitter: { maxChars: 280, format: 'single-post', tone: 'punchy' },
  linkedin: { maxChars: 3000, format: 'professional', tone: 'authoritative' },
  tiktok: { maxDuration: 60, format: 'script', tone: 'conversational' },
  instagram: { maxChars: 2200, format: 'caption', tone: 'visual' },
  newsletter: { maxWords: 500, format: 'long-form', tone: 'value-dense' },
  thread: { posts: [5, 7], format: 'sequential', tone: 'storytelling' },
  carousel: { slides: [5, 8], format: 'visual-slides', tone: 'educational' },
} as const;
```

### Architecture Patterns

**Adversarial Logic (Rule 4):**
This story implements ONLY the Creator Agent generation. The Critic Agent evaluation happens in Story 4.2.

```typescript
// Story 4.1: Creator generates spokes
async function generateSpokes(hub: Hub, pillar: Pillar): Promise<Spoke[]> {
  const platforms = Object.keys(PLATFORM_CONFIGS);

  // Parallel generation for performance (NFR-P3)
  const spokes = await Promise.all(
    platforms.map(platform =>
      creatorAgent.generate(hub, pillar, platform)
    )
  );

  // NOTE: Quality gates (G2/G4/G5) applied in Story 4.2
  return spokes.map(s => ({ ...s, status: 'pending_review' }));
}
```

**Client Isolation (Rule 1):**
```typescript
// All spoke queries MUST include client_id
const spokes = await db
  .selectFrom('spokes')
  .where('client_id', '=', ctx.clientId)
  .where('hub_id', '=', hubId)
  .selectAll()
  .execute();
```

### UI/UX Specifications

**Tree Map Styling (Midnight Command):**
```typescript
// Node colors
const nodeColors = {
  hub: 'var(--bg-surface)',      // #1A1F26
  pillar: 'var(--bg-elevated)',   // Slightly lighter
  spoke: 'var(--bg-surface)',
  spokeActive: 'var(--edit)',     // #1D9BF0 for selected
};

// Platform badges
const platformBadges = {
  twitter: { color: '#1DA1F2', label: 'Twitter' },
  linkedin: { color: '#0A66C2', label: 'LinkedIn' },
  tiktok: { color: '#FF0050', label: 'TikTok' },
  instagram: { color: '#E4405F', label: 'Instagram' },
  newsletter: { color: '#FFAD1F', label: 'Newsletter' },
  thread: { color: '#1D9BF0', label: 'Thread' },
  carousel: { color: '#00D26A', label: 'Carousel' },
};
```

**Progress Animation:**
- New spokes fade in from 0 → 1 opacity (200ms)
- Progress bar uses `var(--approve)` fill
- Pillar completion shows checkmark animation

### References

**Technical:**
- [Source: _bmad-output/architecture.md#Adversarial-Agent] - Creator/Critic pattern
- [Source: _bmad-output/architecture.md#Hub-and-Spoke] - Content hierarchy
- [Source: project-context.md#Rule-1] - Client isolation
- [Source: project-context.md#Rule-4] - Adversarial logic

**UX:**
- [Source: _bmad-output/ux-design-specification.md] - Tree Map Pattern (Pattern 4)
- [Source: _bmad-output/epics.md#Story-4.1] - Original story definition

**Dependencies:**
- [Story 3.4](./3-4-hub-metadata-and-state-management.md) - Hub creation complete

**Next Stories:**
- Story 4.2: Adversarial Critic Service (Quality Gates)
- Story 4.3: The Self-Healing Loop

## Estimation Notes

**Story Points: 8** (Large - significant new infrastructure)

**Breakdown:**
- Database schema + migration: 0.5 days
- Platform generators (7 types): 2 days
- Cloudflare Workflow: 1 day
- Tree Map component: 1.5 days
- Platform filter: 0.5 days
- Progress UI: 1 day
- E2E tests: 0.5 days
- **Total: ~7 days**

**Risk Factors:**
- Workers AI rate limits during parallel generation
- Complex tree view rendering performance
- Platform constraint validation edge cases

## Out of Scope (Story 4.2+)

- ❌ Quality Gates (G2/G4/G5) - Story 4.2
- ❌ Self-Healing Loop - Story 4.3
- ❌ Creative Conflict escalation - Story 4.4
- ❌ Visual concept generation - Story 4.5
- ❌ WebSocket real-time (MVP uses polling)
