# Sentry Three-Platform Implementation Strategy

**Date:** 2026-01-04
**Question:** How do React, Cloudflare Pages, and Cloudflare Workers all fit together?

---

## Architecture Overview

Your application has **three distinct parts** that all need error tracking:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │  React App (runs in browser)                       │     │
│  │  - @sentry/react SDK                               │     │
│  │  - Captures: UI errors, component crashes          │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP requests
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (Static Hosting)               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Serves: HTML, JS, CSS (your React build output)  │     │
│  │  Error tracking: Via React SDK (runs in browser)  │     │
│  │  No separate Sentry SDK needed here               │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓ tRPC calls
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKERS (Backend API)                │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Worker: foundry-dashboard-stage / production      │     │
│  │  - @sentry/cloudflare SDK                          │     │
│  │  - Captures: API errors, tRPC errors, DO errors    │     │
│  │                                                     │     │
│  │  Durable Objects: BrandDNAAgent, etc.             │     │
│  │  - Same @sentry/cloudflare SDK                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Three-Platform Breakdown

### Platform 1: React (Frontend Code)

**What it is:**
- Your UI code (components, hooks, routes)
- Runs **in the user's browser**, not on Cloudflare

**Sentry SDK:** `@sentry/react`

**What it captures:**
- Component render errors
- React hooks errors
- Router navigation errors
- tRPC query/mutation errors (client-side)
- User interaction errors (button clicks, form submissions)

**Example error:**
```
Error: Cannot read property 'name' of undefined
  at ClientCard.tsx:42
  at renderWithHooks
```

**Configuration:**
```typescript
// src/entry.client.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT, // "stage" or "production"
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
});
```

---

### Platform 2: Cloudflare Pages (Deployment Platform)

**What it is:**
- Static hosting service that serves your **built** React app
- Just serves HTML/JS/CSS files to browsers
- **Does NOT run your code** (code runs in browser)

**Sentry SDK:** ❌ **NONE** (no separate SDK needed)

**Why no SDK?**
- Cloudflare Pages is just a CDN/file server
- It doesn't execute your code
- The React app (Platform 1) already has Sentry
- Errors are captured by the browser-side React SDK

**What Cloudflare Pages does:**
- Hosts your `dist/` folder (built React app)
- Serves `index.html`, `main.js`, `styles.css`, etc.
- **That's it** - the JS runs in the user's browser

**Important:** When users visit `foundry-stage.williamjshaw.ca`, Cloudflare Pages serves the HTML, but the React code (with Sentry) runs **in their browser**, not on Pages.

---

### Platform 3: Cloudflare Workers (Backend API)

**What it is:**
- Your backend code (tRPC routers, Durable Objects, workflows)
- Runs on Cloudflare's edge servers
- Handles API requests from the React app

**Sentry SDK:** `@sentry/cloudflare`

**What it captures:**
- tRPC procedure errors
- Database errors (D1, KV, R2)
- Durable Object errors
- Email sending errors (AWS SES)
- Workflow errors (hub ingestion, etc.)

**Example error:**
```
Error: DOMParser is not defined
  at worker/email/index.ts:156
  at sendBrandInvite
```

**Configuration:**
```typescript
// worker/index.ts
import * as Sentry from '@sentry/cloudflare';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.ENVIRONMENT, // "stage" or "production"
    });

    // ... handle requests
  }
};
```

---

## Implementation Strategy: Two SDKs, One Project

### Same Sentry Project for All

**Single Sentry project:** `foundry-dashboard`
**Same DSN for both React + Workers**

**How we differentiate:**
- Environment tags: `stage` vs `production`
- Platform tags: `javascript-react` vs `javascript-cloudflare`
- Context: Browser vs Worker context

### Example Sentry Dashboard View

**Filter: environment:stage**
```
[React] Cannot read property 'name' of undefined
  Platform: javascript-react
  Browser: Chrome 120
  User: john@agency.com
  Route: /clients/abc-123

[Worker] Database error: D1 connection timeout
  Platform: javascript-cloudflare
  Colo: SJC (San Francisco)
  Request: POST /trpc/clients.create
```

