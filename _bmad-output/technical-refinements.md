# Technical Refinements

> Architectural improvements to ensure Adversarial Architecture and Agency Scalability remain defensible

**Date Identified:** 2025-12-21
**Status:** Approved for Implementation
**Author:** Williamshaw

---

## Summary

| Refinement | Epic/Story | Problem | Solution |
|------------|------------|---------|----------|
| Self-Healing Cool-down | 4.3 | Repetitive hallucinations on 3rd attempt | Context Refresh queries `mutation_registry` |
| Warm-up Routine | 7.3 | Cold-start DO latency exceeds 100ms | Pre-warm 5 most recent client agents |
| Rubric Failure Highlighting | 4.4 | Users must read entire draft to find issues | Inline red highlighting of violations |

---

## Refinement 1: Self-Healing Cool-down

### Problem Statement

The PRD specifies a maximum of 3 attempts for the Self-Healing Loop. If the Creator Agent fails twice with the same Brand DNA grounding, the third attempt may produce repetitive hallucinations by applying the same failing strategy.

### Solution: Context Refresh

After the second failed Self-Healing attempt, force a query of the `mutation_registry` table which contains manual user edits. These edits represent "ground truth" corrections that the AI may be missing.

### Implementation

```typescript
// Self-Healing Loop with Context Refresh
async function selfHealingLoop(spoke: Spoke, maxAttempts = 3): Promise<Spoke> {
  let attempts = 0;
  let feedback: string | undefined;

  while (attempts < maxAttempts) {
    const result = await creatorAgent.generate(spoke.hub, spoke.pillar, feedback);
    const scores = await criticAgent.evaluate(result);

    if (passesAllGates(scores)) {
      return result;
    }

    attempts++;
    feedback = await criticAgent.generateFeedback(result, scores);

    // CONTEXT REFRESH: After 2nd failure, query mutation_registry
    if (attempts === 2) {
      const userEdits = await queryMutationRegistry(spoke.hub.clientId, spoke.pillar.id);
      if (userEdits.length > 0) {
        feedback += `\n\nUSER EDIT PATTERNS DETECTED:\n${formatUserEdits(userEdits)}`;
      }
    }
  }

  return markAsCreativeConflict(spoke, feedback);
}
```

### Acceptance Criteria (Story 4.3)

```gherkin
Given a spoke has failed the Self-Healing Loop twice
When the 3rd attempt initiates (Context Refresh)
Then the system queries `mutation_registry` for user edits on this client/pillar
And if edits exist, they are appended to the feedback as "USER EDIT PATTERNS DETECTED"
And the Creator incorporates these patterns in the final attempt
```

### Benefits

- Creates feedback loop between human judgment and AI generation
- Prevents repetitive hallucinations by introducing new context
- Leverages existing `mutation_registry` data (Mutation Rule from PRD)
- No additional API calls to external services

---

## Refinement 2: Warm-up Routine for Context Switching

### Problem Statement

NFR-P1 requires < 100ms context switching between clients. However, cold-start Durable Objects on Cloudflare can exceed this budget, especially for the first request after idle timeout.

### Solution: LRU Warm Cache

Implement a "Warm-up" routine that keeps the 5 most recently active client agents in a warm state during an Agency Account Manager's session using LRU eviction.

### Implementation

```typescript
// Warm-up routine for Agency Account Manager sessions
interface WarmClientCache {
  clientId: string;
  lastAccess: number;
  doStub: DurableObjectStub;
}

class AgencySessionManager {
  private warmClients: WarmClientCache[] = [];
  private readonly MAX_WARM_CLIENTS = 5;

  async ensureClientWarm(clientId: string): Promise<DurableObjectStub> {
    // Check if already warm
    const cached = this.warmClients.find(c => c.clientId === clientId);
    if (cached) {
      cached.lastAccess = Date.now();
      return cached.doStub;
    }

    // Warm up new client
    const doStub = await this.getClientDurableObject(clientId);
    await doStub.fetch('/ping'); // Keep-alive ping

    // Add to warm cache, evict LRU if needed
    this.warmClients.push({ clientId, lastAccess: Date.now(), doStub });
    if (this.warmClients.length > this.MAX_WARM_CLIENTS) {
      this.warmClients.sort((a, b) => a.lastAccess - b.lastAccess);
      this.warmClients.shift(); // Evict oldest
    }

    return doStub;
  }

  async onSessionStart(recentClients: string[]): Promise<void> {
    // Pre-warm top 5 most recently accessed clients
    const toWarm = recentClients.slice(0, this.MAX_WARM_CLIENTS);
    await Promise.all(toWarm.map(id => this.ensureClientWarm(id)));
  }
}
```

