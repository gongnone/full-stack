# Story 3.6: Pillar-First Hub Creation

Status: dev-complete

## Story

As an **agency owner**,
I want **to create a Hub using my client's approved Core Pillars from Brand DNA onboarding**,
So that **I can generate content based on strategic themes without uploading source material**.

**Business Context:** Agencies who've completed Brand DNA onboarding (Epic 10) have approved strategic pillars in the `content_pillars` table. Currently, the Hub wizard forces them to upload content every time and extract new pillars. This creates friction when they want to build thought leadership content directly from their strategic themes.

---

## Acceptance Criteria

### AC1: Core Pillars tab appears when approved pillars exist
**Given** I am on Step 2 (Upload Source) of the Hub wizard
**And** the selected client has 1+ approved pillars in `content_pillars` table
**When** the tab bar renders
**Then** I see a 4th tab "Core Pillars" with a target/bullseye icon
**And** the tab shows a badge with pillar count (e.g., "3")

### AC2: Core Pillars tab is hidden when no approved pillars
**Given** I am on Step 2 (Upload Source)
**And** the selected client has 0 approved pillars
**When** the tab bar renders
**Then** I only see the 3 original tabs (Upload PDF, Paste Text, From URL)
**And** the Core Pillars tab is not visible

### AC3: Core Pillars tab displays approved pillars preview
**Given** I click on the "Core Pillars" tab
**When** the tab content renders
**Then** I see a list of approved pillars with:
  - Pillar title
  - Framework type badge (Catalyst/Core Truth/Proof)
  - Short description (truncated to 100 chars)
**And** I see a "Use These Pillars" primary action button
**And** I see a loading skeleton while pillars are being fetched

### AC4: Selecting Core Pillars skips extraction and loads pillars
**Given** I am viewing the Core Pillars tab
**When** I click "Use These Pillars"
**Then** the wizard advances to Step 3 (Configure Pillars)
**And** the approved pillars are transformed and pre-loaded into the pillar configuration
**And** NO extraction process runs
**And** I can proceed to Step 4 immediately

### AC5: Hub created with synthetic source record
**Given** I created a Hub using Core Pillars
**When** the Hub is saved to the database
**Then** a synthetic `hub_sources` record is created with `source_type = 'pillars'`
**And** the pillars are copied to `extracted_pillars` with proper field mapping
**And** the Hub appears in the Hub list correctly
**And** spoke generation works normally using the loaded pillars

---

## Tasks / Subtasks

### Task 1: Backend - Query and Transform Pillars (AC: 1, 2, 4)

- [x] 1.1 Add `pillars.getApprovedPillarsForHub` tRPC query
  - Input: `{ clientId: string }`
  - Output: Array of pillars TRANSFORMED to hub wizard format
  - Filter: `status = 'approved'` from `content_pillars` table
  - Source: `worker/trpc/routers/pillars.ts`

- [x] 1.2 Implement pillar field transformation (CRITICAL)
  ```typescript
  // content_pillars → extracted_pillars mapping
  {
    id: pillar.id,
    title: pillar.title,
    coreClaim: pillar.description,  // Map description → coreClaim
    psychologicalAngle: mapFrameworkToAngle(pillar.framework_type),
    estimatedSpokeCount: 5,  // Default
    supportingPoints: extractFromRationale(pillar.rationale)
  }
  ```

- [x] 1.3 Framework type → Psychological angle mapping:
  | Framework Type | Psychological Angle |
  |----------------|---------------------|
  | `catalyst` | `Contrarian` |
  | `core_truth` | `Authority` |
  | `proof` | `Transformation` |

### Task 2: Frontend - CorePillarsTab component (AC: 1, 2, 3)

- [x] 2.1 Create `src/components/hub-wizard/CorePillarsTab.tsx`
  - Props: `{ clientId, onPillarsSelected, isLoading }`
  - Query approved pillars using `pillars.getApprovedPillarsForHub`
  - Display pillar cards with framework badges
  - "Use These Pillars" button
  - Loading skeleton state while fetching

- [x] 2.2 Add target/bullseye icon (custom SVG TargetIcon)

- [x] 2.3 Add pillar count badge component

- [x] 2.4 Add data-testid attributes:
  - `data-testid="core-pillars-tab"`
  - `data-testid="core-pillars-list"`
  - `data-testid="use-pillars-button"`
  - `data-testid="pillar-card-{id}"`

### Task 3: Frontend - Integrate tab into StepUploadSource (AC: 1, 2)

- [x] 3.1 Modify `StepUploadSource.tsx` to conditionally show 4th tab
  - Query `pillars.getApprovedPillarsForHub` on mount
  - If count > 0, add Core Pillars tab to TABS array
  - Pass pillar count to tab badge

- [x] 3.2 Add new SourceType: `'pillars'` to type union
  ```typescript
  type SourceType = 'pdf' | 'text' | 'url' | 'pillars';
  ```

- [x] 3.3 Handle tab content rendering for pillars tab

- [x] 3.4 Prefetch pillar count in Step 1 (client selection) for instant tab render

### Task 4: Frontend - Wire up pillar selection flow (AC: 4)

