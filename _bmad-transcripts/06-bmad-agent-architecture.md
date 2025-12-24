# BMAD Agent Architecture and Lifecycle

**Source**: [DeepWiki - Agent Architecture](https://deepwiki.com/bmadcode/BMAD-METHOD/8.1-agent-architecture-and-lifecycle)

---

## Overview

BMAD-METHOD implements a sophisticated agent system that transforms YAML definitions into deployable formats across 10+ IDEs through an eight-phase pipeline.

## Core Architecture

### Agent Definition Structure

Agents are defined in `.agent.yaml` files containing five primary sections:

1. **Metadata** - ID, name, title, icon, and optional module declaration
2. **Persona** - Role, identity, communication style, and principles
3. **Critical Actions** - High-priority directives
4. **Menu** - Command triggers and targets
5. **Prompts** (optional) - Additional instructions

## Lifecycle Phases

### Phase 1: Agent Definition
Agents live in module-specific directories following a strict YAML schema with kebab-case trigger naming conventions.

### Phase 2: Schema Validation
Before compilation, agents undergo Zod validation enforcing:
- Module scope correctness (file path must match declared module)
- Trigger format rules (lowercase, hyphen-separated only)
- Trigger uniqueness within each agent
- Menu items must specify at least one command target

### Phase 3: Customization Merge
Optional `*.customize.yaml` files are deep-merged with base definitions, enabling "persistent customizations that survive updates."

### Phase 4: Handler Analysis
The system detects required infrastructure—workflows, templates, data files—ensuring only necessary components are included.

### Phase 5: Activation Block Injection
An activation block containing help menus, exit commands, and system prompts gets injected into agent XML for IDE integration.

### Phase 6: XML Conversion
YAML transforms to XML format using `YamlXmlBuilder`, embedding build metadata including source file hashes and builder version.

### Phase 7: IDE-Specific Formatting
XML undergoes platform-specific transformations:
- Markdown with frontmatter for Claude Code/Cursor
- TOML for Qwen
- Flat naming for Codex

### Phase 8: Deployment
Compiled agents deploy to selected IDE directories or package into web bundles.

## Agent Menu System

Menu items specify trigger words and command targets. Supported target types include:

| Target Type | Description |
|-------------|-------------|
| **workflow** | Execute YAML workflow files |
| **validate-workflow** | Validate workflow output |
| **exec** | Execute markdown-based workflows |
| **action** | Inline action strings |
| **tmpl** | Template files |
| **data** | Data file loading |

Platform filtering via `ide-only` and `web-only` flags controls deployment scope.

## Module Scope Validation

"Module agents must declare their module scope correctly based on file location."

- Core agents (src/core/agents/) must omit `metadata.module`
- Module agents must declare matching module (bmm, bmb, cis)

## Trigger Validation

Valid triggers follow strict kebab-case format:
- Lowercase letters
- Hyphens only
- No consecutive hyphens

Examples: `workflow-status`, `create-prd`, `code-review`

## XML Structure Mapping

The compiled XML maintains consistent element ordering:

1. `<activation>` (injected first)
2. `<metadata>`
3. `<persona>`
4. `<critical_actions>`
5. `<menu>`
6. `<prompts>`
7. `<conversational_knowledge>`

## Build Metadata

Each compiled agent includes traceability data:
- Source filename
- SHA-256 hashes
- Customize file information
- Builder version
- Deployment flags

This enables smart reinstallation detection and version management.

## Summary

The agent architecture enables a "write once, deploy everywhere" model where single YAML definitions compile to multiple IDE formats through validation, customization, activation injection, and platform-specific formatting stages.

---

*Content sourced from DeepWiki BMAD-METHOD documentation*
