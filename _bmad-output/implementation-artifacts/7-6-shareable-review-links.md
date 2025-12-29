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

## Review Follow-ups (AI)

### Fixed Issues (2025-12-28)
- [x] [AI-Review][HIGH] Email case sensitivity bug - emails now normalized to lowercase on storage and validation
- [x] [AI-Review][LOW] Type safety - replaced `any` types with `ReviewSpoke` interface in review.$token.tsx
- [x] [AI-Review][MEDIUM] Frontend email validation - added regex validation and lowercase normalization
- [x] [AI-Review][MEDIUM] Dead code clarification - added comment explaining tRPC vs HTTP endpoint usage
- [x] [AI-Review][MEDIUM] Added backend tests for `generateShareableLink` and `validateShareableLink` [clients.test.ts]
- [x] [AI-Review][MEDIUM] Added integration tests for `/api/review/*` public endpoints [review-endpoints.test.ts]
- [x] [AI-Review][MEDIUM] E2E tests already existed and are comprehensive [story-7.6-shareable-review-links.spec.ts]
- [x] [AI-Review][LOW] Completed empty test stubs in ShareLinkModal.test.tsx
- [x] [AI-Review][HIGH] Fixed tRPC validateShareableLink to also use case-insensitive email comparison

## Dev Agent Record

### File List
| File | Change Type | Description |
|------|-------------|-------------|
| `apps/foundry-dashboard/migrations/0016_shareable_links.sql` | Added | Migration for shareable_links table |
| `apps/foundry-dashboard/worker/trpc/routers/clients.ts` | Modified | Added generateShareableLink, validateShareableLink procedures |
| `apps/foundry-dashboard/worker/hono/app.ts` | Modified | Added /api/review/* public endpoints for anonymous access |
| `apps/foundry-dashboard/src/routes/review.$token.tsx` | Added | Public review page with email gate |
| `apps/foundry-dashboard/src/components/clients/ShareLinkModal.tsx` | Added | Modal for generating shareable links |
| `apps/foundry-dashboard/src/components/clients/ShareLinkModal.test.tsx` | Modified | Unit tests for modal component - completed stubs |
| `apps/foundry-dashboard/worker/trpc/routers/__tests__/clients.test.ts` | Modified | Added tests for generateShareableLink, validateShareableLink |
| `apps/foundry-dashboard/worker/hono/__tests__/review-endpoints.test.ts` | Added | Integration tests for /api/review/* endpoints |
| `apps/foundry-dashboard/e2e/story-7.6-shareable-review-links.spec.ts` | Existing | Comprehensive E2E tests (already present) |

### Change Log
| Date | Author | Change |
|------|--------|--------|
| 2025-12-28 | AI Code Review | Fixed email case sensitivity, added type safety, updated story with File List |
| 2025-12-28 | AI Code Review | Added backend unit tests, integration tests, completed test stubs. All issues resolved. |

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
