# Story R-3: Design Token Compliance

**Epic:** Remediation (Post-Audit)
**Priority:** Medium
**Effort:** 15 minutes
**Status:** Done

---

## User Story

As a **designer**, I want **all UI components to use Midnight Command design tokens** so that **the application maintains visual consistency and brand fidelity**.

---

## Background

Per `project-context.md` Rule 3, all colors must use design tokens. The audit found components using arbitrary Tailwind colors instead.

**Violations Found & Fixed:**
| Component | Before | After |
|-----------|--------|-------|
| `TeamAssignment.tsx` | `text-red-500` | `text-[#F4212E]` |
| `TeamAssignment.tsx` | `hover:bg-red-500/10` | `hover:bg-[#F4212E]/10` |
| `TeamAssignment.tsx` | `focus:ring-blue-500/20` | `focus:ring-[#1D9BF0]/20` |
| `ClientSelector.tsx` | `text-blue-500` | `text-[#1D9BF0]` |
| `ClientSelector.tsx` | `bg-blue-500/10` | `bg-[#1D9BF0]/10` |

**Design Token Reference:**
- Kill/Delete: `#F4212E`
- Edit/Action: `#1D9BF0`
- Approve: `#00D26A`
- Warning: `#FFAD1F`

---

## Acceptance Criteria

- [x] **AC1:** `TeamAssignment.tsx` delete button uses `#F4212E` token
- [x] **AC2:** `ClientSelector.tsx` avatar uses `#1D9BF0` token
- [x] **AC3:** No arbitrary Tailwind colors remain in these files
- [x] **AC4:** Visual appearance matches Midnight Command theme

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/clients/TeamAssignment.tsx` | Replaced `text-red-500` → `text-[#F4212E]`, `hover:bg-red-500/10` → `hover:bg-[#F4212E]/10`, `focus:ring-blue-500/20` → `focus:ring-[#1D9BF0]/20` |
| `src/components/layout/ClientSelector.tsx` | Replaced `text-blue-500` → `text-[#1D9BF0]`, `bg-blue-500/10` → `bg-[#1D9BF0]/10` |

---

## Verification

```bash
# Check target files for arbitrary colors
grep -n "red-500\|blue-500" src/components/clients/TeamAssignment.tsx src/components/layout/ClientSelector.tsx
# Result: No matches - SUCCESS
```

---

## Definition of Done

- [x] Both files use design tokens
- [x] `grep "red-500\|blue-500"` returns no matches in target files
- [x] Visual review confirms Midnight Command consistency

### Dev Agent Record

### Implementation Date
2025-12-29

### Completion Notes
Fixed 5 color violations across 2 files:
1. TeamAssignment.tsx: Error text, delete button hover, and focus ring colors
2. ClientSelector.tsx: Check icon and "Manage Clients" button background

All arbitrary Tailwind colors (`red-500`, `blue-500`) replaced with Midnight Command design tokens (`#F4212E`, `#1D9BF0`).

**Remediation Update (2025-12-29):**
- Replaced hardcoded hex values with CSS variables (`var(--kill)`, `var(--edit)`) for strict token compliance.
- Fixed `ClientSelector` to use `useNavigate` instead of `window.location.href` for SPA routing.
- Updated `TeamAssignment.test.tsx` to verify style attributes instead of removed utility classes.

### File List
- `apps/foundry-dashboard/src/components/clients/TeamAssignment.tsx` (modified)
- `apps/foundry-dashboard/src/components/layout/ClientSelector.tsx` (modified)
- `apps/foundry-dashboard/src/components/clients/TeamAssignment.test.tsx` (modified)

### Change Log
| Date | Change |
|------|--------|
| 2025-12-29 | Replaced arbitrary Tailwind colors with Midnight Command design tokens |
| 2025-12-29 | Remediation: Enforced CSS variables, fixed SPA routing, fixed tests |
