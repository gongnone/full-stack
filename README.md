# Full Stack Cloudflare Monorepo

A full-stack application built on Cloudflare Workers with React frontends, tRPC APIs, and D1 database.

## Architecture

```
apps/
  user-application/     # Main user-facing React app (stage.williamjshaw.ca)
  foundry-dashboard/    # Foundry dashboard React app
  foundry-engine/       # Foundry backend worker
  data-service/         # Backend data service worker

packages/
  data-ops/             # Shared database operations & Drizzle schema
  foundry-core/         # Shared types and utilities
  agent-logic/          # AI agent logic
  agent-system/         # Agent orchestration system
```

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Frontend**: React 19, TanStack Router, TailwindCSS
- **API**: tRPC, Hono
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **Auth**: Better Auth
- **Storage**: Cloudflare R2
- **AI**: Cloudflare Workers AI, Vectorize

## Development

```bash
# Install dependencies
pnpm install

# Run user-application locally
pnpm dev-frontend

# Run data-service locally
pnpm dev-data-service

# Run foundry apps
pnpm foundry:dev
```

## Deployment

### Stage Environment

```bash
# Deploy user-application to stage
pnpm --filter user-application run stage:deploy

# Deploy data-service to stage
pnpm run stage:deploy-data-service

# Deploy foundry apps to stage
pnpm run foundry:deploy:stage
```

### Production Environment

```bash
# Deploy user-application to production
pnpm --filter user-application run production:deploy

# Deploy data-service to production
pnpm run production:deploy-data-service

# Deploy foundry apps to production
pnpm run foundry:deploy:production
```

## Environments

| Environment | Domain | Database |
|-------------|--------|----------|
| Stage | stage.williamjshaw.ca | foundry-global-stage |
| Production | hero.williamjshaw.ca | foundry-global-production |

## Configuration

Wrangler configuration files (`wrangler.jsonc`) in each app define:
- Worker bindings (D1, R2, Vectorize, AI)
- Environment-specific routes and custom domains
- Service bindings between workers

Routes are declared in wrangler.jsonc and synced on deploy - GUI changes may be overwritten.
