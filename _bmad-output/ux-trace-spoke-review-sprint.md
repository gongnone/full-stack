# UX Trace: Spoke Generation → Review Sprint (Broken Experience)

**Date**: 2026-01-10
**Environment**: Staging (foundry-stage.williamjshaw.ca)
**Session Type**: Critical UX Issues - Post-Spoke Generation Review Flow

---

## Executive Summary

The spoke generation and review sprint experience contains **critical UX failures** that render the review interface unusable despite appearing functional. Users complete spoke generation successfully but encounter a phantom interface where:

- ✅ Spokes generate successfully
- ❌ Generated content is completely hidden/not displayed
- ❌ Edit panel opens showing empty state
- ❌ Keyboard shortcuts (Kill/Approve) remain active despite no visible content
- ❌ Users cannot edit spokes they cannot see
- ❌ No error messages or feedback explaining the missing content

This creates a **confusing, frustrating dead-end** after successful content generation.

---

## The User Journey (Current Broken State)

### Phase 1: Hub Creation (✅ Works)
1. User navigates to `/app/hubs/new`
2. Selects "Core Pillars" tab
3. Sees 7 approved pillars from Brand DNA
4. Clicks "Use These Pillars"
5. Advances to Step 3: Pillar Configuration
6. Names the hub (e.g., "Italian Food Content Hub")
7. Clicks "Create Hub" → Hub created successfully

**User State**: ✅ Confident, progressing smoothly

---

### Phase 2: Spoke Generation (✅ Works)
1. User navigates to hub detail page `/app/hubs/{hubId}`
2. Clicks "Generate Spokes" button
3. Spoke generation workflow starts:
   - Shows progress indicator
   - Workflow executes (calls foundry-engine)
   - AI generates 5 spokes per pillar (35 total spokes)
   - Status updates in real-time
4. Generation completes successfully

**User State**: ✅ Excited, anticipating content review

---

### Phase 3: Review Sprint (❌ BROKEN - THE CRITICAL FAILURE)

#### Step 1: Navigation to Review Sprint
- User clicks "Review Sprint" or navigates to `/app/review-sprint`
- Page loads successfully
- UI appears normal - tabs, navigation, layout all present

**User State**: ✅ Ready to review generated content

#### Step 2: The Phantom Interface (❌ Critical UX Failure)

**What the User Sees:**
```
┌──────────────────────────────────────────┐
│  Review Sprint                           │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │     [EMPTY STATE]                  │  │
│  │     No content visible             │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Keyboard hints visible:                 │
│  [K] Kill  [A] Approve  [E] Edit        │
└──────────────────────────────────────────┘
```

**What the User Expected:**
```
┌──────────────────────────────────────────┐
│  Review Sprint                    [1/35] │
│  ┌────────────────────────────────────┐  │
│  │  Pillar: Authentic Italian Heritage│  │
│  │                                    │  │
│  │  Title: The Secret to Nonna's... │  │
│  │                                    │  │
│  │  Hook: Have you ever wondered...  │  │
│  │                                    │  │
│  │  Body: [Full generated content]   │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [K] Kill  [A] Approve  [E] Edit        │
└──────────────────────────────────────────┘
```

**User State**: ⚠️ Confused, uncertain what went wrong

---

#### Step 3: User Attempts to Troubleshoot

##### Attempt 1: Press [E] to Edit (❌ Opens Empty Panel)
```
┌──────────────────────────────────────────┐
│  Review Sprint               │ Edit Panel│
│  ┌──────────────┐           │ ┌────────┐│
│  │              │           │ │        ││
│  │  [EMPTY]     │           │ │ [EMPTY]││
│  │              │           │ │        ││
│  └──────────────┘           │ └────────┘│
│                             │           │
│                             │ No fields │
│                             │ No content│
│  [K] Kill  [A] Approve      │           │
└──────────────────────────────────────────┘
```

**Observation**: Edit panel opens (slides in from right), but shows:
- No title field
- No content textarea
- No platform selector
- No save/cancel buttons
- Just empty space

**User State**: ⚠️⚠️ Frustrated, starting to doubt if generation worked

---

##### Attempt 2: Press [A] to Approve (❌ Works on Invisible Content!)
- User presses [A] key
- Keyboard shortcut fires successfully
- **Backend receives approval for spoke #1**
- **No visual feedback**
- Spoke counter might increment (1/35 → 2/35)
- But still no content displayed

**User State**: ⚠️⚠️⚠️ Extremely confused - "Did I just approve something I can't see?"

---

