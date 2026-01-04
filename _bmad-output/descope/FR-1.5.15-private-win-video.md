# Descoped Feature: Private Win Video (FR-1.5.15)

## Decision
This P0 feature has been formally descoped from Phase 1.5 MVP.

## Date
2026-01-03

## Requirements Affected
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.5.15a | Agent prompts for "private win" video after BrandDNA session completion | P0 |
| FR-1.5.15b | Video recording works on mobile browsers | P0 |
| FR-1.5.15c | Prompt explains this is for personal momentum, not shared | P0 |
| FR-1.5.15d | User can skip without friction | P0 |
| FR-1.5.15e | Video stored in R2 with client association | P0 |

## Reason for Descope
1. **Zero Implementation**: No code exists for this feature - no UI, no agent flow integration, no storage logic
2. **Substantial Scope**: Implementing properly requires:
   - New step in BrandDNAAgent flow after session completion
   - Video recording UI integration (VideoRecorder component exists but not wired)
   - Skip functionality with proper UX
   - Private storage logic (separate from testimonials)
   - Mobile browser compatibility testing
   - Proper E2E tests
3. **Audit Context**: Discovered during compliance audit - not appropriate to implement as quick fix
4. **Risk Mitigation**: Better to descope than ship incomplete/buggy feature

## Impact on Users
- Users will NOT be prompted to record a private win video after BrandDNA completion
- This does NOT affect core BrandDNA functionality (voice capture, pillar generation, Brand DNA Report)
- This does NOT affect testimonial collection (FR-1.5.16 - separate feature)

## Implementation Plan for Future
1. Create new story: "1.5-8-1-private-win-video-capture"
2. Add step to BrandDNAAgent after `complete` step
3. Use existing VideoRecorder component
4. Store to R2 at: `/victory-videos/{client_id}/{date}.webm`
5. Mark as private (not visible to agency unless client shares)
6. Add skip button with no friction

## Tracking
- Sprint Status: Mark as `descoped` in phase-1.5-sprint-status.yaml
- Target: Phase 1.6 or Phase 2
- Effort Estimate: 4-6 hours

## Approved By
- BMAD-RESOLVER Audit Remediation
- Requires product owner confirmation for P0 descope

## Sign-off Status

**APPROVED** - 2026-01-04

- [X] Product Owner acknowledges P0 descope (William Shaw, 2026-01-03)
- [ ] Tracking issue created (see DECISION-001)
- [X] Sprint status updated (marked as `descoped`)

See: `_bmad-output/decisions/DECISION-001-descope-fr-1.5.15.md` for full decision record.
