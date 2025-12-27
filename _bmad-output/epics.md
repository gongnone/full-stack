---
stepsCompleted: [1, 2, 3, 4, 5]
status: complete
epicCount: 8
storyCount: 43
frCoverage: "60/60"
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
workflowType: 'epics-and-stories'
project_name: 'The Agentic Content Foundry'
user_name: 'Williamshaw'
date: '2025-12-21'
---

# The Agentic Content Foundry - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for The Agentic Content Foundry, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Content Ingestion & Hub Creation**
- FR1: Users can upload PDF documents as source material for Hub creation
- FR2: Users can paste raw text or transcripts as source material for Hub creation
- FR3: Users can provide a URL to scrape content as source material for Hub creation
- FR4: System can extract key themes, claims, and psychological angles from uploaded source material
- FR5: Users can create a Hub from processed source material with identified content pillars
- FR6: Users can view the processing status of source material during ingestion
- FR7: Users can edit or refine extracted themes before Hub finalization

**2. Spoke Generation & Multimodal Output**
- FR8: System can generate platform-specific text spokes from a Hub (Twitter, LinkedIn, TikTok script, etc.)
- FR9: System can generate carousel content from a Hub with slide-by-slide structure
- FR10: System can generate thread content from a Hub with sequential posts
- FR11: System can generate thumbnail/visual concepts based on Visual Archetype selection
- FR12: Users can view all spokes organized by Hub with parent-child hierarchy
- FR13: Users can filter spokes by platform type
- FR14: Users can view spoke generation progress in real-time

**3. Quality Assurance & Adversarial Gates**
- FR15: System can evaluate spoke hook strength using G2 scoring (0-100)
- FR16: System can evaluate spoke brand voice alignment using G4 gate (pass/fail)
- FR17: System can evaluate spoke platform compliance using G5 gate (pass/fail)
- FR18: System can automatically regenerate failed spokes with Critic feedback (self-healing loop)
- FR19: System can flag spokes for human review when self-healing fails after maximum attempts
- FR20: Users can view the reason for any gate failure on a spoke
- FR21: Users can override gate decisions with manual approval
- FR22: System can detect and flag AI visual clichés in generated imagery (G6)

**4. Content Review & Approval**
- FR23: Users can approve or reject individual spokes
- FR24: Users can approve or reject spokes in bulk using swipe interface
- FR25: Users can filter spokes by quality score for batch review
- FR26: Users can kill a Hub (cascading deletion of all child spokes)
- FR27: Users can kill a Pillar (deletion of spokes tied to that angle only)
- FR28: System can preserve manually-edited spokes when parent Hub is killed (Mutation Rule)
- FR29: Users can clone high-performing spokes to generate variations
- FR30: Users can view estimated review time based on pending content volume

**5. Brand Intelligence & Calibration**
- FR31: Users can upload existing content to analyze brand voice patterns
- FR32: Users can provide text input to refine brand context and preferences
- FR33: System can generate a Brand DNA Report showing detected tone, phrases, and stances
- FR34: System can extract banned words and required phrases from brand analysis
- FR35: Users can manually add or remove banned words and voice markers
- FR36: System can detect Zero-Edit Rate trend per client
- FR37: System can trigger Grounding Audit when Drift Metric exceeds threshold
- FR38: Users can view Brand DNA Strength score with breakdown

**6. Client & Team Management**
- FR39: Agency Owners can create and manage client accounts
- FR40: Agency Owners can assign Account Managers to specific clients
- FR41: Account Managers can access multiple assigned client workspaces
- FR42: Creators can generate content only for assigned clients
- FR43: Client Admins can review and approve content for their brand
- FR44: Client Reviewers can approve or reject content without edit access
- FR45: System can switch between client contexts without data leakage (isolation)
- FR46: Users can view which client context is currently active
- FR47: Users can generate shareable review links for external collaborators

**7. Analytics & Performance Tracking**
- FR48: Users can view Zero-Edit Rate per client over time
- FR49: Users can view Critic pass rate trends (G2, G4, G5)
- FR50: Users can view self-healing loop efficiency (average regeneration attempts)
- FR51: Users can view content volume metrics (Hubs created, spokes generated, approved)
- FR52: Users can view review velocity metrics (time per decision)
- FR53: Users can view Kill Chain usage patterns
- FR54: System can track Time-to-DNA metric (Hubs to reach 60% Zero-Edit)

**8. Export & Integration**
- FR55: Users can export approved content as CSV
- FR56: Users can export approved content as JSON
- FR57: Users can export content organized by platform
- FR58: Users can export content with scheduling metadata
- FR59: Users can download generated images and thumbnails
- FR60: Users can copy individual spoke content to clipboard

### Non-Functional Requirements

**Performance**
- NFR-P1: Context switch between clients < 100ms (Durable Object hydration)
- NFR-P2: Hub ingestion processing < 30 seconds
- NFR-P3: Spoke generation batch (25 spokes) < 60 seconds
- NFR-P4: Bulk review decision < 200ms UI response
- NFR-P5: Dashboard initial load < 3 seconds
- NFR-P6: Brand DNA Report generation < 2 minutes
- NFR-P7: Self-Healing Loop iteration < 10 seconds per loop
- NFR-P8: Search and filter operations < 500ms

**Security**
- NFR-S1: Multi-tenant data isolation (zero data leakage between client contexts)
- NFR-S2: Encryption at rest (AES-256 or equivalent)
- NFR-S3: Encryption in transit (TLS 1.3 minimum)
- NFR-S4: Role-based access control per RBAC matrix
- NFR-S5: Session management (24-hour max session)
- NFR-S6: Shareable link security (time-limited, email-verified)
- NFR-S7: API authentication (OAuth 2.0)
- NFR-S8: Audit logging (immutable, 90-day retention)

**Scalability**
- NFR-SC1: 100+ concurrent clients per agency
- NFR-SC2: 2,500+ Always-On Agents (12-month)
- NFR-SC3: 10,000+ Hubs processed per month
- NFR-SC4: 250,000+ Spokes generated per month
- NFR-SC5: 100,000+ embeddings per client in Vectorize
- NFR-SC6: 50GB+ media storage per client
- NFR-SC7: 50+ concurrent Hub→Spoke workflows

**Reliability**
- NFR-R1: 99.9% system uptime
- NFR-R2: No content loss on system failure (D1 replication, R2 durability)
- NFR-R3: Resume interrupted Hub→Spoke workflows
- NFR-R4: Graceful degradation if AI unavailable
- NFR-R5: Daily backups, 30-day retention
- NFR-R6: RTO < 1 hour
- NFR-R7: RPO < 1 hour

**Integration**
- NFR-I1: Accept PDF, TXT, URL, JSON for ingestion
- NFR-I2: Export formats: CSV, JSON with platform metadata
- NFR-I3: OAuth provider support (Google, Microsoft) - Post-MVP
- NFR-I4: Webhook delivery for content approval - Post-MVP
- NFR-I5: Platform API compliance (Twitter, LinkedIn, Meta) - Phase 1.1+
- NFR-I6: Rate limit handling with exponential backoff
- NFR-I7: API versioning (semantic) - Phase 2+

**Accessibility**
- NFR-A1: All review actions accessible via keyboard
- NFR-A2: Screen reader compatibility (NVDA/VoiceOver)
- NFR-A3: WCAG 2.1 AA color contrast ratios
- NFR-A4: Clear focus indicators on interactive elements
- NFR-A5: Responsive design, usable on tablet (1024px+) - Post-MVP

**Compliance (Enterprise)**
- NFR-C1: SOC 2 Type II - Phase 2
- NFR-C2: GDPR compliance - Phase 2
- NFR-C3: SSO/SAML support - Enterprise tier
- NFR-C4: Audit export (regulator-ready PDF)
- NFR-C5: Configurable data retention policies - Enterprise tier

### Additional Requirements

**From Architecture:**
- Greenfield project (no starter template specified)
- Technology stack: React 19 + TanStack Router, Tailwind CSS 4 + Radix UI, tRPC + Hono, Better Auth, Cloudflare Workers/Workflows/D1/R2/Vectorize/Workers AI
- Physical isolation via Durable Objects with per-client SQLite state
- Per-client Vectorize namespaces for Brand DNA embeddings
- Per-client R2 paths for media assets
- WebSocket real-time sync via Durable Objects
- Hub-and-Spoke production model with Kill Chain lifecycle
- Adversarial Agent Architecture (Creator vs. Critic)
- Quality Gates: G2 (Hook), G4 (Voice), G5 (Platform), G6 (Visual), G7 (Engagement), G-Compliance
- Monorepo structure: apps/dashboard, apps/content-engine, packages/foundry-core, packages/agent-system

