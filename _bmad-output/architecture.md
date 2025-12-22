---
stepsCompleted: [1, 2, 3, 4]
mvpScopeLocked: true
projectContextRules: 4
epicCount: 8
storyCount: 31
inputDocuments:
  - prd.md
  - ux-design-specification.md
workflowType: 'architecture-refinement'
lastStep: 2
project_name: 'full-stack'
user_name: 'Williamshaw'
date: '2025-12-21'
---

# System Architecture - The Agentic Content Foundry

> Deterministic content production engine with adversarial AI architecture

## Overview

The Agentic Content Foundry is a **multi-tenant SaaS platform** that transforms a single "Source of Truth" into 25+ platform-specific content assets through a Hub-and-Spoke production model. An adversarial AI architecture (Creator vs. Critic agents) ensures quality before human review.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE EDGE                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                         EXECUTIVE PRODUCER DASHBOARD                        │ │
│  │  React 19 + TanStack Router + tRPC + Tailwind CSS + Radix UI              │ │
│  │  • Bulk Approval Engine (swipe interface)                                  │ │
│  │  • Hub/Spoke Tree Map                                                      │ │
│  │  • Brand DNA Report                                                        │ │
│  │  • Real-time Production Queue                                              │ │
│  └────────────────────────────────┬───────────────────────────────────────────┘ │
│                                   │                                              │
│                                   │ tRPC + WebSocket                             │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │                            API GATEWAY WORKER                               │ │
│  │  Hono HTTP Server + Better Auth + tRPC Router                              │ │
│  │  • Session management                                                       │
│  │  • RBAC enforcement                                                         │
│  │  • Rate limiting                                                            │ │
│  └────────────────────────────────┬───────────────────────────────────────────┘ │
│                                   │                                              │
│                    ┌──────────────┼──────────────┐                              │
│                    │              │              │                              │
│                    ▼              ▼              ▼                              │
│  ┌─────────────────────┐ ┌──────────────┐ ┌──────────────────────────────────┐ │
│  │   CONTENT ENGINE    │ │   AGENTS     │ │      CLIENT ISOLATION            │ │
│  │   (Workflows)       │ │   (Workers)  │ │      (Durable Objects)           │ │
│  │                     │ │              │ │                                  │ │
│  │ • Hub Ingestion     │ │ • Creator    │ │ Per-Client Instance:             │ │
│  │ • Spoke Generation  │ │ • Critic     │ │ • SQLite (Brand DNA)             │ │
│  │ • Quality Gates     │ │ • Grounding  │ │ • State Machine                  │ │
│  │ • Self-Healing Loop │ │ • Calibrator │ │ • Feedback Log                   │ │
│  └─────────┬───────────┘ └──────┬───────┘ └──────────────┬───────────────────┘ │
│            │                    │                        │                      │
│            └────────────────────┴────────────────────────┘                      │
│                                 │                                                │
│  ┌──────────────────────────────┴───────────────────────────────────────────────┐│
│  │                           CLOUDFLARE BINDINGS                                 ││
│  │                                                                               ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  ││
│  │  │     D1      │  │  Vectorize  │  │     R2      │  │    Workers AI       │  ││
│  │  │  (Global)   │  │  (Semantic) │  │  (Assets)   │  │    (Inference)      │  ││
│  │  │             │  │             │  │             │  │                     │  ││
│  │  │ • Users     │  │ • 10K+ Hooks│  │ • Images    │  │ • LLM Generation    │  ││
│  │  │ • Billing   │  │ • Brand DNA │  │ • Thumbnails│  │ • Whisper (Voice)   │  ││
│  │  │ • Hub IDs   │  │ • Research  │  │ • Exports   │  │ • Embeddings        │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘  ││
│  └──────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + TanStack Router | Executive Producer Dashboard |
| **Styling** | Tailwind CSS 4 + Radix UI | Accessible component primitives |
| **API Layer** | tRPC + Hono | End-to-end type-safe RPC |
| **Real-time** | WebSocket (Durable Objects) | Production Queue hydration |
| **Auth** | Better Auth | Session management, OAuth |
| **Payments** | Stripe | Usage-based subscriptions |
| **Compute** | Cloudflare Workers | Edge serverless |
| **Orchestration** | Cloudflare Workflows | Long-running Hub→Spoke generation |
| **Agent State** | Durable Objects + SQLite | Per-client isolation |
| **Global Data** | Cloudflare D1 | Users, billing, Hub IDs |
| **Vector Search** | Cloudflare Vectorize | 10K+ hooks, Brand DNA embeddings |
| **Storage** | Cloudflare R2 | Images, thumbnails, exports |
| **AI Inference** | Workers AI | LLM, Whisper, embeddings |
| **Caching** | AI Gateway | 70%+ cache hit for research |

---

## Core Architectural Patterns

### 1. Hub-and-Spoke Production Model

Content flows from a single Source of Truth (Hub) into 25+ platform-specific assets (Spokes).

```
                              ┌─────────────────────────────────────┐
                              │           SOURCE OF TRUTH            │
                              │   (PDF, Transcript, URL, Raw Text)   │
                              └──────────────────┬──────────────────┘
                                                 │
                                                 ▼
                              ┌─────────────────────────────────────┐
                              │              HUB                     │
                              │   • Extracted themes                 │
                              │   • Core claims                      │
                              │   • Psychological angles (Pillars)   │
                              └──────────────────┬──────────────────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
          ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
          │    PILLAR 1     │          │    PILLAR 2     │          │    PILLAR 3     │
          │  (Angle/Theme)  │          │  (Angle/Theme)  │          │  (Angle/Theme)  │
          └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
                   │                            │                            │
        ┌──────────┼──────────┐      ┌──────────┼──────────┐      ┌──────────┼──────────┐
        │          │          │      │          │          │      │          │          │
        ▼          ▼          ▼      ▼          ▼          ▼      ▼          ▼          ▼
    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
    │Twitter│ │LinkedIn│ │TikTok│ │Twitter│ │LinkedIn│ │TikTok│ │Twitter│ │LinkedIn│ │TikTok│
    │ Post  │ │ Post   │ │Script│ │ Post  │ │ Post   │ │Script│ │ Post  │ │ Post   │ │Script│
    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
         +          +          +          +          +          +          +          +
    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
    │Carousel│ │Thread │ │Thumbnail│ │Quote │ │  ...  │
    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘

                            25+ SPOKES PER HUB
```

