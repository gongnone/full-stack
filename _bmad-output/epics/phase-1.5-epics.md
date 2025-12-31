---
stepsCompleted: [1, 2, 3]
status: complete
epicCount: 10
storyCount: 75
frCoverage: "78/78 + 24 Elicitation additions"
elicitationMethods:
  - Cross-Functional War Room (6 findings)
  - User Persona Focus Group (6 stories)
  - Reverse Engineering (6 stories)
  - Architecture Decision Records (2 updates)
  - Stakeholder Round Table (4 findings)
  - Pre-mortem Analysis (3 findings)
  - Security Audit Personas (6 findings)
  - Red Team vs Blue Team (3 findings)
  - Failure Mode Analysis (4 findings)
  - SCAMPER Method (3 stories + 2 updates)
  - First Principles Analysis (1 story)
  - Comparative Analysis Matrix (1 story)
  - Lessons Learned Extraction (1 update)
  - Occam's Razor Application (1 story + 2 updates + 1 consolidation)
inputDocuments:
  - prd-phase-1.5-mvf.md
  - architecture.md
  - ux-design-specification.md
workflowType: 'epics-and-stories'
project_name: 'Phase 1.5 - Minimum Viable Foundry'
user_name: 'Williamshaw'
date: '2025-12-30'
---

# Phase 1.5: Minimum Viable Foundry - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Phase 1.5 (MVF), decomposing the BrandDNA Agent and strategic layer requirements into implementable stories. This addendum extends the original 43 stories from Phase 1.

## Requirements Inventory

### Functional Requirements

**Sprint 1 & 2: BrandDNA Agent + Content Strategy Engine**

**1. Voice Capture & Analysis**
- FR-1.5.1a: Users can record a 2-minute voice note describing their brand on mobile (P0)
- FR-1.5.1b: System transcribes voice note using Workers AI Whisper integration (P0)
- FR-1.5.1c: System extracts tone, vocabulary, and personality markers from transcription (P0)
- FR-1.5.1d: Users can re-record if not satisfied with initial capture (P0)
- FR-1.5.1e: Users can optionally upload existing content (blogs, videos, social posts) for analysis (P1)
- FR-1.5.1f: System analyzes uploaded content to enhance voice profile (P1)

**2. Audience Deep Dive**
- FR-1.5.2a: Agent asks structured questions about target audience demographics (P0)
- FR-1.5.2b: Agent asks about audience pain points and aspirations (psychographics) (P0)
- FR-1.5.2c: Agent asks about audience content consumption habits (P0)
- FR-1.5.2d: System generates audience persona(s) from user input (P0)
- FR-1.5.2e: Users can review and approve/edit generated personas (P0)

**3. Competitor Analysis Input**
- FR-1.5.3a: Users can list 2-3 competitors they admire or want to differentiate from (P1)
- FR-1.5.3b: Agent explains how competitor analysis will inform gap identification (P1)
- FR-1.5.3c: System uses RAG to pull market research insights on listed competitors (P2)
- FR-1.5.3d: System identifies "gaps" - what's missing that the user can own (P2)

**4. Platform Prioritization**
- FR-1.5.4a: Agent recommends 2-3 primary platforms based on audience analysis (P0)
- FR-1.5.4b: Agent recommends 2-3 secondary platforms with rationale (P0)
- FR-1.5.4c: Users can adjust platform priorities before confirmation (P0)
- FR-1.5.4d: Users can specify preferred content mediums (video, written, audio, visual) (P0)
- FR-1.5.4e: Agent proposes realistic posting cadence per platform (P1)

**5. Topic Pillar Proposal**
- FR-1.5.5a: Agent proposes 3-5 content topic pillars aligned with Brand Story Framework (P0)
- FR-1.5.5b: Each pillar includes rationale based on voice analysis and competitive gaps (P0)
- FR-1.5.5c: Users can approve, edit, or regenerate individual pillars (P0)
- FR-1.5.5d: System stores approved pillars as foundation for Hub generation (P0)

**6. Brand DNA Report**
- FR-1.5.6a: System generates comprehensive Brand DNA Report upon session completion (P0)
- FR-1.5.6b: Report includes: detected tone, vocabulary, banned words, required phrases, stances (P0)
- FR-1.5.6c: Report displays "Brand DNA Strength" score (0-100%) (P0)
- FR-1.5.6d: Users can export Brand DNA Report as PDF (P1)

**Sprint 3 & 4: Hub-and-Spoke Content Generation**

**7. Source of Truth Upload**
- FR-1.5.7a: Users can upload long-form content (video transcript, article, outline) (P0)
- FR-1.5.7b: Users can paste raw text as Source of Truth (P0)
- FR-1.5.7c: System processes upload and displays key themes extracted (P0)
- FR-1.5.7d: Users can highlight "golden nugget" sections for emphasis (P1)

**8. Spoke Generation**
- FR-1.5.8a: System generates 20+ platform-specific content pieces from one Hub (P0)
- FR-1.5.8b: Generation respects user's platform priorities and content medium preferences (P0)
- FR-1.5.8c: Each spoke is adapted to platform-specific formatting and tone (P0)
- FR-1.5.8d: Progress tracker shows real-time generation status (P0)
- FR-1.5.8e: Generation informed by approved content pillars from BrandDNA session (P0)

**9. Platform-Native Formatting**
- FR-1.5.9a: Twitter/X posts respect 280 character limit with punchy hooks (P0)
- FR-1.5.9b: LinkedIn posts use professional but authentic tone, up to 3000 chars (P0)
- FR-1.5.9c: TikTok/Reels scripts include hook-in-3-seconds structure (P0)
- FR-1.5.9d: Carousel outlines provide 10-slide structure with progressive reveal (P1)

**Sprint 5 Lite: Critic Agent (Scoring Only)**

**10. Quality Scoring**
- FR-1.5.10a: Critic Agent scores each spoke on Hook Strength (G2, 0-100) (P0)
- FR-1.5.10b: Critic Agent evaluates Brand Voice Alignment (G4, Pass/Fail) (P0)
- FR-1.5.10c: Critic Agent evaluates Platform Compliance (G5, Pass/Fail) (P0)
- FR-1.5.10d: Scores and feedback displayed alongside each spoke in review queue (P0)
- FR-1.5.10e: Spokes scoring below threshold (< 70 on G2) are flagged for attention (P0)

**11. Critic Feedback Display**
- FR-1.5.11a: Each spoke displays Critic's specific feedback (P0)
- FR-1.5.11b: Users can view detailed breakdown of score components (P1)
- FR-1.5.11c: Feedback is actionable and educational for users (P0)

**Sprint 7 Lite: Mission Control Dashboard**

**12. Ready for Review Queue**
- FR-1.5.12a: Dashboard displays all generated spokes awaiting user review (P0)
- FR-1.5.12b: Queue sorted by Critic score (highest first) (P0)
- FR-1.5.12c: Filter by platform, Hub, or score range (P0)
- FR-1.5.12d: Mobile-friendly swipe interface for approve/reject (P0)
- FR-1.5.12e: Estimated review time displayed based on queue size (P1)

**13. Publish to Native Workflow**
- FR-1.5.13a: Users can tap "Ready to Post" on approved content (P0)
- FR-1.5.13b: "Copy Caption" button copies formatted text to clipboard (P0)
- FR-1.5.13c: "Share to [Platform]" triggers native OS share sheet with media file (P0)
- FR-1.5.13d: Share sheet opens target platform app with content pre-loaded (P0)
- FR-1.5.13e: System tracks when content is handed off for native posting (P1)

**14. Agency Owner Dashboard**
- FR-1.5.14a: Agency Owners can view list of all onboarded clients (P0)
- FR-1.5.14b: Agency Owners can see BrandDNA completion status per client (P0)
- FR-1.5.14c: Agency Owners can invite new clients via email link (P0)
- FR-1.5.14d: Agency Owners can view collected testimonials (P0)
- FR-1.5.14e: Agency Owners can download/export testimonials for marketing use (P1)

**Testimonial Collection (Mandatory)**

**15. Private Win Video Capture**
- FR-1.5.15a: Agent prompts for "private win" video after BrandDNA session completion (P0)
- FR-1.5.15b: Video recording works on mobile browsers (P0)
- FR-1.5.15c: Prompt explains this is for personal momentum, not shared (P0)
- FR-1.5.15d: User can skip without friction (P0)
- FR-1.5.15e: Video stored in R2 with client association (P0)

**16. Testimonial Request Flow**
- FR-1.5.16a: Agent asks for testimonial after user approves first batch of content (P0)
- FR-1.5.16b: Request is transparent: "Would you share your experience to help others?" (P0)
- FR-1.5.16c: User can accept, decline, or "ask me later" (P0)
- FR-1.5.16d: If accepted, user records testimonial video (P0)
- FR-1.5.16e: User can optionally give permission for public use (P0)

**17. Testimonial Management**
- FR-1.5.17a: Collected testimonials stored in R2 with metadata (P0)
- FR-1.5.17b: Agency Owner can view all client testimonials (P0)
- FR-1.5.17c: Agency Owner can download testimonial videos (P0)
- FR-1.5.17d: Testimonial metadata includes: client name, date, permission status (P0)

### Non-Functional Requirements

**Performance**
- NFR-1.5-P1: Voice recording to transcription < 30 seconds
- NFR-1.5-P2: BrandDNA session total time < 15 minutes
- NFR-1.5-P3: Pillar generation from Brand DNA < 30 seconds
- NFR-1.5-P4: Content review queue load (mobile) < 3 seconds
- NFR-1.5-P5: Native share sheet trigger < 500ms

**Mobile Experience**
- NFR-1.5-M1: Mobile browser support (iOS Safari 15+, Android Chrome 90+)
- NFR-1.5-M2: Voice recording on mobile (Native MediaRecorder API)
- NFR-1.5-M3: Video recording on mobile (getUserMedia with compression)
- NFR-1.5-M4: Touch targets (Minimum 44x44px)
- NFR-1.5-M5: Swipe gestures (60fps smooth animations)

**Data Privacy**
- NFR-1.5-D1: Voice note encryption (AES-256 at rest in R2)
- NFR-1.5-D2: Testimonial permission tracking (Explicit opt-in stored)
- NFR-1.5-D3: Client data isolation (Per-client Durable Object)

### Additional Requirements

**From Architecture:**
- BrandDNAAgent extends Cloudflare `Agent` class (Durable Object)
- Per-client instance with SQLite state (`this.sql`)
- WebSocket connection for real-time UI updates
- Structured JSON responses that render as interactive UI components
- Greenfield project with existing foundation deployed
- Technology stack: React 19 + TanStack Router + tRPC 11 + Kysely + D1 + Cloudflare Workers
- Physical isolation via Durable Objects with per-client SQLite state
- Per-client Vectorize namespaces for Brand DNA embeddings
- Per-client R2 paths for media assets (voice notes, testimonials)

**From UX Design:**
- Midnight Command dark theme (LOCKED)
- Mobile-first for BrandDNA conversation experience
- VoiceRecorder component for voice capture
- VideoRecorder component for testimonials
- PlatformSelector component with drag-and-drop
- PillarProposal component with editable cards
- PersonaCard component for audience display
- NativePostHandOff component for share workflow
- Touch targets minimum 44x44px
- Swipe gestures for approve/reject
- WCAG 2.1 AA accessibility compliance

