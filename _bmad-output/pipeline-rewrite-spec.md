# Pipeline Rewrite Specification

## Model Strategy
- **Creator**: `@cf/openai/gpt-oss-120b` (OpenAI open-weight reasoning model)
- **Visual Strategist**: `@cf/openai/gpt-oss-120b` (same — quality matters for creative)
- **Research Agent**: `@cf/mistralai/mistral-small-3.1-24b-instruct` (good reasoning, cheaper)
- **G2 Hook Critic**: `@cf/meta/llama-3.1-8b-instruct-fast` (scoring is fine for small models)
- **G7 Engagement**: Keep current (heuristic + Vectorize, no LLM needed)
- **Embeddings**: Keep `@cf/baai/bge-base-en-v1.5` (works fine)

## Pipeline: Old vs New

### OLD (7 sequential gates, max 21 LLM calls per spoke):
```
Creator (70b) → Visual (70b) → G2 (8b) → G4 (8b) → G5 (8b) → G6 (8b) → G7 (heuristic)
× 3 regen attempts if any fail = up to 21 LLM calls
Failure mode: creative_conflict (user gets NOTHING)
```

### NEW (3 phases, max 6 LLM calls per spoke):
```
Phase 1: CREATE
  - Creator (gpt-oss-120b) — one call, richer prompt with examples
  - Visual (gpt-oss-120b) — one call, anti-cliché baked into prompt
  
Phase 2: SCORE (parallel, non-blocking)
  - G2 Hook Score (8b-fast) — score only, no gate
  - G5 Platform Check — pure JS, no LLM
  - G7 Engagement — heuristic + Vectorize, no LLM
  
Phase 3: POLISH (conditional, max 1 attempt)
  - If G2 < 50 (truly bad): one regen with specific feedback
  - Otherwise: ship it with scores attached
  
Result: 2-4 LLM calls per spoke. Every spoke produces output.
Scores are ADVISORY — user sees quality indicators, decides what to publish.
```

## Key Changes to spoke-generation.ts

1. **Model constant**: Change Creator from `llama-3.1-70b-instruct` to `gpt-oss-120b`
2. **Kill G4**: Remove voice alignment LLM call entirely — voice constraints go into Creator prompt
3. **Kill G6**: Remove visual cliché LLM call — anti-cliché rules go into Visual prompt
4. **G5 is already JS**: Just verify it stays pure JS (it is)
5. **Run G2 + G7 in parallel**: Use Promise.all instead of sequential steps
6. **Max 1 regen**: Change MAX_REGENERATION_ATTEMPTS from 3 to 1
7. **Kill creative_conflict**: Replace with `needs_review` status. Everything produces output.
8. **Creator prompt v2**: Include example content, stances, audience persona

## Creator Prompt v2 Structure

```
You are a world-class social media copywriter.

BRAND IDENTITY:
- Voice: {voiceMarkers} 
- Never use: {bannedWords}
- Brand believes: {stances — hot takes, opinions}
- Audience: {audiencePersona — psychographic, not demographic}

EXAMPLE CONTENT (write like this):
"""
{bestPost1}
"""
"""
{bestPost2}
"""

NEVER write like this:
"""
{antiExample}
"""

CONTENT SEED:
- Pillar: {pillarTitle}
- Specific angle: {contentSeed — not just title, a real idea}
- Hook style: {hookPattern from Vectorize}

PLATFORM: {platform}
{platformInstructions}

Write ONE post. Output ONLY the final content. No preamble.
```

## What Stays
- G7 scoring (heuristic + Vectorize) — valuable signal
- Sanitizer — last line of defense
- Visual metadata generation — but with better prompt
- DO storage (spokes in ClientAgent SQLite)
- Workflow structure (Cloudflare Workflows)

## What Dies
- G4 (voice alignment LLM) — absorbed into Creator prompt
- G6 (visual cliché LLM) — absorbed into Visual prompt  
- creative_conflict status — replaced with needs_review
- 3-attempt regen loop — max 1 targeted regen
- Sequential gate execution — parallel scoring
