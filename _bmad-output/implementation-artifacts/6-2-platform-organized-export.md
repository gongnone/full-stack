# Story 6.2: Platform-Organized Export

**Status:** complete
**Story Points:** 3
**Sprint:** 4
**Epic:** 6 - Content Export & Publishing Prep

## Story

As a **user**,
I want **my content organized by platform in the export**,
So that **I can easily navigate and upload content to each platform's scheduler**.

## Acceptance Criteria

### AC1: "Organize by Platform" Option
**Given** I am in the export modal
**When** I view the configuration
**Then** I see a checkbox: "Organize by Platform (ZIP)"
**And** this option is available for both CSV and JSON formats.

### AC2: ZIP Export Generation
**Given** I have selected "Organize by Platform"
**When** I generate the export
**Then** the system generates a single ZIP file containing:
- Folders named after each platform (e.g., `linkedin/`, `twitter/`)
- Individual files per platform within those folders
**And** the file is automatically downloaded to my device.

### AC3: Platform-Specific Formatting
**Given** I am exporting for TikTok or Instagram
**When** the files are generated
**Then** captions and scripts are clearly labeled
**And** any visual metadata (thumbnails) is included in the same platform folder.

### AC4: Naming Convention
**Given** a platform-organized export
**When** I view the files
**Then** the naming convention is consistent: `{Hub_Title}-{Pillar_Angle}-{Platform}.csv/json`
**And** special characters in filenames are sanitized.

## Tasks / Subtasks

- [ ] **Task 1: Install JSZip**
  - [ ] Add `jszip` to `apps/user-application` dependencies.

- [ ] **Task 2: Update Export Utilities**
  - [ ] Implement `convertToPlatformZIP(data, format)` helper.
  - [ ] Sanitize filenames for OS compatibility.

- [ ] **Task 3: Update Export Modal**
  - [ ] Add the "Organize by Platform" checkbox.
  - [ ] Handle ZIP generation logic in the export handler.

- [ ] **Task 4: Verification**
  - [ ] Verify ZIP structure contains platform-named folders.
  - [ ] Verify files within ZIP match the filtered selection.
