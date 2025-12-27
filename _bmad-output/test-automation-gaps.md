# Test Automation Gap Analysis

**Generated**: 2025-12-25
**Project**: The Agentic Content Foundry
**Analysis Mode**: Critical Paths (P0/P1)

---

## Executive Summary

| Test Level | Current | Target | Gap |
|------------|---------|--------|-----|
| E2E Tests | 45 files | 45 | ✅ Complete |
| Component Tests | 15 files | 60+ | ❌ 45+ missing |
| API Tests | 0 files | 8 | ❌ 8 missing |
| Unit Tests | 0 files | 10+ | ❌ 10+ missing |

**Priority**: Focus on P0/P1 gaps first (API tests + critical component tests)

---

## P0 Critical Gaps (Must Have)

### API Tests - Hub & Spoke Operations

These are the core business logic paths with zero test coverage:

#### 1. `worker/trpc/routers/hubs.ts` - Hub CRUD
```
Priority: P0
Mutations/Queries to test:
- hubs.create - Create new hub with sources
- hubs.list - List user's hubs
- hubs.get - Get hub by ID with pillars
- hubs.update - Update hub metadata
- hubs.delete - Delete hub and cascade
- hubs.triggerIngestion - Start content ingestion

Test file: tests/api/hubs.api.spec.ts
```

#### 2. `worker/trpc/routers/spokes.ts` - Content Generation
```
Priority: P0
Mutations/Queries to test:
- spokes.generate - Trigger spoke generation
- spokes.list - List spokes by hub
- spokes.get - Get spoke with quality gate status
- spokes.approve - Approve spoke for export
- spokes.kill - Kill spoke (cascade delete)
- spokes.clone - Clone best spoke with variations
- spokes.heal - Trigger self-healing loop

Test file: tests/api/spokes.api.spec.ts
```

### Component Tests - P0 Core UX

#### 3. Review Components (Executive Producer Dashboard)
```
Priority: P0 - Core UX Promise "300 pieces in 30 minutes"
Components to test:
- ContentCard.tsx - Spoke display with approve/kill actions
- BucketCard.tsx - Sprint bucket grouping
- KillConfirmationModal.tsx - Cascade kill confirmation

Test file: src/components/review/ContentCard.test.tsx (etc.)
```

---

## P1 High Priority Gaps

### API Tests

#### 4. `worker/trpc/routers/exports.ts` - Export Engine
```
Priority: P1
Mutations/Queries to test:
- exports.csv - Export to CSV format
- exports.json - Export to JSON format
- exports.platformExport - Group by platform
- exports.getHistory - Export history list

Test file: tests/api/exports.api.spec.ts
```

#### 5. `worker/trpc/routers/review.ts` - Review Queue
```
Priority: P1
Mutations/Queries to test:
- review.getQueue - Get review queue by bucket
- review.approve - Batch approve spokes
- review.reject - Reject with reason

Test file: tests/api/review.api.spec.ts
```

#### 6. `worker/trpc/routers/clients.ts` - Multi-Client
```
Priority: P1
Mutations/Queries to test:
- clients.create - Create client account
- clients.list - List agency clients
- clients.addMember - Add team member with role
- clients.removeMember - Remove team member

Test file: tests/api/clients.api.spec.ts
```

#### 7. `worker/trpc/routers/auth.ts` - Authentication
```
Priority: P1
Mutations/Queries to test:
- auth.getSession - Get current session
- auth.logout - Logout user

Test file: tests/api/auth.api.spec.ts
```

### Component Tests - P1

#### 8. Hub Wizard Components
```
Priority: P1
Components to test:
- SourceDropZone.tsx - File upload with drag/drop
- SourceSelection.tsx - Source type selection
- WizardStepper.tsx - Multi-step wizard navigation
- IngestionProgress.tsx - Real-time progress display
- PillarCard.tsx - Pillar display and editing
- EditablePillarCard.tsx - Inline pillar editing

Test files: src/components/hub-wizard/*.test.tsx
```

