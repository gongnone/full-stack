# Self-Correction Review: Entire Application (2025-12-24)

## Feature Overview
System-wide audit for hardcoded values, magic numbers, and error-handling gaps across all Epics.

## Findings

### Epic 1: Foundation & Identity
... (previous findings) ...

---

### Epic 2: Brand Intelligence & Voice Capture
... (previous findings) ...

---

### Epic 3: Hub Creation & Ingestion
... (previous findings) ...

---

### Epic 4: Spoke Generation & Quality Assurance
... (previous findings) ...

---

### Epic 5: Executive Producer Dashboard
... (previous findings) ...

---

### Epic 6: Content Export & Publishing Prep
... (previous findings) ...

---

### Epic 7: Multi-Client Agency Operations
... (previous findings) ...

---

### Epic 8: Performance Analytics & Learning Loop
#### 1. Hardcoded Magic Numbers & Timeouts
- **Location:** `apps/foundry-dashboard/src/routes/app/analytics.tsx`
  - `periodDays: 30` (Multiple lines) - Default period is hardcoded multiple times.
- **Location:** `apps/foundry-dashboard/src/components/analytics/CriticTrends.tsx`
  - `domain={[60, 100]}` (Line 85) - Hardcoded chart Y-axis domain.
- **Location:** `apps/foundry-dashboard/src/components/analytics/DriftDetector.tsx`
  - `currentStrength >= 80` (Line 105) - Hardcoded threshold for UI color logic.
  - `domain={[0, 40]}` (Line 191) - Hardcoded drift score domain.

#### 2. Lack of Centralized Constants
- **Location:** `apps/foundry-dashboard/src/components/analytics/CriticTrends.tsx`
  - Chart colors (`#ff6b6b`, `#4ecdc4`, etc.) are hardcoded hex strings.
- **Location:** `apps/foundry-dashboard/src/components/analytics/ZeroEditChart.tsx`
  - Calculation logic for trends (Line 58-60) uses hardcoded `7` days window.

#### 3. Error Handling Gaps
- **Location:** `apps/foundry-dashboard/src/routes/app/analytics.tsx`
  - No error state display if all 3 top-level metrics queries fail.

## Recommended Fixes

### Critical
- [x] Move magic numbers (Min Pillars, Polling Interval) to shared constants.
...
- [x] Centralize ROI multipliers in `constants.ts`.
- [ ] Centralize `ANALYTICS_PERIOD_DAYS: 30` in `constants.ts`.
- [ ] Standardize chart color palette in `UI_CONFIG`.
- [ ] Align Drift Detector thresholds with `BRAND_DNA_CONFIG`.

### Structural
...