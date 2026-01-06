# Where to Put Sentry Secrets - React vs Workers

## CRITICAL: Two Different Places for Different Parts

### React (Frontend) = GitHub Secrets ← **WE ARE HERE NOW**
### Workers (Backend) = Cloudflare Secrets ← **NOT YET, LATER**

---

## Part 1: React Frontend (What We're Doing Now)

### Why GitHub Secrets?

The React app is **built in GitHub Actions**, not on Cloudflare. The build process needs access to `VITE_SENTRY_DSN` to bake it into the JavaScript bundle.

**Build flow:**
```
GitHub Actions runner
  ↓ Runs: pnpm build (uses VITE_SENTRY_DSN from GitHub Secrets)
  ↓ Outputs: dist/ folder with baked-in Sentry DSN
  ↓ Deploys: dist/ to Cloudflare Pages (just static files)
```

### Where to Add React Secrets: GitHub

**Go to:** https://github.com/gongnone/full-stack/settings/secrets/actions

**Add these 4 secrets:**

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `VITE_SENTRY_DSN` | `https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152` | React error tracking |
| `SENTRY_ORG` | (your Sentry org slug) | Source map uploads |
| `SENTRY_PROJECT` | `foundry-dashboard` | Source map uploads |
| `SENTRY_AUTH_TOKEN` | (your Sentry auth token) | Source map uploads |

### How to Add via GitHub Web UI:

1. Click this URL: https://github.com/gongnone/full-stack/settings/secrets/actions
2. Click "New repository secret" (green button, top right)
3. **Name:** `VITE_SENTRY_DSN` (exact spelling)
4. **Value:** Paste the DSN from above
5. Click "Add secret"
6. Repeat for the other 3 secrets

### Screenshot Where to Add:

```
GitHub → Settings → Secrets and variables → Actions
→ Repository secrets → "New repository secret" button
```

---

## Part 2: Workers Backend (Later, Not Now)

### Why Cloudflare Secrets?

The Workers run on Cloudflare's edge, not in GitHub. They need runtime access to `SENTRY_DSN` (no `VITE_` prefix).

**Runtime flow:**
```
Cloudflare Worker receives request
  ↓ Reads: env.SENTRY_DSN (from Cloudflare secret)
  ↓ Sends error to Sentry
```

### Where to Add Workers Secrets: Cloudflare (LATER)

**Go to:** Cloudflare Dashboard → Workers & Pages → foundry-dashboard-stage → Settings → Variables

**We'll add this later when we do Workers integration:**

| Variable Name | Value | For |
|---------------|-------|-----|
| `SENTRY_DSN` | (same DSN, no VITE_ prefix) | Worker errors |
| `ENVIRONMENT` | `stage` | Environment tagging |

**DON'T DO THIS YET** - we're only doing React right now.

---

## Summary: Where Secrets Go

| Component | Build Location | Secrets Location | When |
|-----------|---------------|------------------|------|
| **React** | GitHub Actions | **GitHub Secrets** | **NOW** |
| **Workers** | Cloudflare | Cloudflare Dashboard | LATER |

---

## Your Action Steps RIGHT NOW

### Step 1: Add GitHub Secrets (5 minutes)

Click: https://github.com/gongnone/full-stack/settings/secrets/actions

Add these 4 secrets (click "New repository secret" for each):

1. **Name:** `VITE_SENTRY_DSN`
   **Value:** `https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152`

2. **Name:** `SENTRY_ORG`
   **Value:** (your Sentry organization slug - check Sentry URL)

3. **Name:** `SENTRY_PROJECT`
   **Value:** `foundry-dashboard`

4. **Name:** `SENTRY_AUTH_TOKEN`
   **Value:** (create at Sentry → Settings → Account → API → Auth Tokens)

### Step 2: Verify Secrets Added

Refresh: https://github.com/gongnone/full-stack/settings/secrets/actions

You should see 4 new secrets listed (values are hidden, only names shown).

### Step 3: Re-Deploy Staging

After adding secrets, trigger re-deployment:

**Option A: Push to stage**
```bash
cd ~/full-stack
git push origin stage --force-with-lease
```

**Option B: Manual workflow trigger**
Go to: https://github.com/gongnone/full-stack/actions/workflows/deploy-stage.yaml
Click "Run workflow" → Branch: stage → "Run workflow"

### Step 4: Wait & Test (5 min)

1. Wait for deployment: https://github.com/gongnone/full-stack/actions
2. Visit: https://foundry-stage.williamjshaw.ca/sentry-test
3. Check console - should see: `[Sentry] ✅ Initialized`
4. Click error buttons
5. Check Sentry dashboard for errors

---

## How to Get Sentry Values

### VITE_SENTRY_DSN (already provided above)
You already have this - it's in your `.env.local` file.

### SENTRY_ORG
1. Go to Sentry: https://sentry.io
2. Look at URL: `https://sentry.io/organizations/YOUR_ORG_SLUG/`
3. Copy the org slug from the URL

### SENTRY_PROJECT
Just use: `foundry-dashboard`

### SENTRY_AUTH_TOKEN
1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Name: `GitHub Actions - Foundry`
4. Scopes (check these):
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click "Create Token"
6. **Copy the token** (shows once only!)

---

## Expected Result

After adding GitHub secrets and re-deploying:

**Console on staging:**
```
[Sentry] ✅ Initialized {
  dsn: "https://94cad1254a9249bde7030761f32ea1a2@o4510652...",
  environment: "stage",
  mode: "production",
  enabled: true
}
```

**Sentry dashboard:**
- Errors appear when you click test buttons
- Environment tag: `stage`
- Source maps working (shows `.tsx` files)

---

*React = GitHub Secrets | Workers = Cloudflare Secrets (later)*
*Date: 2026-01-04*
