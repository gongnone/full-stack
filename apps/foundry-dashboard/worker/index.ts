import { app } from './hono/app';

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  CONTENT_ENGINE: Fetcher;
  MEDIA: R2Bucket;
  EMBEDDINGS: VectorizeIndex;
  ENVIRONMENT: string;
  // Workers AI (Story 2.2: Voice-to-Grounding)
  AI: Ai;
  // Better Auth
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  // OAuth providers (optional)
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  // AWS SES for email (Story 9.4)
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  EMAIL_FROM?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
