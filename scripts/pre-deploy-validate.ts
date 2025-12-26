#!/usr/bin/env npx tsx
/**
 * Pre-Deploy Validation Script
 *
 * Catches configuration and build errors BEFORE deployment:
 * 1. TypeScript type checking
 * 2. Wrangler config validation
 * 3. Service binding validation (no commented-out bindings)
 * 4. Package export validation (all imports resolve)
 * 5. Build validation
 *
 * Usage:
 *   pnpm predeploy:validate [environment]
 *   pnpm predeploy:validate stage
 *   pnpm predeploy:validate production
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const env = process.argv[2] || 'stage';

interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function logSection(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function exec(cmd: string, cwd: string = ROOT): string {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' });
  } catch (error: any) {
    return error.stdout || error.stderr || error.message;
  }
}

function execCheck(cmd: string, cwd: string = ROOT): boolean {
  try {
    execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 1. TypeScript Type Checking
// ============================================================
function checkTypeScript(): ValidationResult {
  logSection('TypeScript Type Checking');

  const apps = ['foundry-dashboard', 'foundry-engine'];
  const packages = ['foundry-core', 'agent-logic', 'agent-system'];
  const errors: string[] = [];

  for (const app of apps) {
    const appPath = join(ROOT, 'apps', app);
    if (!existsSync(appPath)) continue;

    log('🔍', `Checking ${app}...`);
    const output = exec('npx tsc --noEmit 2>&1', appPath);
    if (output.includes('error TS')) {
      errors.push(`${app}: ${output.split('\n').filter(l => l.includes('error TS')).slice(0, 3).join('\n')}`);
    } else {
      log('✅', `${app} passed`);
    }
  }

  for (const pkg of packages) {
    const pkgPath = join(ROOT, 'packages', pkg);
    if (!existsSync(pkgPath)) continue;
    if (!existsSync(join(pkgPath, 'tsconfig.json'))) continue;

    log('🔍', `Checking @repo/${pkg}...`);
    const output = exec('npx tsc --noEmit 2>&1', pkgPath);
    if (output.includes('error TS')) {
      errors.push(`@repo/${pkg}: ${output.split('\n').filter(l => l.includes('error TS')).slice(0, 3).join('\n')}`);
    } else {
      log('✅', `@repo/${pkg} passed`);
    }
  }

  return {
    check: 'TypeScript',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All type checks passed' : `${errors.length} type errors found`,
    details: errors,
  };
}

// ============================================================
// 2. Wrangler Config Validation
// ============================================================
function checkWranglerConfigs(): ValidationResult {
  logSection('Wrangler Config Validation');

  const apps = ['foundry-dashboard', 'foundry-engine'];
  const errors: string[] = [];

  for (const app of apps) {
    const appPath = join(ROOT, 'apps', app);
    const configPath = join(appPath, 'wrangler.jsonc');

    if (!existsSync(configPath)) {
      log('⚠️', `${app}: No wrangler.jsonc found`);
      continue;
    }

    log('🔍', `Validating ${app} wrangler config...`);

    // Check if environment exists
    const configContent = readFileSync(configPath, 'utf-8');

    // Remove comments for JSON parsing
    const jsonContent = configContent
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    try {
      const config = JSON.parse(jsonContent);

      if (!config.env?.[env]) {
        errors.push(`${app}: Missing "${env}" environment configuration`);
        log('❌', `${app}: Missing "${env}" environment`);
      } else {
        log('✅', `${app}: "${env}" environment exists`);
      }
    } catch (e: any) {
      errors.push(`${app}: Invalid JSON in wrangler.jsonc - ${e.message}`);
      log('❌', `${app}: Invalid JSON`);
    }
  }

  return {
    check: 'Wrangler Config',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All wrangler configs valid' : `${errors.length} config errors`,
    details: errors,
  };
}

// ============================================================
// 3. Service Binding Validation
// ============================================================
function checkServiceBindings(): ValidationResult {
  logSection('Service Binding Validation');

  const errors: string[] = [];
  const warnings: string[] = [];

  const dashboardConfig = join(ROOT, 'apps/foundry-dashboard/wrangler.jsonc');

  if (existsSync(dashboardConfig)) {
    const content = readFileSync(dashboardConfig, 'utf-8');

    // Check for commented-out service bindings
    const commentedServices = content.match(/\/\/.*"service".*|\/\/.*"binding".*CONTENT_ENGINE.*/g);
    if (commentedServices && commentedServices.length > 0) {
      errors.push(`foundry-dashboard: CONTENT_ENGINE service binding is commented out for ${env}`);
      log('❌', 'CONTENT_ENGINE binding is commented out!');
    }

    // Parse and check if services exist in env
    const jsonContent = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    try {
      const config = JSON.parse(jsonContent);
      const envConfig = config.env?.[env];

      if (envConfig) {
        if (!envConfig.services || envConfig.services.length === 0) {
          errors.push(`foundry-dashboard: No services configured for "${env}" - CONTENT_ENGINE missing`);
          log('❌', `No services in ${env} environment`);
        } else {
          const hasContentEngine = envConfig.services.some((s: any) => s.binding === 'CONTENT_ENGINE');
          if (!hasContentEngine) {
            errors.push(`foundry-dashboard: CONTENT_ENGINE service not found in "${env}"`);
            log('❌', 'CONTENT_ENGINE not configured');
          } else {
            log('✅', 'CONTENT_ENGINE service binding configured');
          }
        }

        // Check D1 database
        if (!envConfig.d1_databases || envConfig.d1_databases.length === 0) {
          warnings.push(`foundry-dashboard: No D1 database configured for "${env}"`);
          log('⚠️', 'No D1 database configured');
        } else {
          log('✅', 'D1 database configured');
        }
      }
    } catch (e) {
      // Already handled in wrangler config check
    }
  }

  // Check foundry-engine has all required bindings
  const engineConfig = join(ROOT, 'apps/foundry-engine/wrangler.jsonc');

  if (existsSync(engineConfig)) {
    const content = readFileSync(engineConfig, 'utf-8');
    const jsonContent = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');

    try {
      const config = JSON.parse(jsonContent);
      const envConfig = config.env?.[env];

      if (envConfig) {
        const requiredBindings = ['durable_objects', 'workflows', 'ai', 'vectorize', 'r2_buckets', 'd1_databases', 'queues'];
        const missing = requiredBindings.filter(b => !envConfig[b]);

        if (missing.length > 0) {
          errors.push(`foundry-engine: Missing bindings in "${env}": ${missing.join(', ')}`);
          log('❌', `Missing bindings: ${missing.join(', ')}`);
        } else {
          log('✅', 'All required bindings present in foundry-engine');
        }
      }
    } catch (e) {
      // Already handled
    }
  }

  return {
    check: 'Service Bindings',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All service bindings configured' : `${errors.length} binding errors`,
    details: [...errors, ...warnings.map(w => `[WARNING] ${w}`)],
  };
}

