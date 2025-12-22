# Story 1.5: User Profile & Settings

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want **to view and edit my profile settings**,
so that **I can manage my account preferences**.

## Acceptance Criteria

### AC1: View Profile Information
**Given** I am logged in
**When** I navigate to `/app/settings`
**Then** I see my profile information (name, email, avatar)

### AC2: Update Display Name
**Given** I am on the settings page
**When** I update my display name
**Then** the change is saved to `user_profiles` table
**And** I see a success toast "Profile updated"

### AC3: Sign Out
**Given** I am on the settings page
**When** I click "Sign out"
**Then** my session is invalidated
**And** I am redirected to `/login`

## Tasks / Subtasks

- [x] **Task 1: Create `user_profiles` D1 Table** (AC: #1, #2)
  - [x] Add migration for `user_profiles` table schema
  - [x] Add indexes for `user_id` lookups
  - [x] Add TypeScript type definitions

- [x] **Task 2: Create tRPC Profile Router** (AC: #1, #2, #3)
  - [x] Implement `auth.me` query for profile data
  - [x] Implement `auth.updateProfile` mutation
  - [x] Add input validation with Zod schemas

- [x] **Task 3: Build Settings Page Route** (AC: #1)
  - [x] Create `/app/settings` route with auth guard
  - [x] Route already in sidebar navigation
  - [x] Implement loading states for profile fetch

- [x] **Task 4: Build ProfileCard Component** (AC: #1, #2)
  - [x] Display avatar (fallback to initials)
  - [x] Display name field (editable inline)
  - [x] Display email (read-only with verified badge)
  - [x] Add character counter (50 char limit)
  - [x] Add real-time validation
  - [x] Add save button with loading states

- [x] **Task 5: Implement Sign Out Button** (AC: #3)
  - [x] Add sign out button in section
  - [x] Call Better Auth signOut API
  - [x] Redirect to `/login`

- [x] **Task 6: Apply Midnight Command Styling** (AC: All)
  - [x] Use correct color tokens from theme system
  - [x] Add Radix UI components for inputs/buttons
  - [x] Ensure WCAG 2.1 AA contrast ratios
  - [x] Add focus indicators
  - [x] Add keyboard navigation support (Enter/Escape)

- [x] **Task 7: Add Toast Notifications** (AC: #2)
  - [x] Success toast: "Profile updated" (green)
  - [x] Error toast: "Failed to save changes" (red)
  - [x] Position: bottom-right corner

- [x] **Task 8: Write E2E Tests** (AC: All)
  - [x] Test profile view loads correctly
  - [x] Test display name update
  - [x] Test sign out invalidates session
  - [x] Test keyboard navigation
  - [x] Test accessibility

## Dev Notes

### Architecture Patterns

**Database Schema (D1):**
```sql
-- Migration: packages/foundry-core/migrations/0002_user_profiles.sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  avatar_color TEXT,
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT 1,
  preferences_json TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

**tRPC Router Pattern:**
```typescript
// apps/foundry-dashboard/worker/trpc/routers/auth.ts
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';

export const authRouter = router({
  // Get current user + profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .selectFrom('user')
      .where('id', '=', ctx.userId)
      .select(['id', 'email', 'name', 'createdAt'])
      .executeTakeFirst();

    const profile = await ctx.db
      .selectFrom('user_profiles')
      .where('user_id', '=', ctx.userId)
      .selectAll()
      .executeTakeFirst();

    return { user, profile };
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().min(2).max(50),
      avatarUrl: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .updateTable('user_profiles')
        .set({
          display_name: input.displayName,
          avatar_url: input.avatarUrl,
          updated_at: Date.now() / 1000,
        })
        .where('user_id', '=', ctx.userId)
        .execute();

      return { success: true };
    }),

  // Sign out
  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    // Better Auth handles session invalidation
    await ctx.auth.api.signOut({ headers: ctx.req.headers });
    return { success: true };
  }),
});
```

**React Component Structure:**
```
apps/foundry-dashboard/src/
├── routes/
│   └── app/
│       └── _authed/
│           └── settings.tsx          # Main settings page
└── components/
    └── settings/
        ├── ProfileCard.tsx           # Profile display/edit
        ├── SignOutButton.tsx         # Danger zone sign out
        └── AvatarUpload.tsx          # Future: avatar upload
```

### Security & Performance

**Session Management (Better Auth):**
- Current session invalidation: `auth.api.signOut()`
- Session stored in httpOnly cookie
- 24-hour max session duration (NFR-S5)
- TLS 1.3 encryption in transit (NFR-S3)

**Performance Budgets:**
- Settings page load: < 1 second (NFR-P5)
- Profile update mutation: < 200ms
- Database query with Kysely prepared statements

**Data Isolation:**
- User profiles are global (not per-client)
- Apply Rule 1 from project-context.md for any client-specific queries
- Profile updates don't require `client_id` filtering

### UX Design (Midnight Command Theme)

**Color Tokens:**
```typescript
// Backgrounds
--bg-base: #0F1419         // Page background
--bg-elevated: #1A1F26     // Card/input backgrounds
--bg-hover: #242A33        // Hover states

// Text
--text-primary: #E7E9EA    // Headers, field labels
--text-secondary: #8B98A5  // Helper text, timestamps
--text-muted: #536471      // Disabled states

// Borders
--border-subtle: #2A3038   // Default borders
--border-focus: #3A424D    // Focused inputs

// Actions
--accent-approve: #00D26A  // Success states (save button)
--accent-kill: #F4212E     // Danger zone (sign out)
--accent-edit: #1D9BF0     // Edit affordances
```

**Typography:**
- Page title: Inter 28px Semibold, --text-primary
- Section headers: Inter 20px Semibold, --text-primary
- Field labels: Inter 12px Medium, --text-secondary
- Input text: Inter 15px Regular, --text-primary

**Spacing:**
- Page margins: --space-6 (32px)
- Section padding: --space-4 (16px)
- Between sections: --space-5 (24px)
- Input padding: --space-3 (12px)

**Accessibility (WCAG 2.1 AA):**
- All color contrasts meet AA standards
- Focus indicators: 2px solid --border-focus
- Keyboard navigation: Tab order follows visual layout
- ARIA labels on all inputs
- Screen reader support for toasts (role="status")

### Project Structure Notes

**File Locations:**
- Migration: `packages/foundry-core/migrations/0002_user_profiles.sql`
- tRPC router: `apps/foundry-dashboard/worker/trpc/routers/auth.ts`
- Settings route: `apps/foundry-dashboard/src/routes/app/_authed/settings.tsx`
- Components: `apps/foundry-dashboard/src/components/settings/`

**Alignment with Project Structure:**
- Uses existing TanStack Router file-based routing
- Follows tRPC router pattern from architecture.md
- Uses Kysely for type-safe SQL queries
- Uses Radix UI + Tailwind CSS 4 for components

**Critical Files from Previous Stories:**
- `worker/auth/index.ts` - Better Auth configuration (Story 1.2)
- `src/routes/app.tsx` - App layout with auth guard (Story 1.3)
- `src/index.css` - Midnight Command theme tokens (Story 1.4)

### Testing Standards

**E2E Tests (Playwright):**
```typescript
// apps/foundry-dashboard/e2e/settings.spec.ts
test('user can update display name', async ({ page }) => {
  await page.goto('/login');
  await login(page);
  await page.goto('/app/settings');

  await page.fill('[data-testid="display-name-input"]', 'New Name');
  await page.click('[data-testid="save-profile-btn"]');

  await expect(page.locator('[data-testid="toast"]')).toContainText('Profile updated');
  await expect(page.locator('[data-testid="display-name-input"]')).toHaveValue('New Name');
});

test('sign out redirects to login', async ({ page }) => {
  await page.goto('/login');
  await login(page);
  await page.goto('/app/settings');

  await page.click('[data-testid="sign-out-btn"]');

  await expect(page).toHaveURL('/login');
  // Verify session is invalidated
  await page.goto('/app/settings');
  await expect(page).toHaveURL('/login'); // Should redirect again
});
```

**Unit Tests (Vitest):**
- Test `auth.me` query returns user + profile
- Test `auth.updateProfile` mutation validates input
- Test `auth.signOut` invalidates session

### References

**Source Documents:**
- [Architecture](/Users/williamshaw/Library/Mobile Documents/com~apple~CloudDocs/full-stack/_bmad-output/architecture.md) - Database schema, tRPC patterns, security requirements
- [UX Design Specification](/Users/williamshaw/Library/Mobile Documents/com~apple~CloudDocs/full-stack/_bmad-output/ux-design-specification.md) - Midnight Command theme, component specs
- [Epics - Story 1.5](/Users/williamshaw/Library/Mobile Documents/com~apple~CloudDocs/full-stack/_bmad-output/epics.md#story-15-user-profile--settings) - Story definition, acceptance criteria
- [Project Context](/Users/williamshaw/Library/Mobile Documents/com~apple~CloudDocs/full-stack/project-context.md) - Critical rules, design fidelity

**Technology Documentation:**
- [Better Auth Session Management](https://www.better-auth.com/docs/concepts/session-management) - Sign out API, session invalidation
- [Cloudflare R2 Upload Guide](https://developers.cloudflare.com/workers/tutorials/upload-assets-with-r2/) - Avatar upload (future enhancement)
- [tRPC v11 Mutations](https://trpc.io/blog/announcing-trpc-v11) - Mutation patterns, React Query integration

**Previous Story Learnings:**
- Story 1.2: Social login buttons use inline SVG icons, not image imports
- Story 1.2: OAuth providers conditionally enabled based on env vars
- Story 1.3: Dashboard uses `@tanstack/router` file-based routing
- Story 1.4: Strict Midnight Command theme compliance (no arbitrary colors)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- TypeScript check passed: `pnpm tsc --noEmit`
- All implementations follow Midnight Command theme tokens
- D1 migration created for user_profiles table

### Completion Notes List

1. **Task 1 Complete:** Created D1 migration `0003_user_profiles.sql` with user_profiles table, index on user_id, and TypeScript types in `worker/types.ts`

2. **Task 2 Complete:** Created `auth` tRPC router with:
   - `auth.me` - Returns user + profile, auto-creates profile if missing
   - `auth.updateProfile` - Updates profile with Zod validation
   - `auth.getProfile` - Lightweight profile-only query

3. **Task 3 Complete:** Updated settings page to use new ProfileCard and SignOutButton components with proper loading states

4. **Task 4 Complete:** ProfileCard component with:
   - Avatar with initials fallback and custom color
   - Inline editable display name with character counter
   - Email display with verified badge
   - Real-time validation (min 2 chars, max 50)
   - Save/Cancel buttons with keyboard shortcuts (Enter/Escape)

5. **Task 5 Complete:** SignOutButton component using Better Auth signOut with redirect to /login

6. **Task 6 Complete:** All components use Midnight Command CSS variables (--bg-elevated, --text-primary, --approve, --kill, etc.)

7. **Task 7 Complete:** Toast system using Radix UI Toast with ToastProvider context:
   - Success toast (green, 2s duration)
   - Error toast (red, 4s duration)
   - Bottom-right positioning

8. **Task 8 Complete:** E2E tests covering all acceptance criteria plus accessibility tests

### File List

**New Files:**
- `apps/foundry-dashboard/migrations/0003_user_profiles.sql` - Database migration
- `apps/foundry-dashboard/worker/types.ts` - TypeScript type definitions
- `apps/foundry-dashboard/worker/trpc/routers/auth.ts` - Profile tRPC router
- `apps/foundry-dashboard/src/lib/toast.tsx` - Toast notification system
- `apps/foundry-dashboard/src/components/settings/ProfileCard.tsx` - Profile display/edit
- `apps/foundry-dashboard/src/components/settings/SignOutButton.tsx` - Sign out button
- `apps/foundry-dashboard/src/components/settings/index.ts` - Component exports
- `apps/foundry-dashboard/e2e/story-1.5-user-profile-settings.spec.ts` - E2E tests

**Modified Files:**
- `apps/foundry-dashboard/worker/trpc/router.ts` - Added auth router
- `apps/foundry-dashboard/src/main.tsx` - Added ToastProvider
- `apps/foundry-dashboard/src/routes/app/settings.tsx` - Updated to use components

### Change Log

- 2025-12-21: Story 1.5 implementation complete
  - Database: Added user_profiles table with auto-creation on first access
  - Backend: Added auth tRPC router for profile management
  - Frontend: ProfileCard, SignOutButton, Toast system
  - Tests: 20+ E2E tests covering all ACs and accessibility

- 2025-12-21: Code review remediation complete (7 critical/major issues fixed)
  - **Issue #1 FIXED**: Changed `--bg-surface` from `#1A1F26` to `#151B22` for visual distinction
  - **Issue #2 FIXED**: Added max length validation (50 chars) in handleSave
  - **Issue #3 FIXED**: Made `displayName` required in updateProfileSchema (per AC2)
  - **Issue #5 FIXED**: Replaced `window.location.href` with TanStack Router navigate
  - **Issue #6 FIXED**: Removed redundant SELECT after profile auto-creation (construct object directly)
  - **Issue #7 FIXED**: Added early return when no fields to update
  - **Issue #8 FIXED**: Added Midnight Command button variants (approve, kill, cancel)
  - **Issue #9 FIXED**: Changed avatar color fallback to use CSS variable `var(--edit)`
  - **Issue #10 FIXED**: Made test credentials configurable via environment variables
  - TypeScript check passed after all fixes
