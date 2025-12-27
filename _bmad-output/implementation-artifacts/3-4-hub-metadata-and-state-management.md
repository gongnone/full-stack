# Story 3.4: Hub Metadata & State Management

**Status:** done
**Story Points:** 5
**Sprint:** 2
**Epic:** 3 - Hub Creation & Content Ingestion

## Story

As a **user**,
I want **my Hub to be properly stored with all metadata**,
So that **I can manage and track it in my dashboard**.

## Acceptance Criteria

### AC1: Hub Finalization to D1 Registry
**Given** I have configured pillars in Step 4 of the wizard
**When** I click "Create Hub"
**Then** a Hub record is created in D1 `hubs` table with:
- `id` (UUID)
- `client_id` (user's client context)
- `user_id` (authenticated user)
- `source_id` (link to hub_sources)
- `title` (from source or custom)
- `source_type` (pdf, text, url)
- `pillar_count` (finalized pillars)
- `spoke_count` (0 initially)
- `status` (processing → ready)
- `created_at` timestamp

### AC2: Pillar Association with Hub
**Given** a Hub is created
**When** the system finalizes it
**Then** pillars from `extracted_pillars` are linked to the Hub via `hub_id`
**And** each pillar maintains its metadata (title, claim, angle, supporting points)
**And** pillars become immutable after Hub creation (no further edits)

### AC3: Client Isolation (NFR-S1)
**Given** I have multiple clients (Epic 7 future state)
**When** I create a Hub
**Then** it is isolated to the selected client's context
**And** queries ALWAYS include `client_id` filtering (Project Context Rule 1)
**And** other users/clients cannot access this Hub's data

### AC4: Hub List View in Dashboard
**Given** I have created one or more Hubs
**When** I navigate to the Hubs page
**Then** I see a list/grid of my Hubs displaying:
- Hub title
- Source type icon (PDF/Text/URL)
- Pillar count
- Spoke count
- Created date
- Status badge (Processing/Ready/Archived)

### AC5: Hub Detail Navigation
**Given** a Hub exists in the list
**When** I click on the Hub card
**Then** I navigate to the Hub detail page showing full pillar information
**And** the URL follows pattern `/app/hubs/:hubId`

## Tasks / Subtasks

- [x] **Task 1: Database Schema** (AC: #1, #2, #3)
  - [x] Create migration `0009_hubs.sql` with `hubs` table
  - [x] Add `hub_id` column to `extracted_pillars` table (nullable for pre-finalization)
  - [x] Add indexes for `client_id`, `user_id`, `status` queries
  - [x] Apply migration to local, stage, and production D1 databases

- [x] **Task 2: Hub Finalization tRPC Procedure** (AC: #1, #2)
  - [x] Update `hubs.ts` router with `hubs.finalize` mutation
  - [x] Accept: `sourceId`, `clientId`, `title` (optional override)
  - [x] Transaction: Create hub record + update pillars with `hub_id`
  - [x] Update source status to `completed`
  - [x] Return `hubId` and redirect target

- [x] **Task 3: Hub List Query** (AC: #3, #4)
  - [x] Implement `hubs.list` query with proper client isolation
  - [x] Return: id, title, source_type, pillar_count, spoke_count, status, created_at
  - [x] Support pagination with cursor-based navigation
  - [x] Support filtering by status (processing, ready, archived)

- [x] **Task 4: Hub Detail Query** (AC: #5)
  - [x] Implement `hubs.get` query returning Hub + associated pillars
  - [x] Verify client_id authorization
  - [x] Include pillar details (title, claim, angle, supporting points)

- [x] **Task 5: Hub List UI Component** (AC: #4)
  - [x] Create `HubCard.tsx` component in `src/components/hubs/`
  - [x] Display: title, source type icon, pillar count, spoke count, date, status
  - [x] Use Midnight Command theme tokens
  - [x] Add hover states and click navigation

- [x] **Task 6: Hubs Index Route** (AC: #4)
  - [x] Update `src/routes/app/hubs.tsx` to fetch and display Hub list
  - [x] Add empty state for no Hubs
  - [x] Add loading skeleton during fetch

- [x] **Task 7: Hub Detail Route** (AC: #5)
  - [x] Create `src/routes/app/hubs.$hubId.tsx` route
  - [x] Fetch Hub data with pillars via `hubs.get`
  - [x] Display Hub header with metadata
  - [x] Display pillar cards in grid layout

- [x] **Task 8: Wizard Finalization Step** (AC: #1, #2)
  - [x] Update Step 4 in `hubs.new.tsx` to call `hubs.finalize`
  - [x] Show loading state during finalization
  - [x] Navigate to Hub detail page on success
  - [x] Handle errors with retry option

- [x] **Task 9: E2E Tests** (AC: All)
  - [x] Test Hub creation flow from wizard completion
  - [x] Test Hub list displays created Hubs
  - [x] Test Hub detail page shows correct data
  - [x] Test client isolation (user cannot see other's Hubs)

## Dev Notes

### Relevant Architecture Patterns and Constraints

**Architecture Pattern:** D1 Global Database for Hub Registry (Architecture.md line 236-241)
- `hubs` table stores Hub metadata in D1 (global, not per-client DO for MVP)
- Future state: Durable Objects for per-client `content_hierarchy` (Epic 7+)

**Performance Budget:**
- Hub list query: < 100ms (indexed by client_id)
- Hub finalization: < 500ms (single transaction)

**Client Isolation (Project Context Rule 1):**
```typescript
// ✅ CORRECT - Always filter by client_id
const hubs = await db
  .selectFrom('hubs')
  .where('client_id', '=', ctx.clientId)
  .selectAll()
  .execute();

// ❌ FORBIDDEN
const hubs = await db.selectFrom('hubs').selectAll().execute();
```

### Source Tree Components to Touch

**New Files:**
- `apps/foundry-dashboard/migrations/0009_hubs.sql` - Hubs table schema
- `apps/foundry-dashboard/src/components/hubs/HubCard.tsx` - Hub card component
- `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx` - Hub detail route
- `apps/foundry-dashboard/e2e/story-3.4-hub-metadata.spec.ts` - E2E tests

**Modified Files:**
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` - Add finalize, update list/get
- `apps/foundry-dashboard/worker/types.ts` - Add Hub type
- `apps/foundry-dashboard/src/routes/app/hubs.tsx` - Hub list UI
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` - Finalization step

### Database Schema

```sql
-- 0009_hubs.sql
CREATE TABLE IF NOT EXISTS hubs (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  source_id TEXT NOT NULL,

  title TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'text', 'url')),

  pillar_count INTEGER NOT NULL DEFAULT 0,
  spoke_count INTEGER NOT NULL DEFAULT 0,

  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'ready', 'archived')),

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES hub_sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hubs_client_id ON hubs(client_id);
CREATE INDEX IF NOT EXISTS idx_hubs_user_id ON hubs(user_id);
CREATE INDEX IF NOT EXISTS idx_hubs_status ON hubs(status);
CREATE INDEX IF NOT EXISTS idx_hubs_created_at ON hubs(created_at DESC);

-- Add hub_id to extracted_pillars
ALTER TABLE extracted_pillars ADD COLUMN hub_id TEXT REFERENCES hubs(id);
CREATE INDEX IF NOT EXISTS idx_extracted_pillars_hub_id ON extracted_pillars(hub_id);
```

### Testing Standards Summary

**E2E Testing (Playwright):**
- Test full wizard flow ending in Hub creation
- Verify Hub appears in list after creation
- Test Hub detail page displays pillars
- Test client isolation (create Hub as user A, verify user B cannot see it)

**Integration Testing:**
- Test `hubs.finalize` transaction (Hub + pillar updates)
- Test `hubs.list` pagination
- Test `hubs.get` authorization

### Project Structure Notes

**Alignment with Unified Project Structure:**
- Routes: `src/routes/app/hubs.tsx` (list), `src/routes/app/hubs.$hubId.tsx` (detail)
- Components: `src/components/hubs/` directory for Hub-specific components
- tRPC: `worker/trpc/routers/hubs.ts` (already exists)

**No Conflicts Detected:** Architecture defines D1 for hub_registry (Architecture.md line 73)

### References

**Technical Details:**
- [Source: _bmad-output/architecture.md#Multi-Tenant-Isolation] - D1 global database pattern
- [Source: _bmad-output/architecture.md#Hub-and-Spoke-Production-Model] - Hub hierarchy
- [Source: _bmad-output/epics.md#Story-3.4] - Original story definition
- [Source: _bmad-output/project-context.md#Rule-1] - Client isolation requirement
- [Source: _bmad-output/project-context.md#Rule-3] - Midnight Command design tokens

**Related Stories:**
- [Source: Story 3-1] - hub_sources table (source tracking)
- [Source: Story 3-2] - extracted_pillars table (pillar storage)
- [Source: Story 3-3] - Pillar configuration UI (in progress)

**Functional Requirements:**
- FR5: Create Hub from processed source material

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Applied migrations 0003-0009 to stage and production D1 databases (was missing 0003-0008)
- Fixed TypeScript error in hubs.list pagination: `Object possibly undefined` for cursor
- Fixed `trpc.user.me` → `trpc.auth.me` in hubs.tsx and hubs.$hubId.tsx
- Fixed STATUS_CONFIG type indexing for hub.status

### Completion Notes List

1. **Database Migration (0009_hubs.sql):** Created `hubs` table with UUID primary key, client/user isolation, source linking, and status tracking. Added `hub_id` foreign key to `extracted_pillars`.

2. **Hub Finalization:** Implemented `hubs.finalize` mutation that creates Hub record, links pillars via `hub_id`, updates source status to `completed`, and returns redirect URL.

3. **Hub List Query:** Implemented `hubs.list` with infinite query support, cursor-based pagination, client isolation, and proper TypeScript safety for cursor handling.

4. **Hub Detail Query:** Implemented `hubs.get` returning full Hub with associated pillars including psychological angles, supporting points, and estimated spoke counts.

5. **HubCard Component:** Created reusable card component with source type icons (PDF/Text/URL), status badges (Processing/Ready/Archived), and Midnight Command theming.

6. **Hubs Index Route:** Updated with infinite query, loading skeleton, empty state with CTA, and responsive grid layout.

7. **Hub Detail Route:** Created with breadcrumb navigation, stats section, and pillar grid with psychological angle badges.

8. **Wizard Finalization:** Updated Step 4 with Hub summary, optional title input, pillar preview, Create Hub button with loading state. Shows IngestionSuccess component on completion (navigation via button, not auto-redirect).

9. **E2E Tests:** Created comprehensive test suite (40+ test cases) covering all acceptance criteria including Hub list, card display, detail view, finalization flow, and client isolation.

10. **Code Review Fixes (2025-12-22):**
    - Added pillar immutability enforcement (AC2) - updatePillar/deletePillar now reject pillars with hub_id set
    - Added hubId property to Pillar type for type safety
    - Fixed E2E test AC mapping comments
    - MVP Note: Hub status defaults to 'ready' immediately (no background processing workflow in MVP scope)

### File List

**New Files:**
- `apps/foundry-dashboard/migrations/0009_hubs.sql`
- `apps/foundry-dashboard/src/components/hubs/HubCard.tsx`
- `apps/foundry-dashboard/src/components/hubs/index.ts`
- `apps/foundry-dashboard/src/routes/app/hubs.$hubId.tsx`
- `apps/foundry-dashboard/e2e/story-3.4-hub-metadata.spec.ts`
- `apps/foundry-dashboard/worker/trpc/routers/hubs.ts` (new tRPC router with finalize, list, get, archive)
- `apps/foundry-dashboard/src/routes/app/hubs.new.tsx` (new wizard route with finalization Step 4)

**Modified Files:**
- `apps/foundry-dashboard/worker/types.ts` (added Hub, HubWithPillars, HubListItem, FinalizeHubResult, hubId on Pillar)
- `apps/foundry-dashboard/src/routes/app/hubs.tsx` (updated with infinite query and HubCard grid)
