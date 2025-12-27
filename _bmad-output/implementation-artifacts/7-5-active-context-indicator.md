# Story 7.5: Active Context Indicator

**Status:** done
**Story Points:** 3
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As a **user**,
I want **to always see which client context I'm in**,
So that **I never accidentally work on the wrong client**.

## Acceptance Criteria

### AC1: Header Identity
**Given** I have an active client selected
**When** I view the dashboard
**Then** the `ClientSelector` in the header shows the client's name and icon
**And** the icon background matches the client's brand color

### AC2: Visual Feedback (Brand Border)
**Given** a client is selected
**When** I navigate any page in the dashboard
**Then** the header shows a subtle bottom border (2px) in the client's brand color
**And** the border fades in/out during context switches

### AC3: Database Support for Branding
**Given** a client record exists
**When** I view or update the client
**Then** I can see and set a `brand_color` (hex) for that client

## Tasks / Subtasks

- [x] **Task 1: Database Schema**
  - [x] Create migration `0015_brand_color.sql` to add `brand_color` to `clients` table

- [x] **Task 2: tRPC Router Implementation**
  - [x] Update `clients.create` to support initial `brandColor`
  - [x] Update `clients.list` to return `brandColor` for all clients

- [x] **Task 3: Frontend UI**
  - [x] Update `ClientSelector.tsx` to use dynamic brand colors for icons
  - [x] Update `AppLayout` (`app.tsx`) to apply a dynamic border color to the header based on the active client

## Implementation Notes

- **UX Design:** The brand border is applied with `40%` opacity (e.g., `#hex40`) to maintain the "Midnight Command" aesthetic without being overwhelming.
- **Drizzle Schema Update:** Added `brandColor` with a default of `#1D9BF0` (Foundry Blue).
