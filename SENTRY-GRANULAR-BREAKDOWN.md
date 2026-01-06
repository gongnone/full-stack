# Sentry DSN Not Configured - Granular Breakdown

## What I THINK Is Happening (You Verify Each Step)

### Scenario: Cloudflare Pages Git Integration Overwriting GitHub Actions

---

## Step-by-Step Flow

### Step 1: Code is Pushed to GitHub
```
git push origin stage
→ Commit fca4a5e pushed to stage branch
```
✅ This definitely happened.

---

### Step 2: GitHub Actions Triggers
```
GitHub detects push to stage branch
→ Triggers: .github/workflows/deploy-stage.yaml
→ Workflow runs with VITE_SENTRY_DSN from GitHub Secrets
```

**CHECK THIS:**
Go to: https://github.com/gongnone/full-stack/actions
- Did the workflow complete successfully? (green checkmark)
- Did the "🏗️ Build React App" step run?
- Did it have access to VITE_SENTRY_DSN?

---

### Step 3: GitHub Actions Builds with Sentry
```
pnpm --filter foundry-dashboard run build
env:
  VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }} ✅
  VITE_ENVIRONMENT: stage ✅

Result: dist/ folder with DSN baked in
```

**What SHOULD happen:**
- Vite reads VITE_SENTRY_DSN from env
- Bakes DSN into JavaScript bundle
- Creates: dist/assets/index-XXXXX.js (with DSN)

---

### Step 4: GitHub Actions Deploys to Cloudflare
```
cd apps/foundry-dashboard
npx wrangler deploy --env stage

Result: Uploads dist/ to Cloudflare Worker
```

**What SHOULD happen:**
- Wrangler uploads the dist/ folder to Cloudflare
- Cloudflare serves this version
- DSN is in the bundle ✅

---

### Step 5: **YOUR SUSPICION - Cloudflare Git Integration Overwrites**

**IF Cloudflare Pages has Git integration enabled:**

```
Cloudflare detects git push to stage branch
→ Triggers automatic build in Cloudflare (NOT GitHub Actions)
→ Runs: npm install && npm run build (or similar)
→ NO access to GitHub Secrets (VITE_SENTRY_DSN is undefined!)
→ Builds new dist/ WITHOUT DSN
→ OVERWRITES the GitHub Actions deployment
```

**Result:**
- GitHub Actions deployed correct build ✅
- But Cloudflare rebuild AFTER with wrong build ❌
- Cloudflare's build wins (most recent) ❌
- User sees: "Sentry DSN not configured" ❌

---

## How to Verify Your Suspicion

### Check 1: Does Cloudflare Pages Have Git Integration?

**Go to Cloudflare Dashboard:**
1. Workers & Pages
2. foundry-dashboard-stage
3. Settings → Builds & deployments

**Look for:**
- "Git integration" section
- "Connected repository" (GitHub)
- "Automatic deployments" toggle

**If you see these:** Git integration IS enabled
**If automatic deployments ON:** Cloudflare is rebuilding on every push

---

### Check 2: Look at Deployment Source

In your screenshot, I see:
```
Deployed 2 minutes ago by wjs via Wrangler
Latest: f145902e (Workers Builds)
```

**Questions:**
1. Does it say "via Wrangler" or "via Git"?
2. Are there TWO deployments for the same commit?
   - One from Wrangler (GitHub Actions)
   - One from Git (Cloudflare automatic build)

**CHECK:** Click "View all deployments"
- Look for MULTIPLE deployments of commit fca4a5e
- If you see two: GitHub Actions deployed, then Cloudflare rebuilt

---

### Check 3: Cloudflare Build Settings

**Go to:** Settings → Builds & deployments → Build configuration

**What's the build command?**
- If it's: `npm run build` or `pnpm build`
- WITHOUT env vars configured
- Then it's building without VITE_SENTRY_DSN ❌

**What env vars are configured?**
- Go to: Settings → Environment variables
- Look for: `VITE_SENTRY_DSN`

**If VITE_SENTRY_DSN is NOT there:**
- Cloudflare's automatic builds don't have the DSN
- They overwrite GitHub Actions deployments
- **THIS IS THE PROBLEM**

---

## Two Deployment Methods (Conflicting)

