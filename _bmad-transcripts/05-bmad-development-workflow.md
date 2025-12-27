# BMAD Method Development Workflow - Complete Guide

**Source**: [DeepWiki - BMAD-METHOD Documentation](https://deepwiki.com/bmadcode/BMAD-METHOD/4-development-workflow)

---

## Core Framework

BMAD-METHOD is an "AI-driven development orchestration framework distributed as an NPM package" that implements structured, guided workflows with specialized agents. The system is built on the **C.O.R.E. Framework** (Collaboration Optimized Reflection Engine), emphasizing human amplification rather than automation.

## Architecture Overview

The system consists of:

### BMad Core
Universal foundation for agent orchestration and workflow execution

### BMM Module
Flagship development methodology with 12 agents and 34 workflows

### BMB Module
Tools for creating custom agents and workflows

### CIS Module
Creative intelligence and brainstorming capabilities

## Four-Phase Methodology

### Phase 1: Analysis (Optional)
- Exploration
- Brainstorming
- Research
- Product briefs

### Phase 2: Planning (Required)
Produces PRDs or tech specs based on complexity

### Phase 3: Solutioning (Track-dependent)
- Architecture design
- Epic breakdown

### Phase 4: Implementation (Required)
- Sprint-based story development
- Continuous validation

## Scale-Adaptive Intelligence

The system adjusts complexity through three tracks:

| Track | Use Case | Story Count |
|-------|----------|-------------|
| **Quick Flow** | Bug fixes and simple features | 1-15 stories |
| **BMad Method** | Products and platforms | 10-50+ stories |
| **Enterprise Method** | Compliance-heavy projects | 30+ stories |

## Agent System

Twelve specialized agents manage different lifecycle stages:

| Agent | Role |
|-------|------|
| **PM** (Product Manager) | Planning phase leadership |
| **Architect** | System design and technical decisions |
| **Developer** | Implementation and code review |
| **TEA** (Test Architect) | Cross-phase quality and testing architecture |
| **UX Designer** | Interface specification |
| **Scrum Master** | Sprint coordination and story management |
| **Analyst** | Research and brainstorming |
| **Tech Writer** | Documentation |
| **Principal Engineer** | Senior technical guidance |
| **Game Designer** | Game-specific design (BMGD module) |
| **Game Developer** | Game implementation |
| **BMad Master** | Coordination and orchestration |

## Workflow Execution

Workflows use YAML configuration with automatic document discovery via `discover_inputs` protocol, supporting both full and selective document loading for sharded content.

## Status Tracking

Progress is monitored through:
- `bmm-workflow-status.yaml`: Phases 1-3 tracking
- `sprint-status.yaml`: Phase 4 implementation tracking

---

*Content sourced from DeepWiki BMAD-METHOD documentation*
