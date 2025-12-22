---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - brainstorming-session-2025-12-19.md
workflowType: 'product-brief'
lastStep: 6
status: 'complete'
completedAt: '2025-12-20'
project_name: 'full-stack'
user_name: 'Williamshaw'
date: '2025-12-19'
product_name: 'The Agentic Content Foundry'
north_star_metric: 'Zero-Edit Rate'
---

# Product Brief: The Agentic Content Foundry

**Date:** 2025-12-19
**Author:** Williamshaw

---

## Executive Summary

**The Agentic Content Foundry** is a deterministic content production engine that solves the Volume vs. Quality paradox plaguing content creators. Unlike generic AI tools that generate low-engagement "slop," this system operationalizes proven marketing psychology directly into its codebase.

The platform enables users to produce **300+ high-engagement content pieces per month** through a Hub-and-Spoke architecture that mechanically fractures a single "Source of Truth" into 20+ platform-specific assets. An adversarial AI architecture (Creator vs. Critic agents) ensures every piece meets "Crack Bait" quality standards before human review — transforming users from exhausted writers into confident Executive Producers.

**Target Outcome:** Users spend 30 minutes reviewing pre-validated content instead of 10+ hours creating from scratch.

---

## Core Vision

### Problem Statement

Content creators face an impossible trade-off: **volume or quality — pick one.**

To grow on modern platforms, creators need consistent, high-volume output (10+ pieces/day across channels). But current AI tools produce generic, psychologically-flat content that fails to capture attention in a fragmented digital landscape. The result: creators either burn out trying to produce quality at scale, or they publish AI-generated noise that damages their brand.

### Problem Impact

| Pain Point | Consequence |
|------------|-------------|
| **"I don't know what to post"** | Hours lost staring at blank screens |
| **Inconsistent output** | Algorithm punishment, audience drift |
| **Generic AI content** | Low engagement, brand dilution |
| **No quality assurance** | Publishing mediocre content unknowingly |
| **No learning loop** | Repeating mistakes, missing what works |

The deeper cost: **Opportunity loss.** Every day without systematic content production is a day competitors capture attention that could have been theirs.

### Why Existing Solutions Fall Short

| Solution Type | Gap |
|---------------|-----|
| **Generic AI Writers** | Optimize for "correctness," not psychological conversion |
| **Content Calendars** | Help organize, but don't solve the creation problem |
| **Copywriting Courses** | Teach principles but don't operationalize them |
| **Social Media Tools** | Scheduling/analytics, not content generation |
| **Prompt Libraries** | Starting points, but no quality validation |

**The fundamental gap:** No existing solution combines **marketing psychology expertise**, **production automation**, and **quality assurance** into a single system.

### Proposed Solution

**The Agentic Content Foundry** — a three-pillar content production system:

**Pillar 1: Hub-and-Spoke Logic (The Strategy)**
- User provides ONE "Source of Truth" (offer document, transcript, or raw idea)
- System treats this as the "Hub" and mechanically fractures it into 20+ "Spokes"
- Content types: Tweets, Threads, LinkedIn posts, Scripts, Carousels, Articles
- **Result:** 300 pieces/month becomes mathematical certainty, not manual grind

**Pillar 2: Adversarial Quality Gate (The Moat)**
- **Creator Agent:** Generates content from Hub source material
- **Critic Agent:** Grades on Hook Strength, Curiosity Gaps, Dream Prospect alignment
- Self-healing loop: Failed content gets regenerated with specific feedback
- **Result:** Users only review 9/10 quality drafts — mediocrity self-rejects

**Pillar 3: Mission Control Dashboard (The Interface)**
- User role shifts from "Writer" to "Executive Producer"
- High-level view of the content assembly line
- Visual flow: Drafting → Validating → Ready for Review → Published
- Performance tracking: Predicted vs. actual engagement → Golden Nugget discovery

**Technical Backbone:**
- **Brain:** Cloudflare Vectorize (RAG on market research insights)
- **Nervous System:** Cloudflare Workflows (multi-step agent orchestration)
- **Memory:** Drizzle ORM + D1 (asset lineage tracking with parent/child relationships)

### Key Differentiators

