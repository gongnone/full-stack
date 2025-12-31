---
documentType: prd-addendum
parentDocument: prd.md
phase: "1.5"
codename: "Minimum Viable Foundry"
status: approved
createdAt: '2025-12-30'
approvedAt: '2025-12-30'
author: 'Williamshaw'
approvedBy: 'Williamshaw'
timeline: '8 weeks'
---

# PRD Phase 1.5: Minimum Viable Foundry (MVF)

**Author:** Williamshaw
**Date:** 2025-12-30
**Parent Document:** [prd.md](./prd.md) - The Agentic Content Foundry
**Timeline:** 8 Weeks

---

## Document Purpose

This addendum extends the original PRD ("The Agentic Content Foundry") with the **strategic layer** required to operationalize the content engine. While the parent PRD defines the deterministic Hub-and-Spoke production engine, this document defines **how users discover their Brand DNA** and **why the content generated will resonate with their audience**.

**Relationship to Parent PRD:**
- **Parent PRD** = The Engine (Hub-and-Spoke, Adversarial Quality Gate, Kill Chain)
- **This Addendum** = The GPS & Fuel (Brand DNA discovery, Content Strategy, Strategic Alignment)

Without this strategic layer, the engine produces high-volume content without strategic direction. With it, the engine produces **300+ pieces/month that users actually want to make** because they're aligned with their authentic brand voice, target audience, and market positioning.

---

## Executive Summary

### The Problem We're Solving

The original PRD's Hub-and-Spoke engine can mechanically fracture content at scale, but it assumes users arrive with a clear "Source of Truth." In reality:

1. **Agency Owners** need a repeatable onboarding process for their clients
2. **Clients** don't know their authentic brand voice until it's extracted from them
3. **Content fails** when it doesn't align with audience psychology and platform expectations

The **Minimum Viable Foundry (MVF)** solves this by adding the **BrandDNA Agent** - an agentic conversation that extracts the strategic foundation before any content is generated.

### The B2B2C Business Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOUNDRY REVENUE ENGINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FOUNDRY                                                         │
│     │ sells to                                                   │
│     ▼                                                            │
│  AGENCY OWNERS (B2B customers)                                   │
│     │ onboard their                                              │
│     ▼                                                            │
│  CLIENTS (End users on mobile)                                   │
│     │ complete                                                   │
│     ▼                                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BRANDDNA AGENT (Deep Research)                           │   │
│  │  • Voice capture (2-min recording)                        │   │
│  │  • Audience deep-dive                                     │   │
│  │  • Platform prioritization                                │   │
│  │  • Strategy definition & pillar approval                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│     │ produces                                                   │
│     ▼                                                            │
│  CONTENT PEOPLE ACTUALLY WANT TO MAKE                            │
│     │ which gets them                                            │
│     ▼                                                            │
│  ATTENTION & RESULTS                                             │
│     │ which means                                                │
│     ▼                                                            │
│  AGENCY OWNERS GET PAID (client retention)                       │
│     │ which means                                                │
│     ▼                                                            │
│  FOUNDRY GETS RECURRING REVENUE                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Critical Insight:** The BrandDNA Agent isn't just onboarding - it's the **value creation engine**. If it doesn't deeply understand the user's voice, audience, and strategy, the content won't resonate, they won't post it, and the entire value chain breaks.

### The 8-Week MVF Scope

| Weeks | Sprints | Deliverable |
|-------|---------|-------------|
| 1-3 | 1 & 2 | BrandDNA Agent + Content Strategy Engine |
| 4-5 | 3 & 4 | Hub-and-Spoke Content Generation |
| 6-8 | 5 & 7 Lite | Critic Agent (Scoring) + Mission Control Dashboard |

**8-Week Value Proposition:** A user can define their brand strategy, upload one piece of long-form content, and receive a list of 20+ quality-scored, platform-specific drafts on their phone, ready to be posted natively.

---

## Success Criteria

### North Star: Testimonials from Real Users

