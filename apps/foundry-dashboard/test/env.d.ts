import { D1Database, R2Bucket, KVNamespace, Fetcher } from '@cloudflare/workers-types';

declare module 'cloudflare:test' {
  interface ProvidedEnv {
    DB: D1Database;
    ASSETS: R2Bucket;
    KV: KVNamespace;
    QUEUE: Fetcher;
    AI: Fetcher;
  }
}
