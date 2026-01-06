# Sentry DSN Not Configured on Staging - Fix

## Issue

On staging (https://foundry-stage.williamjshaw.ca), console shows:
```
Sentry DSN not configured - error tracking disabled
```

## Root Cause

The `VITE_SENTRY_DSN` environment variable was not available during the build in GitHub Actions.

This means the GitHub secret `VITE_SENTRY_DSN` either:
1. Doesn't exist
2. Has wrong name
3. Wasn't set

## Fix: Add GitHub Secret

### Step 1: Verify Current Secrets

Run this command to see all GitHub secrets (will show names only, not values):

```bash
# If you have gh CLI installed:
gh secret list

# Otherwise, go to:
# https://github.com/gongnone/full-stack/settings/secrets/actions
```

### Step 2: Check if VITE_SENTRY_DSN Exists

Look for a secret named **exactly**: `VITE_SENTRY_DSN`

**If it exists:** Skip to Step 4 (re-deploy)
**If it doesn't exist:** Continue to Step 3

### Step 3: Add VITE_SENTRY_DSN Secret

**Option A: Via GitHub Web UI**

1. Go to: https://github.com/gongnone/full-stack/settings/secrets/actions
2. Click "New repository secret"
3. Name: `VITE_SENTRY_DSN`
4. Value: `https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152`
5. Click "Add secret"

**Option B: Via gh CLI**

```bash
cd ~/full-stack

gh secret set VITE_SENTRY_DSN --body "https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152"
```

### Step 4: Re-Deploy to Staging

After adding the secret, push to trigger re-deployment:

```bash
cd ~/full-stack
git push origin stage --force-with-lease
```

**Or manually trigger GitHub Actions:**

Go to: https://github.com/gongnone/full-stack/actions/workflows/deploy-stage.yaml

Click "Run workflow" → Select branch: `stage` → "Run workflow"

### Step 5: Wait for Deployment (5 min)

Monitor: https://github.com/gongnone/full-stack/actions

Wait for "🚀 Stage Deployment Agent" to complete.

### Step 6: Verify Fix

Visit: https://foundry-stage.williamjshaw.ca/sentry-test

Open console (F12) → Look for:

**Before fix:**
```
❌ Sentry DSN not configured - error tracking disabled
```

**After fix:**
```
✅ [Sentry] ✅ Initialized { dsn: "https://94cad...", environment: "stage", ... }
```

### Step 7: Test Error Tracking

On `/sentry-test` page, click "Trigger Simple Error"

Check Sentry dashboard: https://sentry.io

Should see error appear with:
- Environment: `stage`
- Error message: "🧪 Test Error: Frontend exception triggered manually"

---

## All Required GitHub Secrets

Make sure these are ALL set:

```bash
# Check all exist:
gh secret list
```

**Required secrets:**

1. `VITE_SENTRY_DSN` - Sentry DSN for error tracking ← **THIS ONE IS MISSING**
2. `SENTRY_ORG` - Sentry organization slug
3. `SENTRY_PROJECT` - Sentry project name (foundry-dashboard)
4. `SENTRY_AUTH_TOKEN` - Sentry auth token for source maps

**If ANY are missing, add them:**

```bash
# Add missing secrets (replace values with yours)
gh secret set VITE_SENTRY_DSN --body "https://YOUR_DSN_HERE@o123.ingest.us.sentry.io/456"
gh secret set SENTRY_ORG --body "your-org-slug"
gh secret set SENTRY_PROJECT --body "foundry-dashboard"
gh secret set SENTRY_AUTH_TOKEN --body "sntrys_YOUR_TOKEN_HERE"
```

---

## How to Get Values

### VITE_SENTRY_DSN
Sentry → Settings → Projects → foundry-dashboard → Client Keys (DSN)

Copy the full URL starting with `https://`

### SENTRY_ORG
Your Sentry URL: `https://sentry.io/organizations/YOUR_ORG_SLUG/`

The org slug is in the URL.

### SENTRY_PROJECT
Your project name in Sentry (should be `foundry-dashboard`)

### SENTRY_AUTH_TOKEN
Sentry → Settings → Account → API → Auth Tokens → Create New Token

Scopes needed:
- `project:read`
- `project:releases`
- `org:read`

---

## Expected Result After Fix

Visit: https://foundry-stage.williamjshaw.ca/sentry-test

**Console output:**
```
[Sentry] ✅ Initialized {
  dsn: "https://94cad1254a9249bde7030761f32ea1a2@o451065...",
  environment: "stage",
  mode: "production",
  enabled: true
}
```

**Then click buttons to test errors** → Errors appear in Sentry dashboard

---

*Fix for: "Sentry DSN not configured - error tracking disabled" on staging*
*Date: 2026-01-04*
