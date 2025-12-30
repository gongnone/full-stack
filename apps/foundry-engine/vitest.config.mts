import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.test.jsonc' },
			},
		},
	},
	resolve: {
		alias: {
			'@repo/agent-system': path.resolve(__dirname, '../../packages/agent-system/src'),
			'@repo/agent-logic': path.resolve(__dirname, '../../packages/agent-logic/src'),
			'@repo/foundry-core': path.resolve(__dirname, '../../packages/foundry-core/src'),
			'@': path.resolve(__dirname, './src'),
		},
	},
});
