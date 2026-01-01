# Phase 2B Planning: The Learning Loop & Agency Scale

**Date:** 2026-01-01
**Status:** Planning
**Prerequisite:** Phase 2A Complete (RBAC UI, Voice Notes, AI Chat)

---

## Executive Summary

Phase 2B transforms the Foundry from a **content generation tool** into a **learning system**. By importing actual engagement data from publishing platforms and training the G7 Engagement Prediction model, we enable the core promise: surfacing "Golden Nuggets" before they're published.

| Stream | Description | Business Value |
|--------|-------------|----------------|
| **Engagement Import** | Pull metrics from Twitter, LinkedIn | Train prediction model |
| **G7 Prediction** | Score content before publishing | Surface winners early |
| **Publishing Prep** | Scheduling metadata, calendar view | One-click scheduling |
| **Agency Dashboard** | Multi-client overview, bulk operations | 100-client scale |

**Target Outcome:** Users can filter spokes by predicted engagement (G7 > 9), approve the top 10% in 60 seconds, and schedule across platforms with confidence.

---

## Phase 2B Epics (Recommended)

### Epic 11: Engagement Data Pipeline

**Goal:** Import actual performance metrics from published content to train the G7 model.

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **11-1** | Twitter/X OAuth Integration | 4-6 hrs | P1 |
| **11-2** | LinkedIn OAuth Integration | 4-6 hrs | P1 |
| **11-3** | Engagement Webhook Receivers | 3-4 hrs | P1 |
| **11-4** | Metric Storage Schema (D1) | 2-3 hrs | P1 |
| **11-5** | Engagement Dashboard Widget | 3-4 hrs | P2 |
| **11-6** | Manual Metric Entry (Fallback) | 2-3 hrs | P2 |

**Technical Notes:**
- Twitter API v2 requires OAuth 2.0 with PKCE
- LinkedIn requires OAuth 2.0 with authorized redirect URIs
- Store metrics in D1 with spoke_id foreign key
- Consider rate limits: Twitter (300 requests/15 min), LinkedIn (100/day)

---

### Epic 12: G7 Engagement Prediction Model

**Goal:** Score content with predicted engagement before publishing, enabling "Golden Nugget" filtering.

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **12-1** | G7 Scoring Algorithm (v1) | 6-8 hrs | P1 |
| **12-2** | Vectorize Hook Database (10K+ hooks) | 4-6 hrs | P1 |
| **12-3** | Platform-Specific Prediction Models | 4-6 hrs | P1 |
| **12-4** | G7 Score Display in Review UI | 2-3 hrs | P1 |
| **12-5** | "Golden Nugget" Filter (G7 > 9) | 2-3 hrs | P1 |
| **12-6** | Model Accuracy Tracking | 3-4 hrs | P2 |

**Technical Notes:**
- G7 uses cosine similarity against Vectorize index of top performers
- Need 1000+ engagement data points before predictions are reliable
- Start with heuristic model, train ML model after data accumulation
- Correlation target: r > 0.6 between predicted and actual

**G7 Algorithm (v1 Heuristic):**
```
G7 = (0.4 * hook_similarity_to_winners) +
     (0.3 * G2_score) +
     (0.2 * platform_optimal_length) +
     (0.1 * timing_factor)
```

---

### Epic 13: Publishing & Scheduling Prep

**Goal:** Export content with scheduling metadata ready for Buffer/Hootsuite import.

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **13-1** | Content Calendar View | 4-6 hrs | P1 |
| **13-2** | Platform-Optimal Posting Times | 3-4 hrs | P1 |
| **13-3** | Scheduling Metadata Export (CSV) | 2-3 hrs | P1 |
| **13-4** | Buffer CSV Format Export | 2-3 hrs | P2 |
| **13-5** | Hootsuite CSV Format Export | 2-3 hrs | P2 |
| **13-6** | iCal Feed for Content Calendar | 3-4 hrs | P2 |

