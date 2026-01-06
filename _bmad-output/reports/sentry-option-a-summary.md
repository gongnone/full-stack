# Sentry Installation - Option A Summary

**Date:** 2026-01-04
**Decision:** Option A - Single Sentry project with environment tags
**Status:** ✅ Documentation complete, ready for implementation
**Approved by:** Williamshaw (Product Owner)

---

## Executive Summary

Sentry error tracking will be installed on **both staging and production URLs** using a single Sentry project with environment tags. This provides full error visibility across both environments while keeping costs at $26/month.

---

## Configuration: Option A

### Single Project Approach

**Sentry Project:** `foundry-dashboard`
**DSN:** `https://[key]@[org].ingest.sentry.io/[project]` (same for both)

| Environment | URL | ENVIRONMENT Var | Sample Rate |
|-------------|-----|-----------------|-------------|
| **Staging** | foundry-stage.williamjshaw.ca | `stage` | 100% |
| **Production** | foundry.williamjshaw.ca | `production` | 10% |

### Why Option A?

✅ **Cost-effective:** $26/month instead of $52/month
✅ **Unified dashboard:** Compare stage vs production easily
✅ **Shared budget:** 5K errors + 10K transactions across both
✅ **Same release tracking:** Correlate errors to deployments
✅ **Simple setup:** One DSN, one project to manage

---

## Cost Breakdown

| Item | Cost | Notes |
|------|------|-------|
| Sentry Developer Plan | $26/month | Up to 5K errors, 10K transactions |
| Implementation | 4-6 hours | One-time developer cost |
| Ongoing maintenance | ~1 hour/month | Alert tuning, monitoring |

**Total monthly:** $26 (no change from single environment)

---

## URLs Configured

### Staging Environment
- **URL:** https://foundry-stage.williamjshaw.ca
- **Worker:** foundry-dashboard-stage
- **Environment tag:** `stage`
- **Sample rate:** 100% (capture all errors, low traffic)
- **Alerts:** #foundry-staging-alerts (Slack)

### Production Environment
- **URL:** https://foundry.williamjshaw.ca
- **Worker:** foundry-dashboard (production)
- **Environment tag:** `production`
- **Sample rate:** 10% (cost control, high traffic)
- **Alerts:** #foundry-alerts (Slack) + email on-call

---

## Environment Variables

### Same for Both Environments

```bash
SENTRY_DSN = https://[key]@[org].ingest.sentry.io/[project]
```

### Different for Each Environment

**Staging:**
```bash
ENVIRONMENT = stage
SENTRY_RELEASE = ${GIT_SHA}
```

**Production:**
```bash
ENVIRONMENT = production
SENTRY_RELEASE = ${GIT_SHA}
```

---

## Filtering in Sentry Dashboard

View errors by environment:

```
# Staging only
environment:stage

# Production only
environment:production

# Both (no filter)
(all environments)
```

---

## Implementation Resources

### Primary Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Implementation Plan** | Step-by-step guide (4-6 hours) | `SENTRY-1-implementation-plan.md` |
| **Quick Start Guide** | TL;DR for developer | `SENTRY-1-quick-start.md` |
| **Sprint Item** | Full context and AC | `sprints/sentry-error-tracking-installation.md` |
| **Gap Analysis** | Manual testing justification | `reports/manual-testing-gaps-sentry-analysis.md` |

### Code Changes Required

**New files to create:**
- `worker/sentry.ts` - Sentry initialization for Workers
- `src/components/errors/SentryErrorBoundary.tsx` - React error boundary

**Files to modify:**
- `worker/index.ts` - Add Sentry initialization
- `worker/trpc/index.ts` - Add error handler
- `worker/durable-objects/BrandDNAAgent.ts` - Add DO error tracking
- `src/entry.client.tsx` - Initialize Sentry React
- `src/app.tsx` - Wrap with error boundary
- `vite.config.ts` - Enable source maps
- `.github/workflows/deploy-stage.yaml` - Add source map upload
- `.github/workflows/deploy-production.yaml` - Add source map upload