**Kill Chain Lifecycle:**

| Action | Scope | Cascade Behavior |
|--------|-------|------------------|
| **Hub Kill** | Entire Hub | All child Pillars and Spokes archived |
| **Pillar Kill** | Single Pillar | Only Spokes tied to that angle deleted |
| **Spoke Survival** | Individual Spoke | Manually-edited Spokes "promoted" to Manual Assets, survive parent death |

---

### 2. Adversarial Agent Architecture

The core innovation: **Creator** (divergent) and **Critic** (convergent) agents in a conflict-resolution loop.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ADVERSARIAL QUALITY LOOP                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────────┐                    ┌─────────────────────┐            │
│   │    CREATOR AGENT    │                    │    CRITIC AGENT     │            │
│   │    (Divergent)      │                    │    (Convergent)     │            │
│   │                     │                    │                     │            │
│   │ • Generate content  │                    │ • Evaluate quality  │            │
│   │ • Query past fails  │◄───────────────────│ • Apply rubric      │            │
│   │ • Apply Brand DNA   │    Feedback Loop   │ • Score G2/G4/G5    │            │
│   └──────────┬──────────┘                    └──────────┬──────────┘            │
│              │                                          │                        │
│              │ Generate Spoke                           │ Evaluate               │
│              ▼                                          ▼                        │
│   ┌─────────────────────────────────────────────────────────────────────┐       │
│   │                        QUALITY GATES                                 │       │
│   │                                                                      │       │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │       │
│   │  │   G2    │  │   G4    │  │   G5    │  │   G6    │  │    G7     │  │       │
│   │  │  Hook   │  │  Voice  │  │Platform │  │ Visual  │  │Engagement │  │       │
│   │  │Strength │  │Alignment│  │Compliant│  │Metaphor │  │Prediction │  │       │
│   │  │ 0-100   │  │Pass/Fail│  │Pass/Fail│  │  0-100  │  │  0-100    │  │       │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └───────────┘  │       │
│   │                                                                      │       │
│   │  + G-Compliance (Regulated Industries: SEC, FINRA)                   │       │
│   └──────────────────────────────┬──────────────────────────────────────┘       │
│                                  │                                               │
│                    ┌─────────────┴─────────────┐                                │
│                    │                           │                                │
│                    ▼                           ▼                                │
│            ┌─────────────┐             ┌─────────────┐                          │
│            │    PASS     │             │    FAIL     │                          │
│            │  (Score≥80) │             │  (Score<80) │                          │
│            └──────┬──────┘             └──────┬──────┘                          │
│                   │                           │                                  │
│                   ▼                           ▼                                  │
│         ┌─────────────────┐         ┌─────────────────────────┐                 │
│         │ READY FOR REVIEW│         │    SELF-HEALING LOOP    │                 │
│         │ (Human Queue)   │         │    (Max 3 attempts)     │                 │
│         └─────────────────┘         │                         │                 │
│                                     │ 1. Write to feedback_log│                 │
│                                     │ 2. Creator re-queries   │                 │
│                                     │ 3. Regenerate with fix  │                 │
│                                     │                         │                 │
│                                     │ IF still failing:       │                 │
│                                     │ → Flag for human review │                 │
│                                     │ → "Creative Conflict"   │                 │
│                                     └─────────────────────────┘                 │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Quality Gates (Critic Rubric):**

| Gate | Type | Threshold | Method |
|------|------|-----------|--------|
| **G2** | Hook Strength | Score ≥ 80 | Pattern Interrupt + Benefit + Curiosity Gap |
| **G4** | Voice Alignment | Pass/Fail | Query `banned_words`, `voice_markers`, cosine similarity |
| **G5** | Platform Compliance | Pass/Fail | Character limits, hashtag rules, format validation |
| **G6** | Visual Metaphor | Score ≥ 70 | AI cliché detection, brand alignment |
| **G7** | Engagement Prediction | Score ≥ 85 | Vectorize similarity to 10K+ top-performing hooks |
| **G-Compliance** | Regulatory | Pass/Fail | SEC/FINRA rules, banned phrases, disclosure checks |

---

### 3. Multi-Tenant Isolation Architecture

