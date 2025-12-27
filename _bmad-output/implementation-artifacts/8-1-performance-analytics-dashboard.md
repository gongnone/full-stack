# Stories 8.1 - 8.4: Performance Analytics & Learning Loop

**Status:** done
**Story Points:** 12
**Sprint:** 5
**Epic:** 8 - Performance Analytics & Learning Loop

## Story

As an **Executive Producer**,
I want **to track Zero-Edit Rates, Critic pass rates, and Self-Healing efficiency**,
So that **I can quantify the system's learning progress and ROI**.

## Acceptance Criteria

### AC1: Zero-Edit Rate Tracking
**Given** a spoke is approved without manual edits
**When** the approval executes
**Then** a `zero_edit_approval` metric is recorded in the client's analytics table
**And** the Analytics Dashboard shows the current Zero-Edit Rate percentage

### AC2: Critic Pass Rate Monitoring
**Given** spokes are evaluated by quality gates
**When** the evaluation finishes
**Then** pass/fail results for G2, G4, G5, and G6 are logged
**And** the dashboard displays the first-pass success rate for each gate

### AC3: Self-Healing Efficiency
**Given** spokes undergo automatic regeneration
**When** the healing loop completes
**Then** the number of loops required is recorded
**And** the dashboard shows the average loops per spoke (target: < 1.2)

### AC4: Review Velocity
**Given** I am in Sprint Mode
**When** I make a decision (Approve/Kill)
**Then** the decision time is recorded
**And** the dashboard shows average decision time (target: < 6 sec)

## Tasks / Subtasks

- [x] **Task 1: Durable Object Analytics Logic**
  - [x] Implement `recordMetric` in `ClientAgent` DO
  - [x] Implement `getMetrics` query in `ClientAgent` with period filtering
  - [x] Add `analytics` SQLite table to DO schema

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `analytics.getZeroEditRate` proxy query
  - [x] Implement `analytics.getCriticPassRate` proxy query
  - [x] Implement `analytics.getSelfHealingEfficiency` proxy query
  - [x] Implement `analytics.getReviewVelocity` proxy query

- [x] **Task 3: Frontend Dashboard**
  - [x] Connect `AnalyticsPage.tsx` to real tRPC queries
  - [x] Implement `MetricCard` with trend indicators (↑/↓)
  - [x] Implement `GateMiniCard` for granular quality gate tracking

## Implementation Notes

- **Metric Types:**
  - `zero_edit_approval`: 1 if approved without edit, 0 otherwise.
  - `review_decision_time`: value in seconds.
  - `self_healing_loops`: number of iterations (0-3).
- **Trend Calculation:** Currently uses a simple two-half period comparison to determine if metrics are improving or declining.
