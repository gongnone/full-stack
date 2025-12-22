const { eq } = require('drizzle-orm');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { sqliteTable, text, integer, uniqueIndex } = require('drizzle-orm/sqlite-core');
const { sql } = require('drizzle-orm');
const { DrizzleD1Database, drizzle } = require('drizzle-orm/d1');

// This is a minimal mock for a D1Database binding for local execution
class MockD1Database {
    constructor() {
        this.data = {};
    }

    async prepare(query) {
        return {
            bind: () => this,
            first: () => null,
            all: () => ({ results: [] }),
            run: () => ({ success: true }),
        };
    }
}

// Mock DrizzleD1Database interface for local execution
const initDatabase = (d1Binding) => {
    // Check if we are in a Worker environment (where D1 will be natively available)
    // or if we're running locally and need a mock.
    if (d1Binding && typeof d1Binding.prepare === 'function') {
        return drizzle(d1Binding, { schema: { user } });
    } else {
        // Fallback for local script execution outside of a Worker runtime
        console.warn("Using MockD1Database for local script execution. No actual database operations will occur.");
        return drizzle(new MockD1Database(), { schema: { user } });
    }
};


const user = sqliteTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: integer("email_verified").default(0).notNull(),
	image: text(),
	createdAt: integer("created_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	updatedAt: integer("updated_at").default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`).notNull(),
	stripeCustomerId: text("stripe_customer_id"),
	credits: integer().default(10).notNull(),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);


async function main() {
    const db = initDatabase(process.env.DB);
    
    const email = 'test@foundry.local';
    const password = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if user already exists
        const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
        if (existingUser) {
            console.log('Test user already exists!');
            return;
        }

        await db.insert(user).values({
            id: crypto.randomUUID(),
            name: 'Test User',
            email: email,
            password: hashedPassword,
            emailVerified: 1,
            credits: 10,
            createdAt: Math.floor(Date.now() / 1000),
            updatedAt: Math.floor(Date.now() / 1000),
        });
        console.log('Test user created successfully!');
    } catch (e) {
        console.error('Failed to create test user:', e);
    }
}

main();