**From UX Design:**
- "Midnight Command" dark theme (locked visual identity)
- Color system: Background #0F1419, Surface #1A1F26, Approve #00D26A, Kill #F4212E, Edit #1D9BF0
- Typography: Inter (UI), JetBrains Mono (stats)
- Motion system: 150-400ms transitions, spring easing for pulses
- 6 Interaction Pattern Locks: Signal Header, "Why" Hover, Platform Toggle, Tree Map Hierarchy, Pillar Pruning Animation, Creative Conflict Panel
- Keyboard-first interaction (< 6 sec per decision target)
- Desktop primary, Tablet secondary, Mobile tertiary (Voice Calibrate only)
- Component specifications: ScoreBadge, ActionButton, ContentCard, ActionBucket, SprintHeader, etc.
- Sprint View: Signal Header (G2+G7 48px), Context Bar, Content Preview, Gate Status, Action Bar
- Dashboard: 4 Action Buckets (High Confidence, Needs Review, Creative Conflicts, Just Generated)
- Quick Actions: ⌘+H Sprint, ⌘+A Nuclear Approve, ⌘+K Nuclear Kill
- Executive Producer Report: Time saved, decision breakdown, Zero-Edit Rate
- WCAG 2.1 AA accessibility compliance
- Responsive breakpoints: Desktop ≥1280px, Laptop 1024-1279px, Tablet 768-1023px, Mobile <768px

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 3 | PDF upload for Hub creation |
| FR2 | Epic 3 | Raw text/transcript paste |
| FR3 | Epic 3 | URL scrape for source material |
| FR4 | Epic 3 | Theme/claim extraction |
| FR5 | Epic 3 | Hub creation from source |
| FR6 | Epic 3 | Processing status display |
| FR7 | Epic 3 | Theme editing before finalization |
| FR8 | Epic 4 | Platform-specific spoke generation |
| FR9 | Epic 4 | Carousel content generation |
| FR10 | Epic 4 | Thread content generation |
| FR11 | Epic 4 | Thumbnail/visual concepts |
| FR12 | Epic 4 | Hub hierarchy view |
| FR13 | Epic 4 | Platform filter |
| FR14 | Epic 4 | Real-time generation progress |
| FR15 | Epic 4 | G2 Hook scoring |
| FR16 | Epic 4 | G4 Voice alignment |
| FR17 | Epic 4 | G5 Platform compliance |
| FR18 | Epic 4 | **Self-Healing Loop** (Primary Milestone) |
| FR19 | Epic 4 | Human review flagging |
| FR20 | Epic 4 | Gate failure reason display |
| FR21 | Epic 4 | Manual gate override |
| FR22 | Epic 4 | G6 Visual cliché detection |
| FR23 | Epic 5 | Individual spoke approval |
| FR24 | Epic 5 | Bulk swipe approval |
| FR25 | Epic 5 | Quality score filtering |
| FR26 | Epic 5 | Hub Kill (cascade) |
| FR27 | Epic 5 | Pillar Kill (prune) |
| FR28 | Epic 5 | Mutation Rule (preserve edits) |
| FR29 | Epic 5 | Clone Best variations |
| FR30 | Epic 5 | Estimated review time |
| FR31 | Epic 2 | Content upload for brand analysis |
| FR32 | Epic 2 | Text input for brand refinement |
| FR33 | Epic 2 | Brand DNA Report generation |
| FR34 | Epic 2 | Banned words/phrases extraction |
| FR35 | Epic 2 | Manual voice marker management |
| FR36 | Epic 8 | Zero-Edit Rate trend detection |
| FR37 | Epic 8 | Grounding Audit trigger |
| FR38 | Epic 2 | Brand DNA Strength score |
| FR39 | Epic 7 | Client account management |
| FR40 | Epic 7 | Account Manager assignment |
| FR41 | Epic 7 | Multi-client workspace access |
| FR42 | Epic 7 | Creator client restrictions |
| FR43 | Epic 7 | Client Admin review access |
| FR44 | Epic 7 | Client Reviewer permissions |
| FR45 | Epic 7 | Client context isolation |
| FR46 | Epic 7 | Active context indicator |
| FR47 | Epic 7 | Shareable review links |
| FR48 | Epic 8 | Zero-Edit Rate per client |
| FR49 | Epic 8 | Critic pass rate trends |
| FR50 | Epic 8 | Self-healing efficiency metrics |
| FR51 | Epic 8 | Content volume metrics |
| FR52 | Epic 8 | Review velocity metrics |
| FR53 | Epic 8 | Kill Chain usage patterns |
| FR54 | Epic 8 | Time-to-DNA tracking |
| FR55 | Epic 6 | CSV export |
| FR56 | Epic 6 | JSON export |
| FR57 | Epic 6 | Platform-organized export |
| FR58 | Epic 6 | Scheduling metadata export |
| FR59 | Epic 6 | Image/thumbnail download |
| FR60 | Epic 6 | Clipboard copy |

---

## Epic List

### Epic 1: Project Foundation & User Access
**User Outcome:** Users can sign up, log in, and access the Executive Producer Dashboard

**Architecture Pattern:** Durable Objects + D1 Partitioning (Client Isolation Foundation)

The foundational infrastructure that enables all other epics. Establishes the Cloudflare stack, authentication system, and dashboard shell with Midnight Command theme.

**Technical Scope:**
- Cloudflare Workers + D1 + R2 + Vectorize environment setup
- Better Auth integration (OAuth providers, session management)
- Dashboard shell with TanStack Router + Tailwind CSS 4 + Radix UI
- Midnight Command dark theme baseline
- Basic user profile and settings

**FRs Covered:** Infrastructure (enables all FRs)
**NFRs Addressed:** NFR-S1, NFR-S3, NFR-S4, NFR-S5, NFR-P5, NFR-A3, NFR-A4

---

### Epic 2: Brand Intelligence & Voice Capture
**User Outcome:** The system understands my brand voice and can show me proof

**Architecture Pattern:** Vectorize Namespacing (Per-Client Brand DNA)

Users can upload content, provide voice input, and see their Brand DNA Report with strength scores. This epic establishes the grounding layer that powers G4 Voice Alignment in Epic 4.

**Technical Scope:**
- Content upload and analysis pipeline
- Brand DNA extraction (tone, phrases, stances)
- Voice markers and banned words storage (SQLite in Durable Object)
- Brand DNA Report visualization
- Vectorize namespace for brand embeddings

**FRs Covered:** FR31, FR32, FR33, FR34, FR35, FR38
**NFRs Addressed:** NFR-P6, NFR-SC5

**Coupling Note:** Voice-to-Grounding pipeline from this epic feeds into Epic 5's Creative Conflict Panel for Director's Cut recalibration.

---

### Epic 3: Hub Creation & Content Ingestion
**User Outcome:** I can feed my Source of Truth to the system and see content pillars emerge

**Architecture Pattern:** Cloudflare Workflows (Long-Running Ingestion)

Users can upload PDFs, paste transcripts, or provide URLs. The system extracts themes, claims, and psychological angles to create a Hub with content pillars.

**Technical Scope:**
- Source material upload (PDF, text, URL)
- Workers AI parsing and extraction
- Theme/pillar identification
- Hub creation wizard (matching UX Source Ingestion wireframe)
- Processing status with real-time updates

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7
**NFRs Addressed:** NFR-P2, NFR-I1, NFR-R3

---

### Epic 4: Spoke Generation & Quality Assurance
**User Outcome:** The system generates quality content automatically with adversarial AI quality gates

**Architecture Pattern:** Adversarial Logic (Creator vs. Critic Agents)

The core content engine. Generates 25 platform-specific spokes from a Hub, applies quality gates (G2/G4/G5/G6), and implements the Self-Healing Loop for automatic regeneration.

**Primary Technical Milestone:** FR18 - Self-Healing Loop

**Technical Scope:**
- Creator Agent (divergent generation)
- Critic Agent (convergent evaluation)
- Quality Gates: G2 (Hook), G4 (Voice), G5 (Platform), G6 (Visual)
- Self-Healing Loop (max 3 attempts, feedback storage)
- Spoke hierarchy view with Hub/Pillar/Spoke tree
- Real-time generation progress via WebSocket

**FRs Covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
**NFRs Addressed:** NFR-P3, NFR-P7, NFR-SC4, NFR-SC7, NFR-R3

---

### Epic 5: Executive Producer Dashboard (Sprint Review)
**User Outcome:** I can review 300 pieces in 30 minutes using the Bulk Approval Engine

**Architecture Pattern:** WebSocket Real-Time Sync (High-Velocity UX)

The core UX promise. Implements the Sprint View with swipe interface, Kill Chain (Hub/Pillar/Spoke cascade), Clone Best, and the Executive Producer Report.

**Technical Scope:**
- Sprint View with Signal Header (G2+G7 48px typography)
- Keyboard-first navigation (< 6 sec/decision)
- Bulk swipe approval interface
- Kill Chain cascade with Pillar Pruning Animation
- Mutation Rule (preserve manual edits)
- Clone Best for variations
- Executive Producer Report (time saved, Zero-Edit Rate)
- Creative Conflict Panel with Director's Cut actions

**FRs Covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30
**NFRs Addressed:** NFR-P4, NFR-A1, NFR-A2, NFR-A4

**Coupling Note:** Creative Conflict Panel triggers Voice-to-Grounding from Epic 2 for real-time recalibration.

---

### Epic 6: Content Export & Publishing Prep
**User Outcome:** I can export my approved content for publishing

Users can export approved content in various formats, organized by platform, with scheduling metadata. Enables the final step of the content production workflow.

**Technical Scope:**
- CSV/JSON export with platform metadata
- Platform-organized export views
- Image/thumbnail batch download
- Clipboard copy for individual spokes
- Scheduling metadata attachment

**FRs Covered:** FR55, FR56, FR57, FR58, FR59, FR60
**NFRs Addressed:** NFR-I2

---

### Epic 7: Multi-Client Agency Operations
**User Outcome:** Agencies can manage 100+ clients with complete isolation

**Architecture Pattern:** Durable Objects + D1 Partitioning (Full Isolation)

