# Retrospective: Remediation & Hardening Sprint (R-1 to R-8)

**Date:** 2025-12-29
**Facilitator:** Bob (Scrum Master)
**Participants:** Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev), Williamshaw (Project Lead)

## Epic Summary
This sprint was a focused **Remediation & Hardening** effort triggered by the completion of Epic 9. Instead of moving to new features, the team paused to address critical security, stability, and architecture issues found during a comprehensive audit.

**Metrics:**
- **Stories Completed:** 8 (R-1 through R-8)
- **Priority:** 1 Critical (P0), 7 High/Medium
- **Pass Rate:** 100% (all stories reviewed and verified)

---

## What Went Well (Successes)

### 1. Adversarial Code Review Impact
**Charlie (Senior Dev):** "The decision to run adversarial code reviews on every remediation story (R-1, R-8) paid off huge. We caught the pagination issue in the Review Queue (R-8) and the missing timeouts in Agent RPC (R-1) *before* they hit staging. That saved us hotfixes."

### 2. Architecture Isolation Enforcement
**Elena (Junior Dev):** "Fixing R-7 (Legacy Imports) was painful but necessary. Creating local DB modules for Foundry (`worker/db`) instead of relying on the legacy package finally cleanly separated the two systems. Deployments are actually safe now."

### 3. Rapid Diagnosis of "Split Brain"
**Alice (Product Owner):** "When {user_name} flagged the 'wrong numbers' on the review page, we quickly identified the root cause: Legacy app (`user-application`) vs. Foundry app (`foundry-dashboard`). We didn't waste time trying to fix the wrong code."

---

## Challenges & Issues

### 1. The "Split Brain" Confusion
**Alice (Product Owner):** "We have two applications (`apps/user-application` and `apps/foundry-dashboard`) that look almost identical but connect to different databases. This caused major confusion today. We nearly started porting code to the legacy app by mistake."

### 2. CI/CD Infrastructure Drift
**Dana (QA Engineer):** "Our local tests pass, but CI fails (specifically P1 Integration Tests). We're relying on 'verified locally' instead of a green pipeline. Story R-1 verified this: local `pnpm test` worked, but GitHub Actions failed due to the `miniflare` harness limitations."

### 3. Logic Drift in Durable Objects
**Charlie (Senior Dev):** "Story R-8 exposed a nasty bug: The Durable Object was querying for `status='reviewing'` (old) while the rest of the system used `status='ready_for_review'` (new). We need shared constants or types to prevent these magic string mismatches."

---

## Key Insights

1.  **Legacy Code is Dangerous:** If legacy code (`user-application`) exists in the repo and looks modern, it *will* confuse developers. We need to clearly mark it as "DO NOT TOUCH" or archive it visually.
2.  **Truth Lives in the DO:** In Foundry, the Durable Object isn't just a cache; it's the write master for client data. Querying D1 directly (like the legacy app did) will always be slower or slightly out of sync.
3.  **Adversarial Review is Mandatory:** It found critical bugs in 100% of the stories it touched this sprint.

---

## Action Items

### Process Improvements
1.  **Mark Legacy Clearly:** Add a `README.md` or visual banner to `apps/user-application` explicitly stating "LEGACY - DO NOT MODIFY".
    *   *Owner:* Scrum Master
    *   *Timeline:* Immediate

### Technical Debt
1.  **Prioritize TD-1 (Vitest Pool Workers):** We must fix the CI pipeline so we can trust `git push`. Local-only verification is not sustainable.
    *   *Owner:* DevOps / Architect
    *   *Priority:* High (Next Sprint)

2.  **Shared Constants Package:** Extract status strings (`ready_for_review`) and score thresholds (`G7 > 90`) into `@repo/foundry-core` so both Backend (DO) and Frontend (UI) use the same definitions.
    *   *Owner:* Dev
    *   *Priority:* Medium

---

## Next Steps
With R-1 through R-8 complete and the critical "wrong numbers" bug fixed in stage, the system is significantly more stable.

**Recommendation:** Proceed to **Release Readiness** final check or begin **Technical Debt** sprint (focusing on TD-1).
