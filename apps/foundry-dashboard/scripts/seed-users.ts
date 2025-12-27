/**
 * Seed Users Script for Foundry Dashboard
 *
 * Creates test users via the Better Auth signup API endpoint.
 * Run this against stage environment for testing.
 *
 * Usage:
 *   npx tsx scripts/seed-users.ts
 *
 * Default passwords (12+ chars as required):
 *   - Admin: AdminPass123!
 *   - Standard: UserPass123!
 */

const BASE_URL = process.env.BASE_URL || 'https://foundry-stage.williamjshaw.ca';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
}

const seedUsers: SeedUser[] = [
  {
    name: 'Admin User',
    email: 'admin@foundry.test',
    password: 'AdminPass123!',
    role: 'admin',
  },
  {
    name: 'Standard User',
    email: 'user@foundry.test',
    password: 'UserPass123!',
    role: 'editor',
  },
];

async function createUser(user: SeedUser): Promise<boolean> {
  try {
    // Sign up via Better Auth API
    const signupRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        password: user.password,
      }),
    });

    if (!signupRes.ok) {
      const error = await signupRes.text();
      if (error.includes('already exists') || error.includes('USER_ALREADY_EXISTS')) {
        console.log(`⏭️  User ${user.email} already exists`);
        return true;
      }
      console.error(`❌ Failed to create ${user.email}: ${error}`);
      return false;
    }

    console.log(`✅ Created user: ${user.email} (${user.role})`);
    return true;
  } catch (err) {
    console.error(`❌ Error creating ${user.email}:`, err);
    return false;
  }
}

async function main() {
  console.log(`\n🌱 Seeding users to ${BASE_URL}\n`);

  let success = 0;
  for (const user of seedUsers) {
    if (await createUser(user)) success++;
  }

  console.log(`\n✨ Seeded ${success}/${seedUsers.length} users`);
  console.log(`\n📋 Test Credentials:`);
  console.log(`   Admin:    admin@foundry.test / AdminPass123!`);
  console.log(`   Standard: user@foundry.test / UserPass123!\n`);
}

main().catch(console.error);