Implements the agency model with RBAC, client isolation, context switching (< 100ms), and shareable review links for client collaboration.

**Technical Scope:**
- Client account CRUD
- RBAC matrix implementation (Agency Owner, Account Manager, Creator, Client Admin, Client Reviewer)
- Durable Object per-client isolation
- Context switching with < 100ms latency
- Active client indicator
- Shareable review links (time-limited, email-verified)

**FRs Covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR47
**NFRs Addressed:** NFR-P1, NFR-S1, NFR-S4, NFR-S6, NFR-SC1

---

### Epic 8: Performance Analytics & Learning Loop
**User Outcome:** I can see the system getting smarter and track ROI

Implements the learning loop with Zero-Edit Rate tracking, Critic pass rate trends, Drift Metric detection, and Grounding Audit triggers.

**Technical Scope:**
- Zero-Edit Rate per client over time
- Critic pass rate trends (G2, G4, G5)
- Self-healing efficiency metrics
- Content volume and review velocity metrics
- Kill Chain usage analytics
- Time-to-DNA tracking
- Drift Metric monitoring
- Grounding Audit trigger automation

**FRs Covered:** FR36, FR37, FR48, FR49, FR50, FR51, FR52, FR53, FR54
**NFRs Addressed:** NFR-S8

---

## Epic Summary

| Epic | Name | FRs | Primary Pattern |
|------|------|-----|-----------------|
| 1 | Project Foundation & User Access | 0 (infrastructure) | Durable Objects + D1 |
| 2 | Brand Intelligence & Voice Capture | 6 | Vectorize Namespacing |
| 3 | Hub Creation & Content Ingestion | 7 | Cloudflare Workflows |
| 4 | Spoke Generation & Quality Assurance | 15 | Adversarial Logic |
| 5 | Executive Producer Dashboard | 8 | WebSocket Real-Time |
| 6 | Content Export & Publishing Prep | 6 | — |
| 7 | Multi-Client Agency Operations | 9 | Durable Objects + D1 |
| 8 | Performance Analytics & Learning Loop | 9 | — |
| **Total** | | **60** | |

---

## Implementation Priority (MVP Focus)

| Priority | Epics | Rationale |
|----------|-------|-----------|
| **P0** | Epic 1, Epic 7 | Client Isolation is the technical foundation |
| **P1** | Epic 2, Epic 3 | Grounding + Ingestion enable generation |
| **P2** | Epic 4 | Quality Gates + Self-Healing Loop are core differentiators |
| **P3** | Epic 5 | Sprint Review delivers the "Executive Producer" promise |
| **P4** | Epic 6, Epic 8 | Export and Analytics complete the workflow |

---

# Epic Stories

## Epic 1: Project Foundation & User Access

**User Outcome:** Users can sign up, log in, and access the Executive Producer Dashboard

**Architecture Pattern:** Durable Objects + D1 Partitioning (Client Isolation Foundation)

---

### Story 1.1: Project Foundation for User Access

As a **user**,
I want **the application infrastructure to be properly configured**,
So that **I can reliably sign up, log in, and access the Executive Producer Dashboard**.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run `pnpm install && pnpm dev`
**Then** the dashboard app starts on localhost:5173
**And** the content-engine worker starts on localhost:8787

**Given** the Cloudflare environment is configured
**When** I run `wrangler d1 list`
**Then** I see the `foundry-global` D1 database

**Given** the Cloudflare environment is configured
**When** I run `wrangler r2 bucket list`
**Then** I see the `foundry-media` R2 bucket

**Given** the Cloudflare environment is configured
**When** I run `wrangler vectorize list`
**Then** I see the `foundry-embeddings` Vectorize index

---

### Story 1.2: Better Auth Integration with OAuth

As a **user**,
I want **to sign up and log in using Google or email/password**,
So that **I can securely access my Executive Producer Dashboard**.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I click "Continue with Google"
**Then** I am redirected to Google OAuth consent
**And** after approval, I am logged in and redirected to `/app`

**Given** I am on the registration page
**When** I enter a valid email and password
**Then** my account is created in the `users` table
**And** I receive a session cookie
**And** I am redirected to `/app`

**Given** I have an existing account
**When** I enter correct credentials
**Then** I am authenticated and redirected to `/app`
**And** my session expires after 24 hours (NFR-S5)

**Given** I enter incorrect credentials
**When** I submit the login form
**Then** I see an error message "Invalid email or password"
**And** my attempt is logged (NFR-S8)

---

### Story 1.3: Dashboard Shell with Routing

As a **user**,
I want **to navigate the Executive Producer Dashboard with a clear layout**,
So that **I can access all features from a unified interface**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to `/app`
**Then** I see the dashboard shell with sidebar navigation
**And** the page loads in < 3 seconds (NFR-P5)

**Given** I am on the dashboard
**When** I view the sidebar
**Then** I see navigation items: Dashboard, Hubs, Review, Clients, Analytics, Settings

**Given** I am not authenticated
**When** I try to access `/app/*` routes
**Then** I am redirected to `/login`

**Given** I am on any page
**When** I press `⌘+K`
**Then** the command palette opens

---

### Story 1.4: Midnight Command Theme System

As a **user**,
I want **the dashboard to use the Midnight Command dark theme**,
So that **the interface feels premium and reduces eye strain during long sessions**.

**Acceptance Criteria:**

**Given** I am on any dashboard page
**When** I view the interface
**Then** the background color is `#0F1419` (--bg-base)
**And** card surfaces are `#1A1F26` (--bg-elevated)
**And** primary text is `#E7E9EA` (--text-primary)

**Given** I hover over an approve button
**When** the hover state activates
**Then** I see a green glow effect `rgba(0,210,106,0.15)`

**Given** I am using a screen reader
**When** I navigate the interface
**Then** all contrast ratios meet WCAG 2.1 AA (NFR-A3)

**Given** I use keyboard navigation
**When** I tab through interactive elements
**Then** I see clear focus indicators (2px solid --border-focus) (NFR-A4)

---

### Story 1.5: User Profile & Settings

As a **user**,
I want **to view and edit my profile settings**,
So that **I can manage my account preferences**.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to `/app/settings`
**Then** I see my profile information (name, email, avatar)

**Given** I am on the settings page
**When** I update my display name
**Then** the change is saved to `user_profiles` table
**And** I see a success toast "Profile updated"

**Given** I am on the settings page
**When** I click "Sign out"
**Then** my session is invalidated
**And** I am redirected to `/login`

---

## Epic 2: Brand Intelligence & Voice Capture

**User Outcome:** The system understands my brand voice and can show me proof

**Architecture Pattern:** Vectorize Namespacing (Per-Client Brand DNA)

**FRs Covered:** FR31, FR32, FR33, FR34, FR35, FR38

**Success Moment:** Dr. Priya uploads content + records voice note → Brand DNA Strength Score > 80%

---

### Story 2.1: Multi-Source Content Ingestion for Brand Analysis

As a **user**,
I want **to upload existing content (PDFs, text files, articles) for brand analysis**,
So that **the system can learn my voice from my best work**.

**Acceptance Criteria:**

**Given** I am on the Brand DNA setup page
**When** I drag and drop a PDF file
**Then** the file is uploaded to R2 (`/brand-samples/{client_id}/`)
**And** I see a progress indicator during upload
**And** the file appears in my "Training Samples" list

**Given** I have uploaded a PDF
**When** the system processes it
**Then** text is extracted using Workers AI
**And** the sample is stored with metadata (source type, word count, date)

**Given** I want to add text content
**When** I paste raw text into the input field
**Then** the content is saved as a training sample
**And** it appears in my samples list with "Pasted Text" source type

**Given** I have multiple samples uploaded
**When** I view the Training Samples section
**Then** I see each sample with: source icon, title, word count, quality badge

**(FR31: Users can upload existing content to analyze brand voice patterns)**

---

### Story 2.2: Voice-to-Grounding Pipeline

As a **user**,
I want **to record a voice note describing my brand personality**,
So that **the system captures nuances I can't easily write down**.

**Acceptance Criteria:**

**Given** I am on the Brand DNA page
**When** I click the microphone icon
**Then** I see a recording interface with a timer
**And** I can record up to 60 seconds of audio

**Given** I have recorded a voice note
**When** I submit the recording
**Then** the audio is stored temporarily in R2
**And** Workers AI (Whisper) transcribes the audio
**And** I see the transcription displayed for review

**Given** the transcription is complete
**When** the system processes it
**Then** entity extraction identifies: voice markers, banned words, brand stances
**And** these are stored in the client's Durable Object SQLite (`voice_markers`, `banned_words`, `brand_stances` tables)
**And** embeddings are generated and stored in Vectorize (namespace: `client_{id}`)

**Given** I recorded "Stop using corporate jargon like synergy"
**When** the system processes this
**Then** "synergy" is added to my `banned_words` table
**And** "Anti-corporate" is detected as a brand stance

**(FR32: Users can provide text input to refine brand context and preferences)**

---

### Story 2.3: Brand DNA Analysis & Scoring

As a **user**,
I want **the system to analyze my content and generate a Brand DNA profile**,
So that **I can see proof that it understands my voice**.

**Acceptance Criteria:**

**Given** I have uploaded at least 3 training samples
**When** the analysis runs
**Then** the system detects: Primary Tone, Writing Style, Target Audience
**And** Signature Phrases are extracted (e.g., "here's the thing")
**And** a Brand DNA Strength score (0-100%) is calculated

