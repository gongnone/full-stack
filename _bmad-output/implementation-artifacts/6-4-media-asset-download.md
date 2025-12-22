# Story 6.4: Media Asset Download

**Status:** complete
**Story Points:** 3
**Sprint:** 4
**Epic:** 6 - Content Export & Publishing Prep

## Story

As a **user**,
I want **to download my generated images and thumbnails**,
So that **I have all the multimodal assets needed for a complete social media post**.

## Acceptance Criteria

### AC1: "Include Media Assets" Option
**Given** I am in the export modal
**When** I view the configuration
**Then** I see a checkbox: "Include Media Assets"
**And** this option automatically enables "Organize by Platform (ZIP)".

### AC2: Asset Fetching
**Given** "Include Media Assets" is selected
**When** I generate the export
**Then** the system identifies all `content_assets` (thumbnails, carousel slides) tied to the approved spokes
**And** it fetches the binary data from R2.

### AC3: ZIP Structure with Assets
**Given** a media-inclusive ZIP export
**When** I view the folders
**Then** each platform folder contains a `media/` subfolder
**And** individual image files are named corresponding to their spoke: `{Spoke_ID}-{Asset_Type}.png`.

### AC4: Empty Media Handling
**Given** a spoke has no generated assets
**When** I export with media
**Then** no media folder is created for that specific spoke
**And** the text content is still exported correctly.

## Tasks / Subtasks

- [ ] **Task 1: Update Export Utilities**
  - [ ] Implement `fetchAndZipMedia(data, zip)` helper.
  - [ ] Support fetching from R2 (via tRPC or direct Worker call).

- [ ] **Task 2: Update Export Modal**
  - [ ] Add "Include Media Assets" checkbox.
  - [ ] Implement logic to bundle binary images into the JSZip instance.

- [ ] **Task 3: Verification**
  - [ ] Verify image files are present and readable in the downloaded ZIP.
  - [ ] Verify correct mapping between text spokes and image files.
