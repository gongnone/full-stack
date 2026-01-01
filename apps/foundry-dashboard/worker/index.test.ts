/**
 * Test-specific worker entry point
 *
 * This entry point excludes Durable Objects that have dependencies
 * incompatible with the vitest-pool-workers runtime (e.g., agents SDK with ajv).
 */
import { app } from './hono/app';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  CONTENT_ENGINE: Fetcher;
  MEDIA: R2Bucket;
  EMBEDDINGS: VectorizeIndex;
  ENVIRONMENT: string;
  AI: Ai;
  BRAND_DNA_AGENT: DurableObjectNamespace;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  EMAIL_FROM?: string;
  QUEUE: Queue;
}

// NOTE: BrandDNAAgent is NOT exported here to avoid agents SDK compatibility issues
// Integration tests should mock the BRAND_DNA_AGENT binding if needed

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
