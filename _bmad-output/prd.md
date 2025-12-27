---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
workflowStatus: complete
completedAt: '2025-12-20'
inputDocuments:
  - analysis/product-brief-full-stack-2025-12-19.md
  - analysis/brainstorming-session-2025-12-19.md
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
lastStep: 4
project_name: 'full-stack'
user_name: 'Williamshaw'
date: '2025-12-20'
---

# Product Requirements Document - The Agentic Content Foundry

**Author:** Williamshaw
**Date:** 2025-12-20

---

## Executive Summary

**The Agentic Content Foundry** is a deterministic content production engine that solves the Volume vs. Quality paradox plaguing content creators. Unlike generic AI tools that generate low-engagement "slop," this system operationalizes proven marketing psychology directly into its codebase.

The platform enables users to produce **300+ high-engagement content pieces per month** through a Hub-and-Spoke architecture that mechanically fractures a single "Source of Truth" into 25+ platform-specific assets. An adversarial AI architecture (Creator vs. Critic agents) ensures every piece meets "Crack Bait" quality standards before human review — transforming users from exhausted writers into confident **Executive Producers**.

**Target Outcome:** Users spend 30 minutes reviewing pre-validated content instead of 10+ hours creating from scratch.

### The Stateful Competitive Moat

| Moat Layer | Implementation | Why It's Defensible |
|------------|----------------|---------------------|
| **From Coherence to Conversion** | Critic Agent compares drafts against 10,000+ top-performing hooks in user's specific niche via Vectorize | Not just "sounds good" — optimized for Stopping Power |
| **Self-Healing Memory** | Rejection reasons stored in SQLite; Creator queries past failures before regeneration | Agent actually learns user's brand preferences in real-time |
| **True Multimodal Orchestration** | Cloudflare Workflows generate 25 spokes in parallel; WebSocket-hydrated Production Queue | Users see progress, not loading spinners |
| **Zero-Egress Economics** | R2 storage for images/video spokes | Agencies manage 100+ clients without bandwidth cost death spiral |
| **Per-Client Intelligence** | Brand DNA isolation via D1; learning preferences stored per-client, not per-user | 100 individual Agents, each learning what works for that specific audience |

### The Kill Chain: Managing Content at Scale

The system treats **Hubs as Genetic Code** and **Spokes as Expression**:

| Kill Level | Logic | Action |
|------------|-------|--------|
| **Hub Kill** | Cascading Auto-Rejection | All 25 child spokes archived; active workflows halted |
| **Pillar Kill** | Pruning | Only spokes tied to that psychological angle deleted |
| **Spoke Survival** | Mutation Rule | Manually edited spokes are "promoted" to Manual Assets and survive parent death |

### The Bulk Approval Engine (Solving the Review Tax)

| Feature | Logic | UX Impact |
|---------|-------|-----------|
| **G7 Filter** | Show only Top 10% across all Hubs | Approve "Winners" in 60 seconds |
| **Kill Switch** | One-click delete for Hubs scoring < 5 | Instantly clears 25 bad spokes |
| **Clone Best** | Re-Spoke high performers (G7 > 9.5) | "Give me 10 more variations of exactly this" |

### What Makes This Special

1. **Psychology-First AI** — Optimizes for conversion via "Crack Bait" scoring, not just grammatical coherence
2. **Adversarial Architecture** — Creator vs. Critic agents with self-healing loops that learn from rejection
3. **Hub-and-Spoke Production** — 1 Source of Truth → 25+ deterministic platform-specific assets
4. **Executive Producer UX** — Review dashboard with Tree Map, not blank page with cursor
5. **Real-Time Collaboration** — `useAgent` hook allows Agency + Client to "Live Direct" generation

---

## Project Classification

| Dimension | Value |
|-----------|-------|
| **Technical Type** | `saas_b2b` — Multi-tenant platform with dashboard, agency model |
| **Domain** | MarTech / Content Tech (no regulated compliance) |
| **Complexity** | Medium-High — Agentic orchestration, multimodal generation, real-time collaboration |
| **Project Context** | Greenfield — new product |

**Key Technical Considerations:**
- Multi-tenant Brand DNA isolation (Durable Objects + D1)
- Permission model: Agency → Client collaboration flows
- Subscription model: Usage-based (Hubs/month) + seat-based potential
- Real-time infrastructure: WebSocket for Production Queue hydration

---

## Success Criteria

### North Star Metric: Zero-Edit Rate

The percentage of generated concepts that users "Approve" without making text changes.

| Threshold | Meaning | Action |
|-----------|---------|--------|
| < 40% | Agent hasn't captured Brand DNA | Trigger Grounding Audit |
| 40-60% | Functional but not magical | Continue training |
| **> 60%** | ✅ SUCCESS — "Executive Producer" achieved | Baseline target |
| > 80% | Exceptional — "Approve All" territory | Upsell signal |

---

### User Success

**The "Executive Producer" Experience**

| Metric | Definition | Target | Signal |
|--------|------------|--------|--------|
| **Volume 300 Benchmark** | % users exporting full Content Bible within 7 days | > 70% | Users trust the system for production-scale output |
| **Creative Velocity** | Time to first 10 high-fidelity content pillars | < 60 seconds | Replaces 2+ hours of manual outlining |
| **Zero-Edit Rate** | % concepts approved without text changes | > 60% | Agent has captured Brand DNA |
| **Curation Time** | Weekly time in "Review" mode | < 30 min/week | 10x time savings vs. manual creation |

**The "Review Tax" Elimination**

| Metric | Definition | Target | Why It Matters |
|--------|------------|--------|----------------|
| **Review Velocity** | Time per approval decision in Bulk Mode | < 6 seconds | If longer, G7/G2 visualization isn't clear enough |
| **Kill Chain Accuracy** | % users utilizing Hub-Level Kill vs. spoke-by-spoke deletion | > 90% | Proves user trust in parent/child hierarchy |
| **Clone Success Rate** | When user hits "Clone Best," % of variations also scoring G7 > 9 | > 70% | Validates the "more like this" algorithm |

**Success Moment:** User receives 300 concepts, reviews in 30 minutes, approves 80%+ without edits, schedules for the month.

---

### Business Success

**The "Foundry" Economics**