##### Attempt 3: Press [K] to Kill (❌ Works on Invisible Content!)
- User presses [K] key
- Keyboard shortcut fires successfully
- **Backend receives kill command for current spoke**
- **No visual feedback**
- Moves to next spoke (still invisible)

**User State**: ⚠️⚠️⚠️⚠️ Panicking - "Am I deleting content blindly?"

---

##### Attempt 4: Refresh Page (❌ Same Empty State)
- User refreshes browser
- Page reloads
- **Still no content visible**
- Same empty review sprint interface

**User State**: ⚠️⚠️⚠️⚠️⚠️ Defeated, ready to give up

---

## Root Cause Analysis

### Issue 1: Content Not Rendered (Primary Failure)

**Hypothesis**: Data fetching or rendering logic failure

**Potential Causes**:
1. **tRPC Query Not Executing**:
   - `/app/review-sprint` page might not be calling the correct spoke query
   - Query might be returning empty results despite spokes existing in database

2. **Database Query Filtering Wrong**:
   - Query might be filtering by wrong client_id
   - Query might be filtering by wrong hub_id
   - Query might be excluding 'pending' status spokes

3. **Frontend State Management**:
   - React component state not updating when data arrives
   - Conditional rendering hiding content when it shouldn't
   - CSS hiding content (visibility: hidden / display: none)

4. **Data Structure Mismatch**:
   - Backend returning data in wrong format
   - Frontend expecting different schema than backend provides
   - Missing required fields causing render failure

**Files to Investigate**:
```
apps/foundry-dashboard/src/routes/app/review-sprint.tsx
apps/foundry-dashboard/worker/trpc/routers/spokes.ts
apps/foundry-dashboard/src/components/review-sprint/*
```

---

### Issue 2: Edit Panel Empty (Secondary Failure)

**Hypothesis**: Component receives undefined/null spoke data

**Potential Causes**:
1. **Props Not Passed**:
   - Parent component doesn't pass spoke data to EditPanel
   - `selectedSpoke` prop is undefined

2. **Conditional Rendering Too Aggressive**:
   ```typescript
   {spoke?.title && <TitleField value={spoke.title} />}
   {spoke?.body && <ContentField value={spoke.body} />}
   // If spoke is null, nothing renders
   ```

3. **Form State Not Initialized**:
   - React Hook Form not initialized with spoke values
   - Controlled inputs with no value props

**Files to Investigate**:
```
apps/foundry-dashboard/src/components/review-sprint/EditPanel.tsx
apps/foundry-dashboard/src/components/review-sprint/SpokeEditor.tsx
```

---

### Issue 3: Keyboard Shortcuts Work Without Visual Feedback (Critical UX Bug)

**Hypothesis**: Event handlers work independently of rendering logic

**Why This Happens**:
```typescript
// Keyboard handler might work like this:
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'k') {
    // Calls API with currentSpokeId (exists in state)
    killSpoke(currentSpokeId);
    // BUT: No visual element exists to show what was killed
  }
  if (e.key === 'a') {
    // Calls API with currentSpokeId
    approveSpoke(currentSpokeId);
    // BUT: No visual element exists to show what was approved
  }
};

// Handler is attached to document/window
useEffect(() => {
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [currentSpokeId]);
```

**The Problem**:
- State management works (currentSpokeId exists)
- Event handlers work (keyboard listeners active)
- API calls work (mutations execute)
- **BUT**: Rendering is broken (no content visible)

This creates **dangerous blind actions** - users modify data they cannot see.

---

## The Cascading UX Failure

### Failure Cascade Diagram
```
Generation Success
       ↓
   [User Happy]
       ↓
Navigation to Review Sprint
       ↓
   [Page Loads]
       ↓
No Content Renders ←──────────── PRIMARY FAILURE
       ↓
   [User Confused]
       ↓
Tries to Edit
       ↓
Edit Panel Empty ←──────────── SECONDARY FAILURE
       ↓
   [User Frustrated]
       ↓
Presses Keyboard Shortcuts
       ↓
Actions Execute on Invisible Content ←──── TERTIARY FAILURE
       ↓
   [User Panicked]
       ↓
Refreshes Page
       ↓
Still No Content ←──────────── CONFIRMATION OF BROKEN STATE
       ↓
   [User Gives Up]
```

---

## User Mental Models (Expectations vs Reality)

### User's Mental Model (Expected)
```
Hub Created → Spokes Generated → Review Content → Edit/Approve/Kill → Publish
     ✓              ✓                 ✗                 ✗              ✗
```

