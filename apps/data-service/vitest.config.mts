import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.jsonc' },
			},
		},
	},
	resolve: {
		alias: {
			'@repo/agent-system': path.resolve(__dirname, '../../packages/agent-system/src'),
			'@repo/agent-logic': path.resolve(__dirname, '../../packages/agent-logic/src'),
			'@repo/agent-logic/rag': path.resolve(__dirname, '../../packages/agent-logic/src/rag.ts'),
			'@repo/data-ops/database': path.resolve(__dirname, '../../packages/data-ops/src/db/database.ts'),
			'@repo/data-ops/schema': path.resolve(__dirname, '../../packages/data-ops/src/schema.ts'),
			'@repo/foundry-core': path.resolve(__dirname, '../../packages/foundry-core/src'),
			'@': path.resolve(__dirname, './src'),
		},
	},
});
