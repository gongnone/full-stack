# Implementation Plan: SENTRY-1 Error Tracking Installation

**Story ID:** SENTRY-1-error-tracking-installation
**Assignee:** TBD
**Estimated Effort:** 4-6 hours
**Configuration:** Option A (Single project + environment tags)
**Priority:** P1

---

## Overview

Install Sentry error tracking on **both** staging and production URLs using a single Sentry project with environment tags. This enables real-time error monitoring, stack traces, and alerting across both environments while keeping costs at $26/month.

**URLs to configure:**
- Stage: `https://foundry-stage.williamjshaw.ca`
- Production: `https://foundry.williamjshaw.ca`

**Key principle:** Same DSN, different `ENVIRONMENT` variable.

---

## Pre-Implementation Checklist

Before starting, ensure you have:

- [ ] **Sentry Account Access**
  - Free Sentry account created at https://sentry.io/signup/
  - Organization created (e.g., "The Foundry Agency")
  - Budget approved: $26/month (Developer plan)

- [ ] **Cloudflare Access**
  - Access to Cloudflare dashboard
  - Permissions to edit foundry-dashboard-stage Workers
  - Permissions to edit foundry-dashboard (production) Workers

- [ ] **GitHub Access**
  - Access to repository secrets
  - Ability to create/modify GitHub Actions workflows

- [ ] **Development Environment**
  - Local clone of `full-stack` repository
  - Node.js and pnpm installed
  - Ability to deploy to staging for testing

---

## Phase 1: Sentry Project Setup (15 minutes)

### Step 1.1: Create Sentry Project

1. Go to https://sentry.io and log in
2. Create organization (if not exists):
   - Name: "The Foundry Agency" (or your preference)
   - Click "Create Organization"
3. Create project:
   - Click "Create Project"
   - Platform: **React**
   - Alert frequency: **On every new issue**
   - Project name: `foundry-dashboard`
   - Team: Default
   - Click "Create Project"
