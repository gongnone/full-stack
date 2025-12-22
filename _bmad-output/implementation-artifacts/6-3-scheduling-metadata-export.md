# Story 6.3: Scheduling Metadata Export

**Status:** complete
**Story Points:** 3
**Sprint:** 4
**Epic:** 6 - Content Export & Publishing Prep

## Story

As a **user**,
I want **scheduling metadata (dates, times) included in my exports**,
So that **I can directly import content into my calendar tools or auto-posters**.

## Acceptance Criteria

### AC1: Include Scheduling Option
**Given** I am in the export modal
**When** I view the configuration
**Then** I see a checkbox: "Include Scheduling Metadata"
**And** this option is available for all formats (CSV, JSON, ZIP).

### AC2: Scheduling Algorithm (Mock)
**Given** "Include Scheduling" is selected
**When** I generate the export
**Then** the system assigns a `suggested_publish_date` and `optimal_time` to each spoke
**And** it spaces them out logically (e.g., 1 post per day per platform).

### AC3: CSV Scheduling Columns
**Given** a CSV export with scheduling enabled
**When** I view the file
**Then** I see additional columns:
- `Suggested Date` (YYYY-MM-DD)
- `Optimal Time` (HH:MM)
- `Platform Queue Position` (1, 2, 3...)

### AC4: JSON Scheduling Data
**Given** a JSON export with scheduling enabled
**When** I view the file
**Then** each spoke object contains a `scheduling` block:
```json
"scheduling": {
  "publishAt": "2025-12-25T09:00:00Z",
  "recommendedTimeSlot": "morning",
  "queueIndex": 1
}
```

## Tasks / Subtasks

- [ ] **Task 1: Update Export Utilities**
  - [ ] Implement `applySchedulingMetadata(data)` helper to assign dates/times.
  - [ ] Update `convertToCSV` and `convertToJSON` to include scheduling fields.

- [ ] **Task 2: Update Export Modal**
  - [ ] Add "Include Scheduling Metadata" checkbox.
  - [ ] Update the state and handler to pass the scheduling flag.

- [ ] **Task 3: Verification**
  - [ ] Verify dates are correctly spaced in the export files.
  - [ ] Verify timezone consistency.
