# BMad-Method: Universal AI Agent Framework

**Source**: [Kanzen Lifecycles - BMad Method](https://www.kanzen.sh/lifecycles/bmadcode/bmad-method)

---

## Overview

The BMad-Method is an agentic planning and development framework designed for AI-assisted software delivery. It combines structured planning with context-engineered development workflows.

## Core Features

### Two Main Innovations

#### 1. Agentic Planning
Analyst, PM, and Architect roles collaborate to create consistent PRD and Architecture documents using templates and knowledge resources.

#### 2. Context-Engineered Development
A Scrum Master converts sharded artifacts into detailed story files that developers execute, with QA providing structured review.

## Key Roles

| Role | Function |
|------|----------|
| **Analyst** | Research and ideation |
| **PM** | Product requirements |
| **Architect** | Technical design |
| **Product Owner** | Alignment and sharding |
| **Scrum Master** | Story management |
| **Developer** | Implementation |
| **QA** | Quality assurance |
| **UX Expert** | Interface design |

## Installation

```bash
npx bmad-method install
```

## Requirements

| Category | Specification |
|----------|---------------|
| **Languages** | JavaScript, TypeScript, Markdown, YAML |
| **Tools** | Node.js ≥20, npm/npx, VS Code or compatible IDE |
| **Team Size** | Any size (1+ members) |

## Workflows

### Planning Workflow

Structured PRD and Architecture creation with:
- Optional research phase
- Optional UX phase
- Document alignment verification

### Development Cycle

1. Scrum Master drafts detailed stories
2. Developer implements
3. QA reviews and refactors
4. Iterative cycles until completion

## Project Stats

| Metric | Value |
|--------|-------|
| **License** | MIT |
| **Stars** | 25,902 |
| **Last Updated** | September 29, 2025 |
| **Version** | 4.36.2 |
| **Maintainer** | BMadCode / Brian (BMad) Madison |
| **Repository** | github.com/bmadcode/BMAD-METHOD |
| **Support** | discord.gg/gk8jAdXWmj |

## User Guide Summary

### Overview

The BMad Method is a planning and AI development framework designed for building multi-agent systems across software and non-software domains. It emphasizes "Agentic Agile AI Development" for both new projects (Greenfield) and existing codebases (Brownfield).

### Core Workflow Structure

**Greenfield Projects:**
- Install BMad at project root
- Deploy Analyst/PM/Architect agents to draft requirements and design architecture
- Move from Web UI to IDE as scope increases

**Brownfield Projects:**
- Leverage existing architecture within current codebase structure

### Special Agents

- **BMad-Master**: Functions as a generalist coordinator
- **BMad-Orchestrator**: Manages agent bundles in Web UI
- **Domain-specific agents**: @pm, @architect, @dev handle targeted tasks

### Operational Features

Two interaction modes:
1. Incremental step-by-step development
2. Rapid generation with minimal specification

File management relies on lean documentation with shared configuration files loaded automatically.

### Customization

Users customize preferences through technical-preference files that define:
- Frameworks
- Tech stacks
- Naming conventions

### Core Principle

"Starting small with lean structures and scaling intelligently through modular, agent-driven execution rather than traditional waterfall or rigid agile methodologies."

---

*Content sourced from Kanzen Lifecycles platform*