4. **SAVE THE DSN** (you'll need this for all environments)
   - Format: `https://[key]@[org].ingest.sentry.io/[project]`
   - Example: `https://abc123xyz@o123456.ingest.sentry.io/7890123`

### Step 1.2: Enable Environment Feature

1. Go to Project Settings → Environments
2. Enable "Environments" feature
3. Add environments:
   - `development` (local dev)
   - `stage` (staging server)
   - `production` (production server)

### Step 1.3: Create Auth Token for CI/CD

1. Go to Settings → Auth Tokens
2. Click "Create New Token"
3. Scopes needed:
   - `project:read`
   - `project:releases`
   - `org:read`
4. Token name: "GitHub Actions - Source Maps"
5. **SAVE THE TOKEN** (you'll add this to GitHub secrets)

---

## Phase 2: Worker Integration (2-3 hours)

### Step 2.1: Install Sentry SDK

```bash
cd apps/foundry-dashboard
pnpm add @sentry/cloudflare @sentry/core
```

**Verify installation:**
```bash
grep "@sentry/cloudflare" package.json
# Should show: "@sentry/cloudflare": "^x.x.x"
```

### Step 2.2: Create Sentry Configuration File

**File:** `apps/foundry-dashboard/worker/sentry.ts` (NEW FILE)

```typescript
import * as Sentry from '@sentry/cloudflare';

export interface SentryEnv {
  SENTRY_DSN?: string;
  ENVIRONMENT?: string;
  SENTRY_RELEASE?: string;
}

/**
 * Initialize Sentry for Cloudflare Workers
 * Same DSN used for all environments (stage, production)
 * Environment differentiation via ENVIRONMENT variable
 */
export function initSentry(env: SentryEnv): void {
  // Skip Sentry in local dev if DSN not set
  if (!env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error tracking disabled');
    return;
  }

  const environment = env.ENVIRONMENT || 'development';
  const isProduction = environment === 'production';

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment,
    release: env.SENTRY_RELEASE || 'unknown',

    // Stage: 100% sampling (low traffic)
    // Production: 10% sampling (high traffic, cost control)
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    integrations: [
      Sentry.cloudflareWorkersIntegration(),
    ],

    beforeSend(event, hint) {
      // Redact sensitive data before sending to Sentry
      if (event.request?.headers) {
        // Remove auth tokens
        delete event.request.headers['Authorization'];
        delete event.request.headers['authorization'];
        delete event.request.headers['Cookie'];
        delete event.request.headers['cookie'];
      }

      // Redact sensitive request data
      if (event.request?.data) {
        const data = event.request.data as any;
        if (data.password) delete data.password;
        if (data.token) delete data.token;
        if (data.secret) delete data.secret;
      }

      return event;
    },
  });

  console.log(`Sentry initialized for environment: ${environment}`);
}

/**
 * Capture Worker-specific error with context
 */
export function captureWorkerError(
  error: Error,
  context: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    scope.setContext('worker', context);
    Sentry.captureException(error);
  });
}
```

**Save file and verify:**
```bash
ls -la worker/sentry.ts
# Should exist
```

### Step 2.3: Update Worker Entry Point

**File:** `apps/foundry-dashboard/worker/index.ts`

**Add import at top:**
```typescript
import { initSentry } from './sentry';
```

**Wrap fetch handler:**
```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Initialize Sentry FIRST
    initSentry(env);

    try {
      return await app.fetch(request, env, ctx);
    } catch (error) {
      // Capture uncaught errors
      Sentry.captureException(error);
      throw error; // Re-throw to maintain existing error handling
    }
  }
};
```

### Step 2.4: Add tRPC Error Handler

**File:** `apps/foundry-dashboard/worker/trpc/index.ts`

**Add import:**
```typescript
import * as Sentry from '@sentry/cloudflare';
```

**Add `.onError()` handler to tRPC router:**
```typescript
const t = initTRPC.context<Context>().create({
  errorFormatter({ error, shape, path, input, ctx }) {
    // Log error to Sentry with tRPC context
    Sentry.withScope((scope) => {
      scope.setTag('trpc.path', path || 'unknown');
      scope.setTag('trpc.code', error.code);
      scope.setContext('trpc.input', input);

      // Add user context if available
      if (ctx?.session?.userId) {
        scope.setUser({
          id: ctx.session.userId,
          email: ctx.session.user?.email,
        });
      }

      Sentry.captureException(error);
    });

    // Log to console for immediate visibility
    console.error(`tRPC error on ${path}:`, error);

    return shape;
  },
});
```

### Step 2.5: Add Durable Object Error Tracking

**File:** `apps/foundry-dashboard/worker/durable-objects/BrandDNAAgent.ts`

**Add imports:**
```typescript
import * as Sentry from '@sentry/cloudflare';
import { initSentry } from '../sentry';
```

**In constructor:**
```typescript
export class BrandDNAAgent implements DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;

    // Initialize Sentry per DO instance
    initSentry(env);
  }

  async fetch(request: Request): Promise<Response> {
    try {
      // ... existing logic
    } catch (error) {
      // Capture DO errors with context
      Sentry.withScope((scope) => {
        scope.setTag('durable_object', 'BrandDNAAgent');
        scope.setContext('do_state', {
          id: this.state.id.toString(),
        });
        Sentry.captureException(error);
      });

      throw error;
    }
  }
}
```

### Step 2.6: Test Worker Integration Locally

```bash
cd apps/foundry-dashboard

# Set local env vars for testing
export SENTRY_DSN="https://[your-key]@[org].ingest.sentry.io/[project]"
export ENVIRONMENT="development"

# Run dev server
pnpm run dev

# In another terminal, trigger test error
curl http://localhost:8787/test-error

# Check Sentry dashboard - error should appear with environment:development
```

---

## Phase 3: React Frontend Integration (1-2 hours)

### Step 3.1: Install React SDK

```bash
cd apps/foundry-dashboard
pnpm add @sentry/react
```

### Step 3.2: Initialize Sentry in App Entry

**File:** `apps/foundry-dashboard/src/entry.client.tsx`

**Add imports:**
```typescript
import * as Sentry from '@sentry/react';
```

**Add initialization BEFORE ReactDOM.render:**
```typescript
// Initialize Sentry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.VITE_ENVIRONMENT || 'development';

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment,
    release: import.meta.env.VITE_SENTRY_RELEASE || 'unknown',

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Stage: 100%, Production: 10%
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

    // Session replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // Always capture on error

    beforeSend(event) {
      // Redact sensitive form data
      if (event.request?.data) {
        const data = event.request.data as any;
        if (data.password) delete data.password;
        if (data.token) delete data.token;
      }
      return event;
    },
  });

  console.log(`Sentry React initialized for ${environment}`);
} else {
  console.warn('Sentry DSN not configured - error tracking disabled');
}

// ... existing ReactDOM.render
```

### Step 3.3: Create Error Boundary Component

**File:** `apps/foundry-dashboard/src/components/errors/SentryErrorBoundary.tsx` (NEW FILE)

```typescript
import * as Sentry from '@sentry/react';
import { useNavigate } from '@tanstack/react-router';

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full text-center p-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  resetError();
                  navigate({ to: '/' });
                }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 border border-input rounded-md hover:bg-accent"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )}
      showDialog={false}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

### Step 3.4: Wrap App with Error Boundary

**File:** `apps/foundry-dashboard/src/app.tsx`

**Add import:**
```typescript
import { SentryErrorBoundary } from './components/errors/SentryErrorBoundary';
```

**Wrap RouterProvider:**
```typescript
export function App() {
  return (
    <SentryErrorBoundary>
      <RouterProvider router={router} />
    </SentryErrorBoundary>
  );
}
```

### Step 3.5: Integrate with tRPC Client

**File:** `apps/foundry-dashboard/src/lib/trpc.ts`

**Update tRPC client links:**
```typescript
import * as Sentry from '@sentry/react';

export const trpcClient = trpc.createClient({
  links: [
    // Add Sentry breadcrumb tracking
    ({ op, next }) => {
      return next(op).pipe(
        tap({
          next(result) {
            // Track successful mutations
            if (op.type === 'mutation') {
              Sentry.addBreadcrumb({
                category: 'trpc.mutation',
                message: `${op.path} succeeded`,
                level: 'info',
              });
            }
          },
          error(error) {
            // Capture tRPC errors
            Sentry.withScope((scope) => {
              scope.setTag('trpc.path', op.path);
              scope.setTag('trpc.type', op.type);
              scope.setContext('trpc.input', op.input);
              Sentry.captureException(error);
            });
          },
        })
      );
    },
    // ... existing links (httpBatchLink, etc.)
  ],
});
```

---

## Phase 4: Environment Configuration (30 minutes)

### Step 4.1: Configure Staging Environment

**Cloudflare Dashboard:**
1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages → foundry-dashboard-stage
3. Click Settings → Variables
4. Add **Environment Variables** (NOT Secrets):

```
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]
ENVIRONMENT = stage
SENTRY_RELEASE = ${CF_PAGES_COMMIT_SHA}
```

**Frontend env vars:**
5. Click Settings → Environment Variables
6. Add for **Production** (Pages deployment):

```
VITE_SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]
VITE_ENVIRONMENT = stage
VITE_SENTRY_RELEASE = ${CF_PAGES_COMMIT_SHA}
```

### Step 4.2: Configure Production Environment

**Cloudflare Dashboard:**
1. Navigate to Workers & Pages → foundry-dashboard (production)
2. Click Settings → Variables
3. Add same variables with different `ENVIRONMENT`:

```
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
ENVIRONMENT = production  # DIFFERENT
SENTRY_RELEASE = ${CF_PAGES_COMMIT_SHA}
```

**Frontend env vars:**
4. Add for **Production** (Pages):

```
VITE_SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
VITE_ENVIRONMENT = production  # DIFFERENT
VITE_SENTRY_RELEASE = ${CF_PAGES_COMMIT_SHA}
```

### Step 4.3: Add GitHub Secrets

**GitHub Repository:**
1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets:

```
SENTRY_AUTH_TOKEN = [token from Step 1.3]
SENTRY_ORG = [your-org-slug]
SENTRY_PROJECT = foundry-dashboard
```

---

## Phase 5: Source Maps & CI/CD (1-2 hours)

### Step 5.1: Install Sentry Vite Plugin

```bash
cd apps/foundry-dashboard
pnpm add -D @sentry/vite-plugin
```

### Step 5.2: Configure Vite for Source Maps

**File:** `apps/foundry-dashboard/vite.config.ts`

**Add import:**
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';
```

