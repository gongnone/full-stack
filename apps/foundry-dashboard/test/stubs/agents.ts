/**
 * Stub for agents SDK to avoid ajv CommonJS compatibility issues in tests.
 * The agents SDK has transitive dependencies (MCP SDK -> ajv) that don't work in workerd.
 */

export class Agent {
  sql: any;
  ctx: any;

  constructor(_state: any, _env: any) {
    this.sql = null;
    this.ctx = null;
  }

  async fetch(_request: Request): Promise<Response> {
    return new Response('stub', { status: 501 });
  }
}

export interface Connection {
  send(message: string): void;
  close(): void;
}

export interface ConnectionContext {
  request: Request;
}

export type { Agent as default };