**MANDATORY ACCEPTANCE CRITERIA:** The BrandDNA Agent experience must be polished enough that Agency Owners can showcase it to clients and collect testimonials.

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Testimonial Collection Rate** | > 30% of completed BrandDNA sessions | Proves the experience is valuable enough to recommend |
| **BrandDNA Completion Rate** | > 70% of started sessions | Users find the process engaging, not tedious |
| **Zero-Edit Rate (Day 1)** | > 50% on first Hub | Strategy alignment is working |
| **Time-to-First-Content** | < 60 minutes from signup | "Fast to value" experience |

### Business Success Metrics

| Metric | 8-Week Target | Signal |
|--------|---------------|--------|
| **Agency Onboards** | 5 agency owners in pilot | Market interest validation |
| **Clients per Agency** | 3+ clients onboarded per agency | B2B2C model working |
| **Testimonials Collected** | 15+ video testimonials | Social proof for marketing |
| **Mobile Usage Rate** | > 60% of review sessions on mobile | Mobile-first UX working |

---

## Phase 1.5 Feature Requirements

### Sprint 1 & 2: BrandDNA Agent + Content Strategy Engine (Weeks 1-3)

#### Overview

The BrandDNA Agent is an **agentic conversation** that guides users through defining their brand foundation. Unlike a static form, the Agent asks dynamic follow-up questions based on user responses.

**Technical Architecture:**
- **BrandDNAAgent** extends Cloudflare `Agent` class (Durable Object)
- Per-client instance with SQLite state (`this.sql`)
- WebSocket connection for real-time UI updates
- Structured JSON responses that render as interactive UI components

#### Feature Requirements

##### FR-1.5.1: Voice Capture & Analysis

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.1a** | Users can record a 2-minute voice note describing their brand on mobile | P0 |
| **FR-1.5.1b** | System transcribes voice note using Workers AI Whisper integration | P0 |
| **FR-1.5.1c** | System extracts tone, vocabulary, and personality markers from transcription | P0 |
| **FR-1.5.1d** | Users can re-record if not satisfied with initial capture | P0 |
| **FR-1.5.1e** | Users can optionally upload existing content (blogs, videos, social posts) for analysis | P1 |
| **FR-1.5.1f** | System analyzes uploaded content to enhance voice profile | P1 |

**Acceptance Criteria:**
- [ ] Voice recording works on iOS Safari and Android Chrome
- [ ] Transcription completes in < 30 seconds for 2-minute audio
- [ ] Extracted voice markers are stored in `client.voice_markers` table
- [ ] User can view a summary of detected personality traits

##### FR-1.5.2: Audience Deep Dive

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.2a** | Agent asks structured questions about target audience demographics | P0 |
| **FR-1.5.2b** | Agent asks about audience pain points and aspirations (psychographics) | P0 |
| **FR-1.5.2c** | Agent asks about audience content consumption habits | P0 |
| **FR-1.5.2d** | System generates audience persona(s) from user input | P0 |
| **FR-1.5.2e** | Users can review and approve/edit generated personas | P0 |

**Acceptance Criteria:**
- [ ] Minimum 5 questions asked about audience
- [ ] Persona includes: name, demographics, pain points, aspirations, preferred platforms
- [ ] Persona stored in `client.audience_personas` table
- [ ] UI displays persona as visual card with key attributes

##### FR-1.5.3: Competitor Analysis Input

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.3a** | Users can list 2-3 competitors they admire or want to differentiate from | P1 |
| **FR-1.5.3b** | Agent explains how competitor analysis will inform gap identification | P1 |
| **FR-1.5.3c** | System uses RAG to pull market research insights on listed competitors | P2 |
| **FR-1.5.3d** | System identifies "gaps" - what's missing that the user can own | P2 |

**Acceptance Criteria:**
- [ ] Competitor URLs or names stored in `client.competitors` table
- [ ] Gap analysis surfaced during pillar proposal (Sprint 2)

##### FR-1.5.4: Platform Prioritization

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.4a** | Agent recommends 2-3 primary platforms based on audience analysis | P0 |
| **FR-1.5.4b** | Agent recommends 2-3 secondary platforms with rationale | P0 |
| **FR-1.5.4c** | Users can adjust platform priorities before confirmation | P0 |
| **FR-1.5.4d** | Users can specify preferred content mediums (video, written, audio, visual) | P0 |
| **FR-1.5.4e** | Agent proposes realistic posting cadence per platform | P1 |