**Break Point**: Review Content
**User Assumption**: "Something went wrong with generation"
**Reality**: Generation worked, rendering is broken

---

### What User Tries (Troubleshooting Behavior)
1. **Refresh page** → "Maybe it didn't load"
2. **Check hub detail** → "Maybe spokes aren't generated yet"
3. **Try edit panel** → "Maybe content is hidden somewhere"
4. **Press keyboard shortcuts** → "Maybe this will trigger something"
5. **Navigate away and back** → "Maybe route is broken"
6. **Log out and log in** → "Maybe session issue"
7. **Try different browser** → "Maybe browser bug"
8. **Give up** → "This feature is broken"

**All attempts fail because the bug is in rendering logic, not data**

---

## The Trust Damage

### Before This Experience:
```
User Trust Level: ████████████ 100%
"This AI tool is amazing! It generated my hub perfectly!"
```

### After This Experience:
```
User Trust Level: ███░░░░░░░░░ 30%
"I don't know if any of this works. I can't see what it's doing.
Maybe the AI didn't actually generate anything?
Maybe I just deleted content I couldn't see?
Can I trust any of this?"
```

**Key Insight**: A single broken step destroys trust in the entire system,
even steps that work perfectly.

---

## Technical Investigation Checklist

### 1. Review Sprint Page Component
```bash
# Check if data is being fetched
apps/foundry-dashboard/src/routes/app/review-sprint.tsx
```

**Look for**:
- tRPC query for spokes (`spokes.getForReview`, `spokes.listPending`, etc.)
- Query parameters (clientId, hubId, status filters)
- Loading states
- Error states
- Conditional rendering of spoke list

### 2. Spoke Query Router
```bash
apps/foundry-dashboard/worker/trpc/routers/spokes.ts
```

**Look for**:
- Query returning empty results
- SQL WHERE clause filtering out valid spokes
- Status filtering (`WHERE status = 'pending'` but spokes are 'draft'?)
- JOIN issues
- Missing data serialization

### 3. Review Sprint Components
```bash
apps/foundry-dashboard/src/components/review-sprint/
```

**Check**:
- SpokeCard component rendering
- Props being passed correctly
- Conditional rendering hiding content
- CSS issues (display: none, visibility: hidden)
- Z-index issues (content behind other elements)

### 4. Edit Panel Component
```bash
apps/foundry-dashboard/src/components/review-sprint/EditPanel.tsx
```

**Check**:
- Props interface (is `spoke` prop optional?)
- Early returns when `spoke` is undefined
- Form initialization
- Field rendering conditional on data existence

### 5. Keyboard Shortcut Handler
```bash
# Likely in review-sprint.tsx or a hook
```

**Check**:
- Event handler dependencies
- State access for currentSpokeId
- Whether handler should be disabled when no content visible
- Guard clauses needed

---

## Proposed Solutions (Master Storyteller Improvements)

### Phase 1: Fix the Technical Issues (Critical - P0)

#### Fix 1: Ensure Content Loads
```typescript
// In review-sprint.tsx
const spokesQuery = trpc.spokes.getForReview.useQuery({
  clientId,
  status: 'draft', // Make sure this matches spoke generation status
});

// Add comprehensive error/empty states
if (spokesQuery.isLoading) {
  return <LoadingSpinner />;
}

if (spokesQuery.error) {
  return <ErrorState error={spokesQuery.error} />;
}

if (!spokesQuery.data || spokesQuery.data.length === 0) {
  return <EmptyState message="No spokes found for review" />;
}

// ONLY render review interface if we have data
return <ReviewSprintInterface spokes={spokesQuery.data} />;
```

#### Fix 2: Disable Shortcuts When No Content
```typescript
// Keyboard handler should check for valid state
const handleKeyPress = (e: KeyboardEvent) => {
  // GUARD: Don't allow actions if no spoke is visible
  if (!currentSpoke || !spokesData || spokesData.length === 0) {
    return;
  }

  if (e.key === 'k') killSpoke(currentSpoke.id);
  if (e.key === 'a') approveSpoke(currentSpoke.id);
  if (e.key === 'e') openEditPanel(currentSpoke);
};
```

#### Fix 3: Edit Panel Defensive Rendering
```typescript
// EditPanel.tsx
export function EditPanel({ spoke, onClose }: Props) {
  // GUARD: Don't render if no spoke data
  if (!spoke) {
    return (
      <EmptyEditPanel>
        <p>No spoke selected for editing</p>
        <Button onClick={onClose}>Close</Button>
      </EmptyEditPanel>
    );
  }

  // Safe to render with spoke data
  return (
    <Panel>
      <TitleField value={spoke.title} />
      <ContentField value={spoke.body} />
      {/* ... */}
    </Panel>
  );
}
```

