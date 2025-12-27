# Developer Onboarding Guide

> Quick-start guide for new developers on the Market Research SaaS Platform

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ (use nvm or fnm for version management)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Git** 2.30+
- **Cloudflare Account** with Workers plan
- **Wrangler CLI** (`npm install -g wrangler`)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/gongnone/full-stack.git
cd full-stack

# Install dependencies
pnpm install

# Build shared packages
pnpm run build-package
```

### 2. Configure Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 3. Set Up Environment Variables

Create `.dev.vars` files for each worker:

```bash
# apps/data-service/.dev.vars
TAVILY_API_KEY=tvly-your-key-here
OPENAI_API_KEY=sk-your-key-here
APP_SECRET=your-32-char-secret

# apps/user-application/.dev.vars
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-key
BETTER_AUTH_SECRET=your-32-char-secret
```

### 4. Initialize Local Database

```bash
# Create local D1 database
cd apps/data-service
wrangler d1 execute DB --local --file=../../packages/data-ops/drizzle-out/auth-migrations/0000_initial.sql

# Apply schema migrations
wrangler d1 migrations apply DB --local
```

### 5. Start Development Servers

Open two terminals:

```bash
# Terminal 1: Backend (data-service)
pnpm dev-data-service
# Runs on http://localhost:8787

# Terminal 2: Frontend (user-application)
pnpm dev-frontend
# Runs on http://localhost:3000
```

---

## Project Structure Quick Reference

```
full-stack/
├── apps/
│   ├── data-service/      # Backend Worker (Hono + Workflows)
│   └── user-application/  # Frontend (React + Worker)
├── packages/
│   ├── data-ops/          # Shared: Schema, Queries, Auth
│   └── agent-logic/       # AI Agents, Prompts, Tools
├── docs/                  # Documentation (you are here)
└── package.json           # Root workspace config
```

---

## Common Development Tasks

### Adding a New tRPC Procedure

1. **Define the procedure** in the appropriate router:

```typescript
// apps/user-application/worker/trpc/routers/projects.ts
export const projectsRouter = t.router({
  // Add new procedure
  archive: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(projects)
        .set({ status: 'archived' })
        .where(eq(projects.id, input.id));
      return { success: true };
    }),
});
```

2. **Use in React**:

```typescript
const archiveMutation = trpc.projects.archive.useMutation();
await archiveMutation.mutateAsync({ id: projectId });
```

### Adding a New Database Table

1. **Define schema** in `packages/data-ops/src/schema.ts`:

```typescript
export const customTable = sqliteTable('custom_table', {
  id: text('id').primaryKey(),
  projectId: text('project_id').references(() => projects.id),
  data: text('data'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
```

2. **Generate migration**:

```bash
cd packages/data-ops
pnpm drizzle-kit generate
```

3. **Apply migration**:

```bash
# Local
wrangler d1 migrations apply DB --local

# Remote (staging)
wrangler d1 migrations apply DB --env stage --remote
```

### Adding a New Route

1. **Create route file** following TanStack Router conventions:

```typescript
// apps/user-application/src/routes/app/_authed/settings.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/app/_authed/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return <div>Settings</div>;
}
```

2. **Regenerate route tree**:

```bash
cd apps/user-application
pnpm tanstack-router generate
```

### Adding a New Agent Phase

1. **Create agent file** in `packages/agent-logic/src/agents/`:

```typescript
// packages/agent-logic/src/agents/new-agent.ts
export async function runNewAgent(
  env: AgentEnv,
  context: AgentContext,
  previousPhaseResult: PreviousResult
): Promise<NewResult> {
  // Agent implementation
}
```

2. **Export from index**:

```typescript
// packages/agent-logic/src/agents/index.ts
export { runNewAgent } from './new-agent';
```

3. **Add to workflow** in `apps/data-service/src/workflows/`.

---

## Testing

### Running Type Checks

```bash
# Check all packages
pnpm typecheck

# Check specific package
pnpm --filter @repo/data-ops typecheck
```

### Running Linting

```bash
pnpm lint
```

### Manual API Testing

Use the Cloudflare dashboard or CLI:

```bash
# Query D1 database
wrangler d1 execute DB --env stage --command "SELECT * FROM projects LIMIT 5"

# View workflow instances
wrangler workflows instances list halo-research-workflow-v2-stage

# Tail worker logs
wrangler tail user-application-stage
```

---

## Deployment

### Stage Deployment

```bash
# Build packages first
pnpm run build-package

# Deploy both workers
pnpm run stage:deploy-frontend
pnpm run stage:deploy-data-service
```

### Production Deployment

Follow the PR workflow:

1. Create PR from `stage` to `main`
2. Review and merge
3. Auto-deploy triggers on merge

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

---

## Debugging

### Common Issues

#### "Module not found" during deploy

```bash
# Always build packages first
pnpm run build-package
```

#### tRPC errors in browser

Check the Network tab for `/trpc` requests. Common issues:
- Auth session expired (re-login)
- Backend service binding misconfigured

#### Workflow stuck in "running"

```bash
# Check workflow status
wrangler workflows instances list WORKFLOW_NAME --env stage

# View specific instance
wrangler workflows instances describe WORKFLOW_NAME INSTANCE_ID --env stage
```

#### Database migration conflicts

```bash
# Check migration status
wrangler d1 migrations list DB --env stage

# Force apply if needed
wrangler d1 execute DB --env stage --file=migration.sql
```

### Logging

Add console logs with consistent prefixes:

```typescript
// Workflow phases
console.log(`[Phase 1] Starting Discovery Agent`);

// tRPC procedures
console.log(`DEBUG: getCredits called for user ${ctx.userId}`);

// Errors
console.error(`[Workflow V2] Failed to update status: ${e}`);
```

View logs:

```bash
wrangler tail worker-name-stage
```

---

## Architecture Quick Links

| Topic | Document |
|-------|----------|
| System Overview | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Database Schema | [DATA-MODEL.md](./DATA-MODEL.md) |
| API Endpoints | [API-REFERENCE.md](./API-REFERENCE.md) |
| AI Workflows | [WORKFLOWS.md](./WORKFLOWS.md) |
| React Frontend | [FRONTEND.md](./FRONTEND.md) |
| Deployment | [DEPLOYMENT.md](../DEPLOYMENT.md) |

---

## Key Files to Know

| Purpose | Location |
|---------|----------|
| Root scripts | `package.json` |
| Database schema | `packages/data-ops/src/schema.ts` |
| Query functions | `packages/data-ops/src/queries/` |
| tRPC routers | `apps/user-application/worker/trpc/routers/` |
| React routes | `apps/user-application/src/routes/` |
| UI components | `apps/user-application/src/components/ui/` |
| AI agents | `packages/agent-logic/src/agents/` |
| Workflows | `apps/data-service/src/workflows/` |
| Wrangler config | `apps/*/wrangler.toml` or `wrangler.jsonc` |

---

## Getting Help

1. **Check documentation** in this `/docs` folder
2. **Search codebase** for similar patterns
3. **Review git history** for context on decisions
4. **Check Cloudflare docs** for Workers/D1/Workflows

---

## Development Tips

1. **Use TypeScript strictly** - The codebase has end-to-end type safety
2. **Follow existing patterns** - Look at similar code before adding new features
3. **Keep packages focused** - `data-ops` for data, `agent-logic` for AI
4. **Test locally first** - Use wrangler local dev before deploying
5. **Commit often** - Small, focused commits are easier to review
6. **Update docs** - Keep documentation in sync with code changes
