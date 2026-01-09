# R-14: Dedicated Client Brand DNA Results Page

Status: review
Priority: P2
Effort: 3-4 hours
Category: UX Improvement / Agency Dashboard
Depends On: R-13

## Problem Statement

Email "View Brand DNA Results" links to generic client page (`/app/clients/{id}`), not a detailed results view. Agency owners can't immediately see what was captured.

## Story

As an **agency owner**,
I want a dedicated page showing my client's full Brand DNA results,
so that I can immediately see what was captured and take next actions.

## Acceptance Criteria

| AC | Requirement |
|----|-------------|
| AC1 | Route `/app/clients/{clientId}/brand-dna` shows full DNA results |
| AC2 | Page displays: tone profile, voice markers, banned words, brand stances |
| AC3 | Strength score with visual progress indicators |
| AC4 | CTAs: "Create Hub", "Calibrate DNA", "Back to Client" |
| AC5 | Extraction metadata: capture date, sources (voice/content count) |
| AC6 | Email button links to this new page |
| AC7 | Processing state handled gracefully with auto-refresh |

## Technical Implementation

### Step 1: Create Route File

**File:** `apps/foundry-dashboard/src/routes/app/clients.$clientId.brand-dna.tsx`

Reference pattern from: `src/routes/app/clients.$clientId.settings.tsx`

```typescript
import { createFileRoute, Link } from '@tanstack/react-router';
import { trpc } from '@/lib/trpc-client';
import { useClientRole } from '@/lib/use-client-role';
import {
  BrandDNACard,
  VoiceMetricsProgress,
  ScoreTooltip,
} from '@/components/brand-dna';

export const Route = createFileRoute('/app/clients/$clientId/brand-dna')({
  component: ClientBrandDNAPage,
});

function ClientBrandDNAPage() {
  const { clientId } = Route.useParams();
  const { isAgencyOwner } = useClientRole();

  // CRITICAL: Use calibration.getBrandDNAReport for FULL report
  // NOT clients.getDNAReport (only returns strength score)
  const dnaReportQuery = trpc.calibration.getBrandDNAReport.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  const clientQuery = trpc.clients.getById.useQuery({ clientId });

  // ... rest of implementation
}
```

### Step 2: Implement RBAC Check

**CRITICAL**: Verify agency owns client before displaying data.

```typescript
// At top of component, after hooks
const { isAgencyOwner, canViewClient } = useClientRole();

// Early return if no access
if (!canViewClient) {
  return (
    <div className="text-center py-12">
      <h2 style={{ color: 'var(--text-primary)' }}>Access Denied</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        You don't have permission to view this client's Brand DNA.
      </p>
      <Link to="/app/clients">← Back to Clients</Link>
    </div>
  );
}
```

### Step 3: Use Correct tRPC Procedure

**IMPORTANT**: Two procedures exist - use the right one:

| Procedure | Returns | Use Case |
|-----------|---------|----------|
| `clients.getDNAReport` | Strength score only | Dashboard badges |
| `calibration.getBrandDNAReport` | Full report (tone, markers, banned, stances) | **This page** |

**File:** `worker/trpc/routers/calibration.ts` (lines 947-1016)

The `getBrandDNAReport` returns:
```typescript
interface BrandDNAReport {
  strengthScore: number;
  toneProfile: Record<string, number>;
  voiceMarkers: string[];
  bannedWords: Array<{ word: string; reason?: string }>;
  stances: Array<{ topic: string; position: string }>;
  signaturePhrases: string[];
  topicsToAvoid: string[];
  lastCalibration: string | null;
}
```

### Step 4: Build Page UI

