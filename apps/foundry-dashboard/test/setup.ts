import { env } from 'cloudflare:test';
import { applyD1Migrations } from 'cloudflare:test';
import { beforeAll } from 'vitest';

// Apply migrations before tests run
beforeAll(async () => {
  try {
    await applyD1Migrations(env.DB, env.migrations);
  } catch (e) {
    console.error('Failed to apply migrations:', e);
  }
});