---

### Phase 2: Enhance User Experience (High - P1)

#### UX Enhancement 1: Progress Indicator After Generation
```
After Spoke Generation Completes:
┌──────────────────────────────────────────┐
│  ✅ 35 Spokes Generated Successfully!    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🎯 Next: Review Your Content       │  │
│  │                                    │  │
│  │ Your AI-generated content is ready │  │
│  │ for review. You'll be able to:    │  │
│  │                                    │  │
│  │ • Approve great content            │  │
│  │ • Edit drafts that need work       │  │
│  │ • Kill content that misses mark    │  │
│  │                                    │  │
│  │ [Start Reviewing]                  │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### UX Enhancement 2: Loading State with Content Hints
```
Review Sprint Page Loading:
┌──────────────────────────────────────────┐
│  Loading your content...         [1/35]  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │                                    │  │
│  │  Fetching 35 spokes from           │  │
│  │  "Italian Food Content Hub"        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### UX Enhancement 3: Empty State with Clear Next Steps
```
If No Spokes Found:
┌──────────────────────────────────────────┐
│  No Content to Review                    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🤔 Hmm, we didn't find any spokes  │  │
│  │    ready for review.               │  │
│  │                                    │  │
│  │ This could mean:                   │  │
│  │ • Spokes are still generating      │  │
│  │ • All spokes already reviewed      │  │
│  │ • No hub selected                  │  │
│  │                                    │  │
│  │ [Check Hub Status]                 │  │
│  │ [Generate New Content]             │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### UX Enhancement 4: Edit Panel with Helpful Empty State
```
Edit Panel When No Spoke Selected:
┌──────────────────────────────────────────┐
│  Review Sprint               │ Edit Panel│
│  ┌──────────────┐           │ ┌────────┐│
│  │              │           │ │  📝    ││
│  │  [Content]   │           │ │        ││
│  │              │           │ │  Select││
│  └──────────────┘           │ │  a     ││
│                             │ │  spoke ││
│  [K] Kill  [A] Approve      │ │  to    ││
│  [E] Edit  [N] Next         │ │  edit  ││
│                             │ │        ││
│                             │ └────────┘│
└──────────────────────────────────────────┘
```

#### UX Enhancement 5: Keyboard Shortcut Visual Feedback
```
When User Presses [A]:
┌──────────────────────────────────────────┐
│  Review Sprint                    [2/35] │
│  ┌────────────────────────────────────┐  │
│  │  ✅ APPROVED                       │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │ Authentic Italian Heritage   │ │  │
│  │  │                              │ │  │
│  │  │ The Secret to Nonna's Sauce  │ │  │
│  │  └──────────────────────────────┘ │  │
│  │                                    │  │
│  │  [Moving to next spoke in 2s...]   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [K] Kill  [A] Approve  [E] Edit        │
└──────────────────────────────────────────┘
```

#### UX Enhancement 6: Keyboard Shortcut Confirmation for Destructive Actions
```
When User Presses [K]:
┌──────────────────────────────────────────┐
│  Review Sprint                    [2/35] │
│  ┌────────────────────────────────────┐  │
│  │  Authentic Italian Heritage        │  │
│  │                                    │  │
│  │  The Secret to Nonna's Sauce       │  │
│  │                                    │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │ ⚠️  Kill this spoke?          │ │  │
│  │  │                              │ │  │
│  │  │ This will permanently delete │ │  │
│  │  │ this content.                │ │  │
│  │  │                              │ │  │
│  │  │ [K] Confirm   [Esc] Cancel   │ │  │
│  │  └──────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

### Phase 3: Master Storyteller Enhancements (Medium - P2)