Physical isolation using Durable Objects with per-client SQLite state.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MULTI-TENANT ISOLATION                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                              D1 (GLOBAL)                                     ││
│  │   Shared metadata only — NO client content                                   ││
│  │   • users, accounts, subscriptions                                           ││
│  │   • hub_registry (IDs only, no content)                                      ││
│  │   • billing_events                                                           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                       DURABLE OBJECTS (PER-CLIENT)                           ││
│  │                                                                              ││
│  │  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐        ││
│  │  │   CLIENT A        │  │   CLIENT B        │  │   CLIENT C        │        ││
│  │  │   (DO Instance)   │  │   (DO Instance)   │  │   (DO Instance)   │        ││
│  │  │                   │  │                   │  │                   │        ││
│  │  │ ┌───────────────┐ │  │ ┌───────────────┐ │  │ ┌───────────────┐ │        ││
│  │  │ │ SQLite State  │ │  │ │ SQLite State  │ │  │ │ SQLite State  │ │        ││
│  │  │ │               │ │  │ │               │ │  │ │               │ │        ││
│  │  │ │ • brand_dna   │ │  │ │ • brand_dna   │ │  │ │ • brand_dna   │ │        ││
│  │  │ │ • voice_marks │ │  │ │ • voice_marks │ │  │ │ • voice_marks │ │        ││
│  │  │ │ • banned_words│ │  │ │ • banned_words│ │  │ │ • banned_words│ │        ││
│  │  │ │ • feedback_log│ │  │ │ • feedback_log│ │  │ │ • feedback_log│ │        ││
│  │  │ │ • content_tree│ │  │ │ • content_tree│ │  │ │ • content_tree│ │        ││
│  │  │ │ • mutations   │ │  │ │ • mutations   │ │  │ │ • mutations   │ │        ││
│  │  │ └───────────────┘ │  │ └───────────────┘ │  │ └───────────────┘ │        ││
│  │  │                   │  │                   │  │                   │        ││
│  │  │ WebSocket         │  │ WebSocket         │  │ WebSocket         │        ││
│  │  │ connections       │  │ connections       │  │ connections       │        ││
│  │  └───────────────────┘  └───────────────────┘  └───────────────────┘        ││
│  │                                                                              ││
│  │  Requirement: Context switch < 100ms                                         ││
│  │  Isolation: Zero data leakage between clients                                ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    VECTORIZE (PER-CLIENT NAMESPACE)                          ││
│  │                                                                              ││
│  │  namespace:client_a/       namespace:client_b/       namespace:client_c/     ││
│  │  • Brand DNA embeddings    • Brand DNA embeddings    • Brand DNA embeddings  ││
│  │  • Research vectors        • Research vectors        • Research vectors      ││
│  │  • Voice samples           • Voice samples           • Voice samples         ││
│  │                                                                              ││
│  │  Shared namespace: hooks/                                                    ││
│  │  • 10,000+ top-performing hooks (G7 scoring)                                 ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                         R2 (PER-CLIENT PATH)                                 ││
│  │                                                                              ││
│  │  /assets/client_a/images/      /assets/client_b/images/                      ││
│  │  /assets/client_a/exports/     /assets/client_b/exports/                     ││
│  │  /assets/client_a/voice/       /assets/client_b/voice/                       ││
│  │                                                                              ││
│  │  Zero-egress economics: Agencies manage 100+ clients                         ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagrams

### 1. Hub Ingestion Flow

```
User                    Dashboard              API Worker           Content Engine         DO (Client)
  │                        │                      │                      │                    │
  │  Upload PDF/URL        │                      │                      │                    │
  ├───────────────────────►│                      │                      │                    │
  │                        │  POST /ingest        │                      │                    │
  │                        ├─────────────────────►│                      │                    │
  │                        │                      │  Store to R2         │                    │
  │                        │                      ├─────────────────────►│                    │
  │                        │                      │                      │                    │
  │                        │                      │  Start Workflow      │                    │
  │                        │                      ├─────────────────────►│                    │
  │                        │                      │                      │                    │
  │                        │                      │                      │  Query Brand DNA   │
  │                        │                      │                      ├───────────────────►│
  │                        │                      │                      │                    │
  │                        │                      │                      │◄───────────────────┤
  │                        │                      │                      │                    │
  │                        │                      │  Phase 1: Extract    │                    │
  │                        │                      │  themes, claims      │                    │
  │                        │                      │                      │                    │
  │                        │◄─ WebSocket: Progress ─────────────────────┤                    │
  │  Progress: 10 Pillars  │                      │                      │                    │
  │◄───────────────────────┤                      │                      │                    │
  │                        │                      │                      │                    │
  │                        │                      │  Phase 2: Generate   │                    │
  │                        │                      │  25 Spokes           │                    │
  │                        │                      │                      │                    │
  │                        │                      │  Phase 3: Quality    │                    │
  │                        │                      │  Gate (G2/G4/G5)     │                    │
  │                        │                      │                      │                    │
  │                        │                      │  Self-Healing Loop   │                    │
  │                        │                      │  (if needed)         │                    │
  │                        │                      │                      │                    │
  │                        │◄─ WebSocket: Complete ────────────────────┤                    │
  │  Hub Ready for Review  │                      │                      │                    │
  │◄───────────────────────┤                      │                      │                    │
```

### 2. Bulk Approval Flow

```
User                    Dashboard              API Worker            DO (Client)
  │                        │                      │                      │
  │  Open Bulk Approval    │                      │                      │
  ├───────────────────────►│                      │                      │
  │                        │  GET /queue?g7>9     │                      │
  │                        ├─────────────────────►│                      │
  │                        │                      │  Query pending       │
  │                        │                      ├─────────────────────►│
  │                        │                      │◄─────────────────────┤
  │                        │◄─ 47 Top Spokes ─────┤                      │
  │  Display Swipe Queue   │                      │                      │
  │◄───────────────────────┤                      │                      │
  │                        │                      │                      │
  │  Swipe Right (Approve) │                      │                      │
  ├───────────────────────►│                      │                      │
  │                        │  POST /approve       │                      │
  │                        ├─────────────────────►│                      │
  │                        │                      │  Update status       │
  │                        │                      ├─────────────────────►│
  │                        │◄─ <200ms response ───┤                      │
  │  Next Spoke (pre-fetch)│                      │                      │
  │◄───────────────────────┤                      │                      │
  │                        │                      │                      │
  │  Swipe Left (Kill Hub) │                      │                      │
  ├───────────────────────►│                      │                      │
  │                        │  POST /kill-hub      │                      │
  │                        ├─────────────────────►│                      │
  │                        │                      │  Cascade delete      │
  │                        │                      │  25 child spokes     │
  │                        │                      ├─────────────────────►│
  │                        │◄─ Kill Chain Done ───┤                      │
  │  Queue refreshed       │                      │                      │
  │◄───────────────────────┤                      │                      │
```

### 3. Voice-to-Grounding Calibration Flow

