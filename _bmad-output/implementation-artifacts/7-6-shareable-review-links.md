# Story 7.6: Shareable Review Links

**Status:** done
**Story Points:** 5
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As an **Account Manager**,
I want **to generate secure links for client review**,
So that **clients can approve content without full system access**.

## Acceptance Criteria

### AC1: Generate Secure Link
**Given** I have content ready for review
**When** I trigger "Generate Shareable Link"
**Then** a unique, cryptographically secure token is generated
**And** the link is stored in `shareable_links` table with an expiration date

### AC2: Email Verification
**Given** a shareable link has an allowed email restriction
**When** a user clicks the link
**Then** they are prompted to enter their email
**And** access is granted only if the email matches the allowed list

### AC3: Anonymous Review Interface
**Given** a valid shareable link
**When** a client accesses it
**Then** they see a simplified, brand-aligned review interface
**And** they can view all `ready_for_review` spokes for their client context
**And** no system login is required

### AC4: Time-Limited Access
**Given** a shareable link has expired
**When** a client tries to access it
**Then** they see a "Link Expired" message and access is denied

## Tasks / Subtasks

- [x] **Task 1: Database Schema**
  - [x] Create migration `0016_shareable_links.sql`
  - [x] Implement `shareable_links` table with token, client_id, and expiration

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `clients.generateShareableLink` mutation
  - [x] Implement `clients.validateShareableLink` query with security checks

- [x] **Task 3: Frontend UI**
  - [x] Create `/review/$token` public route
  - [x] Implement email verification gate for anonymous users
  - [x] Implement simplified review dashboard with `ContentCard` components

## Implementation Notes

- **Security:** Links use 32-character hex tokens. Access is gated by email and expiration timestamp.
- **Proxy Pattern:** The review page uses the `validateShareableLink` query which proxies the content request to the specific client's Durable Object, maintaining data isolation.
- **D1 Schema:**
  ```sql
  CREATE TABLE shareable_links (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      permissions TEXT DEFAULT 'view',
      allowed_emails TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );
  ```