### Acceptance Criteria (Story 7.3)

```gherkin
Given I am an Agency Account Manager with 47 clients
When I start my session
Then the system pre-warms my 5 most recently accessed client Durable Objects
And switching between these warm clients achieves < 100ms latency
And the warm cache uses LRU eviction when I access a 6th client
```

### Benefits

- Ensures NFR-P1 compliance for cold-start DOs
- Marcus Chen maintains "Mission Control Velocity" across 47 clients
- LRU eviction prevents memory bloat
- Pre-warming on session start is proactive, not reactive

---

## Refinement 3: Rubric Failure Highlighting

### Problem Statement

The UX spec describes a Creative Conflict Panel with side-by-side resolution when Self-Healing fails. However, users must read the entire draft to find the specific problem, increasing "Review Tax."

### Solution: Inline Violation Highlighting

The Critic returns violations with character positions, enabling the UI to highlight the specific "Rubric Failure Point" in red within the content draft itself.

### Implementation

```typescript
interface RubricViolation {
  gate: 'G2' | 'G4' | 'G5' | 'G6';
  startIndex: number;
  endIndex: number;
  reason: string;
  severity: 'critical' | 'warning';
}

interface HighlightedDraft {
  content: string;
  violations: RubricViolation[];
}

// Critic returns violations with character positions
async function evaluateWithHighlights(spoke: Spoke): Promise<HighlightedDraft> {
  const scores = await criticAgent.evaluate(spoke);
  const violations: RubricViolation[] = [];

  if (scores.g4 === 'fail') {
    const bannedMatches = findBannedWords(spoke.content, spoke.clientBrandDNA);
    violations.push(...bannedMatches.map(m => ({
      gate: 'G4' as const,
      startIndex: m.start,
      endIndex: m.end,
      reason: `Banned word: "${m.word}"`,
      severity: 'critical' as const
    })));
  }

  if (scores.g5 === 'fail') {
    const charLimit = getPlatformLimit(spoke.platform);
    if (spoke.content.length > charLimit) {
      violations.push({
        gate: 'G5',
        startIndex: charLimit,
        endIndex: spoke.content.length,
        reason: `Exceeds ${charLimit} character limit`,
        severity: 'warning'
      });
    }
  }

  // ... similar for G2 (weak hook), etc.

  return { content: spoke.content, violations };
}
```

### UX Implementation

```tsx
// CreativeConflictPanel.tsx
function ContentPreview({ content, violations }: HighlightedDraft) {
  return (
    <div className="content-preview">
      <HighlightedText
        content={content}
        highlights={violations.map(v => ({
          start: v.startIndex,
          end: v.endIndex,
          className: v.severity === 'critical'
            ? 'bg-[rgba(244,33,46,0.2)] text-[#F4212E]'
            : 'bg-[rgba(255,173,31,0.2)] text-[#FFAD1F]',
          tooltip: `${v.gate}: ${v.reason}`
        }))}
      />
    </div>
  );
}
```

### Acceptance Criteria (Story 4.4)

```gherkin
Given I view a draft with a G4 Voice Alignment failure
When the content renders in the Right Panel
Then the specific violation points are highlighted inline in red
And hovering the highlight shows tooltip: "G4: Banned word 'synergy'"
And I can immediately identify WHERE to edit without reading the entire draft
```

### Benefits

- Follows "Signal, Not Noise" UX principle from UX spec
- Reduces Review Tax from "read entire draft" to "fix highlighted section"
- Uses color semantics from Midnight Command: red = critical, yellow = warning
- Tooltip provides context without cluttering the UI

---

## Document References

- **Architecture.md:** Section "Strategic Refinements" added with full implementation details
- **Epics.md:** Stories 4.3, 4.4, and 7.3 updated with additional acceptance criteria
- **PRD.md:** Original requirements (FR18, FR19, FR41, NFR-P1) remain unchanged

---

## Implementation Order

| Priority | Refinement | Depends On | Epic |
|----------|------------|------------|------|
| 1 | Warm-up Routine | Epic 1 Foundation | 7.3 |
| 2 | Self-Healing Cool-down | Epic 4 Quality Engine | 4.3 |
| 3 | Rubric Failure Highlighting | Epic 4 Quality Engine | 4.4 |

**Note:** Warm-up Routine can be implemented as part of Epic 1 Foundation since it affects session management, even though the full multi-client story is in Epic 7.
