import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const generations = sqliteTable("generations", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(), // 'tweet', 'image', 'video_script'
    status: text("status").notNull(), // 'queued', 'processing', 'completed', 'failed'
    prompt: text("prompt").notNull(),
    output: text("output"), // The generated content or R2 URL
    modelUsed: text("model_used"), // 'gpt-4o', 'flux-1'
    createdAt: integer("created_at", { mode: "timestamp" })
        .default(sql`(unixepoch())`)
        .notNull(),
});

export const userCredits = sqliteTable("user_credits", {
    userId: text("user_id").primaryKey().notNull(),
    balance: integer("balance").default(0).notNull(),
    lastRefilledAt: integer("last_refilled_at", { mode: "timestamp" }),
});
