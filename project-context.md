# Project Context: The Agentic Content Foundry

> Critical rules for AI agents implementing code in this monorepo

**Last Updated:** 2025-12-21
**Architecture Version:** MVP Scope Lock

---

## Project Overview

Multi-tenant SaaS platform transforming content creation through adversarial AI architecture. Hub-and-Spoke production model with Creator/Critic agents ensuring quality before human review.

**Core Stack:** React 19 + TanStack Router + tRPC 11 + Kysely + D1 + Cloudflare Workers

---

## Rule 1: Isolation Above All

Every database query MUST include client context filtering. Brand DNA contamination between clients is a **critical failure**.

```typescript
// ✅ CORRECT
const hubs = await db
  .selectFrom('hubs')
  .where('client_id', '=', ctx.clientId)
  .selectAll()
  .execute();

// ❌ FORBIDDEN - Never query without client_id
const hubs = await db.selectFrom('hubs').selectAll().execute();
```

**Enforcement:** All Kysely query helpers require `clientId` parameter.

---

## Rule 2: Performance Budget

| Operation | Budget | Implementation |
|-----------|--------|----------------|
| Client context switch | < 100ms | Durable Object hydration |
| Brand DNA lookup | < 50ms | SQLite in DO storage |
| Vectorize query | < 200ms | Namespaced by client |
| D1 metadata query | < 100ms | Indexed by client_id |

**Pattern:** Hot data → Durable Object SQLite. Cold data → D1 global.

---

## Rule 3: Design Fidelity (Midnight Command)

Use design tokens exclusively. No arbitrary colors, gradients, or playful UI.

```typescript
// ✅ CORRECT
className="bg-[#0F1419] text-[#E7E9EA] border-[#2A3038]"

// ❌ FORBIDDEN
className="bg-gray-900" // arbitrary
className="bg-gradient-to-r from-purple-500" // playful
```

**Color Tokens:**
- Background: `#0F1419`
- Surface: `#1A1F26`
- Border: `#2A3038`
- Text Primary: `#E7E9EA`
- Text Secondary: `#8B98A5`
- Approve: `#00D26A`
- Kill: `#F4212E`
- Edit: `#1D9BF0`
- Warning: `#FFAD1F`

**Anti-patterns:** No gradients, no playful illustrations, no gamification badges, no emoji in UI chrome.

---

## Rule 4: Adversarial Logic

Content generation is NEVER a single prompt. Always: Creator → Critic → Feedback Loop.

```typescript
// ✅ CORRECT
async function generateSpoke(hub: Hub, pillar: Pillar): Promise<Spoke> {
  let attempts = 0;
  let feedback: string | undefined;

  do {
    const spoke = await creatorAgent.generate(hub, pillar, feedback);
    const scores = await criticAgent.evaluate(spoke);

    if (scores.g2 >= 80 && scores.g4 === 'pass' && scores.g5 === 'pass') {
      return spoke;
    }

    feedback = await criticAgent.generateFeedback(spoke, scores);
    attempts++;
  } while (attempts < 3);

  return markAsCreativeConflict(spoke, feedback);
}

// ❌ FORBIDDEN
return await llm.generate(prompt); // No quality gate
```

---

## MVP Scope (What TO Build)

| Feature | Included |
|---------|----------|
| Ingestion | PDF, Transcript, Raw Text |
| Generation | Text Spokes, Carousels, Threads |
| Quality | G2, G4, G5 Gates + Self-Healing |
| Calibration | Text-based DNA updates |
| Analytics | Zero-Edit Rate, Volume |
| Export | CSV, JSON |

---

## MVP Exclusions (What NOT to Build)

- ❌ Voice-to-Grounding (text input only)
- ❌ G6 Visual Archetype scoring
- ❌ G7 Engagement Prediction
- ❌ G-Compliance Gate
- ❌ Publishing integrations
- ❌ Video rendering
- ❌ WebSocket real-time sync

---

## File Structure Patterns

```
apps/foundry-dashboard/
├── src/
│   ├── routes/           # TanStack Router file-based routes
│   ├── components/
│   │   ├── ui/           # Radix + Tailwind primitives
│   │   ├── review/       # Sprint review components
│   │   ├── brand/        # Brand DNA components
│   │   └── queue/        # Production queue
│   └── lib/
│       ├── trpc-client.ts
│       └── utils.ts
├── worker/
│   ├── trpc/
│   │   ├── router.ts
│   │   └── routers/      # Domain-specific routers
│   ├── hono/
│   │   └── app.ts
│   └── auth/
│       └── index.ts
```

---

## tRPC Router Mapping

| Router | Functional Requirements |
|--------|------------------------|
| `clients` | FR39-FR47 |
| `hubs` | FR1-FR7 |
| `spokes` | FR8-FR14 |
| `review` | FR23-FR30 |
| `calibration` | FR31-FR38 |
| `analytics` | FR48-FR54 |
| `exports` | FR55-FR60 |

---

## Testing Requirements

- E2E: Playwright for critical user flows
- Unit: Vitest for business logic
- Coverage: Quality gates, isolation logic, adversarial loop

---

## References

- PRD: `_bmad-output/prd.md`
- Architecture: `_bmad-output/architecture.md`
- UX Spec: `_bmad-output/ux-design-specification.md`