**Given** the analysis is complete
**When** I view my Brand DNA
**Then** I see individual scores: Tone Match, Vocabulary, Structure, Topics
**And** each score has a progress bar visualization

**Given** my Brand DNA Strength is below 70%
**When** I view the report
**Then** I see recommendations: "Add more samples" or "Record a voice note"

**Given** my Brand DNA Strength reaches 80%+
**When** I view the report
**Then** I see a "Strong" status badge with green indicator

**(FR33: System can generate a Brand DNA Report showing detected tone, phrases, and stances)**
**(FR38: Users can view Brand DNA Strength score with breakdown)**

---

### Story 2.4: Brand DNA Report Dashboard

As a **user**,
I want **to view my Brand DNA Report in a clear visual dashboard**,
So that **I can understand and trust what the system learned**.

**Acceptance Criteria:**

**Given** I navigate to `/app/brand-dna`
**When** the page loads
**Then** I see the Brand DNA Report with:
- Hero metric: DNA Strength score (87% in 48px typography)
- Voice Profile card: Primary Tone, Writing Style, Target Audience
- Signature Phrases as chips
- Training Samples list with quality badges

**Given** I hover over a Signature Phrase chip
**When** the tooltip appears
**Then** I see an example from my content where this phrase was used

**Given** I view the Voice Metrics section
**When** I see the progress bars
**Then** each metric (Tone, Vocabulary, Structure, Topics) shows a percentage
**And** bars are color-coded: green (>80%), yellow (60-80%), red (<60%)

**Given** I have "Topics to Avoid" detected
**When** I view them
**Then** they appear as red pills below the Core Topics

**(FR33, FR38 visualization)**

---

### Story 2.5: Voice Marker & Banned Word Management

As a **user**,
I want **to manually add or remove voice markers and banned words**,
So that **I can fine-tune what the system learns**.

**Acceptance Criteria:**

**Given** I am on the Brand DNA page
**When** I click "Edit Voice Markers"
**Then** I see a panel with current markers as editable chips

**Given** I am editing voice markers
**When** I type a new phrase and press Enter
**Then** the phrase is added to `voice_markers` table
**And** I see it appear as a new chip

**Given** I have a banned word "synergy"
**When** I click the X on that chip
**Then** the word is removed from `banned_words` table
**And** the chip disappears with a fade animation

**Given** I add a new banned word
**When** I save my changes
**Then** the Vectorize index is updated
**And** I see a toast "Brand DNA updated"
**And** Brand DNA Strength score recalculates

**(FR34: System can extract banned words and required phrases from brand analysis)**
**(FR35: Users can manually add or remove banned words and voice markers)**

---

## Epic 2 Summary

| Story | Title | FRs | Tables/Storage |
|-------|-------|-----|----------------|
| 2.1 | Multi-Source Content Ingestion | FR31 | R2 (brand-samples), training_samples |
| 2.2 | Voice-to-Grounding Pipeline | FR32 | voice_markers, banned_words, brand_stances, Vectorize |
| 2.3 | Brand DNA Analysis & Scoring | FR33, FR38 | brand_dna_scores |
| 2.4 | Brand DNA Report Dashboard | FR33, FR38 | — (visualization) |
| 2.5 | Voice Marker & Banned Word Management | FR34, FR35 | voice_markers, banned_words |

**Total Stories:** 5
**FR Coverage:** FR31, FR32, FR33, FR34, FR35, FR38 (6/6 complete)

---

## Epic 3: Hub Creation & Content Ingestion

**User Outcome:** I can feed my Source of Truth to the system and see content pillars emerge

**Architecture Pattern:** Cloudflare Workflows (Long-Running Ingestion)

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

**Success Moment:** Marcus drops a 60-minute podcast transcript → within 30 seconds, sees 10 distinct pillars materialize

**Architecture Guardrails:**
- NFR-P2: Ingestion + extraction < 30 seconds
- NFR-S1: Documents partitioned by client_id in Durable Object SQLite
- UX Pattern 4: Tree Map Hierarchy for Source → Pillar visualization

---

### Story 3.1: Source Selection & Upload Wizard

As a **user**,
I want **to upload my Source of Truth through a guided wizard**,
So that **I can easily provide content in multiple formats**.

**Acceptance Criteria:**

**Given** I navigate to `/app/hubs/new`
**When** the page loads
**Then** I see a 4-step wizard: Select Client → Upload Source → Configure Pillars → Generate
**And** the current step is highlighted with a progress indicator

**Given** I am on Step 2 (Upload Source)
**When** I drag and drop a PDF file
**Then** the file uploads to R2 (`/sources/{client_id}/{hub_id}/`)
**And** I see a progress bar during upload
**And** the file appears with a document icon and filename

**Given** I want to paste text instead
**When** I click "Paste Text" tab
**Then** I see a textarea where I can paste raw content
**And** character count is displayed

**Given** I want to use a URL
**When** I enter a YouTube or article URL
**Then** the system validates the URL format
**And** displays "URL will be processed" confirmation

**Given** I have recent sources
**When** I view the upload area
**Then** I see up to 3 recent sources with quick-select option

**(FR1: PDF upload, FR2: Raw text paste, FR3: URL scrape)**

---

### Story 3.2: Thematic Extraction Engine

As a **user**,
I want **the system to extract themes and psychological angles from my source**,
So that **I don't have to manually identify content pillars**.

**Acceptance Criteria:**

**Given** I have uploaded a source document
**When** the extraction workflow starts
**Then** Workers AI processes the content
**And** the system identifies: key themes, core claims, psychological angles
**And** processing completes in < 30 seconds (NFR-P2)

**Given** extraction is running
**When** I view the wizard
**Then** I see a processing animation with stage indicators:
- "Parsing document..."
- "Identifying themes..."
- "Extracting claims..."
- "Generating pillars..."

**Given** extraction completes
**When** results are ready
**Then** I see 5-10 suggested Pillars with:
- Pillar title (e.g., "The Rebellious Gambler")
- Core claim summary
- Psychological angle tag
- Estimated spoke count

**Given** the source is a 60-minute podcast transcript
**When** extraction runs
**Then** at least 8 distinct pillars are identified
**And** each pillar has a unique psychological angle

**(FR4: Extract key themes, claims, and psychological angles)**

---

### Story 3.3: Interactive Pillar Configuration

As a **user**,
I want **to edit and refine the extracted pillars before finalizing**,
So that **I have control over the content direction**.

**Acceptance Criteria:**

**Given** pillars have been extracted
**When** I view Step 3 (Configure Pillars)
**Then** I see all pillars in an editable list
**And** each pillar has: title input, claim textarea, angle dropdown

**Given** I want to rename a pillar
**When** I edit the title field
**Then** the change is reflected immediately
**And** a "Modified" badge appears

**Given** I want to remove a pillar
**When** I click the delete icon
**Then** the pillar is removed with a fade animation
**And** pillar count updates

**Given** I want to add a custom pillar
**When** I click "Add Pillar"
**Then** a new empty pillar row appears
**And** I can fill in title, claim, and angle

**Given** I have configured my pillars
**When** I click "Create Hub"
**Then** the Hub is created with my configured pillars
**And** I am taken to Step 4 (Generate) or Hub detail page

**(FR7: Edit or refine extracted themes before Hub finalization)**

---

### Story 3.4: Hub Metadata & State Management

As a **user**,
I want **my Hub to be properly stored with all metadata**,
So that **I can manage and track it in my dashboard**.

**Acceptance Criteria:**

**Given** I finalize a Hub
**When** it is saved
**Then** the Hub is registered in D1 `hub_registry` table with:
- `hub_id`, `client_id`, `user_id`, `title`, `source_type`, `created_at`

**Given** a Hub is created
**When** the system initializes it
**Then** a Durable Object instance is created/accessed for the client
**And** Hub metadata is stored in SQLite `content_hierarchy` table
**And** Pillars are stored with parent-child relationship to Hub

**Given** I have multiple clients (Epic 7)
**When** I create a Hub
**Then** it is isolated to the selected client's context (NFR-S1)
**And** other clients cannot access this Hub's data

**Given** a Hub exists
**When** I view it in the dashboard
**Then** I see: title, source type icon, pillar count, spoke count, created date

**(FR5: Create Hub from processed source material)**

---

### Story 3.5: Real-Time Ingestion Progress

As a **user**,
I want **to see real-time progress during Hub creation**,
So that **I feel in control and don't experience "loading spinner anxiety"**.

**Acceptance Criteria:**

**Given** Hub creation is in progress
**When** I am on the wizard
**Then** I see a WebSocket-powered progress indicator
**And** stage updates appear in real-time without page refresh

**Given** the workflow is processing
**When** each stage completes
**Then** the UI updates with:
- Checkmark on completed stage
- Current stage highlighted
- Percentage progress bar

**Given** the extraction phase identifies pillars
**When** each pillar is found
**Then** it animates into view in the preview area
**And** the pillar count increments

**Given** an error occurs during processing
**When** the workflow fails
**Then** I see a clear error message
**And** a "Retry" button is available
**And** partial progress is preserved

**Given** Hub creation completes successfully
**When** the workflow finishes
**Then** I see a success state with confetti/celebration animation
**And** "View Hub" and "Start Generation" buttons appear

**(FR6: View processing status during ingestion)**

---

## Epic 3 Summary

