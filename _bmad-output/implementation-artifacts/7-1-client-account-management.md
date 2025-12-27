# Story 7.1: Client Account Management

**Status:** done
**Story Points:** 5
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As an **Agency Owner**,
I want **to create and manage client accounts**,
So that **I can onboard new clients and organize my agency**.

## Acceptance Criteria

### AC1: Client Listing
**Given** I am an Agency Owner
**When** I navigate to `/app/clients`
**Then** I see a list of all client accounts with:
- Client name, logo placeholder
- Status (active/paused/archived)
- Industry

### AC2: Create Client with Isolation
**Given** I click "Add Client"
**When** I fill out the form (name, industry, contact email)
**Then** the client is created in D1 `clients` table
**And** a Durable Object instance is initialized for isolation
**And** the client appears in the list

### AC3: Client Archive (Soft Delete)
**Given** I want to archive a client
**When** I change status to `archived`
**Then** the client is hidden from active views but data is preserved in Durable Object

## Tasks / Subtasks

- [x] **Task 1: Database Schema**
  - [x] Create migration `0012_clients.sql`
  - [x] Implement `clients` table in D1 with full metadata
  - [x] Update Drizzle schema in `packages/data-ops/src/schema.ts`

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `clients.list` with status filtering
  - [x] Implement `clients.create` with Durable Object provisioning
  - [x] Implement `clients.switch` for context switching
  - [x] Implement `clients.getDNAReport`

- [x] **Task 3: Frontend UI**
  - [x] Update `/app/clients` route with actionable listing
  - [x] Implement "Add Client" modal using Radix UI Dialog
  - [x] Add mutation for client creation with optimistic updates (invalidate list)

- [x] **Task 4: Durable Object Integration**
  - [x] Ensure `CONTENT_ENGINE` RPC is used to initialize `ClientAgent` on creation

## Implementation Notes

- **Isolation:** Each client is identified by a UUID. The `ClientAgent` Durable Object is keyed by this UUID, ensuring physical data isolation.
- **Context Switching:** The `switch` procedure hydrates the target Durable Object, ensuring < 100ms switch time for pre-warmed objects.
- **D1 Schema:**
  ```sql
  CREATE TABLE clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL,
      industry TEXT,
      contact_email TEXT,
      logo_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
  );
  ```
