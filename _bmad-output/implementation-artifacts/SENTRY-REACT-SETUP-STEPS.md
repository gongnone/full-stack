# Sentry React Setup - Your Action Steps

**Code changes are DONE ✅** - Now you need to configure Sentry.

---

## Step 1: Create Sentry Account & Project (5 minutes)

1. Go to https://sentry.io/signup/
2. Sign up with your email (or GitHub)
3. Create organization (e.g., "Foundry")
4. Create project:
   - Platform: **React**
   - Project name: `foundry-dashboard`
5. **Copy the DSN** (looks like: `https://abc123@o123456.ingest.sentry.io/456789`)
   - Keep this handy for next steps

---

## Step 2: Configure Local Development (2 minutes)

Create `.dev.vars` in `apps/foundry-dashboard/` (if it doesn't exist):

```bash
cd ~/full-stack/apps/foundry-dashboard
cat > .dev.vars << 'EOF'
VITE_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/456789
EOF
```

**Replace `YOUR_DSN_HERE` with the DSN from Step 1.**

---

## Step 3: Test Locally (5 minutes)

```bash
cd ~/full-stack/apps/foundry-dashboard

# Start dev server
pnpm run dev
```

**Open browser console and run this to trigger a test error:**

```javascript
// In browser console (F12 → Console tab)
throw new Error("Sentry test error - ignore me!");
```

**Check Sentry dashboard:**
- Go to https://sentry.io/ → Projects → foundry-dashboard → Issues
- You should see your test error appear within 30 seconds

**Expected:**
- Error title: "Sentry test error - ignore me!"
- Stack trace shows browser console
- Environment: "development" (because VITE_SENTRY_DSN is set)

✅ **If you see the error, React setup works!**

---

## Step 4: Configure GitHub Secrets for All Environments (10 minutes)

**All Sentry configuration goes in GitHub Secrets** - not Cloudflare dashboard.

The build happens in GitHub Actions, so all `VITE_*` env vars must be GitHub Secrets.

### 4a. Create Sentry Auth Token:

1. In Sentry: Settings → Account → API → Auth Tokens
2. Click "Create New Token"
3. Name: `GitHub Actions - foundry-dashboard`
4. Scopes:
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
5. Click "Create Token"
6. **Copy the token** (shows once only!)

### 4b. Add ALL GitHub Secrets:

```bash
cd ~/full-stack

# Sentry DSN (same for stage + production, environment tag differentiates them)
gh secret set VITE_SENTRY_DSN --body "https://YOUR_DSN@o123456.ingest.sentry.io/456789"

# Sentry organization and project
gh secret set SENTRY_ORG --body "YOUR_ORG_SLUG"  # e.g., "foundry"
gh secret set SENTRY_PROJECT --body "foundry-dashboard"

# Sentry auth token for source map uploads
gh secret set SENTRY_AUTH_TOKEN --body "YOUR_TOKEN_FROM_STEP_4a"
```

**To find your org slug:**
- Sentry URL looks like: `https://sentry.io/organizations/YOUR_ORG_SLUG/`
- Or: Settings → General Settings → Organization Slug

**✅ GitHub Actions workflows already updated** - They now pass these secrets to the build step.

---

## Step 5: Deploy & Test Staging (10 minutes)

```bash
cd ~/full-stack

# Push to stage branch to trigger deployment
git checkout stage
git pull origin stage
git push origin stage
```

**Wait for GitHub Actions to complete** (check: https://github.com/YOUR_REPO/actions)

**Test staging:**

1. Visit https://foundry-stage.williamjshaw.ca
2. Open console (F12)
3. Trigger error: `throw new Error("Staging test error");`
4. Check Sentry → Issues
5. **Expected:** Error shows with `environment:stage` tag

---

## Step 6: Deploy & Test Production (10 minutes)

**Same as Step 5, but for production:**

```bash
git checkout main
git pull origin main
git push origin main
```

Test at https://foundry.williamjshaw.ca

---

## Success Checklist

After all steps complete, verify:

- [ ] Local dev errors appear in Sentry (environment: development)
- [ ] Staging errors appear in Sentry (environment: stage)
- [ ] Production errors appear in Sentry (environment: production)
- [ ] Stack traces show `.tsx` files (not minified `.js`)
- [ ] All three use same Sentry project
- [ ] Can filter by `environment:stage` or `environment:production`

---

## Troubleshooting

### "No errors appearing in Sentry"
```bash
# Check if DSN is set
cd ~/full-stack/apps/foundry-dashboard
pnpm run dev

# Look for console message:
# "Sentry initialized" → DSN is set ✅
# "Sentry DSN not configured" → DSN missing ❌
```

**Fix:** Check `.dev.vars` has correct DSN.

### "Source maps not working (showing .js instead of .tsx)"
- Check GitHub Actions logs for Sentry upload step
- Verify `SENTRY_AUTH_TOKEN` secret is set
- Verify `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry settings

### "Environment shows 'development' in production"
- GitHub Actions needs to pass `VITE_ENVIRONMENT=production` env var during build
- I'll help configure this when we update workflows (Step 7)

---

## What's Next?

After React setup complete:

1. **Cloudflare Workers setup** - Backend error tracking (tRPC, Durable Objects)
2. **Slack alerts** - Real-time notifications to #foundry-alerts
3. **Alert tuning** - Configure when to fire alerts

---

**Current Status:** Code changes done ✅ | Need: Steps 1-9 above

**Estimated time:** 1 hour total (mostly waiting for deploys)

---

*Created: 2026-01-04*
*For: React (frontend) Sentry integration*
*Next: Cloudflare Workers (backend) integration*
