# Story R-12: Brand DNA Tooltip Clarity

Status: done

## Story

As an **agency user**,
I want **to understand what DNA Strength means and how it affects content quality**,
so that **I know what actions to take to improve my client's brand calibration**.

## Background

Agencies viewing the Brand DNA dashboard see a percentage score (e.g., "62%") but don't understand:
1. What the number means in practical terms
2. How it affects AI-generated content quality
3. What specific actions would improve it
4. What the sub-scores (tone, vocabulary, structure, topics) measure

## Acceptance Criteria

### AC1: Main Score Tooltip
- [x] Info icon (ⓘ) displayed next to DNA Strength score
- [x] Hover reveals tooltip explaining score impact on content quality
- [x] Tooltip shows editing time correlation by tier:
  - `< 50%`: "AI content needs significant editing (~70%+ of outputs)"
  - `50-79%`: "AI content needs moderate editing (~40% of outputs)"
  - `≥ 80%`: "AI reliably produces on-brand content (~20% editing)"
- [x] Tooltip shows improvement actions with expected gains
- [x] Tooltip displays target: "🎯 Target: 80%+ for zero-edit content"

### AC2: Sub-Score Tooltips
- [x] Each progress bar (Tone Match, Vocabulary, Structure, Topics) has info icon
- [x] Tooltips explain what each score measures:
  - **Tone Match**: "How consistently AI matches your brand's emotional tone"
  - **Vocabulary**: "Recognition of signature phrases and industry terminology"
  - **Structure**: "Understanding of preferred content formats and flow"
  - **Topics**: "Awareness of subjects to emphasize or avoid"
- [x] Tooltips suggest how to improve each dimension

### AC3: Progressive Disclosure
- [x] Tooltips only appear on hover (300ms delay per existing pattern)
- [x] Clean default state - no visual clutter
- [x] Mobile: tap-to-reveal via `onClick` handler (same as hover for simplicity)

### AC5: Accessibility
- [x] Info icon is keyboard accessible (`tabIndex={0}`)
- [x] Info icon has `role="button"` and descriptive `aria-label`
- [x] Tooltip has `role="tooltip"` and connects via `aria-describedby`
- [x] Enter/Space key triggers tooltip (keyboard users)

### AC4: Design Token Compliance
- [x] All colors use CSS variables (var(--text-primary), etc.)
- [x] Tooltip styling matches existing `GateBadge` tooltip pattern
- [x] Follows established hover delay (300ms)

## Tasks / Subtasks

- [x] Task 1: Create ScoreTooltip component (AC: 1, 3, 4, 5)
  - [x] 1.1 Create `src/components/brand-dna/ScoreTooltip.tsx`
  - [x] 1.2 Define BRAND_VOICE_IMPACT constants inline (tiers, messages, improvements)
  - [x] 1.3 Implement hover state with 300ms delay (match GateBadge pattern)
  - [x] 1.4 Add tier-based impact messaging
  - [x] 1.5 Add improvement actions with expected % gains
  - [x] 1.6 Add target score display
  - [x] 1.7 Add `data-testid="score-info-icon"` to trigger element
  - [x] 1.8 Add accessibility: `role="button"`, `tabIndex={0}`, `aria-label="Learn about DNA Strength"`
  - [x] 1.9 Add keyboard handler: Enter/Space toggles tooltip

- [x] Task 2: Create MetricTooltip component (AC: 2, 3, 4, 5)
  - [x] 2.1 Create `src/components/brand-dna/MetricTooltip.tsx`
  - [x] 2.2 Define METRIC_TOOLTIPS constants inline with explanations
  - [x] 2.3 Add improvement suggestions per metric
  - [x] 2.4 Implement same hover pattern as ScoreTooltip
  - [x] 2.5 Add `data-testid="metric-info-{metricKey}"` to trigger element
  - [x] 2.6 Add accessibility: `role="button"`, `tabIndex={0}`, `aria-label`

- [x] Task 3: Integrate into BrandDNACard (AC: 1)
  - [x] 3.1 Import ScoreTooltip in BrandDNACard.tsx
  - [x] 3.2 Add ScoreTooltip INLINE after `{report.strengthScore}%` on line 69 (inside the span)
  - [x] 3.3 Pass `score={report.strengthScore}` prop

- [x] Task 4: Integrate into VoiceMetricsProgress (AC: 2)
  - [x] 4.1 Import MetricTooltip in VoiceMetricsProgress.tsx
  - [x] 4.2 Update ProgressBar component to accept tooltip prop
  - [x] 4.3 Add info icons to each progress bar