// ============================================================
// 4. Package Export Validation
// ============================================================
function checkPackageExports(): ValidationResult {
  logSection('Package Export Validation');

  const errors: string[] = [];

  // Check that all workspace package imports resolve
  const packages = [
    { name: '@repo/agent-logic', path: 'packages/agent-logic' },
    { name: '@repo/foundry-core', path: 'packages/foundry-core' },
    { name: '@repo/agent-system', path: 'packages/agent-system' },
  ];

  for (const pkg of packages) {
    const pkgJsonPath = join(ROOT, pkg.path, 'package.json');
    if (!existsSync(pkgJsonPath)) continue;

    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    const exports = pkgJson.exports || {};

    log('🔍', `Checking ${pkg.name} exports...`);

    // Find all imports of this package in the codebase
    const grepResult = exec(`grep -r "from '${pkg.name}" apps/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`);

    const importPaths = new Set<string>();
    const lines = grepResult.split('\n').filter(Boolean);

    for (const line of lines) {
      const match = line.match(new RegExp(`from '${pkg.name}(/[^']*)?'`));
      if (match) {
        const subpath = match[1] || '';
        const exportKey = subpath || '.';
        importPaths.add(exportKey);
      }
    }

    for (const importPath of importPaths) {
      const exportKey = importPath === '' ? '.' : `.${importPath}`;
      if (!exports[exportKey]) {
        errors.push(`${pkg.name}: Missing export "${exportKey}" in package.json`);
        log('❌', `Missing export: ${exportKey}`);
      } else {
        log('✅', `Export exists: ${exportKey}`);
      }
    }
  }

  return {
    check: 'Package Exports',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All package exports valid' : `${errors.length} missing exports`,
    details: errors,
  };
}

