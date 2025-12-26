# Foundry MVP Project Retrospective

**Date:** 2025-12-26
**Project:** The Agentic Content Foundry
**Facilitator:** Bob (Scrum Master)
**Participants:** Williamshaw (Project Lead), Claude Opus 4.5

---

## Project Completion Summary

| Metric | Value |
|--------|-------|
| Epics Completed | 8/8 (100%) |
| Stories Completed | 44/44 (100%) |
| P0 Pass Rate | 99.4% (155/156) |
| Quality Gate | PASS |
| Status | FEATURE COMPLETE |

---

## Critical Incident: Deployment Configuration Contamination

### What Happened

During deployment verification on 2025-12-26, we discovered that the **Legacy system (AudienceHero)** and **Foundry MVP** were NOT properly isolated. Resources were cross-contaminated:

**Legacy `user-application` was using Foundry resources:**
- D1: `foundry-global-stage` instead of `audience-hero-stage`
- R2: `foundry-media` instead of `smart-eval-bucket-stage`
- Vectorize: `foundry-embeddings` instead of `saas-knowledge-index`

**Legacy `data-service` had Foundry workflows bound:**
- `SPOKE_GENERATION_WORKFLOW` (Foundry Epic 4)
- Pointing to Foundry D1 database

### Root Cause

During Foundry development, wrangler configuration files were modified without proper understanding of the dual-system architecture. The agent(s) working on Foundry mistakenly:
1. Updated Legacy wrangler configs with Foundry bindings
2. Added Foundry workflows to the Legacy data-service
3. Did not verify resource isolation before committing

### Impact

- **Data Contamination Risk:** Both systems sharing the same D1 database could have led to data corruption
- **Workflow Collision:** Duplicate workflow names (`spoke-generation-workflow-stage`) in both workers
- **Deployment Confusion:** Foundry code deploying during Legacy builds

### Resolution Applied

1. **Created** `audience-hero-stage` D1 database (075a005c)
2. **Updated** `apps/user-application/wrangler.jsonc`:
   - D1: `audience-hero-stage` / `audience-hero-production`
   - R2: `smart-eval-bucket-*`
   - Vectorize: `saas-knowledge-index`
3. **Updated** `apps/data-service/wrangler.jsonc`:
   - Removed `SPOKE_GENERATION_WORKFLOW`
   - D1: `audience-hero-stage` / `audience-hero-production`
   - Kept only Legacy workflows: `halo-research`, `golden-pheasant`, `godfather-offer`
4. **Updated** `CLAUDE.md` with resource isolation documentation

---

## Lessons Learned

### 1. Dual-System Architecture Must Be Respected

**Lesson:** This monorepo contains TWO completely separate products. They must NEVER share Cloudflare resources.

**Rule:**
- Legacy (AudienceHero): `apps/user-application`, `apps/data-service`
- Foundry MVP: `apps/foundry-dashboard`, `apps/foundry-engine`

### 2. Never Write Code to Legacy Folders

**Lesson:** All new feature development is for Foundry. The Legacy system is maintenance-only.

**Rule:** When implementing Foundry features:
- ✅ Write to `apps/foundry-dashboard/`
- ✅ Write to `apps/foundry-engine/`
- ✅ Write to `packages/foundry-core/`
- ❌ NEVER write to `apps/user-application/`
- ❌ NEVER write to `apps/data-service/`
- ❌ NEVER modify Legacy wrangler.jsonc files

### 3. Verify Resource Bindings Before Commit

**Lesson:** Before committing wrangler.jsonc changes, verify:
- D1 database IDs match the correct system
- R2 bucket names match the correct system
- Vectorize index names match the correct system
- Workflow names don't collide across workers

### 4. Read CLAUDE.md First

**Lesson:** The `CLAUDE.md` file documents the architecture and resource mapping. Read it before making infrastructure changes.

---

## Guardrails Established

### 1. CLAUDE.md Resource Isolation Table

Added explicit resource mapping table to prevent confusion:

```markdown
### Legacy Resources
| Resource | Stage | Production |
|----------|-------|------------|
| D1 | audience-hero-stage | audience-hero-production |
| R2 | smart-eval-bucket-stage | smart-eval-bucket-production |
| Vectorize | saas-knowledge-index | saas-knowledge-index |

### Foundry Resources
| Resource | Stage | Production |
|----------|-------|------------|
| D1 | foundry-global-stage | foundry-global |
| R2 | foundry-media | foundry-media |
| Vectorize | foundry-embeddings | foundry-embeddings |
```

### 2. Wrangler Config Headers

Added clear header comments to each wrangler.jsonc:

**Legacy (user-application):**
```json
/**
 * Legacy System (AudienceHero) - user-application
 * D1: audience-hero-stage / audience-hero-production
 * R2: smart-eval-bucket-*
 * Vectorize: saas-knowledge-index
 */
```

**Foundry (foundry-dashboard):**
```json
// Foundry MVP - foundry-dashboard
// D1: foundry-global-stage / foundry-global
// R2: foundry-media
// Vectorize: foundry-embeddings
```

### 3. Pre-Commit Verification

Before committing wrangler changes, verify with:
```bash
# Check Legacy uses Legacy resources
grep -E "foundry-(global|media|embeddings)" apps/user-application/wrangler.jsonc
grep -E "foundry-(global|media|embeddings)" apps/data-service/wrangler.jsonc
# Should return NO matches for properly isolated config
```

---

## Action Items

| Action | Owner | Status |
|--------|-------|--------|
| Create audience-hero-stage D1 database | Claude | ✅ Done |
| Update user-application wrangler.jsonc | Claude | ✅ Done |
| Update data-service wrangler.jsonc | Claude | ✅ Done |
| Update CLAUDE.md with resource isolation | Claude | ✅ Done |
| Add Legacy folder protection rules | Claude | ✅ Done (this retro) |
| Redeploy all workers with correct bindings | Cloudflare CI | ✅ Triggered |

---

## Commitments Going Forward

1. **All new development targets Foundry only** - Legacy is maintenance-only
2. **Read CLAUDE.md before infrastructure changes** - Understand the architecture first
3. **Verify wrangler configs before committing** - Check resource bindings
4. **Keep systems isolated** - Never share D1, R2, or Vectorize between Legacy and Foundry

---

## Next Steps

1. Monitor Cloudflare deployments to verify correct resource bindings
2. Run E2E tests against Foundry stage to confirm functionality
3. Continue with any remaining Foundry work on the correct infrastructure

---

*Retrospective captured by Claude Opus 4.5 | 2025-12-26*