- [x] Task 5: Write component tests (AC: 1, 2, 3, 5)
  - [x] 5.1 Test ScoreTooltip renders correct tier message for each threshold
  - [x] 5.2 Test MetricTooltip renders correct explanation for each metric key
  - [x] 5.3 Test hover delay behavior (tooltip doesn't appear immediately)
  - [x] 5.4 Test click/tap behavior shows tooltip
  - [x] 5.5 Test keyboard accessibility (Enter/Space triggers tooltip)
  - [x] 5.6 Test aria attributes are present

- [x] Task 6: Update barrel export (CRITICAL)
  - [x] 6.1 Add `export { ScoreTooltip } from './ScoreTooltip';` to `index.ts`
  - [x] 6.2 Add `export { MetricTooltip } from './MetricTooltip';` to `index.ts`

## Dev Notes

### Existing Tooltip Pattern - MUST FOLLOW

The codebase has an established tooltip pattern in `src/components/ui/gate-badge.tsx:77-88`:

```typescript
const [showTooltip, setShowTooltip] = React.useState(false);
const [tooltipTimeout, setTooltipTimeout] = React.useState<ReturnType<typeof setTimeout> | null>(null);

const handleMouseEnter = () => {
  const timeout = setTimeout(() => setShowTooltip(true), 300);
  setTooltipTimeout(timeout);
};

const handleMouseLeave = () => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  setShowTooltip(false);
};
```

**DO NOT use Radix UI Tooltip directly** - follow this custom pattern for consistency.

### Tooltip Styling Pattern

From `gate-badge.tsx:121-126`:
```typescript
<div
  className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg shadow-xl min-w-[200px] animate-fadeIn"
  style={{
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
  }}
>
```

### Constants Structure

**NOTE:** Constants should be defined INLINE in each component file, not in a separate constants.ts. This keeps related code together and simplifies imports.

```typescript
// Inside ScoreTooltip.tsx (NOT a separate file)

const BRAND_VOICE_IMPACT = {
  tiers: [
    {
      range: [0, 49],
      label: 'Needs Training',
      editingPercent: '~70%+',
      message: 'AI-generated content will need significant editing. Add training samples to establish your brand voice.',
    },
    {
      range: [50, 79],
      label: 'Good',
      editingPercent: '~40%',
      message: 'AI content will need moderate editing. You\'re getting there!',
    },
    {
      range: [80, 100],
      label: 'Strong',
      editingPercent: '~20% or less',
      message: 'AI reliably produces on-brand content. Expect minimal editing.',
    },
  ],
  improvements: [
    { icon: '🎤', label: 'Record voice note', gain: '+15-20%' },
    { icon: '📄', label: 'Add more samples', gain: '+10-15%' },
    { icon: '✏️', label: 'Edit voice markers', gain: '+5-10%' },
  ],
  target: 80,
};

// Inside MetricTooltip.tsx
const METRIC_TOOLTIPS = {
  tone_match: {
    label: 'Tone Match',
    explanation: 'How consistently AI will match your brand\'s emotional tone',
    improvement: 'Record voice notes to capture your natural speaking style',
  },
  vocabulary: {
    label: 'Vocabulary',
    explanation: 'Recognition of signature phrases and industry terminology',
    improvement: 'Add more written samples with your unique phrases',
  },
  structure: {
    label: 'Structure',
    explanation: 'Understanding of preferred content formats and flow',
    improvement: 'Upload diverse content types (blogs, emails, social)',
  },
  topics: {
    label: 'Topics',
    explanation: 'Awareness of subjects to emphasize or avoid',
    improvement: 'Edit banned words list to refine topic awareness',
  },
};
```

### Project Structure Notes

- Components go in `src/components/brand-dna/`
- Constants MUST be inline in component files (NOT separate constants.ts)
- Tests in `src/components/brand-dna/*.test.tsx`
- Follow existing naming: `ScoreTooltip.tsx`, `MetricTooltip.tsx`
- **MUST update `index.ts` barrel export** - see existing exports pattern in file

### Files to Modify

| File | Change |
|------|--------|
| `src/components/brand-dna/BrandDNACard.tsx` | Add ScoreTooltip inline after `%` on line 69 |
| `src/components/brand-dna/VoiceMetricsProgress.tsx` | Add MetricTooltip prop to ProgressBar, add info icons |
| `src/components/brand-dna/index.ts` | Add exports for ScoreTooltip and MetricTooltip |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/brand-dna/ScoreTooltip.tsx` | Main score explanation tooltip |
| `src/components/brand-dna/MetricTooltip.tsx` | Sub-score explanation tooltips |
| `src/components/brand-dna/ScoreTooltip.test.tsx` | Unit tests |
| `src/components/brand-dna/MetricTooltip.test.tsx` | Unit tests |

### References

- [Source: remediation-backlog.md#TASK-032] - DNA strength purpose clarification
- [Source: remediation-backlog.md#TASK-033] - Sub-score tooltips
- [Source: gate-badge.tsx] - Existing tooltip pattern to follow
- [Source: BrandDNACard.tsx] - Component to modify
- [Source: VoiceMetricsProgress.tsx] - Component to modify

## Testing Requirements

### Unit Tests

```typescript
// ScoreTooltip.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScoreTooltip } from './ScoreTooltip';

describe('ScoreTooltip', () => {
  it('shows "significant editing" message for scores < 50', async () => {
    render(<ScoreTooltip score={35} />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/significant editing/i)).toBeInTheDocument();
    });
  });

  it('shows "moderate editing" message for scores 50-79', async () => {
    render(<ScoreTooltip score={62} />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/moderate editing/i)).toBeInTheDocument();
    });
  });

  it('shows "minimal editing" message for scores >= 80', async () => {
    render(<ScoreTooltip score={85} />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/minimal editing|reliably produces/i)).toBeInTheDocument();
    });
  });

  it('displays improvement actions', async () => {
    render(<ScoreTooltip score={60} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText(/voice note/i)).toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<ScoreTooltip score={60} />);
    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-label', 'Learn about DNA Strength');
    expect(trigger).toHaveAttribute('tabIndex', '0');
  });

  it('responds to keyboard Enter', async () => {
    const user = userEvent.setup();
    render(<ScoreTooltip score={60} />);
    const trigger = screen.getByRole('button');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
```

### E2E Test (Optional)

Add to `e2e/story-2.3-brand-dna-analysis.spec.ts`:
```typescript
test('DNA score tooltip shows impact explanation', async ({ page }) => {
  await page.goto('/app/brand-dna');
  await page.hover('[data-testid="score-info-icon"]');
  await expect(page.locator('text=/editing/i')).toBeVisible();
});
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

**Initial Implementation:**
- Created ScoreTooltip component with tier-based messaging (Needs Training < 50%, Good 50-79%, Strong >= 80%)
- Created MetricTooltip component supporting 4 metrics: tone_match, vocabulary, structure, topics
- Both components follow established GateBadge tooltip pattern with 300ms hover delay
- Full accessibility: role="button", tabIndex={0}, aria-label, aria-describedby, keyboard support (Enter/Space/Escape)
- All colors use CSS variables (--bg-elevated, --border-subtle, --text-primary, etc.)
- 42 unit tests pass (20 ScoreTooltip + 22 MetricTooltip)
- Fixed TypeScript error by adding explicit Tier type alias and type assertion for array fallback
- Fixed Escape key test by using fireEvent.keyDown with waitFor instead of userEvent.keyboard

**Code Review Fixes (Adversarial Review):**
- **HIGH #1 & #2**: Fixed memory leak and race condition - added clearTimeout in handleClick, handleKeyDown, and Escape handler to prevent pending timeouts from firing after manual toggle/close
- **MEDIUM #4**: Added aria-live="polite" to tooltip containers for screen reader announcements when tooltips appear/disappear
- **MEDIUM #5**: Added outside click detection using useEffect + containerRef to close tooltips when clicking outside (improves mobile UX)
- **MEDIUM #6**: Added max-w-[calc(100vw-2rem)] to prevent tooltip overflow on narrow screens and mobile devices
- **MEDIUM #7**: Added 3 E2E tests to story-2.3-brand-dna-analysis.spec.ts covering hover behavior, metric tooltips, and keyboard accessibility
- **MEDIUM #3**: Updated File List to include all git-discovered files (E2E tests, story file, sprint status, remediation backlog)

### File List

| File | Action |
|------|--------|
| `apps/foundry-dashboard/src/components/brand-dna/ScoreTooltip.tsx` | Created |
| `apps/foundry-dashboard/src/components/brand-dna/MetricTooltip.tsx` | Created |
| `apps/foundry-dashboard/src/components/brand-dna/ScoreTooltip.test.tsx` | Created |
| `apps/foundry-dashboard/src/components/brand-dna/MetricTooltip.test.tsx` | Created |
| `apps/foundry-dashboard/src/components/brand-dna/BrandDNACard.tsx` | Modified |
| `apps/foundry-dashboard/src/components/brand-dna/VoiceMetricsProgress.tsx` | Modified |
| `apps/foundry-dashboard/src/components/brand-dna/index.ts` | Modified |
| `apps/foundry-dashboard/e2e/story-2.3-brand-dna-analysis.spec.ts` | Modified (added E2E tests for tooltips) |
| `_bmad-output/implementation-artifacts/R-12-brand-dna-tooltip-clarity.md` | Created (this story file) |
| `_bmad-output/implementation-artifacts/remediation-backlog.md` | Modified (story creation) |
| `_bmad-output/sprint-status.yaml` | Modified (status tracking) |
| `.claude/github-star-reminder.txt` | Modified (session tracking) |
