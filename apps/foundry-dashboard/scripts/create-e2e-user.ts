/**
 * Create E2E Test User
 *
 * This script creates a test user for E2E testing in the local D1 database.
 * Run with: npx tsx scripts/create-e2e-user.ts
 */

import { execSync } from 'child_process';
import * as crypto from 'crypto';

// Test user credentials
const TEST_EMAIL = 'e2e-test@foundry.local';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'E2E Test User';

// Generate IDs
const userId = crypto.randomUUID();
const accountId = crypto.randomUUID();
const credentialAccountId = crypto.randomUUID();

// Current timestamp in milliseconds
const now = Date.now();

// Hash password using scrypt (compatible with Better Auth's default)
// Better Auth uses bcrypt by default, but we can also use a simple hash for testing
// For Better Auth compatibility, we'll create the hash in the expected format
async function hashPassword(password: string): Promise<string> {
  // Better Auth uses bcrypt format: $2a$10$...
  // For local testing, we'll use a simpler approach and let Better Auth handle it
  // Actually, Better Auth 1.x uses scrypt or bcrypt depending on config

  // Let's use the node:crypto scrypt which is what Better Auth can use
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      // Format: salt:hash (hex encoded)
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function main() {
  console.log('Creating E2E test user...');
  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`User ID: ${userId}`);
  console.log(`Account ID: ${accountId}`);

  // Hash the password
  const hashedPassword = await hashPassword(TEST_PASSWORD);
  console.log(`Password hashed: ${hashedPassword.substring(0, 20)}...`);

  // SQL to insert user
  const insertUserSQL = `
    INSERT OR REPLACE INTO user (id, name, email, email_verified, created_at, updated_at, account_id, role, credits)
    VALUES ('${userId}', '${TEST_NAME}', '${TEST_EMAIL}', 1, ${now}, ${now}, '${accountId}', 'admin', 100);
  `.trim().replace(/\n/g, ' ');

  // SQL to insert account (credential provider for email/password)
  const insertAccountSQL = `
    INSERT OR REPLACE INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
    VALUES ('${credentialAccountId}', '${accountId}', 'credential', '${userId}', '${hashedPassword}', ${now}, ${now});
  `.trim().replace(/\n/g, ' ');

  console.log('\nExecuting SQL...');

  try {
    // Insert user
    execSync(
      `npx wrangler d1 execute foundry-global-local --local --command="${insertUserSQL}"`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
    console.log('✅ User created');

    // Insert account
    execSync(
      `npx wrangler d1 execute foundry-global-local --local --command="${insertAccountSQL}"`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
    console.log('✅ Account created');

    // Verify
    console.log('\nVerifying user exists...');
    execSync(
      `npx wrangler d1 execute foundry-global-local --local --command="SELECT id, email, name FROM user WHERE email = '${TEST_EMAIL}';"`,
      { stdio: 'inherit', cwd: process.cwd() }
    );

    console.log('\n✅ E2E test user created successfully!');
    console.log('\nCredentials:');
    console.log(`  Email: ${TEST_EMAIL}`);
    console.log(`  Password: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
}

main();
