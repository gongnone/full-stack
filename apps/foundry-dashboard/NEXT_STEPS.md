# Foundry Dashboard - Next Steps & Roadmap

**Current Status:** ✅ Foundation Complete (Auth + tRPC + Database)

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│ Foundry Dashboard (Current Project)         │
│  - UI/UX Layer                              │
│  - Authentication & Authorization           │
│  - Client Management                        │
│  - Content Orchestration                    │
└──────────────┬──────────────────────────────┘
               │ Service Binding
               ▼
┌─────────────────────────────────────────────┐
│ Foundry Engine (External Service)           │
│  - Content Processing                       │
│  - Hub Ingestion Workflows                  │
│  - Spoke Generation                         │
│  - Brand DNA Calibration                    │
└─────────────────────────────────────────────┘
```

## Phase 1: Core Data Models ⏳

**Priority:** HIGH
**Estimated Time:** 2-3 days

### 1.1 Database Schema Design

Create migration: `migrations/0002_foundry_business_schema.sql`

**Tables Needed:**
- `clients` - Client organizations (name, status, created_at, etc.)
- `hubs` - Content hubs (client_id, source_type, status, etc.)
- `spokes` - Generated content pieces
- `pillars` - Hub content themes/topics
- `brand_dna` - Client brand voice and tone data
- `review_queue` - Content awaiting approval
- `analytics_events` - Usage tracking

**Design Questions:**
- What data lives in D1 vs. Durable Objects?
- Do we store full content in D1 or just metadata?
- How do we handle relationships between hubs and spokes?

### 1.2 Apply Schema

```bash
pnpm wrangler d1 execute foundry-global --local --file=migrations/0002_foundry_business_schema.sql
pnpm wrangler d1 execute foundry-global --remote --file=migrations/0002_foundry_business_schema.sql
```

## Phase 2: Backend Implementation 🔧

**Priority:** HIGH
**Estimated Time:** 1-2 weeks

### 2.1 Clients Router Implementation

**File:** `worker/trpc/routers/clients.ts`

**TODO Tasks:**
- ✅ `list()` - Query D1 clients table (stub exists)
- ⬜ `create()` - Provision client with Durable Object + Vectorize + R2
- ⬜ `switch()` - Hydrate Durable Object for client context
- ⬜ `getDNAReport()` - Fetch Brand DNA from Durable Object

**Considerations:**
- Durable Object provisioning strategy
- R2 bucket organization (per-client prefixes)
- Vectorize namespace creation
- Error handling for external service calls

### 2.2 Hubs Router Implementation

**File:** `worker/trpc/routers/hubs.ts`

**TODO Tasks:**
- ⬜ `create()` - Store source in R2, trigger HubIngestionWorkflow
- ⬜ `list()` - Query D1 hub_registry + Durable Object
- ⬜ `get()` - Fetch hub with pillars and spoke counts
- ⬜ `kill()` - Execute kill chain via Durable Object
- ⬜ `getProgress()` - Query workflow status

**Integration Points:**
- R2 for source material storage
- CONTENT_ENGINE service for workflows
- Durable Objects for hub state

### 2.3 Additional Routers

**Files:** `spokes.ts`, `review.ts`, `calibration.ts`, `analytics.ts`, `exports.ts`

Each router has similar TODO patterns:
- Replace stub implementations with real D1 queries
- Integrate with CONTENT_ENGINE service
- Add proper error handling and validation

## Phase 3: Content Engine Integration 🔗

**Priority:** HIGH
**Estimated Time:** 3-5 days

### 3.1 Service Binding Setup

**Questions:**
- Does `foundry-engine` already exist?
- What's the API contract between dashboard and engine?
- How do we handle async workflows?

**Tasks:**
- ⬜ Define service-to-service API contract
- ⬜ Implement Hub Ingestion Workflow trigger
- ⬜ Set up workflow status polling
- ⬜ Handle workflow callbacks/webhooks

### 3.2 Durable Objects Strategy

**Design Decisions:**
- One Durable Object per client?
- What state lives in DO vs D1?
- How do we handle DO migrations?

## Phase 4: Frontend Features 🎨

**Priority:** MEDIUM
**Estimated Time:** 1-2 weeks

### 4.1 Client Management UI

**New Routes:**
- `/app/clients` - List all clients
- `/app/clients/new` - Create new client form
- `/app/clients/[id]` - Client detail page

**Components:**
- Client list with status badges
- Client creation form with validation
- Client switcher dropdown

### 4.2 Hub Management UI

**New Routes:**
- `/app/hubs` - List all hubs for current client
- `/app/hubs/new` - Hub creation form (upload PDF, URL, etc.)
- `/app/hubs/[id]` - Hub detail with pillars and spokes

**Components:**
- File upload for PDF sources
- URL input for web sources
- Hub status indicator (processing, ready, killed)
- Progress bar for ingestion workflow

### 4.3 Content Review Interface

**New Routes:**
- `/app/review` - Review queue
- `/app/review/[id]` - Review detail with approve/reject

**Components:**
- Review queue with filters
- Content preview/editor
- Approve/reject workflow

### 4.4 Brand DNA Calibration

**New Routes:**
- `/app/calibration` - Brand DNA dashboard
- `/app/calibration/tone` - Tone profile editor
- `/app/calibration/voice` - Voice markers configuration

**Components:**
- Tone profile visualization
- Voice marker management
- Banned words editor
- Signature pattern analyzer

## Phase 5: Testing Infrastructure 🧪

**Priority:** MEDIUM
**Estimated Time:** 3-5 days

### 5.1 Unit Tests

**Framework:** Vitest

```bash
pnpm add -D vitest @vitest/ui
```

**Test Coverage:**
- tRPC router procedures
- Authentication middleware
- Business logic functions
- Data transformations

### 5.2 E2E Tests

**Framework:** Playwright (already installed ✅)

**Test Suites:**
- Authentication flows (sign up, login, logout)
- Client management CRUD
- Hub creation and processing
- Content review workflow
- Brand DNA calibration

### 5.3 Integration Tests

**Areas:**
- D1 database operations
- CONTENT_ENGINE service calls
- Durable Object interactions
- R2 file operations

## Phase 6: DevOps & Deployment 🚀

**Priority:** LOW (after MVP features)
**Estimated Time:** 2-3 days

### 6.1 CI/CD Pipeline

**Platform:** GitHub Actions

**Workflows:**
- Run tests on PR
- Type checking
- Build verification
- Automated staging deploys
- Manual production deploys

### 6.2 Environment Management

**Environments:**
- ✅ Local (development)
- ✅ Stage (foundry-stage.williamjshaw.ca)
- ✅ Production (foundry.williamjshaw.ca)

**Tasks:**
- ⬜ Environment-specific secrets
- ⬜ Database migration strategy
- ⬜ Rollback procedures

### 6.3 Monitoring & Observability

**Tools:**
- Cloudflare Analytics (built-in)
- Sentry for error tracking
- Custom logging with structured data

## Phase 7: Polish & Optimization 💅

**Priority:** LOW (continuous improvement)

### 7.1 Performance

- Implement request caching
- Optimize database queries
- Add CDN for static assets
- Lazy load dashboard components

### 7.2 UX Improvements

- Loading states and skeletons
- Error boundaries with retry
- Toast notifications
- Keyboard shortcuts
- Dark mode support

### 7.3 Security Hardening

- Rate limiting on auth endpoints
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF tokens for mutations

## Immediate Next Actions 🎯

### Option A: Start with Data (Recommended)

**Best if:** You want to solidify the architecture before building features

1. Design complete database schema
2. Write migration SQL
3. Apply to local and remote
4. Update TypeScript types
5. Implement one full router (e.g., `clients`)
6. Build corresponding UI

**Pros:** Solid foundation, fewer refactors later
**Cons:** Takes time before visible progress

### Option B: Feature-First Approach

**Best if:** You want to see working features quickly

1. Pick one feature (e.g., "Create Client")
2. Implement minimal database schema for that feature
3. Build backend tRPC procedure
4. Build frontend UI
5. Test end-to-end
6. Repeat for next feature

**Pros:** Rapid visible progress, learn by doing
**Cons:** May require refactoring as system grows

### Option C: Content Engine Integration

**Best if:** The content engine already exists and is ready

1. Document CONTENT_ENGINE API contract
2. Implement service-to-service communication
3. Test hub ingestion workflow
4. Build UI for triggering workflows
5. Add progress tracking

**Pros:** Unlocks core value proposition
**Cons:** Depends on external service readiness

## Key Decisions Needed 🤔

Before proceeding, clarify:

1. **Does `foundry-engine` service already exist?**
   - If yes: What's the API contract?
   - If no: Should we build it or focus on dashboard-only features?

2. **What data architecture do we want?**
   - D1 for everything?
   - Durable Objects for stateful operations?
   - R2 for file storage?
   - Vectorize for semantic search?

3. **What's the MVP feature set?**
   - Client management only?
   - Full hub/spoke workflow?
   - Review and calibration included?

4. **What's the timeline and priority?**
   - Ship basic features fast?
   - Build complete system properly?

## Recommended Path Forward 🛣️

**Week 1-2:**
1. Design and apply database schema
2. Implement `clients` router fully
3. Build client management UI
4. E2E test client CRUD operations

**Week 3-4:**
5. Implement `hubs` router with CONTENT_ENGINE integration
6. Build hub creation UI
7. Test hub workflow end-to-end

**Week 5+:**
8. Add review, calibration, analytics features incrementally
9. Polish UI/UX
10. Harden security and performance

---

## Questions for You 💭

1. Does the `foundry-engine` service exist? What does it do?
2. What's your top priority feature to build next?
3. Do you prefer Option A (data-first) or Option B (feature-first)?
4. What's your target timeline for an MVP?
5. Are you building this solo or with a team?

Let me know your preferences and I'll help you start on the right path! 🚀