| Story | Title | FRs | Tables/Storage |
|-------|-------|-----|----------------|
| 3.1 | Source Selection & Upload Wizard | FR1, FR2, FR3 | R2 (sources/{client_id}) |
| 3.2 | Thematic Extraction Engine | FR4 | — (Workers AI processing) |
| 3.3 | Interactive Pillar Configuration | FR7 | — (UI state) |
| 3.4 | Hub Metadata & State Management | FR5 | D1 hub_registry, DO content_hierarchy |
| 3.5 | Real-Time Ingestion Progress | FR6 | — (WebSocket) |

**Total Stories:** 5
**FR Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR7 (7/7 complete)

---

## Epic 4: Spoke Generation & Quality Assurance

**User Outcome:** I receive high-quality, brand-aligned content that has already survived a rigorous internal "Critic" review

**Architecture Pattern:** Adversarial Logic (Creator vs. Critic Agents)

**FRs Covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22

**Primary Milestone:** FR18 — Self-Healing Loop (system identifies failures and regenerates without human intervention)

**Architecture Guardrails:**
- NFR-P3: Batch generation of 25 spokes < 60 seconds
- NFR-P7: Single self-healing iteration < 10 seconds
- UX Pattern 2: Critic decisions stored for "Why" Hover

---

### Story 4.1: Deterministic Spoke Fracturing

As a **user**,
I want **each Pillar to automatically fracture into platform-specific spokes**,
So that **I get comprehensive content coverage from a single idea**.

**Acceptance Criteria:**

**Given** a Hub with configured Pillars exists
**When** I trigger spoke generation
**Then** the Creator Agent generates spokes for each platform:
- Twitter/X post (280 chars)
- LinkedIn post (3000 chars)
- TikTok script (60 sec)
- Instagram caption
- Newsletter snippet
- Thread (5-7 posts)
- Carousel (5-8 slides)

**Given** a Pillar with psychological angle "The Rebellious Gambler"
**When** spokes are generated
**Then** each spoke maintains the psychological angle
**And** adapts format to platform constraints

**Given** 10 Pillars in a Hub
**When** generation runs in parallel
**Then** all 25 spokes per Pillar are generated
**And** total generation completes in < 60 seconds (NFR-P3)

**Given** spokes are generated
**When** I view the Hub detail page
**Then** I see spokes organized in Tree Map hierarchy (UX Pattern 4):
- Hub → Pillars → Spokes
**And** I can expand/collapse each level

**Given** I want to filter by platform
**When** I select "LinkedIn" from the platform filter
**Then** only LinkedIn spokes are displayed
**And** the count updates to show filtered results

**(FR8-10: Platform-specific generation, FR12-13: Hierarchy view and filtering, FR14: Real-time progress)**

---

### Story 4.2: Adversarial Critic Service

As a **user**,
I want **an AI Critic to evaluate every spoke before I see it**,
So that **only quality content reaches my review queue**.

**Acceptance Criteria:**

**Given** a spoke is generated by the Creator
**When** the Critic evaluates it
**Then** the following gates are applied:
- **G2 (Hook Strength):** Score 0-100 based on Pattern Interrupt + Benefit + Curiosity Gap
- **G4 (Voice Alignment):** Pass/Fail based on `banned_words`, `voice_markers`, cosine similarity
- **G5 (Platform Compliance):** Pass/Fail based on character limits, hashtag rules, format validation

**Given** a spoke passes all gates
**When** evaluation completes
**Then** the spoke is marked `status: ready_for_review`
**And** it appears in the Review Queue

**Given** a spoke fails G2 with score 65
**When** I hover over the G2 badge (UX Pattern 2: "Why" Hover)
**Then** I see the Critic's notes:
- "Pattern Interrupt: Medium (6/10)"
- "Benefit: Low (4/10)"
- "Curiosity Gap: High (8/10)"

**Given** a spoke fails G4 (Voice)
**When** evaluation completes
**Then** the specific violation is logged:
- Banned word detected: "synergy"
- Voice similarity: 0.62 (threshold: 0.75)
**And** this is stored in `feedback_log` for Self-Healing

**Given** a spoke fails G5 (Platform)
**When** evaluation completes
**Then** the violation is logged:
- "Twitter post exceeds 280 characters (312)"
- "Missing required hashtag format"

**(FR15-17: Quality gate evaluation, FR20: View gate failure reasons)**

---

### Story 4.3: The Self-Healing Loop ⭐ (Primary Milestone)

As a **user**,
I want **the system to automatically fix failed content**,
So that **I only see quality content without manual intervention**.

**Acceptance Criteria:**

**Given** a spoke fails one or more quality gates
**When** the Self-Healing Loop activates
**Then** the failure reason is written to `feedback_log` table
**And** the Creator Agent queries this feedback
**And** a new version is generated incorporating the fix

**Given** a spoke failed G4 due to banned word "synergy"
**When** the Creator regenerates
**Then** the new version excludes "synergy"
**And** the Critic re-evaluates the new version

**Given** a spoke failed G2 with score 65
**When** the Creator regenerates
**Then** the prompt includes: "Improve Pattern Interrupt and Benefit signals"
**And** the new version targets score > 80

**Given** a self-healing iteration runs
**When** it completes
**Then** total time is < 10 seconds (NFR-P7)
**And** the loop counter increments

**Given** a spoke passes after regeneration
**When** the Critic approves
**Then** the spoke is marked `status: ready_for_review`
**And** `healing_attempts` count is recorded
**And** the successful fix is logged for learning

**Given** the average across all spokes
**When** I view metrics
**Then** self-healing efficiency is < 1.2 loops average

**Given** a spoke has failed the Self-Healing Loop twice
**When** the 3rd attempt initiates (Context Refresh)
**Then** the system queries `mutation_registry` for user edits on this client/pillar
**And** if edits exist, they are appended to the feedback as "USER EDIT PATTERNS DETECTED"
**And** the Creator incorporates these patterns in the final attempt

**(FR18: Automatic regeneration with Critic feedback — CORE DIFFERENTIATOR)**
**(REFINEMENT: Context Refresh prevents repetitive hallucinations on 3rd attempt)**

---

### Story 4.4: Creative Conflict Escalation

As a **user**,
I want **failed content escalated to me after 3 attempts**,
So that **I can make the final "Director's Cut" decision**.

**Acceptance Criteria:**

**Given** a spoke has failed 3 self-healing attempts
**When** the 3rd attempt fails
**Then** the spoke is marked `status: creative_conflict`
**And** it appears in the "Creative Conflicts" bucket on the dashboard

**Given** I open a Creative Conflict
**When** the panel loads
**Then** I see (UX Pattern 6: Creative Conflict Panel):
- **Left Panel:** Critic's final rejection reason + rubric breakdown
- **Right Panel:** All 3 generated drafts with tabs (v1/v2/v3)

**Given** I view the rubric breakdown
**When** I examine the scores
**Then** I see each gate with:
- Score value (color-coded: <6 red, 6-8 yellow, >8 green)
- Critic's specific notes
- Attempt progression (e.g., G4: 4.2 → 5.1 → 5.8)

**Given** I view a draft with a G4 Voice Alignment failure
**When** the content renders in the Right Panel
**Then** the specific violation points are highlighted inline in red
**And** hovering the highlight shows tooltip: "G4: Banned word 'synergy'"
**And** I can immediately identify WHERE to edit without reading the entire draft
**(REFINEMENT: Rubric Failure Highlighting reduces Review Tax)**

**Given** I have Director's Cut options
**When** I view the action bar
**Then** I see:
- "Force Approve" (yellow) — Override quality gates
- "Quick Edit" (blue) — Manual fix
- "Voice Calibrate" (green, primary) — Update Brand DNA
- "Kill" (red) — Abandon content

**Given** I click "Voice Calibrate"
**When** the action executes
**Then** it triggers Epic 2's Voice-to-Grounding pipeline
**And** I can record a voice note to fix the issue
**And** Brand DNA updates propagate to future generations

**Given** I click "Force Approve"
**When** I confirm the override
**Then** the spoke is marked `status: approved`
**And** `override: true` flag is set
**And** the override is logged for audit (NFR-S8)

**(FR19: Flag for human review, FR20: View failure reasons, FR21: Override gate decisions)**

---

### Story 4.5: Multimodal Visual Concept Engine

As a **user**,
I want **visual concepts and image prompts generated for my content**,
So that **I have complete assets ready for publishing**.

**Acceptance Criteria:**

**Given** a spoke is generated
**When** visual generation is triggered
**Then** the system creates:
- Thumbnail concept description
- Image prompt for AI generation
- Visual Archetype tag (e.g., "Bold Contrast", "Minimalist")

**Given** the Visual Archetype is "Bold Contrast"
**When** the image prompt is generated
**Then** it includes style guidance matching the archetype
**And** brand colors are incorporated

**Given** G6 (Visual Metaphor) gate runs
**When** evaluating the visual concept
**Then** it checks for:
- AI visual clichés (handshake, lightbulb, generic stock)
- Brand alignment with visual identity
- Score 0-100 assigned

**Given** G6 detects an AI cliché
**When** the violation is logged
**Then** the feedback includes: "Detected cliché: 'handshake partnership image'"
**And** the Self-Healing Loop regenerates with: "Avoid: handshake, lightbulb, puzzle pieces"

**Given** a visual concept is approved
**When** I view the spoke
**Then** I see the thumbnail preview
**And** I can click to view full image prompt
**And** I can trigger actual image generation (Workers AI)

