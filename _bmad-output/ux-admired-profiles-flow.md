# UX Design: Admired Profiles Management

**Feature:** Client-Curated Instagram Profiles for Personalized G7 Scoring
**Design System:** Midnight Command (X/Twitter-inspired professional aesthetic)
**Priority:** P0 (Core MVP differentiator)

---

## Design Philosophy

**Core Principle:** Make adding admired profiles feel like curating a personal board of advisors, not managing a data import.

**Emotional Journey:**
1. **Discovery:** "Oh, I can teach this tool what *I* like"
2. **Curation:** "Let me add the creators I actually follow"
3. **Validation:** "My scores are now based on people I respect"
4. **Confidence:** "This is MY tool, tuned to MY taste"

---

## User Flows

### Flow 1: First-Time User (Empty State)

**Context:** User navigates to Settings → Admired Profiles for the first time.

**Steps:**

1. **Landing on Empty State**
   - **Visual:** Centered layout with magnifying glass icon over Instagram icon (Midnight Command colors)
   - **Heading:** "Add Creators You Admire" (text-[#E7E9EA], 24px font)
   - **Description:** "Personalize your engagement scoring by adding Instagram profiles you want to emulate. Your G7 scores will prioritize patterns from these creators." (text-[#8B98A5], 16px)
   - **CTA:** Large button "Add Your First Profile" (bg-[#1D9BF0], white text)

2. **Click "Add Your First Profile"**
   - Dialog slides up from bottom (mobile) or fades in center (desktop)
   - **Dialog Title:** "Add Admired Profile"
   - **Input Field:**
     - Label: "Instagram Handle"
     - Placeholder: "@garyvee"
     - Auto-prefixes with @ if user doesn't type it
     - Validation: Real-time (✓ green checkmark if format valid)
   - **Buttons:**
     - "Add Profile" (primary, disabled until valid handle entered)
     - "Cancel" (secondary, text-only)

3. **Submit Valid Handle**
   - Button shows loading spinner: "Finding profile..."
   - Dialog remains open with loading state (2-3 seconds)
   - Success: Dialog closes, profile card appears with "Syncing..." status
   - Error: Red toast notification appears, dialog stays open for correction

4. **Profile Syncing**
   - Card appears in grid with:
     - Placeholder avatar (shimmer animation)
     - Handle shown
     - Status: "Syncing... 0/50 posts"
     - Progress bar animates (blue, determinate)
   - Updates every 2 seconds via polling
   - Progress increments: "12/50", "24/50", "47/50"

5. **Sync Complete**
   - Avatar loads from Instagram
   - Status changes: "✓ 47 posts analyzed" (green checkmark icon)
   - Card fully populates with follower count, last synced
   - Subtle success animation (gentle scale + fade)
   - **Callout card appears at top:** "G7 Scoring: 50% from your admired profiles, 30% baseline. Add 5+ profiles for maximum personalization."

---

### Flow 2: Adding Additional Profiles

**Context:** User has 1-4 existing profiles, wants to add more.

**Steps:**

1. **Click "+ Add Profile" Button** (top-right corner, always visible)
   - Same dialog as Flow 1
   - Input field auto-focuses on open

2. **Submit Duplicate Handle**
   - Toast notification (yellow warning): "@garyvee is already in your admired profiles"
   - Dialog stays open for different handle

3. **Submit Private Profile**
   - Scraper detects privacy setting
   - Profile card appears with error state:
     - Red warning icon
     - Status: "Profile is private. Add public profiles only."
     - No avatar, follower count shows "—"
     - Action: "Remove" button only (no re-sync)
   - Toast notification (red): "Cannot sync @privateaccount - profile is private"

4. **Reach 5 Profiles**
   - Callout card updates: "G7 Scoring: 70% from your admired profiles, 30% baseline. Your scores are now fully personalized! 🎯"
   - Subtle confetti animation (single burst, quick)

---

### Flow 3: Managing Existing Profiles

**Context:** User has active profiles and wants to re-sync or remove.

**Steps:**

1. **Hover Profile Card**
   - Action buttons fade in (top-right corner of card)
   - Re-sync button: Circular arrow icon (blue)
   - Remove button: Trash icon (white, red on hover)

2. **Click Re-Sync**
   - Button shows loading spinner
   - Status changes to "Syncing... 0/50 posts"
   - Progress bar appears
   - Same sync flow as initial add
   - On completion: Toast notification "✓ @garyvee updated with latest posts"

3. **Click Remove**
   - Confirmation dialog appears:
     - **Title:** "Remove @garyvee?"
     - **Message:** "This will update your G7 scoring to deprioritize patterns from this creator."
     - **Buttons:**
       - "Remove" (red, destructive)
       - "Cancel" (secondary)
   - If confirmed:
     - Card fades out and slides up (300ms animation)
     - Toast notification: "@garyvee removed. G7 scoring updated."
     - Callout card updates weighting immediately

---

### Flow 4: Error Recovery

**Context:** Sync fails due to rate limiting or network error.

**Steps:**

1. **Rate Limit Detected**
   - Profile status: "Rate limit reached. Retrying in 1 hour."
   - Warning icon (yellow)
   - No action buttons (auto-retry scheduled)
   - Toast notification (yellow): "Instagram rate limit reached. @garyvee will auto-sync in 1 hour."

2. **Network Error**
   - Profile status: "Sync failed. Network error."
   - Red error icon
   - "Retry" button appears
   - Toast notification (red): "Failed to sync @garyvee. Check your connection."

3. **Click Retry**
   - Status changes to "Syncing..."
   - Attempts sync again
   - Same success/failure flow

---

## UI Components (Midnight Command Design)

### Component 1: Empty State

**Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│           [Magnifying Glass Icon]           │
│               over Instagram                │
│                                             │
│        Add Creators You Admire              │
│                                             │
│  Personalize your engagement scoring by     │
│  adding Instagram profiles you want to      │
│  emulate. Your G7 scores will prioritize    │
│  patterns from these creators.              │
│                                             │
│     [ Add Your First Profile ]              │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Background: `#0F1419`
- Icon: `#8B98A5` (secondary text)
- Heading: `#E7E9EA` (primary text)
- Description: `#8B98A5` (secondary text)
- Button: `#1D9BF0` (primary action)

---

### Component 2: Add Profile Dialog

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Add Admired Profile                    ✕   │
├─────────────────────────────────────────────┤
│                                             │
│  Instagram Handle                           │
│  ┌───────────────────────────────────────┐  │
│  │ @garyvee                           ✓  │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  [ Cancel ]           [ Add Profile ]       │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Dialog background: `#1A1F26` (surface)
- Border: `#2A3038`
- Input background: `#0F1419` (background)
- Input border: `#2A3038`, focus: `#1D9BF0`
- Validation checkmark: `#00D26A` (success green)
- Primary button: `#1D9BF0`
- Secondary button: text-only `#8B98A5`

**Behavior:**
- Auto-focus input on open
- Real-time validation (format check)
- Disabled button until valid
- Escape key to close

---

### Component 3: Profile Card (Active State)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Avatar]  @garyvee               ↻    🗑   │
│            Gary Vaynerchuk                  │
│            3.2M followers                   │
│            ✓ 47 posts analyzed              │
│            Last synced: 2 hours ago         │
└─────────────────────────────────────────────┘
```

**Colors:**
- Card background: `#1A1F26` (surface)
- Border: `#2A3038`
- Text primary: `#E7E9EA`
- Text secondary: `#8B98A5`
- Success icon: `#00D26A`
- Action buttons: `#8B98A5`, hover: `#1D9BF0` (re-sync), `#F4212E` (remove)

**Spacing:**
- Padding: 16px
- Avatar: 48px circle
- Icon buttons: 32px touch target
- Line height: 1.5

---

### Component 4: Profile Card (Syncing State)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [⟳]       @garyvee                         │
│            Syncing... 24/50 posts           │
│            ██████████░░░░░░░░░░ 48%         │
└─────────────────────────────────────────────┘
```

**Colors:**
- Spinner icon: `#1D9BF0` (animated rotation)
- Progress bar background: `#2A3038`
- Progress bar fill: `#1D9BF0`
- Text: `#8B98A5`

**Animation:**
- Spinner: 1s linear infinite rotation
- Progress bar: Smooth fill transition (300ms)
- Poll every 2 seconds for updates

---

### Component 5: Profile Card (Error State)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [⚠️]      @privateaccount        🗑        │
│            Profile is private. Add public   │
│            profiles only.                   │
└─────────────────────────────────────────────┘
```

**Colors:**
- Warning icon: `#FFAD1F` (warning yellow)
- Error icon (if critical): `#F4212E` (error red)
- Error message: `#F4212E`
- Remove button: `#F4212E` on hover

---

### Component 6: G7 Weighting Callout Card

**Layout:**
```
┌─────────────────────────────────────────────┐
│  🎯 G7 Scoring: 70% from your admired       │
│  profiles, 30% baseline                     │
└─────────────────────────────────────────────┘
```

**Colors:**
- Background: `#1A1F26` with blue left border `#1D9BF0` (4px)
- Icon: `#1D9BF0`
- Text: `#E7E9EA`
- Bold percentage: `#00D26A` (success)

**Positioning:**
- Fixed at top of page (sticky)
- Appears after first profile added
- Updates dynamically when profile count changes

---

### Component 7: Confirmation Dialog (Remove)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Remove @garyvee?                       ✕   │
├─────────────────────────────────────────────┤
│                                             │
│  This will update your G7 scoring to        │
│  deprioritize patterns from this creator.   │
│                                             │
│  [ Cancel ]              [ Remove ]         │
│                                             │
└─────────────────────────────────────────────┘
```

**Colors:**
- Dialog background: `#1A1F26`
- Border: `#2A3038`
- Remove button: `#F4212E` (destructive action)
- Cancel button: text-only `#8B98A5`

---

## Responsive Behavior

### Desktop (>= 1024px)
- Grid: 3 columns for profile cards
- Dialog: Center-aligned, 500px wide
- Callout card: Full-width at top

### Tablet (768px - 1023px)
- Grid: 2 columns for profile cards
- Dialog: Center-aligned, 90% width max 500px

### Mobile (< 768px)
- Grid: 1 column (full-width cards)
- Dialog: Slide-up sheet from bottom
- Callout card: Full-width, sticky at top

---

## Micro-interactions

### Add Profile Success
1. Dialog fade out (200ms)
2. New card fade in + slide down (300ms)
3. If reaching 5 profiles: Single confetti burst from center (500ms)

### Sync Progress
1. Progress bar smooth fill (300ms per update)
2. Post count increments with subtle number flip animation
3. Success checkmark scale in (200ms)

### Remove Profile
1. Card fade out + slide up (300ms)
2. Grid reflow with smooth transitions (300ms)
3. Gap closes automatically

### Re-sync
1. Checkmark → Spinner transition (100ms)
2. Progress bar slide in from left (200ms)
3. Completion: Spinner → Checkmark with scale pulse (200ms)

---

## Accessibility

### Keyboard Navigation
- Tab order: Add button → Profile cards → Card actions
- Enter: Activates focused button
- Escape: Closes dialog
- Arrow keys: Navigate between cards

### Screen Reader
- Empty state: "Add creators you admire to personalize engagement scoring"
- Profile card: "@garyvee, 3.2 million followers, 47 posts analyzed, last synced 2 hours ago, active"
- Syncing state: "Syncing @garyvee, 24 of 50 posts complete, 48 percent"
- Action buttons: "Re-sync @garyvee", "Remove @garyvee"

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Icons have text labels for clarity
- Focus indicators visible (2px blue outline)

---

## Edge Cases

### Edge Case 1: No Instagram Profiles Found
**Trigger:** User enters valid format but non-existent handle
**Behavior:**
- Toast notification: "Handle not found. Check spelling."
- Dialog stays open
- Input shows red border with error message below

### Edge Case 2: Instagram Changes Markup
**Trigger:** Apify scraper fails due to Instagram UI changes
**Behavior:**
- Profile status: "Sync temporarily unavailable"
- Auto-retry every 6 hours
- Email notification to admin

### Edge Case 3: User Removes All Profiles
**Trigger:** Last profile deleted
**Behavior:**
- Empty state reappears
- Callout card updates: "G7 Scoring: 100% baseline. Add profiles to personalize."
- Future spokes use 100% baseline scoring

### Edge Case 4: Extremely Slow Sync
**Trigger:** Scraping takes > 5 minutes
**Behavior:**
- Progress bar continues updating
- After 5 min: Toast warning "This is taking longer than usual. @garyvee will continue syncing in background."
- User can navigate away, card updates when complete

---

## Success Metrics

### Primary Metrics
- **Add Rate:** % of users who add at least 1 profile within 7 days of signup
- **Target:** >60%

- **Engagement Depth:** Avg number of profiles added per user
- **Target:** 3-5 profiles

- **G7 Accuracy Lift:** Correlation improvement when using admired vs. baseline
- **Target:** +15% correlation (r value)

### Secondary Metrics
- Sync success rate (target: >95%)
- Re-sync frequency (indicator of engagement)
- Time to first profile add (target: <2 minutes from signup)

---

## Development Handoff Notes

**Figma:** Wireframes attached (see `/designs/admired-profiles-wireframes.fig`)

**Assets Needed:**
- Instagram icon (SVG)
- Magnifying glass icon (SVG)
- All state icons: checkmark, spinner, warning, error

**Animation Library:** Use Framer Motion for React animations

**Icon Library:** Lucide React (already in project)

**Real-time Updates:** Polling interval = 2 seconds during sync, exponential backoff after completion

---

## Questions for Engineering

1. **Apify API Rate Limits:** What's the maximum concurrent scrapes we can run?
2. **Vectorize Namespace Limits:** Is there a max vector count per `client_{id}_admired` namespace?
3. **Polling Strategy:** Should we use WebSocket instead of polling for real-time sync updates?
4. **Avatar Caching:** Should we proxy/cache Instagram avatars or hotlink?

---

## Next Steps

1. ✅ Story 4.7 created with full AC coverage
2. ✅ UX flow documented
3. **Pending:** Wireframe mockups in Figma/Excalidraw
4. **Pending:** Design review with Williamshaw
5. **Pending:** Engineering kickoff meeting

---

**Designed by:** Sally (UX Designer)
**Date:** 2026-01-19
**Status:** Ready for wireframe creation
