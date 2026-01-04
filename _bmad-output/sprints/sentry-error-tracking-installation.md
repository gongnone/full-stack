# Sprint Item: Sentry Error Tracking Installation

**Created:** 2026-01-04
**Updated:** 2026-01-04 (Option A: Single project + environment tags)
**Epic:** Production Observability & Monitoring
**Priority:** P1 (Blocking production confidence)
**Estimated Effort:** 4-6 hours
**Status:** Ready for Implementation
**Configuration:** Option A - Single Sentry project for both stage + production URLs

---

## Context

During manual testing of The Agentic Content Foundry, gaps were identified in production error visibility. The email triple-send bug (2026-01-04) revealed that production errors can occur without immediate visibility, requiring manual database log inspection to diagnose.

**Current State:**
- Console logging (structured JSON)
- `email_send_log` table for email-specific errors
- tRPC typed error responses
- **NO centralized error aggregation**
- **NO real-time error alerting**
- **NO stack trace collection in production**

**Problem:**
Manual testers and production monitoring have no automated way to:
1. Detect errors in real-time
2. Track error frequency and patterns
3. Capture full stack traces with context
4. Correlate errors with user sessions
5. Alert team when error rates spike

---

## Objectives

Install and configure Sentry for comprehensive error tracking across:
1. **Cloudflare Workers** (backend/Worker/DO) - both stage + production
2. **React Frontend** (Tanstack Router + tRPC) - both stage + production
3. **Production Deployments** (source maps, release tracking)

## Configuration Approach: Option A

**Single Sentry Project + Environment Tags:**
- One project: `foundry-dashboard`
- Same DSN for both environments
- Environment differentiation via `ENVIRONMENT` variable
- Cost: $26/month (shared budget across environments)
- Sample rates: Stage 100%, Production 10%

---

## Manual Testing Gaps Addressed

| Gap | Current State | With Sentry |
|-----|---------------|-------------|
| **Production error visibility** | Requires manual log inspection | Real-time dashboard with stack traces |
| **Error rate monitoring** | No aggregation | Automatic error rate tracking + alerts |
| **User impact tracking** | Unknown which users hit errors | User context (email, client) attached to errors |
| **Reproduction context** | Limited breadcrumbs | Full breadcrumb trail (API calls, user actions) |
| **Alert on spikes** | Manual monitoring | Slack/email alerts on error rate increases |
| **Release tracking** | No correlation of errors to deploys | Automatic deploy → error correlation |

---

## Acceptance Criteria

### AC1: Worker Error Tracking
**Given** an error occurs in a Cloudflare Worker (tRPC, DO, email)
**When** the error is thrown
**Then** Sentry captures:
- Full stack trace
- Request context (URL, method, headers)
- User context (session, client_id)
- Cloudflare environment (colo, ray ID)
- Custom context (tRPC procedure name, input params)

**Verification:**
```typescript
// Trigger test error
throw new Error("Sentry test error from Worker");
// Check Sentry dashboard shows error with full context
```

### AC2: React Error Boundaries
**Given** a React component throws an error
**When** the error bubbles to an error boundary
**Then** Sentry captures:
- Component stack trace
- React component tree
- User interaction breadcrumbs
- Router context (current route)
- tRPC query/mutation context

**Verification:**
```typescript
// Test component that throws
<ErrorTestComponent />
// Check Sentry dashboard shows React error with component stack
```

### AC3: Source Maps in Production
**Given** a production error occurs
**When** viewing in Sentry dashboard
**Then** stack traces show:
- Original TypeScript file names (not minified JS)
- Exact line numbers from source code
- Code snippets around error line

**Verification:**
- Deploy to staging with source maps
- Trigger error
- Verify Sentry shows TypeScript source, not compiled JS

### AC4: Performance Monitoring
**Given** performance monitoring is enabled
**When** viewing Sentry Performance tab
**Then** track:
- tRPC query/mutation duration
- Page load performance
- Database query performance (D1, KV, DO)
- API call latency

**Verification:**
- Navigate through app for 5 minutes
- Check Sentry Performance shows transactions

### AC5: Release Tracking
**Given** a deployment occurs
**When** code is deployed to stage/production
**Then** Sentry:
- Creates a new release (git SHA)
- Associates errors with release
- Shows "new in this release" errors
- Compares error rates between releases

**Verification:**
- Deploy with `SENTRY_RELEASE=${GIT_SHA}`
- Check Sentry Releases tab shows new deploy
- Trigger error, verify it's tagged with release

### AC6: Alerting Configuration
**Given** error rate exceeds threshold
**When** 10+ errors occur in 5 minutes
**Then** Sentry sends:
- Slack notification to #foundry-alerts
- Email to on-call engineer
- Issue auto-assigned if critical

**Verification:**
- Configure alert rule in Sentry
- Trigger 11 errors rapidly
- Verify Slack message received

---

## Implementation Checklist