| Metric | 3-Month Target | 12-Month Target |
|--------|----------------|-----------------|
| **Active Agents** | 100 "Always-On" Business Agents | 2,500+ Active Agents |
| **Expansion Revenue** | 10% adding second Brand/Client project | 30% (Agency-market fit validated) |
| **Net Revenue Retention** | > 90% (users don't leave once "Brain" trained) | > 110% (upselling multimodal credits) |
| **LTV/CAC Ratio** | 2:1 (Establishing the model) | > 4:1 (Dominating the niche) |

**Unit Economics Target:**
- Premium pricing: $200-$1,000/mo
- COGS: < 30% of revenue (AI inference + storage)
- Gross margin: > 70%

**Agency Scale Metrics**

| Metric | Definition | Target | Churn Risk If Missed |
|--------|------------|--------|----------------------|
| **Time-to-DNA** | Hubs processed before Client ID reaches > 60% Zero-Edit Rate | < 3 Hubs | High — agencies won't wait for 10 Hubs |
| **Per-Client Learning Velocity** | Days to reach baseline Zero-Edit Rate | < 14 days | Medium — patience window for new clients |
| **Margin Expansion** | Human-hours per 100 assets after 3 months of training | < 1 hour (from 10 hour baseline) | Critical — 10x efficiency is the promise |

---

### Technical Success (System Health)

**The "Agentic Logic" Engine**

| Metric | Definition | Target | Action if Missed |
|--------|------------|--------|------------------|
| **Critic Pass Rate (G2)** | % content scoring 7+ on Hook Strength on first pass | > 85% | Improve Creator Agent prompting |
| **Self-Healing Efficiency** | Average regeneration loops before Critic approval | < 1.2 loops | Strengthen Vectorize grounding data |
| **Context Density** | Research Facts used per 100 words | TBD baseline | Deep Research integration vs. generic fluff |
| **Cache Hit Ratio** | % research queries served from AI Gateway cache | > 70% | Faster performance, lower COGS |
| **Predictive Accuracy (G7)** | Correlation between predicted and actual engagement | r > 0.6 | Golden Nugget discovery reliability |

**The Self-Correcting System**

| Metric | Definition | Trigger | Action |
|--------|------------|---------|--------|
| **Drift Metric** | Divergence between user's manual edits ("mutations") and Agent's original output | High drift detected | Auto-trigger "Grounding Audit" — pull fresh data from SQLite state into Vectorize index |
| **Grounding Audit Frequency** | How often system self-corrects per client | < 1x/month after stabilization | If frequent, Critic rubric fundamentally misaligned |

**The Isolation Gate (MVP Critical)**

| Requirement | Definition | Target | Why It's MVP |
|-------------|------------|--------|--------------|
| **Context Switch Latency** | Time to swap SQLite memory + Vectorize grounding between Client A and Client B | < 100ms | Agencies managing 100+ clients cannot wait for cold starts |
| **State Isolation** | Zero data leakage between client contexts | 100% | Brand DNA contamination is fatal for agency trust |
| **Durable Object Hydration** | Time to spin up a dormant client's Agent state | < 500ms | "Instant" feel when returning to inactive client |

---

### Measurable Outcomes

**Leading Indicators (Predict Success)**

| KPI | What It Signals |
|-----|-----------------|
| Day 1 Content Bible Completion | User understood the value prop immediately |
| Critic Pass Rate Trend | Agent quality improving over time |
| Curation Session Frequency | Users building habit, engaged with system |
| Kill Chain Usage Rate | Users trust hierarchical content management |

**Lagging Indicators (Confirm Success)**

| KPI | What It Confirms |
|-----|------------------|
| Zero-Edit Rate | Brand DNA capture achieved |
| Net Revenue Retention | Product-market fit validated |
| Golden Nugget Hit Rate | Predictive model is reliable |
| Time-to-DNA < 3 Hubs | Agency model is viable |

**The "Golden Nugget" Metric**

The delta between Agent's Predicted Engagement Score (G7) and Actual Engagement when published.

| Outcome | Meaning |
|---------|---------|
| Predicted "Golden Nugget" outperforms by 3x+ | ✅ System identified viral opportunity |
| Prediction within ±20% of actual | Reliable baseline predictions |
| Systematic under/over prediction | Model needs recalibration |

---

## Product Scope

### MVP - Minimum Viable Product

**Go/No-Go Decision Gates:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Zero-Edit Rate | > 40% within 2 weeks | Approved vs. edited content |
| Time to First Content Bible | < 60 minutes from signup | Session analytics |
| Volume Achievement | 25+ spokes in first Hub | Content count tracking |
| Return Usage | 60% return within 7 days | Cohort analysis |
| Platform Coverage | 3+ platforms per session | Export analytics |
| Critic Accuracy | 80%+ user agreement with scores | Approval/rejection correlation |
| **Isolation Gate** | < 100ms context switch | Durable Object latency metrics |

**MVP Features:**
1. Source of Truth Ingestion (PDF, transcript, raw text)
2. Multimodal Hub-to-Spoke Engine (25 spokes per Hub)
3. Adversarial Quality Gate (G2, G4, G5 + self-healing loop)
4. Executive Producer Dashboard (Bulk Approval Engine)
5. ContentValidationWorkflow (Creator/Critic agents)
6. **Multi-Client Isolation** (Durable Objects + instant context switching)

**Validation Signals:**
- ✅ Strong: Users use "Approve All" button (trust in quality)
- ✅ Strong: Users upgrade to higher tier for more Hubs/month
- ✅ Strong: Users export video + text + visual (full multimodal adoption)
- ✅ Strong: Agency users onboard 3+ clients in first month
- ⚠️ Weak: High edit rate (> 60%) — Brand DNA capture needs improvement
- ⚠️ Weak: Low return rate — Value proposition not landing

### Growth Features (Post-MVP)

**Phase 1.1: Learning Loop (Month 2-3)**
- Import actual engagement metrics by platform
- G7 Engagement Prediction model training per platform
- Golden Nugget identification and Creator Agent reinforcement
- Platform-specific optimization recommendations

**Phase 1.2: Intelligence Layer (Month 3-4)**
- Predictive content recommendations based on G7
- Cross-platform trend detection from high-performers
- Automated content calendar with platform-optimal posting times
- "What's Working" dashboard with cross-platform insights

### Vision (Future)

**Phase 2.0: Full Production (Month 6+)**
- Complete video rendering (not just scripts + thumbnails)
- Multi-client agency dashboard with per-client isolation
- Direct publishing integrations (TikTok, IG, YouTube, X, LinkedIn APIs)
- Team collaboration and approval workflows
- A/B testing framework with automated winner selection

**Phase 3.0: Platform (Year 2)**
- Marketplace for "Brain Templates" (pre-trained brand voices by niche)
- API access for enterprise integrations
- White-label option for agencies
- Industry-specific vertical packages

---

## User Journeys

### Journey Overview

| # | Journey | Persona | Role | Key Insight |
|---|---------|---------|------|-------------|
| 1 | The Happy Path | Marcus Chen | Agency Account Manager | Bulk Approval Engine + Kill Chain = 30-minute curation |
| 2 | Emergency Calibration | Marcus Chen | Agency Account Manager | Voice-to-Grounding transforms system failure into collaboration |
| 3 | Client Review | Sarah Park | VP Marketing (Client) | Confidence tiering + real-time sync = 14-minute review of 62 pieces |
| 4 | Solo Creator Onboarding | Dr. Priya Sharma | Executive Coach | Voice + content upload → Brand DNA Report → 79% Zero-Edit on Day 1 |
| 5 | Compliance Audit | David Chen | Compliance Officer | G-Compliance Gate + full decision trail = regulator-ready documentation |

---

### Journey 1: Marcus Chen — The Agency Account Manager (Happy Path)

**Persona:** Marcus Chen, Agency Account Manager managing 47 active client accounts
**Context:** Each client has a distinct brand voice — from buttoned-up law firms to provocative SaaS startups.

**Day 1, Hour 0 — The Onboarding Blitz:**
Marcus connects 5 client folders in rapid succession: Research PDFs, Brand Guidelines, and "Top Performing Posts" for each. Within 10 minutes, he sees five distinct "Brand DNA Strength" scores appear on his dashboard — four green, one amber.

**The Weekly Sprint — Hub Ingestion:**
Every Monday, Marcus drops the week's source material. Today, a 60-minute podcast transcript for Client A. He watches the Production Queue hydrate via WebSocket — 10 Pillars materialize, but 3 immediately turn amber. The Critic Agent has flagged them: "Too generic for Client A's 'Contrarian' brand stance."

**The 30-Minute Curation — His Core Habit:**
Tuesday morning, 8:00 AM. Marcus opens the Bulk Approval Engine. He filters by G7 > 9 and sees 47 assets across his 5 priority clients. Each decision takes < 6 seconds:
- **Swipe Right:** Approved
- **Swipe Left:** Killed (Kill Chain cascades)
- **Edit:** Drift Metric logs his change

By 8:30 AM, he's reviewed 300 pieces and scheduled the Client Review links.

**Moment of Delight:** Month-end report shows human-hours per 100 assets dropped from 10 hours to 1.2 hours. The law firm client — previously most difficult — now has 72% Zero-Edit Rate.

**Requirements Revealed:** Bulk Approval Engine, Kill Chain, G7 Filtering, Client Isolation, Production Queue, WebSocket hydration

---

### Journey 2: Marcus Chen — Emergency Calibration (Voice-to-Grounding)

**Trigger:** Brand DNA Score drops to "Amber" or Zero-Edit Rate falls below 40%

**The Alert — 7:42 AM, Tuesday:**
Marcus is in an Uber. His phone buzzes:

> 🟠 **DNA Alert: Client B (Fintech Startup)**
> Zero-Edit Rate dropped to 38%. The Agent is missing context on your "Anti-Establishment" positioning.
> **[Record Voice Note]** | **[Snooze 4 hours]**

**The Voice Note — 30 Seconds:**
> "Client B is all about calling out the hypocrisy of legacy banks. They hate corporate jargon like 'solutions' and 'synergy.' They want to sound like a rebellious teenager who just realized their parents lied about the financial system. Think 'Fight Club' meets fintech."

**The Processing Pipeline (< 10 seconds):**
1. Whisper transcription
2. Entity extraction → Banned words: ["solutions", "synergy", "innovative"]
3. SQLite update → voice_markers, brand_stances tables
4. Vectorize update → embeddings refresh
5. Re-evaluation of pending spokes

**The Confirmation — 1 minute later:**
> ✅ **Brand DNA Updated: Client B**
> - 3 new banned words added
> - Updated stance: "Anti-establishment, Fight Club meets fintech"
> - Re-evaluating 12 pending spokes...

**Result:** Brand DNA jumps from 62% to 84%. Zero-Edit Rate projected at 67%.

**Requirements Revealed:** Voice-to-Grounding Pipeline, Whisper Integration, Inquiry Prompt Generator, Real-time SQLite/Vectorize Sync

---

### Journey 3: Sarah Park — The Client Review

**Persona:** Sarah Park, VP of Marketing at a Series B Fintech Startup
**Context:** She hired Marcus's agency and receives monthly content for approval.

**The Old World:** 47-page Google Doc, 4 hours on Sunday night, feedback scattered, week-long back-and-forth.

**The Shareable Production Link — Tuesday, 2:14 PM:**
Sarah taps a link from Marcus. No login required — email-verified, time-limited session.

**The Interface:**
- 62 pieces ready for review
- 47 pre-approved by agency (high confidence)
- 15 flagged for her input
- Estimated review time: 12 minutes

**The Trust Moment:**
Sarah browses 10 random "high confidence" pieces. They sound like her brand. She taps **"Approve All High-Confidence"** — 47 pieces move to "Scheduled."
*Time elapsed: 3 minutes.*

**The Flagged Items:**
Each has a reason: "Contains industry jargon," "Contrarian stance on crypto — confirm alignment," "References competitor — legal check?"

Sarah approves with a comment: "Love this. Add a line acknowledging crypto CAN work for sophisticated investors."

**Real-Time Sync:**
Her comment flows via WebSocket to Marcus's dashboard. The Agent generates a suggestion. Marcus accepts. Sarah sees the update in < 30 seconds.

**Completion — 14 minutes total:**
- 62 pieces reviewed
- 54 approved unchanged
- 6 approved with comments
- 2 killed
- Time saved vs. traditional: 3.5 hours

**Requirements Revealed:** Shareable Production Link, Confidence Tiering, Bulk Approve, Real-Time Comment Sync, Client Learning Loop

---

### Journey 4: Dr. Priya Sharma — The Solo Creator

**Persona:** Dr. Priya Sharma, Executive Coach & Leadership Consultant
**Context:** 15 years experience, written a book, spends 12+ hrs/week on content when she should be coaching at $800/hour.

**The Onboarding — Choose Your Path:**
- 📄 I HAVE EXISTING CONTENT (Upload posts, articles, book chapters)
- 🎤 I'D RATHER JUST TALK (5-minute voice note)
- 📚 BOTH — GIVE ME EVERYTHING

Priya selects **BOTH.**

**Step 1 — Content Upload (3 minutes):**
Book introduction, 10 best LinkedIn posts, podcast transcript. "Analyzing 47,000 words..."

**Step 2 — Voice Recording (5 minutes):**
Prompt: "Tell me about the leaders you love coaching — and the ones who drive you crazy."

Priya speaks candidly about "golden children MBAs" who aren't coachable, about real decisiveness vs. stubbornness.

**Step 3 — Brand DNA Report (2 minutes later):**
- Tone: Candid & Direct (92%), Contrarian (85%)
- Signature phrases detected: "The leaders who [X] are the ones who [Y]"
- Hot takes: "Failure is a prerequisite for great leadership"
- Banned words (never used): "synergy," "thought leader," "crushing it"
- **Brand DNA Strength: 84%**

**First Generation — 28 Seconds:**
Topic: "Why the best leaders change their minds publicly"
Result: 14 pieces (1 Hub + 13 Spokes) across LinkedIn, Twitter, TikTok, Carousel

**The Review — Swipe Interface:**
First LinkedIn post uses her exact phrasing from the voice note. "Real decisiveness isn't 'I've made up my mind.' It's 'I'm secure enough to change it when I'm wrong.'"

**Completion — 11 minutes:**
- 14 pieces reviewed
- 11 approved unchanged (79% Zero-Edit on Day 1)
- 2 approved with edits
- 1 killed

**Week 4 Results:**
- 12 hrs/week → 45 min/week
- 2-3 posts/week → 14 posts/week
- 8,000 followers → 12,400 (+55%)
- Zero-Edit Rate: 91%
- Coaching rate increased to $1,000/hour with waitlist

**Requirements Revealed:** Dual Onboarding Paths, Brand DNA Report, Swipe Review Interface, Edit-to-Learning Loop, Scheduler Export

---

### Journey 5: David Chen — The Compliance Officer

**Persona:** David Chen, Director of Marketing Compliance at Meridian Wealth Advisors (RIA)
**Context:** Every piece of client-facing content must comply with SEC/FINRA regulations.

**The Compliance Configuration:**
- Industry selected: Financial Services (SEC, FINRA)
- Compliance rules loaded: SEC Marketing Rule, FINRA 2210, Anti-Promissory Filter
- Auto-banned phrases: "Guaranteed returns," "Risk-free," "Outperform the market" (+ 47 more)
- Auto-flag triggers: Any percentage, testimonials, competitor comparisons

**The Compliance Dashboard:**
- 34 pieces generated
- 28 auto-approved (passed all gates)
- 6 flagged for compliance review
- 0 auto-rejected (hard violations)

**The Explainability Interface:**
David reviews LinkedIn #12: "Contains performance claim"

**Agent Decision Log:**
- G2 (Hook): PASS — Score 84
- G4 (Voice): PASS — No banned words
- G5 (Format): PASS — Within limits
- ⚠️ G-COMPLIANCE: FLAGGED
  - Trigger: "average portfolio increase of 12%"
  - Rule: SEC Marketing Rule 206(4)-1
  - Requirement: Net-of-fees disclosure, time period, disclaimer

**Suggested Revisions:**
- Option A: Add required disclosures (adds 180 characters)
- Option B: Remove specific percentage (maintains hook)
- Option C: Reframe as educational (no disclosure needed)

David selects Option B.

**The Rejection Log:**
14 auto-rejections before human review:
- "guarantee" → self-healed to "designed to help"
- "outperform 90% of hedge funds" → discarded (no compliant revision possible)
- Testimonial without disclaimer → self-healed with disclosure

**The Audit Export:**
Regulator-ready PDF with:
- Every piece generated
- Every gate applied
- Every auto-rejection with reasoning
- Every human decision with timestamp
- Full chain of custody

**Six Months Later — SEC Examination:**
Examiner: "This is remarkably thorough. Most firms can't tell me who approved what."
Result: Zero findings.

**Requirements Revealed:** Compliance Configuration, G-Compliance Gate, Agent Decision Log, Suggested Revisions, Audit Export, Attestation Workflow

---

### Journey Requirements Summary

| Capability Area | Journeys That Require It |
|-----------------|-------------------------|
| **Bulk Approval Engine** | 1, 3 |
| **Kill Chain (Hub/Pillar/Spoke)** | 1, 2 |
| **Voice-to-Grounding Pipeline** | 2, 4 |
| **Real-Time WebSocket Sync** | 1, 2, 3 |
| **Shareable Production Links** | 3 |
| **Brand DNA Report** | 4 |
| **Swipe Review Interface** | 1, 4 |
| **G-Compliance Gate** | 5 |
| **Audit Export (PDF)** | 5 |
| **Client Learning Loop** | 2, 3, 4 |
| **Multi-Client Isolation** | 1, 2, 3 |
| **Dual Onboarding (Voice + Upload)** | 4 |
| **Scheduler Integration** | 4 |
| **Attestation Workflow** | 5 |

---

### The Critic Rubric: Quality Gates

**G2: Hook Strength (0-100)**

| Score | Criteria |
|-------|----------|
| 90-100 | Pattern Interrupt + Specific Benefit + Curiosity Gap |
| 70-89 | Two of three elements present |
| 50-69 | Generic but relevant |
| 0-49 | AI Slop / No hook |

Threshold: Must exceed **80** to pass.

**G4: Brand Voice Alignment (Pass/Fail)**

| Check | Method |
|-------|--------|
| Banned Words | Query `client.banned_words` table |
| Required Phrases | Query `client.voice_markers` table |
| Tone Match | Few-shot comparison (cosine similarity > 0.7) |
| Contrarian Stance | Query `client.brand_stances` table |

**G5: Platform Compliance (Pass/Fail)**

| Platform | Limits |
|----------|--------|
| Twitter/X | 280 chars (post) / 25K (thread), < 3 hashtags |
| LinkedIn | 3,000 chars, professional tone |
| TikTok Script | 60 sec (~150 words), hook in 3 sec |
| IG Carousel | 2,200 caption, 10 slides, 1:1 or 4:5 |

**G6: Visual Metaphor Quality (0-100)**

| Score | Criteria |
|-------|----------|
| 90-100 | Novel + Brand-Aligned + Emotionally Resonant |
| 70-89 | Relevant but not novel |
| 50-69 | Generic stock photo territory |
| 0-49 | AI Cliché (robot + brain, handshake overlay) |

**G-Compliance: Regulatory Gate (Regulated Industries)**

| Layer | Check |
|-------|-------|
| 1 | Banned phrase detection (hard fail) |
| 2 | Pattern detection (percentages, testimonials) |
| 3 | Disclosure verification |
| 4 | Industry-specific validators |

**Self-Healing Loop:**
```
Creator generates → Critic evaluates →
IF failed: Write rejection to feedback_table →
Creator re-queries → Regenerate (max 3 attempts) →
IF still failing: Flag for human review
```

**Rubric Storage:** Hybrid — Base rubric hardcoded, `client.rubric_overrides` for brand-specific adjustments. Rubric learns from user approvals/rejections (Rubric Drift Protection).

---

## Innovation & Novel Patterns

### Detected Innovation Areas

| Innovation | Description | Competitive Differentiation |
|------------|-------------|----------------------------|
| **Adversarial Agent Architecture** | Creator (divergent) vs. Critic (convergent) agents in conflict-resolution loop | No existing AI content tool implements true adversarial quality gates with self-healing |
| **Hub-and-Spoke Production Model** | Single "Source of Truth" deterministically fractures into 25+ platform-specific assets | Competitors treat each platform as independent; this treats content as genetic code |
| **Self-Healing Memory** | Rejection reasons stored in SQLite; Creator queries past failures before regeneration | True machine learning loop within user session, not just prompt engineering |
| **Kill Chain Content Lifecycle** | Hub Kill cascades to all spokes; Spoke Survival via "Mutation Rule" for manually edited content | Novel content governance model treating hierarchy as living system |
| **Zero-Edit Rate as North Star** | Success measured by human acceptance, not AI fluency | First metric that captures "Brand DNA capture" as measurable outcome |
| **Voice-to-Grounding Pipeline** | 30-second voice note → entity extraction → instant Vectorize refresh | Real-time brand calibration without form-filling |

### The Calibration Moat: Voice-to-Grounding Deep Dive

When the Zero-Edit Rate drops or an "Amber" DNA alert triggers, the system shifts from **Production Mode** to **Calibration Mode**.

#### The Voice-to-Grounding Journey

**1. The Trigger (Detection):**
The Critic Agent logs five consecutive failures on a LinkedIn Spoke. The Drift Metric spikes because Marcus has manually rewritten 80% of the last Hub. The Agent pushes a WebSocket notification:

> "I'm losing your voice for Client A. Can we recalibrate?"

**2. The Input (Capture):**
Marcus taps the notification on his mobile dashboard. He sees the "Creative Conflict" (where the Agent failed). He taps the mic icon and records a 30-second voice note:

> "Stop using the 'professional consultant' tone. This founder is a high-stakes gambler. Use betting metaphors. Talk about 'doubling down' and 'expected value,' not 'strategic planning'."

**3. The Extraction (Processing):**
- **Whisper (Workers AI):** Transcribes the audio with high fidelity
- **Entity Extraction:** Agent identifies "Betting Metaphors," "Doubling Down," "Expected Value" as new Voice Markers
- **Stance Update:** Identifies "Gambler" as the new Brand Persona

**4. The Grounding (Update):**
- **SQLite:** Updates `client.voice_markers` and `client.brand_stances` tables
- **Vectorize:** Performs targeted search for "gambling and betting metaphors in business" to seed semantic memory
- **Critic Rubric:** Adds "Expected Value" to Required Phrases; flags "Strategic Planning" as Banned Word

**5. The Result (Validation):**
The Agent instantly regenerates the failed Spoke:

> "Why most CEOs are playing penny slots while we're doubling down on expected value..."

Marcus swipes right. Zero-Edit Rate restored.

#### Technical Flow of Calibration

| Step | Component | Technology |
|------|-----------|------------|
| Audio Storage | Transient Audio | R2 (temporary bucket) |
| Transcription | Speech-to-Text | Workers AI (`@cf/openai/whisper`) |
| Logic Update | State Modification | Agents SDK (`this.sql.exec`) |
| Semantic Refresh | RAG Update | Vectorize (`insert/upsert`) |

**The Calibration Moat:** In other tools, if the AI is "off," the user fights with a long system prompt. In the Foundry, the user just talks to the Agent like a human assistant. The Agents SDK ensures this "Voice Note" becomes a permanent part of that client's digital soul.

### Market Context & Competitive Landscape

**Existing Paradigm (What Competitors Do):**
- Generic AI writing tools (Jasper, Copy.ai) → generate content piece-by-piece
- Social media schedulers (Buffer, Hootsuite) → distribution, not creation
- Template systems (Canva) → visual-first, no brand intelligence

**The Gap This Innovation Fills:**
- No tool treats content production as **deterministic transformation** (Hub → Spokes)
- No tool implements **adversarial quality control** before human review
- No tool captures **Brand DNA as stateful intelligence** that learns from rejection
- No tool provides **Kill Chain governance** for content lifecycle management

**Why It's Defensible:**
1. **State is the Moat** — SQLite + Vectorize grounding per-client creates compound learning advantage
2. **Adversarial Architecture** — Creator + Critic as separate Durable Objects requires novel system design
3. **Zero-Egress Economics** — R2 storage makes 100-client agency scale economically viable
4. **10,000+ Hook Database** — Vectorize similarity search creates "Crack Bait" scoring accuracy

### Validation Approach

| Innovation | Validation Method | Success Criteria |
|------------|-------------------|------------------|
| **Adversarial Agents** | A/B test against single-agent generation | Critic-gated content achieves 15%+ higher Zero-Edit Rate |
| **Hub-and-Spoke** | User cohort analysis: Hub-first vs. platform-first workflows | Hub users produce 5x more content per session |
| **Self-Healing Memory** | Track regeneration loops before approval | Average < 1.2 loops (vs. 3+ without feedback) |
| **Kill Chain** | Monitor cascade vs. individual deletion | 90%+ users utilize Hub-level Kill for efficiency |
| **Voice-to-Grounding** | Pre/post Brand DNA Score comparison | Voice notes improve score by 15%+ within 60 seconds |
| **Zero-Edit Rate** | Correlation with user retention | Users with > 60% Zero-Edit Rate retain at 3x rate |

### Risk Mitigation

| Innovation Risk | Probability | Impact | Mitigation |
|-----------------|-------------|--------|------------|
| **Critic Bottleneck** | Medium | High | Async evaluation via Cloudflare Workflows; parallel critique |
| **Self-Healing Loops** | Low | Medium | Max 3 attempts before human flag; "Creative Conflict" notification |
| **Kill Chain Complexity** | Medium | Medium | Clear UI hierarchy (Tree Map); undo capability for accidental kills |
| **Voice Transcription Errors** | Low | Low | Whisper confidence scoring; fallback to text input |
| **Brand DNA Overfitting** | Medium | High | Drift Metric monitoring; automatic Grounding Audit triggers |

**Fallback Strategy:** If adversarial architecture underperforms, degrade gracefully to enhanced single-agent with quality scoring (still better than competitors, just less differentiated).

---

## SaaS B2B Specific Requirements

### Tenant Model

**Architecture:** Durable Object per-client with SQLite state isolation

| Component | Isolation Level | Technology |
|-----------|-----------------|------------|
| **Brand DNA** | Per-client | D1 tables with client_id partition |
| **Agent State** | Per-client | Durable Object (memory + storage) |
| **Content Assets** | Per-client | D1 with client_id foreign key |
| **Vectorize Index** | Per-client namespace | Vectorize namespaced queries |
| **Media Assets** | Per-client bucket path | R2 with client prefix |

**Context Switch Requirement:** < 100ms latency between clients (Isolation Gate)

### RBAC Matrix

| Permission | Agency Owner | Account Manager | Creator | Client Admin | Client Reviewer |
|------------|--------------|-----------------|---------|--------------|-----------------|
| Billing & Subscription | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/Remove Clients | ✅ | ❌ | ❌ | ❌ | ❌ |
| Team Management | ✅ | View | ❌ | ❌ | ❌ |
| Multi-Client Access | ✅ | ✅ | Assigned | ❌ | ❌ |
| Generate Hubs/Spokes | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve/Reject Content | ✅ | ✅ | ❌ | ✅ | ✅ |
| Kill Chain (Hub Kill) | ✅ | ✅ | ❌ | ✅ | ❌ |
| Voice Calibration | ✅ | ✅ | ❌ | ✅ | ❌ |
| Export Content | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | Assigned | ✅ | ❌ |
| API Access | ✅ | ❌ | ❌ | ❌ | ❌ |

### Subscription Tiers

| Tier | Price | Hubs/Month | Clients | Spokes/Hub | Features |
|------|-------|------------|---------|------------|----------|
| **Creator** | $49/mo | 10 | 1 | 15 | Core text spokes, manual export |
| **Pro** | $199/mo | 50 | 3 | 25 | All spokes, G7 predictions, scheduler |
| **Agency** | $499/mo | Unlimited | 10 | 25 | Multi-client, bulk approval, API |
| **Enterprise** | Custom | Custom | Unlimited | Custom | SSO, compliance, white-label, SLA |

**Usage Overage:** $5 per additional Hub (Creator/Pro), negotiated (Agency/Enterprise)

### Integration List

| Category | Integration | Priority | Method |
|----------|-------------|----------|--------|
| **Ingestion** | PDF Upload | MVP | Workers AI parsing |
| **Ingestion** | Transcript Paste | MVP | Direct text input |
| **Ingestion** | URL Scrape | MVP | Workers fetch + parse |
| **Ingestion** | Google Docs | Post-MVP | OAuth + Docs API |
| **Ingestion** | Notion | Post-MVP | Notion API |
| **Publishing** | Twitter/X | Phase 1.1 | Twitter API v2 |
| **Publishing** | LinkedIn | Phase 1.1 | LinkedIn API |
| **Publishing** | TikTok | Phase 1.2 | TikTok API |
| **Publishing** | Instagram | Phase 1.2 | Meta Graph API |
| **Analytics** | Twitter Engagement | Phase 1.1 | Webhook + polling |
| **Analytics** | LinkedIn Metrics | Phase 1.1 | LinkedIn Analytics API |
| **Enterprise** | Slack Notifications | Phase 2 | Slack Webhooks |
| **Enterprise** | Zapier | Phase 2 | Zapier Integration |
| **Enterprise** | REST API | Phase 2 | Public API with OAuth |

### Compliance Requirements

**Covered by G-Compliance Gate:**
- SEC Marketing Rule (206(4)-1)
- FINRA 2210 (Communications with Public)
- Anti-Promissory Language Detection
- Full Audit Trail with timestamps

**Additional Enterprise Compliance:**

| Requirement | Implementation |
|-------------|----------------|
| SOC 2 Type II | Cloudflare infrastructure + audit logging |
| GDPR | Data residency options, deletion workflows |
| SSO/SAML | Enterprise tier, Cloudflare Access integration |
| Data Retention | Configurable per-client retention policies |

### Visual Archetype System

| Archetype | Platforms | Trigger | G6 Validation |
|-----------|-----------|---------|---------------|
| **Chart-Heavy Authority** | LinkedIn, Blog | Data claims | Novel visualization, no stock charts |
| **Pattern Interrupt Collage** | Instagram Feed | Contrarian stance | Color contrast, no AI clichés |
| **Text-Overlay Hook** | TikTok, Reels | Punchy hook | 3-word max, motion-safe |
| **Carousel Story** | LinkedIn, IG | Lists, steps | Progressive reveal, consistent style |
| **Quote Card** | Twitter/X, IG Story | Short statements | High contrast, brand fonts |
| **Thumbnail Hero** | YouTube, Blog | Curiosity gap | Human face, 3-word hook |

**Visual Selection Logic:**
```
IF content.type === 'data_claim' → Chart-Heavy Authority
ELSE IF content.stance === 'contrarian' → Pattern Interrupt Collage
ELSE IF platform === 'tiktok' → Text-Overlay Hook
ELSE IF content.structure === 'list' → Carousel Story
ELSE IF content.length < 50_chars → Quote Card
ELSE IF platform === 'youtube' → Thumbnail Hero
```

**Visual Cliché Blacklist:**
- Robot brain imagery
- Handshake overlays
- Generic gradients
- Stock photo business people
- Lightbulb "ideas"
- Puzzle pieces

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Platform MVP — Build the stateful Agent foundation that creates compound value

**Core Hypothesis:** If we can achieve > 60% Zero-Edit Rate within 3 Hubs (Time-to-DNA < 3), agencies will adopt at premium pricing.

**Why Platform MVP Wins:**
In a market saturated with "AI Writers," users seek a system they can trust. By prioritizing the Self-Healing Loop and Multi-Client Isolation on day one, we prove the Foundry is a professional-grade "Foundry," not a toy.

| Signal Type | What It Proves |
|-------------|----------------|
| **Investor Signal** | COGS scales linearly while "Brand Intelligence" (SQLite state) scales exponentially |
| **User Signal** | "Amber DNA" report + "Zero-Edit" tracking = visible AI thought process for Executive Producers |

**Resource Requirements:**

| Role | Count | Focus |
|------|-------|-------|
| Full-Stack Engineer | 2 | Cloudflare stack (Agents SDK, D1, Vectorize, Workflows) |
| AI/ML Engineer | 1 | Prompt engineering, quality gates, adversarial logic |
| Product Designer | 1 | Executive Producer dashboard, Bulk Approval UX |
| Product Manager | 1 | User research, pilot program, success metrics |

**Timeline:** 8-12 weeks to MVP pilot

### Parallel Workstreams (8-12 Week Sprint)

| Workstream | Owner | Deliverables | Critical Path |
|------------|-------|--------------|---------------|
| **A: Infrastructure** | Full-Stack Lead | Cloudflare environment: D1 (global metadata), R2 (assets), Agents SDK (client isolation), Durable Objects (< 100ms context switch) | Week 1-4 |
| **B: AI Logic** | AI Engineer | Critic Rubric (G2, G4, G5) as standalone worker; calibrated with 1,000 "bad" and "good" hooks | Week 2-6 |
| **C: Design** | Product Designer | Bulk Approval Engine prototype — reviewing 300 pieces must feel like a game, not a chore | Week 3-8 |

**Critical Technical Challenge:** The < 100ms context switch between clients. Durable Objects are correct, but Vectorize namespaces must be partitioned so a Law Firm's research never bleeds into a SaaS Startup's Spokes.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- ✅ Journey 1: Agency Happy Path (partial — no G7 filtering)
- ✅ Journey 4: Solo Creator (full — Brand DNA Report + swipe review)
- ⚠️ Journey 2: Emergency Calibration (text input only, voice post-MVP)
- ⚠️ Journey 3: Client Review (basic shareable links, no real-time sync)
- ❌ Journey 5: Compliance Audit (post-MVP, regulated vertical)

**Must-Have Capabilities:**

| # | Capability | Description | Success Metric |
|---|------------|-------------|----------------|
| 1 | **Source Ingestion** | PDF, transcript, raw text upload | < 30 sec processing |
| 2 | **Hub-to-Spoke Engine** | 1 Hub → 25 platform-specific spokes | < 60 sec generation |
| 3 | **Adversarial Quality Gate** | G2 (Hook), G4 (Voice), G5 (Platform) | 85%+ first-pass Critic approval |
| 4 | **Self-Healing Loop** | Creator regenerates with Critic feedback | < 1.2 avg loops |
| 5 | **Bulk Approval Engine** | Swipe interface, Hub-level Kill | < 6 sec per decision |
| 6 | **Multi-Client Isolation** | Durable Object per-client | < 100ms context switch |
| 7 | **Brand DNA Report** | Onboarding analysis of uploaded content | Visual score + detected patterns |
| 8 | **Export** | Download content as CSV/JSON | All platforms supported |

**MVP Exclusions (Explicit):**
- ❌ Voice-to-Grounding (text input only)
- ❌ G6 Visual Archetype scoring (basic image generation)
- ❌ G7 Engagement Prediction
- ❌ Publishing integrations (export only)
- ❌ Video rendering (scripts + thumbnails only)
- ❌ Real-time WebSocket sync (polling fallback)
- ❌ G-Compliance Gate (regulated industries)

### Post-MVP Features

**Phase 1.1: Learning Loop (Month 2-3)**

| Feature | Value | Dependency |
|---------|-------|------------|
| Voice-to-Grounding Pipeline | Mobile calibration, faster Brand DNA capture | Whisper integration |
| Platform Engagement Import | Feed actual metrics for G7 training | Platform API OAuth |
| G7 Engagement Prediction | Surface "Golden Nuggets" before publishing | Historical data from Phase 1 |
| Real-Time WebSocket Sync | Agency + Client live collaboration | Socket infrastructure |

**Phase 1.2: Intelligence Layer (Month 3-4)**

| Feature | Value | Dependency |
|---------|-------|------------|
| G6 Visual Archetype Scoring | AI cliché detection, brand-aligned visuals | G7 baseline |
| Predictive Content Recommendations | "What to post next" based on G7 patterns | 1000+ published pieces data |
| Automated Content Calendar | Platform-optimal posting times | Publishing integrations |
| Cross-Platform Trend Detection | Identify what's working across channels | Multi-platform analytics |

**Phase 2.0: Full Production (Month 6+)**

| Feature | Value | Dependency |
|---------|-------|------------|
| Complete Video Rendering | Full TikTok/Reels production, not just scripts | Video processing infrastructure |
| Publishing Integrations | Direct post to Twitter, LinkedIn, TikTok, IG, YouTube | API partnerships |
| G-Compliance Gate | SEC/FINRA compliance for regulated industries | Legal review, audit infrastructure |
| Team Collaboration | Multi-user workflows, approval chains | RBAC expansion |
| A/B Testing Framework | Automated winner selection | Publishing + analytics integration |

**Phase 3.0: Platform (Year 2)**

| Feature | Value | Dependency |
|---------|-------|------------|
| Brain Template Marketplace | Pre-trained brand voices by niche | 100+ successful agents |
| Public API | Enterprise integrations, white-label | API infrastructure, documentation |
| White-Label Option | Agencies resell under their brand | Theming, multi-tenant billing |
| Industry Vertical Packages | Finance, Health, Legal pre-configured | G-Compliance + industry partnerships |

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Adversarial loop creates bottleneck | Medium | High | Async Cloudflare Workflows; parallel Critic evaluation |
| Vectorize latency at scale | Low | Medium | Namespace partitioning; cache frequent queries |
| Self-Healing loops spiral (>3 attempts) | Medium | Medium | Hard cap + "Creative Conflict" human escalation |
| Workers AI quality inconsistent | Medium | Medium | Fallback to external LLM; A/B test providers |

**Market Risks:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agencies don't trust AI for client work | Medium | High | Pilot program with manual review option; gradual automation |
| Zero-Edit Rate < 40% in pilot | Medium | Critical | Voice calibration pathway; Grounding Audit triggers |
| Competitors copy adversarial approach | Low | Medium | State is the moat — compound learning advantage |
| Platform API changes (Twitter, etc.) | Medium | Medium | Export-first MVP; delay direct publishing |

**Resource Risks:**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| < 2 engineers available | Medium | High | Reduce to 4 core capabilities; delay multi-client |
| No dedicated AI engineer | Medium | Medium | Leverage Workers AI defaults; simpler prompts |
| No designer | Low | Medium | Use component library (shadcn); focus on function |

**Minimum Viable Team:**
- 1 Full-Stack Engineer (Cloudflare expert)
- 1 AI/Prompt Engineer (or full-stack with LLM experience)
- Product guidance from founder

**Minimum Feature Set (if constrained):**
1. Single Hub → 10 Spokes (text only)
2. G2 Hook Scoring (no self-healing)
3. Simple approve/reject (no bulk)
4. Single client (no isolation)

### Project Classification

**Complexity:** High Complexity / High Reward

**Biggest Risk:** The "Review Tax" — if AI quality isn't there, the dashboard becomes a graveyard of bad ideas.

**Insurance Policy:** Critic Agent as mandatory MVP feature. The Self-Healing Loop is not optional; it's the difference between a toy and a tool.

---

## Functional Requirements

### 1. Content Ingestion & Hub Creation

- **FR1:** Users can upload PDF documents as source material for Hub creation
- **FR2:** Users can paste raw text or transcripts as source material for Hub creation
- **FR3:** Users can provide a URL to scrape content as source material for Hub creation
- **FR4:** System can extract key themes, claims, and psychological angles from uploaded source material
- **FR5:** Users can create a Hub from processed source material with identified content pillars
- **FR6:** Users can view the processing status of source material during ingestion
- **FR7:** Users can edit or refine extracted themes before Hub finalization

### 2. Spoke Generation & Multimodal Output

- **FR8:** System can generate platform-specific text spokes from a Hub (Twitter, LinkedIn, TikTok script, etc.)
- **FR9:** System can generate carousel content from a Hub with slide-by-slide structure
- **FR10:** System can generate thread content from a Hub with sequential posts
- **FR11:** System can generate thumbnail/visual concepts based on Visual Archetype selection
- **FR12:** Users can view all spokes organized by Hub with parent-child hierarchy
- **FR13:** Users can filter spokes by platform type
- **FR14:** Users can view spoke generation progress in real-time

### 3. Quality Assurance & Adversarial Gates

- **FR15:** System can evaluate spoke hook strength using G2 scoring (0-100)
- **FR16:** System can evaluate spoke brand voice alignment using G4 gate (pass/fail)
- **FR17:** System can evaluate spoke platform compliance using G5 gate (pass/fail)
- **FR18:** System can automatically regenerate failed spokes with Critic feedback (self-healing loop)
- **FR19:** System can flag spokes for human review when self-healing fails after maximum attempts
- **FR20:** Users can view the reason for any gate failure on a spoke
- **FR21:** Users can override gate decisions with manual approval
- **FR22:** System can detect and flag AI visual clichés in generated imagery (G6)

### 4. Content Review & Approval

- **FR23:** Users can approve or reject individual spokes
- **FR24:** Users can approve or reject spokes in bulk using swipe interface
- **FR25:** Users can filter spokes by quality score for batch review
- **FR26:** Users can kill a Hub (cascading deletion of all child spokes)
- **FR27:** Users can kill a Pillar (deletion of spokes tied to that angle only)
- **FR28:** System can preserve manually-edited spokes when parent Hub is killed (Mutation Rule)
- **FR29:** Users can clone high-performing spokes to generate variations
- **FR30:** Users can view estimated review time based on pending content volume

### 5. Brand Intelligence & Calibration

- **FR31:** Users can upload existing content to analyze brand voice patterns
- **FR32:** Users can provide text input to refine brand context and preferences
- **FR33:** System can generate a Brand DNA Report showing detected tone, phrases, and stances
- **FR34:** System can extract banned words and required phrases from brand analysis
- **FR35:** Users can manually add or remove banned words and voice markers
- **FR36:** System can detect Zero-Edit Rate trend per client
- **FR37:** System can trigger Grounding Audit when Drift Metric exceeds threshold
- **FR38:** Users can view Brand DNA Strength score with breakdown

### 6. Client & Team Management

- **FR39:** Agency Owners can create and manage client accounts
- **FR40:** Agency Owners can assign Account Managers to specific clients
- **FR41:** Account Managers can access multiple assigned client workspaces
- **FR42:** Creators can generate content only for assigned clients
- **FR43:** Client Admins can review and approve content for their brand
- **FR44:** Client Reviewers can approve or reject content without edit access
- **FR45:** System can switch between client contexts without data leakage (isolation)
- **FR46:** Users can view which client context is currently active
- **FR47:** Users can generate shareable review links for external collaborators

### 7. Analytics & Performance Tracking

- **FR48:** Users can view Zero-Edit Rate per client over time
- **FR49:** Users can view Critic pass rate trends (G2, G4, G5)
- **FR50:** Users can view self-healing loop efficiency (average regeneration attempts)
- **FR51:** Users can view content volume metrics (Hubs created, spokes generated, approved)
- **FR52:** Users can view review velocity metrics (time per decision)
- **FR53:** Users can view Kill Chain usage patterns
- **FR54:** System can track Time-to-DNA metric (Hubs to reach 60% Zero-Edit)

### 8. Export & Integration

- **FR55:** Users can export approved content as CSV
- **FR56:** Users can export approved content as JSON
- **FR57:** Users can export content organized by platform
- **FR58:** Users can export content with scheduling metadata
- **FR59:** Users can download generated images and thumbnails
- **FR60:** Users can copy individual spoke content to clipboard

---

## Non-Functional Requirements

### Request Lifecycle (NFR-P1 to P4 in Practice)

| Step | Action | NFR | Technology |
|------|--------|-----|------------|
| 1. User Access | Marcus logs in via Dashboard | — | Cloudflare Access (JWT validation) |
| 2. Context Hydration | Agent queries local SQLite for Brand DNA | NFR-P1 | Durable Object (`this.sql.exec`) |
| 3. Hub Ingestion | Research uploaded to R2, Workflow extracts pillars | NFR-P2 | R2 + Cloudflare Workflows |
| 4. Adversarial Generation | Creator calls Workers AI; Critic runs Rubric queries | NFR-P3 | Agents SDK + Workers AI |
| 5. Review | Bulk Approval with pre-fetching | NFR-P4 | WebSocket + R2 pre-hydration |

### Performance

| NFR | Requirement | Measurement | Threshold |
|-----|-------------|-------------|-----------|
| **NFR-P1** | Context switch between clients | Durable Object hydration latency | < 100ms |
| **NFR-P2** | Hub ingestion processing | Time from upload to pillars extracted | < 30 seconds |
| **NFR-P3** | Spoke generation batch | Time to generate 25 spokes from Hub | < 60 seconds |
| **NFR-P4** | Bulk review decision | Time per approve/reject action in swipe interface | < 200ms UI response |
| **NFR-P5** | Dashboard initial load | Time to interactive for Executive Producer view | < 3 seconds |
| **NFR-P6** | Brand DNA Report generation | Time from content upload to report display | < 2 minutes |
| **NFR-P7** | Self-Healing Loop iteration | Time for Critic feedback + Creator regeneration | < 10 seconds per loop |
| **NFR-P8** | Search and filter operations | Time to filter spokes by platform/score | < 500ms |

**Review Tax Frontend Optimization:**
- **WebSocket Sync:** Agents SDK pushes G7/G2 scores to UI in real-time
- **Pre-fetching:** As Marcus reviews Spoke #1, UI pre-hydrates assets for Spokes #2-5 from R2

### Security

| NFR | Requirement | Implementation | Verification |
|-----|-------------|----------------|--------------|
| **NFR-S1** | Multi-tenant data isolation | Zero data leakage between client contexts | Penetration testing; audit logs |
| **NFR-S2** | Encryption at rest | All Brand DNA, content assets, voice recordings encrypted | AES-256 or equivalent |
| **NFR-S3** | Encryption in transit | All API communications encrypted | TLS 1.3 minimum |
| **NFR-S4** | Role-based access control | Permissions enforced per RBAC matrix | Access audit trails |
| **NFR-S5** | Session management | Secure session tokens with expiration | 24-hour max session; forced re-auth for sensitive ops |
| **NFR-S6** | Shareable link security | Time-limited, email-verified review links | Link expiration after 7 days; single-use tokens |
| **NFR-S7** | API authentication | OAuth 2.0 for external integrations | Token rotation; scope limitations |
| **NFR-S8** | Audit logging | All content decisions logged with timestamp and actor | Immutable audit trail; 90-day retention |

### Multi-Tenant Isolation Moat (NFR-S1 Deep Dive)

Unlike traditional SaaS where all client data sits in one Postgres table, the Foundry uses **Physical Isolation**:

| Layer | Isolation Method | Purpose |
|-------|------------------|---------|
| **D1 Database** | Global metadata only | Billing, User accounts, Hub IDs (no client content) |
| **Durable Objects** | Per-client instance | User A's Agent literally cannot "see" User B's Agent memory |
| **Vectorize Namespaces** | Per-client namespace | Prevents "Theme Bleed" between clients |
| **R2 Storage** | Per-client bucket path | Media assets isolated by client prefix |

### Scalability

| NFR | Requirement | Target | Growth Path |
|-----|-------------|--------|-------------|
| **NFR-SC1** | Concurrent clients per agency | 100+ active clients | Durable Object per-client; horizontal scaling |
| **NFR-SC2** | Active agents (12-month) | 2,500+ Always-On Agents | Cloudflare global edge distribution |
| **NFR-SC3** | Hubs processed per month | 10,000+ Hubs/month (Agency tier) | Workflow parallelization; queue management |
| **NFR-SC4** | Spokes generated per month | 250,000+ Spokes/month | Workers AI scaling; R2 storage |
| **NFR-SC5** | Vectorize index size per client | 100,000+ embeddings | Namespace partitioning; index optimization |
| **NFR-SC6** | Media storage per client | 50GB+ images/thumbnails | R2 zero-egress; lifecycle policies |
| **NFR-SC7** | Concurrent generations | 50+ parallel Hub→Spoke workflows | Cloudflare Workflows queue depth |

### Reliability

| NFR | Requirement | Target | Recovery |
|-----|-------------|--------|----------|
| **NFR-R1** | System uptime | 99.9% availability (8.7 hours/year downtime) | Cloudflare edge redundancy |
| **NFR-R2** | Data durability | No content loss on system failure | D1 replication; R2 durability |
| **NFR-R3** | Workflow recovery | Resume interrupted Hub→Spoke generation | Cloudflare Workflows durable state |
| **NFR-R4** | Graceful degradation | Core review functions work if AI unavailable | Queue pending generations; manual override |
| **NFR-R5** | Backup frequency | Brand DNA and content assets backed up | Daily snapshots; 30-day retention |
| **NFR-R6** | Recovery time objective (RTO) | Time to restore service after outage | < 1 hour for full recovery |
| **NFR-R7** | Recovery point objective (RPO) | Maximum data loss in disaster | < 1 hour of data |

### Integration

| NFR | Requirement | Standard | Priority |
|-----|-------------|----------|----------|
| **NFR-I1** | Ingestion API formats | Accept PDF, TXT, URL, JSON | MVP |
| **NFR-I2** | Export formats | CSV, JSON with platform metadata | MVP |
| **NFR-I3** | OAuth provider support | Google, Microsoft for Docs/Drive integration | Post-MVP |
| **NFR-I4** | Webhook delivery | Notify external systems on content approval | Post-MVP |
| **NFR-I5** | Platform API compliance | Twitter API v2, LinkedIn API, Meta Graph API | Phase 1.1+ |
| **NFR-I6** | Rate limit handling | Graceful retry with exponential backoff | All integrations |
| **NFR-I7** | API versioning | Semantic versioning for public API | Phase 2+ |

### Accessibility

| NFR | Requirement | Standard | Priority |
|-----|-------------|----------|----------|
| **NFR-A1** | Keyboard navigation | All review actions accessible via keyboard | MVP |
| **NFR-A2** | Screen reader compatibility | Dashboard compatible with NVDA/VoiceOver | MVP |
| **NFR-A3** | Color contrast | WCAG 2.1 AA contrast ratios | MVP |
| **NFR-A4** | Focus management | Clear focus indicators on interactive elements | MVP |
| **NFR-A5** | Responsive design | Usable on tablet (1024px+) for mobile review | Post-MVP |

### Compliance (Enterprise Tier)

| NFR | Requirement | Standard | Priority |
|-----|-------------|----------|----------|
| **NFR-C1** | SOC 2 Type II | Annual audit certification | Phase 2 |
| **NFR-C2** | GDPR compliance | Data residency options; right to deletion | Phase 2 |
| **NFR-C3** | SSO/SAML support | Enterprise identity provider integration | Enterprise tier |
| **NFR-C4** | Audit export | Regulator-ready PDF with full decision chain | G-Compliance Gate |
| **NFR-C5** | Data retention policies | Configurable per-client retention | Enterprise tier |

### Agent SQLite Schema (Per-Client Durable Object)

| Table | Purpose | NFR Link |
|-------|---------|----------|
| `brand_dna` | Stores voice markers, banned words, and personas | NFR-S2 (Encryption) |
| `content_hierarchy` | Maps Hubs to Spokes (The Genetic Tree) | NFR-SC4 (Scaling) |
| `feedback_log` | Stores Critic rejection reasons for Self-Healing loop | NFR-P7 (Healing) |
| `mutation_registry` | Tracks every manual edit (Drift Metric logic) | Drift Metric |
| `rubric_overrides` | Client-specific Critic thresholds | G4/G5 Calibration |
| `generation_queue` | Pending Hub→Spoke workflows | NFR-R3 (Recovery) |

### Scope Creep Defense

**PM Peer Advice:** With 47 NFRs and "Very High" Innovation score, scope creep is the biggest risk.

| Rule | Rationale |
|------|-----------|
| **Do not build Video Rendering (Phase 2.0)** | Until Zero-Edit Rate for text/static assets hits 60% |
| **Voice-to-Grounding is magical but not MVP** | Text-field override is the fallback to ship in 8-12 weeks |
| **Ruthlessly defend Phase 1.1 timeline** | Learning Loop features unlock only after MVP validation |