| Differentiator | Why It Matters | Why It's Defensible |
|----------------|----------------|---------------------|
| **Psychology-First AI** | Optimizes for conversion, not just coherence | Proprietary prompting from proven frameworks |
| **Adversarial Architecture** | Self-healing quality without human bottleneck | Novel Creator/Critic agent pattern |
| **Hub-and-Spoke Production** | Volume becomes systematic, not heroic | Lineage tracking prevents content drift |
| **Learning Loop** | System gets smarter from performance data | Predicted vs. actual feedback improves Critic |
| **Executive Producer UX** | Review, don't create | Mission Control dashboard, not blank page |

---

## Target Users

### Core Positioning

The Agentic Content Foundry serves users who have **graduated past generic AI tools**. They don't need "a writing assistant" — they need a **Content Factory** that scales their expertise without diluting their voice.

**Key Insight:** These users are "AI-Optimistic but Prompt-Fatigued." They've tried ChatGPT, Jasper, Copy.ai. They're tired of sounding like everyone else. They want to drop a Research PDF and get a Content Bible back.

---

### Primary User Segments: "The High-Stakes Creators"

Users whose **income is directly tied to platform algorithms** feel this pain most acutely.

#### Persona 1: The Fractional CMO / Content Agency

| Attribute | Detail |
|-----------|--------|
| **Role** | Agency owner or fractional marketing executive |
| **Scale** | Managing 5+ client accounts simultaneously |
| **Current Pain** | 40+ hours/week on research and content ideation |
| **Target State** | 4 hours to produce a month's worth of strategic content per client |
| **Willingness to Pay** | $500-$1,000/mo (replaces $10k agency retainer or $5k junior creative) |

**Day in the Life:**
- Monday: Receives client brief and market research
- Tuesday-Thursday (OLD): Manually crafts 50+ content pieces per client
- Tuesday-Thursday (NEW): Uploads research → Reviews 300 pre-validated concepts → Approves in bulk
- Friday: Delivers content calendar to client with confidence

**Success Moment:** "I just delivered a month of content to 5 clients in one day instead of one week."

---

#### Persona 2: The Personal Brand Consultant

| Attribute | Detail |
|-----------|--------|
| **Role** | Expert/consultant building authority through content |
| **Expertise** | Deep domain knowledge (coaching, consulting, professional services) |
| **Current Pain** | Has the research but lacks the "Creative Director brain" for 300 angles |
| **Target State** | Transform expertise into consistent, distinctive content at scale |
| **Willingness to Pay** | $200-$500/mo (replaces hours of creative struggle) |

**Day in the Life:**
- Has a signature framework and proven methodology
- Knows their audience deeply (has done the research)
- OLD: Stares at blank screen, produces 2-3 posts/week, sounds generic
- NEW: Uploads framework → System generates 300 angles in their voice → Reviews and schedules

**Success Moment:** "Finally, my content sounds like ME at scale, not like AI slop."

---

#### Persona 3: High-Growth Media Team

| Attribute | Detail |
|-----------|--------|
| **Role** | Content/marketing team at Series A/B startup |
| **Scale** | 2-5 person team needing enterprise-level output |
| **Current Pain** | Need to "flood the zone" with authority content to lower CAC |
| **Target State** | 10x content output without 10x headcount |
| **Willingness to Pay** | $500-$1,000/mo (fraction of a hire) |

**Day in the Life:**
- Aggressive growth targets from leadership
- Limited team bandwidth
- OLD: Hire agencies ($10k+/mo) or burn out internal team
- NEW: Internal team becomes "Executive Producers" — curating, not creating

**Success Moment:** "We hit our content KPIs without adding headcount."

---

### User Context: "The Sophisticated Bottleneck"

| Dimension | Profile |
|-----------|---------|
| **Content Maturity** | Established — already have research, voice, and presence |
| **Technical Sophistication** | AI-Optimistic but Prompt-Fatigued — want systems, not prompts |
| **Team Size** | Solo to small team (1-5 people) |
| **Budget Sensitivity** | Premium willingness — value time savings over cost savings |
| **Core Constraint** | Not starting, but **scaling without dilution** |

**Key Behavior:** They've tried generic AI and been disappointed. They're not looking for "cheaper" — they're looking for "better."

