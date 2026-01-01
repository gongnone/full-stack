# Story 10.4: Mobile-First Client Approval Flow Implementation

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Status:** IMPLEMENTED
**Created:** 2026-01-01
**Lead:** @bmad-agent-bmm-dev

---

## 1. Summary

This document details the implementation of the client-facing approval flow for strategic brand pillars. This includes the client notification, the mobile-first review interface, and the backend logic to handle pillar approval.

This flow is critical for client buy-in and serves as the final gate before a brand strategy is locked for content generation.

## 2. Technical Implementation

### High-Level Architecture

The flow is composed of three main parts:
1.  **Email Notification:** A new email function is triggered by the `strategyAgent` to notify the client.
2.  **Frontend UI:** A new token-gated, mobile-first page in the `foundry-dashboard` application for the client to review and approve pillars.
3.  **Backend API:** New tRPC procedures to fetch pillar data and process the client's decision.

### Files Modified

| File Path | Change Description |
|-----------|--------------------|
| `apps/foundry-dashboard/src/routes/strategy.review.$token.tsx` | Created |
| `apps/foundry-dashboard/worker/trpc/routers/onboarding.ts` | Modified |
| `apps/foundry-dashboard/worker/email/index.ts` | Modified |
| `apps/foundry-dashboard/src/components/pillars/PillarCard.tsx` | Created |

### Implementation Details

**1. Client Notification (`email/index.ts`):**
- The `strategyAgent` from Story 10-3 is updated. After it successfully saves the pillar suggestions, it generates a unique, short-lived JWT `approval_token`.
- It then calls the new `sendStrategyReadyEmail` function.
- **`sendStrategyReadyEmail`**: This function was updated from a mock to a full implementation. It sends a branded email containing the token-gated `approvalUrl` (e.g., `https://.../strategy/review/[token]`) to the client's contact email.
- **`sendStrategyLockedEmail`**: A second new function is implemented to notify the agency owner when the client approves the pillars.

**2. Pillar Approval UI (`strategy.review.$token.tsx`):**
- A new public-facing route is created. It's designed mobile-first from the ground up.
- **Data Fetching:** On page load, the component extracts the `token` from the URL and uses a new tRPC query, `onboarding.getPillarSuggestionsByToken`, to fetch the data. The backend validates the JWT to ensure it's not expired and is for this specific purpose.
- **Component Design (`PillarCard.tsx`):**
    - A new reusable component `PillarCard.tsx` is created to display a single pillar.
    - Each card shows the pillar `name`, `framework` (styled as a badge, e.g., TEACH), and `rationale`.
    - Cards use an accordion or "read more" pattern to avoid overwhelming the user with text on a small screen.
- **Actions:**
    - A prominent "Approve & Lock Strategy" button is at the bottom of the page.
    - A secondary "Request Changes" button is also present. (The functionality for this button is handled in Story 10-5).
    - Clicking "Approve" calls the `onboarding.approvePillars` tRPC mutation.

**3. Backend Logic (`onboarding.ts`):**
- **`getPillarSuggestionsByToken` (Query):**
    - Takes a JWT `token`.
    - Validates the token and finds the corresponding `brand_pillar_suggestions` record.
    - Returns the `suggestions_data`.
- **`approvePillars` (Mutation):**
    - Takes a JWT `token`.
    - Validates the token and finds the record.
    - Updates the `status` of the `brand_pillar_suggestions` record to `approved`.
    - Triggers the `sendStrategyLockedEmail` notification to the agency owner, providing them with a link to the client's dashboard.
    - Returns a success message to the frontend, which then displays a confirmation view to the client.

### Code Snippet: Conceptual Approval Page Component

```typescript
// apps/foundry-dashboard/src/routes/strategy.review.$token.tsx

import { PillarCard } from '~/components/pillars/PillarCard';
import { trpc } from '~/utils/trpc';
import { useParams } from '@remix-run/react';

export default function PillarApprovalPage() {
  const { token } = useParams();
  const { data, isLoading } = trpc.onboarding.getPillarSuggestionsByToken.useQuery({ token });
  const approveMutation = trpc.onboarding.approvePillars.useMutation();

  if (isLoading) return <div>Loading strategy...</div>;
  if (!data) return <div>Invalid or expired link.</div>;
  
  const handleApprove = () => {
    approveMutation.mutate({ token });
  };

  if (approveMutation.isSuccess) {
    return <div>Thank you! Your strategy is locked.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">Review Your Brand Strategy</h1>
      <p className="text-muted-foreground mb-6">Approve these pillars to start content generation.</p>
      
      <div className="space-y-4">
        {data.suggestions.map(pillar => (
          <PillarCard key={pillar.name} pillar={pillar} />
        ))}
      </div>

      <button onClick={handleApprove} disabled={approveMutation.isLoading}>
        {approveMutation.isLoading ? 'Approving...' : 'Approve & Lock Strategy'}
      </button>
    </div>
  );
}
```

## 3. Security Considerations

- The approval flow is protected using a short-lived (e.g., 72 hours), single-purpose JWT. The JWT contains the `clientId` and `suggestionId` to prevent replay attacks or misuse.
- The backend tRPC procedures are responsible for all JWT validation and state changes, ensuring the client cannot manipulate the approval process.

---
**END OF ARTIFACT**