### Phase 1: Worker Integration (2-3 hours)

#### 1.1 Install Sentry SDK
```bash
cd apps/foundry-dashboard
pnpm add @sentry/cloudflare @sentry/core
```

#### 1.2 Configure Worker
**File:** `worker/sentry.ts` (NEW)
```typescript
import * as Sentry from '@sentry/cloudflare';

export function initSentry(env: Env) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT, // "stage" | "production"
    release: env.SENTRY_RELEASE || 'unknown',
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
    integrations: [
      Sentry.cloudflareWorkersIntegration(),
    ],
    beforeSend(event, hint) {
      // Redact sensitive data
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
}

export function captureWorkerError(error: Error, context: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setContext('worker', context);
    Sentry.captureException(error);
  });
}
```

#### 1.3 Update Worker Entry Point
**File:** `worker/index.ts`
```typescript
import { initSentry } from './sentry';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    initSentry(env);

    try {
      return await app.fetch(request, env, ctx);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }
}
```

#### 1.4 tRPC Error Handler
**File:** `worker/trpc/context.ts`
```typescript
export const createContext = async ({ req, env }: CreateContextOptions) => {
  Sentry.setContext('trpc', {
    procedure: req.path,
    input: req.input, // Be careful with sensitive data
  });

  return { req, env };
};
```

**File:** `worker/trpc/index.ts` - Add error handler
```typescript
.onError(({ error, path, input, ctx }) => {
  Sentry.withScope((scope) => {
    scope.setTag('trpc.path', path);
    scope.setContext('trpc.input', input);
    scope.setUser({ id: ctx.session?.userId });
    Sentry.captureException(error);
  });

  console.error(`tRPC error on ${path}:`, error);
})
```

#### 1.5 Durable Object Error Tracking
**File:** `worker/durable-objects/BrandDNAAgent.ts`
```typescript
import * as Sentry from '@sentry/cloudflare';

export class BrandDNAAgent implements DurableObject {
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    initSentry(env); // Initialize per DO instance
  }

  async fetch(request: Request) {
    try {
      // ... existing logic
    } catch (error) {
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

---

### Phase 2: React Frontend (1-2 hours)

#### 2.1 Install React SDK
```bash
cd apps/foundry-dashboard
pnpm add @sentry/react
```

#### 2.2 Initialize in App Entry
**File:** `src/entry.client.tsx`
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  release: import.meta.env.VITE_SENTRY_RELEASE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
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
```

#### 2.3 Error Boundary
**File:** `src/components/errors/SentryErrorBoundary.tsx` (NEW)
```typescript
import * as Sentry from '@sentry/react';

export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button onClick={resetError} className="btn-primary">
              Try again
            </button>
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

**File:** `src/app.tsx` - Wrap app
```typescript
import { SentryErrorBoundary } from './components/errors/SentryErrorBoundary';

export function App() {
  return (
    <SentryErrorBoundary>
      <RouterProvider router={router} />
    </SentryErrorBoundary>
  );
}
```

#### 2.4 tRPC Client Integration
**File:** `src/lib/trpc.ts`
```typescript
import * as Sentry from '@sentry/react';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    // ... existing links
    Sentry.createTRPCLink({
      attachRpcInput: true, // Attach input to breadcrumbs
    }),
  ],
});
```

---

### Phase 3: Source Maps & Deployment (1-2 hours)

#### 3.1 Vite Source Map Config
**File:** `vite.config.ts`
```typescript
export default defineConfig({
  build: {
    sourcemap: true, // Generate source maps
  },
  plugins: [
    // ... existing plugins
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
      release: {
        name: process.env.SENTRY_RELEASE || 'unknown',
      },
    }),
  ],
});
```

#### 3.2 Worker Source Maps (Wrangler)
**File:** `wrangler.jsonc`
```jsonc
{
  "build": {
    "upload": {
      "format": "service-worker",
      "main": "./worker/index.ts"
    }
  },
  // Add source map upload to deploy script
}
```

#### 3.3 GitHub Actions Integration
**File:** `.github/workflows/deploy-stage.yaml`
```yaml
- name: Upload source maps to Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: ${{ vars.SENTRY_ORG }}
    SENTRY_PROJECT: foundry-dashboard
  run: |
    export SENTRY_RELEASE=${{ github.sha }}
    pnpm run build
    pnpm sentry-cli releases new $SENTRY_RELEASE
    pnpm sentry-cli releases files $SENTRY_RELEASE upload-sourcemaps ./dist
    pnpm sentry-cli releases finalize $SENTRY_RELEASE
    pnpm sentry-cli releases deploys $SENTRY_RELEASE new -e staging
