# Story 10-2 Adversarial Code Review

**Story**: Deep Research Agent
**Commit**: 65f7a54
**Reviewed**: 2026-01-01
**Status**: APPROVED WITH 5 ISSUES TO FIX

---

## Summary

Story 10-2 implements a Deep Research Agent that analyzes Brand DNA and generates market intelligence. The implementation is ~700 lines across `research.ts` with unit tests. Overall architecture is solid for MVP, but there are 5 specific issues that need fixing.

---

## Issues Found (Must Fix)

### Issue 1: AbortController Not Connected to AI Call (CRITICAL)

**File**: `research.ts:127-143`
**Severity**: 🔴 High
**Type**: Bug - Timeout doesn't actually work

```typescript
async function runAIWithTimeout(
  ai: Context['env']['AI'],
  prompt: string,
  timeoutMs: number = 60000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 800,
      // BUG: signal is never passed to ai.run()
    });
    return (result as { response: string }).response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**Problem**: The `AbortController` is created but never passed to the AI call. The timeout will fire, but the AI call won't actually be aborted.

**Fix**: Workers AI doesn't support AbortController. Replace with `Promise.race()`:

```typescript
async function runAIWithTimeout(
  ai: Context['env']['AI'],
  prompt: string,
  timeoutMs: number = 60000
): Promise<string> {
  const aiPromise = ai.run('@cf/meta/llama-3.1-8b-instruct', {
    prompt,
    max_tokens: 800,
  }).then(result => (result as { response: string }).response);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('AI timeout')), timeoutMs)
  );

  return Promise.race([aiPromise, timeoutPromise]);
}
```

---

### Issue 2: Duplicate Code in startResearch and retryResearch

**File**: `research.ts:149-234` and `research.ts:331-392`
**Severity**: 🟡 Medium
**Type**: Code Quality - DRY violation

Both procedures have nearly identical logic for:
- Getting Brand DNA data
- Getting content samples
- Building voiceProfile JSON
- Calling runResearchPipeline

**Fix**: Extract shared logic:

```typescript
async function getResearchInputData(ctx: Context, clientId: string) {
  const brandDna = await ctx.db.prepare(`...`).bind(clientId).first<...>();
  const contentSamples = await ctx.db.prepare(`...`).bind(clientId).all<...>();

  return {
    transcript: brandDna?.total_transcription || '',
    contentSummary: contentSamples.results
      .map(s => `${s.title}: ${(s.extracted_text || '').slice(0, 200)}`)
      .join('\n'),
    voiceProfile: JSON.stringify({
      tone: brandDna?.primary_tone,
      style: brandDna?.writing_style,
      audience: brandDna?.target_audience,
      entities: brandDna?.voice_entities,
    }),
  };
}
```

---

### Issue 3: Missing Error Boundary in triggerResearchFromOnboarding

**File**: `research.ts:603-658`
**Severity**: 🟡 Medium
**Type**: Reliability

```typescript
export async function triggerResearchFromOnboarding(
  ctx: Context,
  clientId: string
): Promise<{ reportId: string; status: string }> {
  // ...
  await runResearchPipeline(ctx, clientId, reportId, {...}); // Can throw
  await createStrategyApprovalAndNotify(ctx, clientId);      // Won't run if above throws
  return { reportId, status: 'complete' };                   // Always says complete
}
```

**Problem**: If `runResearchPipeline` throws, `createStrategyApprovalAndNotify` never runs, but calling code thinks status is 'complete'.

**Fix**: Check actual status from DB after pipeline:

```typescript
await runResearchPipeline(ctx, clientId, reportId, {...});

const status = await ctx.db.prepare(
  `SELECT status FROM client_research_reports WHERE id = ?`
).bind(reportId).first<{ status: string }>();

if (status?.status === 'complete') {
  await createStrategyApprovalAndNotify(ctx, clientId);
}

return { reportId, status: status?.status || 'failed' };
```

---

### Issue 4: Inconsistent Column Naming

**File**: `research.ts:279-287` vs migration
**Severity**: 🟢 Low
**Type**: Inconsistency

The code returns `subNiche` but stores/retrieves as `sub_niche`. While this works, it creates potential confusion.

```typescript
report: report.status === 'complete' ? {
  industry: report.industry,
  subNiche: report.sub_niche,  // snake_case from DB -> camelCase
  // ...
}
```

**Recommendation**: This is acceptable for MVP. Consider a Drizzle model later for consistent mapping.

---

### Issue 5: Test Mocks Don't Match Real AI Response Shape

**File**: `research.test.ts:34-38`
**Severity**: 🟢 Low
**Type**: Test Quality

```typescript
mockAIRun.mockResolvedValue({
  response: JSON.stringify({
    industry: 'Executive Coaching',
    frameworkFit: { teach: 0.85, challenge: 0.91 },
  }),
});
```

**Problem**: Real AI returns different shapes for industry detection vs framework analysis. Tests use same mock for both calls, which masks potential parsing issues.

**Fix (optional for MVP)**: Mock each call separately or accept this limitation.

---

## What's Good

1. **Cost guardrails implemented**: Max 2 AI calls, 800 token limit, 60s timeout (once fixed)
2. **Graceful degradation**: Falls back to sensible defaults on AI failures
3. **Proper status tracking**: researching -> complete/failed with timestamps
4. **Integration with pipeline**: Auto-triggers Story 10-3 and 10-4
5. **Test coverage**: Unit tests cover main flows
6. **Zod schemas**: Proper validation on inputs

---

## Architecture Alignment

| Criterion | Status |
|-----------|--------|
| Uses Workers AI | ✅ |
| D1 database integration | ✅ |
| tRPC router pattern | ✅ |
| Client access middleware | ✅ |
| Async pipeline pattern | ✅ |

---

## Recommendation

**APPROVE** with Issues 1-3 fixed before deploy.

- Issue 1 (timeout bug) is critical - the guardrail doesn't work
- Issue 2 is DRY cleanup - can be deferred post-MVP
- Issue 3 could cause silent failures in onboarding flow

Issues 4-5 are acceptable technical debt for MVP.

---

## Quick Fixes

```bash
# Issue 1: Replace runAIWithTimeout with Promise.race pattern
# Issue 3: Add status check after runResearchPipeline

# Files to modify:
# - apps/foundry-dashboard/worker/trpc/routers/research.ts
```
