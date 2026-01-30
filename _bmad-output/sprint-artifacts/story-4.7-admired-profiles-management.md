# Story 4.7: Admired Profiles Management

Status: ready-for-dev

## Story

As a **content creator**,
I want **to add Instagram profiles I admire so my G7 scores are personalized to my niche**,
So that **engagement predictions match the creators I want to emulate, not generic patterns**.

## Business Context

**Problem:** Generic baseline hooks provide cold-start capability but lack personalization to client's specific audience and style preferences.

**Opportunity:** Clients know exactly which creators they admire and want to emulate. By letting them curate their own benchmark set, G7 becomes hyper-personalized and more accurate.

**Strategic Moat:** Each client's G7 model becomes unique to their taste, creating a defensible learning advantage over time.

## Acceptance Criteria

### AC1: Add Admired Profile
**Given** I'm on Settings → Admired Profiles page
**When** I click "Add Profile"
**Then** a dialog appears with:
- Input field: "Instagram handle (e.g., @garyvee)"
- "Add Profile" button (primary action, Midnight Command blue)
- "Cancel" button (secondary)

**Given** I enter a valid Instagram handle (e.g., "@garyvee")
**When** I click "Add Profile"
**Then**:
- Dialog shows loading state: "Finding profile..."
- System validates handle exists and is public
- Profile is added to `admired_profiles` table with `status: 'pending'`
- Dialog closes
- Profile card appears with status "Syncing..."
- Background scraper job begins

### AC2: Instagram Profile Scraping
**Given** an admired profile with `status: 'pending'`
**When** the background scraper job runs
**Then** the system:
- Fetches profile metadata (avatar, follower count, bio)
- Scrapes top 50 posts ranked by engagement rate
- For each post:
  - Extracts hook (first 1-2 sentences of caption)
  - Records engagement rate (likes + comments) / followers
  - Stores post URL for reference
- Generates embeddings for all hooks using Workers AI
- Stores vectors in `client_{id}_admired` Vectorize namespace
- Updates profile `status: 'active'` with `last_synced: timestamp`
- Updates `post_count` field

**Given** scraping completes successfully
**When** I view the profile card
**Then** status changes to "✓ 47 posts analyzed" (green checkmark)

### AC3: Scraping Error Handling
**Given** I add a private Instagram profile
**When** the scraper attempts to access it
**Then**:
- Profile status changes to `status: 'error'`
- Error message shown: "Profile is private. Add public profiles only."
- Retry button appears on profile card

**Given** I add an invalid handle
**When** the system validates the handle
**Then**:
- Toast notification appears: "Handle not found. Check spelling."
- Profile is NOT added to database
- Dialog remains open for correction

**Given** scraping fails due to rate limiting
**When** the error is detected
**Then**:
- Profile status changes to `status: 'rate_limited'`
- Error message: "Instagram rate limit reached. Retrying in 1 hour."
- Auto-retry scheduled

### AC4: Profile Card Display
**Given** I have added admired profiles
**When** I view the Admired Profiles page
**Then** each profile displays:
- **Avatar** (circular, 48px)
- **Handle** (@username)
- **Follower count** (formatted: "1.2M followers")
- **Post count** (e.g., "47 posts analyzed")
- **Last synced** (relative time: "2 days ago")
- **Status indicator**:
  - Active: Green checkmark icon
  - Syncing: Animated spinner + progress bar
  - Error: Red warning icon
- **Action buttons**:
  - Re-sync icon button (circular arrow)
  - Remove icon button (trash, red on hover)

### AC5: Manual Re-sync
**Given** I have an active admired profile
**When** I click the "Re-sync" button
**Then**:
- Profile status changes to `status: 'syncing'`
- Card shows animated progress: "Syncing... 12/50 posts"
- Scraper fetches latest 50 posts (may include new content since last sync)
- Existing vectors are replaced with fresh data
- Upon completion, status returns to `active` with updated `last_synced` timestamp

### AC6: Remove Profile
**Given** I have an admired profile
**When** I click the "Remove" button
**Then**:
- Confirmation dialog appears: "Remove @garyvee from admired profiles? This will update your G7 scoring."
- "Remove" button (red, destructive)
- "Cancel" button (secondary)

