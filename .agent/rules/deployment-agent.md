---
trigger: model_decision
description: When you are ready to deploy changes
---

# Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                           │
│                    gongnone/full-stack                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   stage branch ──────────────► main branch                      │
│        │                            │                           │
│        │ (push)                     │ (PR merge)                │
│        ▼                            ▼                           │
│   ┌─────────────┐              ┌─────────────┐                  │
│   │ Stage Build │              │ Prod Build  │                  │
│   └──────┬──────┘              └──────┬──────┘                  │
│          │                            │                         │
│          ▼                            ▼                         │
│   ┌─────────────────┐          ┌─────────────────┐              │
│   │ user-application│          │ user-application│              │
│   │     -stage      │          │   -production   │              │
│   └─────────────────┘          └─────────────────┘              │
│                                                                 │
│   ┌─────────────────┐          ┌─────────────────┐              │
│   │  data-service   │          │  data-service   │              │
│   │     -stage      │          │   -production   │              │
│   └─────────────────┘          └─────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Environments

| Environment | Branch | Domain | D1 Database ID |
|-------------|--------|--------|----------------|
| Stage | `stage` | stage.williamjshaw.ca | `ffb0b27b-7c2c-48bb-933a-d3038598d003` |
| Production | `main` | hero.williamjshaw.ca | `b2c606e3-d4b4-45b6-b0c1-d9fb77791750` |

## Workers

### user-application
Frontend React app + tRPC API Worker

| Setting | Stage | Production |
|---------|-------|------------|
| Worker Name | `user-application-stage` | `user-application-production` |
| Service Binding | `data-service-stage` | `data-service-production` |

### data-service
Backend Worker with Workflows, Durable Objects, AI, and Queues

| Setting | Stage | Production |
|---------|-------|------------|
| Worker Name | `data-service-stage` | `data-service-production` |
| Workflows | `*-stage` suffix | No suffix |
| R2 Bucket | `smart-eval-bucket-stage` | `smart-eval-bucket-production` |

---

## Auto-Deployment Setup (Cloudflare Dashboard)

### Configuring a Worker for Auto-Deploy

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Select the worker (e.g., `user-application-stage`)
3. Click **Settings** → **Builds**
4. Click **Connect** under Git repository

### Build Configuration Settings

#### For Stage Workers (`user-application-stage`)

| Setting | Value |
|---------|-------|
| Git repository | `gongnone/full-stack` |
| Production branch | `stage` |
| Build command | *None* |
| Deploy command | `pnpm run stage:deploy-frontend` |
| Root directory | `/` |
| **Builds for non-production branches** | **Disabled** |

#### For Production Workers (`user-application-production`)

| Setting | Value |
|---------|-------|
| Git repository | `gongnone/full-stack` |
| Production branch | `main` |
| Build command | *None* |
| Deploy command | `pnpm run production:deploy-frontend` |
| Root directory | `/` |
| **Builds for non-production branches** | **Disabled** |

### Environment Variables (Build-time)

| Variable | Stage Value | Production Value |
|----------|-------------|------------------|
| `CLOUDFLARE_ENV` | `stage` | `production` |
| `VITE_BASE_HOST` | `stage.williamjshaw.ca` | `hero.williamjshaw.ca` |

---

## Understanding "Builds for non-production branches"

**Production branch** = The branch you configured (e.g., `stage` for stage worker)

**Non-production branches** = ALL other branches (`main`, `feature-*`, etc.)

### When ENABLED (problematic):
```
stage worker watches:
  ├── stage branch ──────► builds ✅
  ├── main branch ───────► tries to build ❌ (fails - wrong env)
  └── feature-* branches ► tries to build ❌
```

### When DISABLED (correct):
```
stage worker watches:
  └── stage branch only ──► builds ✅

All other branches are ignored.
```

**Rule**: Always disable "Builds for non-production branches" to prevent cross-branch build triggers.

---

## Deployment Workflow

### Development → Stage