---

### Secondary Users: "The Guardians"

#### The Editor / Compliance Officer

| Attribute | Detail |
|-----------|--------|
| **Role** | Content reviewer in regulated industries (Finance, Health, Legal) |
| **Need** | Visibility into AI decision-making for compliance |
| **Feature Requirement** | Review Dashboard showing Agent self-correction logs |
| **Example** | "I rejected this hook because it violated brand stance on X" |

#### The Client (Agency Model)

| Attribute | Detail |
|-----------|--------|
| **Role** | End client receiving content from agency |
| **Need** | High-fidelity view of 300 concepts for bulk approval |
| **Feature Requirement** | Real-time collaborative review via WebSocket |
| **Example** | Client can "Approve All" or cherry-pick favorites |

---

### User Journey: The Executive Producer Experience

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THE EXECUTIVE PRODUCER WORKFLOW                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. INGEST                2. ALIGN                3. PRODUCE        │
│  ─────────               ────────               ──────────          │
│  Upload Market           Agent compares          Workflows trigger  │
│  Research PDF            to Dream Buyer          300 parallel       │
│  (The "Fuel")            Avatar (The "Compass")  generation tasks   │
│                                                                     │
│                          ┌─────────────────┐                        │
│                          │ Persona-Refiner │                        │
│                          │ "Does this idea │                        │
│                          │  trigger FOMO   │                        │
│                          │  or Authority?" │                        │
│                          └─────────────────┘                        │
│                                                                     │
│  4. CURATE                                                          │
│  ─────────                                                          │
│  "Tinder-style" UI                                                  │
│  Swipe to train the Brain                                           │
│  Approve → Schedule                                                 │
│  Reject → Improve model                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Discovery:** Word of mouth from other "High-Stakes Creators" or content marketing thought leaders
**Onboarding:** Upload first research document, watch system generate 300 concepts
**Core Usage:** Weekly "Curation Sessions" — 30 minutes to review and approve content
**Success Moment:** First content batch outperforms manually-created content
**Long-term:** System learns their voice; quality improves with each batch

---

### Dream Prospect Integration

**Strategy:** Use Halo V2 research AND refine for this context.

| Layer | Implementation |
|-------|----------------|
| **Grounding Layer** | Halo V2 "Dream Buyer" data populates Vectorize index |
| **Persona-Refiner Step** | Agent validates content against avatar triggers before generation |
| **Validation Question** | "Does this content trigger the 'fear of missing out' or 'desire for authority' identified in their profile?" |

---

## Success Metrics

### North Star Metric

**Zero-Edit Rate:** The percentage of generated concepts that users "Approve" without making text changes.

| Threshold | Meaning |
|-----------|---------|
| **< 40%** | Agent hasn't captured Brand DNA — users still "working" |
| **40-60%** | Functional but not magical — room for improvement |
| **> 60%** | ✅ SUCCESS — Agent knows their business, "Executive Producer" achieved |
| **> 80%** | Exceptional — approaching "Approve All" territory |

**Why This Matters:** If the AI produces 300 pieces but the user has to edit 200 of them, the "Executive Producer" dream dies. If they can "Approve All" because the Agent knows their business that well, we've won.

---

### User Success Metrics: The "Executive Producer" Lifestyle

These metrics prove the user has shifted from a "worker" to a "director."

| Metric | Definition | Target | Signal |
|--------|------------|--------|--------|
| **Volume 300 Benchmark** | % of users who export a full Content Bible (300 concepts) within first 7 days | > 70% | Users trust the system for production-scale output |
| **Creative Velocity** | Time to First Draft — from upload to first 10 high-fidelity content pillars | < 60 seconds | Replaces 2+ hours of manual outlining |
| **Zero-Edit Rate** | % of concepts approved without text changes | > 60% | Agent has captured Brand DNA |
| **Curation Time** | Weekly time spent in "Review" mode | < 30 min/week | 10x time savings vs. manual creation |

**Success Moment:** User receives 300 concepts, reviews in 30 minutes, approves 80%+ without edits, schedules for the month.

---

### System Health Metrics: The "Agentic Logic" Engine

How we measure the engine using Agents SDK and AI Gateway.

