import { DrizzleD1Database } from "drizzle-orm/d1";
import { generations } from "../schema";
import { CreateGenerationInput } from "../zod/generations";
import { nanoid } from "nanoid";

export async function createGenerationRecord(
    db: DrizzleD1Database<any>,
    userId: string,
    data: CreateGenerationInput
) {
    const id = nanoid();
    const result = await db
        .insert(generations)
        .values({
            id,
            userId,
            type: data.type,
            status: "queued",
            prompt: data.prompt,
            modelUsed: data.model,
        })
        .returning();

    return result[0];
}

export async function getRecentGenerations(
    db: DrizzleD1Database<any>,
    userId: string,
    limit = 10
) {
    // Import desq and eq here to avoid circular dependencies if any
    const { desc, eq } = await import("drizzle-orm");
    return await db
        .select()
        .from(generations)
        .where(eq(generations.userId, userId))
        .orderBy(desc(generations.createdAt))
        .limit(limit);
}

export async function updateGeneration(
    db: DrizzleD1Database<any>,
    id: string,
    data: Partial<typeof generations.$inferInsert>
) {
    const { eq } = await import("drizzle-orm");
    return await db
        .update(generations)
        .set(data)
        .where(eq(generations.id, id))
        .returning();
}
