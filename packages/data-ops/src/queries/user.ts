import { eq } from "drizzle-orm";
import { user } from "../drizzle-out/auth-schema";
import { DrizzleD1Database } from "drizzle-orm/d1";

// We use 'any' for the schema generic to avoid circular dependency or complex types,
// ensuring it works with any Drizzle instance initialized with the right driver.
export async function getUserCredits(db: DrizzleD1Database<any>, userId: string) {
    const result = await db
        .select({ credits: user.credits })
        .from(user)
        .where(eq(user.id, userId))
        .get();
    return result?.credits ?? 0;
}