**Given** I confirm removal
**When** I click "Remove" in the dialog
**Then**:
- Profile deleted from `admired_profiles` table
- All vectors for this profile removed from `client_{id}_admired` namespace
- Profile card removed from UI
- Toast notification: "@garyvee removed. G7 scoring updated."

### AC7: Automatic Weekly Re-sync
**Given** an admired profile has been active for 7+ days
**When** the scheduled cron job runs
**Then**:
- Profile status changes to `status: 'syncing'`
- Scraper executes automatic re-sync
- Fresh posts are fetched and vectors updated
- `last_synced` timestamp updated
- No UI notification (background operation)

### AC8: Empty State
**Given** I have not added any admired profiles yet
**When** I navigate to Settings → Admired Profiles
**Then** I see:
- Illustration: Magnifying glass over Instagram icon (Midnight Command colors)
- Heading: "Add Creators You Admire"
- Description: "Personalize your engagement scoring by adding Instagram profiles you want to emulate. Your G7 scores will prioritize patterns from these creators."
- "Add Your First Profile" button (primary action)

### AC9: G7 Weighting Impact Display
**Given** I have added admired profiles
**When** I view the Admired Profiles page header
**Then** I see a callout card:
- "G7 Scoring: **70% from your admired profiles**, 30% baseline"
- (Updates dynamically based on profile count per Story 4.6 AC1 weighting rules)

**Given** I have 0-4 profiles
**When** I view the callout
**Then** it shows: "G7 Scoring: **50% from your admired profiles**, 50% baseline. Add 5+ profiles for maximum personalization."

### AC10: Integration with G7 Scoring
**Given** I add a new admired profile
**When** the profile sync completes
**Then**:
- All future spoke G7 evaluations use updated weighting
- Existing spokes are NOT re-scored (scores are immutable snapshots)

## Tasks / Subtasks

- [ ] Task 1: Database schema for admired profiles (AC1, AC2)
  - [ ] Subtask 1.1: Create migration for `admired_profiles` table:
    - [ ] `id` (primary key)
    - [ ] `client_id` (foreign key, indexed)
    - [ ] `instagram_handle` (TEXT, unique per client)
    - [ ] `profile_url` (TEXT)
    - [ ] `avatar_url` (TEXT)
    - [ ] `follower_count` (INTEGER)
    - [ ] `bio` (TEXT, nullable)
    - [ ] `post_count` (INTEGER, default 0)
    - [ ] `status` (TEXT: 'pending', 'syncing', 'active', 'error', 'rate_limited')
    - [ ] `error_message` (TEXT, nullable)
    - [ ] `last_synced` (TIMESTAMP, nullable)
    - [ ] `created_at` (TIMESTAMP)
    - [ ] `updated_at` (TIMESTAMP)
  - [ ] Subtask 1.2: Run migration on `foundry-global-stage` D1 database
  - [ ] Subtask 1.3: Create indexes on `client_id` and `status` columns

- [ ] Task 2: Instagram scraper service (AC2, AC3)
  - [ ] Subtask 2.1: Create `apps/foundry-engine/src/scrapers/instagram-scraper.ts`
  - [ ] Subtask 2.2: Implement Apify Instagram Scraper integration
  - [ ] Subtask 2.3: Add profile metadata fetching (avatar, followers, bio)
  - [ ] Subtask 2.4: Implement top 50 posts scraping ranked by engagement
  - [ ] Subtask 2.5: Extract hooks from post captions (first 1-2 sentences)
  - [ ] Subtask 2.6: Calculate engagement rate: (likes + comments) / followers
  - [ ] Subtask 2.7: Error handling:
    - [ ] Private profile detection → set `status: 'error'`, message: "Profile is private"
    - [ ] Invalid handle → return error before DB insertion
    - [ ] Rate limiting → set `status: 'rate_limited'`, schedule retry
  - [ ] Subtask 2.8: Store scraped data in temporary holding table for processing

