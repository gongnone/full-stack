# Test Coverage Gap Report

**Generated:** 2025-12-25
**Project:** foundry-dashboard
**Current Test Count:** 917+ tests across 64 test files (pending final count)

## Executive Summary

The foundry-dashboard has good test coverage for most components, with **64 test files** covering **~77%** of the component codebase. This report identifies **18 untested components** requiring test implementation, prioritized by complexity and business criticality.

---

## Coverage Gap Analysis

### Priority Tiers

| Priority | Description | Components |
|----------|-------------|------------|
| **P0** | Critical business logic, security-sensitive | 4 |
| **P1** | Core user flows, high complexity | 6 |
| **P2** | Supporting features, medium complexity | 5 |
| **P3** | Simple UI components, low risk | 3 |

---

## P0: Critical Components (Implement First)

These components handle critical business logic and should be tested immediately.

### 1. `components/hub-wizard/ExtractionProgress.tsx` (209 lines)
**Story:** 3.2 - Thematic Extraction Engine

**What It Does:**
- Polls extraction progress via tRPC every 2 seconds
- Shows 4-stage extraction pipeline (parsing, themes, claims, pillars)
- Handles completion and error states
- Calls `onComplete` with extracted pillars

**Testing Requirements:**
- Mock `trpc.hubs.getExtractionProgress.useQuery`
- Test all 4 stages render correctly
- Test progress bar updates with weighted percentages
- Test polling stops on completion/failure
- Test `onComplete` callback with pillar data
- Test `onRetry` callback on error state
- Test stage pulse animation on current stage
- Test checkmark animation on completed stages

**Estimated Tests:** 18-22

---

### 2. `components/hubs/HubSettings.tsx` (376 lines)
**Story:** 3-4 - Hub Metadata and State Management

**What It Does:**
- Displays/edits hub title, status, source type
- Shows pillar and spoke count statistics
- Archive hub functionality with confirmation
- Real-time metadata updates via tRPC mutation

**Testing Requirements:**
- Mock `trpc.hubs.updateHub.useMutation`
- Test title editing with save/cancel
- Test status badge rendering (processing, ready, archived)
- Test source type labels (PDF, Text, URL)
- Test archive confirmation modal
- Test pillar/spoke count display
- Test `onUpdate` and `onArchive` callbacks
- Test loading and error states

**Estimated Tests:** 20-25

---

### 3. `components/clients/RBACEditor.tsx` (157 lines)
**Story:** Implied - Role-Based Access Control

**What It Does:**
- Edits client role-based permissions
- Manages permission sets
- Security-sensitive RBAC configuration

**Testing Requirements:**
- Test permission toggle functionality
- Test role assignment
- Test save/cancel operations
- Test validation of permission combinations
- Test error handling for invalid states

**Estimated Tests:** 12-15

---

### 4. `components/ui/gate-badge.tsx` (245 lines)
**Story:** 4.2 - Quality Gate Display

**What It Does:**
- Displays G2/G4/G5 gate status badges
- Shows hover tooltips with breakdown details
- Handles pass/warning/fail states
- Supports size variants (sm, md, lg)

**Testing Requirements:**
- Test all gate types (G2, G4, G5)
- Test status variants (pass, warning, fail)
- Test size variants (sm, md, lg)
- Test G2 breakdown tooltip (hook, pattern, benefit, curiosity)
- Test G4 details tooltip (violations, similarity)
- Test G5 details tooltip (violations, character count)
- Test hover interactions

**Estimated Tests:** 18-22

---

## P1: Core Flow Components (High Priority)

These components are part of core user flows and have high complexity.

### 5. `components/hub-wizard/PillarResults.tsx` (275 lines)
**Story:** 3.5 - Ingestion Progress

**Testing Requirements:**
- Test pillar list rendering
- Test pillar selection/deselection
- Test pillar editing capabilities
- Test continue/back navigation
- Test empty state handling

**Estimated Tests:** 15-18

---

### 6. `components/hub-wizard/EditablePillarCard.tsx` (316 lines)
**Story:** 3.5 - Pillar Editing

**Testing Requirements:**
- Test inline title editing
- Test core claim editing
- Test psychological angle selection
- Test supporting points editing
- Test delete confirmation
- Test save/cancel states

**Estimated Tests:** 18-22

---

### 7. `components/hubs/PillarConfigurator.tsx` (306 lines)
**Story:** 3.5 - Pillar Configuration

**Testing Requirements:**
- Test pillar reordering
- Test pillar addition/removal
- Test configuration validation
- Test save mutation
- Test loading/error states

**Estimated Tests:** 15-18

---

### 8. `components/hub-wizard/SourceSelection.tsx` (210 lines)
**Story:** 3.1 - Source Selection