**Acceptance Criteria:**
- [ ] Platform recommendations include clear rationale
- [ ] User can drag-and-drop to reorder platform priority
- [ ] Final platform selection stored in `client.platform_strategy` table

##### FR-1.5.5: Topic Pillar Proposal

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.5a** | Agent proposes 3-5 content topic pillars aligned with Brand Story Framework | P0 |
| **FR-1.5.5b** | Each pillar includes rationale based on voice analysis and competitive gaps | P0 |
| **FR-1.5.5c** | Users can approve, edit, or regenerate individual pillars | P0 |
| **FR-1.5.5d** | System stores approved pillars as foundation for Hub generation | P0 |

**Acceptance Criteria:**
- [ ] Pillars reference Catalyst (origin story), Core Truth (fundamental belief), and Proof (evidence)
- [ ] Each pillar card shows: title, description, rationale, "Regenerate" button
- [ ] Approved pillars stored in `client.content_pillars` table

##### FR-1.5.6: Brand DNA Report

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.6a** | System generates comprehensive Brand DNA Report upon session completion | P0 |
| **FR-1.5.6b** | Report includes: detected tone, vocabulary, banned words, required phrases, stances | P0 |
| **FR-1.5.6c** | Report displays "Brand DNA Strength" score (0-100%) | P0 |
| **FR-1.5.6d** | Users can export Brand DNA Report as PDF | P1 |

**Acceptance Criteria:**
- [ ] Report generated in < 2 minutes after session completion
- [ ] Report visually displays all captured elements
- [ ] Brand DNA Strength score > 70% indicates "ready for content generation"

---

### Sprint 3 & 4: Hub-and-Spoke Content Generation (Weeks 4-5)

#### Overview

With Brand DNA captured, users can now upload their "Source of Truth" and generate platform-specific content. This implements the core Hub-and-Spoke engine from the parent PRD, now informed by the strategic layer.

#### Feature Requirements

##### FR-1.5.7: Source of Truth Upload

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.7a** | Users can upload long-form content (video transcript, article, outline) | P0 |
| **FR-1.5.7b** | Users can paste raw text as Source of Truth | P0 |
| **FR-1.5.7c** | System processes upload and displays key themes extracted | P0 |
| **FR-1.5.7d** | Users can highlight "golden nugget" sections for emphasis (optional) | P1 |

**Acceptance Criteria:**
- [ ] Supports PDF, TXT, and pasted text
- [ ] Processing completes in < 30 seconds
- [ ] Extracted themes displayed for user confirmation

##### FR-1.5.8: Spoke Generation

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.8a** | System generates 20+ platform-specific content pieces from one Hub | P0 |
| **FR-1.5.8b** | Generation respects user's platform priorities and content medium preferences | P0 |
| **FR-1.5.8c** | Each spoke is adapted to platform-specific formatting and tone | P0 |
| **FR-1.5.8d** | Progress tracker shows real-time generation status | P0 |
| **FR-1.5.8e** | Generation informed by approved content pillars from BrandDNA session | P0 |

**Acceptance Criteria:**
- [ ] Minimum 20 spokes generated per Hub
- [ ] Spokes include: Tweets, LinkedIn posts, short video scripts, carousel outlines
- [ ] Each spoke references the originating Hub and pillar
- [ ] Generation completes in < 60 seconds for 20 spokes

##### FR-1.5.9: Platform-Native Formatting

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.9a** | Twitter/X posts respect 280 character limit with punchy hooks | P0 |
| **FR-1.5.9b** | LinkedIn posts use professional but authentic tone, up to 3000 chars | P0 |
| **FR-1.5.9c** | TikTok/Reels scripts include hook-in-3-seconds structure | P0 |
| **FR-1.5.9d** | Carousel outlines provide 10-slide structure with progressive reveal | P1 |

**Acceptance Criteria:**
- [ ] Each platform type has validated formatting rules
- [ ] No spoke exceeds platform character/format limits

---

### Sprint 5 Lite: Critic Agent (Scoring Only) (Weeks 6-7)

#### Overview

Instead of the full self-healing adversarial loop (deferred to Phase 2), the MVP Critic Agent provides **quality scoring** on generated content. This gives users confidence in what to approve.

#### Feature Requirements