**Data Schema Extensions (D1):**
- `brand_dna_sessions` — Session tracking with status
- `voice_recordings` — Audio files (R2 keys) with transcription
- `audience_personas` — Generated personas with demographics
- `content_pillars` — Approved pillars linked to clients
- `platform_strategy` — Platform priorities and cadence

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-1.5.1a | Epic 1 | Voice note recording (2-min, mobile) |
| FR-1.5.1b | Epic 1 | Whisper transcription |
| FR-1.5.1c | Epic 1 | Tone/vocabulary extraction |
| FR-1.5.1d | Epic 1 | Re-record option |
| FR-1.5.1e | Epic 1 | Upload existing content |
| FR-1.5.1f | Epic 1 | Analyze uploaded content |
| FR-1.5.2a | Epic 2 | Audience demographics questions |
| FR-1.5.2b | Epic 2 | Pain points/aspirations questions |
| FR-1.5.2c | Epic 2 | Content consumption habits |
| FR-1.5.2d | Epic 2 | Generate audience personas |
| FR-1.5.2e | Epic 2 | Review/approve personas |
| FR-1.5.3a | Epic 2 | Competitor list input |
| FR-1.5.3b | Epic 2 | Competitor analysis explanation |
| FR-1.5.3c | Epic 2 | RAG market research (P2) |
| FR-1.5.3d | Epic 2 | Gap identification (P2) |
| FR-1.5.4a | Epic 2 | Recommend primary platforms |
| FR-1.5.4b | Epic 2 | Recommend secondary platforms |
| FR-1.5.4c | Epic 2 | Adjust platform priorities |
| FR-1.5.4d | Epic 2 | Content medium preferences |
| FR-1.5.4e | Epic 2 | Posting cadence proposal |
| FR-1.5.5a | Epic 3 | Propose 3-5 topic pillars |
| FR-1.5.5b | Epic 3 | Pillar rationale |
| FR-1.5.5c | Epic 3 | Approve/edit/regenerate pillars |
| FR-1.5.5d | Epic 3 | Store approved pillars |
| FR-1.5.6a | Epic 3 | Generate Brand DNA Report |
| FR-1.5.6b | Epic 3 | Report includes tone/vocabulary/stances |
| FR-1.5.6c | Epic 3 | Brand DNA Strength score |
| FR-1.5.6d | Epic 3 | Export report as PDF |
| FR-1.5.7a | Epic 4 | Upload long-form content |
| FR-1.5.7b | Epic 4 | Paste raw text |
| FR-1.5.7c | Epic 4 | Display extracted themes |
| FR-1.5.7d | Epic 4 | Highlight golden nuggets |
| FR-1.5.8a | Epic 4 | Generate 20+ spokes |
| FR-1.5.8b | Epic 4 | Respect platform priorities |
| FR-1.5.8c | Epic 4 | Platform-specific adaptation |
| FR-1.5.8d | Epic 4 | Real-time progress tracker |
| FR-1.5.8e | Epic 4 | Pillars inform generation |
| FR-1.5.9a | Epic 4 | Twitter 280 char formatting |
| FR-1.5.9b | Epic 4 | LinkedIn professional tone |
| FR-1.5.9c | Epic 4 | TikTok hook structure |
| FR-1.5.9d | Epic 4 | Carousel 10-slide structure |
| FR-1.5.10a | Epic 5 | G2 Hook Strength scoring |
| FR-1.5.10b | Epic 5 | G4 Brand Voice alignment |
| FR-1.5.10c | Epic 5 | G5 Platform compliance |
| FR-1.5.10d | Epic 5 | Scores displayed in queue |
| FR-1.5.10e | Epic 5 | Flag low scores (<70) |
| FR-1.5.11a | Epic 5 | Display Critic feedback |
| FR-1.5.11b | Epic 5 | Score component breakdown |
| FR-1.5.11c | Epic 5 | Actionable feedback |
| FR-1.5.12a | Epic 6 | Ready for review dashboard |
| FR-1.5.12b | Epic 6 | Sort by Critic score |
| FR-1.5.12c | Epic 6 | Filter by platform/Hub/score |
| FR-1.5.12d | Epic 6 | Mobile swipe interface |
| FR-1.5.12e | Epic 6 | Estimated review time |
| FR-1.5.13a | Epic 6 | Ready to Post button |
| FR-1.5.13b | Epic 6 | Copy Caption to clipboard |
| FR-1.5.13c | Epic 6 | Native Share Sheet trigger |
| FR-1.5.13d | Epic 6 | Pre-load content in platform app |
| FR-1.5.13e | Epic 6 | Track hand-off timestamp |
| FR-1.5.14a | Epic 7 | View client list |
| FR-1.5.14b | Epic 7 | BrandDNA completion status |
| FR-1.5.14c | Epic 7 | Invite clients via email |
| FR-1.5.14d | Epic 7 | View collected testimonials |
| FR-1.5.14e | Epic 7 | Export testimonials |
| FR-1.5.15a | Epic 8 | Prompt for private win video |
| FR-1.5.15b | Epic 8 | Mobile video recording |
| FR-1.5.15c | Epic 8 | Explain private nature |
| FR-1.5.15d | Epic 8 | Skip without friction |
| FR-1.5.15e | Epic 8 | Store video in R2 |
| FR-1.5.16a | Epic 8 | Testimonial request after approval |
| FR-1.5.16b | Epic 8 | Transparent request framing |
| FR-1.5.16c | Epic 8 | Accept/decline/later options |
| FR-1.5.16d | Epic 8 | Record testimonial video |
| FR-1.5.16e | Epic 8 | Permission for public use |
| FR-1.5.17a | Epic 8 | Store testimonials with metadata |
| FR-1.5.17b | Epic 8 | Agency owner view testimonials |
| FR-1.5.17c | Epic 8 | Download testimonial videos |
| FR-1.5.17d | Epic 8 | Testimonial metadata |

---

## Epic List

### Epic 1: BrandDNA Agent - Voice Capture
**User Outcome:** Users can record voice notes on mobile and have their brand personality extracted by AI

Users articulate their brand through a 2-minute voice recording. The system transcribes using Whisper and extracts tone, vocabulary, and personality markers. Users can re-record if unsatisfied or upload existing content for enhanced analysis.

**FRs Covered:** FR-1.5.1a, FR-1.5.1b, FR-1.5.1c, FR-1.5.1d, FR-1.5.1e, FR-1.5.1f (6 FRs)

**Architecture Pattern:** BrandDNAAgent Durable Object with WebSocket + Workers AI (Whisper)

---

### Epic 2: BrandDNA Agent - Audience & Strategy Discovery
**User Outcome:** Users understand their target audience and have a strategic platform prioritization

The Agent guides users through defining their audience demographics, psychographics, and content habits. Generates audience personas for approval. Users can list competitors for gap analysis. Agent recommends primary/secondary platforms with rationale and proposes posting cadence.

**FRs Covered:** FR-1.5.2a-e, FR-1.5.3a-d, FR-1.5.4a-e (14 FRs)

**Architecture Pattern:** Structured Agent Responses (ButtonChoice, AudienceForm, PlatformSelector components)

---

### Epic 3: BrandDNA Agent - Pillars & Report
**User Outcome:** Users have approved content pillars and can see their complete Brand DNA Report

Agent proposes 3-5 content topic pillars aligned with Brand Story Framework. Each pillar includes rationale. Users can approve, edit, or regenerate individual pillars. Upon completion, generates comprehensive Brand DNA Report with strength score.

**FRs Covered:** FR-1.5.5a-d, FR-1.5.6a-d (8 FRs)

**Architecture Pattern:** PillarProposal component with per-pillar regeneration, PDF export

---

### Epic 4: Hub-to-Spoke Content Generation
**User Outcome:** Users upload source content and receive 20+ platform-specific content pieces

Users upload long-form content (transcript, article, outline) or paste raw text. System extracts key themes. Optional: highlight "golden nuggets." Cloudflare Workflow generates 20+ spokes adapted to each platform's format and constraints. Real-time progress tracking via WebSocket.

**FRs Covered:** FR-1.5.7a-d, FR-1.5.8a-e, FR-1.5.9a-d (13 FRs)

**Architecture Pattern:** Cloudflare Workflows (contentGenerationWorkflow), Platform-Native Adaptation

---

### Epic 5: Critic Agent - Quality Scoring (Lite)
**User Outcome:** Users see G2/G4/G5 quality scores and actionable feedback on each spoke

Critic Agent evaluates each spoke: G2 (Hook Strength 0-100), G4 (Brand Voice Pass/Fail), G5 (Platform Compliance Pass/Fail). Scores displayed in review queue. Low scores (<70) flagged. Feedback is specific and actionable.

**Note:** Self-Healing Loop deferred to Phase 2.

**FRs Covered:** FR-1.5.10a-e, FR-1.5.11a-c (8 FRs)

**Architecture Pattern:** Queue-based Critic Scoring via Cloudflare Queues (ADR-003) + Workers AI with rubric prompts, JSON mode for structured scores

---

### Epic 6: Mobile Review & Native Publish Flow
**User Outcome:** Users can review content on mobile and share directly to platform apps

Mobile-friendly dashboard displays spokes awaiting review, sorted by score. Swipe interface for approve/reject. Filter by platform, Hub, or score range. "Ready to Post" triggers Copy Caption + native Share Sheet workflow, opening target platform app with content pre-loaded.

**FRs Covered:** FR-1.5.12a-e, FR-1.5.13a-e (10 FRs)

**Architecture Pattern:** NativePostHandOff component, navigator.share() Web Share API

---

### Epic 7: Agency Owner Dashboard
**User Outcome:** Agency owners can manage clients and view onboarding status

Agency owners see list of all clients with BrandDNA completion status. Can invite new clients via email link. View and export collected testimonials for marketing use.

**FRs Covered:** FR-1.5.14a-e (5 FRs)

**Architecture Pattern:** D1 queries with agency_id filtering, R2 testimonial storage

---

### Epic 8: Testimonial Collection
**User Outcome:** System captures private wins and testimonials at strategic moments

After BrandDNA session: prompt for "private win" video (personal momentum, not shared). After first batch approval: transparent testimonial request with accept/decline/later options. Videos stored in R2 with metadata and permission tracking.

**FRs Covered:** FR-1.5.15a-e, FR-1.5.16a-e, FR-1.5.17a-d (14 FRs)

**Architecture Pattern:** VideoRecorder component, R2 storage with permission metadata

---

### Epic 9: Compliance & Data Privacy
**User Outcome:** Users have control over their data and the system meets GDPR/privacy requirements

GDPR-compliant data handling with right to erasure, consent version tracking for audit defense, and explicit opt-in for testimonial public use.

**FRs Covered:** Focus Group additions (GDPR compliance, consent tracking)

**Architecture Pattern:** Cloudflare Queue for deletion jobs, `consent_log` table for audit trail

*[Focus Group Addition: David Chen (Compliance Officer) identified GDPR gaps]*

---

### Epic 10: Operations & Resilience
**User Outcome:** System is observable, resilient to failures, and protected from abuse

Comprehensive monitoring and alerting, dead-letter queue handling for failed messages, and per-client rate limiting to prevent abuse.

**FRs Covered:** Operational requirements from Round Table, Failure Mode Analysis, Red Team

**Architecture Pattern:** Cloudflare Analytics, DLQ with replay, sliding window rate limits

**Priority:** P2 (Operations foundation for production readiness)

*[Round Table + Failure Mode + Red Team: Observability, resilience, and abuse prevention]*

---

## Epic 1: BrandDNA Agent - Voice Capture

**User Outcome:** Users can record voice notes on mobile and have their brand personality extracted by AI

**FRs Covered:** FR-1.5.1a, FR-1.5.1b, FR-1.5.1c, FR-1.5.1d, FR-1.5.1e, FR-1.5.1f

**NFRs:** NFR-1.5-P1 (< 30s transcription), NFR-1.5-M2 (MediaRecorder), NFR-1.5-D1 (AES-256)

---

### Story 1.1: BrandDNA Agent Infrastructure

As a **developer**,
I want **the BrandDNAAgent Durable Object to be scaffolded with WebSocket support**,
So that **all subsequent stories have a foundation to build upon**.

**Acceptance Criteria:**

**Given** the Foundry dashboard codebase
**When** I create a new BrandDNAAgent class extending Cloudflare Agent
**Then** it initializes with `this.sql` for SQLite state storage
**And** it supports WebSocket connections via `onConnect`/`onMessage`
**And** it can broadcast structured responses with `component.type` and `props`

**Given** a client connects to their BrandDNAAgent
**When** the WebSocket handshake completes
**Then** the agent sends a welcome message: `{ component: { type: 'TextMessage', props: { content: '...' } } }`

**Given** a WebSocket connection drops (mobile network switch, subway, etc.)
**When** the client reconnects within 30 minutes
**Then** the agent restores session state from `this.sql`
**And** resumes the conversation exactly where it left off
**And** no user input is lost

