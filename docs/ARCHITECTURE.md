# System Architecture

> Full-Stack Market Research SaaS Platform on Cloudflare

## Overview

This is a **monorepo-based SaaS application** for AI-powered market research and competitive intelligence. Built entirely on Cloudflare's edge infrastructure with React frontend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLOUDFLARE EDGE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐         ┌──────────────────────────────────┐  │
│  │   USER-APPLICATION   │         │         DATA-SERVICE             │  │
│  │     (Frontend)       │  RPC    │          (Backend)               │  │
│  │                      │ ◄─────► │                                  │  │
│  │  • React 19 SPA      │         │  • Hono HTTP Server              │  │
│  │  • TanStack Router   │         │  • Cloudflare Workflows          │  │
│  │  • tRPC Client       │         │  • Durable Objects               │  │
│  │  • Tailwind CSS      │         │  • Queue Handlers                │  │
│  └──────────┬───────────┘         └──────────────┬───────────────────┘  │
│             │                                     │                      │
│             │                                     │                      │
│             ▼                                     ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SHARED PACKAGES                               │   │
│  │                                                                   │   │
│  │  ┌─────────────────────┐    ┌─────────────────────────────────┐  │   │
│  │  │    @repo/data-ops   │    │     @repo/agent-logic          │  │   │
│  │  │                     │    │                                 │  │   │
│  │  │  • Drizzle Schema   │    │  • Multi-Phase AI Agents       │  │   │
│  │  │  • Query Functions  │    │  • RAG System                  │  │   │
│  │  │  • Zod Schemas      │    │  • Web Search Tools            │  │   │
│  │  │  • Better Auth      │    │  • Browser Automation          │  │   │
│  │  └─────────────────────┘    └─────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                        CLOUDFLARE BINDINGS                               │
│                                                                          │
│   D1 Database    │   Vectorize    │   Queues    │   KV Cache            │
│   (SQLite)       │   (Embeddings) │   (Async)   │   (State)             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Cloudflare Workers | Edge compute, serverless |
| **Frontend Framework** | React 19 | UI rendering |
| **Routing** | TanStack Router | File-based routing with type safety |
| **API Layer** | tRPC | End-to-end type-safe RPC |
| **HTTP Server** | Hono | Lightweight web framework |
| **Database** | Drizzle ORM + D1 | SQLite on Cloudflare |
| **Vector DB** | Cloudflare Vectorize | Semantic search, RAG |
| **Auth** | Better Auth | Session management, OAuth |
| **Payments** | Stripe | Subscriptions, billing |
| **AI** | OpenAI + Workers AI | Language models, embeddings |
| **Search** | Tavily API | Web research |
| **Styling** | Tailwind CSS 4 | Utility-first CSS |
| **UI Components** | Radix UI | Accessible primitives |

## Monorepo Structure

```
full-stack/
├── apps/
│   ├── data-service/          # Backend Worker
│   │   ├── src/
│   │   │   ├── index.ts       # Worker entrypoint
│   │   │   ├── workflows/     # Cloudflare Workflows
│   │   │   ├── durable-objects/
│   │   │   ├── queues/
│   │   │   ├── helpers/
│   │   │   └── routes/        # Hono routes
│   │   └── wrangler.toml      # Cloudflare config
│   │
│   └── user-application/      # Frontend + API Worker
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── routes/        # TanStack file routes
│       │   ├── lib/           # Utilities
│       │   └── stores/        # Zustand stores
│       ├── worker/
│       │   ├── hono/          # Hono HTTP handlers
│       │   └── trpc/          # tRPC routers
│       └── wrangler.toml
│
├── packages/
│   ├── data-ops/              # Shared data layer
│   │   ├── src/
│   │   │   ├── schema.ts      # Drizzle tables
│   │   │   ├── queries/       # Query functions
│   │   │   ├── zod/           # Validation schemas
│   │   │   └── auth.ts        # Auth configuration
│   │   └── package.json
│   │
│   └── agent-logic/           # AI agent system
│       ├── src/
│       │   ├── agents/        # Phase agents
│       │   ├── prompts/       # AI prompts
│       │   ├── tools/         # Web search, browser
│       │   └── rag.ts         # Vector search
│       └── package.json
│
├── package.json               # Root workspace config
└── pnpm-workspace.yaml        # pnpm workspace definition
```

