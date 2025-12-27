# Frontend Architecture

> React 19 SPA with TanStack Router and tRPC

## Overview

The frontend is a **React 19 Single Page Application** deployed as a Cloudflare Worker with static asset serving.

**Key Technologies**:
- React 19 with hooks and suspense
- TanStack Router (file-based routing)
- TanStack Query (server state management)
- tRPC (type-safe API client)
- Tailwind CSS 4 (styling)
- Radix UI (accessible primitives)
- Zustand (client state)
- Better Auth (authentication)

## Directory Structure

```
apps/user-application/
├── src/
│   ├── main.tsx              # React DOM mount
│   ├── router.tsx            # TanStack Router config
│   ├── routeTree.gen.ts      # Auto-generated route tree
│   ├── routes/               # File-based routes
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Landing page (/)
│   │   └── app/
│   │       ├── _authed.tsx   # Auth guard layout
│   │       └── _authed/      # Protected routes
│   ├── components/           # React components
│   │   ├── ui/               # Radix UI primitives
│   │   ├── common/           # Shared components
│   │   ├── dashboard/        # Dashboard features
│   │   ├── research/         # Research display
│   │   ├── agent/            # Chat agent
│   │   ├── auth/             # Authentication
│   │   ├── payments/         # Subscription
│   │   └── home-page/        # Landing page
│   ├── lib/                  # Utilities
│   │   ├── trpc.ts           # tRPC client
│   │   ├── utils.ts          # Helpers
│   │   └── auth-client.ts    # Better Auth client
│   └── stores/               # Zustand stores
├── worker/                   # Cloudflare Worker backend
│   ├── hono/                 # Hono HTTP handlers
│   └── trpc/                 # tRPC server
├── public/                   # Static assets
└── vite.config.ts            # Vite configuration
```

---

## Routing

### File-Based Routes

TanStack Router uses a file-based routing convention:

| File | Route | Purpose |
|------|-------|---------|
| `__root.tsx` | Layout | App shell, providers |
| `index.tsx` | `/` | Landing page |
| `app/_authed.tsx` | Layout | Auth guard |
| `app/_authed/index.tsx` | `/app` | Dashboard home |
| `app/_authed/agent.tsx` | `/app/agent` | Chat agent |
| `app/_authed/upgrade.tsx` | `/app/upgrade` | Subscription |
| `app/_authed/projects.new.tsx` | `/app/projects/new` | Create project |
| `app/_authed/projects/index.tsx` | `/app/projects` | Project list |
| `app/_authed/projects.$projectId.tsx` | `/app/projects/:id` | Project detail |
| `app/_authed/projects.$projectId.research.tsx` | `/app/projects/:id/research` | Research results |
| `app/_authed/projects.$projectId.competitors.tsx` | `/app/projects/:id/competitors` | Competitor intel |
| `app/_authed/projects.$projectId.offer.tsx` | `/app/projects/:id/offer` | Offer generation |

### Route Structure

```
/                           # Landing page (public)
└── /app                    # Authenticated area
    ├── /                   # Dashboard home
    ├── /agent              # Chat agent
    ├── /upgrade            # Subscription management
    └── /projects
        ├── /               # Project list
        ├── /new            # Create project
        └── /:projectId     # Project detail
            ├── /research   # Research results
            ├── /competitors # Competitor analysis
            └── /offer      # Offer generation
```

### Auth Guard Pattern

```typescript
// routes/app/_authed.tsx
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/app/_authed')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.user) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
```

---

## Component Architecture

### Component Categories

| Category | Purpose | Count |
|----------|---------|-------|
| `ui/` | Radix UI primitives | 27 |
| `common/` | Shared utilities | 8 |
| `dashboard/` | Project management | 6 |
| `research/` | Research display | 2 |
| `agent/` | Chat interface | 2 |
| `auth/` | Login/user | 2 |
| `payments/` | Subscription | 3 |
| `home-page/` | Landing page | 7 |

### UI Components (Radix Primitives)

Located in `components/ui/`, these are accessible building blocks:

- **Layout**: `card`, `separator`, `sidebar`, `sheet`, `drawer`
- **Forms**: `input`, `textarea`, `select`, `checkbox`, `switch`, `label`
- **Feedback**: `alert`, `alert-dialog`, `dialog`, `popover`, `tooltip`
- **Data**: `table`, `badge`, `avatar`, `skeleton`
- **Navigation**: `tabs`, `breadcrumb`, `dropdown-menu`, `command`
- **Actions**: `button`, `toggle`, `toggle-group`

### Key Business Components

#### `dashboard/research-results.tsx`

Displays HALO research output with:
- Avatar summary card
- Hopes & Dreams section
- Pains & Fears section
- Vernacular glossary
- Source list