---

## Deployment Strategy

### Stage Environment

**Cloudflare Pages (React deployment):**
```bash
# GitHub Actions: .github/workflows/deploy-stage.yaml

- name: Build React App
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_ENVIRONMENT: stage  # React will use this
  run: pnpm run build

- name: Deploy to Cloudflare Pages
  run: wrangler pages deploy dist --project-name=foundry-dashboard-stage
```

**Result:**
- React app with Sentry deployed to `foundry-stage.williamjshaw.ca`
- When users visit, React code runs in their browser
- React Sentry SDK captures frontend errors

**Cloudflare Workers (API deployment):**
```bash
- name: Deploy Worker
  env:
    SENTRY_DSN: ${{ secrets.SENTRY_DSN }}  # Worker will use this
    ENVIRONMENT: stage
  run: wrangler deploy --env stage
```

**Result:**
- Worker API deployed with Sentry
- Worker Sentry SDK captures backend errors
- Same DSN, different environment

---

### Production Environment

**Same as stage, but:**
- `VITE_ENVIRONMENT: production` (React)
- `ENVIRONMENT: production` (Worker)
- Deploy to `foundry.williamjshaw.ca` (Pages)
- Deploy to `foundry-dashboard` worker (production)

---

## Error Flow Examples

### Example 1: Frontend Error (React → Pages → Sentry)

**User action:**
1. User clicks "Create Client" button
2. React component renders form
3. **Error:** `Cannot read property 'name' of undefined` in form handler

**Error capture:**
```
User's Browser
  ↓
React Error Boundary catches error
  ↓
@sentry/react SDK sends to Sentry
  ↓
Sentry Dashboard shows:
  - Platform: javascript-react
  - Environment: production
  - Component: CreateClientModal.tsx:89
  - User: john@agency.com
  - Stack trace: TypeScript source files
```

**Note:** Cloudflare Pages is NOT involved in error capture. It just served the HTML/JS. The error happened in the browser.

---

### Example 2: Backend Error (Worker → Sentry)

**User action:**
1. User submits "Create Client" form
2. React sends tRPC mutation to Worker
3. Worker tries to insert into D1
4. **Error:** `D1 constraint violation: duplicate email`

**Error capture:**
```
Cloudflare Worker
  ↓
@sentry/cloudflare SDK catches error
  ↓
Sends to Sentry with Worker context
  ↓
Sentry Dashboard shows:
  - Platform: javascript-cloudflare
  - Environment: production
  - File: worker/trpc/routers/clients.ts:42
  - tRPC path: clients.create
  - Input: { email: "john@agency.com" }
  - Stack trace: TypeScript source files
```

---

### Example 3: Full-Stack Error (Both)

**User action:**
1. User clicks "Send Brand DNA Invite"
2. React calls `clients.create` mutation (tRPC)
3. Worker creates client in D1 ✅
4. Worker sends email via AWS SES
5. **Error:** `DOMParser is not defined` (email bug)

**Dual error capture:**

**Backend (Worker):**
```
Sentry Error #1:
  Platform: javascript-cloudflare
  Error: DOMParser is not defined
  File: worker/email/index.ts:156
  Context: { client_id: "abc-123", email: "client@agency.com" }
```

**Frontend (React):**
```
Sentry Error #2:
  Platform: javascript-react
  Error: TRPCClientError: INTERNAL_SERVER_ERROR
  Component: CreateClientModal.tsx:55
  Breadcrumbs:
    - User clicked "Send Invite"
    - tRPC mutation started
    - Network request to /trpc/clients.create
```

**Result:** Sentry shows BOTH errors, correlated by timestamp and user session.

---

## Configuration Details

### React (runs in browser)

**Environment variables (build-time):**
```bash
# .env or Cloudflare Pages settings
VITE_SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]
VITE_ENVIRONMENT=stage  # or "production"
VITE_SENTRY_RELEASE=${GIT_SHA}
```