```
User                   Mobile App             API Worker          Workers AI           DO (Client)
  │                        │                      │                    │                   │
  │  DNA Alert: "Losing    │                      │                    │                   │
  │  voice for Client A"   │                      │                    │                   │
  │◄───────────────────────┤                      │                    │                   │
  │                        │                      │                    │                   │
  │  Record Voice Note     │                      │                    │                   │
  │  (30 seconds)          │                      │                    │                   │
  ├───────────────────────►│                      │                    │                   │
  │                        │  POST /calibrate     │                    │                   │
  │                        │  + audio blob        │                    │                   │
  │                        ├─────────────────────►│                    │                   │
  │                        │                      │  Store to R2       │                   │
  │                        │                      │  (temp bucket)     │                   │
  │                        │                      │                    │                   │
  │                        │                      │  Whisper           │                   │
  │                        │                      │  transcription     │                   │
  │                        │                      ├───────────────────►│                   │
  │                        │                      │◄───────────────────┤                   │
  │                        │                      │  "Stop using       │                   │
  │                        │                      │  professional      │                   │
  │                        │                      │  consultant tone"  │                   │
  │                        │                      │                    │                   │
  │                        │                      │  Entity Extraction │                   │
  │                        │                      │  • Banned: "synergy"                   │
  │                        │                      │  • Add: "betting"  │                   │
  │                        │                      │                    │                   │
  │                        │                      │  Update SQLite     │                   │
  │                        │                      ├────────────────────────────────────────►│
  │                        │                      │  • voice_markers   │                   │
  │                        │                      │  • banned_words    │                   │
  │                        │                      │  • brand_stances   │                   │
  │                        │                      │                    │                   │
  │                        │                      │  Refresh Vectorize │                   │
  │                        │                      │  (namespace:client)│                   │
  │                        │                      │                    │                   │
  │                        │                      │  Re-evaluate       │                   │
  │                        │                      │  pending spokes    │                   │
  │                        │                      │                    │                   │
  │                        │◄─ DNA Score: 62→84% ─┤                    │                   │
  │  "Brand DNA Updated"   │                      │                    │                   │
  │◄───────────────────────┤                      │                    │                   │
```

---

## Monorepo Structure

```
full-stack/
├── apps/
│   ├── dashboard/                    # Executive Producer Dashboard
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── app/
│   │   │   │   │   ├── _authed/
│   │   │   │   │   │   ├── hubs/            # Hub management
│   │   │   │   │   │   ├── review/          # Bulk Approval Engine
│   │   │   │   │   │   ├── clients/         # Client management
│   │   │   │   │   │   └── analytics/       # Zero-Edit Rate, metrics
│   │   │   │   │   └── _authed.tsx          # Auth guard
│   │   │   │   └── index.tsx                # Landing page
│   │   │   ├── components/
│   │   │   │   ├── review/
│   │   │   │   │   ├── SwipeCard.tsx        # Swipe approval
│   │   │   │   │   ├── TreeMap.tsx          # Hub/Spoke hierarchy
│   │   │   │   │   └── KillChain.tsx        # Cascade delete UI
│   │   │   │   ├── brand/
│   │   │   │   │   ├── DNAReport.tsx        # Brand DNA visualization
│   │   │   │   │   └── VoiceRecorder.tsx    # Calibration input
│   │   │   │   └── queue/
│   │   │   │       └── ProductionQueue.tsx  # Real-time progress
│   │   │   └── lib/
│   │   │       ├── trpc.ts                  # tRPC client
│   │   │       └── websocket.ts             # Production Queue
│   │   ├── worker/
│   │   │   ├── hono/
│   │   │   │   └── app.ts                   # Hono routes + auth
│   │   │   └── trpc/
│   │   │       └── routers/
│   │   │           ├── hubs.ts              # Hub CRUD
│   │   │           ├── spokes.ts            # Spoke management
│   │   │           ├── review.ts            # Bulk approval
│   │   │           ├── clients.ts           # Multi-client
│   │   │           └── calibration.ts       # Voice-to-Grounding
│   │   └── wrangler.jsonc
│   │
│   └── content-engine/                # Backend Worker
│       ├── src/
│       │   ├── workflows/
│       │   │   ├── hub-ingestion.ts         # PDF/URL processing
│       │   │   ├── spoke-generation.ts      # 25 spoke parallel gen
│       │   │   └── quality-gate.ts          # G2/G4/G5 evaluation
│       │   ├── durable-objects/
│       │   │   └── ClientAgent.ts           # Per-client isolation
│       │   ├── agents/
│       │   │   ├── creator.ts               # Divergent generator
│       │   │   ├── critic.ts                # Convergent evaluator
│       │   │   └── grounding.ts             # Brand DNA management
│       │   └── quality/
│       │       ├── g2-hook-strength.ts      # Hook scoring
│       │       ├── g4-voice-alignment.ts    # Voice matching
│       │       ├── g5-platform-compliance.ts # Format validation
│       │       ├── g6-visual-metaphor.ts    # AI cliché detection
│       │       └── g7-engagement-predict.ts # Vectorize similarity
│       └── wrangler.jsonc
│
├── packages/
│   ├── foundry-core/                  # Shared data layer
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── d1-global.ts             # D1 tables
│   │   │   │   └── sqlite-client.ts         # DO SQLite schema
│   │   │   ├── queries/
│   │   │   │   ├── hubs.ts                  # Hub queries
│   │   │   │   ├── spokes.ts                # Spoke queries
│   │   │   │   └── brand-dna.ts             # Brand DNA queries
│   │   │   ├── zod/
│   │   │   │   ├── hub-schema.ts            # Hub validation
│   │   │   │   ├── spoke-schema.ts          # Spoke validation
│   │   │   │   └── quality-schema.ts        # Gate scoring
│   │   │   └── auth.ts                      # Better Auth config
│   │   └── package.json
│   │
│   └── agent-system/                  # AI agent orchestration
│       ├── src/
│       │   ├── creator/
│       │   │   ├── prompts/                 # Generation prompts
│       │   │   └── strategies/              # Platform-specific
│       │   ├── critic/
│       │   │   ├── rubric/                  # Quality gate logic
│       │   │   └── feedback/                # Self-healing
│       │   ├── grounding/
│       │   │   ├── voice-extraction.ts      # Voice-to-Grounding
│       │   │   └── drift-detection.ts       # Drift Metric
│       │   └── vectorize/
│       │       ├── hooks-db.ts              # 10K+ hooks
│       │       └── brand-embeddings.ts      # Brand DNA vectors
│       └── package.json
│
├── docs/
│   ├── architecture.md               # This document
│   ├── data-model.md                 # Database schema
│   ├── agent-system.md               # Adversarial architecture
│   ├── quality-gates.md              # G2/G4/G5/G6/G7 specs
│   └── api-reference.md              # tRPC procedures
│
└── package.json                       # Root workspace config
```

