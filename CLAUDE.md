# Claude Code Project Memory

## Architecture: Dual-System Monorepo

This repo contains TWO separate systems:

### Legacy System
- **Frontend**: `apps/user-application` → stage.williamjshaw.ca / hero.williamjshaw.ca
- **Backend**: `apps/data-service` → API worker
- **Dependency**: Both require `@repo/data-ops` to be built first (`pnpm run build-package`)

### Foundry MVP
- **Frontend**: `apps/foundry-dashboard` → foundry-stage.williamjshaw.ca / foundry.williamjshaw.ca
- **Backend**: `apps/foundry-engine` → Content engine worker
- **Auth**: Better Auth with Google OAuth

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

## Environment Secrets (Foundry Stage)

Required secrets in Cloudflare for `foundry-dashboard-stage`:
- `BETTER_AUTH_SECRET` - Session encryption
- `GOOGLE_CLIENT_ID` - OAuth
- `GOOGLE_CLIENT_SECRET` - OAuth

## D1 Databases

| Environment | Database Name | Used By |
|-------------|---------------|---------|
| Local | foundry-global-local | foundry-dashboard dev |
| Stage | foundry-global-stage | foundry-dashboard-stage |
| Production | foundry-global | foundry-dashboard-production |

## GitHub Actions

`.github/workflows/deploy-stage.yaml` - Deploys all 4 workers on push to `stage` branch
