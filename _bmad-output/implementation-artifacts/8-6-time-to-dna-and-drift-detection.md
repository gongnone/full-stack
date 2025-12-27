# Story 8.6: Time-to-DNA & Drift Detection

**Status:** done
**Story Points:** 5
**Sprint:** 5
**Epic:** 8 - Performance Analytics & Learning Loop

## Story

As an **Agency Owner**,
I want **to track how quickly the AI learns a new brand's voice**,
So that **I can demonstrate ROI to clients and catch quality drift early**.

## Acceptance Criteria

### AC1: Time-to-DNA Metric
**Given** a new client is onboarded
**When** multiple Hubs are processed
**Then** the system calculates the number of Hubs required to reach a 60% Zero-Edit Rate
**And** this "Time-to-DNA" score is displayed on the client analytics page

### AC2: Voice Drift Detection
**Given** a client has established Brand DNA
**When** the average cosine similarity of new spokes drops 15% below the established baseline
**Then** a "Voice Drift" alert is triggered on the dashboard
**And** the system recommends a "Grounding Audit" or new voice note calibration

## Tasks / Subtasks

- [x] **Task 1: Durable Object Logic**
  - [x] Implement drift detection comparison in `getDNAReport`
  - [x] Calculate moving average of voice similarity scores

- [x] **Task 2: tRPC Router Implementation**
  - [x] Implement `analytics.getTimeToDNA` query

- [x] **Task 3: Frontend Alerts**
  - [x] Add drift detection badges to the Client Selector and Analytics page

## Implementation Notes

- **Baseline:** The system establishes a "Voice Baseline" after the first 3 Hubs reach a 60% Zero-Edit Rate.
- **Alert Trigger:** Drift is calculated using the `G4 Similarity Score` moving average over the last 50 spokes.
