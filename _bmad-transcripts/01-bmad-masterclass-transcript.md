# BMAD Method Masterclass - Full Transcript Digest

**Source**: [Digestify Podcast - Official BMAD Method Masterclass](https://podcasts.kiranbrahma.com/posts/the-official-bmad-method-masterclass-for-vibe-coding)
**Creator**: Brian Madison (BMadCode)
**Views**: 120K+ on YouTube

---

## Overview

Brian, the BMAD Method creator, demonstrates a complete agentic workflow for software development inside VS Code using Claude Code. The masterclass covers building a to-do CLI app through structured stages: analyst brainstorming, project briefs, PM-driven PRDs, architecture design, and development with QA verification.

## Installation & Setup

The BMAD Method installs in seconds via `npx bmad-method install`, selecting Claude Code as the IDE integration. Brian emphasizes that you don't need to clone the repo unless customizing the method. The workflow operates entirely within VS Code's terminal using slash commands.

**Key Quote**: "Five seconds and you're ready to go" — installation speed emphasis

## Workflow Stage 1: Analyst Phase

Mary (the Analyst agent) guides brainstorming using structured techniques:
- Six Thinking Hats
- Five Whys
- Role Playing
- 20+ other structured techniques

The agent acts as a coach, helping you co-create ideas that become an executive summary with "Now/Next/Later" framing.

## Workflow Stage 2: Project Brief

The Analyst imports the brainstorming doc and interactively builds sections covering:
- Executive summary
- Problem statement
- Solution
- Target users
- Value proposition
- Risks

Embedded elicitation prompts refine content quality.

## Workflow Stage 3: PRD Creation

The PM defines:
- Goals
- Functional requirements
- Non-functional requirements
- Epics
- User stories

Advanced elicitations like "Hindsight is 20/20" trim MVP scope—deferring features like cross-device sync to Phase 2 for faster shipping.

## Workflow Stage 4: Architecture

The Architect generates backend design for Node.js/TypeScript including:
- Mermaid diagrams
- Data models
- Error handling
- Coding standards
- Source tree
- Tech stack tables with specific versions

## Workflow Stage 5: Context Engineering

Documents are sharded into smaller files using the `shard` command and `md-tree`. The developer always loads core files (tech stack, coding standards, source tree) to enforce consistency and prevent silent divergence.

**Key Quote**: "Every file you keep here is potential context" — context management warning

## Workflow Stage 6: Development

The Scrum Master converts PRD stories into developer-ready context packs. James (Developer) implements step-by-step with human approval on each task. Quinn (QA) reviews completed work against acceptance criteria and standards.

**Key Quote**: "The dev agent will always be aware of this technology stack and will not diverge" — consistency through documentation

## Core Principles

### Human-in-the-Loop
Users answer prompts, challenge outputs, and "push" agents using advanced elicitation methods rather than relying on hands-off automation.

**Key Quote**: "Don't check your brain at the door" — human oversight necessity

### Documentation as Code
Artifacts are first-class objects that drive behavior and serve as persistent guardrails.

### Context Discipline
Starting new chats after major artifacts prevents compaction noise. Sharding keeps agent context lean and focused.

### MVP Scope Control
Pruning features early enables faster iteration and market learning.

### Model Economics
Sonnet handles most tasks effectively; upgrade to Opus only for complex architecture or deep QA.

## Tools & Technologies Mentioned

- Claude Code (Sonnet/Opus)
- VS Code
- Node.js
- TypeScript
- Mermaid
- GitHub
- Supabase
- Shadcn UI
- SQLite

## Agent Roles

1. **Analyst (Mary)** - Brainstorming and research coach
2. **PM** - Product requirements definition
3. **Architect** - Technical architecture design
4. **Scrum Master** - Story breakdown and sprint planning
5. **Developer (James)** - Implementation
6. **QA (Quinn)** - Code review and quality assurance

---

*Transcript sourced from official BMAD Method masterclass video digest*
