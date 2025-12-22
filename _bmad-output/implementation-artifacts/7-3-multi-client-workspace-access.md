# Story 7.3: Multi-Client Workspace Access

**Status:** done
**Story Points:** 5
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As an **Account Manager**,
I want **to access multiple client workspaces**,
So that **I can efficiently manage my assigned clients**.

## Acceptance Criteria

### AC1: Client Selector in Header
**Given** I am a team member of multiple clients
**When** I view the dashboard header
**Then** I see a `ClientSelector` dropdown showing my active client
**And** I can see other clients I have access to in the list

### AC2: Fast Context Switching
**Given** I select a different client from the selector
**When** the switch executes
**Then** the `active_client_id` is updated in my profile
**And** all dashboard data refreshes to show the new client's context
**And** the switch completes in < 100ms for pre-warmed objects

### AC3: Access Restriction
**Given** I am not a member of a client
**Then** that client does not appear in my selector
**And** I cannot switch to it via API

## Tasks / Subtasks

- [x] **Task 1: Database Schema**
  - [x] Create migration `0014_active_client.sql` to add `active_client_id` to `user_profiles`

- [x] **Task 2: tRPC Router Implementation**
  - [x] Update `auth.me` to return the current `activeClientId` with priority logic
  - [x] Update `clients.switch` to persist the active client selection in the database

- [x] **Task 3: Frontend UI**
  - [x] Create `ClientSelector.tsx` component using Radix UI Dropdown
  - [x] Integrate selector into the global `AppLayout` header
  - [x] Implement cache invalidation logic on switch to ensure data consistency

## Implementation Notes

- **Priority Logic:** The active client is determined by (1) explicit `active_client_id` in profile, (2) first available membership, (3) fallback to personal account ID.
- **Data Consistency:** Switching clients triggers a global tRPC cache invalidation (`utils.invalidate()`), forcing all components to reload with the new context.