*[War Room Finding #2: Mobile networks drop WebSocket connections frequently]*

**Given** a client sends WebSocket messages
**When** messages exceed 30 per minute
**Then** the agent rate-limits the connection
**And** returns error: `{ error: 'rate_limited', retry_after: 60 }`
**And** excessive requests are logged for abuse detection

*[Security Audit: WebSocket rate limiting prevents DoS attacks on Durable Objects]*

**Given** the Durable Object is about to hibernate (idle timeout)
**When** hibernation begins
**Then** all session state is persisted to `this.sql` before sleep
**And** state is fully recoverable on next wake
**And** no data is lost during hibernation cycles

*[Failure Mode Analysis: DO hibernation must preserve state]*

---

### Story 1.2: Voice Recording Component (Mobile)

As a **user**,
I want **to record a 2-minute voice note describing my brand on my mobile device**,
So that **I can articulate my brand personality naturally**.

**Acceptance Criteria:**

**Given** I am on the BrandDNA session page on mobile
**When** I tap the "Record Voice" button
**Then** the VoiceRecorder component appears with a timer (max 300 seconds / 5 minutes)
**And** recording uses the MediaRecorder API (NFR-1.5-M2)
**And** I see a visual waveform indicator

**Given** I finish one voice recording
**When** I want to add more context
**Then** I can tap "Add Another Recording" to record additional segments
**And** all segments are analyzed together for a richer Brand DNA

*[Focus Group Finding: Dr. Priya needs more than 2 minutes when she gets on a roll]*

**Given** I am recording
**When** I tap "Stop" or reach 120 seconds
**Then** recording stops automatically
**And** I can preview the audio before submitting

**Given** I have recorded audio
**When** I tap "Re-record"
**Then** my previous recording is discarded
**And** I can start a fresh recording (FR-1.5.1d)

**Given** I am recording on iOS Safari (known MediaRecorder issues)
**When** recording exceeds 30 seconds
**Then** the system uses chunked recording (30-second segments)
**And** segments are stitched server-side transparently
**And** I see no interruption in the recording experience

**Given** I submit a voice recording (especially 3-5 minute recordings)
**When** upload begins
**Then** the system uses resumable upload (tus protocol) for files > 1MB
**And** I see upload progress percentage
**And** if connection drops mid-upload, it resumes from last completed chunk
**And** upload completes reliably even on flaky mobile networks

*[ADR-002: Resumable uploads handle mobile network interruptions gracefully]*

**Given** my browser does not support MediaRecorder
**When** I attempt to record
**Then** I see a helpful message with supported browser recommendations
**And** I can alternatively upload a pre-recorded audio file

*[War Room Finding #1: iOS Safari MediaRecorder drops audio after ~1 minute]*

---

### Story 1.3: Voice Note Transcription

As a **user**,
I want **my voice note to be transcribed automatically**,
So that **I can review what I said and the system can analyze it**.

**Acceptance Criteria:**

**Given** I have submitted a voice recording
**When** the system receives the file
**Then** server-side validation checks:
- File type via magic bytes (not just extension) — must be audio/*
- File size < 10MB
- Duration < 5 minutes (extracted from audio metadata)
**And** invalid files are rejected with clear error message
**And** rejection is logged for security monitoring

*[Security Audit: Validate file type server-side to prevent malicious uploads]*

**Given** file validation passes
**When** the system processes it
**Then** the audio is uploaded to R2 (path: `/voice-notes/{client_id}/{session_id}.webm`)
**And** it is encrypted at rest (AES-256, NFR-1.5-D1)
**And** Workers AI Whisper transcribes the audio

**Given** transcription is in progress
**When** I view the session
**Then** I see a ResearchStatus component: `{ status: 'in_progress', message: 'Transcribing your voice...' }`

**Given** transcription completes
**When** the result is ready
**Then** processing completes in < 30 seconds (NFR-1.5-P1)
**And** the transcription text is displayed for my review
**And** I can see my voice note saved in `voice_recordings` table

---

### Story 1.4: Brand Personality Extraction

As a **user**,
I want **the system to extract my tone, vocabulary, and personality markers from my transcription**,
So that **my Brand DNA begins to form**.

**Acceptance Criteria:**

**Given** my voice note has been transcribed
**When** the transcription is prepared for LLM analysis
**Then** the system sanitizes input:
- User content is clearly delimited with `<user_content>` tags
- System prompts are isolated and immutable
- Known prompt injection patterns are escaped or flagged
**And** sanitized transcription is passed to Workers AI

*[Red Team: Prompt injection via transcription must be prevented]*

**Given** sanitized transcription is ready
**When** the extraction agent runs
**Then** Workers AI analyzes the text and extracts:
- Primary tone (e.g., "Direct and confident")
- Key vocabulary patterns (signature phrases)
- Personality markers (e.g., "Anti-corporate")

**Given** extraction completes
**When** I view the results
**Then** I see a TextMessage showing detected characteristics
**And** detected markers are stored in `brand_dna_sessions.voice_analysis` JSON field

---

### Story 1.5: Upload Existing Content for Analysis

As a **user**,
I want **to upload my existing content (blogs, videos, social posts) for additional analysis**,
So that **the system can learn from my best work**.

**Acceptance Criteria:**

**Given** I am in a BrandDNA session
**When** the agent prompts "Would you like to upload existing content?"
**Then** I see a file upload component accepting: PDF, TXT, DOCX, MP3, MP4

**Given** I upload a file
**When** it is processed
**Then** the file is stored in R2 (`/brand-samples/{client_id}/`)
**And** text is extracted (PDF/DOCX via parser, audio via Whisper)
**And** the sample appears in my training samples list

**Given** I have uploaded multiple samples
**When** the analysis runs
**Then** the system cross-references voice note analysis with content patterns
**And** Brand DNA confidence score increases (FR-1.5.1f)

---

### Story 1.6: Save and Resume BrandDNA Session

As a **user**,
I want **to save my BrandDNA session progress and resume later**,
So that **I don't lose work if I need to step away or switch devices**.

**Acceptance Criteria:**

**Given** I am in a BrandDNA session
**When** I close the browser or switch apps on mobile
**Then** my session state is automatically saved to `this.sql`
**And** no explicit "save" action is required

**Given** I return to the Foundry dashboard
**When** I have an incomplete BrandDNA session
**Then** I see a banner: "Continue your Brand Discovery? You're 45% complete."
**And** I can tap "Continue" to resume exactly where I left off
**And** I can tap "Start Over" to begin a fresh session

**Given** I resume a session
**When** the session loads
**Then** all previous answers and recordings are restored
**And** the agent summarizes: "Welcome back! Last time we covered your voice analysis. Let's continue with audience discovery."
**And** conversation history is visible for context

**Given** I have an incomplete session older than 30 days
**When** I return to the dashboard
**Then** I see: "Your previous session expired. Start fresh?"
**And** expired session data is archived (not deleted) for potential recovery

**Given** I switch from mobile to desktop mid-session
**When** I log in on desktop
**Then** session state is synchronized across devices
**And** I can continue seamlessly on either device

*[Pre-mortem: 40% of users abandoned BrandDNA because they couldn't save and continue later]*

---

### Story 1.7: Text-Only BrandDNA Path

As a **user** who cannot or prefers not to record voice,
I want **to complete BrandDNA using text input only**,
So that **I can still benefit from the system without voice recording**.

**Acceptance Criteria:**

**Given** I am starting a BrandDNA session
**When** the voice capture step appears
**Then** I see a ButtonChoice: "Record Voice" or "Type Instead"

**Given** I select "Type Instead"
**When** the text input appears
**Then** I see a large text area with prompt: "Describe your brand in your own words. What makes you unique? What do you stand for?"
**And** minimum 200 characters required (ensures sufficient input for analysis)
**And** maximum 5000 characters allowed

**Given** I submit my text description
**When** the system processes it
**Then** brand personality extraction (Story 1.4) runs on the text
**And** analysis quality is comparable to voice analysis
**And** I can continue to Epic 2 (Audience Discovery) without voice recording

**Given** I want to add more context later
**When** I return to my BrandDNA session
**Then** I can add additional text samples or switch to voice recording
**And** all inputs are combined for richer Brand DNA

*[SCAMPER - Substitute: Voice recording substituted with text for accessibility and preference]*

---

### Story 1.8: Express BrandDNA (60-Second Path)

As a **busy user**,
I want **to complete a minimal BrandDNA in under 60 seconds**,
So that **I can start generating content immediately without a long onboarding**.

**Acceptance Criteria:**

**Given** I start a new BrandDNA session
**When** the welcome screen appears
**Then** I see two options: "Full Discovery (~15 min)" or "Express Setup (~60 sec)"

**Given** I select "Express Setup"
**When** the express flow begins
**Then** I am asked exactly 3 questions:
1. "In one sentence, what do you do?" (text input)
2. "Pick 3 words that describe your tone" (ButtonChoice: Professional, Casual, Bold, Friendly, Technical, Playful, etc.)
3. "Which platform is your priority?" (ButtonChoice: LinkedIn, Twitter, TikTok, Instagram, YouTube)

**Given** I complete the 3 express questions
**When** I submit my answers
**Then** system generates a "Starter Brand DNA" with:
- Basic tone profile from selected words
- Platform focus for spoke generation
- Default audience persona (can be refined later)
**And** Brand DNA Strength shows "Starter - 40%" with prompt: "Add voice recording to strengthen"

**Given** I have a Starter Brand DNA
**When** I generate spokes
**Then** generation works with starter profile
**And** quality may be lower than full BrandDNA (G4 scoring notes: "Limited brand data")
**And** I can "Upgrade" to full BrandDNA at any time

*[First Principles: Core need is "get content out" — minimize time-to-first-spoke]*

---

## Epic 2: BrandDNA Agent - Audience & Strategy Discovery

**User Outcome:** Users understand their target audience and have a strategic platform prioritization

**FRs Covered:** FR-1.5.2a-e, FR-1.5.3a-d, FR-1.5.4a-e (14 FRs)

**NFRs:** NFR-1.5-P2 (Session < 15 min)

---

### Story 2.0: Import Existing Audience Persona

As a **user**,
I want **to import an existing audience persona from another tool (PDF, Notion, Google Doc)**,
So that **I don't have to rebuild what I already know about my audience**.

**Acceptance Criteria:**

**Given** the agent transitions to audience discovery (after Epic 1)
**When** the agent presents the opening prompt
**Then** I see two options via ButtonChoice:
- "Start Fresh – Let me guide you through building a persona"
- "Import Existing – I already have a persona documented"

**Given** I select "Import Existing"
**When** the upload interface appears
**Then** I can upload: PDF, DOCX, TXT, or paste text directly
**And** system accepts common persona formats (HubSpot, Notion templates, etc.)

**Given** I upload my existing persona
**When** the system processes it
**Then** Workers AI extracts:
- Demographics (age, location, industry, job title)
- Psychographics (pain points, aspirations, frustrations)
- Content consumption habits (if present)
**And** extracted data pre-populates the PersonaCard component

**Given** the persona is extracted
**When** I view the pre-populated PersonaCard
**Then** I can review, edit, and approve the imported persona
**And** agent asks clarifying questions only for missing fields
**And** I skip Stories 2.1-2.4 and proceed directly to Story 2.5 (Review and Approve)

*[Focus Group Finding: Marcus Chen imports personas from HubSpot for agency clients — don't make them start from scratch]*

---

### Story 2.1: Audience Demographics Questionnaire

As a **user**,
I want **the agent to ask structured questions about my target audience demographics**,
So that **I can define who I'm trying to reach**.

**Acceptance Criteria:**

**Given** I have completed the voice capture phase (Epic 1)
**When** the agent transitions to audience discovery
**Then** it asks ONE question at a time via ButtonChoice components (not a multi-field form)

**Given** the agent asks about age range
**When** I see the ButtonChoice
**Then** I can tap a single option: "18-24", "25-34", "35-44", "45-54", "55+"
**And** the agent immediately acknowledges and moves to the next question

**Given** the agent asks about industry
**When** I see the options
**Then** I can select from quick-tap chips (multi-select allowed)
**And** chips are large enough for mobile touch targets (44px min)

**Given** I complete all demographic questions
**When** the agent summarizes
**Then** it shows a TextMessage with inferred demographics
**And** I can tap "Looks good" or "Let me adjust"
**And** responses are stored in `audience_personas.demographics` JSON field

*[War Room Finding #3: Forms are friction on mobile — use conversational ButtonChoice]*

---

### Story 2.2: Audience Psychographics Deep Dive

As a **user**,
I want **the agent to ask about my audience's pain points and aspirations**,
So that **my content can address their real needs**.

**Acceptance Criteria:**

**Given** demographics have been captured
**When** the agent proceeds to psychographics
**Then** it asks conversational questions via TextMessage:
- "What keeps your audience up at night?"
- "What are they aspiring to achieve?"
- "What frustrates them about current solutions?"

**Given** I respond to psychographic questions
**When** the agent processes my answers
**Then** it extracts key themes (pain points, desires, frustrations)
**And** stores them in `audience_personas.psychographics` JSON field

---

### Story 2.3: Content Consumption Habits

As a **user**,
I want **the agent to understand where my audience consumes content**,
So that **platform recommendations are accurate**.

**Acceptance Criteria:**

**Given** psychographics have been captured
**When** the agent asks about content habits
**Then** it presents a ButtonChoice component:
- "Quick engaging content (TikTok, Reels)"
- "Deep dives and education (YouTube, podcasts)"
- "Professional networking (LinkedIn)"
- "Real-time conversation (Twitter/X)"
- "Visual inspiration (Instagram)"

**Given** I select content consumption preferences
**When** the agent records my choices
**Then** it uses this to weight platform recommendations (Story 2.7)
**And** stores preferences in `audience_personas.content_habits`

---

### Story 2.4: Generate Audience Persona

As a **user**,
I want **the system to generate a detailed audience persona from my inputs**,
So that **I can visualize who I'm creating content for**.

**Acceptance Criteria:**

**Given** demographics, psychographics, and content habits are captured
**When** the persona generation runs
**Then** Workers AI synthesizes a detailed persona including:
- Name and avatar placeholder
- Demographics summary
- Top 3 pain points
- Top 3 aspirations
- Preferred platforms

**Given** the persona is generated
**When** I view it
**Then** I see a PersonaCard component displaying the persona
**And** persona is stored in `audience_personas` table with `client_id`

---

### Story 2.5: Review and Approve Persona

As a **user**,
I want **to review and approve (or edit) my generated persona**,
So that **I have confidence the system understands my audience**.

**Acceptance Criteria:**

**Given** a persona has been generated
**When** I view the PersonaCard
**Then** I see "Approve", "Edit", and "Regenerate" buttons

**Given** I tap "Edit"
**When** the edit mode activates
**Then** I can modify any field in the persona
**And** changes are saved to the database

**Given** I tap "Regenerate"
**When** the agent processes
**Then** it generates a new persona with different emphasis
**And** I can compare and choose

**Given** I tap "Approve"
**When** the persona is approved
**Then** `audience_personas.status` is set to "approved"
**And** the agent proceeds to competitor analysis

---

### Story 2.6: Competitor Input (Optional)

As a **user**,
I want **to optionally list competitors I admire or want to differentiate from**,
So that **the system can identify gaps I can own (if I choose to provide them)**.

**Acceptance Criteria:**

**Given** my persona is approved
**When** the agent prompts for competitors
**Then** I see a text input allowing 0-3 competitor names/URLs
**And** I see a prominent "Skip" button below the input

**Given** I enter competitor names
**When** the agent acknowledges
**Then** it explains: "I'll analyze what they do well and identify gaps you can own"
**And** competitors are stored in `brand_dna_sessions.competitors` array

**Given** I tap "Skip" without entering competitors
**When** the skip is processed
**Then** the agent says: "No problem! We can focus on your unique strengths."
**And** `brand_dna_sessions.competitors` is set to empty array
**And** I proceed directly to Story 2.7 (Platform Recommendation)
**And** pillar generation (Story 3.1) works without competitor data

*[SCAMPER - Eliminate: Competitor analysis is valuable but not essential — remove friction for users without competitors in mind]*

---

### Story 2.7: Platform Recommendation

As a **user**,
I want **the agent to recommend 2-3 primary and 2-3 secondary platforms**,
So that **I know where to focus my content efforts**.

**Acceptance Criteria:**

**Given** audience persona and content habits are known
**When** the platform recommendation runs
**Then** the agent presents a PlatformSelector component showing:
- 2-3 recommended PRIMARY platforms with rationale
- 2-3 recommended SECONDARY platforms with rationale

**Given** I view platform recommendations
**When** I disagree with a recommendation
**Then** I can drag to reorder priorities
**And** I can toggle platforms between primary/secondary/excluded

**Given** I approve the platform selection
**When** the configuration is saved
**Then** priorities are stored in `platform_strategy` table

---

### Story 2.8: Content Medium Preferences

As a **user**,
I want **to specify my preferred content mediums (video, written, audio, visual)**,
So that **generated content matches my comfort level**.

**Acceptance Criteria:**

**Given** platforms have been selected
**When** the agent asks about content mediums
**Then** I see a ButtonChoice component:
- Written (blogs, threads, captions)
- Video (short-form, long-form)
- Audio (podcasts, voice notes)
- Visual (carousels, infographics)

**Given** I select my preferences
**When** I rank them by comfort level
**Then** the agent adapts spoke generation to favor my preferences
**And** preferences are stored in `platform_strategy.mediums`

---

### Story 2.9: Posting Cadence Proposal

As a **user**,
I want **the agent to propose a realistic posting cadence per platform**,
So that **I have a sustainable content plan**.

**Acceptance Criteria:**

**Given** platforms and mediums are selected
**When** the agent proposes cadence
**Then** it displays recommended frequency per platform:
- "LinkedIn: 3 posts/week"
- "YouTube: 1 video/month"
- "Twitter: 5 posts/day"

**Given** I view the cadence proposal
**When** I want to adjust
**Then** I can modify frequency via slider or dropdown
**And** agent warns if cadence is unrealistic for solo creator

**Given** I approve the cadence
**When** configuration is saved
**Then** cadence is stored in `platform_strategy.cadence`
**And** Epic 2 is complete

---

### Story 2.10: Single Audience Prompt (Simplified Flow)

As a **user**,
I want **to describe my audience in one sentence and have AI expand it**,
So that **I can skip lengthy questionnaires while still getting a useful persona**.

**Acceptance Criteria:**

**Given** I start the Audience Discovery phase
**When** the agent presents options
**Then** I see ButtonChoice: "Quick Description" or "Guided Questions"

**Given** I select "Quick Description"
**When** the input appears
**Then** I see a single text field: "Who is your ideal audience? (one sentence)"
**And** placeholder example: "Tech founders scaling from $1M to $10M ARR"

**Given** I submit my one-sentence description
**When** the system processes it
**Then** Workers AI expands the description into a full persona including:
- Inferred demographics (age range, industry, role)
- Inferred psychographics (likely pain points, aspirations)
- Inferred content preferences
**And** expanded persona is displayed in PersonaCard component

**Given** I see the AI-expanded persona
**When** I review it
**Then** I can approve it as-is, edit any field, or switch to "Guided Questions" for more detail
**And** either path leads to a usable audience persona

**Given** I approve the quick persona
**When** it is saved
**Then** I skip Stories 2.1-2.4 and proceed to Story 2.6 (Competitor Input)
**And** persona quality is noted: "AI-Expanded — refine for better results"

*[Occam's Razor: Most users know their audience — one sentence is often enough]*

---

## Epic 3: BrandDNA Agent - Pillars & Report

**User Outcome:** Users have approved content pillars and can see their complete Brand DNA Report

**FRs Covered:** FR-1.5.5a-d, FR-1.5.6a-d (8 FRs)

**NFRs:** NFR-1.5-P3 (Pillar generation < 30s)

---

### Story 3.1: Topic Pillar Generation

As a **user**,
I want **the agent to propose 3-5 content topic pillars aligned with the Brand Story Framework**,
So that **I have strategic themes to guide my content**.

**Acceptance Criteria:**

**Given** audience persona and platform strategy are approved
**When** the pillar generation runs
**Then** Workers AI generates 3-5 topic pillars based on:
- Voice analysis from Epic 1
- Audience pain points and aspirations
- Competitive gaps (if competitors listed)
- Brand Story Framework (Catalyst, Core Truth, Proof)

**Given** pillars are generated
**When** processing completes
**Then** generation completes in < 30 seconds (NFR-1.5-P3)
**And** pillars are presented via PillarProposal component

---

### Story 3.2: Pillar Rationale Display

As a **user**,
I want **each pillar to include a clear rationale**,
So that **I understand why this topic is strategic**.

**Acceptance Criteria:**

**Given** pillars are displayed in PillarProposal component
**When** I tap on a pillar card
**Then** it expands to show:
- Connection to my voice analysis
- How it addresses audience pain points
- Why it differentiates from competitors

**Given** I review a pillar's rationale
**When** I find it compelling
**Then** I can approve that specific pillar independently

---

### Story 3.3: Pillar Approve/Edit/Regenerate

As a **user**,
I want **to approve, edit, or regenerate individual pillars**,
So that **I have full control over my content strategy**.

**Acceptance Criteria:**

**Given** I view the PillarProposal component
**When** I tap "Approve" on a pillar
**Then** that pillar is marked approved (green checkmark)
**And** `content_pillars.status` = "approved" for that pillar

**Given** I tap "Edit" on a pillar
**When** the edit mode activates
**Then** I can modify the pillar title and description
**And** changes are saved immediately

**Given** I tap "Regenerate" on a pillar
**When** the agent processes my request
**Then** it generates a new pillar with different angle
**And** I can compare old vs new before deciding

**Given** I provide feedback with regeneration (e.g., "more contrarian")
**When** the agent regenerates
**Then** it incorporates my feedback into the new pillar

**Given** all 3-5 pillars look good on first generation
**When** I review the PillarProposal component
**Then** I see a "These all look good" button at the bottom
**And** tapping it approves all pillars in one action
**And** I proceed to Story 3.5 (Generate Brand DNA Report) without individual taps

*[Occam's Razor: Don't force users to tap 5 times when one tap would do]*

---

### Story 3.4: Store Approved Pillars

As a **user**,
I want **my approved pillars to be saved as the foundation for content generation**,
So that **all future content aligns with my strategy**.

**Acceptance Criteria:**

**Given** I have approved all pillars (minimum 3)
**When** the system saves my configuration
**Then** pillars are stored in `content_pillars` table with:
- `client_id` foreign key
- `title`, `description`, `rationale`
- `status` = "approved"
- `created_at` timestamp

**Given** pillars are saved
**When** Hub-to-Spoke generation runs (Epic 4)
**Then** it uses these pillars to inform content angles

---

### Story 3.5: Generate Brand DNA Report

As a **user**,
I want **a comprehensive Brand DNA Report generated upon session completion**,
So that **I have a reference document for my brand voice**.

**Acceptance Criteria:**

**Given** all BrandDNA phases are complete (voice, audience, strategy, pillars)
**When** the report generation runs
**Then** it compiles a Brand DNA Report including:
- Detected tone and vocabulary
- Banned words and required phrases
- Audience persona summary
- Platform strategy
- Content pillars with rationale

**Given** the report is generated
**When** I view it
**Then** it displays in a BrandDNACard component
**And** report is stored in `brand_dna` table (existing from architecture)

---

### Story 3.6: Brand DNA Strength Score

As a **user**,
I want **to see a "Brand DNA Strength" score (0-100%)**,
So that **I know how well the system understands my brand**.

**Acceptance Criteria:**

**Given** the Brand DNA Report is generated
**When** the strength calculation runs
**Then** score is based on:
- Voice sample count and quality (30%)
- Completeness of audience data (25%)
- Number of approved pillars (20%)
- Platform strategy clarity (25%)

**Given** my score is below 70%
**When** I view the report
**Then** I see specific recommendations to improve (e.g., "Add more voice samples")

**Given** my score is above 85%
**When** I view the report
**Then** I see "Strong" status with green indicator

---

### Story 3.7: Export Brand DNA Report as PDF

As a **user**,
I want **to export my Brand DNA Report as a PDF**,
So that **I can share it with my team or save for reference**.

**Acceptance Criteria:**

**Given** I am viewing my Brand DNA Report
**When** I tap "Export PDF"
**Then** a request is sent to the server (Workers) to generate the PDF
**And** I see a loading indicator: "Generating your report..."

**Given** the server generates the PDF
**When** generation completes
**Then** PDF includes:
- Professional formatting
- All report sections
- Brand DNA Strength score
- Date generated
**And** PDF is stored in R2 (`/reports/{client_id}/brand-dna-{date}.pdf`)
**And** I receive a download link (not client-side generation)

**Given** I tap the download link
**When** the download starts
**Then** the PDF downloads to my device
**And** download works reliably on mobile browsers

*[War Room Finding #4: Client-side PDF generation is slow and memory-intensive on mobile — use server-side]*

---

## Epic 4: Hub-to-Spoke Content Generation

**User Outcome:** Users upload source content and receive 20+ platform-specific content pieces

**FRs Covered:** FR-1.5.7a-d, FR-1.5.8a-e, FR-1.5.9a-d (13 FRs)

**Architecture Pattern:** Cloudflare Workflows (contentGenerationWorkflow)

---

### Story 4.1: Source of Truth Upload

As a **user**,
I want **to upload long-form content as my Source of Truth**,
So that **the system can fracture it into multiple pieces**.

**Acceptance Criteria:**

**Given** I navigate to the Hub creation flow
**When** I see the upload interface
**Then** I can upload files: PDF, DOCX, TXT, MP3, MP4, or YouTube URL

**Given** I upload a file
**When** processing begins
**Then** file is stored in R2 (`/hubs/{client_id}/{hub_id}/source.*`)
**And** I see an upload progress indicator

**Given** upload completes
**When** the file is processed
**Then** text is extracted (PDF/DOCX via parser, audio/video via Whisper)
**And** hub record is created in D1 with `source_type` and `source_url`

---

### Story 4.2: Paste Raw Text as Source

As a **user**,
I want **to paste raw text as my Source of Truth**,
So that **I can quickly create a Hub without file upload**.

**Acceptance Criteria:**

**Given** I am in the Hub creation flow
**When** I tap "Paste Text"
**Then** I see a large text area for pasting content

**Given** I paste or type content
**When** I submit
**Then** content is stored in `hubs.source_text` field
**And** processing begins immediately

---

### Story 4.3: Display Extracted Themes

As a **user**,
I want **to see key themes extracted from my Source of Truth**,
So that **I understand what the system learned**.

**Acceptance Criteria:**

**Given** my source has been processed
**When** theme extraction runs
**Then** Workers AI identifies:
- 3-5 key themes/arguments
- Potential hooks and quotes
- Story elements (problem, journey, lesson)

**Given** themes are extracted
**When** I view the results
**Then** I see a ThemeList component with expandable cards
**And** themes are stored in `hubs.extracted_themes` JSON field

---

### Story 4.4: Highlight Golden Nuggets

As a **user**,
I want **to highlight "golden nugget" sections in my source**,
So that **the system emphasizes these in generated content**.

**Acceptance Criteria:**

**Given** I am viewing my extracted source text
**When** I select text and tap "Mark as Golden Nugget"
**Then** the selection is highlighted in gold
**And** nugget is stored in `hubs.golden_nuggets` array with start/end positions

**Given** I have marked golden nuggets
**When** spoke generation runs
**Then** these sections receive higher weight in content generation

---

### Story 4.5: Trigger Spoke Generation Workflow

As a **user**,
I want **the system to generate 20+ platform-specific spokes from my Hub**,
So that **I have a queue of ready-to-post content**.

**Acceptance Criteria:**

**Given** my source is processed and themes extracted
**When** I tap "Generate Content"
**Then** a Cloudflare Workflow (`contentGenerationWorkflow`) is triggered
**And** workflow receives: hub_id, client_id, platform_strategy, content_pillars

**Given** the workflow starts
**When** I view the Hub
**Then** I see a real-time progress tracker via WebSocket

---

### Story 4.6: Real-Time Generation Progress

As a **user**,
I want **to see real-time progress as spokes are generated**,
So that **I know the system is working**.

**Acceptance Criteria:**

**Given** spoke generation is in progress
**When** the workflow completes each spoke
**Then** it broadcasts progress via WebSocket: `{ generated: 5, total: 25 }`

**Given** I am viewing the Hub
**When** progress updates arrive
**Then** the UI shows:
- Progress bar (e.g., "5/25 Spokes Generated")
- List of completed spokes appearing in real-time
- Estimated time remaining

---

### Story 4.7: Platform-Specific Spoke Adaptation

As a **user**,
I want **each spoke to be adapted to its target platform's format**,
So that **content feels native to each platform**.

**Acceptance Criteria:**

**Given** the workflow generates a spoke for Twitter/X
**When** the platform adapter runs
**Then** it produces content that:
- Respects 280 character limit
- Uses punchy, contrarian hooks
- Includes 0-2 relevant hashtags

**Given** the workflow generates a spoke for LinkedIn
**When** the platform adapter runs
**Then** it produces content that:
- Uses professional but authentic tone
- Is up to 3000 characters
- Opens with a strong hook line

**Given** the workflow generates a spoke for TikTok/Reels
**When** the platform adapter runs
**Then** it produces a script with:
- Hook in first 3 seconds
- Clear middle section
- Soft call-to-action

**Given** the workflow generates a carousel
**When** the platform adapter runs
**Then** it produces a 10-slide outline with progressive reveal structure

---

### Story 4.8: Store Generated Spokes

As a **user**,
I want **generated spokes to be stored and linked to my Hub**,
So that **I can review and manage them**.

**Acceptance Criteria:**

**Given** a spoke is generated
**When** the workflow stores it
**Then** it creates a record in `spokes` table with:
- `hub_id` foreign key
- `client_id` foreign key
- `platform` (twitter, linkedin, tiktok, carousel)
- `content` (text or JSON for structured content)
- `status` = "pending_review"

**Given** all spokes are generated
**When** the workflow completes
**Then** `hubs.status` is updated to "generated"
**And** I receive a notification: "25 spokes ready for review"

---

### Story 4.9: Resume Failed Generation

As a **user**,
I want **to resume spoke generation if the workflow fails mid-way**,
So that **I don't lose progress or have to start over**.

**Acceptance Criteria:**

**Given** a Cloudflare Workflow fails at spoke 15/25
**When** the failure is detected
**Then** workflow state is persisted with `last_completed_spoke_index: 14`
**And** `hubs.status` is set to "generation_paused"
**And** I see error notification: "Generation paused at 15/25 — tap to resume"

**Given** I return to a Hub with paused generation
**When** I view the Hub details
**Then** I see a banner: "Generation paused at 15/25"
**And** I see "Resume Generation" and "Start Over" buttons
**And** already-generated spokes (1-14) are visible and preserved

**Given** I tap "Resume Generation"
**When** the workflow restarts
**Then** it continues from spoke 16 (not from scratch)
**And** progress tracker shows: "Resuming... 15/25"
**And** workflow uses same generation parameters as original run

**Given** I tap "Start Over"
**When** I confirm the action
**Then** existing spokes (1-14) are deleted
**And** generation starts fresh from spoke 1
**And** I understand this discards previous progress

**Given** a workflow fails 3 times on the same spoke
**When** the third failure occurs
**Then** that spoke is marked as "failed" and skipped
**And** workflow continues to next spoke
**And** I see notification: "1 spoke couldn't be generated — review flagged content"

*[Reverse Engineering Finding: Cloudflare Workflows can fail — need graceful recovery to avoid user frustration]*

---

## Epic 5: Critic Agent - Quality Scoring (Lite)

**User Outcome:** Users see G2/G4/G5 quality scores and actionable feedback on each spoke

**FRs Covered:** FR-1.5.10a-e, FR-1.5.11a-c (8 FRs)

**Note:** Self-Healing Loop deferred to Phase 2

**Architecture Pattern:** Queue-based Critic Scoring

Spoke scoring uses Cloudflare Queues for execution:
1. Generation workflow pushes each spoke to `critic-scoring-queue`
2. Queue consumer processes spokes with rate limiting (10/second)
3. Scores are written to D1 and broadcast via WebSocket to client
4. Queue depth provides backpressure during high volume

This decouples generation from scoring, preventing Workers AI rate limits and enabling graceful handling of scoring backlogs.

*[ADR-003: Queue-based execution chosen over sequential or parallel batch for resilience]*

---

### Story 5.1: G2 Hook Strength Scoring

As a **user**,
I want **each spoke to receive a G2 Hook Strength score (0-100)**,
So that **I know which content has the strongest opening**.

**Acceptance Criteria:**

**Given** a spoke has been generated
**When** the Critic Agent evaluates it
**Then** it scores Hook Strength (G2) based on:
- Pattern interrupt (does it stop the scroll?)
- Curiosity gap (does it create intrigue?)
- Relevance to target audience

**Given** the score is calculated
**When** stored
**Then** `spokes.g2_score` is set (0-100)
**And** `spokes.g2_feedback` contains specific notes

---

### Story 5.2: G4 Brand Voice Alignment

As a **user**,
I want **each spoke to be evaluated for Brand Voice alignment (Pass/Fail)**,
So that **I know if it sounds like me**.

**Acceptance Criteria:**

**Given** a spoke has been generated
**When** the Critic Agent evaluates it against my Brand DNA
**Then** it checks:
- Tone match (formal vs casual vs contrarian)
- Vocabulary usage (signature phrases present?)
- Stance alignment (values reflected?)

**Given** evaluation completes
**When** stored
**Then** `spokes.g4_pass` is true/false
**And** `spokes.g4_feedback` explains pass/fail reason

---

### Story 5.3: G5 Platform Compliance

As a **user**,
I want **each spoke to be checked for Platform Compliance (Pass/Fail)**,
So that **I know it follows platform best practices**.

**Acceptance Criteria:**

**Given** a spoke has been generated
**When** the Critic Agent evaluates platform compliance
**Then** it checks:
- Character limits (Twitter: 280, LinkedIn: 3000)
- Format requirements (carousel has 10 slides, etc.)
- Platform-specific conventions (hashtag usage, etc.)

**Given** evaluation completes
**When** stored
**Then** `spokes.g5_pass` is true/false
**And** `spokes.g5_feedback` lists any violations

---

### Story 5.4: Display Scores in Review Queue

As a **user**,
I want **to see quality scores displayed alongside each spoke**,
So that **I can prioritize my review without cognitive overload**.

**Acceptance Criteria:**

**Given** I am viewing the review queue
**When** spokes are listed
**Then** each spoke card shows by default:
- **Composite Score** as single large number (weighted: G2 × 0.5 + G4_pass × 25 + G5_pass × 25)
- Color coding (green > 70, yellow 50-70, red < 50)
- Simple status: "Ready to post" (all pass) or "Needs attention" (any fail)

**Given** I want more detail on a spoke
**When** I tap the spoke card or "Show Details"
**Then** I see the expanded view with:
- G2 score as number with specific feedback
- G4 badge (checkmark or X) with feedback
- G5 badge (checkmark or X) with feedback

**Given** I prefer to always see detailed scores
**When** I toggle "Show All Scores" in Settings
**Then** the review queue shows G2/G4/G5 individually on all cards
**And** preference is saved for future sessions

*[Occam's Razor: One number is easier to scan than three — composite score as default, details on demand]*

---

### Story 5.5: Flag Low-Scoring Spokes

As a **user**,
I want **spokes scoring below 70 on G2 to be flagged**,
So that **I can give them extra attention**.

**Acceptance Criteria:**

**Given** a spoke has G2 < 70
**When** it appears in the review queue
**Then** it shows a warning indicator
**And** it is grouped in "Needs Review" bucket

**Given** a spoke fails G4 or G5
**When** it appears in the review queue
**Then** it shows the specific failure reason
**And** suggests corrective action

---

### Story 5.6: Actionable Feedback Display

As a **user**,
I want **Critic feedback to be specific and actionable**,
So that **I know how to improve content**.

**Acceptance Criteria:**

**Given** a spoke has feedback
**When** I view the detail panel
**Then** I see constructive suggestions, not just scores:
- "Hook could be stronger. Try starting with a bold statement."
- "Voice alignment low. Consider adding your signature phrase."
- "LinkedIn post is 3,200 chars. Trim to under 3,000."

**Given** feedback is displayed
**When** I edit the spoke
**Then** the feedback remains visible as reference

---

### Story 5.7: Critic Calibration from Approvals

As the **system**,
I want **to use user-approved spokes as positive training examples**,
So that **G4 scoring becomes personalized over time**.

**Acceptance Criteria:**

**Given** a user approves a spoke
**When** the approval is saved
**Then** spoke content is added to client's "approved examples" in Vectorize namespace
**And** embedding is stored with metadata: `{ type: 'approved_example', client_id, spoke_id }`

**Given** the Critic Agent evaluates G4 (Brand Voice Alignment)
**When** it scores a new spoke
**Then** it retrieves the client's approved examples from Vectorize
**And** compares new spoke against approved examples for voice similarity
**And** similarity score influences G4 pass/fail decision

**Given** a client has < 10 approved spokes
**When** G4 scoring runs
**Then** system uses generic brand voice matching (from Brand DNA Report)
**And** displays note: "G4 accuracy improves after 10+ approvals"

**Given** a client has 10+ approved spokes
**When** G4 scoring runs
**Then** personalized calibration is used
**And** G4 accuracy is expected to improve by ~20%

*[Reverse Engineering Finding: Without calibration, G4 is generic — personalization requires learning from approvals]*

---

### Story 5.8: Critic Suggests Specific Rewrites

As a **user**,
I want **the Critic to suggest specific rewrites for low-scoring spokes**,
So that **I know exactly how to improve weak content instead of just seeing a score**.

**Acceptance Criteria:**

**Given** a spoke scores below 70 on G2 (Hook Strength)
**When** I view the feedback
**Then** the Critic provides 2-3 specific rewrite suggestions:
- "Try opening with: 'Most people get this completely wrong...'"
- "Consider a question hook: 'What if everything you know about X is backwards?'"
- "Contrarian angle: 'Unpopular opinion: [stance]'"

**Given** a spoke fails G4 (Brand Voice Alignment)
**When** I view the feedback
**Then** the Critic suggests specific phrases to add or remove:
- "Add your signature phrase: '[phrase from Brand DNA]'"
- "Tone is too formal — consider: '[casual rewrite]'"
- "Missing your contrarian stance — try: '[stance rewrite]'"

**Given** a spoke fails G5 (Platform Compliance)
**When** I view the feedback
**Then** the Critic provides the fix:
- "Tweet is 312 chars — here's a 280-char version: '[trimmed]'"
- "LinkedIn missing hook line — suggested opener: '[hook]'"

**Given** I like a Critic suggestion
**When** I tap "Apply Suggestion"
**Then** the spoke content is updated with the suggested text
**And** the spoke is re-scored automatically
**And** original content is saved in `spokes.revision_history` for comparison

**Given** I want to manually edit instead
**When** I tap "Edit Manually"
**Then** I see the spoke in edit mode with Critic suggestions displayed as reference

*[SCAMPER - Modify: Transform feedback from "what's wrong" to "here's how to fix it"]*

---

## Epic 6: Mobile Review & Native Publish Flow

**User Outcome:** Users can review content on mobile and share directly to platform apps

**FRs Covered:** FR-1.5.12a-e, FR-1.5.13a-e (10 FRs)

**NFRs:** NFR-1.5-P4 (Queue load < 3s), NFR-1.5-P5 (Share sheet < 500ms), NFR-1.5-M4 (44px touch targets), NFR-1.5-M5 (60fps swipe)

---

### Story 6.1: Ready for Review Dashboard

As a **user**,
I want **a mobile-friendly dashboard showing all spokes awaiting review**,
So that **I can manage my content queue**.

**Acceptance Criteria:**

**Given** I open the review queue on mobile
**When** the dashboard loads
**Then** it loads in < 3 seconds (NFR-1.5-P4)
**And** I see a list of spokes with platform badges and scores

**Given** I have multiple Hubs with spokes
**When** I view the queue
**Then** spokes are grouped by Hub with collapsible sections

---

### Story 6.2: Sort by Critic Score

As a **user**,
I want **the queue sorted by Critic score (highest first)**,
So that **I review the best content first**.

**Acceptance Criteria:**

**Given** I am viewing the review queue
**When** default sort is applied
**Then** spokes are sorted by G2 score descending

**Given** I want to change sort order
**When** I tap the sort toggle
**Then** I can sort by: Score (high/low), Platform, Date Created

---

### Story 6.3: Filter by Platform/Hub/Score

As a **user**,
I want **to filter spokes by platform, Hub, or score range**,
So that **I can focus on specific content**.

**Acceptance Criteria:**

**Given** I am viewing the review queue
**When** I tap the filter icon
**Then** I see filter options:
- Platform (Twitter, LinkedIn, TikTok, etc.)
- Hub (list of my Hubs)
- Score range (slider: 0-100)

**Given** I apply filters
**When** the queue updates
**Then** only matching spokes are displayed
**And** filter badge shows active filters

---

### Story 6.4: Mobile Swipe Interface

As a **user**,
I want **to swipe to approve or reject spokes with nuance**,
So that **I can review quickly on mobile while capturing my enthusiasm level**.

**Acceptance Criteria:**

**Given** I am viewing a spoke card on mobile
**When** I swipe right (> 150px on phones, > 100px on tablets)
**Then** the card animates with green flash and slides off
**And** spoke status changes to "approved"

**Given** I swipe right with extra force (> 250px swipe distance)
**When** the gesture completes
**Then** the card animates with gold "star" effect
**And** spoke status changes to "loved" (a stronger signal than "approved")
**And** visual feedback shows "Loved it!" toast
**And** `spokes.reaction` is set to "love" (vs "approve")

**Given** I swipe left (> 150px on phones, > 100px on tablets)
**When** the gesture completes
**Then** the card animates with red flash and slides off
**And** spoke status changes to "rejected"

*[Lessons Learned: "Love it" vs "Approve" captures enthusiasm gradient — helps Critic learn what resonates]*

**Given** I am swiping
**When** the gesture is in progress
**Then** animation runs at 60fps (NFR-1.5-M5)
**And** touch targets are 44px minimum (NFR-1.5-M4)

**Given** I accidentally swipe while scrolling
**When** swipe gesture starts
**Then** system requires 200ms hold before swipe registers
**And** accidental swipes from scroll are ignored

**Given** I complete a swipe action (approve or reject)
**When** the action completes
**Then** an undo toast appears for 5 seconds
**And** I can tap "Undo" to reverse the action
**And** the card returns to its original position

*[War Room Finding #5: 100px threshold too sensitive — add debounce and undo]*

---

### Story 6.5: Estimated Review Time

As a **user**,
I want **to see estimated review time based on queue size**,
So that **I can plan my session**.

**Acceptance Criteria:**

**Given** I have spokes in my review queue
**When** the queue loads
**Then** header shows: "25 spokes • ~8 min to review"
**And** estimate assumes 6 seconds per decision average

---

### Story 6.6: Ready to Post Button

As a **user**,
I want **to tap "Ready to Post" on approved content**,
So that **I can prepare to publish**.

**Acceptance Criteria:**

**Given** I have approved a spoke
**When** I tap "Ready to Post"
**Then** the NativePostHandOff component appears
**And** spoke status changes to "ready_to_post"

---

### Story 6.7: Copy Caption to Clipboard

As a **user**,
I want **to copy the caption text to my clipboard**,
So that **I can paste it in the native app**.

**Acceptance Criteria:**

**Given** I am in the NativePostHandOff view
**When** I tap "Copy Caption"
**Then** caption text is copied via `navigator.clipboard.writeText()`
**And** button shows "Copied!" confirmation
**And** button returns to normal after 2 seconds

---

### Story 6.8: Native Share Sheet Trigger

As a **user**,
I want **to share content via the native OS share sheet**,
So that **I can open the target platform app directly**.

**Acceptance Criteria:**

**Given** I tap "Share to [Platform]"
**When** the share sheet opens
**Then** it triggers in < 500ms (NFR-1.5-P5)
**And** uses `navigator.share()` Web Share API
**And** includes media file (if applicable) from R2 signed URL

**Given** the share sheet is open
**When** I select the target app (Instagram, TikTok, etc.)
**Then** the app opens with content pre-loaded
**And** I can add native features (trending audio, stickers)

---

### Story 6.9: Track Hand-Off Timestamp

As a **user**,
I want **the system to track when I handed off content for posting**,
So that **performance tracking can begin**.

**Acceptance Criteria:**

**Given** I tap "Share to [Platform]"
**When** the share sheet opens
**Then** `spokes.handed_off_at` is set to current timestamp
**And** `spokes.status` changes to "handed_off"

**Given** content has been handed off
**When** I view the spoke later
**Then** I see "Handed off on Dec 30, 2025 at 3:42 PM"

---

### Story 6.10: Share API Fallback

As a **user** on desktop or unsupported browser,
I want **a fallback when native share sheet is unavailable**,
So that **I can still easily post to platforms**.

**Acceptance Criteria:**

**Given** `navigator.share()` is unsupported (Safari desktop, older browsers)
**When** I tap "Share to LinkedIn"
**Then** I see a fallback modal with:
- "Copy Caption" button (copies text to clipboard)
- Platform icon that opens `linkedin.com/feed` in new tab
- Toast: "Caption copied! Paste in LinkedIn"

**Given** I am on a supported mobile browser
**When** I tap "Share to LinkedIn"
**Then** native share sheet opens as normal (Story 6.8)

**Given** share API support is unknown
**When** the component mounts
**Then** it feature-detects `navigator.share` and `navigator.canShare`
**And** conditionally renders native share or fallback UI

**Given** I use the fallback flow
**When** I tap the platform icon
**Then** the platform opens in new tab
**And** caption is already in my clipboard
**And** `spokes.handed_off_at` is still tracked

**Given** native share sheet fails silently (some Android devices)
**When** the share attempt doesn't complete
**Then** error is logged with: device info, browser version, share target
**And** user sees fallback UI after 3-second timeout
**And** error data is aggregated for debugging problematic device/browser combos

*[Pre-mortem: Share failures were silent — users tapped "Share" and nothing happened]*

*[Reverse Engineering Finding: Safari desktop doesn't fully support Web Share API — need fallback for desktop users]*

---

### Story 6.11: Bulk Review Operations

As a **user** with many spokes to review,
I want **to approve or reject multiple spokes at once**,
So that **I can work efficiently through large queues**.

**Acceptance Criteria:**

**Given** I am in the review queue
**When** I tap "Select Mode" (checkbox icon)
**Then** the UI switches to multi-select mode
**And** each spoke card shows a checkbox
**And** I can tap cards to select/deselect them

**Given** I am in select mode with 12 spokes selected
**When** I view the action bar
**Then** I see: "Approve Selected (12)" and "Reject Selected (12)" buttons
**And** buttons are color-coded (green/red)

**Given** I tap "Approve Selected (12)"
**When** the bulk action executes
**Then** all 12 spokes are approved in a single API call
**And** I see success toast: "12 spokes approved"
**And** select mode exits automatically

**Given** I want to select by criteria
**When** I tap the filter dropdown in select mode
**Then** I can "Select All LinkedIn" or "Select All Score > 80"
**And** matching spokes are auto-selected

**Given** I have 50+ spokes in queue
**When** I use bulk operations
**Then** reviewing takes ~2 minutes instead of ~8 minutes
**And** efficiency gain is visible in analytics

*[Reverse Engineering Finding: Reviewing 25+ spokes one-by-one is tedious — bulk operations are essential for power users]*

---

### Story 6.12: Post-Performance Feedback (Manual)

As a **user**,
I want **to manually record how my posted content performed**,
So that **I can learn which spokes resonate with my audience**.

**Acceptance Criteria:**

**Given** I have handed off a spoke for posting (Story 6.9)
**When** I return to view that spoke 24+ hours later
**Then** I see a "How did it perform?" prompt
**And** I can select: "🔥 Great", "👍 Good", "😐 Okay", "👎 Poor"

**Given** I select a performance rating
**When** the rating is saved
**Then** `spokes.performance_rating` is set (1-4 scale)
**And** I can optionally add a note: "Got 50 likes, 10 comments"
**And** rating is linked to the Hub for pattern analysis

**Given** I have rated 10+ spokes from the same Hub
**When** I view Hub analytics
**Then** I see: "Your top-performing spoke types: LinkedIn text posts (avg 3.2/4)"
**And** I see: "Consider more: Contrarian hooks (your best performer)"
**And** patterns help inform future generation

**Given** I have rated spokes across multiple Hubs
**When** I view overall analytics
**Then** I see performance trends by platform, content type, and pillar
**And** Critic Agent can use this data to improve G2 scoring accuracy

*[Pre-mortem: Users had no way to see what worked — no feedback loop to improve]*

---

### Story 6.13: Device-Adaptive Review UI

As a **user**,
I want **the review interface to adapt to my device**,
So that **I get the optimal experience whether on phone, tablet, or desktop**.

**Acceptance Criteria:**

**Given** I am viewing the review queue on a phone (< 768px width)
**When** the UI renders
**Then** I see the swipe-card interface (Story 6.4)
**And** cards are full-width with large touch targets (44px+)
**And** one spoke visible at a time with stack preview behind

**Given** I am viewing the review queue on a tablet (768px - 1024px width)
**When** the UI renders
**Then** I see a 2-column grid of spoke cards
**And** each card has approve/reject buttons (no swipe required)
**And** I can tap cards to expand for detail view

**Given** I am viewing the review queue on desktop (> 1024px width)
**When** the UI renders
**Then** I see a 3-4 column grid of spoke cards
**And** hover states show preview of full content
**And** keyboard shortcuts work: J/K to navigate, A to approve, R to reject, L to love
**And** bulk select mode is prominent (checkbox on each card)

**Given** I switch devices mid-session (e.g., phone to desktop)
**When** I return to the review queue
**Then** my place in the queue is preserved
**And** the UI adapts to the new device automatically
**And** any in-progress review is synced

*[Comparative Analysis: Tinder-style swipe for mobile, Kanban grid for desktop — match mental model to device]*

---

## Epic 7: Agency Owner Dashboard

**User Outcome:** Agency owners can manage clients and view onboarding status

**FRs Covered:** FR-1.5.14a-e (5 FRs)

---

### Story 7.1: View Client List

As an **agency owner**,
I want **to see a list of all my onboarded clients**,
So that **I can manage my roster**.

**Acceptance Criteria:**

**Given** I am logged in as an agency owner
**When** I navigate to the Clients page
**Then** I see a list of all clients associated with my agency
**And** each client shows: Name, Avatar, Last Active date

**Given** I have many clients
**When** the list loads
**Then** it supports pagination or infinite scroll
**And** I can search by client name

---

### Story 7.2: BrandDNA Completion Status

As an **agency owner**,
I want **to see the BrandDNA completion status for each client**,
So that **I know who needs follow-up**.

**Acceptance Criteria:**

**Given** I am viewing the client list
**When** I look at each client row
**Then** I see a status badge:
- "Not Started" (gray)
- "In Progress" (yellow) with % complete
- "Complete" (green)

**Given** a client is "In Progress"
**When** I tap on their row
**Then** I see which BrandDNA phases they've completed:
- [x] Voice Capture
- [x] Audience Discovery
- [ ] Content Strategy
- [ ] Pillars

---

### Story 7.3: Invite New Clients via Email

As an **agency owner**,
I want **to invite new clients via email link**,
So that **I can onboard them easily**.

**Acceptance Criteria:**

**Given** I am on the Clients page
**When** I tap "Invite Client"
**Then** I see a form with:
- Client name
- Client email
- Optional: Welcome message

**Given** I submit the invitation
**When** the system processes it
**Then** an email is sent with a unique signup link
**And** client record is created with `status` = "invited"
**And** invitation appears in my pending invites list

---

### Story 7.4: View Collected Testimonials

As an **agency owner**,
I want **to view all testimonials collected from my clients**,
So that **I can use them for marketing**.

**Acceptance Criteria:**

**Given** I navigate to the Testimonials section
**When** the page loads
**Then** I see a grid of testimonial video thumbnails
**And** each shows: Client name, Date recorded, Permission status

**Given** I tap on a testimonial
**When** the detail view opens
**Then** I can play the video
**And** see full metadata (duration, permission for public use)

---

### Story 7.5: Export Testimonials

As an **agency owner**,
I want **to download/export testimonial videos**,
So that **I can use them in my marketing materials**.

**Acceptance Criteria:**

**Given** I am viewing a testimonial
**When** I tap "Download"
**Then** the video file downloads from R2 signed URL

**Given** I want to export multiple testimonials
**When** I select multiple and tap "Export Selected"
**Then** a ZIP file is generated with all selected videos
**And** ZIP downloads to my device

**Given** any testimonial export occurs
**When** download completes
**Then** export is logged in `testimonial_export_log`:
- `agency_owner_id` who exported
- `testimonial_ids` exported
- `timestamp` of export
- `ip_address` (country only)
**And** log is retained for 2 years for audit purposes

*[Red Team: Testimonial export abuse must be auditable — agency could sell client videos]*

---

### Story 7.6: Self-Serve Client Onboarding Links

As an **agency owner**,
I want **to generate self-serve onboarding links for clients**,
So that **clients can start BrandDNA on their own schedule without me babysitting**.

**Acceptance Criteria:**

**Given** I am on the Clients page
**When** I tap "Generate Onboarding Link"
**Then** the system creates a unique, single-use invite URL
**And** URL uses cryptographically random token (32 bytes, base64url encoded)
**And** token is NOT sequential or guessable (prevents enumeration attacks)
**And** I can copy the link to send via any channel (WhatsApp, Slack, email)

*[Security Audit: Onboarding links must use crypto-random tokens to prevent enumeration]*

**Given** a client clicks the onboarding link
**When** they land on the page
**Then** they see a branded welcome screen: "[Agency Name] Brand Discovery"
**And** they can create an account and begin BrandDNA immediately
**And** their account is automatically linked to my agency

**Given** I have generated multiple onboarding links
**When** I view my "Pending Invites" list
**Then** I see each link with: Created date, Status (unused/used), Client name (if used)
**And** I can expire/delete unused links

*[Focus Group Finding: Marcus Chen needs clients to self-serve without blocking on his availability]*

---

### Story 7.7: Client Progress Dashboard

As an **agency owner**,
I want **to see a dashboard showing all clients' real-time progress through BrandDNA**,
So that **I can proactively follow up with stuck clients**.

**Acceptance Criteria:**

**Given** I navigate to the Agency Dashboard
**When** the page loads
**Then** I see a progress overview:
- Clients Not Started (count + list)
- Clients In Progress (count + list with % complete)
- Clients Complete (count + list)

**Given** a client has been "In Progress" for > 7 days
**When** I view the dashboard
**Then** they are flagged with a "Needs Nudge" indicator
**And** I can tap to send a reminder email directly from the dashboard

**Given** I want to see detailed progress for a specific client
**When** I tap on their row
**Then** I see which BrandDNA phases they've completed with timestamps:
- [x] Voice Capture (Dec 28, 2:30 PM)
- [x] Audience Discovery (Dec 28, 3:15 PM)
- [ ] Content Strategy (not started)
**And** I see time spent on each phase

*[Focus Group Finding: Sarah Park (Client) gets frustrated when agency doesn't follow up — agency needs visibility to be proactive]*

---

### Story 7.8: Proxy BrandDNA Completion

As an **agency owner**,
I want **to complete BrandDNA sessions on behalf of clients who won't engage**,
So that **client onboarding doesn't stall indefinitely**.

**Acceptance Criteria:**

**Given** a client hasn't started BrandDNA after 14 days
**When** I view their profile
**Then** I see a "Complete for Client" button with a warning: "This will use your inputs, not the client's voice."

**Given** I tap "Complete for Client"
**When** I confirm the action
**Then** client receives email: "Your agency wants to help complete your brand profile. Allow this? [Yes] [No]"
**And** proxy action is blocked until client responds or 48 hours pass

*[Round Table: Marcus Chen concerned clients might hate proxy completion — require consent first]*

**Given** client consents (or 48 hours pass with no response)
**When** I proceed with proxy completion
**Then** I enter the BrandDNA session as a proxy
**And** all inputs are clearly marked as "Submitted by Agency" in the database
**And** consent status is recorded: "explicit" or "implicit (timeout)"
**And** client receives notification: "Your agency has started your brand profile. Review and make it yours!"

**Given** the proxy session is complete
**When** the client logs in
**Then** they see the completed Brand DNA with a banner: "Your agency created this draft. Tap to review and personalize."
**And** they can approve, edit, or re-record voice samples

**Given** the client edits proxy-created content
**When** they save changes
**Then** the content is marked as "Client Verified"
**And** agency owner sees the verification status

*[Focus Group Finding: Marcus Chen can't wait forever for clients to self-serve — needs a fallback that keeps projects moving]*

---

### Story 7.9: Automated Nudge Emails

As an **agency owner**,
I want **stuck clients to receive automatic reminder emails**,
So that **I don't have to manually track and nudge every client**.

**Acceptance Criteria:**

**Given** a client hasn't made progress in 3 days
**When** the daily cron job runs (Cloudflare Cron Trigger)
**Then** the client receives a friendly reminder email:
- Subject: "Your brand story is waiting..."
- Body: Personalized with client name, progress %, and direct link to continue
**And** `clients.last_nudge_sent_at` is updated

**Given** a client hasn't made progress in 7 days
**When** the weekly nudge fires
**Then** the agency owner is CC'd on the email
**And** email tone is slightly more urgent: "We noticed you haven't continued..."

**Given** a client hasn't made progress in 14 days
**When** the 14-day nudge fires
**Then** agency owner receives a separate alert: "[Client Name] may need a phone call"
**And** client receives final automated nudge with option to schedule a call

**Given** a client completes BrandDNA
**When** status changes to "complete"
**Then** all scheduled nudges are cancelled
**And** no further reminders are sent

**Given** a client opts out of reminders
**When** they click "Stop reminding me" in email footer
**Then** `clients.nudge_opt_out` is set to true
**And** no further automated emails are sent
**And** agency owner is notified of opt-out

*[Reverse Engineering Finding: Marcus shouldn't manually check daily — automation handles the nagging]*

---

## Epic 8: Testimonial Collection

**User Outcome:** System captures private wins and testimonials at strategic moments

**FRs Covered:** FR-1.5.15a-e, FR-1.5.16a-e, FR-1.5.17a-d (14 FRs)

**NFRs:** NFR-1.5-M3 (Video recording on mobile), NFR-1.5-D2 (Permission tracking)

---

### Story 8.1: Victory Video Capture (Unified)

As a **user**,
I want **to optionally capture a "Victory Video" at milestone moments**,
So that **I can preserve my excitement without friction**.

*[Occam's Razor: Four separate video stories consolidated into one unified flow]*

**Acceptance Criteria:**

**Trigger Points:**

**Given** I complete the BrandDNA session (Epic 3 complete)
**When** the completion screen appears
**Then** I see a celebratory animation and optional prompt: "Capture this moment? (30 sec video, just for you)"
**And** "Skip" button is equally prominent as "Record"

**Given** I approve my first batch of 10+ spokes
**When** the success screen appears
**Then** I see the same optional Victory Video prompt

**Recording Flow:**

**Given** I tap "Record"
**When** the VideoRecorder component activates
**Then** it uses `getUserMedia` API with front-facing camera default
**And** recording is limited to 30 seconds (not 5 minutes — keeps it light)
**And** works on iOS Safari 15+ and Android Chrome 90+ (NFR-1.5-M3)
**And** I see a countdown timer: "30... 29... 28..."

**Given** I finish recording (or 30 seconds elapse)
**When** I see the preview
**Then** I have exactly two options: "Save" or "Re-record"
**And** there is no option to trim/edit (keeps it simple)

**Upload & Storage:**

**Given** I tap "Save"
**When** upload begins
**Then** video is compressed client-side (target: < 5MB for 30 sec)
**And** uses resumable upload for reliability
**And** upload progress is shown

**Given** upload completes
**When** video is stored
**Then** it goes to R2: `/victory-videos/{client_id}/{date}.webm`
**And** record created in `videos` table (type: "victory", is_public: false)

**Security:**

**Given** video upload is received
**When** server-side validation runs
**Then** it validates: magic bytes (video/*), size < 10MB, duration < 60 seconds
**And** invalid files are rejected with clear error

*[Security Audit: Video uploads need same validation as audio]*

**Skip Behavior:**

**Given** I see the Victory Video prompt
**When** I tap "Skip"
**Then** prompt dismisses instantly with no guilt-trip messaging
**And** no follow-up prompts for 7 days
**And** skip is not logged as negative signal

**Viewing Later:**

**Given** I have recorded Victory Videos
**When** I navigate to Settings > My Milestones
**Then** I see a timeline of my Victory Videos
**And** I can play any video privately
**And** I can delete any video permanently

---

### Story 8.5: Testimonial Request After Batch Approval (Merged with Feedback)

As a **user**,
I want **the agent to ask for a testimonial when I'm feeling positive about results**,
So that **my enthusiasm is captured at the optimal moment**.

**Acceptance Criteria:**

**Given** I approve my first batch of 10+ spokes
**When** the batch is saved
**Then** the agent first asks: "How are you feeling about this batch?" with options:
- "Excited to post these!"
- "They're solid"
- "Need some work"

**Given** I select "Excited to post these!"
**When** my enthusiasm is detected
**Then** the agent prompts: "Your energy is contagious! Would you capture a quick testimonial to help others discover this?"
**And** testimonial request feels like a natural follow-up, not an interruption

**Given** I select "They're solid" or "Need some work"
**When** sentiment is lukewarm or negative
**Then** agent says: "Thanks for the feedback! We'll ask again when you're feeling great about a batch."
**And** testimonial request is deferred (not shown)
**And** `clients.testimonial_ask_deferred_until` is set to next batch

**Given** I see the testimonial request (after positive sentiment)
**When** I read it
**Then** the request is transparent and respectful
**And** explains how testimonials help other creators

*[SCAMPER - Combine: Merge sentiment check + testimonial request into single flow — only ask when user is genuinely happy]*

---

### Story 8.6: Accept/Decline/Later Options

As a **user**,
I want **to accept, decline, or defer the testimonial request**,
So that **I control my participation**.

**Acceptance Criteria:**

**Given** I see the testimonial request
**When** I tap "Sure, I'll share"
**Then** the VideoRecorder component activates for testimonial

**Given** I tap "No thanks"
**When** the prompt dismisses
**Then** `testimonials.declined_at` is set for tracking
**And** I am not asked again for 30 days

**Given** I tap "Ask me later"
**When** the prompt dismisses
**Then** I am reminded after my next batch approval

---

### Story 8.7: Record Testimonial Video

As a **user**,
I want **to record my testimonial video**,
So that **I can share my experience**.

**Acceptance Criteria:**

**Given** I accept the testimonial request
**When** the VideoRecorder activates
**Then** I see suggested prompts:
- "What was your biggest challenge before?"
- "How has this changed your content workflow?"
- "What would you tell someone considering this?"

**Given** I record my testimonial
**When** I save it
**Then** video is uploaded to R2: `/testimonials/{client_id}/{date}.webm`

---

### Story 8.8: Permission for Public Use

As a **user**,
I want **to explicitly grant permission for public use of my testimonial**,
So that **my consent is clear**.

**Acceptance Criteria:**

**Given** I have recorded a testimonial
**When** I see the permission screen
**Then** I can choose:
- "Yes, you can share this publicly"
- "Private only – don't share"

**Given** I grant public permission
**When** saved
**Then** `testimonials.is_public` = true
**And** `testimonials.permission_granted_at` = current timestamp
**And** explicit opt-in is recorded (NFR-1.5-D2)

---

### Story 8.9: Testimonial Metadata Storage

As the **system**,
I want **testimonials stored with complete metadata**,
So that **agency owners can manage them**.

**Acceptance Criteria:**

**Given** a testimonial is saved
**When** the record is created
**Then** `testimonials` table includes:
- `id` (UUID)
- `client_id` foreign key
- `type` ("private_win" | "testimonial")
- `r2_key` (path to video)
- `is_public` (boolean)
- `permission_granted_at` (timestamp or null)
- `declined_at` (timestamp or null)
- `created_at` (timestamp)

---

### Story 8.10: Agency Owner View Testimonials

As an **agency owner**,
I want **to view all testimonials from my clients**,
So that **I can use them for marketing**.

**Acceptance Criteria:**

**Given** I navigate to Testimonials in Agency Dashboard
**When** the page loads
**Then** I see testimonials with public permission highlighted
**And** private testimonials are hidden or clearly marked

**Given** I filter by "Public Only"
**When** the filter applies
**Then** I only see testimonials with `is_public` = true

---

### Story 8.11: Download Testimonial Videos

As an **agency owner**,
I want **to download testimonial videos**,
So that **I can use them in marketing materials**.

**Acceptance Criteria:**

**Given** I am viewing a public testimonial
**When** I tap "Download"
**Then** video downloads from R2 via signed URL

**Given** I select multiple testimonials
**When** I tap "Download Selected"
**Then** a ZIP file is generated and downloads

---

## Epic 9: Compliance & Data Privacy

**User Outcome:** Users have control over their data and the system meets GDPR/privacy requirements

**FRs Covered:** New requirements from Focus Group (GDPR compliance)

**NFRs:** NFR-1.5-D1 (Encryption), NFR-1.5-D2 (Permission tracking), NFR-1.5-D3 (Data isolation)

---

### Story 9.1: Data Deletion Request (GDPR Right to Erasure)

As a **user**,
I want **to request complete deletion of my data**,
So that **I can exercise my GDPR "right to be forgotten"**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to Settings > Privacy
**When** I tap "Request Data Deletion"
**Then** I see a confirmation screen explaining:
- What data will be deleted (voice recordings, Brand DNA, testimonials, spokes)
- That deletion is permanent and cannot be undone
- That it may take up to 30 days to complete

**Given** I confirm the deletion request
**When** I provide my password for verification
**Then** a deletion request record is created with status "pending"
**And** I receive an email confirmation with request ID
**And** system queues deletion job via Cloudflare Queue

**Given** the deletion job runs
**When** it processes my account
**Then** it deletes:
- All R2 objects under `/voice-notes/{client_id}/`, `/testimonials/{client_id}/`, `/brand-samples/{client_id}/`
- All D1 records with my `client_id` (brand_dna_sessions, audience_personas, content_pillars, spokes, etc.)
- All Vectorize embeddings in my client namespace
**And** account is marked as "deleted" (soft delete for audit trail)
**And** I receive confirmation email when complete

**Given** deletion completes successfully
**When** the job finishes
**Then** system generates a "Deletion Certificate" (PDF):
- Request ID and timestamp
- List of data categories deleted
- Confirmation that deletion is complete
- Digital signature for authenticity
**And** certificate is emailed to user
**And** certificate copy retained for 7 years (legal compliance)

*[Security Audit: Deletion certificate provides proof for audit defense]*

**Given** I am an agency-owned client
**When** I request deletion
**Then** the agency owner is notified
**And** deletion proceeds after 7-day grace period (agency can export data first)

*[Focus Group Finding: David Chen (Compliance Officer) — GDPR Article 17 requires right to erasure]*

---

### Story 9.2: Consent Version Tracking

As the **system**,
I want **to track which version of terms/privacy policy users consented to**,
So that **we have audit trail for compliance**.

**Acceptance Criteria:**

**Given** a user signs up or logs in
**When** they accept terms of service
**Then** a record is created in `consent_log` table:
- `user_id` foreign key
- `consent_type` ("terms_of_service" | "privacy_policy" | "testimonial_public_use")
- `version` (e.g., "2025-12-30-v1")
- `country_code` (derived from IP via Cloudflare headers, NOT raw IP)
- `user_agent` (truncated to browser family only)
- `consented_at` timestamp

*[Security Audit: IP addresses are PII under GDPR — log only country/region]*

**Given** we update the terms of service
**When** a returning user logs in
**Then** they are prompted to accept the new version
**And** a new consent record is created
**And** old consent record remains for audit trail

**Given** a user grants testimonial permission (Story 8.8)
**When** they tap "Yes, you can share this publicly"
**Then** explicit consent is logged:
- `consent_type` = "testimonial_public_use"
- `version` = current consent version
- `consented_at` = current timestamp
**And** this record satisfies GDPR Article 7 (explicit opt-in for sensitive data)

**Given** an auditor or legal request requires consent proof
**When** they query `consent_log` for a user
**Then** they can see complete history of all consents with timestamps

*[Focus Group Finding: David Chen (Compliance Officer) — Must track consent versions for audit defense]*

---

### Story 9.3: Secure Asset URLs

As the **system**,
I want **all R2 asset URLs to be time-limited and signed**,
So that **testimonial videos and sensitive content can't be accessed indefinitely**.

**Acceptance Criteria:**

**Given** an agency owner requests a testimonial download
**When** the download URL is generated
**Then** it uses R2 signed URL with 24-hour expiration
**And** URL includes cryptographic signature preventing tampering
**And** URL is logged in `asset_access_log` for audit trail

**Given** a user requests their own voice recording playback
**When** the playback URL is generated
**Then** URL expires after 1 hour (shorter for sensitive content)
**And** URL includes `client_id` validation in the signature

**Given** someone tries to access an expired URL
**When** the request hits R2
**Then** R2 returns 403 Forbidden
**And** response includes message: "Link expired — request a new download"

**Given** someone tries to modify the URL to access another client's assets
**When** the tampered URL is used
**Then** signature validation fails
**And** request is rejected with 403
**And** attempt is logged as potential security event

**Given** a video is shared via native share sheet (Story 6.8)
**When** the share is initiated
**Then** a temporary signed URL is generated (valid 10 minutes)
**And** URL works long enough for share to complete
**And** URL expires shortly after, preventing forwarded link abuse

*[Reverse Engineering Finding: R2 assets need time-limited URLs — perpetual links are a security risk for sensitive testimonials]*

---

### Story 9.4: GDPR Data Export (Right to Portability)

As a **user**,
I want **to export all my data in a portable format**,
So that **I can exercise my GDPR "right to data portability" (Article 20)**.

**Acceptance Criteria:**

**Given** I am logged in and navigate to Settings > Privacy
**When** I tap "Export My Data"
**Then** I see an explanation: "We'll prepare a ZIP file with all your data. This may take a few minutes."

**Given** I confirm the export request
**When** the export job runs
**Then** it collects:
- Brand DNA Report (JSON + PDF)
- All voice recordings (original audio files)
- Audience personas (JSON)
- Content pillars (JSON)
- All generated spokes (JSON with platform metadata)
- Testimonials I recorded (video files)
- Consent history (JSON)

**Given** the export completes
**When** files are ready
**Then** I receive email with secure download link (24h expiry)
**And** ZIP file is structured with clear folder hierarchy
**And** JSON files use standard formats for interoperability

**Given** I am an agency client
**When** I export my data
**Then** only MY data is exported (not agency's other clients)
**And** agency relationship metadata is included

*[Round Table: Legal Leo — GDPR Article 20 requires data portability, not just deletion]*

---

### Story 9.5: Admin Action Audit Log

As a **system administrator**,
I want **all administrative actions to be logged**,
So that **we have audit trail for security and compliance**.

**Acceptance Criteria:**

**Given** an agency owner accesses a client's data
**When** they view Brand DNA, testimonials, or other client content
**Then** access is logged in `admin_audit_log`:
- `actor_id` (who performed action)
- `action_type` (view, export, delete, modify)
- `target_type` (client, testimonial, brand_dna, etc.)
- `target_id` (specific record accessed)
- `timestamp`
- `country_code` (from Cloudflare headers)

**Given** an agency owner exports client testimonials
**When** export completes
**Then** audit log records: `action_type: 'export'`, `target_type: 'testimonial'`

**Given** a security incident is suspected
**When** administrators query the audit log
**Then** they can filter by: actor, action type, target, date range
**And** logs are retained for 2 years

**Given** a user requests their audit trail (GDPR access request)
**When** we query logs for their `target_id`
**Then** we can show all actions taken on their data

*[Security Audit: Admin actions must be auditable — who accessed what and when]*

---

## Epic 10: Operations & Resilience

**User Outcome:** System is observable, resilient to failures, and protected from abuse

**FRs Covered:** Operational requirements from Round Table, Failure Mode Analysis, Red Team

**NFRs:** System reliability, observability, rate limiting

**Priority:** P2 (Operations foundation for production readiness)

---

### Story 10.1: Observability and Alerting

As a **DevOps engineer**,
I want **comprehensive monitoring and alerting for all system components**,
So that **I know when things break before users complain**.

**Acceptance Criteria:**

**Given** the system is deployed
**When** any component fails or degrades
**Then** metrics are emitted to Cloudflare Analytics:
- Worker invocation success/error rates
- Durable Object hibernation/wake cycles
- Queue depth and processing latency
- D1 query latency percentiles
- R2 upload success/failure rates

**Given** error rate exceeds threshold (> 1% over 5 minutes)
**When** the alert triggers
**Then** notification is sent via:
- Cloudflare Notifications (email)
- Optional: Webhook to Slack/Discord

**Given** queue depth exceeds threshold (> 1000 messages)
**When** backpressure builds
**Then** alert fires: "Critic scoring queue backed up"
**And** dashboard shows queue depth trend

**Given** I want to debug a specific user issue
**When** I query logs
**Then** I can trace a request through: Worker → DO → Queue → D1
**And** logs include correlation ID for request tracing

*[Round Table: DevOps Dana — No observability story means we're flying blind]*

---

### Story 10.2: Dead-Letter Queue Handling

As the **system**,
I want **failed queue messages to be captured and retried**,
So that **transient failures don't lose user data**.

**Acceptance Criteria:**

**Given** a queue consumer fails to process a message
**When** the failure occurs
**Then** message is retried 3 times with exponential backoff (1s, 5s, 30s)

**Given** a message fails all 3 retries
**When** final failure occurs
**Then** message is moved to dead-letter queue (DLQ)
**And** alert fires: "Message moved to DLQ"
**And** message metadata is logged for debugging

**Given** messages are in the DLQ
**When** an administrator reviews them
**Then** they can see: original message, error details, retry count
**And** they can "Replay" to retry processing
**And** they can "Discard" if message is unrecoverable

**Given** DLQ has > 100 messages
**When** threshold is exceeded
**Then** escalation alert fires: "DLQ backlog requires attention"

*[Failure Mode Analysis: Queue consumer crashes lose messages — need DLQ]*

---

### Story 10.3: Per-Client Rate Limiting

As the **system**,
I want **per-client rate limits on resource-intensive operations**,
So that **one client can't overwhelm the system**.

**Acceptance Criteria:**

**Given** a client creates Hubs
**When** they exceed 10 Hubs per day
**Then** creation is blocked with: "Daily Hub limit reached. Try again tomorrow."
**And** limit is enforced via sliding window in D1

**Given** a client triggers spoke generation
**When** they have > 5 active generation jobs
**Then** new jobs are queued (not rejected)
**And** they see: "Generation queued — 2 jobs ahead of you"

**Given** a client sends excessive API requests
**When** they exceed 100 requests/minute
**Then** requests are rate-limited with 429 response
**And** rate limit header shows reset time
**And** excessive requests are logged for abuse detection

**Given** an agency owner has many clients
**When** aggregate usage is calculated
**Then** limits are per-client, not per-agency
**And** one client's abuse doesn't affect others

*[Red Team: Hub creation flooding could overwhelm system — need per-client limits]*