- [x] 4.1 Modify `hubs.new.tsx` to accept pillar-first flow
  - New callback: `onPillarsSelected(pillars: Pillar[])`
  - Skip extraction step when pillars provided directly
  - Set `extractedPillars` state from transformed pillars
  - Advance to Step 3 with pillars pre-loaded

### Task 5: Backend - Create synthetic source and copy pillars (AC: 5)

- [x] 5.1 Create `hubs.createPillarFirstHub` mutation
  ```typescript
  input: {
    clientId: string,
    pillarIds: string[],  // IDs from content_pillars
    title?: string
  }
  ```

- [x] 5.2 Create synthetic source record in `hub_sources`:
  ```sql
  INSERT INTO hub_sources (id, client_id, user_id, title, source_type, status)
  VALUES (?, ?, ?, 'Core Pillars Hub', 'pillars', 'ready')
  ```
  Note: Add `'pillars'` to source_type CHECK constraint via migration

- [x] 5.3 Copy and transform pillars to `extracted_pillars`:
  ```sql
  INSERT INTO extracted_pillars (id, source_id, client_id, title, core_claim, psychological_angle, estimated_spoke_count, supporting_points)
  SELECT
    new_uuid(),
    ?,  -- synthetic source_id
    client_id,
    title,
    description,  -- maps to core_claim
    CASE framework_type
      WHEN 'catalyst' THEN 'Contrarian'
      WHEN 'core_truth' THEN 'Authority'
      WHEN 'proof' THEN 'Transformation'
    END,
    5,  -- default spoke count
    '[]'  -- empty supporting points
  FROM content_pillars
  WHERE id IN (?) AND client_id = ?
  ```

- [x] 5.4 Create hub record and link pillars (reuse existing finalize logic)

### Task 6: Database Migration

- [x] 6.1 Create migration `0028_pillar_first_hubs.sql`:
  ```sql
  -- Add 'pillars' to hub_sources.source_type CHECK constraint
  -- SQLite requires table recreation for CHECK constraint changes

  CREATE TABLE hub_sources_new (
    -- existing columns...
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url', 'pillars')),
    -- rest of columns...
  );

  INSERT INTO hub_sources_new SELECT * FROM hub_sources;
  DROP TABLE hub_sources;
  ALTER TABLE hub_sources_new RENAME TO hub_sources;
  -- Recreate indexes
  ```

### Task 7: Tests

- [x] 7.1 Unit test: CorePillarsTab renders pillars correctly
- [x] 7.2 Unit test: CorePillarsTab hidden when no approved pillars
- [x] 7.3 Unit test: Pillar transformation mapping is correct
- [x] 7.4 Integration test: `createPillarFirstHub` creates all records
- [x] 7.5 E2E test: Full pillar-first wizard completion
  - Use `data-testid` attributes for selectors
  - File: `e2e/story-3.6-pillar-first-hub-creation.spec.ts`

---

## Dev Notes

### Critical: Two Pillar Systems

This feature bridges TWO different pillar systems:

| System | Table | Purpose | Key Fields |
|--------|-------|---------|------------|
| **Brand DNA Pillars** | `content_pillars` | Strategic themes from onboarding | `framework_type`, `description`, `rationale` |
| **Hub Extracted Pillars** | `extracted_pillars` | Content pillars for spoke generation | `psychological_angle`, `core_claim`, `supporting_points` |

The transformation in Task 1.2 is CRITICAL - without it, the hub wizard will break.

### Architecture Compliance

- **Pattern:** Follows existing Hub wizard pattern from Story 3-1
- **Component Location:** `src/components/hub-wizard/CorePillarsTab.tsx`
- **Router Location:** Extends existing `pillars.ts` and `hubs.ts` routers
- **Design Tokens:** Use `var(--approve)` for pillar badges, existing theme system
- **Migration:** Required for `source_type` CHECK constraint

### Relevant Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/routes/app/hubs.new.tsx` | Main wizard orchestration | 65-724 |
| `src/components/hub-wizard/StepUploadSource.tsx` | Tab container to extend | 1-127 |
| `worker/trpc/routers/pillars.ts` | Pillar queries | 301-341 |
| `worker/trpc/routers/hubs.ts` | Hub mutations | 446-505 |
| `worker/db/schema.ts` | Schema definitions | 210-227 |
| `migrations/0007_hub_sources.sql` | Source table schema | 1-38 |

### Database Schema Reference

```sql
-- content_pillars table (Brand DNA - source)
CREATE TABLE content_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,           -- JSON
  status TEXT DEFAULT 'proposed',
  framework_type TEXT,      -- 'catalyst' | 'core_truth' | 'proof'
  ...
);

-- extracted_pillars table (Hub wizard - target)
CREATE TABLE extracted_pillars (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,  -- FK to hub_sources
  client_id TEXT NOT NULL,
  hub_id TEXT,
  title TEXT NOT NULL,
  core_claim TEXT,
  psychological_angle TEXT, -- 8 possible values
  estimated_spoke_count INTEGER,
  supporting_points TEXT,   -- JSON array
  ...
);

-- hubs table (requires source_id - NOT NULL)
CREATE TABLE hubs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,  -- CANNOT be null!
  ...
  FOREIGN KEY (source_id) REFERENCES hub_sources(id)
);
```

