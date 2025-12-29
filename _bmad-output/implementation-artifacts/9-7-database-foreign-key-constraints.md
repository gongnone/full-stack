# Story 9.7: Database Foreign Key Constraints

## Status: ready-for-dev

## Story Summary
Add missing foreign key constraints to database tables. The `training_samples` table is missing FK on `client_id`, which can lead to orphaned records.

## Business Value
Data integrity is critical for a multi-tenant system. Missing foreign keys can cause orphaned data, inconsistent state, and potential data leaks across clients.

## Acceptance Criteria

| AC | Description | Status |
|----|-------------|--------|
| AC1 | `training_samples.client_id` has FK to `clients.id` with CASCADE DELETE | TODO |
| AC2 | All existing orphaned records cleaned up | TODO |
| AC3 | Migration is reversible (down migration) | TODO |
| AC4 | All tables audited for missing FK constraints | TODO |

## Technical Details

### Current Problem
**File:** `apps/foundry-dashboard/migrations/0004_training_samples.sql:9`

```sql
-- TODO: Add FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
```

### Required Migration
```sql
-- Up migration
ALTER TABLE training_samples
ADD CONSTRAINT fk_training_samples_client
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Down migration
ALTER TABLE training_samples
DROP CONSTRAINT fk_training_samples_client;
```

### Tables to Audit
- [ ] training_samples
- [ ] hubs
- [ ] spokes
- [ ] brand_dna
- [ ] share_links
- [ ] client_members

## Tasks

- [ ] Identify all orphaned training_samples records
- [ ] Delete or fix orphaned records
- [ ] Create migration for FK constraint
- [ ] Audit all tables for missing FKs
- [ ] Create additional migrations as needed
- [ ] Test cascade behavior
- [ ] Document FK relationships

## File List
(To be updated during implementation)

## Change Log
| Date | Change |
|------|--------|
| 2025-12-28 | Story created from codebase audit findings |