---

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Setup** | 15 min | Sentry account + project created |
| **Worker Integration** | 2-3 hours | Error tracking in Workers/DOs |
| **React Integration** | 1-2 hours | Error boundaries, tRPC integration |
| **Environment Config** | 30 min | Cloudflare env vars set |
| **Source Maps & CI** | 1-2 hours | GitHub Actions configured |
| **Testing** | 1 hour | Both environments verified |
| **Alerts** | 30 min | Slack/email alerts configured |
| **Total** | **4-6 hours** | Production-ready error tracking |

---

## Success Metrics

### Week 1 (Staging)
- ✅ 100% of errors captured in Sentry
- ✅ 0 false positive alerts
- ✅ Stack traces show TypeScript source files

### Week 2 (Production Soft Launch)
- ✅ <5% overhead on performance
- ✅ Alerts fire within 2 minutes of error spike
- ✅ 0 PII/sensitive data leaks

### Week 3 (Full Production)
- ✅ Mean time to detect (MTTD) < 5 minutes
- ✅ 90% of production errors diagnosable from Sentry alone
- ✅ Team uses Sentry as primary error investigation tool

---

## Expected Impact

### Before (Current State)
❌ Email bug took **7 hours** to diagnose
❌ Errors invisible until users report them
❌ No stack traces in production
❌ Manual database log inspection required
❌ Can't measure user impact

### After (With Sentry - Option A)
✅ **30-minute** diagnosis (automatic stack trace + context)
✅ Real-time alerts to Slack (#foundry-alerts + #foundry-staging-alerts)
✅ TypeScript source files/line numbers via source maps
✅ Automatic error aggregation + trends
✅ User count + session context for every error
✅ Both stage and production monitored from one dashboard

---

## Manual Testing Enhancement

Dana (QA): "With Sentry on both stage and production, I can:"

1. **Validate staging deployments:**
   - Check Sentry after test session
   - Verify no backend errors occurred
   - Self-serve error investigation

2. **Production validation:**
   - Monitor production after deploy
   - Confirm no new errors introduced
   - Track error rates vs baseline

3. **Bug reproduction:**
   - Get exact stack trace from Sentry
   - See user context (client, session)
   - Reproduce with full context

---

## Next Steps - Action Required

**Product Owner (Williamshaw):**
- [x] Approve Option A configuration ✅
- [x] Approve $26/month budget ✅
- [ ] Assign developer for implementation
- [ ] Set target start date (recommended: 2026-01-06)
- [ ] Provide alert recipient details:
  - Slack channels created? (#foundry-alerts, #foundry-staging-alerts)
  - Email for on-call alerts?

**Assigned Developer:**
- [ ] Read implementation plan
- [ ] Create Sentry account (15 min)
- [ ] Follow 7-phase implementation (4-6 hours)
- [ ] Test both environments
- [ ] Configure alerts
- [ ] Mark SENTRY-1 as complete

---

## Related Incidents

**Email Triple-Send Bug (2026-01-04):**
- Diagnosis: 7 hours (3 failed fix attempts)
- Root cause: Manual DB log inspection required
- **With Sentry:** Would have been diagnosed in 30 minutes
  - Error: "DOMParser is not defined"
  - Stack trace: `worker/email/index.ts:156`
  - Context: User, client ID, environment

---

## FAQ

### Q: Why not separate projects for stage and production?
**A:** Costs double ($52/mo vs $26/mo) with no significant benefit for small teams. Environment tags provide same isolation with unified dashboard.

### Q: What if we hit the 5K error limit?
**A:** Sample rates (stage 100%, prod 10%) keep us well under limit. If needed, reduce production to 5% or upgrade to Team plan ($80/mo, 50K errors).

### Q: Do we need to redeploy to add Sentry?
**A:** Yes, both staging and production will need redeployment. GitHub Actions workflows handle this automatically on merge.

### Q: Can we test before full rollout?
**A:** Yes! Deploy to staging first, test thoroughly, then deploy to production when confident.

### Q: What happens if Sentry goes down?
**A:** App continues normally. Sentry SDK is non-blocking - if it can't send errors, it fails silently.

---

## Approval Record

**Decision:** Install Sentry using Option A (single project + environment tags)
**Approved by:** Williamshaw (Product Owner)
**Date:** 2026-01-04
**Budget:** $26/month approved
**Configuration:** Both stage + production URLs
**Implementation:** Ready to proceed

---

*Summary document for Sentry Option A implementation*
*All planning documents completed and ready for execution*