**Update config:**
```typescript
export default defineConfig({
  build: {
    sourcemap: true, // Enable source maps for production
  },
  plugins: [
    // ... existing plugins (react, tanstackRouter, etc.)

    // Add Sentry plugin LAST
    process.env.SENTRY_AUTH_TOKEN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
      release: {
        name: process.env.SENTRY_RELEASE || process.env.CF_PAGES_COMMIT_SHA,
      },
    }),
  ].filter(Boolean), // Remove undefined plugins
});
```

### Step 5.3: Update GitHub Actions for Stage

**File:** `.github/workflows/deploy-stage.yaml`

**Add Sentry environment variables to build step:**
```yaml
- name: Build Frontend
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_ENVIRONMENT: stage
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: foundry-dashboard
    SENTRY_RELEASE: ${{ github.sha }}
  run: |
    cd apps/foundry-dashboard
    pnpm run build
```

**Add source map upload step:**
```yaml
- name: Upload Source Maps to Sentry
  if: success()
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: foundry-dashboard
  run: |
    pnpm sentry-cli releases new ${{ github.sha }}
    pnpm sentry-cli releases set-commits ${{ github.sha }} --auto
    pnpm sentry-cli releases finalize ${{ github.sha }}
    pnpm sentry-cli releases deploys ${{ github.sha }} new -e stage
```