**These become:** `import.meta.env.VITE_*` in your React code

**Deployed via:** Cloudflare Pages (but runs in browser, not on Pages servers)

---

### Cloudflare Workers (runs on edge)

**Environment variables (runtime):**
```bash
# Cloudflare Workers settings
SENTRY_DSN=https://[key]@[org].ingest.sentry.io/[project]  # SAME DSN
ENVIRONMENT=stage  # or "production"
SENTRY_RELEASE=${GIT_SHA}
```

**These become:** `env.SENTRY_DSN`, `env.ENVIRONMENT` in your Worker code

**Deployed via:** Wrangler CLI

---

## Why Two Different SDKs?

Charlie (Senior Dev): "You might wonder why we need two different Sentry SDKs..."

**@sentry/react (Frontend):**
- Designed for browsers
- Captures browser-specific context (window, navigator, localStorage)
- Integrates with React error boundaries
- Includes Session Replay (records user interactions)
- Tracks React component lifecycle

**@sentry/cloudflare (Backend):**
- Designed for Cloudflare Workers runtime
- Captures Worker context (colo, ray ID, request headers)
- No DOM APIs (Workers don't have `window`, `document`, etc.)
- Lightweight (optimized for edge compute)
- Integrates with Cloudflare-specific APIs (D1, KV, DO)

**They're fundamentally different execution environments, so they need different SDKs.**

---

## Build & Deploy Flow

### Full Deployment Process

```bash
# Step 1: Developer commits code
git push origin stage

# Step 2: GitHub Actions builds React app
- Install dependencies
- Build with Vite
  → Outputs: dist/index.html, dist/assets/main.js, etc.
  → main.js INCLUDES @sentry/react SDK (bundled in)

# Step 3: Upload source maps to Sentry
- Sentry knows how to translate minified JS back to TypeScript

# Step 4: Deploy React to Cloudflare Pages
- Upload dist/ folder to Pages
- Pages serves files at foundry-stage.williamjshaw.ca

# Step 5: Deploy Worker to Cloudflare
- Build Worker code
- Upload to Cloudflare Workers
- Set environment variables (SENTRY_DSN, ENVIRONMENT)

# Step 6: User visits site
- Pages serves HTML/JS (including bundled @sentry/react)
- Browser loads and runs React app
- React makes tRPC calls to Worker
- Both React (browser) and Worker (edge) report to Sentry
```

---

## Summary: Implementation Strategy

### What You're Installing

| Platform | SDK | Captures | Deployed To |
|----------|-----|----------|-------------|
| **React** | `@sentry/react` | UI errors, component crashes | User's browser |
| **Cloudflare Pages** | ❌ None | (Just serves files) | Cloudflare Pages CDN |
| **Cloudflare Workers** | `@sentry/cloudflare` | API errors, backend crashes | Cloudflare edge |

### Same Sentry Project

**Project:** `foundry-dashboard` (one project)
**DSN:** Same for React and Workers
**Differentiation:** Environment tags + platform tags

### Both Environments

| Environment | React Deployed | Worker Deployed | Sentry Environment |
|-------------|----------------|-----------------|-------------------|
| **Staging** | foundry-stage.williamjshaw.ca (Pages) | foundry-dashboard-stage (Worker) | `environment:stage` |
| **Production** | foundry.williamjshaw.ca (Pages) | foundry-dashboard (Worker) | `environment:production` |

---

## Implementation Phases Revisited

**Phase 1: Sentry Setup** (15 min)
- Create ONE Sentry project
- Get ONE DSN
- Will be used by both React and Workers

**Phase 2: Worker Integration** (2-3 hours)
- Install `@sentry/cloudflare`
- Configure Worker + Durable Objects
- Set `env.SENTRY_DSN` in Cloudflare dashboard

**Phase 3: React Integration** (1-2 hours)
- Install `@sentry/react`
- Configure browser-side error tracking
- Set `VITE_SENTRY_DSN` in build environment

**Phase 4: Environment Config** (30 min)
- Set variables for **both** React and Workers
- Stage: `ENVIRONMENT=stage` (Worker) + `VITE_ENVIRONMENT=stage` (React build)
- Production: Same but `production`

**Phase 5: Source Maps** (1-2 hours)
- Upload React source maps (Vite build)
- Upload Worker source maps (optional, harder to configure)
- Both use same Sentry project

**Phase 6: Testing** (1 hour)
- Test React errors in browser console
- Test Worker errors via tRPC
- Verify both appear in Sentry dashboard

---

## Key Insights

Elena (Junior Dev): "So let me get this straight..."

### 1. Cloudflare Pages ≠ Cloudflare Workers

**Pages:**
- Static file hosting (like Netlify, Vercel)
- Serves your built React app
- Doesn't run your code

**Workers:**
- Backend compute (like AWS Lambda)
- Runs your API code
- Handles tRPC requests

### 2. React SDK runs in browser, not on Cloudflare

- User visits `foundry-stage.williamjshaw.ca`
- Cloudflare Pages serves `index.html` + `main.js`
- Browser downloads and runs `main.js`
- `main.js` includes bundled `@sentry/react`
- Errors captured in browser, sent to Sentry

### 3. One DSN for everything

- React uses same DSN as Workers
- Differentiation via environment tags
- Single Sentry project shows all errors

Bob (Scrum Master): "Exactly right, Elena!"

---

## Cost Implications

Alice (Product Owner): "Does having React + Workers affect the cost?"

**Answer:** No, still $26/month.

**Why?**
- Sentry charges per project, not per platform
- React errors + Worker errors share the 5K error budget
- Both count toward the 10K transaction budget
- Platform tags let you filter React vs Worker in dashboard

**Example monthly usage:**
- React errors: 2,000
- Worker errors: 1,000
- Total: 3,000 (under 5K limit) ✅
- Cost: $26/month

---

## Filtering in Sentry Dashboard

**View only React errors:**
```
platform:javascript-react environment:production
```

**View only Worker errors:**
```
platform:javascript-cloudflare environment:production
```

**View all staging errors (React + Worker):**
```
environment:stage
```

**View specific tRPC errors:**
```
trpc.path:clients.create
```

---

## FAQ: Three-Platform Strategy

### Q: Do I need to deploy Sentry separately to Pages and Workers?
**A:** No. You configure Sentry in your code, then deploy the code normally. Pages and Workers are just deployment targets.

### Q: Will Sentry slow down my React app?
**A:** Minimal impact (<1% overhead). Sentry SDK is async and non-blocking.

### Q: Will Sentry slow down my Workers?
**A:** Minimal impact (<5ms per request). Sample rate (10% production) reduces overhead.

### Q: What if Cloudflare Pages has an error?
**A:** Pages is just serving files. If there's a Pages outage, your site is down, but that's not a "Sentry error" - it's infrastructure. Cloudflare monitors their own uptime.

### Q: Can I see which errors came from React vs Workers?
**A:** Yes, use `platform:javascript-react` or `platform:javascript-cloudflare` filter.

### Q: Do I need separate Sentry projects for React and Workers?
**A:** No, same project. Platform tags differentiate them automatically.

---

## Next Steps

**Now that you understand the three-platform strategy:**

1. **Review implementation plan** (if needed)
2. **Assign developer** to execute 7 phases
3. **Confirm:**
   - One Sentry account
   - One project (`foundry-dashboard`)
   - One DSN (used by React + Workers)
   - Two environments (stage + production)
   - Two platforms (React + Workers)

**Developer will handle:**
- Installing both SDKs (`@sentry/react` + `@sentry/cloudflare`)
- Configuring both platforms
- Testing both in stage + production

---

*Three-platform implementation strategy explained*
*React (browser) + Pages (hosting) + Workers (backend) = Two SDKs, One Project*
