# Epic: Sprint 2 — Polish & UX Improvements

**Priority:** HIGH  
**Goal:** Fix remaining UX issues that make the product feel unfinished  
**Status:** Sprint 1 complete (74/74 tests passing), ready for Sprint 2  

---

## Story S2-1: Fix Hub List Spoke Count Display (P2)

**As a** user, **I want to** see accurate spoke counts on hub cards **so that** I know what content has been generated.

### Context
Hub list shows "0 spokes" for all hubs even when spokes exist. The `spoke_count` column in D1 `hubs` table is never updated after spoke generation completes. Users see empty numbers instead of "24 spokes generated" etc.

### Root Cause
Spoke generation happens in Durable Objects (SQLite) but hub metadata lives in D1. After spoke generation completes, the count isn't synced back to D1.

### Acceptance Criteria
- [ ] AC1: Hub cards display actual spoke count (e.g., "24 spokes", "12 spokes")
- [ ] AC2: Spoke count updates in real-time as spokes are generated
- [ ] AC3: Zero-spoke hubs show "0 spokes" (not blank)
- [ ] AC4: Hub list loads in <3s even with accurate counts

---

## Story S2-2: Replace Hardcoded Zero-Edit Rate (P2)

**As a** user, **I want to** see my actual content performance metrics **so that** I can track improvement over time.

### Context
Dashboard hardcodes "85% Zero-Edit Rate" for all users. New accounts with no content still show this fake metric. Should show real zero-edit rate based on spoke approval patterns, or "No data yet" for empty accounts.

### Acceptance Criteria
- [ ] AC1: New accounts show "No data yet" for zero-edit rate
- [ ] AC2: Accounts with <10 spokes show "Insufficient data"
- [ ] AC3: Accounts with 10+ spokes show calculated zero-edit rate
- [ ] AC4: Zero-edit calculation: (approved without edits) / (total approved) * 100%

---

## Story S2-3: Replace Placeholder Pillar Supporting Points (P2)

**As a** user, **I want to** see actual supporting evidence for each pillar **so that** I understand why the AI chose these themes.

### Context
Pillars show placeholder text like "Primary supporting evidence" instead of actual extracted evidence from the source content. This makes the AI extraction feel fake/unfinished.

### Acceptance Criteria
- [ ] AC1: Each pillar shows 2-3 actual quotes/evidence from source content
- [ ] AC2: Evidence is relevant to the pillar theme
- [ ] AC3: Evidence is properly formatted and readable
- [ ] AC4: No placeholder text visible in production

---

## Story S2-4: Fix Hub Creation Success State (P1)

**As a** user, **I want to** see clear confirmation when my hub is created **so that** I know what to do next.

### Context
Hub creation completes successfully but the success state doesn't show the "View Hub" button. Users see "⚠️ Success indicator not visible, but no error either" in test output.

### Acceptance Criteria
- [ ] AC1: Success screen shows "Hub Created!" message
- [ ] AC2: "View Hub" button is visible and clickable
- [ ] AC3: "Start Generation" button available as alternative action
- [ ] AC4: Success state renders within 3s of hub creation

---

## Story S2-5: Fix First User Role Assignment (P1)

**As a** the first user to sign up, **I want to** have full access to manage my account **so that** I can set up clients and team members.

### Context
First user gets "Creator" role instead of "agency_owner". This means they can't access Clients, Settings, or Review pages. The account owner should get full permissions by default.

### Acceptance Criteria
- [ ] AC1: First signup gets "agency_owner" role automatically
- [ ] AC2: Subsequent signups get appropriate role based on invitation
- [ ] AC3: Agency owners can access all nav items (Clients, Settings, Review)
- [ ] AC4: Role assignment logic is documented in code

---

## Definition of Done
- All stories implemented and tested against staging
- No regressions in existing E2E test suite (74+ passing)
- User can complete end-to-end journey without confusion
- All placeholder/fake content replaced with real data
- Deploy to staging and verify manually before marking complete