# Epic: Sprint 1 — Demo Readiness

**Priority:** CRITICAL
**Goal:** Fix all P0 blockers so the product is presentable
**Deadline:** Before next week's presentation
**Source:** Staging audit 2025-01-30 (108 Playwright tests, 8 failures)

---

## Story S1-1: Fix Hub Creation Flow (P0)

**As a** user, **I want to** create a hub through the wizard **so that** I can generate content.

### Context
Hub creation E2E test hangs indefinitely after login. The wizard either doesn't load, gets stuck on a step, or an API call never resolves. This is the #1 demo flow.

### Acceptance Criteria
- [ ] AC1: User can navigate to hub creation from dashboard
- [ ] AC2: All wizard steps render and advance correctly
- [ ] AC3: Hub is created and visible in hub list after completion
- [ ] AC4: No step takes more than 10 seconds to load
- [ ] AC5: E2E test `hub-creation-flow.spec.ts` passes against staging

### Investigation Notes
- Check wizard step routing (TanStack Router)
- Check API calls at each step (tRPC mutations)
- Check if Durable Object calls are timing out
- Test manually via Playwright step-by-step to isolate which step hangs

---

## Story S1-2: Fix Sidebar Navigation (P0)

**As a** user, **I want to** see all nav items in the sidebar and click them to navigate **so that** I can use the app.

### Context
Two failures:
1. Sidebar missing required navigation items
2. Navigation links don't route to correct pages (60s timeout)

### Acceptance Criteria
- [ ] AC1: Sidebar shows all required nav items: Dashboard, Hubs, Review, Exports, Settings (minimum)
- [ ] AC2: Each nav item routes to its correct page within 3 seconds
- [ ] AC3: Active nav item is visually highlighted
- [ ] AC4: E2E tests `story-1.3-dashboard-shell.spec.ts:68` and `:78` pass

### Investigation Notes
- Check sidebar component for conditional rendering (auth state, feature flags)
- Check route definitions match sidebar links
- May be a hydration or lazy-loading issue causing timeout

---

## Story S1-3: Fix Edit Spoke Modal (P0)

**As a** user, **I want to** click Edit on a spoke to open the edit modal **so that** I can modify generated content.

### Context
Two failures:
1. Edit Spoke button doesn't open modal
2. 'E' keyboard shortcut doesn't open modal

### Acceptance Criteria
- [ ] AC1: Clicking Edit button on a spoke opens the edit modal
- [ ] AC2: Modal contains the spoke content pre-filled
- [ ] AC3: 'E' keyboard shortcut opens edit modal when a spoke is selected
- [ ] AC4: E2E tests `bug-regression.spec.ts:183` and `:209` pass

### Investigation Notes
- Check if modal component is imported/rendered
- Check click handler binding
- Check keyboard event listener registration

---

## Story S1-4: Fix Login Error Message for Invalid Email (P1)

**As a** user, **I want to** see an error message when I enter a wrong email **so that** I know what went wrong.

### Context
Entering a non-existent email shows no error (or it takes too long to appear). Valid password errors work fine.

### Acceptance Criteria
- [ ] AC1: Entering non-existent email + any password shows error within 3 seconds
- [ ] AC2: Error message is generic (doesn't reveal whether email exists) for security
- [ ] AC3: Form stays on login page after error
- [ ] AC4: E2E test `story-1.2-better-auth-oauth.spec.ts:154` passes

### Investigation Notes
- Check Better Auth error response for non-existent emails
- May return different status/shape than invalid password
- Frontend may not handle this specific error case

---

## Story S1-5: Fix Share Link Modal (P1)

**As a** user, **I want to** generate a shareable review link **so that** I can share content with clients.

### Context
Share link modal either doesn't open or hangs during link generation (60s timeout).

### Acceptance Criteria
- [ ] AC1: Share button opens modal
- [ ] AC2: Modal generates a link within 5 seconds
- [ ] AC3: Link is copyable
- [ ] AC4: E2E test `bug-regression.spec.ts:331` passes

---

## Story S1-6: Fix Export Error Feedback (P1)

**As a** user, **I want to** see an error message when export creation fails **so that** I know what went wrong.

### Acceptance Criteria
- [ ] AC1: Failed export shows error toast/message within 3 seconds
- [ ] AC2: Error message describes what went wrong
- [ ] AC3: E2E test `bug-regression.spec.ts:261` passes

---

## Definition of Done
- All 6 stories pass their E2E tests against staging
- Full test suite (108 tests) regression: no new failures
- Deploy to staging via `npm run build && wrangler deploy -e stage`
- PM (Molty) verifies via Playwright before marking complete