#### `dashboard/full-research-report.tsx`

Extended research report with all dimensions:
- 9-dimension avatar breakdown
- Day-in-the-life timeline
- Competitor gaps
- Problem identification
- HVCO title options

#### `dashboard/project-card.tsx`

Project list item with:
- Status badge
- Progress indicator
- Actions (view, delete)

#### `research/SourcesTable.tsx`

Data table for research sources:
- Source type filtering
- Sophistication scoring
- Exclude/include toggle
- URL links

#### `research/WorkflowProgress.tsx`

Workflow status tracker:
- Phase-by-phase progress
- Current step indicator
- Error display

#### `agent/agent-workspace.tsx`

WebSocket chat interface:
- Message history
- Input field
- Loading states
- Error handling

---

## State Management

### Server State (TanStack Query + tRPC)

```typescript
// Queries - fetch and cache server data
const { data: projects } = trpc.projects.list.useQuery({ limit: 20 });
const { data: research } = trpc.marketResearch.getResearch.useQuery(
  { projectId },
  {
    refetchInterval: (data) =>
      data?.workflowRun?.status === 'running' ? 3000 : false,
  }
);

// Mutations - modify server data
const createProject = trpc.marketResearch.createProject.useMutation();
const deleteProject = trpc.projects.delete.useMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

### Client State (Zustand)

For UI state that doesn't belong on the server:

```typescript
// stores/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

---

## tRPC Client Setup

```typescript
// lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/worker/trpc/app-router';

export const trpc = createTRPCReact<AppRouter>();

// Provider setup in router.tsx
function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/trpc',
          headers: () => ({}), // Cookies handled automatically
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

## Styling

### Tailwind CSS 4

```typescript
// Component example
function ProjectCard({ project }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {project.name}
        </h3>
        <Badge variant={project.status === 'complete' ? 'success' : 'default'}>
          {project.status}
        </Badge>
      </div>
    </Card>
  );
}
```

### CSS Variables (Theme)

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

### Theme Toggle

```typescript
// components/common/mode-toggle.tsx
import { useTheme } from 'next-themes';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
```

---

## Authentication

### Better Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: '/api/auth',
});

// Usage in components
function LoginButton() {
  const { signIn } = authClient;

  return (
    <Button onClick={() => signIn.social({ provider: 'google' })}>
      Sign in with Google
    </Button>
  );
}
```

### Session Hook

```typescript
// In protected routes
const { data: session } = authClient.useSession();

if (!session?.user) {
  return <LoginPopup />;
}
```

---

## Data Fetching Patterns

### Basic Query

```typescript
function ProjectList() {
  const { data, isLoading, error } = trpc.projects.list.useQuery({ limit: 20 });

  if (isLoading) return <Skeleton />;
  if (error) return <Alert variant="destructive">{error.message}</Alert>;

  return (
    <div className="grid gap-4">
      {data?.items.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Polling for Updates

```typescript
function ResearchProgress({ projectId }) {
  const { data } = trpc.marketResearch.getWorkflowProgress.useQuery(
    { projectId },
    {
      refetchInterval: (data) => {
        // Poll every 3s while running, stop when complete
        return data?.status === 'running' ? 3000 : false;
      },
    }
  );

  return <WorkflowProgress run={data} />;
}
```

### Optimistic Updates

```typescript
function DeleteButton({ projectId }) {
  const queryClient = useQueryClient();
  const deleteMutation = trpc.projects.delete.useMutation({
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['projects']);

      // Optimistically remove from list
      queryClient.setQueryData(['projects'], (old) =>
        old?.items.filter((p) => p.id !== id)
      );

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['projects'], context?.previous);
    },
    onSettled: () => {
      // Refetch to sync
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return (
    <Button
      variant="destructive"
      onClick={() => deleteMutation.mutate({ id: projectId })}
    >
      Delete
    </Button>
  );
}
```

---

## Build & Development

### Development

```bash
# Start frontend dev server
pnpm dev-frontend      # Vite on localhost:3000

# Start with backend
pnpm dev-data-service  # Wrangler on localhost:8787
```

### Build

```bash
# Build shared packages first
pnpm build-package

# Build frontend
pnpm --filter user-application build
```

### Deploy

```bash
# Staging
pnpm stage:deploy-frontend

# Production
pnpm production:deploy-frontend
```

---

## Performance Considerations

1. **Code Splitting**: TanStack Router lazy-loads routes
2. **Query Caching**: TanStack Query caches server responses
3. **Skeleton Loading**: Show skeletons during data fetch
4. **Conditional Polling**: Only poll when workflow is running
5. **Optimistic Updates**: Immediate UI feedback on mutations