```

---

### Phase 4: Configuration & Testing (30-60 min)

#### 4.1 Environment Variables

**SAME DSN for both environments (Option A):**

**Cloudflare Dashboard → foundry-dashboard-stage → Settings → Variables**
```
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
ENVIRONMENT=stage  # DIFFERENT - identifies environment
SENTRY_RELEASE=${GIT_SHA}
```

**Cloudflare Dashboard → foundry-dashboard (production) → Settings → Variables**
```
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
ENVIRONMENT=production  # DIFFERENT - identifies environment
SENTRY_RELEASE=${GIT_SHA}
```

**Local `.env` (for frontend development)**
```bash
VITE_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
VITE_ENVIRONMENT=development  # Local dev environment
VITE_SENTRY_RELEASE=local-dev
```

#### 4.2 Sentry Project Setup (Option A - Single Project)

**One-time setup:**
1. Create Sentry account at https://sentry.io/signup/
2. Create organization (e.g., "The Foundry Agency")
3. Create single project: `foundry-dashboard`
4. Platform: JavaScript → React
5. Copy DSN (will be used for BOTH stage + production)
6. Enable "Environments" feature in Project Settings
7. Create API token for CI/CD (Settings → Auth Tokens)

**Configure Environment-Specific Alerts:**

**Staging Alerts** (filter: `environment:stage`):
- New error type → Slack #foundry-staging-alerts
- Error rate > 50/min → Email dev on-call
- Critical error → Slack ping

**Production Alerts** (filter: `environment:production`):
- Error rate > 10/min → Slack #foundry-alerts (critical)
- New error in production → Email + Slack (urgent)
- Error affects > 5 users/min → Page on-call

#### 4.3 Testing Checklist
- [ ] Trigger Worker error, verify in Sentry
- [ ] Trigger React error, verify with component stack
- [ ] Check source maps show TypeScript source
- [ ] Verify user context attached to errors
- [ ] Test alert triggers (10+ errors)
- [ ] Verify performance transactions appear
- [ ] Check release tracking after deploy

---

## Security Considerations

### Data Redaction
**CRITICAL:** Sentry will capture request/response data. Must redact:
- ❌ Authorization headers
- ❌ Session tokens
- ❌ Passwords
- ❌ Email verification tokens
- ❌ Client secrets
- ❌ API keys

**Implementation:** Use `beforeSend` hook (shown in code above)

### PII Handling
- Mask all text in Session Replay
- Block all media (images, video)
- Redact sensitive form fields
- Use user IDs, not emails, for user context

---

## Cost Estimate

**Sentry Pricing:**
- Developer plan: $26/month (up to 5K errors, 10K transactions)
- Team plan: $80/month (50K errors, 100K transactions)

**Recommended:** Start with Developer plan, upgrade if needed.

**Current volume estimate:**
- Errors: <1K/month (production is stable)
- Transactions: ~10K/month (performance monitoring)

---

## Rollout Plan

### Stage 1: Staging Environment (Week 1)
- Deploy Sentry to staging only
- Test all error scenarios
- Verify no sensitive data leaks
- Tune alert thresholds

### Stage 2: Production Soft Launch (Week 2)
- Deploy to production with low sample rates:
  - `tracesSampleRate: 0.05` (5%)
  - `replaysSessionSampleRate: 0.01` (1%)
- Monitor for false positives
- Adjust redaction rules if needed

### Stage 3: Full Production (Week 3)
- Increase sample rates:
  - `tracesSampleRate: 0.1` (10%)
  - `replaysSessionSampleRate: 0.1` (10%)
- Enable all alerts
- Train team on Sentry dashboard

---

## Success Metrics

**Week 1 (Staging):**
- [ ] 100% of errors captured in Sentry
- [ ] 0 false positive alerts
- [ ] Stack traces show TypeScript source

**Week 2 (Production Soft Launch):**
- [ ] <5% overhead on performance
- [ ] Alerts fire within 2 minutes of error spike
- [ ] 0 PII/sensitive data leaks

**Week 3 (Full Production):**
- [ ] Mean time to detect (MTTD) < 5 minutes
- [ ] 90% of production errors diagnosable from Sentry alone
- [ ] Team uses Sentry as primary error investigation tool

---

## Related Issues

- [Email Triple-Send Bug Retrospective](sprint-retrospective-email-triple-send.md)
- [Epic 9: Production Hardening](../implementation-artifacts/epic-9-retro-2025-12-29.md)
- Manual testing feedback (source of Sentry recommendation)

---

## Owner & Scheduling

**Assigned To:** TBD
**Milestone:** Phase 1.5.2 (Post-MVP Hardening)
**Blocks:** Production confidence, Manual testing effectiveness
**Estimated Start:** 2026-01-06
**Estimated Complete:** 2026-01-10

---

## Questions for Product Owner

1. **Budget approval:** Sentry Developer plan ($26/mo) acceptable?
2. **PII policy:** Any additional data redaction requirements?
3. **Alert recipients:** Who should receive critical error alerts?
4. **Priority:** Should this block Phase 1.5 launch, or ship after?

---

*Sprint item created: 2026-01-04*
*Created by: Bob (Scrum Master) based on manual testing feedback*
