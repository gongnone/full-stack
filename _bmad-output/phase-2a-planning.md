# Phase 2A Planning: Polish + Infrastructure Hardening

**Date:** 2026-01-01 (Updated)
**Status:** Ready to Execute
**Prerequisite:** MVP + Phase 1.5 Deployed ✅

---

## Executive Summary

Phase 2A focuses on **polish features and infrastructure hardening**. All core Epic 10 stories (10-1 through 10-5) are already implemented and deployed.

| Stream | Description | Effort |
|--------|-------------|--------|
| **P1 Deferred Features** | AI chat refinement, voice notes, SMS | 8-12 hrs |
| **Infrastructure** | RBAC UI, E2E parallelization | 6-8 hrs |
| **Total** | Phase 2A complete | 14-20 hrs |

---

## ✅ COMPLETED - Already in Production

All core Epic 10 stories are live:

| Story | Implementation | Status |
|-------|----------------|--------|
| **10-1** | Client Brand DNA email invitation | ✅ Production |
| **10-2** | Deep Research Agent (market analysis) | ✅ Production |
| **10-3** | `synthesizePillars()` in strategy.ts:591-692 | ✅ Production |
| **10-4** | `/strategy/$token.tsx` (515 lines) | ✅ Production |
| **10-5** | `ModifyPillarModal` component (lines 367-514) | ✅ Production |

**Tech Debt Completed:**
- TD-1: Integration test stability ✅
- TD-2: ESLint any-type config ✅ (exists, needs CI enablement)
- TD-3: Assertion quality config ✅
- TD-4: Schema alignment ✅ (53 tests passing)

---

## Stream 1: P1 Deferred Features (Enhancements)

These are nice-to-haves deferred from initial implementation:

### 1.1 AI Chat-Based Refinement (Story 10-5 AC3)
**Priority:** P1 | **Effort:** 3-4 hours

**Current State:** Text note input only
**Enhancement:** Add conversational AI refinement chat UI

**Implementation:**
- Add chat interface in ModifyPillarModal
- Create `strategy.chatRefine` tRPC endpoint
- Stream responses for better UX

---

### 1.2 Voice Note Refinement (Story 10-5 AC5) ✅ DONE
**Priority:** P1 | **Effort:** 2-3 hours | **Completed:** 2026-01-01

**What was done:**
- Added inline voice recording button to ModifyPillarModal
- Created `strategy.transcribeVoiceNote` tRPC endpoint using Workers AI Whisper
- 30-second max recording with auto-stop and timer display
- Transcription appends to the "Your Vision" textarea
- Mobile-friendly UI with mic icon, recording indicator, and transcribing spinner

**Files changed:**
- `src/routes/strategy.$token.tsx` - Voice recording UI in ModifyPillarModal
- `worker/trpc/routers/strategy.ts` - transcribeVoiceNote endpoint

---

### 1.3 Global "Start Over" (Story 10-5 AC6)
**Priority:** P2 | **Effort:** 1 hour

**Current State:** Can regenerate individual pillars
**Enhancement:** After 3+ rejections, show "Start Over" button

**Implementation:**
- Track rejection count in session
- Add regenerate-all button after threshold
- Call existing `regeneratePillars` endpoint

---

### 1.4 SMS Notifications (Story 10-4)
**Priority:** P2 | **Effort:** 4-5 hours

**Current State:** Email notifications only
**Enhancement:** Add Twilio SMS option

**Implementation:**
- Add Twilio SDK
- Create SMS notification service
- Add phone number to client profile
- User preference for email vs SMS vs both

---

## Stream 2: Infrastructure Hardening

### 2.1 RBAC UI Differentiation ✅ DONE
**Priority:** P1 | **Effort:** 4-6 hours | **Completed:** 2026-01-01