##### FR-1.5.10: Quality Scoring

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.10a** | Critic Agent scores each spoke on Hook Strength (G2, 0-100) | P0 |
| **FR-1.5.10b** | Critic Agent evaluates Brand Voice Alignment (G4, Pass/Fail) | P0 |
| **FR-1.5.10c** | Critic Agent evaluates Platform Compliance (G5, Pass/Fail) | P0 |
| **FR-1.5.10d** | Scores and feedback displayed alongside each spoke in review queue | P0 |
| **FR-1.5.10e** | Spokes scoring below threshold (< 70 on G2) are flagged for attention | P0 |

**Acceptance Criteria:**
- [ ] All generated spokes have G2, G4, G5 scores
- [ ] Scores visible in review interface
- [ ] Flagged spokes clearly marked with warning indicator

##### FR-1.5.11: Critic Feedback Display

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.11a** | Each spoke displays Critic's specific feedback (e.g., "Hook needs more intrigue") | P0 |
| **FR-1.5.11b** | Users can view detailed breakdown of score components | P1 |
| **FR-1.5.11c** | Feedback is actionable and educational for users | P0 |

**Acceptance Criteria:**
- [ ] Feedback text is < 100 characters per point
- [ ] Feedback references specific elements (hook, tone, length)

---

### Sprint 7 Lite: Mission Control Dashboard (Weeks 7-8)

#### Overview

A focused dashboard that enables users to review, approve, and prepare content for native posting. Mobile-first design is critical for the "Executive Producer" workflow.

#### Feature Requirements

##### FR-1.5.12: Ready for Review Queue

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.12a** | Dashboard displays all generated spokes awaiting user review | P0 |
| **FR-1.5.12b** | Queue sorted by Critic score (highest first) | P0 |
| **FR-1.5.12c** | Filter by platform, Hub, or score range | P0 |
| **FR-1.5.12d** | Mobile-friendly swipe interface for approve/reject | P0 |
| **FR-1.5.12e** | Estimated review time displayed based on queue size | P1 |

**Acceptance Criteria:**
- [ ] Queue loads in < 3 seconds
- [ ] Swipe gestures work on touch devices
- [ ] Filter/sort state persisted in session

##### FR-1.5.13: Publish to Native Workflow

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.13a** | Users can tap "Ready to Post" on approved content | P0 |
| **FR-1.5.13b** | "Copy Caption" button copies formatted text to clipboard | P0 |
| **FR-1.5.13c** | "Share to [Platform]" triggers native OS share sheet with media file | P0 |
| **FR-1.5.13d** | Share sheet opens target platform app with content pre-loaded | P0 |
| **FR-1.5.13e** | System tracks when content is handed off for native posting | P1 |

**Implementation Notes:**
- Uses `navigator.clipboard.writeText()` for caption copy
- Uses `navigator.share()` Web Share API for media hand-off
- Media served from R2 with short-lived signed URLs

**Acceptance Criteria:**
- [ ] Copy Caption shows visual confirmation ("Copied!")
- [ ] Share to Instagram opens IG Reels creation with video loaded
- [ ] User can paste caption immediately after share
- [ ] Works on iOS Safari and Android Chrome

##### FR-1.5.14: Agency Owner Dashboard

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.14a** | Agency Owners can view list of all onboarded clients | P0 |
| **FR-1.5.14b** | Agency Owners can see BrandDNA completion status per client | P0 |
| **FR-1.5.14c** | Agency Owners can invite new clients via email link | P0 |
| **FR-1.5.14d** | Agency Owners can view collected testimonials | P0 |
| **FR-1.5.14e** | Agency Owners can download/export testimonials for marketing use | P1 |

**Acceptance Criteria:**
- [ ] Client list shows: name, BrandDNA status, last activity, testimonial status
- [ ] Invite link is unique per client, expires after 7 days
- [ ] Testimonial videos playable in dashboard

---

## Mandatory Acceptance Criteria: Testimonial Collection

### The Testimonial Flow

This is a **MANDATORY** feature. The 8-week MVF is not complete until Agency Owners can collect testimonials from real clients.

#### The "Double Request" Pattern

1. **First Video (Private Win):** After completing BrandDNA session and receiving first generated content, Agent prompts user to record a quick "how did this feel" video. This is low-stakes, framed as personal reflection.

