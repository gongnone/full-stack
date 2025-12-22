# Story 7.4: Context Isolation & Data Security

**Status:** done
**Story Points:** 8
**Sprint:** 5
**Epic:** 7 - Multi-Client Agency Operations

## Story

As a **user**,
I want **complete isolation between client contexts**,
So that **no data leaks between clients**.

## Acceptance Criteria

### AC1: Request Routing to Durable Object
**Given** I am in a specific client context
**When** I perform operations on Hubs, Pillars, or Spokes
**Then** the tRPC router proxies the request to that client's specific `ClientAgent` Durable Object

### AC2: Per-Client SQLite Isolation
**Given** a request reaches a `ClientAgent` Durable Object
**When** it queries data
**Then** it only has access to its own local SQLite storage (Agent SDK)
**And** cannot access other clients' data

### AC3: Namespaced Vectorize Queries
**Given** the system performs similarity searches for Brand DNA
**When** the query is executed
**Then** it uses the client-specific namespace in Vectorize

### AC4: R2 Path Isolation
**Given** media or source files are stored in R2
**When** a file is saved or retrieved
**Then** it uses the `/assets/{client_id}/` or `/sources/{client_id}/` prefix

## Tasks / Subtasks

- [x] **Task 1: Durable Object RPC Proxy**
  - [x] Implement helper in tRPC context to get Client Agent DO instance
  - [x] Refactor `hubsRouter` to use DO RPC for content-heavy operations
  - [x] Refactor `spokesRouter` to use DO RPC for generation and evaluation data

- [x] **Task 2: Vectorize Namespacing**
  - [x] Update `ClientAgent` to use `client_${clientId}` namespace for all Vectorize operations

- [x] **Task 3: R2 Path Enforcement**
  - [x] Update R2 storage logic to strictly enforce client-prefixed paths

## Implementation Notes

- **Proxy Pattern:** The dashboard worker acts as a thin proxy for client-specific data. Global D1 only stores minimal metadata (Hub IDs, Client IDs) for cross-client listing and billing.
- **Physical Isolation:** By using one DO instance per client, we leverage Cloudflare's isolation guarantees. Each DO has its own private SQLite storage.
