# GitHub Issues - Ready to Create

These issue templates are ready to be created in GitHub. Copy the body content into GitHub's issue creation form.

## Issues

| # | File | Title | Priority | Milestone |
|---|------|-------|----------|-----------|
| 1 | [ISSUE-001-fr-1.5.15-phase-2.md](./ISSUE-001-fr-1.5.15-phase-2.md) | feat(brand-dna): Implement Private Win Video (FR-1.5.15) | P1 | Phase 2.0 |
| 2 | [ISSUE-002-testimonial-flow.md](./ISSUE-002-testimonial-flow.md) | feat(testimonials): Complete Testimonial Request Flow | **P0** | Phase 1.5.1 |
| 3 | [ISSUE-003-voicerecorder-consolidation.md](./ISSUE-003-voicerecorder-consolidation.md) | refactor: Consolidate duplicate VoiceRecorder components | P3 | Backlog |

## Creation Instructions

### If `gh` CLI is available:
```bash
# Install gh CLI first
brew install gh  # macOS
# or
sudo apt install gh  # Ubuntu

# Authenticate
gh auth login

# Create issues
gh issue create --title "feat(brand-dna): Implement Private Win Video (FR-1.5.15)" --label descoped --label phase-2 --label feature
gh issue create --title "feat(testimonials): Complete Testimonial Request Flow" --label phase-1.5.1 --label feature --label P0
gh issue create --title "refactor: Consolidate duplicate VoiceRecorder components" --label tech-debt --label refactor
```

### Manual creation:
1. Go to https://github.com/gongnone/full-stack/issues/new
2. Copy title and body from each file
3. Apply labels as noted
4. Assign to appropriate milestone

---

*Generated: 2026-01-04*