// ============================================================
// 5. Build Validation
// ============================================================
function checkBuild(): ValidationResult {
  logSection('Build Validation');

  const errors: string[] = [];

  // Try to build foundry-engine (the one that had the import error)
  log('🔍', 'Testing foundry-engine build...');

  const enginePath = join(ROOT, 'apps/foundry-engine');
  const buildOutput = exec(`npx wrangler deploy --dry-run --env ${env} 2>&1`, enginePath);

  if (buildOutput.includes('Build failed') || buildOutput.includes('Could not resolve')) {
    const errorLines = buildOutput.split('\n')
      .filter(l => l.includes('ERROR') || l.includes('Could not resolve'))
      .slice(0, 5);
    errors.push(`foundry-engine build failed:\n${errorLines.join('\n')}`);
    log('❌', 'foundry-engine build failed');
  } else {
    log('✅', 'foundry-engine builds successfully');
  }

  // Check dashboard build
  log('🔍', 'Testing foundry-dashboard build...');

  const dashboardPath = join(ROOT, 'apps/foundry-dashboard');
  const dashBuildOutput = exec('npx vite build 2>&1', dashboardPath);

  if (dashBuildOutput.includes('error') && !dashBuildOutput.includes('built in')) {
    errors.push(`foundry-dashboard build failed`);
    log('❌', 'foundry-dashboard build failed');
  } else {
    log('✅', 'foundry-dashboard builds successfully');
  }

  return {
    check: 'Build',
    passed: errors.length === 0,
    message: errors.length === 0 ? 'All builds pass' : `${errors.length} build errors`,
    details: errors,
  };
}

// ============================================================
// 6. Queue Existence Check
// ============================================================
function checkQueues(): ValidationResult {
  logSection('Queue Existence Check');

  const warnings: string[] = [];

  const requiredQueues = env === 'stage'
    ? ['spoke-generation-queue-stage', 'quality-gate-queue-stage']
    : ['spoke-generation-queue', 'quality-gate-queue'];

  log('🔍', 'Checking Cloudflare queues...');

  const queuesOutput = exec('npx wrangler queues list 2>&1');

  for (const queue of requiredQueues) {
    if (!queuesOutput.includes(queue)) {
      warnings.push(`Queue "${queue}" may not exist. Create with: npx wrangler queues create ${queue}`);
      log('⚠️', `Queue not found: ${queue}`);
    } else {
      log('✅', `Queue exists: ${queue}`);
    }
  }

  return {
    check: 'Queues',
    passed: true, // Warnings only, not blocking
    message: warnings.length === 0 ? 'All queues exist' : `${warnings.length} queue warnings`,
    details: warnings,
  };
}

// ============================================================
// Main
// ============================================================
async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         PRE-DEPLOY VALIDATION - ${env.toUpperCase().padEnd(20)}       ║
╚════════════════════════════════════════════════════════════╝
`);

  results.push(checkTypeScript());
  results.push(checkWranglerConfigs());
  results.push(checkServiceBindings());
  results.push(checkPackageExports());
  results.push(checkBuild());
  results.push(checkQueues());

  // Summary
  logSection('VALIDATION SUMMARY');

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  console.log('');
  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.check}: ${result.message}`);
    if (result.details && result.details.length > 0 && !result.passed) {
      for (const detail of result.details.slice(0, 3)) {
        console.log(`   └─ ${detail}`);
      }
      if (result.details.length > 3) {
        console.log(`   └─ ... and ${result.details.length - 3} more`);
      }
    }
  }

  console.log('');
  console.log('─'.repeat(60));

  if (failed.length === 0) {
    console.log(`
✅ ALL CHECKS PASSED - Ready to deploy to ${env}!

Run: pnpm foundry:deploy:${env}
`);
    process.exit(0);
  } else {
    console.log(`
❌ ${failed.length} CHECK(S) FAILED - Fix issues before deploying

Failed checks:
${failed.map(f => `  - ${f.check}: ${f.message}`).join('\n')}
`);
    process.exit(1);
  }
}

main().catch(console.error);