---

## Key Design Decisions

### 1. Physical Isolation via Durable Objects

**Decision:** Each client gets a dedicated Durable Object instance with SQLite storage.

**Rationale:**
- Zero data leakage guarantee (agencies managing 100+ clients)
- < 100ms context switch between clients
- Brand DNA cannot "bleed" between accounts
- Each client's Agent literally cannot access another's memory

**Trade-off:** Higher complexity than shared D1, but isolation is non-negotiable for agency trust.

### 2. Adversarial Agent Architecture

**Decision:** Separate Creator and Critic agents in conflict-resolution loop.

**Rationale:**
- Creator optimizes for volume and creativity (divergent)
- Critic optimizes for quality and brand alignment (convergent)
- Self-healing loop learns from rejection (feedback stored in SQLite)
- No existing AI content tool implements true adversarial gates

**Trade-off:** More complex than single-agent, but quality improvement is 15%+ in Zero-Edit Rate.

### 3. Hub-and-Spoke as Genetic Code

**Decision:** Treat content as hierarchical tree with cascade behaviors.

**Rationale:**
- Kill Chain enables 60-second cleanup of bad content
- Mutation Rule protects manual work
- Tree Map visualization for "Executive Producer" mental model
- Deterministic transformation (1 Hub → 25 Spokes always)

**Trade-off:** More complex content model, but enables bulk operations that save hours.

### 4. Vectorize for "Crack Bait" Scoring

**Decision:** 10,000+ top-performing hooks in shared Vectorize index for G7 scoring.

**Rationale:**
- Similarity search predicts engagement before publishing
- "Golden Nugget" discovery (3x+ outperformance)
- Not just "sounds good" — optimized for Stopping Power
- Compound learning advantage as database grows

**Trade-off:** Requires curating hook database, but creates defensible moat.

### 5. Voice-to-Grounding Pipeline

**Decision:** 30-second voice note → entity extraction → instant Brand DNA refresh.

**Rationale:**
- Mobile calibration without form-filling
- Real-time brand correction when Zero-Edit Rate drops
- Transforms system failure into collaboration moment
- The "Talk to your Agent" experience

**Trade-off:** Requires Whisper integration, but solves the "AI is off" problem elegantly.

---

## Related Documentation

- [Data Model](./data-model.md) — D1 + Durable Object SQLite schemas
- [Agent System](./agent-system.md) — Creator/Critic architecture details
- [Quality Gates](./quality-gates.md) — G2/G4/G5/G6/G7 specifications
- [API Reference](./api-reference.md) — tRPC routers and procedures
- [Developer Guide](./developer-guide.md) — Setup and contribution guide

---

## Success Metrics (Technical)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context Switch Latency | < 100ms | Durable Object hydration |
| Hub Ingestion | < 30s | Source to pillars extracted |
| Spoke Generation (25) | < 60s | Cloudflare Workflows |
| Critic Pass Rate (G2) | > 85% | First-pass hook approval |
| Self-Healing Efficiency | < 1.2 loops | Average regeneration attempts |
| Cache Hit Ratio | > 70% | AI Gateway cache |
| Zero-Edit Rate | > 60% | Brand DNA capture achieved |
| Kill Chain Usage | > 90% | Hub-level vs. spoke-by-spoke |

---

## Project Context Analysis (Architecture Refinement)

> Added 2025-12-21 to focus the comprehensive architecture on Phase 1 MVP execution

### Documentation Stack Assessment

| Document | Status | Coverage |
|----------|--------|----------|
| **PRD** | Complete | 60 FRs, 47 NFRs, 5 User Journeys, MVP scope defined |
| **UX Spec** | Complete | Midnight Command theme locked, 7 wireframes, full design system |
| **Architecture** | Comprehensive | Full system vision, all patterns documented |
| **Project Context** | **MISSING** | No AI agent implementation rules |

### Identified Gaps for Phase 1 Execution

**Gap 1: No Project Context File**
AI agents implementing code lack concrete rules for:
- Naming conventions and file structure patterns
- Testing requirements and coverage expectations
- Error handling standards
- Import ordering and code organization
- Forbidden patterns and anti-patterns

**Gap 2: No MVP Scope Lock**
Architecture describes the full system vision. Need explicit scope lock:
- Exactly which 8 MVP features to build
- Acceptance criteria for each
- Build order and dependencies
- What is explicitly OUT of scope

**Gap 3: No Service Contract (Dashboard ↔ Engine)**
Two apps defined but no API contract:
- `foundry-dashboard` — Client-facing UI (current focus)
- `foundry-engine` — Content processing backend
- Service binding interface undefined

**Gap 4: Open Architectural Decisions**
Key questions still unresolved:
- D1 scope: Global metadata only, or also client content?
- Durable Object granularity: Per-client or per-Hub?
- Vectorize namespace provisioning strategy

### Refinement Plan

This architecture refinement will add three focused sections:

| Section | Purpose | Prevents |
|---------|---------|----------|
| **MVP Scope Lock** | 8 features with acceptance criteria | Scope creep |
| **Project Context Rules** | 15-20 concrete AI agent rules | Inconsistent implementations |
| **Service Contract** | TypeScript types for service binding | Integration failures |