- [ ] Task 3: Vectorize ingestion pipeline (AC2)
  - [ ] Subtask 3.1: Create `apps/foundry-engine/src/vectorize/admired-profiles-sync.ts`
  - [ ] Subtask 3.2: Generate embeddings for hooks using Workers AI
  - [ ] Subtask 3.3: Batch upsert vectors to `client_{id}_admired` namespace
  - [ ] Subtask 3.4: Add metadata to vectors:
    - [ ] `instagram_handle`
    - [ ] `post_url`
    - [ ] `engagement_rate`
    - [ ] `source: 'admired'`
  - [ ] Subtask 3.5: Update profile record with `status: 'active'` on completion

- [ ] Task 4: Background job orchestration (AC2, AC7)
  - [ ] Subtask 4.1: Create Cloudflare Queue for profile sync jobs
  - [ ] Subtask 4.2: Implement queue consumer in `foundry-engine`
  - [ ] Subtask 4.3: Add job: `syncAdmiredProfile(profileId)`
  - [ ] Subtask 4.4: Add progress tracking (update `post_count` incrementally)
  - [ ] Subtask 4.5: Implement weekly cron job for auto-resync (runs Sunday midnight)
  - [ ] Subtask 4.6: Query all profiles where `last_synced < NOW() - 7 days`
  - [ ] Subtask 4.7: Enqueue re-sync jobs for stale profiles

- [ ] Task 5: tRPC router for admired profiles CRUD (AC1, AC4, AC5, AC6)
  - [ ] Subtask 5.1: Create `apps/foundry-dashboard/src/server/routers/admired-profiles.ts`
  - [ ] Subtask 5.2: Implement `list` procedure (returns all profiles for client)
  - [ ] Subtask 5.3: Implement `add` procedure:
    - [ ] Validate handle format (starts with @, alphanumeric + underscore)
    - [ ] Check for duplicates (handle + client_id unique constraint)
    - [ ] Insert profile with `status: 'pending'`
    - [ ] Enqueue sync job
  - [ ] Subtask 5.4: Implement `remove` procedure:
    - [ ] Delete profile from DB
    - [ ] Delete vectors from `client_{id}_admired` namespace
  - [ ] Subtask 5.5: Implement `resync` procedure:
    - [ ] Set `status: 'syncing'`
    - [ ] Enqueue sync job
  - [ ] Subtask 5.6: Implement `getWeighting` procedure:
    - [ ] Return profile count
    - [ ] Return weighting breakdown (70/30, 50/50, or 100 baseline)

- [ ] Task 6: Frontend Settings page (AC1, AC4, AC8, AC9)
  - [ ] Subtask 6.1: Create route: `apps/foundry-dashboard/src/routes/settings/admired-profiles.tsx`
  - [ ] Subtask 6.2: Implement page layout with Midnight Command design tokens
  - [ ] Subtask 6.3: Add header with G7 weighting callout card (AC9)
  - [ ] Subtask 6.4: Implement empty state component (AC8)
  - [ ] Subtask 6.5: Fetch profiles list via tRPC `admiredProfiles.list`
  - [ ] Subtask 6.6: Display profile cards in grid layout (2-3 columns)

- [ ] Task 7: Add Profile dialog component (AC1)
  - [ ] Subtask 7.1: Create `apps/foundry-dashboard/src/components/settings/AddProfileDialog.tsx`
  - [ ] Subtask 7.2: Implement Radix Dialog primitive
  - [ ] Subtask 7.3: Add handle input field with @ prefix auto-formatting
  - [ ] Subtask 7.4: Add validation (format check, required field)
  - [ ] Subtask 7.5: Implement loading state during submission
  - [ ] Subtask 7.6: Show error toast for invalid handles
  - [ ] Subtask 7.7: Close dialog and show success toast on add

- [ ] Task 8: Profile Card component (AC4, AC5, AC6)
  - [ ] Subtask 8.1: Create `apps/foundry-dashboard/src/components/settings/AdmiredProfileCard.tsx`
  - [ ] Subtask 8.2: Display avatar (fetch from `avatar_url` or use placeholder)
  - [ ] Subtask 8.3: Display handle, follower count, post count
  - [ ] Subtask 8.4: Display last synced with relative time formatting
  - [ ] Subtask 8.5: Implement status indicator (checkmark, spinner, error icon)
  - [ ] Subtask 8.6: Add re-sync button with loading state
  - [ ] Subtask 8.7: Add remove button with confirmation dialog
  - [ ] Subtask 8.8: Show progress bar during syncing state

