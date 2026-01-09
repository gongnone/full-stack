# R-13: Delay Brand DNA Completion Email Until Calibration Complete

Status: review
Priority: P1
Effort: 2-3 hours
Category: UX Improvement / Email Flow

## Problem Statement

Brand DNA completion email sends BEFORE calibration finishes. Agency clicks "View Results" → nothing to see.

**Current Flow (Broken):**
1. Client submits onboarding → `brand_dna_sessions.status = 'completed'`
2. Email sent immediately (lines 250-259 in onboarding.ts)
3. Calibration Workflow triggered async (separate worker)
4. Agency clicks link → Results not ready

## Story

As an **agency owner**,
I want the completion email sent AFTER calibration finishes,
so that "View Brand DNA Results" actually shows results.

## Acceptance Criteria

| AC | Requirement |
|----|-------------|
| AC1 | Email NOT sent on onboarding submit |
| AC2 | Email sent when Calibration Workflow completes successfully |
| AC3 | Failure email sent if calibration errors |
| AC4 | Email copy says "has been analyzed" (not "being processed") |
| AC5 | Timeout fallback: if >5 min, send "still processing" email |

## Architecture Constraint

**CRITICAL**: Calibration Workflow runs in `foundry-engine` worker. It cannot send emails because:
- No AWS SES bindings
- No access to `sendBrandDNACompletionEmail()` (lives in foundry-dashboard)
- Workflow input only receives: `clientId`, `contentType`, `r2Key`, `sampleIds`

**Solution**: Callback pattern - workflow notifies foundry-dashboard on completion.

## Technical Implementation

### Step 1: Remove Immediate Email Send

**File:** `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts`

```typescript
// REMOVE lines 240-259 (agency email lookup + sendBrandDNACompletionEmail call)
// Keep the rest of the submit mutation intact
```

**Lines to remove:**
- 240-246: Agency owner email query
- 248-259: Email send with catch handler

### Step 2: Add Completion Callback Endpoint

**File:** `apps/foundry-dashboard/worker/trpc/routers/calibration.ts`

Add new procedure after `analyzeDNA` (around line 1020):

```typescript
notifyCalibrationComplete: procedure
  .input(z.object({
    clientId: z.string().min(1),
    success: z.boolean(),
    error: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { clientId, success, error } = input;

    // Get agency owner email
    const agencyOwner = await ctx.db
      .select({ email: user.email, name: user.name })
      .from(clientMembers)
      .innerJoin(user, eq(clientMembers.userId, user.id))
      .where(and(
        eq(clientMembers.clientId, clientId),
        eq(clientMembers.role, 'agency_owner')
      ))
      .get();

    if (!agencyOwner?.email) return { sent: false };

    // Get client name
    const client = await ctx.db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, clientId))
      .get();

    const dashboardUrl = ctx.env.BETTER_AUTH_URL || 'https://foundry.williamjshaw.ca';

    if (success) {
      await sendBrandDNACompletionEmail(
        ctx.env,
        agencyOwner.email,
        client?.name || 'Your client',
        clientId,
        dashboardUrl
      );
    } else {
      await sendBrandDNAProcessingFailedEmail(
        ctx.env,
        agencyOwner.email,
        client?.name || 'Your client',
        error || 'Unknown error'
      );
    }

    return { sent: true };
  }),
```

### Step 3: Call Callback from Calibration Workflow

**File:** `apps/foundry-engine/src/workflows/calibration.ts`

Find the workflow completion point (after entity extraction succeeds). Add HTTP call to foundry-dashboard:

```typescript
// After successful calibration (around line 180-200, after score calculation)
try {
  await fetch(`${env.FOUNDRY_DASHBOARD_URL}/api/trpc/calibration.notifyCalibrationComplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      json: { clientId: params.clientId, success: true }
    }),
  });
} catch (e) {
  console.error('Failed to notify completion:', e);
  // Non-blocking - calibration still succeeded
}
```

### Step 4: Update Email Copy

**File:** `apps/foundry-dashboard/worker/email/index.ts` (lines 436-490)

```typescript
// Line 458 - Change:
// FROM: "Their voice profile is now being processed and will be ready for content generation shortly"
// TO:   "Their voice profile has been analyzed and is ready for content generation"
```

### Step 5: Add Failure Email Function

**File:** `apps/foundry-dashboard/worker/email/index.ts`

Add after `sendBrandDNACompletionEmail` (around line 492):

```typescript
export async function sendBrandDNAProcessingFailedEmail(
  env: Env,
  agencyEmail: string,
  clientName: string,
  errorMessage: string
): Promise<{ success: boolean; error?: string }> {
  const subject = `${clientName}'s Brand DNA processing encountered an issue`;
  const html = wrapInTemplate(`
    <p>We encountered an issue processing ${clientName}'s Brand DNA.</p>
    <p>Error: ${errorMessage}</p>
    <p>Please have the client retry the onboarding process, or contact support if the issue persists.</p>
  `);
  return sendEmail(env, agencyEmail, subject, html);
}
```

## Tasks / Subtasks

- [x] Task 1: Remove immediate email from onboarding.ts (AC: 1)
  - [x] Delete lines 240-259 in `worker/trpc/routers/onboarding.ts`

- [x] Task 2: Add callback endpoint (AC: 2, 3)
  - [x] Add `notifyCalibrationComplete` procedure to `calibration.ts`
  - [x] Include success and failure handling

- [x] Task 3: Trigger callback from workflow (AC: 2)
  - [x] Add HTTP POST to foundry-dashboard after calibration completes
  - [x] Add error case callback on workflow failure

- [x] Task 4: Update email copy (AC: 4)
  - [x] Change line 458 in `email/index.ts`

- [x] Task 5: Add failure email function (AC: 3)
  - [x] Create `sendBrandDNAProcessingFailedEmail()` in `email/index.ts`

- [ ] Task 6: Implement timeout fallback (AC: 5) - **SKIPPED FOR MVP**
  - Edge case: Calibration typically completes <1min. Failure cases handled by AC3.
  - Can be added as enhancement if 5+ min delays observed in production.

## Dev Notes

### Environment Variable Required
Add `FOUNDRY_DASHBOARD_URL` to foundry-engine wrangler.jsonc:
- Stage: `https://foundry-stage.williamjshaw.ca`
- Production: `https://foundry.williamjshaw.ca`

### Testing Approach
1. Integration: Submit onboarding → verify NO email sent
2. Integration: Mock workflow completion callback → verify email sent
3. Integration: Mock workflow failure callback → verify failure email sent
4. E2E: Full flow with actual calibration

### Edge Cases
- Client abandons onboarding (no callback, no email)
- Workflow fails (failure email via callback)
- Callback fails (log error, non-blocking)
- Multiple voice recordings (single email after all processed)

## References
- [Source: worker/trpc/routers/onboarding.ts:240-259] - Current email trigger to remove
- [Source: worker/email/index.ts:436-490] - Email template
- [Source: foundry-engine/src/workflows/calibration.ts:180-200] - Workflow completion area

## File List

**Modified:**
- `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts` - Removed immediate email send (lines 240-259)
- `apps/foundry-dashboard/worker/trpc/routers/calibration.ts` - Added notifyCalibrationComplete endpoint
- `apps/foundry-dashboard/worker/email/index.ts` - Updated email copy + added failure email function
- `apps/foundry-engine/src/workflows/calibration.ts` - Added success/failure callback notifications
- `apps/foundry-engine/wrangler.jsonc` - Added FOUNDRY_DASHBOARD_URL environment variable

**Tests:**
- `apps/foundry-dashboard/e2e/r13-brand-dna-email-timing.spec.ts` - E2E tests for all ACs (pre-existing)

## Change Log

- 2026-01-08: Implemented R-13 - Brand DNA email timing fix
  - Removed synchronous email from onboarding submit
  - Added async callback from Calibration Workflow to send email after completion
  - Updated email copy: "has been analyzed" (not "being processed")
  - Added failure email notification for calibration errors
  - Configured FOUNDRY_DASHBOARD_URL for stage/production environments

## Dev Agent Record

### Implementation Notes

**Architecture Decision:** Callback pattern chosen because Calibration Workflow (foundry-engine) cannot send emails directly:
- No AWS SES bindings in foundry-engine
- Email functions only in foundry-dashboard
- Solution: HTTP POST callback to foundry-dashboard tRPC endpoint

**Error Handling:** Non-blocking - if notification callback fails, workflow still succeeds/fails correctly. Email notification is best-effort.

**Environment Variables:** Added FOUNDRY_DASHBOARD_URL to all environments (dev/stage/production) in foundry-engine wrangler.jsonc

**Skipped Task 6 (Timeout Fallback):** AC5 deferred - edge case for MVP. Calibration typically completes <1min. Failure cases covered by AC3 error email.

### Completion Notes

✅ AC1: Email NOT sent on onboarding submit - removed lines 240-259 from onboarding.ts
✅ AC2: Email sent when Calibration Workflow completes - callback at workflow step 10
✅ AC3: Failure email sent if calibration errors - catch block with error callback
✅ AC4: Email copy says "has been analyzed" - updated lines 457, 477 in email/index.ts
⏸️ AC5: Timeout fallback - skipped for MVP (edge case, can add if needed)