---

## Established Technology Stack

> Stack confirmed 2025-12-21 — Foundation deployed and operational

### Stack Selection: Cloudflare Full-Stack

**Rationale:** Already implemented and deployed. No starter template needed — foundation exists with auth, tRPC, and database connectivity confirmed.

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19 + TanStack Router 1.82 + TanStack Query 5.60 + Zustand 5.0 |
| **Styling** | Tailwind CSS 4.0 + Radix UI + Lucide Icons |
| **Backend** | Hono 4.6 + tRPC 11 + Better Auth 1.3.4 |
| **Data** | Kysely 0.28 + D1 (SQLite) + Zod 3.24 |
| **Infrastructure** | Cloudflare Workers + D1 + Service Bindings |
| **Testing** | Playwright 1.57 (installed, tests pending) |
| **Build** | Vite 6.0 + TypeScript 5.8 |

### Environments Deployed

| Environment | Domain | Status |
|-------------|--------|--------|
| Local | localhost:5173 / localhost:8787 | ✅ Operational |
| Stage | foundry-stage.williamjshaw.ca | ✅ Deployed |
| Production | foundry.williamjshaw.ca | ✅ Deployed |

### Architectural Decisions Locked by Stack

| Decision | Choice | Implication |
|----------|--------|-------------|
| Database | D1 (SQLite) | SQLite query patterns, single-region, no distributed JOINs |
| Query Builder | Kysely | Type-safe SQL generation, not ORM magic |
| Auth | Better Auth | Session-based with D1 adapter, not JWT-only |
| API | tRPC 11 | End-to-end TypeScript types, not REST/GraphQL |
| Styling | Tailwind 4 | Utility-first, CSS variables, dark mode native |
| Components | Radix UI | Accessible primitives, bring-your-own-styling |
| State | Zustand | Minimal client state, server state via TanStack Query |

### tRPC Router Structure (Stubs)

```
worker/trpc/routers/
├── clients.ts      # FR39-FR47: Client management, context switching
├── hubs.ts         # FR1-FR7: Hub creation, ingestion
├── spokes.ts       # FR8-FR14: Spoke generation, platform variants
├── review.ts       # FR23-FR30: Bulk approval, Kill Chain
├── calibration.ts  # FR31-FR38: Brand DNA, Voice-to-Grounding
├── analytics.ts    # FR48-FR54: Zero-Edit Rate, metrics
└── exports.ts      # FR55-FR60: CSV/JSON export
```

### Service Bindings

```typescript
// wrangler.jsonc
{
  "services": [
    {
      "binding": "CONTENT_ENGINE",
      "service": "foundry-engine-stage" // or -production
    }
  ]
}
```

**Contract TBD:** Dashboard calls `env.CONTENT_ENGINE.fetch()` — exact API shape to be defined in Epic 4

---

## MVP Scope Lock

> Locked 2025-12-21 — Deviations require explicit architecture review

### Scope Boundary Table

| Feature Area | MVP Status (LOCKED) | Post-MVP / Phase 1.1+ |
|--------------|---------------------|----------------------|
| **Ingestion** | PDF, Transcript, Raw Text | Google Docs, Notion, YouTube RSS |
| **Generation** | Text Spokes, Carousels, Threads | Full Video Rendering |
| **Quality** | G2, G4, G5 Gates + Self-Healing | G-Compliance, G6 Visual Archetype |
| **Calibration** | Text-based DNA updates | Voice-to-Grounding Pipeline |
| **Analytics** | Zero-Edit Rate, Volume Tracking | G7 Engagement Prediction |
| **Real-time** | Polling fallback | WebSocket Production Queue |
| **Publishing** | Export only (CSV/JSON) | Direct platform integrations |
| **Collaboration** | Basic shareable links | Real-time comment sync |

### MVP Go/No-Go Gates

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero-Edit Rate | > 40% within 2 weeks | Approved vs. edited content |
| Time to First Content Bible | < 60 minutes from signup | Session analytics |
| Volume Achievement | 25+ spokes in first Hub | Content count tracking |
| Critic Accuracy | 80%+ user agreement with scores | Approval/rejection correlation |
| **Isolation Gate** | < 100ms context switch | Durable Object latency metrics |

### Explicit Exclusions (DO NOT BUILD)

- ❌ Voice-to-Grounding (text input only for MVP)
- ❌ G6 Visual Archetype scoring
- ❌ G7 Engagement Prediction
- ❌ G-Compliance Gate (regulated industries)
- ❌ Publishing integrations (export only)
- ❌ Video rendering (scripts + thumbnails only)
- ❌ WebSocket real-time sync (polling fallback)

---

## Project Context Rules

> These rules govern all AI agent implementations in this codebase

### Rule 1: Isolation Above All

Every database query MUST include client context filtering. Brand DNA contamination between clients is a critical failure.

```typescript
// ✅ CORRECT
const hubs = await db
  .selectFrom('hubs')
  .where('client_id', '=', ctx.clientId)
  .selectAll()
  .execute();

// ❌ FORBIDDEN - Never query without client_id
const hubs = await db.selectFrom('hubs').selectAll().execute();
```

**Enforcement:** Kysely query helpers MUST require `clientId` parameter. No raw queries without client context.

### Rule 2: Performance Budget

Context switches between client agents MUST remain under 100ms.

| Operation | Budget | Implementation |
|-----------|--------|----------------|
| Client context switch | < 100ms | Durable Object hydration |
| Brand DNA lookup | < 50ms | SQLite in DO storage |
| Vectorize query | < 200ms | Namespaced by client |
| D1 metadata query | < 100ms | Indexed by client_id |

**Architecture Pattern:**
- "Hot" data (Brand DNA, active state) → Durable Object SQLite
- "Cold" data (historical, archival) → D1 global database
- Never block UI on cold data fetches

### Rule 3: Design Fidelity

