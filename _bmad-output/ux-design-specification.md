---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments:
  - prd.md
  - analysis/product-brief-full-stack-2025-12-19.md
  - analysis/brainstorming-session-2025-12-19.md
workflowType: 'ux-design'
lastStep: 6
project_name: 'full-stack'
user_name: 'Williamshaw'
date: '2025-12-21'
visualTheme: 'Midnight Command'
---

# UX Design Specification: The Agentic Content Foundry

**Author:** Williamshaw
**Date:** 2025-12-21

---

## Executive Summary

### Project Vision

**The Agentic Content Foundry** transforms content creators from exhausted writers into confident Executive Producers. The UX must embody this shift — replacing blank pages with pre-validated content queues, and replacing manual creation with intelligent curation.

The core UX promise: **30 minutes to review 300 pieces**, with 60%+ requiring zero edits.

**The Paradigm Shift:**
- FROM: "I don't know what to post" → TO: "Which of these 300 validated ideas do I want?"
- FROM: Content Creation (exhausting) → TO: Content Curation (empowering)
- FROM: Blank Page Anxiety → TO: Mission Control Confidence

### Target Users

| Persona | Primary Journey | Key UX Need | UX Priority |
|---------|-----------------|-------------|-------------|
| **Marcus Chen** (Agency AM) | Bulk Approval for 47 clients | < 6 sec per decision, Hub-level Kill Chain | **High-Velocity Triage** |
| **Dr. Priya Sharma** (Solo Creator) | Brand DNA onboarding + swipe review | Voice/content upload → immediate value | **Brand Resonance Verification** |
| **Sarah Park** (Client) | Shareable Production Link review | Confidence tiering, real-time sync | Trust-Building Transparency |
| **David Chen** (Compliance) | G-Compliance Gate + Audit Export | Explainability, full decision trail | Regulatory Confidence |

### Key Design Challenges

1. **Review Tax Elimination** — Bulk approval must feel like a game, not work (< 6 sec/decision)
2. **Adversarial Transparency** — Quality gate decisions must be visible and trustworthy
3. **Hub-to-Spoke Hierarchy** — 25 spokes per Hub without cognitive overload
4. **Calibration Friction** — Brand DNA recalibration must be instant, not form-filling

### Design Opportunities

1. **Executive Producer Identity** — Mission Control dashboard, production progress, not loading spinners
2. **Golden Nugget Discovery** — Celebrate when predictions outperform (builds system trust)
3. **Swipe-to-Learn Visibility** — Show users how their decisions train the model
4. **Client Collaboration Theater** — Real-time sync with confidence tiering for agency/client workflows

---

## Interaction Pattern Locks

### Pattern 1: Signal Header
Every content card leads with G2 (Hook Score) and G7 (Prediction Score) in large, high-contrast typography. The "Reason to Approve" is visible in < 1 second.

### Pattern 2: "Why" Hover
Hovering over any score reveals the Critic's rubric notes (e.g., "Pattern Interrupt: High | Curiosity Gap: Low"). Transforms hesitation into confidence without leaving the flow.

### Pattern 3: Platform Toggle
Sticky header enables flip between "All Platforms" (for Hub view) or "LinkedIn Only" (cross-client triage). Essential for Marcus's multi-client workflow.

### Pattern 4: Tree Map Hierarchy
Production Queue uses zoomable/hierarchical view:
- **Hub Level (Root)**: Source Document (e.g., "Podcast Ep. 12")
- **Pillar Level (Branches)**: 5 Psychological Angles (e.g., "The Rebellious Gambler")
- **Spoke Level (Leaves)**: 25 platform-specific assets

### Pattern 5: Pillar Pruning Animation
Killing a "Branch" (Pillar) triggers satisfying visual "pruning" animation — associated spokes gray out, progress bar updates. Kill Chain feels *decisive*, not destructive.