### Method 1: GitHub Actions (What I Set Up)
```
Git push
→ GitHub Actions workflow
→ Build with GitHub Secrets (VITE_SENTRY_DSN)
→ wrangler deploy
→ Correct build deployed ✅
```

### Method 2: Cloudflare Git Integration (If Enabled)
```
Git push
→ Cloudflare detects push
→ Automatic build in Cloudflare
→ Build WITHOUT VITE_SENTRY_DSN (not configured)
→ Wrong build deployed ❌
→ OVERWRITES Method 1 ❌
```

---

## The Fix (If Your Suspicion Is Correct)

### Option A: Disable Cloudflare Git Integration (Recommended)

**Why:** We want GitHub Actions to handle deployments (with secrets)

**How:**
1. Go to: Cloudflare → Workers & Pages → foundry-dashboard-stage
2. Settings → Builds & deployments
3. Find "Automatic deployments" toggle
4. **Turn it OFF**

**Result:** Only GitHub Actions deploys (with correct env vars)

---

### Option B: Add Env Vars to Cloudflare Pages

**Why:** Let Cloudflare Git integration work, but give it the secrets

**How:**
1. Go to: Cloudflare → Workers & Pages → foundry-dashboard-stage
2. Settings → Environment variables
3. Add for "Production" environment:
   ```
   VITE_SENTRY_DSN = https://94cad1254a9249bde7030761f32ea1a2@o4510652761964544.ingest.us.sentry.io/4510652827697152
   VITE_ENVIRONMENT = stage
   SENTRY_ORG = (your org slug)
   SENTRY_PROJECT = foundry-dashboard
   SENTRY_AUTH_TOKEN = (your token)
   ```

**Result:** Cloudflare builds will have the DSN

**Downside:** Secrets in two places (GitHub + Cloudflare)

---

## What You Need to Check and Tell Me

### 1. Git Integration Status
**Go to:** Cloudflare → foundry-dashboard-stage → Settings → Builds & deployments

**Question:** Is Git integration enabled?
- [ ] Yes, connected to GitHub
- [ ] No, no Git integration

**Question:** Is "Automatic deployments" ON?
- [ ] Yes, auto-deploys on push
- [ ] No, manual only

---

### 2. Deployment History
**Go to:** Cloudflare → foundry-dashboard-stage → Deployments

**Question:** For commit fca4a5e, how many deployments exist?
- [ ] One deployment
- [ ] Two deployments (one from Wrangler, one from Git)

**Question:** What does the latest deployment say?
- [ ] "via Wrangler"
- [ ] "via Git"
- [ ] Something else

---

### 3. Environment Variables
**Go to:** Cloudflare → foundry-dashboard-stage → Settings → Environment variables

**Question:** Is VITE_SENTRY_DSN configured there?
- [ ] Yes, it's there
- [ ] No, it's missing

---

### 4. Build Configuration
**Go to:** Cloudflare → foundry-dashboard-stage → Settings → Builds & deployments

**Question:** What's the build command?
- Build command: ________________
- Build output directory: ________________

---

## My Recommendation (Based on Your Suspicion)

**You're likely correct.** Here's what I think is happening:

1. ✅ GitHub Actions builds correctly (with DSN)
2. ✅ GitHub Actions deploys via wrangler
3. ❌ Cloudflare Git integration detects push
4. ❌ Cloudflare rebuilds WITHOUT DSN (env var not in Cloudflare)
5. ❌ Cloudflare's build overwrites GitHub Actions build
6. ❌ User sees broken build (no DSN)

**The fix:**
- **Option A:** Disable Cloudflare automatic deployments (use only GitHub Actions)
- **Option B:** Add VITE_SENTRY_DSN to Cloudflare environment variables

**I recommend Option A** - one deployment method, one source of truth for secrets.

---

## Check These and Report Back

Please check:
1. Is Git integration enabled in Cloudflare?
2. Are automatic deployments turned on?
3. Is VITE_SENTRY_DSN in Cloudflare env vars?
4. Are there multiple deployments of the same commit?

Tell me what you find, and I'll give you the exact fix.

---

*Your suspicion is very likely correct - Git integration overwriting wrangler deploys*
*Date: 2026-01-04 16:45*
