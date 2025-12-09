import { DrizzleD1Database } from "drizzle-orm/d1";
import { userCredits } from "../schema";
import { eq, sql } from "drizzle-orm";

export async function deductCredits(
    db: DrizzleD1Database<any>,
    userId: string,
    amount: number
) {
    // Upsert logic: ensure record exists, then decrement
    // Since we want to decrement, we can use an upsert or just update if we assume the user always has a record.
    // Ideally we should transactionally check balance, but for now we will just decrement.

    // Check if record exists, if not create with 0 (which will go negative, logic for another day) or 10 default

    return await db
        .insert(userCredits)
        .values({
            userId,
            balance: -amount, // If new record, start with negative balance (debt) or default
            lastRefilledAt: new Date(),
        })
        .onConflictDoUpdate({
            target: userCredits.userId,
            set: {
                balance: sql`${userCredits.balance} - ${amount}`,
            },
        })
        .returning();
}
