# Deployment Architecture Changes - 2025-12-25

## Summary

Infrastructure changes to support the dual-system architecture during migration from legacy (user-application) to new MVP (foundry-dashboard).

## System Architecture

```
LEGACY SYSTEM (Keep as-is)              NEW MVP SYSTEM (Added)
========================               ====================
user-application-stage                 foundry-dashboard-stage
  → stage.williamjshaw.ca                → foundry-stage.williamjshaw.ca
  → data-service-stage (backend)         → foundry-engine-stage (backend)

user-application-production            foundry-dashboard-production
  → hero.williamjshaw.ca                 → foundry.williamjshaw.ca
  → data-service-production (backend)    → foundry-engine-production (backend)
```

## Changes Made

### 1. foundry-dashboard/wrangler.jsonc

| Change | Before | After |
|--------|--------|-------|
| Stage worker name | `user-application-stage` (WRONG) | `foundry-dashboard-stage` |
| Stage route | `stage.williamjshaw.ca` (conflict) | `foundry-stage.williamjshaw.ca` |
| Stage BETTER_AUTH_URL | `https://stage.williamjshaw.ca` | `https://foundry-stage.williamjshaw.ca` |
| Wrangler version | `^3.95.0` | `^4.56.0` |

### 2. data-service/wrangler.jsonc

| Change | Before | After |
|--------|--------|-------|
| Production Durable Objects | Missing `IngestionTracker` | Added `IngestionTracker` DO |
| Production Migrations | Missing v5 migration | Added v5 migration for `IngestionTracker` |

### 3. foundry-engine/wrangler.jsonc

No changes required - configuration was already correct.

## Stage URLs for QA Testing

| Application | URL | Purpose |
|-------------|-----|---------|
| **Legacy Frontend** | https://stage.williamjshaw.ca | Original user-application (unchanged) |
| **Legacy Backend** | (internal service) | data-service-stage (unchanged) |
| **New MVP Frontend** | https://foundry-stage.williamjshaw.ca | foundry-dashboard-stage (NEW) |
| **New MVP Backend** | (internal service) | foundry-engine-stage |

## QA Testing Checklist

### foundry-dashboard-stage (NEW - Priority)

- [ ] **Authentication**: Login/logout works at `foundry-stage.williamjshaw.ca`
- [ ] **Better Auth**: Session cookies set correctly for `foundry-stage` domain
- [ ] **Service Binding**: Dashboard can communicate with `foundry-engine-stage`
- [ ] **D1 Database**: Reads/writes to `foundry-global-stage` database
- [ ] **R2 Storage**: Media uploads work via `foundry-media` bucket
- [ ] **Vectorize**: Embeddings work via `foundry-embeddings` index
- [ ] **AI Binding**: Workers AI accessible for transcription/extraction

### foundry-engine-stage

- [ ] **Durable Objects**: ClientAgent creates/hydrates correctly
- [ ] **Workflows**: Hub ingestion, spoke generation, calibration workflows trigger
- [ ] **Queues**: spoke-generation-queue-stage and quality-gate-queue-stage process messages
- [ ] **Service Binding**: Responds to requests from foundry-dashboard-stage

### user-application-stage (Regression)

- [ ] **No Impact**: Existing functionality at `stage.williamjshaw.ca` unchanged
- [ ] **Auth Still Works**: Login/logout still functional
- [ ] **Data Service**: Backend calls still work

### data-service-stage (Regression)

- [ ] **IngestionTracker DO**: New DO available in stage env
- [ ] **Existing DOs**: ChatSession still works
- [ ] **Workflows**: All 4 workflows (HaloResearch, GoldenPheasant, GodfatherOffer, SpokeGeneration) still work

## Git Integration Status

| Worker | Cloudflare Git Integration | Branch | Status |
|--------|---------------------------|--------|--------|
| user-application-stage | Connected | stage | Working |
| data-service-stage | Connected | stage | Working |
| foundry-dashboard-stage | **Needs Setup** | stage | Build failing |
| foundry-engine-stage | **Needs Setup** | stage | Build failing |

### Build Configuration Required

For `foundry-engine-stage`:
```
Root directory: /apps/foundry-engine
Build command: pnpm install && npx wrangler deploy --env stage
Deploy command: npx wrangler deploy --env stage
```

For `foundry-dashboard-stage`:
```
Root directory: /apps/foundry-dashboard
Build command: pnpm install && pnpm build && npx wrangler deploy --env stage
Deploy command: npx wrangler deploy --env stage
```

## Database Sharing

Both systems share the same D1 database:
- **Stage**: `foundry-global-stage` (ID: `e35604ee-6e84-476f-a6ec-e6df6e12d81c`)
- **Production**: `foundry-global` (ID: `bd287f3f-8147-49b5-9cae-466c60a975c6`)

This means:
- User accounts are shared between legacy and new systems
- Sessions are domain-specific (cookies don't cross domains)
- Content data is accessible from both systems

## Rollback Plan

If issues arise with foundry-dashboard:
1. No impact on legacy system - it continues at `stage.williamjshaw.ca`
2. Can revert wrangler.jsonc changes via git
3. foundry-dashboard-stage can be deleted without affecting user-application-stage

## Next Steps

1. [ ] Fix Cloudflare Git build failures for foundry workers
2. [ ] Complete QA testing on `foundry-stage.williamjshaw.ca`
3. [ ] Set up production workers when stage is validated
4. [ ] Plan migration from user-application to foundry-dashboard

---

**Commit**: `ac26466` - fix(deploy): correct wrangler configs for multi-worker architecture
**Date**: 2025-12-25
**Author**: Deployment Agent (Claude Opus 4.5)