- [ ] Task 9: Real-time sync progress (AC2, AC5)
  - [ ] Subtask 9.1: Implement polling mechanism (every 2 seconds while `status: 'syncing'`)
  - [ ] Subtask 9.2: Update profile card with latest `post_count` and `status`
  - [ ] Subtask 9.3: Transition card to `active` state on completion
  - [ ] Subtask 9.4: Show error state with retry button on failure

- [ ] Task 10: Testing (All ACs)
  - [ ] Subtask 10.1: Unit test Instagram scraper with mock Apify responses
  - [ ] Subtask 10.2: Unit test error handling (private profile, invalid handle, rate limit)
  - [ ] Subtask 10.3: Unit test Vectorize ingestion pipeline
  - [ ] Subtask 10.4: Unit test tRPC procedures (add, remove, resync, list)
  - [ ] Subtask 10.5: E2E test add admired profile flow
  - [ ] Subtask 10.6: E2E test remove profile with confirmation
  - [ ] Subtask 10.7: E2E test re-sync manual trigger
  - [ ] Subtask 10.8: Visual regression test for profile card states
  - [ ] Subtask 10.9: Integration test: add profile → verify G7 weighting updates

## Dev Notes

### Architecture Patterns

**Multi-Tenant Isolation (Rule 1):**
- Admired profiles scoped by `client_id` (never cross-contaminate)
- Vectorize namespace per client: `client_{id}_admired`
- All queries MUST filter by `client_id`

**Background Job Processing:**
- Instagram scraping runs asynchronously via Cloudflare Queues
- Prevents blocking UI during 30-60 second scrape operations
- Progress tracked in database for real-time UI updates

**Performance Budget (Rule 2):**
- Initial profile add: < 200ms (just DB insert + enqueue)
- Full scrape completion: 30-60 seconds (background)
- Profile list load: < 500ms
- Re-sync trigger: < 200ms (enqueue only)

### File Paths

**Backend (foundry-engine):**
```
apps/foundry-engine/src/
├── scrapers/
│   └── instagram-scraper.ts          [NEW - Apify integration]
├── vectorize/
│   └── admired-profiles-sync.ts      [NEW - embedding pipeline]
├── queues/
│   └── profile-sync-consumer.ts      [NEW - background jobs]
├── cron/
│   └── weekly-resync.ts              [NEW - auto-resync cron]
└── db/
    └── migrations/
        └── 2026-01-19-admired-profiles-table.sql [NEW]
```

**Frontend (foundry-dashboard):**
```
apps/foundry-dashboard/src/
├── routes/settings/
│   └── admired-profiles.tsx          [NEW - settings page]
├── components/settings/
│   ├── AdmiredProfileCard.tsx        [NEW - profile display]
│   ├── AddProfileDialog.tsx          [NEW - add dialog]
│   └── EmptyProfilesState.tsx        [NEW - empty state]
├── server/routers/
│   └── admired-profiles.ts           [NEW - tRPC CRUD]
└── lib/
    └── format-relative-time.ts       [NEW - utility for "2 days ago"]
```

### Instagram Scraper Options

**Recommended: Apify Instagram Scraper**
- Service: https://apify.com/apify/instagram-profile-scraper
- Cost: $49/month (includes 10k API calls)
- Reliability: High (handles rate limits, rotating proxies)
- API: RESTful, returns JSON
- Implementation time: ~2 days

**Alternative: Puppeteer (if budget constrained)**
- Cost: Free (uses Cloudflare Browser Rendering)
- Reliability: Medium (rate limit risk)
- Implementation time: ~5 days (more complex error handling)

**Decision:** Use Apify for MVP to reduce technical risk.

### Apify Configuration

**Environment Variable:**
- `APIFY_API_KEY` - Set via `wrangler secret put APIFY_API_KEY --env stage`

**Account Setup:**
1. Sign up at https://apify.com
2. Navigate to Settings → Integrations → API
3. Copy Personal API token
4. Store in Cloudflare Workers secrets

