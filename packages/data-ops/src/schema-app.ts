import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./drizzle-out/auth-schema";

const timestamps = {
    createdAt: integer("created_at", { mode: "timestamp" })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
};

// ----------------------------------------------------------------------------
// GLOBAL CONTEXT (User Level)
// ----------------------------------------------------------------------------

export const brandPillars = sqliteTable("brand_pillars", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // e.g., "Personal Brand", "Agency Brand"
    voiceTone: text("voice_tone"), // e.g., "Professional yet witty"
    pillars: text("pillars", { mode: "json" }).notNull(), // JSON array of pillars
    targetAudience: text("target_audience"), // General audience description
    ...timestamps,
});

// ----------------------------------------------------------------------------
// PROJECT CONTEXT (Campaign Level)
// ----------------------------------------------------------------------------

export const projects = sqliteTable("projects", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status", { enum: ["draft", "active", "archived"] }).default("draft"),
    ...timestamps,
});

export const marketResearch = sqliteTable("market_research", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id") // Redundant but useful for direct lookups
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    competitors: text("competitors", { mode: "json" }), // JSON array
    painPoints: text("pain_points", { mode: "json" }), // JSON array
    desires: text("desires", { mode: "json" }), // JSON array
    rawAnalysis: text("raw_analysis"), // The full AI dump
    ...timestamps,
});

export const offers = sqliteTable("offers", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    pricePoint: text("price_point"),
    deliverables: text("deliverables", { mode: "json" }),
    status: text("status", { enum: ["generated", "refined", "approved"] }).default("generated"),
    ...timestamps,
});

export const contentIdeas = sqliteTable("content_ideas", {
    id: text("id").primaryKey(),
    projectId: text("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    offerId: text("offer_id").references(() => offers.id),
    title: text("title").notNull(),
    hook: text("hook"),
    angle: text("angle"), // e.g., "Contrarian", "Educational"
    format: text("format", { enum: ["video", "text", "carousel"] }).notNull(),
    platform: text("platform", { enum: ["linkedin", "twitter", "instagram", "tiktok"] }).notNull(),
    status: text("status", { enum: ["idea", "scripted", "posted"] }).default("idea"),
    ...timestamps,
});

export const posts = sqliteTable("posts", {
    id: text("id").primaryKey(),
    contentIdeaId: text("content_idea_id")
        .notNull()
        .references(() => contentIdeas.id, { onDelete: "cascade" }),
    version: integer("version").default(1),
    content: text("content").notNull(), // The actual script or body
    mediaPrompt: text("media_prompt"), // If we generate image prompts
    ...timestamps,
});
