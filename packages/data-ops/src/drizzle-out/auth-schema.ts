import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(0).notNull(),
	image: text(),
	accountId: text("account_id"),
	createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
	updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	credits: integer().default(10).notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const session = sqliteTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
	token: text().notNull(),
	createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
	updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
},
(table) => [
	index("session_userId_idx").on(table.userId),
	uniqueIndex("session_token_unique").on(table.token),
]);

export const account = sqliteTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: integer("access_token_expires_at", { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: 'timestamp' }),
	scope: text(),
	password: text(),
	createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
	updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
},
(table) => [
	index("account_userId_idx").on(table.userId),
]);

export const verification = sqliteTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
	createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
	updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
},
(table) => [
	index("verification_identifier_idx").on(table.identifier),
]);

export const subscription = sqliteTable("subscription", {
	id: text().primaryKey().notNull(),
	plan: text().notNull(),
	referenceId: text("reference_id").notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	stripeSubscriptionId: text("stripe_subscription_id"),
	status: text().default("incomplete"),
	periodStart: integer("period_start", { mode: 'timestamp' }),
	periodEnd: integer("period_end", { mode: 'timestamp' }),
	cancelAtPeriodEnd: integer("cancel_at_period_end").default(0),
	seats: integer(),
});