**Technical Notes:**
- Optimal posting times by platform (from industry data):
  - Twitter: 8-10 AM, 12 PM, 5-6 PM (user's timezone)
  - LinkedIn: Tue-Thu, 7-8 AM, 12 PM, 5-6 PM
  - Instagram: Mon, Wed, Fri 11 AM, 2 PM
- Store scheduling preferences per client

---

### Epic 14: Agency Scale Dashboard

**Goal:** Enable agencies to manage 100+ clients efficiently with bulk operations.

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **14-1** | Multi-Client Overview Dashboard | 4-6 hrs | P1 |
| **14-2** | Cross-Client Analytics Aggregation | 4-6 hrs | P1 |
| **14-3** | Bulk Hub Creation Across Clients | 3-4 hrs | P2 |
| **14-4** | Client Health Score Card | 3-4 hrs | P2 |
| **14-5** | Quick Client Switcher (Cmd+K) | 2-3 hrs | P1 |
| **14-6** | Agency Billing Overview | 4-6 hrs | P2 |

**Technical Notes:**
- Multi-client overview shows: pending review count, Zero-Edit Rate, last activity
- Client health score = f(Zero-Edit Rate, activity, engagement trend)
- Cmd+K command palette for instant client switching

---

### Epic 15: Real-Time Collaboration (WebSocket)

**Goal:** Enable live sync between agency and client during review sessions.

| Story | Description | Effort | Priority |
|-------|-------------|--------|----------|
| **15-1** | Durable Object WebSocket Setup | 4-6 hrs | P1 |
| **15-2** | Live Comment Sync | 3-4 hrs | P1 |
| **15-3** | Presence Indicators (Who's Online) | 2-3 hrs | P2 |
| **15-4** | Real-Time Approval Sync | 2-3 hrs | P1 |
| **15-5** | Collaborative Editing Conflict Resolution | 4-6 hrs | P2 |

**Technical Notes:**
- Use Cloudflare Durable Objects for WebSocket connections
- Each client review session = one Durable Object
- Broadcast changes to all connected clients
- Optimistic UI with server reconciliation

---

## Recommended Phase 2B Scope

### Minimum Viable Phase 2B (4-6 weeks)
Focus on **Engagement Import + G7 Prediction** - the core learning loop.

| Epic | Stories | Effort |
|------|---------|--------|
| Epic 11 | 11-1, 11-2, 11-4 | 10-14 hrs |
| Epic 12 | 12-1, 12-2, 12-4, 12-5 | 14-20 hrs |
| Epic 13 | 13-1, 13-3 | 6-9 hrs |
| **Total** | 9 stories | ~30-43 hrs |

### Full Phase 2B (8-10 weeks)
All epics including agency scale and real-time collaboration.

| Epic | Effort |
|------|--------|
| Epic 11 | 18-26 hrs |
| Epic 12 | 22-30 hrs |
| Epic 13 | 17-23 hrs |
| Epic 14 | 21-29 hrs |
| Epic 15 | 16-22 hrs |
| **Total** | ~94-130 hrs |

---

## Success Criteria

### Phase 2B Complete When:
- [ ] Twitter engagement data flows into D1
- [ ] LinkedIn engagement data flows into D1
- [ ] G7 scores appear on all spokes in review queue
- [ ] "Golden Nugget" filter (G7 > 9) works in bulk approval
- [ ] Content calendar shows scheduled content
- [ ] Export includes scheduling metadata

### Stretch Goals:
- [ ] Agency overview shows all clients
- [ ] Real-time comment sync works between agency + client
- [ ] G7 prediction accuracy (r > 0.5) after 1000+ data points

---

## Technical Dependencies

| Dependency | Required For | Setup Effort |
|------------|--------------|--------------|
| Twitter Developer Account | Epic 11-1 | 1-2 days (approval) |
| LinkedIn Developer App | Epic 11-2 | 2-3 days (approval) |
| Vectorize Index (hooks) | Epic 12-2 | Seed data needed |
| WebSocket Durable Objects | Epic 15 | Already in architecture |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Twitter API changes (Musk chaos) | Medium | High | Manual entry fallback (11-6) |
| LinkedIn API approval delayed | Medium | Medium | Prioritize Twitter first |
| G7 predictions inaccurate early | High | Low | Label as "beta", show confidence |
| WebSocket complexity | Medium | Medium | Defer to Phase 2C if needed |

---

## What's NOT in Phase 2B

- Direct publishing to platforms (Phase 2.0)
- Video rendering (Phase 2.0)
- G-Compliance Gate for regulated industries (Phase 2.0)
- White-label/marketplace (Phase 3.0)
- API access (Phase 3.0)

---

## Alternative Scopes (Pick One)

### Option A: Learning Loop Focus
**Best if:** You want to prove the "prediction beats intuition" hypothesis.
- Epic 11 (Engagement Import)
- Epic 12 (G7 Prediction)
- Partial Epic 13 (Calendar + Export)
- **Effort:** 40-55 hrs (4-5 weeks)

### Option B: Agency Scale Focus
**Best if:** You have agency customers waiting for multi-client features.
- Partial Epic 11 (Manual entry only)
- Epic 14 (Agency Dashboard)
- Epic 15 (Real-Time Collaboration)
- **Effort:** 45-60 hrs (5-6 weeks)

### Option C: Balanced Approach
**Best if:** You want breadth over depth.
- Epic 11 (partial - Twitter only)
- Epic 12 (partial - G7 v1 heuristic)
- Epic 13 (full)
- Epic 14 (partial - overview only)
- **Effort:** 50-65 hrs (5-7 weeks)

---

## Next Steps

1. **Choose scope** (Option A, B, or C)
2. **Apply for API access** (Twitter/LinkedIn - takes 1-3 days)
3. **Create Epic files** in `_bmad-output/epics/`
4. **Update sprint-status.yaml** with Phase 2B stories

---

*Document created: 2026-01-01*
*Phase 2A Status: Complete (pending ESLint blocking + E2E secrets)*