#### Storytelling Element 1: Progress Visualization
```
Review Sprint with Progress Journey:
┌──────────────────────────────────────────┐
│  Your Review Journey              [7/35] │
│                                          │
│  ✅✅✅✅✅✅⚡️░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  Approved: 6  Edited: 1  Killed: 0      │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Current: Authentic Italian Heritage│  │
│  │                                    │  │
│  │  [Content shows here]              │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

#### Storytelling Element 2: Encouraging Micro-copy
```
After Approving First Spoke:
┌──────────────────────────────────────────┐
│  🎉 Great choice!                 [2/35] │
│                                          │
│  That spoke is ready to inspire your     │
│  audience. Keep going!                   │
└──────────────────────────────────────────┘
```

```
After Editing a Spoke:
┌──────────────────────────────────────────┐
│  ✨ Nice improvements!           [3/35]  │
│                                          │
│  Your edits made this spoke even better. │
└──────────────────────────────────────────┘
```

```
Halfway Through:
┌──────────────────────────────────────────┐
│  💪 Halfway there!               [18/35] │
│                                          │
│  You're making great progress.           │
│  17 spokes to go!                        │
└──────────────────────────────────────────┘
```

#### Storytelling Element 3: Session Persistence
```
Returning to Review Sprint:
┌──────────────────────────────────────────┐
│  Welcome back!                   [12/35] │
│                                          │
│  You've reviewed 11 spokes.              │
│  Ready to continue where you left off?  │
│                                          │
│  [Resume Review]    [Start Over]        │
└──────────────────────────────────────────┘
```

#### Storytelling Element 4: Completion Celebration
```
All Spokes Reviewed:
┌──────────────────────────────────────────┐
│  🎊 Review Complete!             [35/35] │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Amazing work! You've reviewed all  │  │
│  │ 35 spokes from your hub.           │  │
│  │                                    │  │
│  │ Your Results:                      │  │
│  │ ✅ Approved:  28 spokes            │  │
│  │ ✏️  Edited:    5 spokes            │  │
│  │ ❌ Killed:     2 spokes            │  │
│  │                                    │  │
│  │ Next: Schedule or publish your     │  │
│  │ approved content to social media.  │  │
│  │                                    │  │
│  │ [Schedule Posts]                   │  │
│  │ [Review Again]                     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Implementation Priority

### P0 - Critical Blockers (Fix Immediately)
1. **Make content visible** - Fix spoke rendering in review sprint
2. **Fix edit panel** - Show spoke data when editing
3. **Disable shortcuts when no content** - Prevent blind actions

**Est. Effort**: 2-4 hours
**Impact**: Unblocks entire review workflow

---

### P1 - High Impact UX (Fix This Week)
1. **Loading states** - Show progress when fetching spokes
2. **Empty states** - Clear messaging when no content
3. **Error states** - Helpful messages when things break
4. **Visual feedback** - Confirm actions (approve, kill, edit)

**Est. Effort**: 4-8 hours
**Impact**: Professional, polished experience

---

### P2 - Delightful UX (Polish Sprint)
1. **Progress visualization** - Journey map through review
2. **Encouraging copy** - Celebrate user progress
3. **Session persistence** - Remember where user left off
4. **Completion celebration** - Reward finishing review
5. **Keyboard shortcut confirmations** - Prevent accidents

**Est. Effort**: 8-16 hours
**Impact**: Users love the experience, recommend to others

---

## Success Metrics

### Before Fix:
- ❌ Review completion rate: 0% (blocked)
- ❌ User confusion rate: 100%
- ❌ Support tickets: High
- ❌ User trust: Damaged

### After P0 Fix:
- ✅ Review completion rate: >80%
- ✅ User confusion rate: <20%
- ✅ Support tickets: Low
- ✅ User trust: Restored

### After P1 Fix:
- ✅ Review completion rate: >90%
- ✅ User confusion rate: <10%
- ✅ Time to complete review: <15 minutes
- ✅ User satisfaction: Good

### After P2 Fix:
- ✅ Review completion rate: >95%
- ✅ User confusion rate: <5%
- ✅ Time to complete review: <10 minutes
- ✅ User satisfaction: Excellent
- ✅ User retention: High
- ✅ Word-of-mouth: Positive

---

## Conclusion

The current review sprint experience represents a **catastrophic UX failure** that undermines user trust despite successful content generation. The issue is particularly insidious because:

1. **Silent failure** - No errors, no warnings, just missing content
2. **Phantom functionality** - Shortcuts work on invisible content
3. **User self-doubt** - Users question if generation worked at all
4. **Trust destruction** - One broken step damages entire product perception

**The fix is straightforward** (P0 technical issues), but the opportunity exists to transform this into a **delightful, confidence-building experience** through thoughtful UX enhancements (P1, P2).

This is where good products become great - by turning potential failure points into moments of delight.

---

**Next Steps**:
1. Debug spoke rendering (check tRPC query, component rendering)
2. Add defensive guards (empty states, loading states, error states)
3. Enhance feedback (visual confirmations, progress indicators)
4. Polish experience (encouraging copy, celebrations, persistence)

The technical debt is small. The UX opportunity is enormous.
