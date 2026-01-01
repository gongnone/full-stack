# Story 10-4: Mobile-First Client Approval Flow

**Epic:** 10 - Strategic Brand Onboarding Pipeline
**Priority:** P0
**Status:** done
**Effort:** 4-6 hours
**Created:** 2025-12-29

---

## User Story

**As a** client who completed Brand DNA capture,
**I want** to review and approve my strategic pillars on my phone,
**So that** I can quickly confirm my content strategy without needing a laptop.

## Context

**MOBILE-FIRST IS MANDATORY.** Clients are busy. They recorded their voice note on their phone. They'll review pillars on their phone. The approval experience must be seamless on mobile — not a desktop experience crammed onto a small screen.

## Acceptance Criteria

### AC1: Notification Delivery
- [ ] Client receives email when pillars ready: "Your brand strategy is ready"
- [ ] Email includes direct link to approval page
- [ ] (P1) SMS notification: "Your Foundry brand strategy is ready. Tap to review: [short link]"
- [ ] Notification includes: agency name, estimated review time ("2 minutes")

### AC2: Token-Based Access (No Login)
- [ ] Route: `/strategy/:token` (public, no auth required)
- [ ] Same token pattern as Story 10-1
- [ ] Token valid for 7 days
- [ ] Invalid/expired: friendly error with "Request new link" option

### AC3: Mobile-Optimized Strategy Page
- [ ] **Full-width cards** for each pillar (no side-by-side on mobile)
- [ ] **Large touch targets** (44px minimum for all buttons)
- [ ] **Swipeable cards** (optional: swipe to approve/modify)
- [ ] **Fixed bottom action bar** with primary actions
- [ ] **Progress indicator**: "Pillar 1 of 4"
- [ ] **No horizontal scroll** ever

### AC4: Pillar Card Design
Each pillar card displays:
- [ ] Pillar name (large, bold)
- [ ] Strategy tags (TEACH, ENTERTAIN, etc.) as colored chips
- [ ] Rationale text (collapsible if long)
- [ ] Example hook (in quote style)
- [ ] Action buttons: [Approve] [Modify] [Skip]

```
┌─────────────────────────────────┐
│  "Leadership Myths"             │
│  ┌──────┐ ┌─────────┐          │
│  │TEACH │ │CHALLENGE│          │
│  └──────┘ └─────────┘          │
│                                 │
│  Contrarian takes get 3.2x     │
│  engagement in your niche.     │
│  Your voice screams "myth-     │
│  buster."                       │
│                                 │
│  Example:                       │
│  "The leadership advice that   │
│   got your last CEO fired"     │
│                                 │
│  ┌────────┐  ┌────────┐        │
│  │ Modify │  │Approve │        │
│  └────────┘  └────────┘        │
└─────────────────────────────────┘
```

### AC5: Approval Actions
- [ ] **Approve**: Mark pillar as approved, move to next
- [ ] **Modify**: Opens modification modal (Story 10-5)
- [ ] **Skip**: Move to next without decision (can return)
- [ ] **Approve All**: Quick action to approve all remaining pillars

### AC6: Approval Summary
- [ ] After reviewing all pillars, show summary:
  - Approved pillars (with checkmarks)
  - Pending pillars (if any skipped)
  - Modified pillars (if any)
- [ ] Final action: **[Lock My Strategy]**
- [ ] Cannot lock until at least 3 pillars approved

### AC7: Lock Strategy
- [ ] On lock: write approved pillars to `client_approved_pillars` table
- [ ] Mark onboarding as complete
- [ ] Trigger agency notification: "Sarah locked her brand strategy"
- [ ] Show confirmation: "Your strategy is set! [Agency] will start creating content."

### AC8: Agency Dashboard Updates
- [ ] Client card shows: "Strategy: Approved" (green badge)
- [ ] Agency can view approved pillars
- [ ] Agency can see which pillars were modified (if any)
- [ ] Approved pillars become available for Hub creation

### AC9: Incomplete Session Handling
- [ ] If client closes without locking:
  - Progress saved (approved pillars remembered)
  - Return link brings them back to where they left off
- [ ] Send reminder after 24 hours if not locked
- [ ] Reminder: "Your strategy is 80% complete — 2 pillars left"

## Mobile UX Requirements

### Touch Targets
```
Minimum button size: 44px x 44px
Minimum spacing between targets: 8px
Thumb-zone optimization for bottom actions
```

### Typography
```
Pillar name: 20px, bold
Strategy tags: 12px, uppercase
Rationale: 16px, regular
Example hook: 16px, italic
```

### Gestures (Optional Enhancement)
```
Swipe right: Approve pillar
Swipe left: Skip pillar
Tap and hold: Show full rationale
```

### Performance
```
Page load: < 2 seconds on 3G
No layout shift after load
Offline-capable (service worker caches pillars)
```

## Technical Implementation

### Routes
```typescript
// Public route (no auth)
GET /strategy/:token → PillarApprovalPage

// API endpoints
POST /api/strategy/:token/approve/:pillarId
POST /api/strategy/:token/skip/:pillarId
POST /api/strategy/:token/lock
GET /api/strategy/:token/status
```

### React Components
```typescript
// Mobile-first components
<PillarApprovalPage token={token} />
  <ProgressIndicator current={2} total={4} />
  <PillarCard pillar={pillar} onApprove={} onModify={} onSkip={} />
  <BottomActionBar onApproveAll={} onLock={} />
  <ApprovalSummary approved={} pending={} modified={} />
```

### State Management
```typescript
interface ApprovalState {
  pillars: Pillar[];
  currentIndex: number;
  decisions: Record<string, 'approved' | 'modified' | 'skipped'>;
  isLocked: boolean;
}
```

## Notifications

### Email: Strategy Ready
```
Subject: Your brand strategy is ready (2 min review)

Hi Sarah,

We've analyzed your voice and researched your market.
Your personalized content strategy is ready for review.

[Review My Strategy →]

Takes about 2 minutes. No login required.
```

### SMS (P1): Strategy Ready
```
Your Foundry brand strategy is ready!
Review & approve (2 min): foundry.link/abc123
```

### Email: Reminder (24h)
```
Subject: Your strategy is almost complete

Hi Sarah,

You've approved 2 of 4 brand pillars.
Finish reviewing to unlock your content engine.

[Complete My Strategy →]
```

## Dependencies

- Story 10-1: Token infrastructure ✅
- Story 10-3: Pillars generated ✅
- Story 9-4: Email service ✅
- (P1) Twilio/SMS integration

## Test Cases

| Test | Expected Result |
|------|-----------------|
| Click email link on iPhone | Page loads, pillars display correctly |
| Approve all pillars | Summary shows, Lock button enabled |
| Lock strategy | Confirmation shown, agency notified |
| Close and return | Progress preserved, picks up where left off |
| Expired token | Friendly error, request new link option |

## Out of Scope

- Pillar modification UI (Story 10-5)
- SMS integration (P1, noted for future)
- Push notifications (requires native app)

---

## Definition of Done

- [ ] All acceptance criteria verified
- [ ] Tested on iPhone Safari (latest iOS)
- [ ] Tested on Chrome Android (latest)
- [ ] Touch targets verified (44px minimum)
- [ ] No horizontal scroll on any device
- [ ] Page load < 2 seconds on throttled 3G
- [ ] Session persistence working
- [ ] Agency notifications working