**(FR11: Thumbnail/visual concepts, FR22: G6 AI cliché detection)**

---

## Epic 4 Summary

| Story | Title | FRs | Technical Pattern |
|-------|-------|-----|-------------------|
| 4.1 | Deterministic Spoke Fracturing | FR8-14 | Parallel Workers AI generation |
| 4.2 | Adversarial Critic Service | FR15-17, FR20 | G2/G4/G5 quality gates |
| 4.3 | The Self-Healing Loop ⭐ | FR18 | feedback_log + regeneration |
| 4.4 | Creative Conflict Escalation | FR19-21 | Director's Cut panel |
| 4.5 | Multimodal Visual Concept Engine | FR11, FR22 | G6 + image generation |

**Total Stories:** 5
**FR Coverage:** FR8-22 (15/15 complete)
**Primary Milestone:** Story 4.3 — Self-Healing Loop

---

## Epic 5: Executive Producer Dashboard (Sprint Review)

**User Outcome:** I can review 300 pieces in 30 minutes using the Bulk Approval Engine

**Architecture Pattern:** WebSocket Real-Time Sync (High-Velocity UX)

**FRs Covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29, FR30

**Success Moment:** Marcus completes a sprint of 142 pieces in 14 minutes → sees "13.7 hours saved" report

**UX Patterns:**
- Pattern 1: Signal Header (G2+G7 in 48px)
- Pattern 5: Pillar Pruning Animation
- Pattern 7: Keyboard-first triage (< 6 sec/decision)

---

### Story 5.1: Production Queue Dashboard

As a **user**,
I want **to see my content organized into actionable buckets**,
So that **I can quickly enter "flow state" for review**.

**Acceptance Criteria:**

**Given** I navigate to `/app/review`
**When** the page loads
**Then** I see 4 Action Buckets:
- **High Confidence** (green border): G7 > 9.0, count badge
- **Needs Review** (yellow border): G7 5.0-9.0, count badge
- **Creative Conflicts** (red border): Failed 3x healing, count badge
- **Just Generated** (blue border): Real-time WebSocket feed

**Given** I view the High Confidence bucket
**When** I click "Start Sprint"
**Then** I enter Sprint Mode with only G7 > 9.0 content

**Given** I want quick actions
**When** I press `⌘+H`
**Then** I enter High Confidence Sprint directly

**Given** I want nuclear operations
**When** I press `⌘+A` (Nuclear Approve)
**Then** all G7 > 9.5 content is batch approved
**And** I see confirmation: "47 spokes approved"

**Given** I want to clear low quality
**When** I press `⌘+Shift+K` (Nuclear Kill)
**Then** all G7 < 5.0 content is batch killed
**And** I see confirmation with undo option

**(FR25: Filter by quality score)**

---

### Story 5.2: Sprint View with Signal Header

As a **user**,
I want **to review content at high velocity with clear quality signals**,
So that **I can make confident decisions in < 6 seconds**.

**Acceptance Criteria:**

**Given** I enter Sprint Mode
**When** a content card loads
**Then** I see the Signal Header (UX Pattern 1):
- G2 (Hook) score in 48px bold typography
- G7 (Engagement Prediction) score in 48px bold typography
- Scores color-coded: green (>8), yellow (5-8), red (<5)

**Given** I view the content card
**When** I examine the layout
**Then** I see:
- Context Bar: Client › Platform › Hub › Pillar breadcrumb
- Content Preview: Full text with platform formatting
- Gate Status: G4 ✓, G5 ✓ badges
- Action Bar: Kill (←) | Edit (E) | Approve (→)

**Given** I hover over the G2 score
**When** the tooltip appears (UX Pattern 2: "Why" Hover)
**Then** I see Critic's rubric notes within 300ms

**Given** I am reviewing
**When** I check the footer
**Then** I see:
- Progress bar: 76% complete (approve-colored)
- Counter: 142/187
- Keyboard hints: ← Kill | → Approve | E Edit | H Hub Kill

**(FR23: Approve/reject individual spokes)**

---

### Story 5.3: Keyboard-First Approval Flow

As a **user**,
I want **to approve and reject content using only my keyboard**,
So that **I never break flow to reach for my mouse**.

**Acceptance Criteria:**

**Given** I am in Sprint Mode
**When** I press `→` (Right Arrow)
**Then** the current card is approved
**And** green flash animation plays (100ms)
**And** card slides right with opacity fade (200ms)
**And** next card slides in from right (150ms)
**And** counter pulses with increment
**And** toast shows "✓ Scheduled" (auto-dismiss 2s)

**Given** I am in Sprint Mode
**When** I press `←` (Left Arrow)
**Then** the current card is killed
**And** red flash animation plays
**And** card slides left with scale(0.95)
**And** kill counter increments

**Given** I want to skip a card
**When** I press `Space`
**Then** yellow flash plays
**And** card moves to end of queue

**Given** I press `?`
**When** the Critic panel toggles
**Then** I see expanded rubric notes without leaving Sprint

**Given** UI response time
**When** I make any decision
**Then** visual feedback appears in < 200ms (NFR-P4)

**(FR24: Bulk swipe approval interface)**

---

### Story 5.4: Kill Chain Cascade

As a **user**,
I want **to kill an entire Hub and cascade to all children**,
So that **I can clear bad content in 60 seconds instead of hours**.

**Acceptance Criteria:**

**Given** I am reviewing a spoke
**When** I hold `H` for 500ms
**Then** a confirmation modal appears with:
- Red header with warning icon
- Hub title and spoke count: "Kill 'Podcast Ep. 12' (25 spokes)?"
- "Can be undone within 30 seconds" notice
- Cancel | Confirm Kill buttons

**Given** I confirm Hub Kill
**When** the cascade executes
**Then** (UX Pattern 5: Pillar Pruning Animation):
- Modal closes
- Hub card pulses red (200ms)
- Pillars fade to 40% opacity (staggered 50ms each)
- Spokes cascade fade (25ms each)
- Progress bar jumps to reflect killed items
- Toast: "Hub killed (25 items) — Undo" with 30s timer

**Given** I want to kill only a Pillar
**When** I click "Kill Pillar" on a specific pillar
**Then** only that pillar's spokes are deleted
**And** other pillars remain intact

**Given** a spoke has been manually edited
**When** its parent Hub is killed
**Then** the edited spoke survives (Mutation Rule)
**And** it is moved to "Manual Assets" category

**(FR26: Hub Kill, FR27: Pillar Kill, FR28: Mutation Rule)**

---

### Story 5.5: Clone Best & Variations

As a **user**,
I want **to clone high-performing spokes and generate variations**,
So that **I can multiply my best content**.

**Acceptance Criteria:**

**Given** I am viewing a spoke with G7 > 9.0
**When** I click "Clone Best" action
**Then** a modal opens with options:
- Number of variations (1-5)
- Target platforms
- Angle variations checkbox

**Given** I request 3 variations
**When** the generation runs
**Then** the Creator generates 3 new spokes
**And** each maintains the core message
**And** each has slight angle/hook variation
**And** all go through Critic evaluation

**Given** variations are generated
**When** I view them
**Then** they appear as children of the original spoke
**And** I can approve/kill each independently

**(FR29: Clone high-performing spokes)**

---

### Story 5.6: Executive Producer Report

As a **user**,
I want **to see a celebration report after completing a sprint**,
So that **I feel accomplished and can quantify my productivity**.

**Acceptance Criteria:**

**Given** I complete all items in a sprint
**When** the Batch Complete state loads
**Then** I see (matching UX wireframe):
- Large checkmark with green celebration glow (72px)
- "Sprint Complete!" title (32px)
- Hero stat: "13.7 hours saved" in 64px typography
- Dollar value: "($2,740 at $200/hr)"

**Given** I view the stats breakdown
**When** I examine the metrics
**Then** I see:
- Reviewed: 142
- Approved: 118 (83%)
- Killed: 19 (13%)
- Edited: 5 (4%)
- Avg Decision: 5.8 seconds

**Given** I view the Zero-Edit Rate
**When** I check the progress bar
**Then** I see: 87% with target marker at 60%
**And** green fill indicates exceeding target

**Given** I have multiple clients
**When** I view per-client breakdown
**Then** I see each client's contribution to the sprint

**Given** I want to continue
**When** I view action buttons
**Then** I see: Export Calendar | Share Links | Review Conflicts | Dashboard

**(FR30: Estimated review time / time saved)**

---

## Epic 5 Summary

| Story | Title | FRs | UX Pattern |
|-------|-------|-----|------------|
| 5.1 | Production Queue Dashboard | FR25 | Action Buckets |
| 5.2 | Sprint View with Signal Header | FR23 | Pattern 1: Signal Header |
| 5.3 | Keyboard-First Approval Flow | FR24 | Pattern 7: Keyboard triage |
| 5.4 | Kill Chain Cascade | FR26-28 | Pattern 5: Pillar Pruning |
| 5.5 | Clone Best & Variations | FR29 | — |
| 5.6 | Executive Producer Report | FR30 | Celebration state |

**Total Stories:** 6
**FR Coverage:** FR23-30 (8/8 complete)

---

## Epic 6: Content Export & Publishing Prep

**User Outcome:** I can export my approved content for publishing across all platforms

**FRs Covered:** FR55, FR56, FR57, FR58, FR59, FR60

---

### Story 6.1: CSV & JSON Export Engine

As a **user**,
I want **to export my approved content in standard formats**,
So that **I can import it into scheduling tools or my own systems**.

