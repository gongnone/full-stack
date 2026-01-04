# GitHub Issue: Private Win Video (FR-1.5.15)

## Issue Details

**Title:** `feat(brand-dna): Implement Private Win Video (FR-1.5.15)`

**Labels:** `descoped`, `phase-2`, `feature`

**Milestone:** Phase 2.0

---

## Body

### Summary

FR-1.5.15 was formally descoped from Phase 1.5 MVF on 2026-01-03, approved by Product Owner William Shaw.

This feature prompts clients to record a "private win" video after completing their BrandDNA session - a personal momentum moment, not shared publicly.

### Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.5.15a | Agent prompts for "private win" video after BrandDNA session completion | P0 |
| FR-1.5.15b | Video recording works on mobile browsers | P0 |
| FR-1.5.15c | Prompt explains this is for personal momentum, not shared | P0 |
| FR-1.5.15d | User can skip without friction | P0 |
| FR-1.5.15e | Video stored in R2 with client association | P0 |

### Implementation Plan

1. Add new step in `BrandDNAAgent.ts` after `complete` step
2. Use existing `VideoRecorder` component
3. Store to R2 at: `/victory-videos/{client_id}/{date}.webm`
4. Mark as private (not visible to agency unless client shares)
5. Add skip button with no friction

### Effort Estimate
4-6 hours

### References

- Decision Record: `_bmad-output/decisions/DECISION-001-descope-fr-1.5.15.md`
- Descope Document: `_bmad-output/descope/FR-1.5.15-private-win-video.md`
- PRD: `_bmad-output/prd-phase-1.5-mvf.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
