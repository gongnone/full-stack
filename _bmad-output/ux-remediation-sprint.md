# UX Remediation Sprint — "Don't Make Me Think"

**Date:** 2026-01-31
**Triggered by:** User tested on mobile, said "confusing as fuck"
**Priority:** P0 — Blocks product adoption

---

## Problem Statement

A new user who creates a client has **zero guidance** on what to do next. The app shows:
- Dashboard with all-zero stats
- 7 sidebar items with no indication of flow/order
- No onboarding wizard, no progress tracker, no "what's next"
- Jargon everywhere: "Hub", "Spoke", "Brand DNA", "G7 Score", "Creative Conflict"
- Features built for power users but presented to first-time users

## Current User Journey (Broken)

```
Login → Dashboard (empty) → ??? → Lost → Churn
```

## Target User Journey

```
Login → Dashboard → "Get Started" CTA → 
  Step 1: Brand Voice Setup (guided) → 
  Step 2: Create First Hub (simplified) → 
  Step 3: Review Content (guided) → 
  "You're set up! Here's your content calendar."
```

---

## Stories

### UX-1: First-Run Onboarding Banner (P0)
**When** a user has 0 completed Brand DNA calibrations  
**Show** a prominent banner on Dashboard:
> "Welcome! Let's set up your brand voice in 3 steps."  
> [Start Setup →]

**Acceptance Criteria:**
- [ ] Banner shows when client has no Brand DNA or Brand DNA score < 50
- [ ] CTA takes user to Brand DNA page
- [ ] Banner dismissible but re-appears until Brand DNA complete
- [ ] Progress indicator: Step 1 of 3 / Step 2 of 3 / Step 3 of 3

### UX-2: Guided Progress Tracker (P0)
**Replace** the empty stats cards with a **setup progress** view for new clients:

```
✅ Step 1: Create your brand (done)
🔵 Step 2: Define your voice (Brand DNA) — [Start →]
⬜ Step 3: Generate your first content hub
⬜ Step 4: Review & approve content
```

**Acceptance Criteria:**
- [ ] Shows setup steps instead of stats when setup incomplete
- [ ] Each step links to the relevant page
- [ ] Completed steps show green checkmarks
- [ ] Current step is highlighted with CTA
- [ ] After all steps done, switches to normal stats dashboard

### UX-3: Simplify Navigation for New Users (P1)
**Problem:** 7 sidebar items overwhelm new users  
**Solution:** Show only relevant items based on progress:

- **Pre-Brand DNA:** Dashboard, Brand DNA, Settings
- **Pre-Hub:** Dashboard, Brand DNA, Hubs, Settings  
- **Post-Generation:** All items

Or: Keep all items but grey out/badge items that aren't relevant yet.

### UX-4: Empty State CTAs on Every Page (P1)
Every page with no data should show a **helpful empty state** with:
- What this page does (plain English)
- What you need to do first
- CTA to the prerequisite step

Examples:
- **Review page (empty):** "No content to review yet. Create a content hub first." [Create Hub →]
- **Analytics (empty):** "Analytics will appear after you've approved some content." [Go to Review →]
- **Engagement (empty):** "Track engagement after publishing your content."

### UX-5: Rename Jargon (P1)
| Current | Better |
|---------|--------|
| Hub | Content Campaign |
| Spoke | Content Piece |
| Brand DNA | Brand Voice |
| G2 Hook Score | Hook Quality |
| G7 Engagement | Predicted Engagement |
| Creative Conflict | Needs Attention |
| Pillar | Content Theme |

### UX-6: Mobile Responsive Audit (P1)
- Sidebar on mobile: hamburger menu or bottom nav?
- Cards stack properly?
- Touch targets large enough?
- Review page usable on phone?

---

## Implementation Order

1. **UX-1 + UX-2** (Onboarding banner + progress tracker) — biggest impact, 4-6hrs
2. **UX-4** (Empty state CTAs) — catches users who skip the banner, 2-3hrs
3. **UX-5** (Rename jargon) — search-replace, 1-2hrs
4. **UX-3** (Smart nav) — nice-to-have, 2-3hrs
5. **UX-6** (Mobile audit) — dedicated pass, 3-4hrs

---

*Created: 2026-01-31 by Molty (PM) — triggered by real user testing*
