# Story 9.7: Database Foreign Key Constraints

## Status: done

## Story Summary
Add missing foreign key constraints to database tables. The `training_samples` table is missing FK on `client_id`, which can lead to orphaned records.

## Business Value
Data integrity is critical for a multi-tenant system. Missing foreign keys can cause orphaned data, inconsistent state, and potential data leaks across clients.

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | `training_samples.client_id` has FK to `clients.id` with CASCADE DELETE | DONE |
| AC2 | All existing orphaned records cleaned up | DONE |
| AC3 | Migration is reversible (down migration) | DONE |
| AC4 | All tables audited for missing FK constraints | DONE |

## Technical Details

### Implementation (2025-12-28)
**Migration:** `apps/foundry-dashboard/migrations/0018_data_integrity_fks.sql`

Added `FOREIGN KEY` constraints via table recreation (standard SQLite pattern) for:
- `training_samples(client_id)` -> `clients(id)`
- `brand_dna(client_id)` -> `clients(id)`
- `hubs(client_id)` -> `clients(id)`
- `extracted_pillars(hub_id)` -> `hubs(id)`
- `extracted_pillars(client_id)` -> `clients(id)`

All relationships now support `ON DELETE CASCADE` ensuring that deleting a client cleans up all their related data automatically.

## Tasks

- [x] Identify all orphaned records
- [x] Create migration for FK constraint (0018_data_integrity_fks.sql)
- [x] Audit all tables for missing FKs
- [x] Test cascade behavior (via SQL script verification)
- [x] Document FK relationships

## File List
- `apps/foundry-dashboard/migrations/0018_data_integrity_fks.sql`
- `apps/foundry-dashboard/migrations/0018_data_integrity_fks_rollback.sql`

## Change Log
| Date | Change |
|------|--------|
| 2025-12-28 | Story created from codebase audit findings |
| 2025-12-28 | Implemented critical foreign key constraints for multi-tenant data integrity. |
| 2025-12-29 | Code review fixes: Added down migration for AC3, added indexes on FK columns, documented PRAGMA requirement |

## Code Review (2025-12-29)

### Review Outcome: PASS (with fixes applied)

**Issues Found & Fixed:**
1. ✅ **AC3 Violation Fixed**: Added `0018_data_integrity_fks_rollback.sql` for reversible migration
2. ✅ **Performance**: Added indexes on all FK columns (`client_id`, `user_id`, `hub_id`, `source_id`)
3. ✅ **Documentation**: Added PRAGMA foreign_keys warning comment in migration header

**Verified:**
- `user` table reference is correct (matches `0001_better_auth_schema.sql`)
- All FK constraints properly defined with CASCADE DELETE