2. **Second Request (The Ask):** After user reviews generated content, Agent transparently asks if they'd be willing to share a testimonial. User can decline without friction.

**Why This Works:**
- First video gets user over initial recording anxiety
- Second request is transparent and respectful
- Users who had positive experience are primed to share
- Separation ensures users never feel tricked

#### Feature Requirements

##### FR-1.5.15: Private Win Video Capture

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.15a** | Agent prompts for "private win" video after BrandDNA session completion | P0 |
| **FR-1.5.15b** | Video recording works on mobile browsers | P0 |
| **FR-1.5.15c** | Prompt explains this is for personal momentum, not shared | P0 |
| **FR-1.5.15d** | User can skip without friction | P0 |
| **FR-1.5.15e** | Video stored in R2 with client association | P0 |

**Acceptance Criteria:**
- [ ] Recording UI is simple (record/stop/re-record/submit)
- [ ] Max video length: 2 minutes
- [ ] Video uploads with progress indicator

##### FR-1.5.16: Testimonial Request Flow

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.16a** | Agent asks for testimonial after user approves first batch of content | P0 |
| **FR-1.5.16b** | Request is transparent: "Would you share your experience to help others?" | P0 |
| **FR-1.5.16c** | User can accept, decline, or "ask me later" | P0 |
| **FR-1.5.16d** | If accepted, user records testimonial video | P0 |
| **FR-1.5.16e** | User can optionally give permission for public use | P0 |

**Acceptance Criteria:**
- [ ] Decline option is prominent and respectful
- [ ] "Ask me later" schedules follow-up after 3 more content approvals
- [ ] Testimonial includes permission checkbox for marketing use

##### FR-1.5.17: Testimonial Management

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **FR-1.5.17a** | Collected testimonials stored in R2 with metadata | P0 |
| **FR-1.5.17b** | Agency Owner can view all client testimonials | P0 |
| **FR-1.5.17c** | Agency Owner can download testimonial videos | P0 |
| **FR-1.5.17d** | Testimonial metadata includes: client name, date, permission status | P0 |

**Acceptance Criteria:**
- [ ] Testimonials accessible from Agency Dashboard
- [ ] Download provides MP4 file
- [ ] Permission status clearly displayed

---

## Technical Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINIMUM VIABLE FOUNDRY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND (React + TanStack Router)                              │
│  ├── BrandDNA Conversation UI (WebSocket)                        │
│  ├── Content Review Queue (Mobile-First)                         │
│  ├── Agency Dashboard                                            │
│  └── Native Share Integration                                    │
│                                                                  │
│  BACKEND (Cloudflare Workers + Agents SDK)                       │
│  ├── BrandDNAAgent (Durable Object)                              │
│  │   ├── Conversational State Machine                            │
│  │   ├── Voice Analysis (Whisper)                                │
│  │   ├── Persona Generation                                      │
│  │   └── Pillar Proposal                                         │
│  │                                                               │
│  ├── ContentGenerationWorkflow (Cloudflare Workflows)            │
│  │   ├── Source Analysis Step                                    │
│  │   ├── Spoke Fracturing Step                                   │
│  │   └── Platform Adaptation Step                                │
│  │                                                               │
│  ├── CriticAgent (Workers AI)                                    │
│  │   ├── G2 Hook Scoring                                         │
│  │   ├── G4 Voice Alignment                                      │
│  │   └── G5 Platform Compliance                                  │
│  │                                                               │
│  └── API Layer (Hono)                                            │
│      ├── Auth (Better Auth)                                      │
│      ├── Client Management                                       │
│      └── Media Upload/Download                                   │
│                                                                  │
│  DATA LAYER                                                      │
│  ├── D1: Global metadata (users, agencies, clients)              │
│  ├── Durable Object SQLite: Per-client Brand DNA state           │
│  ├── R2: Media assets (voice notes, testimonials, content)       │
│  └── Vectorize: Market research embeddings (P2)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Structured Agent Responses

The BrandDNA Agent sends **structured JSON objects** that the frontend renders as interactive UI components.

```typescript
// Message structure from Agent to Frontend
type AgentMessage = {
  id: string;
  timestamp: number;
  sender: 'agent' | 'user';
  component: {
    type: 'TextMessage' | 'ButtonChoice' | 'AudienceForm' |
          'VideoRecorder' | 'PillarProposal' | 'PlatformSelector';
    props: Record<string, any>;
  };
};
```

