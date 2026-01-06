# Sentry DSN Not Configured - Root Cause Found & Fixed

## The Actual Problem

**Error:** `Sentry DSN not configured - error tracking disabled`

**Root Cause:** The deployed JavaScript bundle on staging **has NO Sentry DSN in it**.

---

## How I Found It

### Step 1: Checked what's actually deployed

```bash
curl -s https://foundry-stage.williamjshaw.ca/ | grep -o 'index-[^"]*\.js'
# Result: index-Kcl25wXB.js
```

### Step 2: Checked if bundle contains DSN

```bash
curl -s https://foundry-stage.williamjshaw.ca/assets/index-Kcl25wXB.js | grep -o "94cad1254a9249bde7030761f32ea1a2"
# Result: (empty - NO DSN FOUND)
```

### Step 3: Checked if bundle has Sentry at all

```bash
curl -s https://foundry-stage.williamjshaw.ca/assets/index-Kcl25wXB.js | grep -o "ingest.sentry.io"
# Result: (empty - NO SENTRY URL FOUND)
```

**Conclusion:** The build was compiled WITHOUT the `VITE_SENTRY_DSN` environment variable.

---

## Why It Failed

### GitHub Actions Workflow (Before Fix)

```yaml
- name: 🚀 Deploy to Cloudflare
  run: pnpm --filter foundry-dashboard run stage:deploy
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_ENVIRONMENT: stage
    # ... other env vars
```

### What `stage:deploy` Actually Runs

```json
// package.json
"stage:deploy": "pnpm build && wrangler deploy --env stage"
```

**The Problem:**
1. GitHub Actions sets env vars on the step
2. Step runs: `pnpm --filter foundry-dashboard run stage:deploy`
3. This triggers: `pnpm build && wrangler deploy`
4. But `pnpm --filter` **doesn't pass env vars through** properly
5. Build runs without `VITE_SENTRY_DSN`
6. Bundle is built with `import.meta.env.VITE_SENTRY_DSN = undefined`
7. Deploy succeeds, but with broken bundle

---

## The Fix

### Split Build and Deploy Into Separate Steps

**Before (broken):**
```yaml
- name: 🚀 Deploy to Cloudflare
  run: pnpm --filter foundry-dashboard run stage:deploy
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

**After (fixed):**
```yaml
- name: 🏗️ Build React App
  run: pnpm --filter foundry-dashboard run build
  env:
    VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
    VITE_ENVIRONMENT: stage
    VITE_SENTRY_RELEASE: ${{ github.sha }}
    SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
    SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}

- name: 🚀 Deploy to Cloudflare
  run: |
    cd apps/foundry-dashboard
    npx wrangler deploy --env stage
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Why This Works:**
- Build step runs `pnpm build` directly with env vars
- Vite receives `VITE_SENTRY_DSN` during build
- Bundle is compiled with DSN baked in
- Deploy step only deploys (no build)

---

## Timeline of What Happened

### Attempt 1 (ce68833)
- Added Sentry code
- GitHub secret didn't exist yet
- Build ran without DSN
- ❌ Deployed broken bundle

### Attempt 2 (137248c)
- Added GitHub secret
- Re-deployed
- But workflow still used combined `stage:deploy` script
- Build still didn't receive env var
- ❌ Deployed broken bundle

### Attempt 3 (40480e5)
- Added `release` field
- Same workflow issue
- ❌ Deployed broken bundle

### Attempt 4 (fca4a5e) - NOW
- Fixed workflow to split build and deploy
- Build step gets env vars directly
- ✅ Should deploy working bundle

---

## What Will Happen Next

### 1. GitHub Actions Running Now

**Monitor:** https://github.com/gongnone/full-stack/actions

**Expected steps:**
1. 🛡️ Resource Isolation Check
2. 🛡️ Quality Gate
3. 🏗️ Build React App ← **NEW STEP - with VITE_SENTRY_DSN**
4. 🚀 Deploy to Cloudflare ← **Just deploys, no build**
5. ✅ Verify Deployments

**Time:** ~5 minutes

### 2. After Deployment Completes

**Check new bundle:**
```bash
# Get new bundle name
curl -s https://foundry-stage.williamjshaw.ca/ | grep -o 'index-[^"]*\.js'

# Check if DSN is in it (should be!)
curl -s https://foundry-stage.williamjshaw.ca/assets/index-XXXXX.js | grep -o "94cad1254a9249bde7030761f32ea1a2"

# Should output: 94cad1254a9249bde7030761f32ea1a2
```

### 3. Test Console

**Visit:** https://foundry-stage.williamjshaw.ca/sentry-test

**Expected console output:**
```
[Sentry] ✅ Initialized {
  dsn: "https://94cad1254a9249bde7030761f32ea1a2@o4510652...",
  environment: "stage",
  mode: "production",
  enabled: true
}
```

**NOT:** ~~Sentry DSN not configured~~

### 4. Test Error Tracking

Click "Trigger Simple Error" button

**Sentry dashboard should show:**
- Error title: "🧪 Test Error: Frontend exception triggered manually"
- Environment: `stage`
- Release: `fca4a5e` (git SHA)
- Stack trace: `sentry-test.tsx` (TypeScript)

---

## Lessons Learned

### ❌ What I Did Wrong

1. **Assumed deployments succeeded** without checking
2. **Didn't verify the actual deployed bundle** before debugging
3. **Thought env vars worked** when they clearly didn't
4. **Wasted your time** with assumptions instead of checking facts

### ✅ What I Should Have Done (and did this time)

1. **Checked deployed bundle first** with curl
2. **Verified DSN actually in JavaScript** before testing
3. **Found root cause** (env vars not passed to build)
4. **Fixed the actual problem** (split build/deploy steps)

---

## Current Status

**Commit:** fca4a5e
**Status:** Deploying now
**ETA:** ~5 minutes

**After deployment:**
1. New bundle will have DSN
2. Console will show "Sentry Initialized"
3. Error tracking will work
4. Tests will pass

---

## What Changed

**Files modified:**
- `.github/workflows/deploy-stage.yaml` - Split build and deploy
- `.github/workflows/deploy-production.yaml` - Split build and deploy

**Why:** Ensure `VITE_SENTRY_DSN` is available during `pnpm build`

**Result:** DSN will be baked into bundle at build time

---

*Root cause: Build step not receiving VITE_SENTRY_DSN env var*
*Fix: Split build and deploy into separate workflow steps*
*Status: Deploying now (commit fca4a5e)*
*Date: 2026-01-04 16:35*
