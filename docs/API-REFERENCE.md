# API Reference

> tRPC API endpoints for the Market Research SaaS Platform

## Overview

The API layer is built on **tRPC** providing end-to-end type safety. All procedures require authentication via Better Auth session.

**Base Path**: `/trpc`

**Router Location**: `apps/user-application/worker/trpc/routers/`

## Authentication

All requests require a valid session cookie. The Hono middleware validates sessions before requests reach tRPC:

```typescript
// worker/hono/app.ts
app.use('/trpc/*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // Pass userId to tRPC context
  c.set('userId', session.user.id);
  return next();
});
```

## Router Structure

```typescript
// apps/user-application/worker/trpc/app-router.ts
export const appRouter = t.router({
  user: userRouter,           // User & credits
  projects: projectsRouter,   // Project CRUD
  marketResearch: marketResearchRouter,  // Research workflows
  generations: generationsRouter,        // Offer generation
});
```

---

## Projects Router

**Prefix**: `projects.*`

### `projects.list`

List all projects with pagination and search.

| Type | Query |
|------|-------|
| **Input** | `{ limit?: number, cursor?: number, search?: string }` |
| **Output** | `{ items: Project[], nextCursor?: number }` |

```typescript
const { data } = trpc.projects.list.useQuery({ limit: 20 });
```

### `projects.getById`

Get a single project by ID.

| Type | Query |
|------|-------|
| **Input** | `{ id: string }` |
| **Output** | `Project` |
| **Throws** | `NOT_FOUND` if project doesn't exist |

### `projects.create`

Create a new project.

| Type | Mutation |
|------|----------|
| **Input** | `{ name: string }` |
| **Output** | `{ id: string }` |

### `projects.update`

Update project metadata.

| Type | Mutation |
|------|----------|
| **Input** | `{ id: string, name?: string, industry?: string }` |
| **Output** | `{ success: boolean }` |

### `projects.delete`

Delete a project and all related data (cascade).

| Type | Mutation |
|------|----------|
| **Input** | `{ id: string }` |
| **Output** | `{ success: boolean }` |

**Cascade Delete Order**:
1. `vectorMetadata`
2. `workflowRuns`
3. `hvcoTitles`
4. `godfatherOffer`
5. `competitorOfferMap` → `goldenPheasantUploads` → `competitors`
6. `dreamBuyerAvatar`
7. `haloAnalysis`
8. `researchSources`
9. `projects`

### `projects.startResearch`

Trigger the HALO research workflow.

| Type | Mutation |
|------|----------|
| **Input** | `{ projectId: string, keywords: string, industry?: string, targetAudience?: string, productDescription?: string }` |
| **Output** | `{ success: boolean, workflowId?: string, error?: string }` |

**Side Effects**:
- Updates project with industry/targetMarket/valueProposition
- Creates `workflowRuns` record
- Triggers `startHaloResearchV2()` via RPC to data-service

### `projects.getDashboardStatus`

Get project dashboard with phase completion status.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `{ project: Project, phases: PhaseStatus }` |

**Phase Status Shape**:
```typescript
{
  phases: {
    research: { status: 'pending' | 'in_progress' | 'completed', meta: string },
    competitors: { status: 'pending' | 'locked' | 'completed', meta: string },
    offer: { status: 'pending' | 'locked' | 'completed', meta: string }
  }
}
```

---

## Market Research Router

**Prefix**: `marketResearch.*`

### `marketResearch.createProject`

Create a project and immediately start research workflow.

| Type | Mutation |
|------|----------|
| **Input** | `{ name: string, topic: string, targetAudience?: string, productDescription?: string }` |
| **Output** | `{ projectId: string, status: 'processing' }` |

**Side Effects**:
- Creates project in database
- Triggers `startHaloResearchV2()` workflow

### `marketResearch.getAll`

Get all projects for the authenticated user.

| Type | Query |
|------|-------|
| **Input** | None |
| **Output** | `Project[]` |

### `marketResearch.getProject`

Get a single project.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `Project` |