#### 9. Export Components
```
Priority: P1
Components to test:
- ExportModal.tsx - Export configuration modal
- ExportFormatSelector.tsx - Format selection (CSV/JSON)
- ClipboardActions.tsx - Copy to clipboard actions
- PlatformGrouper.tsx - Platform organization

Test files: src/components/exports/*.test.tsx
```

---

## P2 Medium Priority Gaps

### API Tests

#### 10. `worker/trpc/routers/analytics.ts`
```
Priority: P2
- analytics.zeroEditRate - Zero edit rate metrics
- analytics.criticTrends - Critic pass rate trends
- analytics.healingEfficiency - Self-healing metrics
```

#### 11. `worker/trpc/routers/calibration.ts`
```
Priority: P2
- calibration.trigger - Trigger brand DNA calibration
- calibration.getStatus - Get calibration status
```

### Component Tests - P2

#### 12. Analytics Components
```
Priority: P2
Components:
- ZeroEditChart.tsx
- CriticTrends.tsx
- HealingMetrics.tsx
- VelocityDashboard.tsx
- KillAnalytics.tsx
- DriftDetector.tsx
```

#### 13. Brand DNA Components
```
Priority: P2
Components:
- BrandDNACard.tsx
- VoiceRecorder.tsx
- VoiceEntitiesEditor.tsx
- TranscriptionReview.tsx
```

---

## Test Infrastructure Requirements

### Already Configured
- Playwright for E2E (`playwright.config.ts`)
- Vitest for unit/component (`vitest.config.ts`)
- Test setup file (`src/test/setup.tsx`)

### Needed for API Tests
```typescript
// tests/api/setup.ts
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '../../worker/trpc/router';

// Mock tRPC client for API testing
export const trpcMsw = createTRPCMsw<typeof appRouter>();
```

### Test Data Factories Needed
```typescript
// tests/support/factories/
- user.factory.ts (createUser, createSession)
- hub.factory.ts (createHub, createPillar)
- spoke.factory.ts (createSpoke, createQualityGate)
- client.factory.ts (createClient, createTeamMember)
```

---

## Recommended Execution Order

### Phase 1: API Tests (P0)
1. Create API test infrastructure (setup.ts, factories)
2. `hubs.api.spec.ts` - Hub CRUD operations
3. `spokes.api.spec.ts` - Spoke generation and quality gate

### Phase 2: API Tests (P1)
4. `exports.api.spec.ts` - Export engine
5. `review.api.spec.ts` - Review queue operations
6. `clients.api.spec.ts` - Multi-client operations
7. `auth.api.spec.ts` - Authentication

### Phase 3: Component Tests (P0-P1)
8. Review components (ContentCard, BucketCard, etc.)
9. Hub wizard components (SourceDropZone, WizardStepper, etc.)
10. Export components (ExportModal, ClipboardActions, etc.)

### Phase 4: Component Tests (P2)
11. Analytics components
12. Brand DNA components

---

## Commands for Test Agent

```bash
# Run existing E2E tests
pnpm --filter foundry-dashboard test:e2e

# Run existing component tests
pnpm --filter foundry-dashboard test

# Create new API test file
# tests/api/hubs.api.spec.ts

# Create new component test file
# src/components/review/ContentCard.test.tsx
```

---

## Quality Standards

All generated tests must follow:
- Given-When-Then format
- Priority tags in test names: `[P0]`, `[P1]`, `[P2]`
- data-testid selectors (no CSS classes)
- No hard waits (use explicit waits)
- Self-cleaning (fixtures with auto-cleanup)
- Use factories with @faker-js/faker

---

## Handoff Notes

This document identifies **45+ missing component tests** and **8 missing API test files**.

The E2E coverage is excellent (45 files covering all 44 stories). The gap is in lower-level testing that would catch bugs earlier in development and provide faster feedback loops.

**Estimated effort**:
- P0 gaps: 4-6 hours
- P1 gaps: 6-8 hours
- P2 gaps: 4-6 hours

**Total**: ~16-20 hours of test writing
