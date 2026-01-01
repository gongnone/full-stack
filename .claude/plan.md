# RBAC UI Differentiation Plan

## Current State Analysis

**Already Implemented (✅):**
1. **RBAC Core System** - `src/lib/rbac.ts`:
   - 5 roles defined: `agency_owner`, `account_manager`, `creator`, `client_admin`, `client_reviewer`
   - `MENU_VISIBILITY` map controls which roles see which menu items
   - `canAccessMenuItem(role, menuId)` function for filtering

2. **useClientRole Hook** - `src/lib/use-client-role.ts`:
   - Fetches `clientRole` from `auth.me` tRPC endpoint
   - Returns permission helpers: `canManageTeam`, `canCreateContent`, `canReview`, etc.

3. **Sidebar Menu Filtering** - `src/components/layout/Sidebar.tsx`:
   - Already filters `navigation` array based on role using `canAccessMenuItem()`
   - Already displays role label in user section

4. **Role Info Card** - `src/components/settings/RoleInfoCard.tsx`:
   - Already shows current role and permissions

5. **Backend Enforcement** - `auth.ts` router:
   - Already fetches `clientRole` from `client_members` table
   - Already returns role in `auth.me` response

6. **In-Page Role Checks** - Multiple pages already use `useClientRole()`:
   - `hubs.tsx` - checks `canCreateContent`
   - `clients.tsx` - checks `canManageTeam`
   - `brand-dna.tsx` - checks `canCreateContent`
   - `exports.tsx` - checks `canCreateContent`

## What's Missing (Gap Analysis)

### 1. Dashboard Page - No Role-Based Content
**File:** `src/routes/app/index.tsx`
- Shows same stats cards to everyone
- Needs: Hide "Active Clients" card for client_reviewer/creator roles

### 2. Review Page - Missing Role Restrictions
**File:** `src/routes/app/review.tsx`
- Shows approve/reject controls to everyone
- Needs: `client_reviewer` can only view + approve/reject
- Needs: `creator` shouldn't see this page at all (menu is filtered but direct URL works)

### 3. Route Guards Missing
- Users can bypass menu filtering by typing URLs directly
- Need route-level protection for `/app/clients`, `/app/settings`, `/app/analytics`

## Implementation Plan (Simple Approach)

### Step 1: Route Guards (15 min)
Create a simple `<RequireRole>` wrapper component:
```tsx
// src/components/auth/RequireRole.tsx
export function RequireRole({
  children,
  roles,
  fallback = <Redirect to="/app" />
}: {
  children: ReactNode;
  roles: ClientRole[];
  fallback?: ReactNode
}) {
  const { role, isLoading } = useClientRole();
  if (isLoading) return <LoadingSpinner />;
  if (!role || !roles.includes(role)) return fallback;
  return children;
}
```

Apply to routes that need protection:
- `/app/clients` - agency_owner, account_manager only
- `/app/settings` - agency_owner, account_manager only

### Step 2: Dashboard Role-Based Content (15 min)
In `src/routes/app/index.tsx`:
- Conditionally hide "Active Clients" stat card for non-management roles
- Show different quick actions based on role

### Step 3: Review Page Controls (20 min)
In `src/routes/app/review.tsx`:
- Use `canReview` from hook
- Disable approve/reject buttons for `creator` role
- Show "View Only" badge for `client_reviewer`

### Step 4: Quick Test (10 min)
- Verify sidebar filters correctly
- Verify direct URL access is blocked for restricted pages
- Verify review actions are role-appropriate

## Why This Is MVP-Ready

1. **Security is already done** - Backend enforces RBAC via middleware
2. **Navigation is done** - Sidebar already hides menu items
3. **This is polish** - Prevents confusion, not security holes
4. **Low risk** - Uses existing hook + patterns
5. **Fast to implement** - ~1 hour total

## Files to Modify

1. `src/components/auth/RequireRole.tsx` (new)
2. `src/routes/app/clients.tsx` - wrap with RequireRole
3. `src/routes/app/settings.tsx` - wrap with RequireRole
4. `src/routes/app/index.tsx` - conditional stat cards
5. `src/routes/app/review.tsx` - conditional controls

## Not Doing (Post-MVP)

- Complex permission system with granular actions
- Permission UI in admin settings
- Audit logging for permission changes
- Custom role creation