Use Midnight Command tokens exclusively. The interface must feel like a high-velocity terminal for Executive Producers.

```typescript
// ✅ CORRECT - Use design tokens
className="bg-[#0F1419] text-[#E7E9EA] border-[#2A3038]"

// ❌ FORBIDDEN - No arbitrary colors
className="bg-gray-900 text-white border-gray-700"

// ❌ FORBIDDEN - No playful/Canva-style UI
className="bg-gradient-to-r from-purple-500 to-pink-500"
```

**Anti-patterns:**
- No gradient backgrounds
- No playful illustrations
- No gamification badges
- No rounded-full buttons (use rounded-sm/md)
- No emoji in UI chrome (content only)

### Rule 4: Adversarial Logic

Content generation is NEVER a single prompt. It is always Creator → Critic → Feedback Loop.

```typescript
// ✅ CORRECT - Adversarial pattern
async function generateSpoke(hub: Hub, pillar: Pillar): Promise<Spoke> {
  let attempts = 0;
  let spoke: Spoke;

  do {
    spoke = await creatorAgent.generate(hub, pillar, feedback);
    const scores = await criticAgent.evaluate(spoke);

    if (scores.g2 >= 80 && scores.g4 === 'pass' && scores.g5 === 'pass') {
      return spoke;
    }

    feedback = await criticAgent.generateFeedback(spoke, scores);
    attempts++;
  } while (attempts < 3);

  // Flag for human review after 3 failures
  return markAsCreativeConflict(spoke, feedback);
}

// ❌ FORBIDDEN - Single-shot generation
async function generateSpoke(hub: Hub): Promise<Spoke> {
  return await llm.generate(prompt); // No quality gate!
}
```

---

## Implementation Epics

> 8 Epics mapped to 60 Functional Requirements from PRD

### Epic 1: Foundation & Access
**Scope:** Theme implementation, authentication, application shell

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 1.1 Design Token Implementation | — | — | Tailwind 4 config with Midnight Command palette |
| 1.2 Global Layout & Sidebar | — | — | `__root.tsx` with navigation, active states |
| 1.3 Auth Flow Polish | — | auth | Login/signup with Better Auth, session handling |

### Epic 2: Hub Ingestion
**Scope:** Source of Truth processing pipeline

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 2.1 Source Upload | FR1, FR2, FR3 | hubs.create | File upload, text paste, URL input |
| 2.2 Content Extraction | FR4, FR5 | hubs.process | Theme/claim extraction from source |
| 2.3 Pillar Generation | FR6, FR7 | hubs.finalize | Psychological angles, user refinement |

### Epic 3: Spoke Generation
**Scope:** Multimodal content creation from Hubs

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 3.1 Text Spoke Generation | FR8 | spokes.generate | Platform-specific text content |
| 3.2 Carousel Generation | FR9 | spokes.generate | Slide-by-slide structure |
| 3.3 Thread Generation | FR10 | spokes.generate | Sequential posts |
| 3.4 Platform Filtering | FR12, FR13 | spokes.list | Hub→Spoke hierarchy view |

### Epic 4: Quality Engine
**Scope:** Adversarial gates and self-healing loop

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 4.1 G2 Hook Scoring | FR15 | spokes.evaluate | 0-100 hook strength |
| 4.2 G4 Voice Alignment | FR16 | spokes.evaluate | Pass/fail brand match |
| 4.3 G5 Platform Compliance | FR17 | spokes.evaluate | Character limits, format rules |
| 4.4 Self-Healing Loop | FR18, FR19 | spokes.regenerate | Feedback storage, retry logic |
| 4.5 Gate Override | FR20, FR21 | review.override | Manual approval with reason |

### Epic 5: Sprint Review
**Scope:** Bulk approval and Kill Chain

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 5.1 Sprint View | FR23, FR24 | review.list | Card stack with keyboard nav |
| 5.2 Signal Header | FR23 | — | G2/G7 scores in 48px typography |
| 5.3 Quality Filtering | FR25 | review.list | Filter by G7 score buckets |
| 5.4 Hub Kill Chain | FR26, FR27, FR28 | review.killHub | Cascade delete with Mutation Rule |
| 5.5 Clone High Performers | FR29 | spokes.clone | Variation generation |

### Epic 6: Brand DNA Calibration
**Scope:** Voice capture and learning

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 6.1 Content Analysis | FR31 | calibration.analyze | Pattern detection from uploads |
| 6.2 Text Calibration | FR32 | calibration.update | Manual DNA refinement |
| 6.3 DNA Report | FR33, FR38 | calibration.report | Tone, phrases, stances visualization |
| 6.4 Banned Words | FR34, FR35 | calibration.vocabulary | Add/remove word management |
| 6.5 Drift Detection | FR36, FR37 | calibration.audit | Zero-Edit Rate trend triggers |

### Epic 7: Multi-Tenant Operations
**Scope:** Agency RBAC and client isolation

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 7.1 Client CRUD | FR39 | clients.create | Client provisioning |
| 7.2 Context Switcher | FR45, FR46 | clients.switch | < 100ms DO hydration |
| 7.3 Assignment Management | FR40, FR41, FR42 | clients.assign | Team→Client mapping |
| 7.4 Shareable Links | FR47 | clients.shareLink | Time-limited review access |
| 7.5 Brand DNA Isolation | NFR-S1 | — | Per-client DO + Vectorize namespace |

### Epic 8: Export & Analytics
**Scope:** Zero-Edit tracking and content export

| Story | FR Coverage | tRPC Router | Key Deliverables |
|-------|-------------|-------------|------------------|
| 8.1 Zero-Edit Rate | FR48 | analytics.zeroEdit | Per-client trend tracking |
| 8.2 Quality Metrics | FR49, FR50 | analytics.quality | G2/G4/G5 pass rates |
| 8.3 Volume Metrics | FR51, FR52, FR53 | analytics.volume | Hub/spoke counts, velocity |
| 8.4 CSV Export | FR55, FR57 | exports.csv | Platform-organized download |
| 8.5 JSON Export | FR56, FR58 | exports.json | Scheduler metadata included |
| 8.6 Asset Download | FR59, FR60 | exports.assets | Images, clipboard copy |