**Dev Testing:** Use Apify free tier (5k API calls/month) for development

### Database Migration Commands

**Execute migrations:**
```bash
cd apps/foundry-dashboard
npx wrangler d1 execute foundry-global-stage --remote --command "$(cat apps/foundry-engine/src/db/migrations/2026-01-19-admired-profiles-table.sql)"
```

**Verify migration:**
```bash
npx wrangler d1 execute foundry-global-stage --remote --command "PRAGMA table_info(admired_profiles);"
```

**Fallback:** If wrangler fails with auth error (API token lacks D1 permissions), run SQL in Cloudflare Dashboard → D1 → foundry-global-stage → Console.

### Data Requirements

**Instagram API Considerations:**
- Instagram Graph API requires app approval (2-4 week process) - NOT viable for MVP
- Apify uses web scraping (legal for public profiles under US law)
- Rate limits: ~60 requests/hour per IP (Apify handles this)

**Scraping Targets:**
- Top 50 posts ranked by: (likes + comments) / followers
- Data extracted: caption, likes, comments, timestamp, post URL
- **Hook extraction:** Use same logic as Story 4.6 (`apps/foundry-engine/src/agents/critic/g7-scorer.ts#extractHook`)
  - Prevents duplicate implementations
  - Ensures consistency between baseline and admired hooks
  - Pattern: First 1-2 sentences split by `/[.!?]/` regex

### Cron Schedule

**Weekly Auto-Resync:**
- Runs: Sunday at 00:00 UTC
- Target: Profiles where `last_synced < NOW() - 7 days`
- Batch size: 100 profiles per run (prevent overload)
- Failure handling: Retry failed profiles next Sunday

### Testing Standards

**Testing Dependencies:**
- **Story 4.6 tests MUST pass first** (G7 scoring baseline)
- Story 4.7 tests verify hybrid weighting integration
- **Integration Test:** Add profile → verify G7 source changes from "100% baseline" to "50% admired, 50% baseline"
  - Requires Story 4.6 G7 scorer to be implemented

**Unit Tests (Vitest):**
- Mock Apify API responses (success, private profile, invalid handle)
- Test Vectorize ingestion with mock embeddings
- Test tRPC procedures with mock DB

**E2E Tests (Playwright):**
- Add profile → wait for sync → verify "active" status
- Remove profile → verify confirmation → verify deletion
- Re-sync → verify progress updates
- **Integration:** Add profile → verify G7 weighting callout updates

**Test Priority:** P0 (Critical for G7 personalization)

### UX Considerations

**Loading States:**
- Add profile: Immediate feedback ("Finding profile...")
- Syncing: Animated progress with post count updates
- Error: Clear messaging with actionable retry

**Midnight Command Design:**
- Background: `#0F1419`
- Surface: `#1A1F26`
- Border: `#2A3038`
- Text Primary: `#E7E9EA`
- Success: `#00D26A` (active status)
- Error: `#F4212E` (error states)
- Action: `#1D9BF0` (re-sync button)

**No playful elements** - professional, data-focused UI.

### Vectorize Namespace Constants

**Recommendation:** Use shared namespace constants from Story 4.6 implementation

```typescript
import { VECTORIZE_NAMESPACES } from '../vectorize/namespaces';

// Usage in admired profiles sync
const namespace = VECTORIZE_NAMESPACES.admiredProfiles(clientId);
```

**Benefits:**
- Consistent with Story 4.6 baseline namespace pattern
- Prevents namespace mismatch between hybrid scoring tiers
- DRY principle applied

### Project Structure Notes

**Alignment with project-context.md:**
- ✅ Follows Multi-Tenant Isolation (Rule 1)
- ✅ Meets Performance Budget (Rule 2)
- ✅ Uses Midnight Command tokens (Rule 3)
- ✅ Integrates with Adversarial Logic via G7 (Rule 4)

**No conflicts detected.**

### References

- [Source: _bmad-output/prd.md#Stateful-Competitive-Moat]
- [Source: _bmad-output/epics.md#Epic-4-Story-4.6]
- [Source: project-context.md#Rule-1-Isolation]
- [Source: Story 4.6 AC1 - Hybrid Scoring Logic]

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_