**Acceptance Criteria:**

**Given** I have approved spokes
**When** I click "Export" from the dashboard
**Then** I see format options: CSV, JSON

**Given** I select CSV export
**When** the export runs
**Then** I receive a CSV file with columns:
- spoke_id, hub_title, pillar_title, platform, content, g2_score, g7_score, status, approved_at

**Given** I select JSON export
**When** the export runs
**Then** I receive a JSON file with:
- Nested structure: hubs → pillars → spokes
- All metadata fields included
- Platform-specific formatting preserved

**Given** I want to filter my export
**When** I configure options
**Then** I can filter by: date range, platform, client, status

**(FR55: CSV export, FR56: JSON export)**

---

### Story 6.2: Platform-Organized Export

As a **user**,
I want **my content organized by platform in the export**,
So that **I can easily copy content to each platform's scheduler**.

**Acceptance Criteria:**

**Given** I select "Organize by Platform" option
**When** the export generates
**Then** I receive content grouped:
- `/twitter/` — All Twitter posts
- `/linkedin/` — All LinkedIn posts
- `/instagram/` — All Instagram captions
- `/tiktok/` — All TikTok scripts

**Given** I export LinkedIn content
**When** I view the output
**Then** each post includes:
- Full formatted text
- Hashtag suggestions
- Optimal posting time recommendation (if available)

**Given** I have carousel content
**When** I export it
**Then** slide content is exported in sequence:
- slide_1, slide_2, slide_3... with individual text

**(FR57: Platform-organized export)**

---

### Story 6.3: Scheduling Metadata Export

As a **user**,
I want **scheduling metadata included in my exports**,
So that **I can directly import into calendar tools**.

**Acceptance Criteria:**

**Given** I enable "Include Scheduling" option
**When** the export runs
**Then** each item includes:
- suggested_date
- suggested_time
- optimal_day_of_week
- content_pillar (for content calendar grouping)

**Given** I export with scheduling
**When** I view the calendar format
**Then** I can import directly into:
- Google Calendar (ICS format)
- Notion (CSV compatible)
- Airtable (JSON compatible)

**(FR58: Scheduling metadata export)**

---

### Story 6.4: Media Asset Download

As a **user**,
I want **to download all generated images and thumbnails**,
So that **I have complete assets ready for publishing**.

**Acceptance Criteria:**

**Given** I have spokes with visual concepts
**When** I click "Download Assets"
**Then** I can select:
- Individual image download
- Batch download as ZIP

**Given** I batch download
**When** the ZIP generates
**Then** files are organized:
- `/hub-name/pillar-name/spoke-platform-thumbnail.png`
- Naming convention is consistent and sortable

**Given** images haven't been generated yet
**When** I view a spoke with concept only
**Then** I see "Generate Image" button
**And** Workers AI creates the image from the prompt

**(FR59: Download generated images and thumbnails)**

---

### Story 6.5: Clipboard Copy & Quick Actions

As a **user**,
I want **to quickly copy individual spoke content**,
So that **I can paste directly into platforms for immediate posting**.

**Acceptance Criteria:**

**Given** I am viewing a spoke
**When** I click the copy icon (or press `C`)
**Then** the spoke content is copied to clipboard
**And** I see toast: "Copied to clipboard"

**Given** I copy LinkedIn content
**When** I paste it
**Then** formatting is preserved:
- Line breaks intact
- Hashtags included
- Emojis rendered correctly

**Given** I am in Sprint Mode
**When** I approve a spoke
**Then** I see quick action: "Copy & Schedule"
**And** clicking it copies content + opens scheduling modal

**(FR60: Copy individual spoke to clipboard)**

---

## Epic 6 Summary

| Story | Title | FRs |
|-------|-------|-----|
| 6.1 | CSV & JSON Export Engine | FR55, FR56 |
| 6.2 | Platform-Organized Export | FR57 |
| 6.3 | Scheduling Metadata Export | FR58 |
| 6.4 | Media Asset Download | FR59 |
| 6.5 | Clipboard Copy & Quick Actions | FR60 |

**Total Stories:** 5
**FR Coverage:** FR55-60 (6/6 complete)

---

## Epic 7: Multi-Client Agency Operations

**User Outcome:** Agencies can manage 100+ clients with complete isolation

**Architecture Pattern:** Durable Objects + D1 Partitioning (Full Isolation)

**FRs Covered:** FR39, FR40, FR41, FR42, FR43, FR44, FR45, FR46, FR47

**Key NFR:** NFR-P1 (< 100ms context switch between clients)

---

### Story 7.1: Client Account Management

As an **Agency Owner**,
I want **to create and manage client accounts**,
So that **I can onboard new clients and organize my agency**.

**Acceptance Criteria:**

**Given** I am an Agency Owner
**When** I navigate to `/app/clients`
**Then** I see a list of all client accounts with:
- Client name, logo, status (active/paused)
- Spoke count, Zero-Edit Rate
- Last activity date

**Given** I click "Add Client"
**When** I fill out the form
**Then** I can enter: name, logo, industry, contact email
**And** the client is created in D1 `clients` table
**And** a Durable Object instance is initialized for isolation

**Given** I want to archive a client
**When** I click "Archive"
**Then** the client is marked inactive
**And** their content is preserved but hidden from active views
**And** Durable Object remains for data access

**(FR39: Create and manage client accounts)**

---

### Story 7.2: RBAC & Team Assignment

As an **Agency Owner**,
I want **to assign team members to specific clients with appropriate roles**,
So that **I can control access and responsibilities**.

**Acceptance Criteria:**

**Given** I am on a client's settings page
**When** I click "Team Members"
**Then** I see current assignments with roles:
- Account Manager (full access)
- Creator (generate only)
- Reviewer (approve/reject only)

**Given** I want to add a team member
**When** I select a user and assign a role
**Then** they receive access to that client's context
**And** RBAC permissions are enforced on all API calls

**Given** a Creator tries to access client settings
**When** they navigate to `/app/clients/{id}/settings`
**Then** they see "Access Denied" message
**And** they are redirected to their permitted views

**Given** the RBAC matrix
**When** permissions are checked
**Then** the system enforces:
| Role | Generate | Review | Settings | Billing |
|------|----------|--------|----------|---------|
| Agency Owner | ✓ | ✓ | ✓ | ✓ |
| Account Manager | ✓ | ✓ | ✓ | ✗ |
| Creator | ✓ | ✗ | ✗ | ✗ |
| Client Admin | ✗ | ✓ | View | ✗ |
| Client Reviewer | ✗ | ✓ | ✗ | ✗ |

**(FR40: Assign Account Managers, FR42: Creator restrictions, FR43-44: Client roles)**

---

### Story 7.3: Multi-Client Workspace Access

As an **Account Manager**,
I want **to access multiple client workspaces**,
So that **I can efficiently manage my assigned clients**.

**Acceptance Criteria:**

**Given** I am assigned to 12 clients
**When** I log in
**Then** I see a client selector in the header
**And** my "My Clients" dashboard shows all 12

**Given** I am working on Client A's content
**When** I switch to Client B via selector
**Then** context switch completes in < 100ms (NFR-P1)
**And** all UI updates to show Client B's data
**And** no Client A data remains visible

**Given** I have clients across industries
**When** I view my dashboard
**Then** I can filter clients by: industry, activity, Zero-Edit Rate

**Given** I am an Agency Account Manager with 47 clients
**When** I start my session
**Then** the system pre-warms my 5 most recently accessed client Durable Objects
**And** switching between these warm clients achieves < 100ms latency
**And** the warm cache uses LRU eviction when I access a 6th client

**(FR41: Access multiple assigned client workspaces)**
**(REFINEMENT: Warm-up Routine ensures NFR-P1 compliance for cold-start DOs)**

---

### Story 7.4: Context Isolation & Data Security

As a **user**,
I want **complete isolation between client contexts**,
So that **no data leaks between clients**.

**Acceptance Criteria:**

**Given** I am in Client A's context
**When** I make any API request
**Then** the request is routed to Client A's Durable Object
**And** only Client A's SQLite data is accessible

**Given** two clients share similar content
**When** I search for content
**Then** results only include current client's data
**And** Vectorize queries use client-specific namespace

**Given** I try to access Client B's data via URL manipulation
**When** the request is processed
**Then** RBAC check fails
**And** request is denied with 403
**And** attempt is logged for audit (NFR-S8)

**Given** R2 asset storage
**When** media is uploaded
**Then** it's stored in `/assets/{client_id}/` path
**And** other clients cannot access the path

**(FR45: Switch between contexts without data leakage)**

---

### Story 7.5: Active Context Indicator

As a **user**,
I want **to always see which client context I'm in**,
So that **I never accidentally work on the wrong client**.

**Acceptance Criteria:**

**Given** I am in any view
**When** I look at the header
**Then** I see:
- Client name prominently displayed
- Client logo/avatar
- Colored border matching client's brand color (if set)

**Given** I am about to perform a destructive action
**When** the confirmation modal appears
**Then** it shows: "This will affect [Client Name]"
**And** client logo is visible in the modal

**Given** I switch clients
**When** the context changes
**Then** a brief "Client Switched" indicator appears
**And** the header updates immediately

**(FR46: View active client context)**

---

### Story 7.6: Shareable Review Links

As an **Account Manager**,
I want **to generate secure links for client review**,
So that **clients can approve content without full system access**.

**Acceptance Criteria:**

