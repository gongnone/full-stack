# Story 6.1: CSV & JSON Export Engine

**Status:** complete
**Story Points:** 3
**Sprint:** 4
**Epic:** 6 - Content Export & Publishing Prep

## Story

As a **user**,
I want **to export my approved content in standard formats (CSV, JSON)**,
So that **I can easily import it into my scheduling tools or internal workflows**.

## Acceptance Criteria

### AC1: Export Selection UI
**Given** I have approved spokes in my production queue
**When** I am on the dashboard or review page
**Then** I see an "Export" button
**And** clicking it opens a modal where I can select the format (CSV or JSON).

### AC2: CSV Export Generation
**Given** I select "CSV Export"
**When** I click "Generate Export"
**Then** the system generates a CSV file containing:
- Spoke ID
- Hub Title
- Pillar Title
- Platform
- Content (Text)
- Hook Score (G2)
- Prediction Score (G7)
- Approval Timestamp
**And** the file is automatically downloaded to my device.

### AC3: JSON Export Generation
**Given** I select "JSON Export"
**When** I click "Generate Export"
**Then** the system generates a structured JSON file:
- Organized hierarchically: Hubs -> Pillars -> Spokes
- Includes all metadata (G2, G4, G5, G7 scores, platform rules)
- Preserves multiline formatting in content strings
**And** the file is automatically downloaded to my device.

### AC4: Filtering before Export
**Given** I am in the export modal
**When** I configure filters
**Then** I can limit the export by:
- Date range (Approved between X and Y)
- Specific Client (Epic 7 context)
- Specific Platform (e.g., only LinkedIn)

### AC5: Empty State Handling
**Given** I have no approved spokes
**When** I click "Export"
**Then** I see a friendly message: "No approved content found to export."
**And** the generate buttons are disabled.

## Tasks / Subtasks

- [ ] **Task 1: tRPC Router Implementation**
  - [ ] Create `generations.getApprovedSpokesForExport` query
  - [ ] Implement filtering logic (date, client, platform)
  - [ ] Fetch related Hub and Pillar titles for the CSV flat structure

- [ ] **Task 2: Export Utility Functions**
  - [ ] Implement `convertToCSV(data)` helper
  - [ ] Implement `convertToJSON(data)` helper (with hierarchy building)

- [ ] **Task 3: Export Modal Component**
  - [ ] Create `ExportModal.tsx` using Radix UI Dialog
  - [ ] Add format selection (Radio Group)
  - [ ] Add date range picker and platform multi-select

- [ ] **Task 4: Frontend Integration**
  - [ ] Add "Export" button to `ReviewPage.tsx` and `SprintComplete.tsx`
  - [ ] Implement file download logic using `Blob` and `URL.createObjectURL`

- [ ] **Task 5: Verification**
  - [ ] Verify CSV structure in Excel/Google Sheets
  - [ ] Verify JSON structure integrity