### Step 5.4: Update GitHub Actions for Production

**File:** `.github/workflows/deploy-production.yaml`

**Same as stage but with `VITE_ENVIRONMENT: production`:**
```yaml
- name: Build Frontend
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_ENVIRONMENT: production  # DIFFERENT
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: foundry-dashboard
    SENTRY_RELEASE: ${{ github.sha }}
  run: |
    cd apps/foundry-dashboard
    pnpm run build
```

**Deploy step:**
```yaml
- name: Upload Source Maps to Sentry
  if: success()
  run: |
    pnpm sentry-cli releases deploys ${{ github.sha }} new -e production  # DIFFERENT
```

---

## Phase 6: Testing & Validation (1 hour)

### Step 6.1: Test Staging Environment

**Deploy to staging:**
```bash
git checkout stage
git add .
git commit -m "feat(monitoring): add Sentry error tracking for stage + production"
git push origin stage
```

**Wait for GitHub Actions to complete, then test:**

1. **Test Worker Error:**
```bash
# Trigger tRPC error
curl https://foundry-stage.williamjshaw.ca/trpc/test.throwError
```

2. **Test React Error:**
- Open https://foundry-stage.williamjshaw.ca
- Open browser console
- Run: `throw new Error("Sentry React test error")`

3. **Check Sentry Dashboard:**
- Go to https://sentry.io/organizations/[org]/issues/
- Filter: `environment:stage`
- Should see both errors with full stack traces

4. **Verify Source Maps:**
- Click on error
- Stack trace should show TypeScript files (not minified JS)
- Example: `worker/trpc/routers/test.ts:42` (not `chunk-abc123.js:4567`)

### Step 6.2: Test Production Environment

**Merge to production:**
```bash
git checkout main
git merge stage
git push origin main
```

**Test production (same as staging):**
- Trigger errors on https://foundry.williamjshaw.ca
- Filter Sentry: `environment:production`
- Verify errors appear with correct environment tag

### Step 6.3: Verify Environment Separation

**Sentry Dashboard Test:**
1. Go to Issues page
2. Apply filter: `environment:stage`
   - Should only show staging errors
3. Apply filter: `environment:production`
   - Should only show production errors
4. Remove filter
   - Should show errors from BOTH environments

---

## Phase 7: Alert Configuration (30 minutes)

### Step 7.1: Configure Staging Alerts

**Sentry Dashboard:**
1. Go to Alerts → Create Alert Rule
2. Alert name: "Staging - New Error Type"
3. Environment: `stage`
4. When: `A new issue is created`
5. Then: `Send a notification via Slack` → #foundry-staging-alerts
6. Save

**Create second alert:**
1. Alert name: "Staging - Error Rate Spike"
2. Environment: `stage`
3. When: `Number of events > 50 in 1 minute`
4. Then: Email to dev on-call
5. Save

### Step 7.2: Configure Production Alerts

1. Alert name: "Production - Critical Error"
2. Environment: `production`
3. When: `A new issue is created`
4. Then:
   - Slack #foundry-alerts
   - Email to on-call
5. Save

**Create second alert:**
1. Alert name: "Production - Error Rate Spike"
2. Environment: `production`
3. When: `Number of events > 10 in 1 minute`
4. Then: Slack #foundry-alerts (urgent)
5. Save

### Step 7.3: Test Alerts

**Trigger staging alert:**
```bash
# Create unique error to trigger "new issue"
curl -X POST https://foundry-stage.williamjshaw.ca/trpc/test.uniqueError \
  -d '{"message":"Alert test error 12345"}'
```

**Verify:**
- Check #foundry-staging-alerts for Slack message
- Should arrive within 2 minutes

---

## Post-Implementation Checklist

### Verification Steps

- [ ] **Staging Worker errors appear in Sentry**
  - Filter: `environment:stage`
  - Contains stack traces with TypeScript source files