**Example: Platform Selection**
```json
{
  "component": {
    "type": "PlatformSelector",
    "props": {
      "recommended": [
        { "id": "linkedin", "label": "LinkedIn", "rationale": "High engagement for your B2B audience" },
        { "id": "twitter", "label": "Twitter/X", "rationale": "Punchy contrarian takes" }
      ],
      "secondary": [
        { "id": "youtube", "label": "YouTube", "rationale": "Long-form deep dives" }
      ]
    }
  }
}
```

### Data Schema Extensions

These tables extend the existing D1 schema for Phase 1.5:

```sql
-- BrandDNA Session tracking
CREATE TABLE brand_dna_sessions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, abandoned
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  brand_strength_score INTEGER,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Voice recordings
CREATE TABLE voice_recordings (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  type TEXT NOT NULL, -- brand_voice, private_win, testimonial
  r2_key TEXT NOT NULL,
  transcription TEXT,
  analyzed BOOLEAN DEFAULT FALSE,
  permission_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Audience personas
CREATE TABLE audience_personas (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  demographics JSON,
  pain_points JSON,
  aspirations JSON,
  preferred_platforms JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Content pillars
CREATE TABLE content_pillars (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  pillar_type TEXT, -- catalyst, core_truth, proof
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Platform strategy
CREATE TABLE platform_strategy (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  priority TEXT NOT NULL, -- primary, secondary
  cadence TEXT, -- e.g., "3x/week"
  content_medium TEXT, -- video, written, visual
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

---

## Non-Functional Requirements (Phase 1.5 Specific)

### Performance

| NFR | Requirement | Target |
|-----|-------------|--------|
| **NFR-1.5-P1** | Voice recording to transcription | < 30 seconds |
| **NFR-1.5-P2** | BrandDNA session total time | < 15 minutes |
| **NFR-1.5-P3** | Pillar generation from Brand DNA | < 30 seconds |
| **NFR-1.5-P4** | Content review queue load (mobile) | < 3 seconds |
| **NFR-1.5-P5** | Native share sheet trigger | < 500ms |

### Mobile Experience

| NFR | Requirement | Target |
|-----|-------------|--------|
| **NFR-1.5-M1** | Mobile browser support | iOS Safari 15+, Android Chrome 90+ |
| **NFR-1.5-M2** | Voice recording on mobile | Native MediaRecorder API |
| **NFR-1.5-M3** | Video recording on mobile | getUserMedia with compression |
| **NFR-1.5-M4** | Touch targets | Minimum 44x44px |
| **NFR-1.5-M5** | Swipe gestures | 60fps smooth animations |

### Data Privacy

| NFR | Requirement | Target |
|-----|-------------|--------|
| **NFR-1.5-D1** | Voice note encryption | AES-256 at rest in R2 |
| **NFR-1.5-D2** | Testimonial permission tracking | Explicit opt-in stored |
| **NFR-1.5-D3** | Client data isolation | Per-client Durable Object |

---

## Sprint Breakdown

### Sprint 1 (Week 1-2): BrandDNA Agent Foundation

**Goal:** Core agentic conversation flow with voice capture

**Deliverables:**
- [ ] BrandDNAAgent Durable Object class
- [ ] Voice recording UI component (mobile)
- [ ] Whisper transcription integration
- [ ] Audience question flow (5 questions minimum)
- [ ] Persona generation logic
- [ ] WebSocket connection for real-time conversation

**Demo Checkpoint:** User can complete voice recording and answer audience questions on mobile.

### Sprint 2 (Week 2-3): Strategy & Pillar Proposal

**Goal:** Complete BrandDNA session with strategic output

**Deliverables:**
- [ ] Platform recommendation engine
- [ ] Topic pillar generation
- [ ] Pillar approval/regenerate UI
- [ ] Brand DNA Report generation
- [ ] Brand Strength scoring algorithm
- [ ] Session completion flow

**Demo Checkpoint:** User receives Brand DNA Report with approved pillars.

### Sprint 3 (Week 4): Hub-and-Spoke Generation

**Goal:** Content generation from Source of Truth

**Deliverables:**
- [ ] Source of Truth upload UI
- [ ] Source Analysis Worker
- [ ] Spoke Fracturing logic (20+ per Hub)
- [ ] Platform-native adaptation
- [ ] Generation progress tracker

**Demo Checkpoint:** User uploads content and receives 20 platform-specific drafts.

### Sprint 4 (Week 5): Critic Scoring Integration

**Goal:** Quality scores on all generated content

**Deliverables:**
- [ ] G2 Hook Strength scoring
- [ ] G4 Voice Alignment check
- [ ] G5 Platform Compliance check
- [ ] Score display in review UI
- [ ] Flagging logic for low scores

**Demo Checkpoint:** All generated content displays quality scores.

### Sprint 5 (Week 6): Mission Control Dashboard

**Goal:** Review and approve content on mobile

**Deliverables:**
- [ ] Ready for Review queue UI
- [ ] Swipe approve/reject interface
- [ ] Filter and sort functionality
- [ ] Publish to Native workflow (Copy + Share)
- [ ] Agency Owner client list view

**Demo Checkpoint:** User can review and "publish to native" from mobile.

### Sprint 6 (Week 7-8): Testimonial Flow & Polish

**Goal:** Collect testimonials, polish entire experience

**Deliverables:**
- [ ] Private win video capture
- [ ] Testimonial request flow
- [ ] Testimonial storage and management
- [ ] Agency testimonial dashboard
- [ ] End-to-end flow testing
- [ ] Mobile experience polish

**Demo Checkpoint:** Agency Owner has collected first testimonial.

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Voice recording fails on mobile browsers** | Medium | High | Fallback to text input; test extensively on iOS/Android |
| **BrandDNA session too long/complex** | Medium | High | Limit to 10 questions max; progressive disclosure |
| **Users don't complete testimonial request** | High | Medium | Double-request pattern; "ask me later" option |
| **Generated content doesn't match brand voice** | Medium | Critical | BrandDNA depth + Critic scoring + human review |
| **Native share fails on some platforms** | Low | Medium | Fallback to clipboard-only with manual instructions |

---

## Appendix: UI Component Library

### Agent Message Components

| Component | Description | Props |
|-----------|-------------|-------|
| `TextMessage` | Simple text from agent | `content: string` |
| `ButtonChoice` | Multiple choice buttons | `prompt: string, choices: Choice[]` |
| `VideoRecorder` | In-chat video recording | `prompt: string, maxDuration: number` |
| `VoiceRecorder` | In-chat audio recording | `prompt: string, maxDuration: number` |
| `PillarProposal` | Editable pillar cards | `pillars: Pillar[]` |
| `PlatformSelector` | Drag-and-drop platform priority | `recommended: Platform[], secondary: Platform[]` |
| `PersonaCard` | Audience persona display | `persona: Persona` |
| `BrandDNAReport` | Full report visualization | `report: BrandDNAReport` |
| `NativePostHandOff` | Copy caption + share media | `platform: string, caption: string, mediaUrl: string` |

---

## Approval & Sign-Off

| Role | Name | Status | Date |
|------|------|--------|------|
| Product Owner | Williamshaw | **APPROVED** | 2025-12-30 |
| Architect | Winston (Claude Opus 4.5) | **APPROVED** | 2025-12-30 |
| Tech Lead | | Pending | |

### Architect Sign-Off Notes

**BrandDNAAgent as Durable Object: APPROVED**

Key architectural validations:
1. **Multi-tenant Isolation** — Per-client DO instance with SQLite state maintains NFR-S1 compliance
2. **Structured Responses** — Component-typed JSON messages enable deterministic UI rendering without prompt injection risk
3. **Performance** — Voice transcription < 30s target is achievable with Workers AI Whisper
4. **Mobile-First** — WebSocket + structured responses render appropriately across iOS/Android

**Scope Clarification:** Voice-to-Grounding is NOW in MVP scope (previously excluded). Update project-context.md accordingly.

**Pattern Note:** BrandDNA Agent uses collaborative single-agent extraction, NOT adversarial Creator/Critic pattern. Both patterns coexist for different purposes.

---

*This document extends [prd.md](./prd.md) and should be read in conjunction with the parent PRD.*
