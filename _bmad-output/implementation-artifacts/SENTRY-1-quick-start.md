# Quick Start: Sentry Installation (Option A)

**For the developer implementing SENTRY-1**

This is the TL;DR version. Full details in [SENTRY-1-implementation-plan.md](./SENTRY-1-implementation-plan.md).

---

## 🎯 What You're Building

Install Sentry error tracking on **both** staging and production using:
- ✅ Single Sentry project (cost: $26/month)
- ✅ Same DSN for both URLs
- ✅ Environment tags to differentiate (stage vs production)

---

## ⏱️ Time Budget: 4-6 hours

| Phase | Time | What You'll Do |
|-------|------|----------------|
| Setup | 15min | Create Sentry account + project |
| Worker | 2-3h | Install SDK, add error handlers |
| React | 1-2h | Error boundaries, tRPC integration |
| Config | 30min | Set Cloudflare env vars |
| CI/CD | 1-2h | Source maps, GitHub Actions |
| Test | 1h | Verify both environments work |

---

## 🚀 Quick Steps

### 1. Create Sentry Project (15 min)
```bash
# Go to https://sentry.io/signup/
# Create organization + project "foundry-dashboard"
# Copy DSN: https://[key]@[org].ingest.sentry.io/[project]
# Save auth token for CI/CD
```

### 2. Install Dependencies (2 min)
```bash
cd apps/foundry-dashboard
pnpm add @sentry/cloudflare @sentry/react
pnpm add -D @sentry/vite-plugin
```

### 3. Add Worker Integration (1 hour)
**Create:** `worker/sentry.ts`
```typescript
import * as Sentry from '@sentry/cloudflare';

export function initSentry(env: any): void {
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT || 'development',
    release: env.SENTRY_RELEASE || 'unknown',
    tracesSampleRate: env.ENVIRONMENT === 'production' ? 0.1 : 1.0,
  });
}
```

**Update:** `worker/index.ts`
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
};
```

**Update:** `worker/trpc/index.ts` - add `.onError()` handler:
```typescript
.onError(({ error, path, input, ctx }) => {
  Sentry.withScope((scope) => {
    scope.setTag('trpc.path', path);
    scope.setContext('trpc.input', input);
    Sentry.captureException(error);
  });
})
```

### 4. Add React Integration (1 hour)
**Update:** `src/entry.client.tsx`
```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT,
  tracesSampleRate: import.meta.env.VITE_ENVIRONMENT === 'production' ? 0.1 : 1.0,
});
```

**Create:** `src/components/errors/SentryErrorBoundary.tsx`
```typescript
import * as Sentry from '@sentry/react';

export function SentryErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
```

**Wrap app** in `src/app.tsx`:
```typescript
<SentryErrorBoundary>
  <RouterProvider router={router} />
</SentryErrorBoundary>
```

### 5. Configure Environments (15 min each)

**Cloudflare Dashboard → foundry-dashboard-stage:**
```
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]
ENVIRONMENT = stage
```

**Cloudflare Dashboard → foundry-dashboard (production):**
```
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
ENVIRONMENT = production  # DIFFERENT
```

**GitHub Secrets:**
```
SENTRY_AUTH_TOKEN = [token]
SENTRY_ORG = [org-slug]
SENTRY_PROJECT = foundry-dashboard
```

### 6. Enable Source Maps (30 min)
**Update:** `vite.config.ts`
```typescript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  build: { sourcemap: true },
  plugins: [
    // ... existing plugins
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    }),
  ],
});
```

**Update:** `.github/workflows/deploy-stage.yaml`
```yaml
- name: Build
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_RELEASE: ${{ github.sha }}
  run: pnpm run build
```

### 7. Test (30 min)
```bash
# Deploy to stage
git push origin stage

# Trigger error
curl https://foundry-stage.williamjshaw.ca/trpc/test.error

# Check Sentry
# Filter: environment:stage
# Should see error with TypeScript stack trace
```

---

## ✅ Success Checklist

- [ ] Staging errors show `environment:stage` tag
- [ ] Production errors show `environment:production` tag
- [ ] Stack traces show `.ts` files (not minified `.js`)
- [ ] Both use same DSN
- [ ] Alerts configured for both environments

---

## 🆘 Get Help

**Stuck?** See full implementation plan: [SENTRY-1-implementation-plan.md](./SENTRY-1-implementation-plan.md)

**Common issues:**
- DSN not working? Check Cloudflare env vars set correctly
- No errors appearing? Check console for "Sentry initialized" log
- Source maps broken? Check GitHub Actions logs for upload errors

---

## 📊 After Implementation

**Monitor for 1 week:**
- Check Sentry daily
- Tune alert thresholds
- Verify sample rates appropriate

**Expected results:**
- Email-type bugs caught in 30min (vs 7 hours before)
- 100% error visibility (vs ~20% user-reported)
- Manual testers can self-serve error investigation

---

*Quick start guide for Option A implementation*
*Full details: SENTRY-1-implementation-plan.md*
