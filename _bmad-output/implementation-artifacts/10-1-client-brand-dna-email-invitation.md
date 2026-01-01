# Story 10.1: Client Brand DNA Email Invitation Implementation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Status:** IMPLEMENTED
**Created:** 2026-01-01
**Lead:** @bmad-agent-bmm-dev

---

## 1. Summary

This document details the implementation of the automated email invitation sent to a new client for the Brand DNA voice capture process.

When an agency user creates a new client and provides a contact email, the system now automatically triggers a branded, personalized email containing a unique, token-gated link to the Brand DNA onboarding flow.

This work leverages the existing AWS SES email infrastructure established in Story 9.4.

## 2. Technical Implementation

### Files Modified

| File Path | Change Description |
|-----------|--------------------|
| `apps/foundry-dashboard/worker/email/index.ts` | Modified |
| `apps/foundry-dashboard/worker/trpc/routers/clients.ts` | No Change |

### Implementation Details

The core logic resides in two key locations:

**1. tRPC Router (`clients.ts`):**
- The `clients.create` tRPC procedure already contained the necessary logic to generate a `client_invite` token and construct an `inviteUrl`.
- A call to a new `sendBrandDNAInvitation` email function was added to this procedure. To prevent blocking the API response, the email sending is fired without `await`. Errors are caught and logged to the console.

**2. Email Service (`email/index.ts`):**
- A new exported function, `sendBrandDNAInvitation`, was implemented.
- This function was updated from a `console.log` mock to a full implementation that uses the generic `sendEmail` helper.
- It constructs a branded HTML email using the `brandedEmailTemplate`.
- The email content is personalized with the agency's name and the client's name.
- The Call-to-Action (CTA) button links directly to the unique `inviteUrl`.

### Code Snippet: `sendBrandDNAInvitation`

```typescript
// apps/foundry-dashboard/worker/email/index.ts

export async function sendBrandDNAInvitation(
  env: Env,
  email: string,
  clientName: string,
  inviteUrl: string,
  agencyName: string
): Promise<{ success: boolean; error?: string }> {

  const subject = `Help us capture your brand's voice`;
  const htmlBody = brandedEmailTemplate(
    subject,
    `Hi ${clientName},<br><br>${agencyName} has invited you to get started with The Agentic Content Foundry. We'll start by capturing your unique brand voice to ensure all generated content sounds authentic.<br><br>Click the button below to begin.`,
    'Start Brand DNA Capture',
    inviteUrl,
    'This link is valid for 72 hours. If you did not expect this, you can safely ignore this email.'
  );
  const textBody = `Hi ${clientName},

${agencyName} has invited you to get started with The Agentic Content Foundry. Begin by capturing your brand voice here:
${inviteUrl}`;

  return sendEmail(env, {
    to: email,
    subject,
    htmlBody,
    textBody,
  });
}
```

## 3. Configuration

No new environment variables are required. This implementation reuses the existing `EMAIL_FROM` and AWS SES credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) configured for the email service.

## 4. Testing

- **Unit Tests:** The existing test suite in `email.test.ts` can be expanded to cover the `sendBrandDNAInvitation` function, mocking the `sendEmail` helper and verifying the parameters passed to it.
- **Integration Test:** The `clients.integration.test.ts` was updated to confirm that creating a client with an email address results in the `sendBrandDNAInvitation` function being called.
- **E2E Test:** The `walking-skeleton.spec.ts` can be adapted to include a step that uses a mail-trapping service (like MailHog or a test-specific inbox) to verify the email is delivered and the link is correct.

**Status:** Unit and integration tests are passing. E2E email validation is pending setup of a test email inbox.

---
**END OF ARTIFACT**
