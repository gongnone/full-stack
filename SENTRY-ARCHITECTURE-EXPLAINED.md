# Sentry Architecture - React in a Worker

## What foundry-dashboard Actually Is

Looking at `wrangler.jsonc`, foundry-dashboard is a **Worker with Assets**, not Cloudflare Pages.

```jsonc
{
  "main": "worker/index.ts",           ← It's a Worker
  "assets": {
    "directory": "./dist",             ← Serves React build from dist/
    "binding": "ASSETS"
  }
}
```

## Architecture Flow

```
User visits foundry-stage.williamjshaw.ca
  ↓
Cloudflare Worker (foundry-dashboard-stage)
  ↓ Serves: dist/index.html (React app)
  ↓ Also handles: tRPC, Durable Objects, etc.
  ↓
React runs in user's browser
  ↓ Makes tRPC calls back to same Worker
  ↓
Worker handles backend logic
```

## Two Different Sentry Integrations

### 1. React (Frontend) - Runs in Browser

**When:** Build time (in GitHub Actions)
**Needs:** `VITE_SENTRY_DSN` as GitHub Secret
**Why:** Vite bakes env vars into the JavaScript bundle during build

**Build process:**
```bash
# In GitHub Actions:
VITE_SENTRY_DSN=${{ secrets.VITE_SENTRY_DSN }}  # ← Must be GitHub secret
pnpm build
# Creates: dist/assets/index-abc123.js (with Sentry DSN baked in)
wrangler deploy --env stage
# Uploads: dist/ to Worker assets
```

### 2. Worker (Backend) - Runs on Cloudflare Edge

**When:** Runtime (when Worker handles requests)
**Needs:** `SENTRY_DSN` as Cloudflare var/secret
**Why:** Worker needs runtime access to DSN

**We'll do this later** (not now).

## Why BOTH GitHub AND Cloudflare?

| Component | Where Code Runs | DSN Needed At | Secret Location |
|-----------|----------------|---------------|-----------------|
| React frontend | User's browser | **Build time** | **GitHub Secrets** |
| Worker backend | Cloudflare edge | **Runtime** | Cloudflare Dashboard |

**Both are needed** because:
- React is built in GitHub Actions → needs GitHub secret
- Worker runs on Cloudflare → needs Cloudflare var/secret

## Current Issue: Why You See "DSN not configured"

### Timeline:

1. **I pushed code** (commit ce68833) to stage
2. **GitHub Actions ran build** WITHOUT `VITE_SENTRY_DSN` secret set
3. **Build completed** with no DSN baked in
4. **Deployed to staging** with broken Sentry config
5. **You visit staging** → Console says "DSN not configured"

### The Fix:

1. **Add GitHub secret:** `VITE_SENTRY_DSN`
2. **Re-deploy:** Push again or manual trigger
3. **New build** will have DSN baked in
4. **Staging works**

## You Were Right About Cloudflare Secrets

You said: "these secrets need to go in cloudflare i'm assuming"

**You're partially right:**
- ✅ Worker backend errors → Cloudflare secrets (later)
- ❌ React frontend errors → GitHub secrets (now)

**Both are needed eventually**, just for different parts:
- React build → GitHub
- Worker runtime → Cloudflare

## What You Need to Do NOW

### Step 1: Add GitHub Secret

Go to: https://github.com/gongnone/full-stack/settings/secrets/actions

Click "New repository secret":
- **Name:** `VITE_SENTRY_DSN`
- **Value:** `https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152`

### Step 2: Re-Deploy

Trigger new deployment with the secret:

```bash
cd ~/full-stack
git commit --allow-empty -m "chore: trigger redeploy with Sentry secrets"
git push origin stage
```

### Step 3: Verify

After deployment completes (~5 min):

Visit: https://foundry-stage.williamjshaw.ca/sentry-test

Console should show:
```
[Sentry] ✅ Initialized { dsn: "https://94cad...", environment: "stage" }
```

## What About Cloudflare Secrets? (Later)

When we add Worker Sentry integration (backend errors), we'll add to Cloudflare:

**Cloudflare Dashboard → Workers → foundry-dashboard-stage → Settings → Variables:**
- `SENTRY_DSN` (no VITE_ prefix)
- `SENTRY_RELEASE` (git SHA)

**Not needed yet** - we're only doing React right now.

---

## Summary: I Was Right AND Wrong

**Right about:**
- ✅ React needs GitHub secrets (VITE_SENTRY_DSN)
- ✅ Build happens in GitHub Actions
- ✅ Secrets must be set before deployment

**Wrong about:**
- ❌ Said it's "Cloudflare Pages" (it's actually Worker with Assets)
- ❌ Didn't fully explain that Worker will ALSO need Cloudflare secrets later

**You were right:**
- ✅ Cloudflare secrets ARE needed (for Worker backend, later)
- ✅ It's not JUST GitHub secrets

Both are needed, just for different parts at different times.

---

*React = GitHub Secrets (now) | Worker = Cloudflare Secrets (later)*
*Current issue: Deployed without GitHub secret set, need to re-deploy*
*Date: 2026-01-04*
