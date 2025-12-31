# Epic 10: Strategic Brand Onboarding Pipeline

**Priority:** P0 - Core Differentiator
**Status:** planned
**Created:** 2025-12-29
**Target:** Agency Onboarding MVP

---

## Epic Summary

Transform Brand DNA from passive "voice capture" into an active "AI Brand Strategist" experience. When agencies onboard clients, the system doesn't just listen — it researches, analyzes, and proposes strategic content pillars that will actually work in the client's market.

## Business Value

| Metric | Current State | Target State |
|--------|---------------|--------------|
| Client Onboarding | Agency guesses at voice | Client self-serves + AI strategizes |
| Time to First Value | Days (back-and-forth) | Hours (automated pipeline) |
| Pillar Quality | Based on intuition | Based on market research + proven frameworks |
| Client Confidence | "Hope this works" | "This is MY strategy" |

## The Strategic Pipeline

```
PHASE 1: CAPTURE (Client Self-Service)
├── Agency creates client → Auto-send Brand DNA invite email
├── Client clicks link → Token-gated onboarding (no login)
├── Client records voice note answering guided prompts
├── Client uploads existing content (optional)
└── Output: Raw Brand DNA (tone, phrases, stances, market signals)

PHASE 2: RESEARCH (Deep Research Agent)
├── Analyze client's industry/market from input signals
├── Web search: Top performers in their niche
├── Vectorize: Proven hooks in their vertical
├── Competitive gap analysis
└── Output: Market Intelligence Report

PHASE 3: SYNTHESIS (Strategy Agent)
├── Map Raw DNA + Market Intel to proven frameworks:
│   ├── TEACH (authority building)
│   ├── ENTERTAIN (engagement/relatability)
│   └── ENGINEER (attention/influence tactics)
├── Generate 3-5 strategic pillar options with rationale
└── Output: Proposed Brand Pillars

PHASE 4: APPROVAL (Mobile-First Client Interaction)
├── Send pillars via email + SMS notification
├── Client reviews on mobile-optimized page
├── Approve / Modify / Request alternatives
├── Iterate until client locks pillars
└── Output: CONFIRMED Brand Pillars → Foundation for all Hubs
```

## User Journeys Enabled

### Journey: Marcus Onboards New Client (Agency)

1. Marcus creates client "Fintech Startup" with sarah@fintech.io
2. Sarah receives email: "Help us capture YOUR voice"
3. Sarah records 2-min voice note on her phone
4. 30 seconds later, Sarah sees: "Analyzing your market..."
5. 2 minutes later: Strategic pillars appear with rationale
6. Sarah approves "Challenger Brand" + "Myth-Busting" + "Insider Secrets"
7. Marcus sees: "Sarah's Brand DNA: Ready" with approved pillars
8. Marcus creates first Hub → Content sounds like Sarah, follows winning strategy

### Journey: Dr. Priya (Solo Creator)

1. Priya signs up, goes through same voice capture
2. System researches "Executive Coaching" vertical
3. Proposes: "Leadership Myths" + "Client Transformations" + "Decision Frameworks"
4. Priya modifies "Decision Frameworks" → "Boardroom Confessions"
5. Pillars locked → First Hub generated with strategic foundation

## Technical Dependencies

- Story 2-2: Voice-to-Grounding Pipeline (Whisper integration) ✅ DONE
- Story 7-6: Shareable Review Links (token pattern) ✅ DONE
- Story 9-4: Email Verification Service (AWS SES) ✅ DONE
- Workers AI: Text generation for synthesis
- Web Search: Market research capability
- Vectorize: Proven hooks database query

## Success Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Voice Capture Completion** | % invited clients who complete voice recording | > 60% |
| **Pillar Approval Rate** | % clients who approve pillars without major changes | > 70% |
| **Time to Approval** | Hours from invite to pillar lock | < 24 hours |
| **Zero-Edit Rate Impact** | Improvement in Zero-Edit after strategic pillars | +15% vs baseline |

## Stories in This Epic

| Story | Title | Priority | Effort |
|-------|-------|----------|--------|
| 10-1 | Client Brand DNA Email Invitation | P0 | 4-6 hrs |
| 10-2 | Deep Research Agent | P0 | 6-8 hrs |
| 10-3 | Strategic Pillar Synthesis | P0 | 4-6 hrs |
| 10-4 | Mobile-First Client Approval Flow | P0 | 4-6 hrs |
| 10-5 | Iterative Pillar Refinement | P1 | 3-4 hrs |

## Critical Notes

**MOBILE-FIRST IS MANDATORY** - All client-facing flows must be optimized for mobile. Clients will be recording voice notes on their phones, reviewing pillars on the go.

**SMS INTEGRATION (P1)** - Email for initial invite, but SMS for approval notifications and nudges. 98% open rate vs email's ~20%.

---

## Acceptance Criteria (Epic Level)

- [ ] Agency can create client → client receives Brand DNA invite automatically
- [ ] Client can complete Brand DNA capture on mobile without logging in
- [ ] System researches client's market and generates strategic pillar recommendations
- [ ] Client can approve/modify pillars via mobile-optimized interface
- [ ] Approved pillars become foundation for all Hub generation
- [ ] Agency dashboard shows client onboarding status and approved pillars
