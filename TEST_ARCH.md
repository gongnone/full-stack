# Test Architecture & Strategy

This document outlines the testing strategy, patterns, and infrastructure for the SaaS Monorepo.

## 1. Testing Pyramid Strategy

We follow a modified testing pyramid suited for Cloudflare-based full-stack apps:

| Level | Scope | Tools | Responsibility | Coverage Goal |
|-------|-------|-------|----------------|---------------|
| **E2E** | Full System Flows | Playwright | `apps/foundry-dashboard/e2e` | Critical User Stories (100%) |
| **Integration** | API Routers & DB | Vitest + Mocks | `worker/trpc/routers` | P0/P1 APIs (100%) |
| **Unit (Components)** | React UI Logic | Vitest + RTL | `src/components` | Complex Components (80%) |
| **Unit (Backend)** | Durable Objects | Vitest + Mocks | `apps/data-service/src/do` | Core Logic (80%) |

---

## 2. Mocking & Isolation Patterns

### A. Frontend (Component Tests)
We do **not** use a real backend for component tests. We mock the tRPC client.

**Pattern:**
```typescript
import { vi } from 'vitest';
// Mock tRPC client hooks
vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    hubs: {
      getExtractionProgress: {
        useQuery: vi.fn().mockReturnValue({ data: ..., isLoading: false }),
      },
    },
  },
}));
```

### B. API Routers (Backend Tests)
We test tRPC routers in isolation by creating a "Mock Context". We do **not** spin up a real database or Cloudflare Worker environment.

**Pattern:**
```typescript
// worker/trpc/routers/__tests__/utils.ts
export const createMockContext = () => ({
  db: { prepare: vi.fn(), ... },
  callAgent: vi.fn(), // Mock internal Durable Object calls
  env: { AI: { run: vi.fn() } }, // Mock Cloudflare bindings
});
```

### C. Durable Objects (Deep Backend)
We test Durable Objects by mocking the `state` and `env`.

**Pattern:**
```typescript
const mockState = {
  storage: { get: vi.fn(), put: vi.fn() },
  blockConcurrencyWhile: (cb) => cb(),
};
const tracker = new IngestionTracker(mockState, mockEnv);
```

---

## 3. Directory Structure

```
apps/foundry-dashboard/
├── e2e/                     # Playwright E2E tests
├── src/
│   ├── components/
│   │   └── [Feature]/
│   │       ├── Component.tsx
│   │       └── Component.test.tsx  # Unit tests next to code
├── worker/
│   └── trpc/
│       └── routers/
│           └── __tests__/   # API Router tests
```

## 4. Automation & Commands

The project is configured with a root `vitest.workspace.ts`.

*   **Run All Tests:** `pnpm test`
*   **Run E2E Tests:** `pnpm --filter foundry-dashboard test:e2e`
*   **Run Watch Mode:** `pnpm test:watch`

## 5. Visual Regression & A11y (Quality)

*   **Visual Regression:** `apps/foundry-dashboard/e2e/visual-regression.spec.ts`
*   **Accessibility:** `apps/foundry-dashboard/e2e/accessibility.spec.ts`

These tests run in parallel with logic tests and use Playwright to verify UI stability.