**Testing Requirements:**
- Test tab navigation (URL, Text, PDF)
- Test source type selection
- Test continue button state
- Test back navigation
- Test validation states

**Estimated Tests:** 12-15

---

### 9. `components/hubs/ThemeExtractor.tsx` (166 lines)
**Story:** 3.2 - Theme Extraction

**Testing Requirements:**
- Test theme extraction trigger
- Test extraction progress display
- Test theme list rendering
- Test error handling
- Test retry functionality

**Estimated Tests:** 12-15

---

### 10. `components/spokes/SpokeTreeView.tsx` (218 lines)
**Story:** Spoke Management

**Testing Requirements:**
- Test tree node rendering
- Test expand/collapse functionality
- Test spoke selection
- Test nested spoke display
- Test empty state

**Estimated Tests:** 12-15

---

## P2: Supporting Features (Medium Priority)

### 11. `components/hub-wizard/RecentSourcesList.tsx` (177 lines)
**Testing Requirements:**
- Test recent sources display
- Test source selection
- Test empty state
- Test delete source

**Estimated Tests:** 10-12

---

### 12. `components/hub-wizard/StepUploadSource.tsx` (126 lines)
**Testing Requirements:**
- Test file upload trigger
- Test upload progress
- Test file type validation
- Test error states

**Estimated Tests:** 10-12

---

### 13. `components/hubs/SourceWizard.tsx` (118 lines)
**Testing Requirements:**
- Test wizard step navigation
- Test step completion
- Test back/next buttons
- Test final submission

**Estimated Tests:** 10-12

---

### 14. `components/hub-wizard/StepSelectClient.tsx` (50 lines)
**Testing Requirements:**
- Test client dropdown rendering
- Test client selection
- Test continue button state
- Test required validation

**Estimated Tests:** 6-8

---

### 15. `components/ui/button.tsx` (56 lines)
**Testing Requirements:**
- Test variant rendering (default, outline, ghost, etc.)
- Test size variants
- Test disabled state
- Test loading state

**Estimated Tests:** 10-12

---

## P3: Simple Components (Low Priority)

### 16. `components/ui/card.tsx` (75 lines)
**Testing Requirements:**
- Test card container rendering
- Test header/content/footer slots
- Test styling variants

**Estimated Tests:** 6-8

---

### 17. `components/icons/GoogleIcon.tsx` (26 lines)
**Testing Requirements:**
- Test SVG renders
- Test size prop
- Test className passthrough

**Estimated Tests:** 3-4

---

### 18. `components/icons/GitHubIcon.tsx` (11 lines)
**Testing Requirements:**
- Test SVG renders
- Test props passthrough

**Estimated Tests:** 2-3

---

## Test Implementation Guidelines

### Testing Stack
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
```

### Common Mocking Patterns

**tRPC Queries:**
```typescript
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    routerName: {
      queryName: {
        useQuery: vi.fn(() => ({
          data: mockData,
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        })),
      },
    },
  },
}));
```

**tRPC Mutations:**
```typescript
const mockMutate = vi.fn();
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    routerName: {
      mutationName: {
        useMutation: vi.fn(() => ({
          mutate: mockMutate,
          mutateAsync: vi.fn().mockResolvedValue({}),
          isPending: false,
          isError: false,
        })),
      },
    },
  },
}));
```

**Router Navigation:**
```typescript
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));
```

### Test File Structure
```typescript
describe('ComponentName', () => {
  const defaultProps = { /* ... */ };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => { /* basic render tests */ });
  describe('User Interactions', () => { /* click, input, keyboard */ });
  describe('State Management', () => { /* loading, error, success */ });
  describe('Callbacks', () => { /* onComplete, onChange, etc. */ });
  describe('Edge Cases', () => { /* empty data, invalid input */ });
});
```

---

## Summary

| Priority | Components | Estimated Tests |
|----------|------------|-----------------|
| P0 | 4 | 68-84 |
| P1 | 6 | 84-103 |
| P2 | 5 | 46-56 |
| P3 | 3 | 11-15 |
| **Total** | **18** | **209-258** |

### Implementation Order

1. **Phase 1 (P0):** ExtractionProgress, HubSettings, RBACEditor, GateBadge
2. **Phase 2 (P1):** PillarResults, EditablePillarCard, PillarConfigurator, SourceSelection, ThemeExtractor, SpokeTreeView
3. **Phase 3 (P2):** RecentSourcesList, StepUploadSource, SourceWizard, StepSelectClient, Button
4. **Phase 4 (P3):** Card, GoogleIcon, GitHubIcon

### Quality Gates

- Each test file should achieve **>90% line coverage** for its component
- All critical paths must have explicit test cases
- Error states and edge cases must be covered
- No flaky tests (use `waitFor` for async operations)