## Request Flow

### 1. Standard API Request

```
Browser                User-Application Worker              Data-Service Worker
   │                           │                                    │
   │  HTTP Request             │                                    │
   ├──────────────────────────►│                                    │
   │                           │                                    │
   │                    ┌──────┴──────┐                             │
   │                    │ Hono Router │                             │
   │                    │             │                             │
   │                    │ Auth Check  │                             │
   │                    └──────┬──────┘                             │
   │                           │                                    │
   │                    ┌──────┴──────┐                             │
   │                    │ tRPC Router │                             │
   │                    └──────┬──────┘                             │
   │                           │                                    │
   │                           │  Service Binding RPC               │
   │                           ├───────────────────────────────────►│
   │                           │                                    │
   │                           │◄───────────────────────────────────┤
   │                           │                                    │
   │  JSON Response            │                                    │
   │◄──────────────────────────┤                                    │
```

### 2. Workflow Execution

```
tRPC Call                 Data-Service                    Cloudflare
    │                         │                           Workflows
    │  startHaloResearchV2()  │                              │
    ├────────────────────────►│                              │
    │                         │                              │
    │                         │  create(workflowId, params)  │
    │                         ├─────────────────────────────►│
    │                         │                              │
    │                         │◄─ instance reference ────────┤
    │                         │                              │
    │◄── workflowId ──────────┤                              │
    │                         │                              │
    │                         │      Workflow Execution      │
    │                         │                              │
    │                         │   ┌──────────────────────┐   │
    │                         │   │  Phase 1: Discovery  │   │
    │                         │   │  Phase 2: Listening  │   │
    │                         │   │  Phase 3: Classify   │   │
    │                         │   │  Phase 4: Avatar     │   │
    │                         │   │  Phase 5: Problem    │   │
    │                         │   │  Phase 6: HVCO       │   │
    │                         │   └──────────────────────┘   │
    │                         │                              │
    │  poll getResearch()     │                              │
    ├────────────────────────►│                              │
    │                         │                              │
    │◄── research data ───────┤                              │
```

## Deployment Environments

| Environment | Frontend URL | Backend Service |
|-------------|-------------|-----------------|
| **Development** | localhost:3000 | localhost:8787 |
| **Staging** | *.pages.dev | data-service-stage |
| **Production** | production domain | data-service-production |

### Cloudflare Bindings (per environment)

```toml
# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "saas-db"
database_id = "xxx"

# Vectorize (RAG)
[[vectorize]]
binding = "KNOWLEDGE_BASE"
index_name = "saas-knowledge"

# Service Bindings
[[services]]
binding = "BACKEND_SERVICE"
service = "data-service-stage"

# Queues
[[queues.producers]]
binding = "ASYNC_QUEUE"
queue = "processing-queue"

# Workflows
[[workflows]]
binding = "HALO_RESEARCH_WORKFLOW_V2"
name = "halo-research-v2"
class_name = "HaloResearchWorkflowV2"
```

## Key Design Decisions

### 1. Monorepo with pnpm Workspaces
- **Why**: Shared types, schemas, and utilities between frontend/backend
- **Trade-off**: Build complexity vs. code reuse

### 2. Cloudflare-Native Architecture
- **Why**: Global edge deployment, integrated services (D1, Vectorize, Queues)
- **Trade-off**: Vendor lock-in vs. operational simplicity

### 3. tRPC for API Layer
- **Why**: End-to-end type safety, no code generation
- **Trade-off**: Cloudflare Workers compatibility requires careful setup

### 4. Multi-Phase Workflow System
- **Why**: Complex AI operations need retry logic, state persistence
- **Trade-off**: Workflow complexity vs. reliability

### 5. Drizzle ORM over Prisma
- **Why**: Better Cloudflare D1 support, smaller bundle size
- **Trade-off**: Less mature ecosystem

## Related Documentation

- [Data Model](./DATA-MODEL.md) - Database schema and relationships
- [API Reference](./API-REFERENCE.md) - tRPC routers and procedures
- [Workflow System](./WORKFLOWS.md) - AI agent orchestration
- [Frontend Architecture](./FRONTEND.md) - React component structure
- [Developer Guide](./DEVELOPER-GUIDE.md) - Setup and contribution guide