### `marketResearch.getResearch`

Get complete research results for a project.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `MarketResearchV2Result` |

**Output Shape** (from `getMarketResearchV2`):
```typescript
{
  project: Project,
  haloAnalysis: HaloAnalysis | null,
  dreamBuyerAvatar: DreamBuyerAvatar | null,
  researchSources: ResearchSource[],
  workflowRun: WorkflowRun | null,
  hvcoTitles: HVCOTitle[]
}
```

### `marketResearch.getWorkflowProgress`

Get current workflow execution status.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `WorkflowRun | null` |

**Status Values**: `running` | `paused_hitl` | `complete` | `failed`

### `marketResearch.getSources`

Get research sources for a project (max 50, sorted by sophistication score).

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `ResearchSource[]` |

### `marketResearch.excludeSource`

Toggle source exclusion flag.

| Type | Mutation |
|------|----------|
| **Input** | `{ sourceId: string, isExcluded: boolean }` |
| **Output** | `{ success: boolean }` |

---

## User Router

**Prefix**: `user.*`

### `user.getCredits`

Get the authenticated user's credit balance.

| Type | Query |
|------|-------|
| **Input** | None |
| **Output** | `{ credits: number }` |

---

## Generations Router

**Prefix**: `generations.*`

### `generations.getCredits`

Get credit balance for generation features.

| Type | Query |
|------|-------|
| **Input** | None |
| **Output** | `{ balance: number, used: number }` |

### `generations.getGodfatherOffer`

Get generated offer for a project.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `GodfatherOffer | null` |

### `generations.startOfferWorkflow`

Trigger the Godfather Offer generation workflow.

| Type | Mutation |
|------|----------|
| **Input** | `{ projectId: string }` |
| **Output** | `{ success: boolean, error?: string }` |

**Side Effects**:
- Triggers `startGodfatherOffer()` via RPC to data-service

### `generations.getGenerations`

Get all generated content for a project.

| Type | Query |
|------|-------|
| **Input** | `{ projectId: string }` |
| **Output** | `GeneratedContent[]` |

---

## Service Binding RPC Methods

The frontend worker calls the data-service worker via Cloudflare Service Bindings.

**Binding Name**: `BACKEND_SERVICE`

### `startHaloResearchV2`

```typescript
await ctx.env.BACKEND_SERVICE.startHaloResearchV2(
  projectId: string,
  topic: string,
  userId: string,
  runId: string,
  options?: {
    targetAudience?: string,
    productDescription?: string
  }
);
```

Triggers the 6-phase HALO research workflow.

### `startGodfatherOffer`

```typescript
await ctx.env.BACKEND_SERVICE.startGodfatherOffer({
  projectId: string
});
```

Triggers the Godfather Offer generation workflow.

---

## Error Handling

All procedures can throw tRPC errors:

| Code | Meaning |
|------|---------|
| `UNAUTHORIZED` | Missing or invalid session |
| `NOT_FOUND` | Resource doesn't exist |
| `INTERNAL_SERVER_ERROR` | Backend service unavailable |

**Example Error Response**:
```json
{
  "error": {
    "message": "Project not found",
    "code": -32004,
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "path": "projects.getById"
    }
  }
}
```

---

## Client Usage (React)

```typescript
// src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/worker/trpc/app-router';

export const trpc = createTRPCReact<AppRouter>();

// Component usage
function ProjectList() {
  const { data, isLoading } = trpc.projects.list.useQuery({ limit: 20 });
  const deleteMutation = trpc.projects.delete.useMutation();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
  };

  return (
    <ul>
      {data?.items.map(project => (
        <li key={project.id}>
          {project.name}
          <button onClick={() => handleDelete(project.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## Polling Pattern

For workflow status monitoring, use conditional polling:

```typescript
const { data: research } = trpc.marketResearch.getResearch.useQuery(
  { projectId },
  {
    refetchInterval: (data) => {
      // Poll every 3s while processing, stop when complete
      return data?.workflowRun?.status === 'running' ? 3000 : false;
    }
  }
);
```
