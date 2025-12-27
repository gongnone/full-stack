# Story 7.2: RBAC & Team Assignment

**Status:** done
**Story Points:** 5
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As an **Agency Owner**,
I want **to assign team members to specific clients with appropriate roles**,
So that **I can control access and responsibilities**.

## Acceptance Criteria

### AC1: Team Member Assignment
**Given** I am on a client's settings page
**When** I click "Add Member" and enter a user's email and role
**Then** the user is granted access to that client's context
**And** the membership is stored in `client_members` table

### AC2: RBAC Role Support
**Given** I am assigning a role
**When** I select a role
**Then** I can choose from:
- `agency_owner`: Full access, billing, and team management
- `account_manager`: Full access to client data and team management
- `creator`: Can generate content only
- `client_admin`: Review access and settings view
- `client_reviewer`: View and approve/reject only

### AC3: Automatic Ownership on Creation
**Given** I create a new client
**When** the client is created
**Then** I am automatically assigned as the `agency_owner` for that client

### AC4: API Permission Enforcement
**Given** a team member makes an API request
**When** the request is processed
**Then** the system verifies the user has the required role for that operation

## Tasks / Subtasks

- [x] **Task 1: Database Schema**
  - [x] Create migration `0013_client_members.sql`
  - [x] Implement `client_members` table with role support
  - [x] Update Drizzle schema in `packages/data-ops/src/schema.ts`

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `clients.listMembers` query
  - [x] Implement `clients.addMember` mutation with permission checks
  - [x] Update `clients.create` to add the creator as `agency_owner`

- [x] **Task 3: Frontend UI**
  - [x] Create `/app/clients/$clientId/settings` route
  - [x] Implement Team Members table with role display
  - [x] Implement "Add Team Member" modal with role selection

## Implementation Notes

- **Role Mapping:**
  - `agency_owner` and `account_manager` have write access to team members.
  - Roles are enforced at the tRPC procedure level (in progress for all routers).
- **D1 Schema:**
  ```sql
  CREATE TABLE client_members (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
  );
  ```