```tsx
function ClientBrandDNAPage() {
  // ... queries above

  const client = clientQuery.data;
  const report = dnaReportQuery.data;
  const isProcessing = !report && !dnaReportQuery.error;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            to="/app/clients/$clientId"
            params={{ clientId }}
            className="text-sm mb-2 block"
            style={{ color: 'var(--edit)' }}
          >
            ← Back to {client?.name || 'Client'}
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {client?.name}'s Brand DNA
          </h1>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <ScoreTooltip score={report.strengthScore} />
            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {report.strengthScore}%
            </span>
          </div>
        )}
      </div>

      {/* Processing Banner */}
      {isProcessing && (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(29, 155, 240, 0.1)', border: '1px solid var(--edit)' }}
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--edit)' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              Brand DNA is being analyzed. Results will appear shortly.
            </span>
          </div>
          <button
            onClick={() => dnaReportQuery.refetch()}
            className="px-3 py-1 rounded text-sm"
            style={{ backgroundColor: 'var(--edit)', color: 'white' }}
          >
            Refresh
          </button>
        </div>
      )}

      {/* Main Content - Reuse BrandDNACard */}
      {report && (
        <>
          <BrandDNACard
            report={report}
            onAddSamples={undefined}      // Read-only for agency view
            onRecordVoice={undefined}     // Read-only for agency view
            onEditVoiceProfile={undefined} // Read-only for agency view
          />

          {/* Extraction Metadata */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Extraction Details
            </h3>
            <div className="flex gap-6 text-sm">
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Captured:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>
                  {report.lastCalibration
                    ? new Date(report.lastCalibration).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Voice Markers:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{report.voiceMarkers.length}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Banned Words:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{report.bannedWords.length}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Bar */}
      <div className="flex gap-4">
        <Link
          to="/app/hubs/new"
          search={{ clientId }}
          className="flex-1 py-3 rounded-xl text-center font-medium"
          style={{ backgroundColor: 'var(--approve)', color: 'white' }}
        >
          Create Hub for {client?.name}
        </Link>
        <Link
          to="/app/brand-dna"
          className="flex-1 py-3 rounded-xl text-center font-medium"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
        >
          Fine-tune DNA
        </Link>
      </div>
    </div>
  );
}
```

### Step 5: Update Email URL

**File:** `apps/foundry-dashboard/worker/email/index.ts` (line 469)

```typescript
// Change from:
const viewResultsUrl = `${dashboardUrl}/app/clients/${clientId}`;

// Change to:
const viewResultsUrl = `${dashboardUrl}/app/clients/${clientId}/brand-dna`;
```

### Step 6: Auto-Refresh While Processing

```typescript
// Add to useQuery options
const dnaReportQuery = trpc.calibration.getBrandDNAReport.useQuery(
  { clientId },
  {
    enabled: !!clientId,
    refetchInterval: (data) => (!data ? 10000 : false), // Refetch every 10s if no data
  }
);
```

## Tasks / Subtasks

- [x] Task 1: Create route file (AC: 1)
  - [x] Create `src/routes/app/clients.$clientId.brand-dna.tsx`
  - [x] Follow `clients.$clientId.settings.tsx` pattern

- [x] Task 2: Implement RBAC (AC: 1)
  - [x] Add `useClientRole()` check
  - [x] Return 403 UI if no access

- [x] Task 3: Data fetching (AC: 2, 3)
  - [x] Use `calibration.getBrandDNAReport` (NOT `clients.getDNAReport`)
  - [x] Handle loading/error states

- [x] Task 4: Build results view (AC: 2, 3, 5)
  - [x] Reuse `BrandDNACard` with `undefined` action handlers (read-only)
  - [x] Add extraction metadata section
  - [x] Use `ScoreTooltip` from R-12

- [x] Task 5: Add CTAs (AC: 4)
  - [x] "Create Hub" → `/app/hubs/new?clientId={id}`
  - [x] "Fine-tune DNA" → `/app/brand-dna`
  - [x] Back link → `/app/clients/{id}`

- [x] Task 6: Processing state (AC: 7)
  - [x] Show processing banner
  - [x] Auto-refresh every 10 seconds
  - [x] Manual refresh button

- [x] Task 7: Update email link (AC: 6)
  - [x] Change URL in `email/index.ts` lines 462, 479

## Dev Notes

### Component Props for Read-Only Mode

