# The BMAD Method: Spec-Oriented AI-Driven Development

**Source**: [GMO Internet Group - Engineering Blog](https://recruit.group.gmo/engineer/jisedai/blog/the-bmad-method-a-framework-for-spec-oriented-ai-driven-development/)

---

## Overview

The BMAD Method (Breakthrough Method for Agile AI-Driven Development) is a structured framework for AI-assisted software development that emphasizes specification-driven processes over unstructured prompting.

## Core Philosophy

Rather than relying on "vibe coding" with informal prompts, BMAD establishes a formal workflow with specialized AI agent roles. The framework addresses a key limitation: "relying on unstructured prompts often leads to inconsistent or unscalable results."

## Two-Phase Architecture

### Phase 1: Agentic Planning

Involves four personas:

1. **Analyst**: Market research and project ideation
2. **Product Manager**: Requirements documentation (PRD creation)
3. **Architect**: System design and technical specifications
4. **Product Owner**: Converting comprehensive plans into focused epic files

### Phase 2: Context-Engineered Development

Employs three roles:

1. **Scrum Master**: Breaking epics into detailed implementation stories
2. **Developer**: Code implementation with full architectural context
3. **QA Engineer**: Quality validation and requirements traceability

## Key Innovation: Epic Sharding

A critical distinction from other frameworks is "epic sharding"—decomposing comprehensive PRDs into focused, manageable development units while preserving full planning context. This eliminates context loss between phases.

## Industry Validation

Research demonstrates structured AI approaches achieve measurable improvements:
- GitHub studies show "55% faster task completion rates" with structured tools versus unstructured methods
- Enterprise field studies report "12.92% to 21.83% more pull requests per week"

## Technical Implementation

- BMAD uses markdown-based templates
- Tool-agnostic, working with Cursor, Windsurf, and other AI coding assistants
- Installation requires Node.js 20+
- Command: `npx bmad-method install`

---

*Content sourced from GMO Internet Group Engineering Blog*
