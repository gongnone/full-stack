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

## Testing

### Foundry Tests (apps/foundry-dashboard/)

All E2E and component tests are in the Foundry dashboard app:

```bash
# E2E tests (Playwright)
cd apps/foundry-dashboard
pnpm exec playwright test                    # Run all E2E tests
pnpm exec playwright test --ui               # Interactive UI mode
pnpm exec playwright test --grep "@P0"       # Run priority P0 tests only

# Component/Unit tests (Vitest)
cd apps/foundry-dashboard
pnpm test                                    # Run all unit tests
```

**Test locations:**
- E2E tests: `apps/foundry-dashboard/e2e/`
- Component tests: `apps/foundry-dashboard/src/**/*.test.tsx`
- tRPC router tests: `apps/foundry-dashboard/src/server/**/*.test.ts`

### Legacy Tests

Legacy system has minimal test coverage (3 files in data-service). **DO NOT add tests to Legacy** unless explicitly requested - it's maintenance-only.

## CI/CD (GitHub Actions)

Deployments are automated via **GitHub Actions** workflows:

| Branch | Environment | Workflow |
|--------|-------------|----------|
| `stage` | Stage | `.github/workflows/deploy-stage.yaml` |
| `main` | Production | `.github/workflows/deploy-production.yaml` |

### GitHub Secrets Required
- `CLOUDFLARE_API_TOKEN` - Token with "Edit Cloudflare Workers" permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Workflow Features
- Resource isolation checks (prevents Legacy/Foundry database collision)
- TypeScript type checking (`foundry:typecheck:build`)
- Parallel deployment of all 4 workers
- Health check verification

### Manual Trigger
```bash
gh workflow run "deploy-stage.yaml" --ref stage
gh workflow run "deploy-production.yaml" --ref main
```

### Cloudflare Dashboard Secrets (foundry-dashboard)
Set in Workers & Pages → foundry-dashboard-stage/production → Settings → Variables:
- `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth

### OAuth Callback URLs
- Stage: `https://foundry-stage.williamjshaw.ca/api/auth/callback/google`
- Production: `https://foundry.williamjshaw.ca/api/auth/callback/google`

### Known Issues
- **Queue Consumer Conflict**: If `foundry-engine` deploy fails with "queue already has consumer" (code 11004), delete consumers in Cloudflare Dashboard → Queues → [queue] → Consumers → Delete, then redeploy.
- **Legacy TypeScript Errors**: The Legacy frontend has pre-existing type errors that show as warnings but don't block deployment.
