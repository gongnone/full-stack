# Foundry MVP Deployment Checklist

**Date:** 2025-12-26
**Status:** Pre-Production Review
**Reference:** [Cloudflare Workers Production Safety](https://blog.cloudflare.com/workers-production-safety/)

---

## 1. Secrets Configuration (Cloudflare Dashboard)

### foundry-dashboard-stage
| Secret | Required | Status |
|--------|----------|--------|
| `BETTER_AUTH_SECRET` | Yes | ⬜ Verify |
| `GOOGLE_CLIENT_ID` | Optional | ⬜ Verify |
| `GOOGLE_CLIENT_SECRET` | Optional | ⬜ Verify |
| `GITHUB_CLIENT_ID` | Optional | ⬜ Verify |
| `GITHUB_CLIENT_SECRET` | Optional | ⬜ Verify |

### foundry-dashboard-production
| Secret | Required | Status |
|--------|----------|--------|
| `BETTER_AUTH_SECRET` | Yes | ⬜ Verify |
| `GOOGLE_CLIENT_ID` | Optional | ⬜ Verify |
| `GOOGLE_CLIENT_SECRET` | Optional | ⬜ Verify |
| `GITHUB_CLIENT_ID` | Optional | ⬜ Verify |
| `GITHUB_CLIENT_SECRET` | Optional | ⬜ Verify |

**To set secrets:**
```bash
# Stage
npx wrangler secret put BETTER_AUTH_SECRET --env stage
npx wrangler secret put GOOGLE_CLIENT_ID --env stage
npx wrangler secret put GOOGLE_CLIENT_SECRET --env stage

# Production
npx wrangler secret put BETTER_AUTH_SECRET --env production
npx wrangler secret put GOOGLE_CLIENT_ID --env production
npx wrangler secret put GOOGLE_CLIENT_SECRET --env production
```

---

## 2. D1 Database Migrations

D1 migrations must be applied manually to stage and production databases.

### Stage Database
```bash
cd apps/foundry-dashboard

# Apply all migrations to stage
for f in migrations/*.sql; do
  echo "Applying $f..."
  npx wrangler d1 execute foundry-global-stage --remote --file="$f"
done
```

### Production Database
```bash
cd apps/foundry-dashboard

# Apply all migrations to production
for f in migrations/*.sql; do
  echo "Applying $f..."
  npx wrangler d1 execute foundry-global --remote --file="$f"
done
```

### Verify Tables Exist
```bash
# Stage
npx wrangler d1 execute foundry-global-stage --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Expected tables:
# - user, session, account, verification (Better Auth)
# - user_profile, brand_dna, voice_entities, training_samples
# - hubs, hub_sources, extracted_pillars, spokes
# - clients, client_members, shareable_links
```

---

## 3. Cloudflare Queues

The foundry-engine requires two queues for async processing.

### Required Queues

| Queue Name | Environment |
|------------|-------------|
| `spoke-generation-queue-stage` | Stage |
| `quality-gate-queue-stage` | Stage |
| `spoke-generation-queue` | Production |
| `quality-gate-queue` | Production |

**Create queues if missing:**
```bash
# Stage
npx wrangler queues create spoke-generation-queue-stage
npx wrangler queues create quality-gate-queue-stage

# Production
npx wrangler queues create spoke-generation-queue
npx wrangler queues create quality-gate-queue
```

---

## 4. Custom Domains

Verify custom domains are configured in Cloudflare Dashboard:

| Worker | Domain | Status |
|--------|--------|--------|
| foundry-dashboard-stage | foundry-stage.williamjshaw.ca | ⬜ Verify DNS |
| foundry-dashboard-production | foundry.williamjshaw.ca | ⬜ Verify DNS |

**DNS Requirements:**
- CNAME or AAAA record pointing to Cloudflare
- SSL/TLS mode: Full (strict) recommended

---

## 5. Gradual Deployments (Recommended)

Cloudflare supports [gradual deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/) for production safety.

### Current Status: Not Configured (All-at-Once)

**Recommendation for Production Launch:**

1. **Enable via Dashboard:**
   - Workers & Pages > foundry-dashboard-production > Deployments
   - Enable "Gradual Rollouts"

2. **Rollout Strategy:**
   - 10% → Monitor 15 mins
   - 50% → Monitor 30 mins
   - 100% → Full deployment

3. **Rollback Capability:**
   - Cloudflare keeps [100 versions](https://developers.cloudflare.com/changelog/2025-09-11-increased-version-rollback-limit/)
   - One-click rollback in dashboard

---

## 6. Rate Limiting (Recommended for Production)

Current status: Not implemented.

**Options:**

### Option A: Cloudflare Rate Limiting Rules (Dashboard)
- Workers & Pages > foundry-dashboard-production > Settings > Rate Limiting
- Recommended limits:
  - Auth endpoints: 10 req/min per IP
  - API endpoints: 100 req/min per IP

### Option B: Workers Rate Limiting API (Code)
```typescript
// In worker code - requires Workers Rate Limiting API
const { success } = await env.RATE_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') });
if (!success) {
  return new Response('Rate limited', { status: 429 });
}
```

---

## 7. Observability

### Already Configured
- ✅ `observability.enabled: true` in all wrangler configs
- ✅ Cloudflare dashboard shows logs and analytics

### Recommended Additions
- ⬜ Set up [Tail Workers](https://developers.cloudflare.com/workers/observability/tail-workers/) for error alerting
- ⬜ Configure alerting in Cloudflare Dashboard for error spikes

---

## 8. OAuth Callback URLs

Ensure OAuth providers have correct callback URLs:

### Google Cloud Console
```
# Stage
https://foundry-stage.williamjshaw.ca/api/auth/callback/google

# Production
https://foundry.williamjshaw.ca/api/auth/callback/google
```

### GitHub Developer Settings
```
# Stage
https://foundry-stage.williamjshaw.ca/api/auth/callback/github

# Production
https://foundry.williamjshaw.ca/api/auth/callback/github
```

---

## 9. Pre-Launch Verification

### Smoke Tests
```bash
# Stage health check
curl -I https://foundry-stage.williamjshaw.ca

# Auth endpoint
curl https://foundry-stage.williamjshaw.ca/api/auth/session

# tRPC endpoint
curl https://foundry-stage.williamjshaw.ca/trpc/health
```

### E2E Tests Against Stage
```bash
cd apps/foundry-dashboard
BASE_URL=https://foundry-stage.williamjshaw.ca pnpm exec playwright test
```

---

## 10. Production Launch Sequence

1. ⬜ Verify all secrets set in production
2. ⬜ Apply all D1 migrations to production database
3. ⬜ Verify queues exist in production
4. ⬜ Configure OAuth callback URLs for production domain
5. ⬜ Enable gradual deployments
6. ⬜ Merge to main branch (triggers production deploy)
7. ⬜ Monitor deployment at 10% for 15 minutes
8. ⬜ Progress to 50%, then 100%
9. ⬜ Run E2E tests against production
10. ⬜ Monitor error rates in dashboard

---

## Quick Reference: Resource IDs

| Resource | Stage | Production |
|----------|-------|------------|
| D1 Database | foundry-global-stage (e35604ee) | foundry-global (bd287f3f) |
| R2 Bucket | foundry-media | foundry-media |
| Vectorize | foundry-embeddings | foundry-embeddings |

---

*Generated by Claude Opus 4.5 | 2025-12-26*

Sources:
- [Cloudflare Workers Production Safety](https://blog.cloudflare.com/workers-production-safety/)
- [Gradual Deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/gradual-deployments/)
- [Version Rollback Limit](https://developers.cloudflare.com/changelog/2025-09-11-increased-version-rollback-limit/)
- [D1 Local Development](https://developers.cloudflare.com/d1/best-practices/local-development/)