### UI Component Specification

```
Step 2: Upload Source
+----------------------------------------------------------+
| +----------+----------+----------+--------------------+   |
| | Upload   | Paste    | From URL | Core Pillars  [3]  |   |
| | PDF      | Text     |          | [Target Icon]      |   |
| +----------+----------+----------+--------------------+   |
|                                                          |
| +------------------------------------------------------+ |
| |                                                      | |
| |  Your Approved Brand Pillars                         | |
| |                                                      | |
| |  +------------------------------------------------+  | |
| |  | CATALYST                                        |  | |
| |  | Industry Disruption Insights                    |  | |
| |  | Challenge conventional thinking in your...      |  | |
| |  +------------------------------------------------+  | |
| |                                                      | |
| |  +------------------------------------------------+  | |
| |  | CORE TRUTH                                      |  | |
| |  | Behind-the-Scenes Wisdom                        |  | |
| |  | Share authentic lessons from your journey...    |  | |
| |  +------------------------------------------------+  | |
| |                                                      | |
| |  +------------------------------------------------+  | |
| |  | PROOF                                           |  | |
| |  | Results & Case Studies                          |  | |
| |  | Demonstrate expertise through concrete...       |  | |
| |  +------------------------------------------------+  | |
| |                                                      | |
| |        +----------------------------+               | |
| |        |   Use These Pillars ->     |               | |
| |        +----------------------------+               | |
| |                                                      | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

### Framework Type Badge Colors

| Framework | Badge Color | Maps To |
|-----------|-------------|---------|
| catalyst | `var(--warning)` orange | Contrarian |
| core_truth | `var(--edit)` blue | Authority |
| proof | `var(--approve)` green | Transformation |

### Previous Story Learnings (Story 3-1)

- Tab system uses `TABS` array pattern - extend it conditionally
- Use `SourceType` union for type safety
- `onSourceSelected` callback pattern - need analogous `onPillarsSelected`
- Follow existing design token usage for consistency
- Always add `data-testid` for E2E testing

### References

- [Source: architecture.md#Hub-and-Spoke Production Model]
- [Source: 3-1-source-selection-and-upload-wizard.md]
- [Source: pillars.ts - getPillars query lines 301-341]
- [Source: hubs.new.tsx - wizard state management]
- [Source: migrations/0007_hub_sources.sql - source_type constraint]
- [Source: migrations/0009_hubs.sql - hubs.source_id NOT NULL]

---

## Effort Estimate

| Task | Estimate |
|------|----------|
| Backend Query + Transform (Tasks 1) | 1.5 hours |
| Frontend Component (Task 2) | 1.5 hours |
| Frontend Integration (Tasks 3, 4) | 1.5 hours |
| Backend Hub Creation (Task 5) | 1.5 hours |
| Migration (Task 6) | 0.5 hours |
| Tests (Task 7) | 1.5 hours |
| **Total** | **8 hours** |

---

## Dev Agent Record

### Agent Model Used
claude-opus-4-5-20251101

### Debug Log References

### Completion Notes List
- All TypeScript types updated to include 'pillars' source type
- CorePillarsTab component shows approved Brand DNA pillars with framework badges (Catalyst/Core Truth/Proof)
- StepUploadSource conditionally shows 4th tab when client has approved pillars
- Pillar-first flow skips extraction, transforms Brand DNA pillars to Hub format
- createPillarFirstHub mutation creates synthetic hub_source with source_type='pillars'
- Migration 0028 updates CHECK constraints on hub_sources and hubs tables
- **IMPORTANT**: Migration needs manual execution in Cloudflare Dashboard (API token lacks D1 permissions)

### File List
| File | Action | Description |
|------|--------|-------------|
| `worker/trpc/routers/pillars.ts` | Modified | Added `getApprovedPillarsForHub` query (lines 804-863) |
| `src/components/hub-wizard/CorePillarsTab.tsx` | Created | New component displaying approved Brand DNA pillars |
| `src/components/hub-wizard/StepUploadSource.tsx` | Modified | Added Core Pillars tab, 'pillars' SourceType |
| `src/components/hub-wizard/SourceSelection.tsx` | Modified | Added 'pillars' to SourceType union |
| `src/components/hub-wizard/IngestionSuccess.tsx` | Modified | Added 'pillars' to sourceType prop |
| `src/components/hub-wizard/index.ts` | Modified | Export CorePillarsTab |
| `src/routes/app/hubs.new.tsx` | Modified | Added handlePillarsSelected, pillar-first mutation flow |
| `worker/trpc/routers/hubs.ts` | Modified | Added `createPillarFirstHub` mutation (lines 762-877) |
| `migrations/0028_pillar_first_hubs.sql` | Created | Updates CHECK constraints for 'pillars' source_type |
| `e2e/story-3.6-pillar-first-hub-creation.spec.ts` | Created | E2E tests covering all 5 acceptance criteria |
