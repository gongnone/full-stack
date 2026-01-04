# GitHub Issue: VoiceRecorder Consolidation

## Issue Details

**Title:** `refactor: Consolidate duplicate VoiceRecorder components`

**Labels:** `tech-debt`, `refactor`

**Milestone:** Backlog

---

## Body

### Summary

Multiple VoiceRecorder component implementations exist in the codebase, leading to inconsistent behavior and duplicated maintenance effort.

### Current State

| Component | Location | Lines | Used By |
|-----------|----------|-------|---------|
| VoiceRecorder (voice/) | `src/components/voice/VoiceRecorder.tsx` | 661 | BrandDNAConversation, onboard.$token |
| VoiceRecorder (brand-dna/) | `src/components/brand-dna/VoiceRecorder.tsx` | 328 | app/brand-dna route |

### Feature Comparison

| Feature | voice/ | brand-dna/ | Target |
|---------|--------|------------|--------|
| Waveform Visualization | ✅ | ❌ | ✅ |
| iOS Safari Chunking | ✅ | ❌ | ✅ |
| Multi-segment Recording | ✅ | ❌ | ✅ |
| Preview Before Submit | ✅ | ❌ | ✅ |
| Toast Notifications | ❌ | ✅ | ✅ |
| File Upload Fallback | ✅ | ❌ | ✅ |

### Recommendation

**Keep:** `voice/VoiceRecorder` as the foundation (661 lines, more features, better iOS support)

**Enhance with features from brand-dna/:**
1. Toast notifications via `useToast` hook
2. UI constants from `BRAND_DNA_CONFIG`
3. Simpler `disabled` prop

### Migration Plan

#### Phase 1: Create Unified Component (4 hours)
- [ ] Implement all features from comparison matrix
- [ ] Add configurable props for optional features
- [ ] Use UI constants and theme variables
- [ ] Add toast notification support
- [ ] Write comprehensive unit tests

#### Phase 2: Migrate Consumers (3 hours)
- [ ] Migrate `BrandDNAConversation.tsx`
- [ ] Migrate `onboard.$token.tsx`
- [ ] Migrate `app/brand-dna.tsx`
- [ ] Test on mobile (iOS Safari, Android Chrome)

#### Phase 3: Cleanup (1 hour)
- [ ] Remove `src/components/brand-dna/VoiceRecorder.tsx`
- [ ] Update barrel exports
- [ ] Update documentation

### Effort Estimate
8 hours total

### Success Criteria

- [ ] Single VoiceRecorder component in codebase
- [ ] All features from both components available
- [ ] No regression in any recording feature
- [ ] Tests pass on all platforms

### References

- Tech Debt Doc: `_bmad-output/tech-debt/TD-001-consolidate-voice-recorder.md`
- Gap Analysis: `_bmad-output/reports/client-journey-gap-analysis.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