`BrandDNACard` expects these optional handlers:
```typescript
interface BrandDNACardProps {
  report: BrandDNAReport;
  onAddSamples?: () => void;      // Pass undefined for read-only
  onRecordVoice?: () => void;     // Pass undefined for read-only
  onEditVoiceProfile?: () => void; // Pass undefined for read-only
}
```

When handlers are `undefined`, the component should hide edit buttons.

### Import Path
```typescript
import {
  BrandDNACard,
  VoiceMetricsProgress,
  ScoreTooltip,
  MetricTooltip,
} from '@/components/brand-dna';
```

### Testing Approach
1. Unit: Page renders with mock data
2. Integration: Correct procedure called with clientId
3. Integration: 403 returned for non-owned client
4. E2E: Email click → page loads with results

### Edge Cases
- No Brand DNA yet → Show invitation CTA
- Calibration processing → Show progress + auto-refresh
- Not owner → 403 error UI
- Client deleted → 404 error UI

## References
- [Source: src/routes/app/clients.$clientId.settings.tsx] - Route pattern reference
- [Source: src/routes/app/brand-dna.tsx] - Full DNA page (line 416 for BrandDNACard usage)
- [Source: worker/trpc/routers/calibration.ts:947-1016] - getBrandDNAReport procedure
- [Source: src/components/brand-dna/index.ts] - Component exports
- [Source: worker/email/index.ts:469] - Email URL to update

## File List

**Created:**
- `apps/foundry-dashboard/src/routes/app/clients.$clientId.brand-dna.tsx` - Dedicated Brand DNA results page

**Modified:**
- `apps/foundry-dashboard/worker/email/index.ts` - Updated email links (lines 462, 479)

**Tests:**
- `apps/foundry-dashboard/e2e/r14-brand-dna-results-page.spec.ts` - E2E tests for all ACs (pre-existing)

## Change Log

- 2026-01-08: Implemented R-14 - Dedicated Client Brand DNA Results Page
  - Created new route `/app/clients/{clientId}/brand-dna` for agency view
  - Implemented RBAC with useClientRole() check (403 for non-owners)
  - Used `calibration.getBrandDNAReport` for full report (not lightweight `clients.getDNAReport`)
  - Reused BrandDNACard component in read-only mode (undefined action handlers)
  - Added extraction metadata section (capture date, counts)
  - Implemented processing state with auto-refresh (10s intervals)
  - Added CTAs: Create Hub, Fine-tune DNA, Back to Client
  - Updated email links to point to dedicated page (not generic client page)

## Dev Agent Record

### Implementation Notes

**Component Reuse:** BrandDNACard already supports read-only mode via optional action handlers (`onAddSamples?: () => void`). Passing `undefined` hides edit buttons - no component modification needed.

**tRPC Procedure Choice:** Used `calibration.getBrandDNAReport` (full report with entities) instead of `clients.getDNAReport` (strength score only). The full report is needed for AC2 (display tone, markers, banned words, stances).

**RBAC Pattern:** Followed existing pattern from `clients.$clientId.settings.tsx` using `useClientRole()` hook. Returns 403 UI if `canViewClient` is false.

**Auto-Refresh:** Implemented via `refetchInterval: (data) => (!data ? 10000 : false)` in useQuery options. Automatically polls every 10s when no data (processing state), stops when data arrives.

**R-13 Integration:** Email link now points to `/brand-dna` subpage instead of generic client page, completing the user flow from R-13.

### Completion Notes

✅ AC1: Route `/app/clients/{clientId}/brand-dna` created with full DNA results display
✅ AC2: Page displays tone profile, voice markers, banned words, stances (via BrandDNACard)
✅ AC3: Strength score with ScoreTooltip visual indicator
✅ AC4: CTAs implemented - Create Hub, Fine-tune DNA, Back to Client
✅ AC5: Extraction metadata section - capture date, marker counts, banned word counts
✅ AC6: Email button updated to link to new page (lines 462, 479)
✅ AC7: Processing state with auto-refresh (10s) and manual refresh button