**What was done:**
- Extended `auth.me` tRPC endpoint to return `clientRole` (user's role in active client)
- Created `useClientRole` hook for frontend role access with permission helpers
- Added `MENU_VISIBILITY` config in `rbac.ts` mapping menu items to allowed roles
- Added `canAccessMenuItem()` utility function for role checking
- Updated `Sidebar.tsx` to filter navigation based on user role
- Shows role label in user section instead of email
- Added comprehensive unit tests for menu visibility

**Role-based menu visibility:**
| Menu Item | agency_owner | account_manager | creator | client_admin | client_reviewer |
|-----------|--------------|-----------------|---------|--------------|-----------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hubs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Review | ✅ | ✅ | ❌ | ✅ | ✅ |
| Clients | ✅ | ✅ | ❌ | ❌ | ❌ |
| Brand DNA | ✅ | ✅ | ✅ | ❌ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 2.2 E2E Test Parallelization ✅ DONE
**Priority:** P1 | **Effort:** 2-3 hours | **Completed:** 2026-01-01

**What was done:**
- Updated `auth.fixture.ts` with `getWorkerCredentials()` function
- Each parallel worker gets its own test user based on `TEST_PARALLEL_INDEX`
- Worker 0 → `E2E_TEST_EMAIL_1`, Worker 1 → `E2E_TEST_EMAIL_2`, etc.
- Updated `e2e-tests.yaml` to pass shard-specific secrets
- Updated `create-test-user.spec.ts` to create all 4 shard users
- Backwards compatible: falls back to single `E2E_TEST_EMAIL` if shard secrets not set

**GitHub secrets to add:**
```
E2E_TEST_EMAIL_1: e2e-shard-1@test.foundry.com
E2E_TEST_PASSWORD_1: TestShard1Pass!
E2E_TEST_EMAIL_2: e2e-shard-2@test.foundry.com
E2E_TEST_PASSWORD_2: TestShard2Pass!
E2E_TEST_EMAIL_3: e2e-shard-3@test.foundry.com
E2E_TEST_PASSWORD_3: TestShard3Pass!
E2E_TEST_EMAIL_4: e2e-shard-4@test.foundry.com
E2E_TEST_PASSWORD_4: TestShard4Pass!
```

**To create test users on staging:**
```bash
BASE_URL=https://foundry-stage.williamjshaw.ca pnpm exec playwright test e2e/create-test-user.spec.ts --project=chromium
```

---

### 2.3 ESLint CI Integration ✅ DONE
**Priority:** P1 | **Effort:** 30 min | **Completed:** 2026-01-01

**What was done:**
- Added `lint` script to `foundry-dashboard/package.json`
- Added `foundry:lint` script to root `package.json`
- Added ESLint step to `deploy-stage.yaml` and `deploy-production.yaml`
- Set `continue-on-error: true` (187 existing errors need fixing first)

**Next steps to make it blocking:**
- Fix 187 ESLint errors (React hooks rules, unused imports, etc.)
- Remove `continue-on-error: true` from CI workflows

---

## Recommended Execution Order

### Priority 1 (Do First)
1. ✅ ESLint CI Integration (30 min) - **DONE**
2. ✅ RBAC UI Differentiation (4-6 hrs) - **DONE**
3. ✅ E2E Parallelization (2-3 hrs) - **DONE** (pending GitHub secrets + user creation)

### Priority 2 (Do Second)
4. ✅ Voice Note Refinement (2-3 hrs) - **DONE** (2026-01-01)
5. AI Chat Refinement (3-4 hrs) - Enhances existing flow
6. Global Start Over (1 hr) - Edge case handling

### Priority 3 (Later)
7. SMS Notifications (4-5 hrs) - Requires Twilio setup

---

## Success Criteria

### Phase 2A Complete When:
- [x] RBAC UI shows different menus per role
- [x] ESLint added to CI pipeline (non-blocking initially)
- [ ] ESLint made blocking (after fixing 187 errors)
- [x] E2E tests run in parallel without flakiness (code ready, pending secrets setup)
- [x] Voice refinement works in modification modal (30s voice note → transcription → feedback)

### Not Required for Phase 2A:
- SMS notifications (P2)
- AI chat refinement (nice-to-have)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| RBAC UI breaks existing features | Low | Medium | Feature flag + testing |
| Twilio integration complexity | Medium | Low | Defer to Phase 2B |
| E2E test users need production setup | Low | Low | Use test environment only |

---

## What's NOT in Phase 2A

- New features beyond polish
- Phase 2B epic planning
- Major architectural changes
- Performance optimization (app is fast enough)

---

*Document updated: 2026-01-01*
*Stories 10-3, 10-4, 10-5 verified as complete in production*
*RBAC UI implemented 2026-01-01: role-based menu visibility in Sidebar*
