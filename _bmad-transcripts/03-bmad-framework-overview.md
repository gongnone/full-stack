# BMAD Method: AI-Driven Development Framework Overview

**Source**: [SoloDev - A Look into the BMAD Method](https://solodev.app/a-look-into-the-bmad-method)

---

## Overview

The Breakthrough Method for Agile AI-Driven Development (BMAD) integrates artificial intelligence with agile methodologies. It uses specialized AI agents to manage different roles throughout the development process, addressing challenges like planning inconsistency and context loss.

## Core Principles

The framework operates through two main innovations:

### Agentic Planning

Dedicated AI agents—including Analyst, Product Manager, and Architect roles—collaborate to produce detailed Product Requirement Documents and Architecture specifications. This phase can leverage web-based agents for cost efficiency with human refinement.

### Context-Engineered Development

A Scrum Master agent transforms detailed plans into comprehensive development stories that embed full context and implementation guidance. The Development agent then uses these self-contained story files to generate code with complete understanding.

## Key Components

The BMAD Method's flexibility stems from natural language-based files:

### Agent Definition Files (Markdown)
Define each agent's persona, principles, commands, and dependencies. Customization fields allow behavior overrides.

### Checklists (Markdown)
Provide quality criteria and procedures agents must follow, often with LLM-specific instructions for processing.

### Technical Preferences (Markdown)
Allow users to inject technology preferences and design patterns into planning agents.

### Core Configuration (YAML)
Contains critical settings like `devLoadAlwaysFiles` to manage Development agent context efficiently.

### Tasks (Markdown)
Step-by-step procedures agents follow for specific work assignments.

### Templates (YAML)
Define structured output formats for generated documents, ensuring consistency.

## Workflow Structure

### Planning Phase

1. Project idea and research
2. PRD creation
3. Optional UX specification
4. Architecture design
5. Document alignment verification
6. IDE transition with document sharding

### Development Cycle

1. Story drafting
2. Optional story review
3. User approval
4. Implementation and testing
5. Review preparation
6. User verification and QA review
7. Code refactoring if needed
8. Change commitment
9. Story completion

## Agent Roles

The framework includes eight specialized agents:

| Agent | Responsibility |
|-------|----------------|
| **Analyst** | Conducts initial research and brainstorming |
| **Product Manager** | Creates detailed PRDs |
| **Architect** | Designs system architecture |
| **UX Expert** | Develops front-end specifications (optional) |
| **Product Owner** | Ensures document alignment and shards materials |
| **Scrum Master** | Drafts detailed development stories |
| **Developer** | Implements code and tests |
| **QA** | Reviews and refactors work |

## Implementation Approach

The method emphasizes:
- Minimal context for development agents
- Using only essential files to maximize coding efficiency
- Iteratively refining agent definitions based on output quality and project requirements
- Maintaining regular version control commits throughout development cycles

---

*Content sourced from SoloDev publication*