```bash
# 1. Make changes on stage branch
git checkout stage
# ... make changes ...

# 2. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin stage

# 3. Auto-deploy triggers:
#    - user-application-stage rebuilds
#    - data-service-stage rebuilds (if configured)
```

### Stage → Production

```bash
# 1. Create PR from stage to main
gh pr create --base main --head stage --title "Release: description"

# 2. Review and merge PR on GitHub

# 3. Auto-deploy triggers:
#    - user-application-production rebuilds
#    - data-service-production rebuilds (if configured)

# 4. After merge, sync stage with main
git checkout stage
git pull origin main
git push origin stage
```

---

## Manual Deployment Commands

### From Repository Root

```bash
# Stage deployments
pnpm run stage:deploy-frontend      # user-application to stage
pnpm run stage:deploy-backend       # data-service to stage

# Production deployments
pnpm run production:deploy-frontend # user-application to production
pnpm run production:deploy-backend  # data-service to production
```

### Build Package First (Required)

```bash
# Always build @repo/data-ops before deploying
pnpm run build-package

# Or build everything
pnpm run build
```

### Individual App Deployment

```bash
# From apps/user-application
cd apps/user-application
pnpm run stage:deploy      # Deploy to stage
pnpm run production:deploy # Deploy to production

# From apps/data-service
cd apps/data-service
pnpm run deploy --env stage      # Deploy to stage
pnpm run deploy --env production # Deploy to production
```

---

## Troubleshooting

### Build Fails: "Missing entry-point"

**Cause**: Wrangler can't find `wrangler.jsonc` or the configured `main` file.

**Solution**: Ensure:
1. Root directory is `/` (repo root)
2. Deploy command navigates to correct app directory
3. `wrangler.jsonc` exists in the app directory

### Build Fails: "No environment found with name 'stage'"

**Cause**: Wrangler is looking for `[env.stage]` in `wrangler.jsonc` but running from wrong directory.

**Solution**: Check that deploy command includes correct path navigation.

### Stage Rebuilds When Merging to Main

**Cause**: "Builds for non-production branches" is enabled on stage worker.

**Solution**: Disable "Builds for non-production branches" in Cloudflare Dashboard.

### Module Not Found During Build

**Cause**: TypeScript packages not compiled before deploy.

**Solution**:
```bash
# Run from repo root
pnpm run build-package
# Then deploy
pnpm run stage:deploy-frontend
```

---

## Wrangler Configuration Reference

### user-application/wrangler.jsonc

```jsonc
{
  "name": "user-application",
  "main": "worker/index.ts",
  "env": {
    "stage": {
      "name": "user-application-stage",
      "d1_databases": [{ "database_id": "ffb0b27b-..." }],
      "services": [{ "service": "data-service-stage" }]
    },
    "production": {
      "name": "user-application-production",
      "d1_databases": [{ "database_id": "b2c606e3-..." }],
      "services": [{ "service": "data-service-production" }]
    }
  }
}
```

### data-service/wrangler.jsonc

```jsonc
{
  "name": "data-service",
  "main": "src/index.ts",
  "env": {
    "stage": {
      "workflows": [
        { "name": "halo-research-workflow-v2-stage", "class_name": "HaloResearchWorkflowV2" }
      ],
      "d1_databases": [{ "database_id": "ffb0b27b-..." }]
    },
    "production": {
      "workflows": [
        { "name": "halo-research-workflow-v2", "class_name": "HaloResearchWorkflowV2" }
      ],
      "d1_databases": [{ "database_id": "b2c606e3-..." }]
    }
  }
}
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy frontend to stage | `pnpm run stage:deploy-frontend` |
| Deploy frontend to prod | `pnpm run production:deploy-frontend` |
| Deploy backend to stage | `pnpm run stage:deploy-backend` |
| Deploy backend to prod | `pnpm run production:deploy-backend` |
| Build all packages | `pnpm run build` |
| Build data-ops only | `pnpm run build-package` |
| View workflow instances | `npx wrangler workflows instances list WORKFLOW_NAME` |
| View D1 database | `npx wrangler d1 execute DB --env stage --command "SELECT * FROM projects"` |