# Claude Code Project Memory

## CRITICAL RULES - READ FIRST

### DO NOT Write to Legacy Folders

All new development is for **Foundry MVP only**. Legacy is maintenance-only.

**ALLOWED (Foundry):**
- ✅ `apps/foundry-dashboard/` - Foundry frontend
- ✅ `apps/foundry-engine/` - Foundry backend
- ✅ `packages/foundry-core/` - Shared Foundry code

**FORBIDDEN (Legacy):**
- ❌ `apps/user-application/` - DO NOT MODIFY
- ❌ `apps/data-service/` - DO NOT MODIFY
- ❌ Legacy wrangler.jsonc files - DO NOT TOUCH

### Never Mix Resources

- Legacy uses: `audience-hero-*` D1, `smart-eval-bucket-*` R2, `saas-knowledge-index` Vectorize
- Foundry uses: `foundry-global-*` D1, `foundry-media` R2, `foundry-embeddings` Vectorize
- NEVER bind Foundry resources to Legacy workers or vice versa

---

## Architecture: Dual-System Monorepo

This repo contains TWO completely separate systems with isolated resources:

### Legacy System (AudienceHero)
- **Frontend**: `apps/user-application` → stage.williamjshaw.ca / hero.williamjshaw.ca
- **Backend**: `apps/data-service` → API worker with Durable Objects
- **Dependency**: Both require `@repo/data-ops` to be built first (`pnpm run build-package`)

### Foundry MVP
- **Frontend**: `apps/foundry-dashboard` → foundry-stage.williamjshaw.ca / foundry.williamjshaw.ca
- **Backend**: `apps/foundry-engine` → Content engine worker
- **Auth**: Better Auth with Google OAuth

## Resource Isolation (CRITICAL)

The two systems MUST use separate Cloudflare resources:

### Legacy Resources
| Resource | Stage | Production |
|----------|-------|------------|
| D1 | audience-hero-stage (075a005c) | audience-hero-production (b2c606e3) |
| R2 | smart-eval-bucket-stage | smart-eval-bucket-production |
| Vectorize | saas-knowledge-index | saas-knowledge-index |
| Workflows | halo-research, golden-pheasant, godfather-offer | same |

### Foundry Resources
| Resource | Stage | Production |
|----------|-------|------------|
| D1 | foundry-global-stage (e35604ee) | foundry-global (bd287f3f) |
| R2 | foundry-media | foundry-media |
| Vectorize | foundry-embeddings | foundry-embeddings |
| Workflows | hub-ingestion, spoke-generation, calibration | same |

## Deploy Scripts (Root package.json)

```
pnpm run deploy:stage:legacy          # user-application (includes build-package)
pnpm run deploy:stage:backend-legacy  # data-service (includes build-package)
pnpm run deploy:stage:foundry         # foundry-dashboard
pnpm run deploy:stage:backend-foundry # foundry-engine
```

Replace `stage` with `production` for prod deploys.

## Cloudflare Workers Build Commands

| Worker | Build Command |
|--------|---------------|
| user-application-stage | `pnpm run deploy:stage:legacy` |
| data-service-stage | `pnpm run deploy:stage:backend-legacy` |
| foundry-dashboard-stage | `pnpm run deploy:stage:foundry` |
| foundry-engine-stage | `pnpm run deploy:stage:backend-foundry` |

## Critical Dependencies

- `user-application` imports from `@repo/data-ops` - MUST run `build-package` first
- `data-service` imports from `@repo/data-ops` - MUST run `build-package` first
- Foundry apps do NOT depend on data-ops

## Environment Secrets

### Foundry Stage (foundry-dashboard-stage)
- `BETTER_AUTH_SECRET` - Session encryption
- `GOOGLE_CLIENT_ID` - OAuth
- `GOOGLE_CLIENT_SECRET` - OAuth

### Legacy Stage (user-application-stage)
- `BETTER_AUTH_SECRET` - Session encryption
- Stripe keys as needed

## CI/CD

Deployments are handled by **Cloudflare Git Integration** (not GitHub Actions).
Each worker has its own Cloudflare project that auto-deploys on push to `stage` or `main`.
