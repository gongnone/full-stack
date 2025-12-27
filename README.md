# Full Stack Cloudflare Monorepo

A full-stack application built on Cloudflare Workers with React frontends, tRPC APIs, and D1 database.

## Architecture

This monorepo contains **two separate systems** with isolated resources:

```
apps/
  # Legacy System (AudienceHero)
  user-application/     # Legacy frontend (hero.williamjshaw.ca)
  data-service/         # Legacy backend worker

  # Foundry MVP
  foundry-dashboard/    # Foundry frontend (foundry.williamjshaw.ca)
  foundry-engine/       # Foundry backend worker

packages/
  data-ops/             # Shared database operations & Drizzle schema
  foundry-core/         # Foundry shared types and utilities
  agent-logic/          # AI agent logic
  agent-system/         # Agent orchestration system
```

### Resource Isolation

| Resource | Legacy | Foundry |
|----------|--------|---------|
| D1 Database (Stage) | `audience-hero-stage` | `foundry-global-stage` |
| D1 Database (Prod) | `audience-hero-production` | `foundry-global` |
| R2 Bucket | `smart-eval-bucket-*` | `foundry-media` |
| Vectorize | `saas-knowledge-index` | `foundry-embeddings` |

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Frontend**: React 19, TanStack Router, TailwindCSS
- **API**: tRPC, Hono
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **Auth**: Better Auth (Google, GitHub OAuth)
- **Storage**: Cloudflare R2
- **AI**: Cloudflare Workers AI, Vectorize
- **Workflows**: Cloudflare Workflows, Queues, Durable Objects

## Development

```bash
# Install dependencies
pnpm install

# Run Foundry apps locally
pnpm foundry:dev

# Run Legacy apps locally
pnpm dev-frontend        # user-application
pnpm dev-data-service    # data-service

# Type checking
pnpm foundry:typecheck
```

## CI/CD Deployment

Deployments are automated via GitHub Actions:

| Branch | Environment | Workflow |
|--------|-------------|----------|
| `stage` | Stage | `.github/workflows/deploy-stage.yaml` |
| `main` | Production | `.github/workflows/deploy-production.yaml` |

### Required GitHub Secrets

Add these in **Repository Settings > Secrets and variables > Actions > Secrets**:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | API token with "Edit Cloudflare Workers" permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

### Workflow Features

- Resource isolation checks (prevents Legacy/Foundry database collision)
- TypeScript type checking
- Parallel deployment of all 4 workers
- Health check verification

### Manual Deployment

```bash
# Stage
pnpm run foundry:deploy:stage

# Production
pnpm run foundry:deploy:production
```

## Environment URLs

### Legacy System (AudienceHero)
| Environment | URL |
|-------------|-----|
| Stage | https://stage.williamjshaw.ca |
| Production | https://hero.williamjshaw.ca |

### Foundry MVP
| Environment | URL |
|-------------|-----|
| Stage | https://foundry-stage.williamjshaw.ca |
| Production | https://foundry.williamjshaw.ca |

## Cloudflare Dashboard Secrets

Set these in **Cloudflare Dashboard > Workers & Pages > [worker] > Settings > Variables**:

### foundry-dashboard (Required)

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Session signing key (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

### OAuth Callback URLs

**Google Cloud Console:**
- Stage: `https://foundry-stage.williamjshaw.ca/api/auth/callback/google`
- Production: `https://foundry.williamjshaw.ca/api/auth/callback/google`

**GitHub Developer Settings:**
- Stage: `https://foundry-stage.williamjshaw.ca/api/auth/callback/github`
- Production: `https://foundry.williamjshaw.ca/api/auth/callback/github`

## Configuration

Wrangler configuration files (`wrangler.jsonc`) in each app define:
- Worker bindings (D1, R2, Vectorize, AI, Queues, Workflows)
- Environment-specific routes and custom domains
- Service bindings between workers
- `keep_vars: true` to preserve dashboard secrets on deploy

## Testing

```bash
# Foundry E2E tests (Playwright)
cd apps/foundry-dashboard
pnpm exec playwright test

# Foundry unit tests (Vitest)
cd apps/foundry-dashboard
pnpm test
```

Test locations:
- E2E tests: `apps/foundry-dashboard/e2e/`
- Component tests: `apps/foundry-dashboard/src/**/*.test.tsx`