---

## Epic Dependencies

```
Epic 1 (Foundation) ──┬──► Epic 2 (Ingestion) ──► Epic 3 (Generation) ──► Epic 4 (Quality)
                      │                                                         │
                      │                                                         ▼
                      └──► Epic 7 (Multi-tenant) ◄──────────────────── Epic 5 (Sprint Review)
                                    │
                                    ▼
                            Epic 6 (Calibration) ──► Epic 8 (Analytics)
```

---

## Strategic Refinements

> Architectural improvements identified 2025-12-21 to ensure Adversarial Architecture and Agency Scalability remain defensible

### Refinement 1: Self-Healing Cool-down (Epic 4, Story 4.3)

**Problem:** If the Creator Agent fails twice with the same Brand DNA grounding, the third attempt may produce repetitive hallucinations.

**Solution:** Implement a "Context Refresh" after the second failed Self-Healing attempt:

```typescript
// Self-Healing Loop with Context Refresh
async function selfHealingLoop(spoke: Spoke, maxAttempts = 3): Promise<Spoke> {
  let attempts = 0;
  let feedback: string | undefined;

  while (attempts < maxAttempts) {
    const result = await creatorAgent.generate(spoke.hub, spoke.pillar, feedback);
    const scores = await criticAgent.evaluate(result);

    if (passesAllGates(scores)) {
      return result;
    }

    attempts++;
    feedback = await criticAgent.generateFeedback(result, scores);

    // CONTEXT REFRESH: After 2nd failure, query mutation_registry
    if (attempts === 2) {
      const userEdits = await queryMutationRegistry(spoke.hub.clientId, spoke.pillar.id);
      if (userEdits.length > 0) {
        feedback += `\n\nUSER EDIT PATTERNS DETECTED:\n${formatUserEdits(userEdits)}`;
      }
    }
  }

  return markAsCreativeConflict(spoke, feedback);
}
```

**Rationale:** The `mutation_registry` contains manual user edits that represent "ground truth" corrections. Incorporating these patterns on the 3rd attempt creates a feedback loop between human judgment and AI generation.

---

### Refinement 2: Warm-up Routine for Context Switching (Epic 1/7, Story 7.3)

**Problem:** NFR-P1 requires < 100ms context switching, but cold-start Durable Objects can exceed this budget.

**Solution:** Implement a "Warm-up" routine that keeps the 5 most recently active client agents in a warm state during an Agency Account Manager's session:

```typescript
// Warm-up routine for Agency Account Manager sessions
interface WarmClientCache {
  clientId: string;
  lastAccess: number;
  doStub: DurableObjectStub;
}

class AgencySessionManager {
  private warmClients: WarmClientCache[] = [];
  private readonly MAX_WARM_CLIENTS = 5;

  async ensureClientWarm(clientId: string): Promise<DurableObjectStub> {
    // Check if already warm
    const cached = this.warmClients.find(c => c.clientId === clientId);
    if (cached) {
      cached.lastAccess = Date.now();
      return cached.doStub;
    }

    // Warm up new client
    const doStub = await this.getClientDurableObject(clientId);
    await doStub.fetch('/ping'); // Keep-alive ping

    // Add to warm cache, evict LRU if needed
    this.warmClients.push({ clientId, lastAccess: Date.now(), doStub });
    if (this.warmClients.length > this.MAX_WARM_CLIENTS) {
      this.warmClients.sort((a, b) => a.lastAccess - b.lastAccess);
      this.warmClients.shift(); // Evict oldest
    }

    return doStub;
  }
}
```

**Rationale:** Marcus Chen manages 47 clients but typically works on 5-10 in a single session. Pre-warming ensures "Mission Control Velocity" is maintained without memory bloat.

---

### Refinement 3: Rubric Failure Highlighting (Epic 5, Story 5.4)

**Problem:** The Creative Conflict Panel shows side-by-side resolution, but users must read entire drafts to find the problem.

**Solution:** Highlight the specific "Rubric Failure Point" in red within the content draft itself:

```typescript
interface RubricViolation {
  gate: 'G2' | 'G4' | 'G5' | 'G6';
  startIndex: number;
  endIndex: number;
  reason: string;
  severity: 'critical' | 'warning';
}

interface HighlightedDraft {
  content: string;
  violations: RubricViolation[];
}

// Critic returns violations with character positions
async function evaluateWithHighlights(spoke: Spoke): Promise<HighlightedDraft> {
  const scores = await criticAgent.evaluate(spoke);
  const violations: RubricViolation[] = [];

  if (scores.g4 === 'fail') {
    // Find banned words in content
    const bannedMatches = findBannedWords(spoke.content, spoke.clientBrandDNA);
    violations.push(...bannedMatches.map(m => ({
      gate: 'G4' as const,
      startIndex: m.start,
      endIndex: m.end,
      reason: `Banned word: "${m.word}"`,
      severity: 'critical' as const
    })));
  }

  // ... similar for G5 (character limit), G2 (weak hook), etc.

  return { content: spoke.content, violations };
}
```

**UX Implementation:**
```tsx
// CreativeConflictPanel.tsx
<ContentPreview>
  {violations.map((v, i) => (
    <HighlightedSpan
      key={i}
      start={v.startIndex}
      end={v.endIndex}
      color={v.severity === 'critical' ? '--accent-kill' : '--accent-warning'}
      tooltip={`${v.gate}: ${v.reason}`}
    />
  ))}
</ContentPreview>
```

**Rationale:** Follows the "Signal, Not Noise" UX principle. Users can immediately see WHERE to edit, reducing Review Tax from "read entire draft" to "fix highlighted section."