**Given** I have content ready for client review
**When** I click "Share for Review"
**Then** I can configure:
- Expiration (24h, 7d, 30d)
- Email restriction (optional)
- Permissions (view-only, can approve, can comment)

**Given** a link is generated
**When** the client clicks it
**Then** they see a simplified review interface:
- Content cards with G2/G7 scores (no technical jargon)
- Approve/Request Changes buttons
- Comment field per spoke

**Given** a link has email restriction
**When** a non-whitelisted email tries to access
**Then** they see "Access Denied"
**And** they can request access via form

**Given** a link expires
**When** someone tries to access it
**Then** they see "Link Expired" message
**And** are prompted to request a new link

**(FR47: Generate shareable review links)**

---

## Epic 7 Summary

| Story | Title | FRs | Architecture |
|-------|-------|-----|--------------|
| 7.1 | Client Account Management | FR39 | D1 + DO init |
| 7.2 | RBAC & Team Assignment | FR40, FR42-44 | RBAC matrix |
| 7.3 | Multi-Client Workspace Access | FR41 | Context switching |
| 7.4 | Context Isolation & Data Security | FR45 | DO isolation |
| 7.5 | Active Context Indicator | FR46 | UI/UX |
| 7.6 | Shareable Review Links | FR47 | Time-limited tokens |

**Total Stories:** 6
**FR Coverage:** FR39-47 (9/9 complete)

---

## Epic 8: Performance Analytics & Learning Loop

**User Outcome:** I can see the system getting smarter and track ROI

**FRs Covered:** FR36, FR37, FR48, FR49, FR50, FR51, FR52, FR53, FR54

**Key Milestone:** Time-to-DNA tracking to prove system ROI

---

### Story 8.1: Zero-Edit Rate Dashboard

As a **user**,
I want **to track Zero-Edit Rate over time**,
So that **I can see the system learning my voice**.

**Acceptance Criteria:**

**Given** I navigate to `/app/analytics`
**When** the page loads
**Then** I see Zero-Edit Rate as the hero metric:
- Current rate (e.g., 78%)
- Trend arrow (↑12% from last month)
- Line chart showing rate over time

**Given** I view the chart
**When** I hover over data points
**Then** I see: date, rate, spoke count for that period

**Given** I have multiple clients
**When** I view Zero-Edit Rate
**Then** I can filter by client
**And** see per-client breakdown table

**Given** rate drops below threshold
**When** the system detects drift
**Then** I see alert: "Voice drift detected for [Client]"
**And** recommendation to recalibrate

**(FR48: Zero-Edit Rate per client over time)**

---

### Story 8.2: Critic Pass Rate Trends

As a **user**,
I want **to see quality gate performance over time**,
So that **I understand where content is failing**.

**Acceptance Criteria:**

**Given** I view Critic Analytics
**When** the data loads
**Then** I see pass rates for each gate:
- G2 (Hook): 87% first-pass
- G4 (Voice): 92% first-pass
- G5 (Platform): 98% first-pass

**Given** I want to drill down
**When** I click on a gate
**Then** I see:
- Trend chart for that gate
- Top failure reasons
- Self-healing success rate for that gate

**Given** G4 (Voice) has low pass rate
**When** I view details
**Then** I see: "Top violation: 'synergy' used 23 times"
**And** quick action: "Add to banned words"

**(FR49: Critic pass rate trends)**

---

### Story 8.3: Self-Healing Efficiency Metrics

As a **user**,
I want **to see how efficiently the Self-Healing Loop operates**,
So that **I can trust the automated quality improvement**.

**Acceptance Criteria:**

**Given** I view Self-Healing metrics
**When** data loads
**Then** I see:
- Average loops per spoke: 1.18
- First-pass success rate: 72%
- Creative Conflict rate: 3.2%

**Given** I want to understand healing patterns
**When** I view the breakdown
**Then** I see:
- Healed after 1 loop: 68%
- Healed after 2 loops: 24%
- Healed after 3 loops: 5%
- Escalated to human: 3%

**Given** healing efficiency is trending up
**When** I view the chart
**Then** I see improvement over time
**And** correlation with Brand DNA additions

**(FR50: Self-healing loop efficiency)**

---

### Story 8.4: Content Volume & Review Velocity

As a **user**,
I want **to track production and review metrics**,
So that **I can optimize my workflow**.

**Acceptance Criteria:**

**Given** I view Production Metrics
**When** data loads
**Then** I see:
- Hubs created this month: 47
- Spokes generated: 1,175
- Spokes approved: 892 (76%)
- Spokes killed: 283 (24%)

**Given** I view Review Velocity
**When** data loads
**Then** I see:
- Average decision time: 5.2 seconds
- Sprint completion rate: 89%
- Nuclear actions used: 12%

**Given** I want to see trends
**When** I select date range
**Then** charts update to show:
- Volume over time
- Velocity improvements

**(FR51: Content volume metrics, FR52: Review velocity metrics)**

---

### Story 8.5: Kill Chain Analytics

As a **user**,
I want **to understand how I use the Kill Chain**,
So that **I can identify content quality patterns**.

**Acceptance Criteria:**

**Given** I view Kill Chain metrics
**When** data loads
**Then** I see:
- Hub-level kills: 67%
- Pillar-level kills: 23%
- Spoke-level kills: 10%

**Given** I want to understand patterns
**When** I view breakdown
**Then** I see:
- Top reasons for Hub kills
- Pillars most often killed
- Spokes surviving via Mutation Rule

**Given** I see high Hub-kill rate
**When** I investigate
**Then** I get insights: "Consider refining source material quality"

**(FR53: Kill Chain usage patterns)**

---

### Story 8.6: Time-to-DNA & Drift Detection

As a **user**,
I want **to track how quickly the system learns my voice**,
So that **I can prove ROI and catch quality drift**.

**Acceptance Criteria:**

**Given** I onboard a new client
**When** I track Time-to-DNA
**Then** I see: "Hubs to reach 60% Zero-Edit Rate"
**And** current count with progress bar

**Given** a client has established Brand DNA
**When** the system detects drift
**Then** Drift Metric is calculated:
- Current voice similarity vs. baseline
- Alert if drops below threshold (FR37)

**Given** Drift Metric triggers alert
**When** I view the notification
**Then** I see:
- "Voice drift detected: 15% below baseline"
- "Last calibration: 23 days ago"
- Action: "Start Grounding Audit"

**Given** I start Grounding Audit
**When** the workflow runs
**Then** system re-analyzes recent content
**And** suggests Brand DNA updates
**And** presents before/after comparison

**(FR36: Zero-Edit Rate trend detection, FR37: Grounding Audit trigger, FR54: Time-to-DNA tracking)**

---

## Epic 8 Summary

| Story | Title | FRs |
|-------|-------|-----|
| 8.1 | Zero-Edit Rate Dashboard | FR48 |
| 8.2 | Critic Pass Rate Trends | FR49 |
| 8.3 | Self-Healing Efficiency Metrics | FR50 |
| 8.4 | Content Volume & Review Velocity | FR51, FR52 |
| 8.5 | Kill Chain Analytics | FR53 |
| 8.6 | Time-to-DNA & Drift Detection | FR36, FR37, FR54 |

**Total Stories:** 6
**FR Coverage:** FR36-37, FR48-54 (9/9 complete)

---

# Document Summary

## Complete Epic & Story Inventory

| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Project Foundation & User Access | 5 | Infrastructure |
| 2 | Brand Intelligence & Voice Capture | 5 | FR31-35, FR38 |
| 3 | Hub Creation & Content Ingestion | 5 | FR1-7 |
| 4 | Spoke Generation & Quality Assurance | 5 | FR8-22 |
| 5 | Executive Producer Dashboard | 6 | FR23-30 |
| 6 | Content Export & Publishing Prep | 5 | FR55-60 |
| 7 | Multi-Client Agency Operations | 6 | FR39-47 |
| 8 | Performance Analytics & Learning Loop | 6 | FR36-37, FR48-54 |
| **Total** | | **43 Stories** | **60/60 FRs** |

## FR Coverage Verification

- **FR1-7** (Content Ingestion): Epic 3 ✅
- **FR8-22** (Spoke Generation & Quality): Epic 4 ✅
- **FR23-30** (Review & Approval): Epic 5 ✅
- **FR31-38** (Brand Intelligence): Epic 2 + Epic 8 ✅
- **FR39-47** (Client & Team): Epic 7 ✅
- **FR48-54** (Analytics): Epic 8 ✅
- **FR55-60** (Export): Epic 6 ✅

## Key Milestones

| Milestone | Epic | Story | Description |
|-----------|------|-------|-------------|
| **Self-Healing Loop** | 4 | 4.3 | Core differentiator — automatic quality improvement |
| **< 100ms Context Switch** | 7 | 7.3-7.4 | Agency scalability requirement |
| **< 6 sec/decision** | 5 | 5.2-5.3 | Sprint experience promise |
| **Time-to-DNA** | 8 | 8.6 | ROI tracking |

## Implementation Ready

This document contains **43 implementation-ready stories** with:
- ✅ User story format (As a/I want/So that)
- ✅ Given/When/Then acceptance criteria
- ✅ NFR references where applicable
- ✅ UX Pattern references
- ✅ Architecture pattern alignment
- ✅ Database/storage notes per story

---

**Document Status:** Complete
**Last Updated:** 2025-12-21
**Author:** Williamshaw + Claude (PM Agent)
