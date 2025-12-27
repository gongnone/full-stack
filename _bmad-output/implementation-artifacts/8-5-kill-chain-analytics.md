# Story 8.5: Kill Chain Analytics

**Status:** done
**Story Points:** 3
**Sprint:** 5
**Epic:** 8 - Performance Analytics & Learning Loop

## Story

As an **Executive Producer**,
I want **to understand how the Kill Chain is being utilized**,
So that **I can identify patterns in content rejection and improve source material selection**.

## Acceptance Criteria

### AC1: Hub Kill Metrics
**Given** a Hub is killed (using the Kill Chain)
**When** the operation completes
**Then** a `hub_kill` metric is recorded with the number of affected spokes
**And** the dashboard shows total Hubs killed per month

### AC2: Rejection Pattern Insights
**Given** multiple Hub or Pillar kills
**When** I view Kill Chain analytics
**Then** I see the top reasons for mass rejections
**And** the system identifies if rejections are correlated with specific source types

## Tasks / Subtasks

- [x] **Task 1: Metric Recording**
  - [x] Update `ClientAgent.killHub` to record `hub_kill` metric with metadata

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `analytics.getKillChainAnalytics` query

- [x] **Task 3: Analytics Integration**
  - [x] Ensure Kill Chain data is available for reporting in the Executive Producer Report

## Implementation Notes

- **Data Capture:** We capture `spokesKilled` and `survivedCount` (mutated spokes) for every Hub Kill action to track the efficiency of the "Mutation Rule".
