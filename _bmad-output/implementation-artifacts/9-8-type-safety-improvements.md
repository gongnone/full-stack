# Story 9.8: Type Safety Improvements

## Status: ready-for-dev

## Story Summary
Replace all `as any` type assertions with proper TypeScript types. Multiple instances bypass TypeScript safety, creating risk of runtime errors.

## Business Value
Type safety prevents bugs before they reach production. The current `as any` casts hide potential issues that could cause runtime crashes or data corruption.

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | All `as any` casts in tRPC routers replaced with proper types | TODO |
| AC2 | All `as any` casts in components replaced with proper types | TODO |
| AC3 | TypeScript strict mode passes with zero errors | TODO |
| AC4 | No new `any` types introduced | TODO |

## Technical Details

### Current Problems

**tRPC Routers:**
- `apps/foundry-dashboard/worker/trpc/routers/spokes.ts:83` - `as any[]`
- `apps/foundry-dashboard/worker/trpc/routers/spokes.ts:223` - `as any`
- `apps/foundry-dashboard/worker/trpc/context.ts:38` - `as any`

**Components:**
- `apps/foundry-dashboard/src/components/clients/ClientManager.tsx`
- `apps/foundry-dashboard/src/components/clients/ShareLinkModal.tsx`
- `apps/foundry-dashboard/src/components/clients/TeamAssignment.tsx`
- `apps/foundry-dashboard/src/test/setup.tsx`

### Required Types

```typescript
// For Durable Object responses
interface DurableObjectResponse<T> {
  data: T;
  error?: string;
}

// For spoke list responses
interface SpokeListItem {
  id: string;
  content: string;
  platform: string;
  status: string;
  // ... full type
}

// For client members
interface ClientMember {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  email: string;
  // ... full type
}
```

## Tasks

- [ ] Create proper TypeScript types for DO responses
- [ ] Replace `as any` in spokes.ts with proper types
- [ ] Replace `as any` in context.ts with proper types
- [ ] Replace `any` in component callbacks with proper types
- [ ] Add types to test setup
- [ ] Enable stricter TypeScript settings
- [ ] Document type conventions

## File List
(To be updated during implementation)

## Change Log
| Date | Change |
|------|--------|
| 2025-12-28 | Story created from codebase audit findings |
