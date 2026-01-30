# D1 Database Migration Process

## Using Cloudflare MCP for Database Migrations

**ALWAYS use Cloudflare MCP server for D1 operations, NOT wrangler CLI or Playwright.**

### Steps to Run Migrations

1. **List available databases**:
```typescript
mcp__cloudflare-bindings__d1_databases_list()
```

2. **Execute SQL migration**:
```typescript
mcp__cloudflare-bindings__d1_database_query({
  database_id: "e35604ee-6e84-476f-a6ec-e6df6e12d81c", // foundry-global-stage
  sql: "CREATE TABLE IF NOT EXISTS table_name (...)"
})
```

3. **Verify table was created**:
```typescript
mcp__cloudflare-bindings__d1_database_query({
  database_id: "e35604ee-6e84-476f-a6ec-e6df6e12d81c",
  sql: "SELECT name FROM sqlite_master WHERE type='table'"
})
```

### Database IDs

| Environment | Database Name | UUID |
|-------------|---------------|------|
| Local | foundry-global-local | a7b557ad-e7c8-4e4a-8fb9-a517b09449f3 |
| Stage | foundry-global-stage | e35604ee-6e84-476f-a6ec-e6df6e12d81c |
| Production | foundry-global | bd287f3f-8147-49b5-9cae-466c60a975c6 |

### Why NOT to Use Other Methods

❌ **Wrangler CLI**: `wrangler d1 execute --remote` requires D1 API permissions on CLOUDFLARE_API_TOKEN, which may not be configured

❌ **Playwright**: Browser automation is slow, requires manual navigation, and is prone to session locks

✅ **Cloudflare MCP**: Direct API access, fast, reliable, works with existing CLOUDFLARE_API_TOKEN

### Example: Creating client_approved_pillars Table

```typescript
// Stage environment
mcp__cloudflare-bindings__d1_database_query({
  database_id: "e35604ee-6e84-476f-a6ec-e6df6e12d81c",
  sql: `CREATE TABLE IF NOT EXISTS client_approved_pillars (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    pillar_name TEXT NOT NULL,
    strategy_tags TEXT NOT NULL DEFAULT '[]',
    rationale TEXT,
    example_hook TEXT,
    is_active INTEGER DEFAULT 1,
    approved_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`
})
```

Result:
```json
{
  "success": true,
  "changed_db": true,
  "rows_written": 3
}
```

### Migration Verification

After running a migration, verify it worked:

```typescript
// Check table exists
mcp__cloudflare-bindings__d1_database_query({
  database_id: "e35604ee-6e84-476f-a6ec-e6df6e12d81c",
  sql: "SELECT sql FROM sqlite_master WHERE name='client_approved_pillars'"
})

// Check data can be inserted
mcp__cloudflare-bindings__d1_database_query({
  database_id: "e35604ee-6e84-476f-a6ec-e6df6e12d81c",
  sql: "SELECT COUNT(*) as count FROM client_approved_pillars"
})
```

### Common Issues

1. **"no such table" errors in E2E tests**
   - Solution: Run migration using Cloudflare MCP
   - Verify table exists before running tests

2. **API token permissions**
   - Cloudflare MCP works with standard CLOUDFLARE_API_TOKEN
   - No special D1 permissions needed (unlike wrangler)

3. **Browser session locks**
   - Don't use Playwright for D1 operations
   - Use Cloudflare MCP instead

### Best Practices

1. Always use `CREATE TABLE IF NOT EXISTS` for idempotent migrations
2. Test migrations on `foundry-global-stage` before production
3. Verify table structure matches expectations after migration
4. Run E2E tests after migration to confirm fixes
