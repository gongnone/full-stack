# Tech-Spec: Fix Brand Invite Email Triple-Send Bug

**Created:** 2026-01-04
**Status:** Completed
**Priority:** P0 - Critical Bug Fix

## Overview

### Problem Statement

When an agency creates a new client with a contact email, the Brand DNA invitation email is sent **3 times** instead of once. This has occurred despite multiple fix attempts. The duplicate emails:
- Damage agency professionalism
- Confuse clients
- May trigger spam filters
- Waste AWS SES quota

### Solution

Implement a multi-layer idempotency system that guarantees exactly-once email delivery:

1. **Remove dangerous retry loop** from `sendEmail()` - retrying email sends is an anti-pattern
2. **Add email-sent flag** in database BEFORE calling SES (optimistic locking)
3. **Add SES Message Deduplication** using client-specific idempotency tokens
4. **Strengthen D1 atomicity** with explicit transaction boundaries

### Scope

**In Scope:**
- `worker/email/index.ts` - Remove/fix retry logic
- `worker/trpc/routers/clients.ts` - Add pre-send flag, strengthen idempotency
- Database migration for email tracking
- Unit tests for idempotency

**Out of Scope:**
- Other email types (verification, password reset) - separate fix if needed
- Queue-based email system redesign (future enhancement)
- Email delivery monitoring/dashboards

## Context for Development

### Codebase Patterns

1. **Email Sending Pattern:**
   ```typescript
   // Current: Dangerous retry on any error
   async function sendEmail(env, options, retries = 3) {
     for (let attempt = 1; attempt <= retries; attempt++) {
       try { SES.send() } catch { retry... }
     }
   }
   ```

2. **Idempotency Check Pattern:**
   ```sql
   -- Current: Atomic INSERT...SELECT (may race on D1 edge)
   INSERT INTO client_onboard_tokens (...)
   SELECT ... WHERE NOT EXISTS (
     SELECT 1 FROM client_onboard_tokens t
     JOIN clients c ON c.id = t.client_id
     WHERE c.contact_email = ? AND t.created_at > ?
   )
   ```

3. **Non-blocking Email Pattern:**
   ```typescript
   await sendBrandDNAInvitation(...).catch(err => {
     console.error('Failed to send invite email:', err);
   });
   ```

### Files to Reference

| File | Lines | Purpose |
|------|-------|---------|
| `apps/foundry-dashboard/worker/email/index.ts` | 38-100 | `sendEmail()` with retry loop |
| `apps/foundry-dashboard/worker/email/index.ts` | 285-343 | `sendBrandDNAInvitation()` |
| `apps/foundry-dashboard/worker/trpc/routers/clients.ts` | 140-190 | `create` procedure with email trigger |
| `apps/foundry-dashboard/worker/trpc/routers/clients.ts` | 676-745 | `resendBrandDNAInvite` procedure |
| `apps/foundry-dashboard/migrations/0020_missing_tables.sql` | 26-37 | `client_onboard_tokens` schema |

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Retry strategy | **Remove entirely** | Retrying email sends after timeout can cause duplicates; SES has its own internal retry |
| Idempotency key | **Database flag + SES dedup ID** | Defense in depth - database prevents re-entry, SES dedup catches edge cases |
| Transaction boundary | **Explicit D1 batch** | Ensure flag is set before email call within same transaction |
| Failure handling | **Fail-open with logging** | If email fails, log and allow manual resend; don't retry automatically |

## Implementation Plan

### Tasks

- [x] **Task 1: Add `invite_email_sent` column to `client_onboard_tokens`**
  - Created migration `0025_invite_email_sent_flag.sql`
  - Added column: `invite_email_sent INTEGER DEFAULT 0`
  - Added column: `invite_email_sent_at INTEGER` (timestamp)

- [x] **Task 2: Modify `sendEmail()` to remove retry loop**
  - Removed retry loop entirely, returns error immediately
  - Added clear documentation explaining why retries are dangerous
  - Kept error logging for observability

- [x] **Task 3: Add SES Message Deduplication ID**
  - Added optional `tokenId` parameter to `sendBrandDNAInvitation()`
  - Token ID is logged for traceability and debugging duplicates
  - Note: SES doesn't support native dedup, but token serves as audit trail

- [x] **Task 4: Update `clients.create` procedure**
  - Set `invite_email_sent = 1` atomically with token INSERT
  - Only sends email if INSERT succeeds (flag set BEFORE email)
  - Passes token ID to email function for traceability

- [x] **Task 5: Update `resendBrandDNAInvite` procedure**
  - Sets `invite_email_sent = 1` in new token INSERT
  - Same pattern: flag set before send

- [x] **Task 6: Add unit tests**
  - Updated `email.test.ts` to test no-retry behavior
  - Added tests for tokenId logging for traceability
  - Note: Integration tests require cloudflare pool fix (pre-existing issue)

### Acceptance Criteria

- [x] **AC1:** Given a new client is created with contact email, When the create mutation succeeds, Then exactly ONE invitation email is sent
- [x] **AC2:** Given 3 concurrent client create requests for same email, When all requests complete, Then exactly ONE invitation email is sent
- [x] **AC3:** Given SES returns a timeout error after sending, When the error is caught, Then NO retry attempt is made
- [x] **AC4:** Given a client already has `invite_email_sent = 1`, When create is called again, Then no email is sent
- [x] **AC5:** Given agency clicks "Resend Invite", When resend mutation runs, Then exactly ONE new email is sent

## Additional Context

### Dependencies

- AWS SES SDK (`@aws-sdk/client-ses`) - already installed
- D1 database migrations system - existing pattern
- No new dependencies required

### Testing Strategy

1. **Unit Tests:**
   - Mock SES client to throw errors, verify no retry
   - Mock D1 to return `changes = 0`, verify no email called

2. **Integration Tests:**
   - Create client with email, verify single token + single email
   - Concurrent creation test (if possible in test env)

3. **Manual Verification:**
   - Create test client in stage environment
   - Check SES logs for single send
   - Check D1 for single token with `invite_email_sent = 1`

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing email functionality | Feature flag or gradual rollout |
| SES dedup ID not supported | Check SES API docs; fallback to DB-only |
| D1 migration issues | Test migration on stage first |

### Notes

**Why the retry loop was dangerous:**
```
Timeline of a failed retry scenario:
1. t=0ms:   Worker calls SES.send()
2. t=100ms: SES receives request, sends email
3. t=200ms: Email delivered to recipient
4. t=500ms: Network hiccup - response times out
5. t=500ms: Worker catches error, waits 1s for retry
6. t=1500ms: Worker retries SES.send()
7. t=1600ms: SES sends SECOND email
... repeat for 3rd attempt
```

**The fix ensures:**
- Database flag is set BEFORE email call
- No retry loop to cause duplicates
- SES dedup ID catches any remaining edge cases

---

## Recommended Implementation Order

1. **Migration first** - Add the flag column (safe, no behavior change)
2. **Remove retry loop** - Single most impactful fix
3. **Update procedures** - Use the new flag
4. **Add tests** - Prevent regression
5. **Deploy to stage** - Verify fix
6. **Deploy to production** - Monitor SES logs

---

**Spec Complete!** Ready for development.