- [ ] **Production Worker errors appear in Sentry**
  - Filter: `environment:production`
  - Same DSN as staging, different environment tag

- [ ] **React errors captured**
  - Component stack visible
  - User interactions in breadcrumbs

- [ ] **Source maps working**
  - Stack traces show `worker/trpc/routers/X.ts:LINE`
  - NOT `chunk-abc123.js:4567`

- [ ] **Alerts configured**
  - Staging alerts → #foundry-staging-alerts
  - Production alerts → #foundry-alerts
  - Test alert fired successfully

- [ ] **Performance monitoring active**
  - Go to Performance tab
  - See transactions for tRPC calls

- [ ] **Release tracking working**
  - Go to Releases tab
  - See releases tagged with git SHA
  - Errors associated with releases

### Documentation Updates

- [ ] Update README with Sentry info
- [ ] Document alert response procedures
- [ ] Add Sentry dashboard link to team docs

### Team Training

- [ ] Show team how to filter by environment
- [ ] Demonstrate error investigation workflow
- [ ] Explain when to check Sentry vs logs

---

## Troubleshooting

### Issue: Errors not appearing in Sentry

**Check:**
1. Is `SENTRY_DSN` set in Cloudflare Workers settings?
2. Is initialization code running? (check console logs)
3. Are errors actually being thrown?
4. Check Sentry project settings → Inbound Filters (might be blocked)

### Issue: Wrong environment showing

**Check:**
1. `ENVIRONMENT` variable matches deployment (stage vs production)
2. Cloudflare Workers environment variables set correctly
3. GitHub Actions passing correct `VITE_ENVIRONMENT`

### Issue: Source maps not working

**Check:**
1. `sourcemap: true` in vite.config.ts
2. `SENTRY_AUTH_TOKEN` set in GitHub secrets
3. Source map upload step running in GitHub Actions
4. Check GitHub Actions logs for upload errors

### Issue: No alerts firing

**Check:**
1. Alert rules configured with correct environment filter
2. Slack integration connected
3. Test alert by manually creating issue in Sentry
4. Check alert rule notification settings

---

## Rollback Plan

If Sentry causes issues:

### Quick Disable (5 minutes)
**Remove environment variables from Cloudflare:**
```bash
# For staging
wrangler secret delete SENTRY_DSN --env stage

# For production
wrangler secret delete SENTRY_DSN --env production
```

**Effect:** Sentry initialization will skip, app continues without tracking

### Full Removal (30 minutes)
```bash
# Revert code changes
git revert [sentry-commit-sha]
git push origin stage
git push origin main

# Uninstall packages
pnpm remove @sentry/cloudflare @sentry/react @sentry/vite-plugin
```

---

## Success Criteria

Implementation is complete when:

✅ Errors from staging appear in Sentry with `environment:stage` tag
✅ Errors from production appear in Sentry with `environment:production` tag
✅ Stack traces show TypeScript source files (not minified JS)
✅ Alerts fire within 2 minutes of error spike
✅ Performance monitoring shows tRPC transactions
✅ Releases tagged with git SHA
✅ Team trained on Sentry dashboard usage
✅ Cost stays at $26/month (Developer plan)

---

## Estimated Timeline

| Phase | Duration | Can Start After |
|-------|----------|-----------------|
| 1. Sentry Setup | 15 min | Immediately |
| 2. Worker Integration | 2-3 hours | Phase 1 |
| 3. React Integration | 1-2 hours | Phase 2 |
| 4. Environment Config | 30 min | Phase 3 |
| 5. Source Maps & CI/CD | 1-2 hours | Phase 4 |
| 6. Testing | 1 hour | Phase 5 |
| 7. Alerts | 30 min | Phase 6 |
| **Total** | **4-6 hours** | - |

---

## Next Steps After Implementation

1. **Monitor for 1 week:**
   - Check Sentry daily for new error patterns
   - Tune alert thresholds if too noisy
   - Verify sample rates appropriate for traffic

2. **Email triple-send incident prevention:**
   - With Sentry, similar bugs caught in <30 minutes
   - Stack trace shows exact error location
   - No manual database log inspection needed

3. **Manual testing enhancement:**
   - Testers check Sentry after test sessions
   - Self-service error investigation
   - Production validation post-deploy

---

*Implementation plan created: 2026-01-04*
*Configuration: Option A (Single project + environment tags)*
*Ready for developer assignment*
