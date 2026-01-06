# Diagnose: Why "Sentry DSN not configured" on Staging

## Quick Diagnostic Checklist

Follow these steps to find the issue:

---

## Step 1: Check if GitHub Secret Exists

### Option A: GitHub Web UI
1. Go to: https://github.com/gongnone/full-stack/settings/secrets/actions
2. Look for a secret named **exactly**: `VITE_SENTRY_DSN`
3. **Is it there?**
   - ✅ YES → Go to Step 2
   - ❌ NO → **This is the problem!** Go to Fix #1 below

### Option B: Command line (if you have `gh` CLI)
```bash
cd ~/full-stack
gh secret list
```

Look for `VITE_SENTRY_DSN` in the output.

---

## Step 2: Check GitHub Actions Logs

1. Go to: https://github.com/gongnone/full-stack/actions
2. Click the most recent "🚀 Stage Deployment Agent" run
3. Click "🚀 Foundry Frontend (dashboard)" job
4. Expand "🚀 Deploy to Cloudflare" step
5. Look for the build output

**What to look for:**

**GOOD (DSN available):**
```
vite build
vite v6.4.1 building for production...
✓ 2878 modules transformed.
✓ built in 12.56s
```
(No warnings about missing env vars)

**BAD (DSN missing):**
If you see any warnings about `VITE_SENTRY_DSN` being undefined

**Also check for:**
```
Sentry Vite Plugin
  ✓ Uploaded source maps
```

If you see this, source maps worked. If not, `SENTRY_AUTH_TOKEN` is missing.

---

## Step 3: Check Browser Network Tab

1. Visit: https://foundry-stage.williamjshaw.ca
2. Open DevTools (F12) → Network tab
3. Refresh page
4. Find the main JavaScript file (looks like `index-abc123.js`)
5. Click it → Preview/Response tab
6. Search (Ctrl+F) for: `sentry`

**What to look for:**

**GOOD (DSN is in bundle):**
You find strings like:
- `https://` followed by `ingest.sentry.io`
- `Sentry.init`
- DSN string

**BAD (DSN missing):**
You see `Sentry.init` but the DSN value is empty or undefined

---

## Step 4: Check Console for Exact Error

1. Visit: https://foundry-stage.williamjshaw.ca
2. Open console (F12)
3. Look for the FULL message

**Exact error message:**
```
Sentry DSN not configured - error tracking disabled
```

This comes from `src/lib/sentry.ts:7` which means:
```typescript
if (!SENTRY_DSN) {
  console.warn('Sentry DSN not configured - error tracking disabled');
  return;
}
```

The DSN is missing/undefined in the built bundle.

---

## Diagnosis Results

Based on the checks above:

### Case 1: GitHub Secret Doesn't Exist
**Symptom:** Step 1 shows no `VITE_SENTRY_DSN` secret
**Cause:** Secret was never added to GitHub
**Fix:** See Fix #1 below

### Case 2: Secret Exists but Build Happened Before It Was Added
**Symptom:**
- Step 1: Secret exists ✅
- Step 3: DSN NOT in JavaScript bundle ❌
**Cause:** Deployment ran before secret was added
**Fix:** See Fix #2 below

### Case 3: Secret Exists, Build Worked, but Vite Plugin Failed
**Symptom:**
- Step 1: Secret exists ✅
- Step 3: DSN IS in bundle ✅
- But console still shows error ❌
**Cause:** Possible Vite env var issue
**Fix:** See Fix #3 below

---

## Fix #1: Add GitHub Secret (Secret Doesn't Exist)

1. Go to: https://github.com/gongnone/full-stack/settings/secrets/actions
2. Click "New repository secret"
3. **Name:** `VITE_SENTRY_DSN` (exact spelling!)
4. **Value:**
   ```
   https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152
   ```
5. Click "Add secret"

Then go to Fix #2 to redeploy.

---

## Fix #2: Re-Deploy (Secret Added After Deployment)

The deployment needs to run again WITH the secret:

```bash
cd ~/full-stack

# Make sure you're on stage branch
git branch --show-current  # Should say: stage

# Trigger redeploy
git commit --allow-empty -m "chore: redeploy with Sentry secret"
git push origin stage
```

**Wait 5 minutes** for deployment: https://github.com/gongnone/full-stack/actions

Then test: https://foundry-stage.williamjshaw.ca/sentry-test

---

## Fix #3: Vite Env Var Issue (Rare)

If secret exists AND build ran with it, but still doesn't work:

### Check wrangler deploy passes env vars

The issue might be that `wrangler deploy` doesn't preserve build-time env vars.

**Fix:** Make sure `vite.config.ts` has `define` for SSR/worker context:

```typescript
export default defineConfig({
  define: {
    // Expose Vite env vars in SSR context
    'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(process.env.VITE_SENTRY_DSN),
    'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(process.env.VITE_ENVIRONMENT),
  },
  // ... rest of config
})
```

This is unlikely but possible if the Worker is trying to read import.meta.env at runtime.

---

## Expected Result After Fix

After adding secret and redeploying:

### Console Output:
```
[Sentry] ✅ Initialized {
  dsn: "https://94cad1254a9249bde7030761f32ea1a2@o4510652...",
  environment: "stage",
  mode: "production",
  enabled: true
}
```

### No Error:
The "Sentry DSN not configured" message should NOT appear.

### Test Buttons Work:
Visit /sentry-test → Click error buttons → Errors appear in Sentry dashboard

---

## Report Back

After running the diagnostic steps, tell me:

1. **Step 1 result:** Does `VITE_SENTRY_DSN` secret exist? (Yes/No)
2. **Step 2 result:** Any errors in GitHub Actions logs?
3. **Step 3 result:** Is `sentry` found in the JavaScript bundle? (Yes/No)
4. **Which case matches:** Case 1, 2, or 3?

This will tell us exactly what's wrong and how to fix it.

---

*Diagnostic guide for "Sentry DSN not configured" error on staging*
*Date: 2026-01-04*
