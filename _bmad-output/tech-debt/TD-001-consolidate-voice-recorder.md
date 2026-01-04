# Tech Debt: Consolidate VoiceRecorder Components

## ID
TD-001

## Priority
Medium - Not blocking but increases maintenance burden

## Date
2026-01-04

---

## Problem Statement

Multiple VoiceRecorder component implementations exist in the codebase, leading to:
- Inconsistent behavior across features
- Duplicated bug fixes needed
- Increased maintenance burden
- Confusion about which component to use

---

## Current State

### Duplicate Components Found

| Component | Location | Lines | Used By |
|-----------|----------|-------|---------|
| VoiceRecorder (voice/) | `src/components/voice/VoiceRecorder.tsx` | 661 | BrandDNAConversation, onboard.$token |
| VoiceRecorder (brand-dna/) | `src/components/brand-dna/VoiceRecorder.tsx` | 328 | app/brand-dna route |

### Feature Comparison

| Feature | voice/VoiceRecorder | brand-dna/VoiceRecorder | Ideal |
|---------|---------------------|-------------------------|-------|
| Waveform Visualization | Yes (50 bars) | No (progress bar) | Yes |
| iOS Safari Chunking | Yes | No | Yes |
| Multi-segment Recording | Yes | No | Yes |
| Preview Before Submit | Yes | No | Yes |
| Re-record Option | Yes | Yes | Yes |
| File Upload Fallback | Yes | No | Yes |
| Toast Notifications | No | Yes | Yes |
| Error Messages | Detailed (modal) | Toast | Both |
| Permission Detection | Yes | Yes | Yes |
| Safari Workaround | Yes | Yes | Yes |
| Auto-stop at Duration | Yes | Yes | Yes |
| Resume Upload Support | Partial | No | Nice-to-have |
| Uses UI Constants | No (hardcoded) | Yes (BRAND_DNA_CONFIG) | Yes |
| Props Interface | Complex (7 props) | Simple (3 props) | Configurable |
| Test Coverage | VoiceRecorder.test.tsx | VoiceRecorder.test.tsx | Both |

### Interface Comparison

**voice/VoiceRecorder:**
```typescript
interface VoiceRecorderProps {
  maxDuration?: number;           // 300 default
  autoStopDuration?: number;      // 120 default
  onComplete: (audioBlob: Blob, duration: number) => void;
  onError: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
  onGetUploadUrl?: () => Promise<string>;
}
```

**brand-dna/VoiceRecorder:**
```typescript
interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number;           // BRAND_DNA_CONFIG.MAX_VOICE_DURATION_SECONDS
  disabled?: boolean;
}
```

---

## Recommendation

**Keep:** `voice/VoiceRecorder` as the foundation

**Reasons:**
1. More features (waveform, multi-segment, preview)
2. Better iOS Safari support (chunking workaround)
3. File upload fallback for unsupported browsers
4. Already 661 lines - significant investment

**Enhance with features from brand-dna/VoiceRecorder:**
1. Toast notifications via `useToast` hook
2. UI constants from `BRAND_DNA_CONFIG`
3. Simpler `disabled` prop

---

## Proposed Solution

### Target Interface

```typescript
interface VoiceRecorderProps {
  // Duration
  maxDuration?: number;           // seconds, default from config
  autoStopDuration?: number;      // seconds, default = maxDuration

  // Callbacks
  onComplete: (audioBlob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;

  // UI Options
  showWaveform?: boolean;         // default: true
  showTimer?: boolean;            // default: true
  allowRerecord?: boolean;        // default: true
  allowMultiSegment?: boolean;    // default: false
  allowFileUpload?: boolean;      // fallback, default: true

  // State
  disabled?: boolean;

  // Styling
  className?: string;
}
```

### Migration Plan

#### Phase 1: Create Unified Component (4 hours)
- [ ] Create new `VoiceRecorder` in shared components (`src/components/voice/`)
- [ ] Implement all features from comparison matrix
- [ ] Add configurable props for optional features
- [ ] Use UI constants and theme variables
- [ ] Add toast notification support
- [ ] Write comprehensive unit tests
- [ ] Create Storybook stories for all states

#### Phase 2: Migrate Consumers (3 hours)
- [ ] Migrate `BrandDNAConversation.tsx` to unified component
- [ ] Migrate `onboard.$token.tsx` to unified component
- [ ] Migrate `app/brand-dna.tsx` to unified component
- [ ] Test each migration on staging
- [ ] Verify waveform works on mobile

#### Phase 3: Cleanup (1 hour)
- [ ] Remove `src/components/brand-dna/VoiceRecorder.tsx`
- [ ] Update barrel exports (`index.ts`)
- [ ] Remove dead code and unused imports
- [ ] Update any documentation

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Create unified component | 4 hours |
| Phase 2: Migrate consumers | 3 hours |
| Phase 3: Cleanup | 1 hour |
| **Total** | **8 hours** |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Regression in BrandDNA recording | Medium | High | Comprehensive testing before merge |
| Mobile-specific bugs surface | Medium | Medium | Test on iOS Safari, Android Chrome |
| Permission handling edge cases | Low | Medium | Keep both permission approaches |

---

## Success Criteria

- [ ] Single VoiceRecorder component in codebase
- [ ] All features from both components available
- [ ] No regression in any recording feature
- [ ] Tests pass on all platforms
- [ ] Storybook documentation complete

---

## Related Documents

- Gap Analysis: `_bmad-output/reports/client-journey-gap-analysis.md`
- Story 1.5-1-2: Voice Recording Component (Mobile)

---

## Tracking

- GitHub Issue: To be created
- Labels: `tech-debt`, `refactor`, `components`
- Milestone: Tech Debt Sprint
