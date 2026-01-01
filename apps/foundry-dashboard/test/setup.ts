import { env } from 'cloudflare:test';
import { beforeAll } from 'vitest';

// Migrations are read in vitest.integration.config.ts and passed via TEST_MIGRATIONS binding
declare module 'cloudflare:test' {
  interface ProvidedEnv {
    TEST_MIGRATIONS: unknown;
  }
}

// Split SQL content into individual statements, handling inline comments
function splitSqlStatements(content: string): string[] {
  // First, remove all SQL comments while preserving newlines
  let stripped = '';
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    const next = content[i + 1];

    // Check for -- comment
    if (char === '-' && next === '-') {
      // Skip to end of line
      while (i < content.length && content[i] !== '\n') {
        i++;
      }
      // Keep the newline
      if (content[i] === '\n') {
        stripped += '\n';
        i++;
      }
      continue;
    }

    stripped += char;
    i++;
  }

  // Split on semicolons
  const statements = stripped
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return statements;
}

beforeAll(async () => {
  // Apply migrations from raw SQL content
  const migrations = env.TEST_MIGRATIONS as Array<{ name: string; content: string }>;

  for (const migration of migrations) {
    const statements = splitSqlStatements(migration.content);
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      if (sql.length === 0) continue;
      try {
        // Use prepare().run() instead of exec() for single statements
        await env.DB.prepare(sql).run();
      } catch (e) {
        const msg = (e as Error).message;
        // Ignore "already exists" errors for idempotent migrations
        if (!msg.includes('already exists') && !msg.includes('duplicate column')) {
          console.error(`Migration ${migration.name} statement ${i} failed:`, msg);
          console.error('SQL:', sql.substring(0, 200));
          throw e;
        }
      }
    }
  }
});