| Metric | Definition | Target | Action if Missed |
|--------|------------|--------|------------------|
| **Critic Pass Rate (G2)** | % of content scoring 7+ on Hook Strength (1-10 scale) on first pass | > 85% | Improve Creator Agent prompting |
| **Self-Healing Efficiency** | Average regeneration loops before Critic approval | < 1.2 loops | Strengthen Vectorize grounding data |
| **Context Density** | Ratio of Research Facts used per 100 words | TBD baseline | Indicates Deep Research integration vs. generic fluff |
| **Cache Hit Ratio** | % of research queries served from AI Gateway cache | > 70% | Faster performance, lower COGS |
| **Predictive Accuracy (G7)** | Correlation between predicted and actual engagement | r > 0.6 | Golden Nugget discovery reliability |

**System Health Dashboard:** Real-time monitoring of agent performance, loop efficiency, and cache economics.

---

### Business Objectives: The "Foundry" Economics

| Metric | 3-Month Target (Beta/Launch) | 12-Month Target (Scale) |
|--------|------------------------------|-------------------------|
| **Active Agents** | 100 "Always-On" Business Agents | 2,500+ Active Agents |
| **Expansion Revenue** | 10% of users adding second Brand/Client project | 30% (Agency-market fit validated) |
| **Net Revenue Retention** | > 90% (users don't leave once "Brain" is trained) | > 110% (upselling multimodal credits) |
| **LTV / CAC Ratio** | 2:1 (Establishing the model) | > 4:1 (Dominating the niche) |

**Unit Economics Target:**
- Premium pricing: $200-$1,000/mo
- COGS: < 30% of revenue (AI inference + storage)
- Gross margin: > 70%

---

### Key Performance Indicators (KPIs)

#### Leading Indicators (Predict Success)
| KPI | What It Signals |
|-----|-----------------|
| **Day 1 Content Bible Completion** | User understood the value prop immediately |
| **Critic Pass Rate Trend** | Agent quality improving over time |
| **Curation Session Frequency** | Users building habit, engaged with system |

#### Lagging Indicators (Confirm Success)
| KPI | What It Confirms |
|-----|------------------|
| **Zero-Edit Rate** | Brand DNA capture achieved |
| **Net Revenue Retention** | Product-market fit validated |
| **Golden Nugget Hit Rate** | Predictive model is reliable |

---

### The "Golden Nugget" Metric: The "Aha!" Moment

The ultimate signal that the Foundry is working.

**Definition:** The delta between the Agent's Predicted Engagement Score (G7) and Actual Engagement when content is published.

| Outcome | Meaning |
|---------|---------|
| **Predicted "Golden Nugget" outperforms by 3x+** | ✅ System identified a viral opportunity |
| **Prediction within ±20% of actual** | Reliable baseline predictions |
| **Systematic under/over prediction** | Model needs recalibration |

**Success Story:** Agent flags a hook as "Golden Nugget potential." User publishes it. It outperforms their baseline by 5x. User now trusts the system's predictions and prioritizes its recommendations.

---

## MVP Scope

### Core Features

**Feature 1: Source of Truth Ingestion**
| Component | Implementation |
|-----------|---------------|
| **Input Handler** | Upload PDF, transcript, or raw text as "Hub" content |
| **RAG Pipeline** | Vectorize embeddings for market research + brand DNA |
| **Brand DNA Capture** | Initial "teach the system" flow for voice calibration |

**Feature 2: Multimodal Hub-to-Spoke Engine**

| Component | Implementation | 2025 Multi-Platform Output |
|-----------|---------------|---------------------------|
| **Hub Processing** | Agentic Deep Scan: Agent extracts core arguments, "aha" moments, and visual metaphors | The "Master Script": A modular base that stores the core logic for all spokes |
| **Spoke Generation** | Recursive Fracturing: Agent triggers parallel Workflows for different media types | **25+ Total Spokes per Hub** (see breakdown below) |
| **Platform Targeting** | Native Optimization: Agent adapts "hooks" based on platform-specific retention data | X, LinkedIn, Meta (IG/FB), TikTok, YouTube |
| **Volume Target** | 1 Hub → 25 Spokes: A comprehensive, platform-specific content blitz | Full Ecosystem Coverage (Text + Video + Static) |

**The 25-Spoke Breakdown (Per Hub)**

**1. The Video Spoke Set (Vertical 9:16)**

| Platform | Quantity | Format |
|----------|----------|--------|
| **TikTok** | 3 | 1x "Hot Take" Hook, 1x "Step-by-Step" Tutorial, 1x "Stitch-ready" Opinion |
| **IG Reels** | 3 | 1x Aesthetic/Atmospheric, 1x Fast-cut Informational, 1x Behind-the-scenes/Vibe |
| **YouTube Shorts** | 2 | 1x Search-optimized "How-to," 1x "Did you know?" Fact |

**2. The Visual Spoke Set (Static/Carousel)**

| Platform | Quantity | Format |
|----------|----------|--------|
| **Instagram/FB Carousels** | 2 | 7-slide "Deep Dive" and a 3-slide "Quick Summary" |
| **LinkedIn PDF Carousels** | 2 | Professional, data-heavy slides for "Authority Building" |
| **Meta Static Ads** | 3 | Variations of "Dream Buyer" pain-point image with text overlay |

**3. The Text Spoke Set (High Velocity)**

| Platform | Quantity | Format |
|----------|----------|--------|
| **X/Twitter** | 6 | 1x Viral Thread (8+ posts), 3x Short "Hooks," 2x "Contrarian" takes |
| **LinkedIn** | 4 | 1x "Personal Story" tie-in, 1x Industry Analysis, 2x Polls with context |

**Agentic Differentiation (Why This Dominates)**

| Capability | Traditional Tools | The Foundry (Agents SDK) |
|------------|------------------|--------------------------|
| **Script Doctor Agent** | Simple reformatting | Queries Vectorize for "TikTok Hook Best Practices" — payoff within first 3 seconds |
| **Stateful Variety** | Repetitive output | SQLite memory ensures Spoke #1 "Educational" → Spoke #2 "Entertaining" — no AI bot repetition |
| **Visual Consistency** | Manual design work | Workers AI (Stable Diffusion) generates consistent B-roll/backgrounds across all platforms |

**Feature 3: Adversarial Quality Gate**
| Gate | Implementation | MVP Threshold |
|------|----------------|---------------|
| **G2: Hook Strength** | Critic Agent scores 0-100 | Must exceed 80 |
| **G4: Brand Voice** | Few-shot comparison to user-approved samples | Pass/Fail |
| **G5: Platform Compliance** | Validates format specs (duration, dimensions, character limits) | Pass/Fail |
| **Self-Healing Loop** | Regenerate with Critic feedback if failed | Max 3 attempts |

**Feature 4: Executive Producer Dashboard (Mission Control)**
| Component | Implementation |
|-----------|---------------|
| **Content Queue** | View all 25 spokes per Hub with status indicators, grouped by platform |
| **Swipe Review** | Approve/Reject interface with video preview |
| **Bulk Actions** | "Approve All" by platform or content type |
| **Export** | Download approved content as Content Bible (CSV/JSON) + media files (ZIP) |

**Feature 5: ContentValidationWorkflow**
| Step | Agent | Action |
|------|-------|--------|
| 1 | Creator | Generate draft from Hub source (routes to appropriate media workflow) |
| 2 | Critic | Evaluate hook strength (0-100) + platform compliance |
| 3 | Creator | Regenerate if score < 80 (with feedback) |
| 4 | System | Mark as "Ready for Review" |
| 5 | Human | Dashboard approval (G8) |

---

### Out of Scope for MVP

| Feature | Reason for Deferral | Target Phase |
|---------|---------------------|--------------|
| **G1: Avatar Relevance Pre-Check** | Adds complexity; G2+G4+G5 sufficient for quality | V1.1 |
| **G7: Engagement Prediction Model** | Requires performance data to train | V1.2 |
| **Golden Nugget Discovery** | Needs actual vs. predicted delta data | V1.2 |
| **Full Video Rendering** | Scripts + thumbnails first; full video assembly V2 | V2.0 |
| **Multi-Client/Agency Mode** | Single-user focus first; agency features post-validation | V2.0 |
| **Real-Time Performance Import** | Manual CSV import acceptable for MVP | V1.1 |
| **Advanced Analytics Dashboard** | Basic export sufficient; rich analytics later | V1.2 |
| **Direct Publishing APIs** | Export to external tools first; native publishing later | V1.1 |
| **A/B Testing Framework** | Manual testing first; automated split-testing V2 | V2.0 |

---

### MVP Success Criteria

**Go/No-Go Decision Gates:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Zero-Edit Rate** | >40% within 2 weeks | Track approved vs. edited content |
| **Time to First Content Bible** | <60 minutes from signup | User session analytics |
| **Volume Achievement** | User generates 25+ spokes in first Hub | Content count tracking |
| **Return Usage** | 60% of users return for second session within 7 days | Cohort analysis |
| **Platform Coverage** | Users export to 3+ platforms per session | Export analytics |
| **Critic Accuracy** | Users agree with Critic scores 80%+ of time | Approval vs. rejection correlation |

**Validation Signals:**

- **Strong Signal**: Users use "Approve All" button (indicates trust in quality)
- **Strong Signal**: Users upgrade to higher tier for more Hubs/month
- **Strong Signal**: Users export video + text + visual (full multimodal adoption)
- **Weak Signal**: High edit rate (>60%) — Brand DNA capture needs improvement
- **Weak Signal**: Low return rate — Value proposition not landing
- **Weak Signal**: Single-platform exports only — Multimodal value not landing

---

### Future Vision

**Phase 1.1: Learning Loop (Month 2-3)**
- Import actual engagement metrics by platform (likes, comments, shares, saves)
- G7 Engagement Prediction model training per platform
- Golden Nugget identification and Creator Agent reinforcement
- Platform-specific optimization recommendations

**Phase 1.2: Intelligence Layer (Month 3-4)**
- Predictive content recommendations based on G7
- Cross-platform trend detection from high-performers
- Automated content calendar with platform-optimal posting times
- "What's Working" dashboard with cross-platform insights

**Phase 2.0: Full Video Assembly (Month 6+)**
- Complete video rendering (not just scripts + thumbnails)
- Multi-client agency dashboard
- Direct publishing integrations (TikTok, IG, YouTube, X, LinkedIn APIs)
- Team collaboration and approval workflows
- A/B testing framework with automated winner selection

**Phase 3.0: Platform (Year 2)**
- Marketplace for "Brain Templates" (pre-trained brand voices by niche)
- API access for enterprise integrations
- White-label option for agencies
- Industry-specific vertical packages (Finance, Health, SaaS, etc.)
- AI-powered trend forecasting and content recommendations

---

### Technical MVP Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 MULTIMODAL MVP TECHNICAL SCOPE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND (user-application)                                    │
│  ├── Upload Page (PDF/text/transcript input)                   │
│  ├── Review Dashboard (swipe interface with video preview)     │
│  ├── Platform Filter (view by TikTok/IG/LinkedIn/X/YouTube)    │
│  └── Export Page (Content Bible + media ZIP download)          │
│                                                                 │
│  BACKEND (data-service)                                         │
│  ├── ContentValidationWorkflow (Cloudflare Workflows)          │
│  │   ├── TextSpokeWorkflow (tweets, threads, LinkedIn)         │
│  │   ├── VideoSpokeWorkflow (scripts + thumbnails)             │
│  │   └── VisualSpokeWorkflow (carousels, static images)        │
│  ├── Creator Agent (Workers AI - text generation)              │
│  ├── Critic Agent (Workers AI - quality scoring)               │
│  ├── Script Doctor Agent (platform-specific optimization)      │
│  ├── Visual Agent (Workers AI - Stable Diffusion)              │
│  └── Brand DNA Vectorize Index                                 │
│                                                                 │
│  DATA (packages/data-ops)                                       │
│  ├── contentAssets table (with parentId lineage + mediaType)   │
│  ├── brandDnaDocuments table (source material)                 │
│  ├── platformSpecs table (format requirements per platform)    │
│  └── userProjects table (scope isolation)                      │
│                                                                 │
│  STORAGE (R2)                                                   │
│  ├── Generated images (thumbnails, carousel slides, B-roll)   │
│  └── Video scripts with visual cue markers                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