### Pattern 6: Creative Conflict Panel
When Self-Healing Loop fails (3 attempts), side-by-side view appears:
- **Left**: Critic's final rejection reason
- **Right**: The 3 generated drafts
- **Actions**: "Force Approve" | "Quick Edit" | "Voice Calibrate" (Director's Cut)

---

## Core User Experience

### Defining Experience: The 30-Minute Sprint

The core experience is the **Bulk Approval Flow** — a three-state interaction model:

1. **Enter Flow State**: Filter 300 pieces to actionable buckets (High Confidence, Needs Review, Creative Conflicts)
2. **Decision Loop State**: Keyboard-driven card review with < 6 sec per decision target
3. **Batch Complete State**: Executive Producer Report celebrating time saved and Zero-Edit Rate

### Platform Strategy

| Platform | Priority | Rationale |
|----------|----------|-----------|
| **Web (Desktop)** | Primary | Keyboard shortcuts, multi-monitor support, power user optimization |
| **Web (Tablet)** | Secondary | Touch-enabled swipe for review sessions (1024px+) |
| **Mobile Web** | Tertiary | Emergency "Voice Calibrate" for DNA alerts only |

**Technical Stack**: React 19, TanStack Router, Tailwind CSS, Radix UI, WebSocket for real-time sync

### Effortless Interactions

| Interaction | Target | Implementation |
|-------------|--------|----------------|
| **Approve** | 0.5 sec | Right Arrow or swipe right |
| **Kill** | 0.5 sec | Left Arrow or swipe left |
| **Hub Kill** | 1.5 sec | H key + confirmation modal |
| **Quality Check** | 0 sec | G2/G7 visible by default in Signal Header |
| **Critic Notes** | 0.5 sec | Hover expansion, no page change |
| **Batch Export** | 5 sec | One-click calendar download |

### Critical Success Moments

1. **First Sprint Completion** — User sees "13.7 hours saved" and experiences the paradigm shift
2. **Zero-Edit Rate > 80%** — User realizes the Agent has captured their brand voice
3. **Hub Kill Cascade** — User feels the power of hierarchical content management
4. **Golden Nugget Discovery** — G7 prediction outperforms by 3x+, builds trust in system

### Experience Principles

1. **"Signal, Not Noise"** — Quality indicators visible in < 1 second
2. **"Keyboard is King"** — Power users never touch mouse in Decision Loop
3. **"Progress Feels Physical"** — Every action has visceral feedback
4. **"Hierarchy Enables Speed"** — One decision cascades to many
5. **"Celebrate the Win"** — Quantify time/money saved in every session
6. **"Trust Through Transparency"** — Critic notes always accessible

### State 1: Enter Flow

**Production Queue Dashboard** with four action buckets:
- **High Confidence** (G7 > 9.0) — "Sprint Mode" entry point
- **Needs Review** (G7 < 7.0) — Requires more attention
- **Creative Conflicts** — Self-Healing failures awaiting Director's Cut
- **Just Generated** — Real-time progress with WebSocket hydration

**Quick Actions:**
- `⌘+H` — High Confidence Sprint
- `⌘+A` — Approve All G7 > 9.5 (Nuclear Approve)
- `⌘+K` — Kill All G7 < 5.0 (Nuclear Kill)

**Filter Bar:** Client | Platform | Hub | G7 Score

### State 2: Decision Loop

**Card Layout:**
1. **Signal Header** — G2 + G7 scores in large typography
2. **Context Bar** — Client, Platform, Hub, Pillar
3. **Content Preview** — Full text with platform formatting
4. **Gate Status** — G4 (Voice) + G5 (Platform) pass/fail indicators
5. **Action Bar** — Kill | Edit | Approve

**Keyboard Shortcuts:**
- `→` Approve | `←` Kill | `E` Edit | `H` Hub Kill | `Space` Skip | `?` Toggle Critic Notes

**Feedback System:**
- Approve: Green flash, card slides right, "✓ Scheduled" toast
- Kill: Red flash, card slides left, counter updates
- Hub Kill: Cascade prune animation, progress bar jumps
- Skip: Yellow flash, moves to end of queue

### State 3: Batch Complete

**Executive Producer Report:**
- Session duration and decision velocity
- Approved / Killed / Edited breakdown with percentages
- Scheduled / Archived counts
- Time Savings calculation (hours saved, dollar value)
- Zero-Edit Rate vs. target with progress bar
- Per-client breakdown

**Actions:** Export Calendar | Share Links | Continue to Conflicts

---

## Desired Emotional Response & Visual Identity

### Primary Emotional Goals

| Emotion | Definition | Anti-Pattern |
|---------|------------|--------------|
| **COMMAND** | "I'm directing this, not doing it" | Micromanaging or babysitting AI |
| **VELOCITY** | "I'm moving fast because the system works" | Frantic clicking through broken UI |
| **TRUST** | "I understand why this was approved" | Blind faith in AI decisions |
| **ACCOMPLISHMENT** | "I just did something impressive" | Task completion without celebration |

### Emotional Journey

| Stage | Emotion | Visual Expression |
|-------|---------|-------------------|
| **Enter Dashboard** | Anticipation | Dark theme, warm glow on action buckets |
| **During Sprint** | Flow State | Smooth transitions, momentum-building feedback |
| **Decision Made** | Satisfaction | Instant feedback, counter updates, progress fills |
| **Sprint Complete** | Pride | Executive Producer Report, time/money saved metrics |
| **Error/Conflict** | Curiosity (not frustration) | Clear explanation, Director's Cut options |

### Visual Identity: "Midnight Command" [LOCKED]

**Theme Direction**: Dark, professional, command-center aesthetic
**Inspiration**: Linear.app precision + Superhuman speed + Spotify elegance + Apple TV+ premium
**Anti-References**: Generic SaaS, Canva, overly playful interfaces

### Color System — Midnight Command

| Role | Token | Hex | Usage |
|------|-------|-----|-------|
| **Background** | `--bg-base` | `#0F1419` | Main canvas, app shell |
| **Surface** | `--bg-elevated` | `#1A1F26` | Cards, panels, modals |
| **Surface Hover** | `--bg-hover` | `#242A33` | Interactive element hover |
| **Border** | `--border-subtle` | `#2A3038` | Card borders, dividers |
| **Border Focus** | `--border-focus` | `#3A424D` | Focus states |
| **Text Primary** | `--text-primary` | `#E7E9EA` | Headlines, content body |
| **Text Secondary** | `--text-secondary` | `#8B98A5` | Labels, captions, hints |
| **Text Muted** | `--text-muted` | `#536471` | Disabled states |
| **Approve** | `--accent-approve` | `#00D26A` | Success, approve actions |
| **Approve Glow** | `--accent-approve-glow` | `rgba(0,210,106,0.15)` | Hover/focus glow |
| **Kill** | `--accent-kill` | `#F4212E` | Destructive, kill actions |
| **Kill Glow** | `--accent-kill-glow` | `rgba(244,33,46,0.15)` | Hover/focus glow |
| **Edit** | `--accent-edit` | `#1D9BF0` | Informational, edit actions |
| **Warning** | `--accent-warning` | `#FFAD1F` | Attention, skip actions |
| **Score High** | `--score-high` | `#00D26A` | G7 > 8.0 |
| **Score Mid** | `--score-mid` | `#FFAD1F` | G7 5.0-8.0 |
| **Score Low** | `--score-low` | `#F4212E` | G7 < 5.0 |

### Typography System

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| **Signal Score** | Inter | 700 (Bold) | 48px | 1.0 |
| **Page Title** | Inter | 600 (Semibold) | 28px | 1.2 |
| **Section Header** | Inter | 600 (Semibold) | 20px | 1.3 |
| **Card Title** | Inter | 500 (Medium) | 16px | 1.4 |
| **Body** | Inter | 400 (Regular) | 15px | 1.5 |
| **Caption** | Inter | 500 (Medium) | 13px | 1.4 |
| **Label** | Inter | 500 (Medium) | 12px | 1.3 |
| **Mono Stats** | JetBrains Mono | 400 | 14px | 1.4 |

### Motion System

| Interaction | Animation | Duration | Easing | Description |
|-------------|-----------|----------|--------|-------------|
| **Card Approve** | translateX(100%) + opacity(0) | 200ms | ease-out | Slides right, fades |
| **Card Kill** | translateX(-100%) + scale(0.95) | 200ms | ease-out | Slides left, shrinks |
| **Hub Kill Cascade** | staggered opacity + translateY | 400ms | ease-in-out | Children fade down sequentially |
| **Progress Fill** | width transition | 300ms | linear | Smooth bar fill |
| **Score Pulse** | scale(1.1) → scale(1) | 150ms | spring | Number highlight |
| **Modal Open** | scale(0.95→1) + opacity | 200ms | ease-out | Scale up and fade in |
| **Toast Enter** | translateY(20px→0) + opacity | 250ms | ease-out | Slide up from bottom |
| **Hover Glow** | box-shadow transition | 150ms | ease | Colored glow appears |

### Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Inline spacing, small gaps |
| `--space-3` | 12px | Component internal padding |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 24px | Section spacing |
| `--space-6` | 32px | Page section margins |
| `--space-8` | 48px | Major layout gaps |

### Border Radius System

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Buttons, badges, chips |
| `--radius-md` | 8px | Cards, inputs, small panels |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Feature panels, hero sections |

### Emotional Design Principles

1. **"Dark is Default"** — Dark theme signals sophistication and reduces eye strain for long sessions
2. **"Scores Are Heroes"** — G2/G7 scores get 48px bold treatment, highest visual hierarchy
3. **"Motion Builds Momentum"** — Every transition reinforces progress, never stalls flow
4. **"Celebrate in Context"** — Pride moments (reports, achievements) appear inline, not interruptive
5. **"Color Means Action"** — Green = approve, Red = kill, Blue = edit, Yellow = pause. Never decorative.
6. **"Hierarchy is Visible"** — Hub/Pillar/Spoke relationships shown through indentation and connection lines
7. **"Glow for Focus"** — Interactive elements get colored glow on hover/focus, not just border changes

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

| Product | Core Lesson | Key Pattern |
|---------|-------------|-------------|
| **Linear.app** | Keyboard-first precision | Command palette (`⌘+K`), bulk actions |
| **Superhuman** | Speed as a feature | Time-saved messaging, keyboard-only workflows |
| **Spotify** | Data visualization excellence | Wrapped-style reports, progress rings |
| **Apple TV+** | Premium content presentation | Hero focus, breathing room, subtle animation |

### Transferable UX Patterns

**Navigation:**
- Command Palette (`⌘+K`) for quick actions
- Breadcrumb trail: Hub → Pillar → Spoke
- Sticky filter header during scroll

**Interaction:**
- Swipe gestures + keyboard equivalents
- Hover-to-reveal Critic notes
- Bulk select + batch action
- Undo toasts for reversible actions

**Visual:**
- Score pills with color coding
- Progress bars for Zero-Edit Rate
- Glow effects on focus
- Staggered animations for cascading actions

### Anti-Patterns to Avoid

| Avoid | Instead |
|-------|---------|
| Modal hell | Inline expansions, slide-overs for destructive only |
| Loading spinners | Optimistic UI + skeleton states |
| Confirmation for everything | Only confirm Hub Kill |
| Generic success messages | Quantified wins ("13.7 hours saved!") |
| Light mode default | Dark mode is THE mode |
| Playful illustrations | Professional, content-focused |

### Design Inspiration Strategy

**Adopt (As-Is):** Command palette, arrow key navigation, time-saved messaging, score pills, toast with undo

**Adapt (Modify):** Tinder swipe → add keyboard, Spotify Wrapped → session-level reports, Linear cards → quality indicators

**Avoid (Not Us):** Playful illustrations, gradient backgrounds, gamification badges, onboarding carousels

---

## Wireframes

### Sprint View (Decision Loop)

**File:** `excalidraw-diagrams/wireframe-sprint-view.excalidraw`

**Screen Purpose:** The core Decision Loop state where users review content cards at high velocity (< 6 sec/decision target).

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Sprint Header** | Exit button, title, counter badge (142/187) | Persistent navigation |
| **Signal Header** | G2 (85) + G7 (94) in 48px typography | Pattern 1: Reason to Approve |
| **Gate Status** | G4 Voice ✓, G5 Platform ✓ badges | Trust indicators |
| **Context Bar** | Client › Platform › Hub › Pillar breadcrumb | Hierarchy visibility |
| **Content Preview** | Full post with platform formatting | Pattern 3: Platform context |
| **Action Bar** | Kill (←) / Edit (E) / Approve (→) | Keyboard-first interaction |
| **Keyboard Hints** | Full shortcut reference footer | Power user enablement |
| **Progress Bar** | 76% fill with approve color | Momentum visualization |

**Interaction Notes:**
- Left/Right arrow zones visible on edges (30% opacity)
- Hover on scores reveals Critic notes (Pattern 2: "Why" Hover)
- All actions have keyboard equivalents
- Progress bar updates immediately on decision

**Midnight Command Theme Applied:**
- Background: `#0F1419`
- Card surface: `#1A1F26`
- Approve glow: `rgba(0,210,106,0.15)`
- Kill glow: `rgba(244,33,46,0.15)`

---

### Dashboard (Production Queue)

**File:** `excalidraw-diagrams/wireframe-dashboard.excalidraw`

**Screen Purpose:** The "Enter Flow" state where users see action buckets and enter Sprint mode.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Sidebar** | Navigation with active state indicator | Persistent nav |
| **4 Action Buckets** | High Confidence (green), Needs Review (yellow), Creative Conflicts (red), Just Generated (blue) | Color-coded triage |
| **Filter Bar** | Client / Platform / Hub / G7 Score dropdowns | Quick filtering |
| **Quick Actions** | ⌘A Approve G7>9.5, ⌘K Kill G7<5.0, ⌘H Sprint | Nuclear operations |
| **Today's Progress** | Approved/Killed/Edited counts, Time Saved, Zero-Edit Rate | Session metrics |

**Hierarchy:**
- High Confidence bucket is primary CTA with green border glow
- "Start Sprint" button inside High Confidence bucket
- Stats section shows quantified wins

---

### Hub Kill (Cascade Confirmation)

**File:** `excalidraw-diagrams/wireframe-hub-kill.excalidraw`

**Screen Purpose:** Tree Map view with Hub Kill confirmation modal showing cascade effect.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Tree Hierarchy** | Hub (root) → Pillars (branches) → Spokes (leaves) | Pattern 4: Tree Map |
| **Kill Cascade** | Killed pillar at 40% opacity with strikethrough | Pattern 5: Pillar Pruning |
| **Confirmation Modal** | Red header, warning icon, cascade count | Only destructive confirmation |
| **Undo Notice** | "Can be undone within 30 seconds" | Reversibility assurance |
| **Progress Update** | Shows items killed by Hub Kill | Immediate feedback |

**Visual States:**
- Active pillar: Full opacity, green border
- Killed pillar: 40% opacity, red border, strikethrough
- Cascaded spokes: 30% opacity, grayed text

---

### Batch Complete (Executive Producer Report)

**File:** `excalidraw-diagrams/wireframe-batch-complete.excalidraw`

**Screen Purpose:** Celebration state after Sprint completion showing quantified wins.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Hero Stat** | "13.7 hours saved" with $ value ($2,740) | Quantified wins |
| **Stats Row** | Reviewed/Approved/Killed/Edited/Avg Decision | Session metrics |
| **Zero-Edit Rate** | Progress bar with 87% (target 60%) | Trust metric |
| **Per-Client Breakdown** | Client names with counts | Agency workflow |
| **Action Bar** | Export Calendar, Share Links, Review Conflicts, Dashboard | Next steps |

**Emotional Design:**
- Green celebration glow behind checkmark
- Large checkmark icon (72px)
- "Sprint Complete!" title (32px)
- Time saved in 64px typography

---

### Creative Conflict Panel

**File:** `excalidraw-diagrams/wireframe-creative-conflict.excalidraw`

**Screen Purpose:** Side-by-side resolution when Self-Healing Loop fails after 3 attempts. User takes "Director's Cut" control.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Left Panel: Critic's Rejection** | Red border, rejection summary, rubric breakdown with scores | Pattern 6: Transparency |
| **Rubric Items** | Tone Match (4.2), Vocabulary (6.1), Hook Strength (8.7) with Critic notes | Explainability |
| **Self-Healing Attempts** | 3 attempt badges showing G4 progression (4.2 → 5.1 → 5.8) | System effort visibility |
| **Recommendation Box** | Yellow highlight with suggested action | Guided resolution |
| **Right Panel: Drafts** | Tabbed view (v1/v2/v3), score bar, content preview | Comparison |
| **Voice Issue Highlight** | Red outline on problematic text with annotation | Problem identification |
| **Director's Cut Actions** | Force Approve, Quick Edit, Voice Calibrate, Kill | User control |

**Action Buttons:**

| Action | Color | Purpose | Shortcut |
|--------|-------|---------|----------|
| **Force Approve** | Yellow border | Override quality gates | — |
| **Quick Edit** | Blue border | Manual fix | E |
| **Voice Calibrate** | Green solid (primary) | Update Brand DNA | V |
| **Kill** | Red border | Abandon content | ← |

**Information Architecture:**
- Header shows "3 Attempts Failed" badge
- Counter shows position in conflict queue (3/7)
- Context bar maintains Hub/Pillar breadcrumb
- Rubric scores color-coded: <6 red, 6-8 yellow, >8 green

**User Flow:**
1. System shows WHY it failed (left panel)
2. User reviews WHAT was generated (right panel)
3. User chooses HOW to resolve (Director's Cut actions)
4. Voice Calibrate feeds back to Brand DNA for future improvement

---

### Brand DNA Report

**File:** `excalidraw-diagrams/wireframe-brand-dna.excalidraw`

**Screen Purpose:** Onboarding view for Dr. Priya (Solo Creator) showing how well the system understands her brand voice.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **DNA Strength Score** | 87% in large typography with "Strong" status | Hero metric |
| **Calibrate Button** | Quick action to improve voice match | One-click recalibration |
| **Voice Profile** | Primary Tone, Writing Style, Target Audience | At-a-glance identity |
| **Signature Phrases** | Chips showing detected phrases ("here's the thing") | Voice fingerprint |
| **Training Samples** | 47 samples with quality badges (High/Medium) | Data transparency |
| **Voice Metrics** | Progress bars: Tone 90%, Vocabulary 85%, Structure 80%, Topics 92% | Detailed breakdown |
| **Core Topics** | Blue topic pills + Red "Topics to Avoid" | Content boundaries |

**Information Hierarchy:**
1. DNA Score (primary) — "Is my voice captured?"
2. Voice Profile (secondary) — "What does the system know?"
3. Training Samples (detail) — "What data is this based on?"

**Trust-Building Elements:**
- Sample source attribution (LinkedIn, Podcast, Newsletter)
- Quality badges with color coding
- "Based on 47 content samples" explainability

---

### Source Ingestion (Upload)

**File:** `excalidraw-diagrams/wireframe-source-ingestion.excalidraw`

**Screen Purpose:** Step 2 of Hub creation wizard where user uploads their Source of Truth content.

**Key Components:**

| Component | Description | UX Pattern |
|-----------|-------------|------------|
| **Stepper** | 4-step wizard: Select Client → Upload → Configure → Generate | Progress visibility |
| **Drop Zone** | Large drag-and-drop area with dashed border | Primary action |
| **Browse Button** | Blue primary CTA for file picker | Fallback action |
| **URL Input** | Alternative input for YouTube/podcast/web links | Multi-source support |
| **Format Hints** | "PDF, DOCX, TXT, MP3, MP4, URL" | Capability clarity |
| **Recent Sources** | 3 recent uploads with icons and dates | Quick re-use |
| **Navigation** | Back / Continue buttons in footer | Wizard flow |

**Supported Formats:**
- Documents: PDF, DOCX, TXT
- Audio: MP3, MP4
- Video: YouTube links
- Web: Podcast RSS, article URLs

**Step Flow:**
1. **Select Client** ✓ (completed)
2. **Upload Source** ← Current step
3. **Configure Pillars** (next)
4. **Generate** (final)

**Design Decisions:**
- Large drop zone (240px height) for confidence
- Blue accent for upload actions (not green = not "approve")
- Recent sources for power users who re-use content types

---

## Component Specifications

### Atomic Design System

#### Atoms

**ScoreBadge**
```
Props: score (number), gate (G2|G4|G5|G7), size (sm|md|lg)
Variants:
  - High (≥8.0): --accent-approve, --accent-approve-glow
  - Mid (5.0-7.9): --accent-warning
  - Low (<5.0): --accent-kill, --accent-kill-glow
Sizes:
  - sm: 24px height, 12px font
  - md: 32px height, 14px font
  - lg: 48px height, 48px font (Signal Header)
```

**ActionButton**
```
Props: variant (approve|kill|edit|neutral), size (sm|md|lg), disabled
States: default, hover (glow), active (scale 0.98), disabled (40% opacity)
Keyboard: Must support Enter/Space activation
```

**PlatformBadge**
```
Props: platform (linkedin|twitter|instagram|tiktok|newsletter)
Colors: Platform-specific accent with 15% opacity background
Icon: Platform logo or emoji fallback
```

**ProgressBar**
```
Props: value (0-100), variant (approve|warning|neutral), showLabel
Animation: width transition 300ms linear
Height: 4px (thin), 8px (standard), 16px (prominent)
```

**KeyboardHint**
```
Props: keys (string[]), action (string)
Style: Monospace, --text-muted color, subtle background
Example: "← Kill | → Approve | E Edit"
```

#### Molecules

**ContentCard**
```
Props: content, scores (G2, G4, G5, G7), platform, client, hub, pillar
Sections:
  1. SignalHeader: G2 + G7 scores (48px)
  2. ContextBar: Breadcrumb + PlatformBadge
  3. ContentPreview: Full text with formatting
  4. GateStatus: G4/G5 pass/fail indicators
  5. ActionBar: Kill/Edit/Approve buttons
States: default, hover (border glow), selected (accent border)
```

**ActionBucket**
```
Props: type (high-confidence|needs-review|conflicts|generating), count, onAction
Border: 2px accent color based on type
Glow: 8% opacity accent background on hover
CTA: Primary action button (e.g., "Start Sprint")
```

**SampleCard**
```
Props: source, date, content, qualityScore
QualityBadge: High (green), Medium (yellow), Low (red)
Truncation: 2 lines with ellipsis, expand on click
```

**RubricItem**
```
Props: label, score, note, maxScore
ScoreColor: Based on score/maxScore ratio
Layout: Label left, Score right, Note below (muted)
```

#### Organisms

**SprintHeader**
```
Props: title, current, total, onExit
Layout: [Exit Button] [Title centered] [Counter Badge]
Counter: Approve-colored when >50% complete
```

**CreativeConflictPanel**
```
Props: rejection, drafts[], onAction
Layout: 35% left (Critic) / 65% right (Drafts)
Left: Rejection summary, Rubric breakdown, Attempt history
Right: Tabbed draft viewer, Score bar, Action buttons
```

**BrandDNACard**
```
Props: strength, profile, phrases[], metrics[]
Hero: Strength percentage with status label
Sections: Voice Profile, Signature Phrases, Metrics bars
```

**HubTreeView**
```
Props: hub, pillars[], spokes[][], onKill
Hierarchy: Indented tree with connection lines
States: active, killed (40% opacity + strikethrough)
Animations: Cascade prune on pillar/hub kill
```

#### Templates

**SprintLayout**
```
Regions: Header (64px), Content (flex), Footer (40px)
Content: Centered card (max-width 880px)
Footer: Progress bar + Keyboard hints
```

**DashboardLayout**
```
Regions: Sidebar (240px), Main (flex)
Sidebar: Navigation with active states
Main: Header, Buckets grid, Filter bar, Stats
```

**WizardLayout**
```
Regions: Header (64px), Stepper (72px), Content (flex), Footer (72px)
Stepper: Horizontal steps with connectors
Footer: Back/Continue navigation
```

---

## Interaction Specifications

### Keyboard Shortcuts

#### Sprint Mode (Decision Loop)
| Key | Action | Feedback |
|-----|--------|----------|
| `→` / `L` | Approve | Green flash, slide right |
| `←` / `H` | Kill | Red flash, slide left |
| `E` | Edit | Open inline editor |
| `Space` | Skip | Yellow flash, move to end |
| `?` | Toggle Critic Notes | Expand/collapse panel |
| `H` (hold 500ms) | Hub Kill | Confirmation modal |
| `Esc` | Exit Sprint | Return to Dashboard |

#### Dashboard Mode
| Key | Action |
|-----|--------|
| `⌘+K` | Command Palette |
| `⌘+H` | Start High Confidence Sprint |
| `⌘+A` | Nuclear Approve (G7 > 9.5) |
| `⌘+Shift+K` | Nuclear Kill (G7 < 5.0) |
| `/` | Focus filter bar |

#### Global
| Key | Action |
|-----|--------|
| `⌘+,` | Settings |
| `⌘+/` | Keyboard shortcuts help |
| `⌘+.` | Toggle sidebar |

### Micro-Interactions

**Card Approve Animation**
```
Trigger: → key or swipe right
Sequence:
  1. Green flash overlay (100ms, ease-in)
  2. Scale to 1.02 (50ms)
  3. translateX(100%) + opacity(0) (200ms, ease-out)
  4. Next card slides in from right (150ms, ease-out)
  5. Counter increment with pulse (150ms, spring)
  6. Toast: "✓ Scheduled" (auto-dismiss 2s)
```

**Card Kill Animation**
```
Trigger: ← key or swipe left
Sequence:
  1. Red flash overlay (100ms, ease-in)
  2. Scale to 0.98 (50ms)
  3. translateX(-100%) + scale(0.95) (200ms, ease-out)
  4. Next card slides in from right
  5. Kill counter increment
```

**Hub Kill Cascade**
```
Trigger: H key held 500ms + confirmation
Sequence:
  1. Modal appears (scale 0.95→1, 200ms)
  2. On confirm: modal closes
  3. Hub card: red glow pulse (200ms)
  4. Pillars: staggered fade to 40% (50ms each, top-to-bottom)
  5. Spokes: cascade fade (25ms each)
  6. Progress bar: jump update
  7. Toast: "Hub killed (25 items) — Undo" with 30s timer
```

**Score Hover Expansion**
```
Trigger: Hover on G2/G7 score
Delay: 300ms (prevent accidental triggers)
Sequence:
  1. Tooltip appears below score (translateY 8px, fade in)
  2. Contains: Gate name, rubric notes, last updated
  3. On mouse leave: fade out (150ms)
```

**Progress Bar Fill**
```
Trigger: Any decision action
Animation: width transition 300ms linear
Celebration: At 100%, pulse animation + confetti optional
```

### Touch Gestures (Tablet)

| Gesture | Action | Threshold |
|---------|--------|-----------|
| Swipe Right | Approve | >100px horizontal |
| Swipe Left | Kill | >100px horizontal |
| Swipe Up | Skip | >80px vertical |
| Long Press | Show context menu | 500ms |
| Pinch | Zoom tree view | 2-finger |

### Loading States

**Skeleton Patterns**
```
ContentCard: Animated gradient shimmer on placeholder boxes
Dashboard: Bucket skeletons with pulsing counts
SprintQueue: Stack of 3 skeleton cards
```

**Optimistic Updates**
```
Approve/Kill: Immediate visual feedback, async sync
Undo Window: 5 seconds for reversible actions
Conflict: If sync fails, show warning toast with retry
```

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast**
| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Primary Text | #E7E9EA | #0F1419 | 12.6:1 ✓ |
| Secondary Text | #8B98A5 | #0F1419 | 5.2:1 ✓ |
| Muted Text | #536471 | #0F1419 | 3.1:1 (decorative only) |
| Approve on Dark | #00D26A | #0F1419 | 8.4:1 ✓ |
| Kill on Dark | #F4212E | #0F1419 | 5.1:1 ✓ |

**Focus Management**
- All interactive elements must have visible focus indicator (2px solid --border-focus)
- Focus trap in modals
- Skip-to-content link for keyboard users
- Logical tab order following visual layout

**Screen Reader Support**
- ARIA labels for all icons and score badges
- Live regions for counter updates and toasts
- Announce card changes in Sprint mode
- Role="alert" for error messages

**Motion Sensitivity**
- Respect `prefers-reduced-motion` media query
- Reduce animations to opacity-only transitions
- No autoplay animations

**Keyboard Navigation**
- All functionality available via keyboard
- No keyboard traps
- Visible keyboard shortcuts panel (`⌘+/`)

---

## Responsive Behavior

### Breakpoints

| Name | Width | Layout Changes |
|------|-------|----------------|
| **Desktop** | ≥1280px | Full layout, sidebar visible |
| **Laptop** | 1024-1279px | Compact sidebar (icons only) |
| **Tablet** | 768-1023px | Sidebar hidden, hamburger menu, touch gestures enabled |
| **Mobile** | <768px | Voice Calibrate only (emergency DNA updates) |

### Sprint View Adaptations

**Desktop (≥1280px)**
- Content card: 880px max-width, centered
- Side hint zones visible (← / →)
- Full keyboard shortcuts footer

**Tablet (768-1023px)**
- Content card: 100% width with 24px padding
- Swipe gestures primary interaction
- Simplified footer: progress bar only
- Action buttons: larger touch targets (48px min)

**Mobile (<768px)**
- Sprint mode disabled
- Redirect to Dashboard with message: "Sprint mode optimized for tablet/desktop"
- Voice Calibrate accessible for emergency Brand DNA updates

### Dashboard Adaptations

**Tablet**
- Buckets: 2-column grid instead of 4
- Filter bar: horizontal scroll
- Stats: horizontal scroll cards

**Mobile**
- Buckets: single column, stacked
- Quick actions: hidden in overflow menu
- Stats: top 3 only, "View all" link

---

## Error States & Edge Cases

### Empty States

**No Content in Queue**
```
Illustration: Minimal line art of empty inbox
Headline: "Queue is clear!"
Subtext: "All content reviewed. Check back when new Hubs are generated."
CTA: "Create New Hub" (secondary button)
```

**No Conflicts**
```
Headline: "No Creative Conflicts"
Subtext: "Self-Healing resolved all issues. Your brand voice is on point."
Visual: Green checkmark with subtle glow
```

**Brand DNA < 50%**
```
Headline: "Brand DNA Needs Training"
Subtext: "Add more content samples to improve voice matching."
CTA: "Add Samples" (primary button)
Progress: Show current % with target marker at 70%
```

### Error Handling

**Network Failure**
```
Toast: "Connection lost. Changes saved locally."
Behavior: Queue actions, sync when reconnected
Visual: Subtle offline indicator in header
```

**Sync Conflict**
```
Modal: "This content was modified elsewhere"
Options: "Keep Mine" | "Use Server Version" | "View Diff"
```

**Rate Limit (API)**
```
Toast: "Slow down! Too many actions."
Behavior: Throttle to 1 action per 500ms
Visual: Temporary disable of action buttons
```

---

## Implementation Checklist

### Phase 1: Core Sprint Experience (MVP)
- [ ] ContentCard component with Signal Header
- [ ] Sprint Layout with keyboard navigation
- [ ] Approve/Kill animations
- [ ] Progress bar and counter
- [ ] Dashboard with 4 Action Buckets

### Phase 2: Hub Management
- [ ] HubTreeView component
- [ ] Hub Kill cascade animation
- [ ] Confirmation modal
- [ ] Undo toast with timer

### Phase 3: Brand DNA & Onboarding
- [ ] BrandDNACard component
- [ ] Source Ingestion wizard
- [ ] Training Samples management
- [ ] Voice metrics visualization

### Phase 4: Creative Conflict Resolution
- [ ] CreativeConflictPanel (split view)
- [ ] Draft comparison tabs
- [ ] Director's Cut actions
- [ ] Voice Calibrate integration

### Phase 5: Polish & Accessibility
- [ ] Tablet touch gestures
- [ ] WCAG 2.1 AA audit
- [ ] Skeleton loading states
- [ ] Empty states
- [ ] Error handling

---

## Design Deliverables Summary

### Wireframes (7 screens)
| File | Screen |
|------|--------|
| `wireframe-sprint-view.excalidraw` | Decision Loop |
| `wireframe-dashboard.excalidraw` | Production Queue |
| `wireframe-hub-kill.excalidraw` | Cascade Confirmation |
| `wireframe-batch-complete.excalidraw` | Executive Report |
| `wireframe-creative-conflict.excalidraw` | Director's Cut Panel |
| `wireframe-brand-dna.excalidraw` | Voice Profile |
| `wireframe-source-ingestion.excalidraw` | Upload Wizard |

### Design Tokens (Midnight Command)
- 10 color tokens
- 8 typography scales
- 7 motion definitions
- 6 spacing values
- 4 border radius values

### Component Inventory
- 5 Atoms: ScoreBadge, ActionButton, PlatformBadge, ProgressBar, KeyboardHint
- 4 Molecules: ContentCard, ActionBucket, SampleCard, RubricItem
- 4 Organisms: SprintHeader, CreativeConflictPanel, BrandDNACard, HubTreeView
- 3 Templates: SprintLayout, DashboardLayout, WizardLayout

### Interaction Patterns
- 7 Sprint keyboard shortcuts
- 5 Dashboard shortcuts
- 3 Global shortcuts
- 5 Touch gestures
- 5 Micro-interaction sequences

---

**Document Status:** Complete
**Last Updated:** 2025-12-21
**Author:** Williamshaw
**Theme:** Midnight Command [LOCKED]
