/**
 * Database initialization for Foundry Dashboard
 *
 * This is a local implementation replacing the @repo/data-ops dependency
 * to maintain architecture isolation between Foundry and Legacy systems.
 */
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Initialize Drizzle ORM with D1 database
 */
export function initDatabase(d1: D1Database): DrizzleD1Database<typeof schema> {
  return drizzle(d1, { schema });
}

export type { DrizzleD1Database };