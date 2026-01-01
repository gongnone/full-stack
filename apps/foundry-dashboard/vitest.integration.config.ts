import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';
import fs from 'fs';

export default defineWorkersConfig(async () => {
  // Read migration SQL files directly as raw text
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  const migrations = migrationFiles.map(file => ({
    name: file,
    content: fs.readFileSync(path.join(migrationsDir, file), 'utf-8'),
  }));

  return {
    test: {
      globals: true,
      // defineWorkersConfig automatically sets up the workers pool
      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.jsonc',
            main: './worker/index.ts',
          },
          miniflare: {
            compatibilityDate: '2024-04-05',
            compatibilityFlags: ['nodejs_compat'],
            // Pass raw migration content as binding
            bindings: { TEST_MIGRATIONS: migrations },
          },
          singleWorker: true,
        },
      },
      include: ['worker/**/*.integration.test.ts'],
      exclude: ['src/**/*', 'node_modules/**'],
      setupFiles: ['./test/setup.ts'],
      testTimeout: 20000,
      // Handle CommonJS modules that need bundling for workerd
      deps: {
        optimizer: {
          web: {
            include: ['ajv', 'better-auth', 'defu', 'uri-js'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Stub out agents SDK to avoid ajv CommonJS issues in tests
        'agents': path.resolve(__dirname, './test/stubs/agents.ts'),
        '@modelcontextprotocol/sdk': path.resolve(__dirname, './test/stubs/mcp.ts'),
      },
    },
  };
});
