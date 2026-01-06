# Deployment #137 - Checking Failure

## What I Need to Know

You mentioned seeing "failed actions (or skipped)" in run #137.

### Please tell me:

1. **Which specific step failed?**
   - 🛡️ Resource Isolation Check?
   - 🛡️ Quality Gate?
   - 🏗️ Build React App?
   - 🚀 Deploy to Cloudflare?
   - Other?

2. **What's the exact error message?**
   Copy/paste the error from the failed step.

3. **Are steps "skipped" or "failed"?**
   - Skipped = step didn't run (normal if previous step failed)
   - Failed = step ran but errored (this is the problem)

---

## Common Failure Reasons

### If "🛡️ Quality Gate" Failed
**Likely cause:** TypeScript errors or ESLint errors

**To check locally:**
```bash
cd ~/full-stack
pnpm run foundry:typecheck:build
pnpm run foundry:lint
```

**If errors:** Fix them and push again

---

### If "🏗️ Build React App" Failed
**Likely cause:** Build error or Sentry plugin error

**Error might look like:**
- "Failed to upload source maps to Sentry"
- "SENTRY_AUTH_TOKEN is invalid"
- Vite build error

**To check locally:**
```bash
cd apps/foundry-dashboard
VITE_SENTRY_DSN="https://94cad..." \
VITE_ENVIRONMENT=stage \
SENTRY_ORG="your-org" \
SENTRY_PROJECT=foundry-dashboard \
pnpm build
```

---

### If "🚀 Deploy to Cloudflare" Failed
**Likely cause:** Wrangler error or authentication

**Error might look like:**
- "Authentication error"
- "Failed to publish"
- "Worker upload failed"

---

## What to Do

**Tell me the exact step name and error message** and I'll fix it immediately.

**Or if you can see it:**
1. Go to: https://github.com/gongnone/full-stack/actions/runs/XXXX
2. Click the failed step (red X)
3. Copy the error message
4. Send it to me

I'll diagnose and fix it right away.
