/**
 * k6 Load Test: Hub Ingestion SLA Validation (NFR-P2)
 *
 * Tests the 30-second ingestion SLA for hub creation workflow.
 * Validates that text content extraction completes within the defined threshold.
 *
 * Run:
 *   k6 run load-tests/ingestion-sla.k6.js
 *
 * With environment variables:
 *   k6 run -e BASE_URL=https://foundry-stage.williamjshaw.ca \
 *          -e TEST_EMAIL=e2e-test@foundry.local \
 *          -e TEST_PASSWORD=TestPassword123! \
 *          load-tests/ingestion-sla.k6.js
 *
 * @tags @load @nfr @ingestion @P0
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics for NFR-P2 tracking
const ingestionDuration = new Trend('ingestion_duration_ms', true);
const slaCompliance = new Rate('sla_compliance');
const ingestionFailures = new Counter('ingestion_failures');
const extractionSuccess = new Rate('extraction_success');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'e2e-test@foundry.local';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'TestPassword123!';
const INGESTION_SLA_MS = 30000; // 30 seconds per NFR-P2
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 20; // 40 seconds max wait

// Test content that will be extracted
const TEST_CONTENT = `
This is load test content for validating the Foundry hub ingestion SLA.

The purpose of this content is to measure the time taken to:
1. Accept text input through the API
2. Create a source record in the D1 database
3. Trigger the hub-ingestion Cloudflare Workflow
4. Extract meaningful pillars using Workers AI
5. Store pillars in the database with proper relationships

Key themes for extraction:
- Content automation and AI-powered generation
- Multi-platform publishing strategies
- Brand voice consistency across channels
- Audience engagement optimization
- Performance metrics and analytics

This content should be rich enough for the AI to extract 3-4 thematic pillars.
Each pillar represents a core topic that can be turned into social media content.
The minimum character requirement is 100, but we include more for robust extraction.

Additional context about content strategy, brand development, and workflow design
helps ensure the extraction process has sufficient material to analyze.

Generated at: ${new Date().toISOString()}
`.trim();

// Load test options
export const options = {
  scenarios: {
    // Baseline: Single user validation
    baseline: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 1,
      startTime: '0s',
      tags: { scenario: 'baseline' },
    },
    // Load test: 5 concurrent users over 2 minutes
    load: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      startTime: '10s',
      tags: { scenario: 'load' },
    },
    // Stress test: Ramp up to 10 users
    stress: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      startTime: '3m',
      tags: { scenario: 'stress' },
    },
  },
  thresholds: {
    // NFR-P2: 95% of ingestions must complete within 30 seconds
    'ingestion_duration_ms': ['p95<30000'],
    // At least 95% of requests should meet SLA
    'sla_compliance': ['rate>0.95'],
    // Extraction success rate should be high
    'extraction_success': ['rate>0.90'],
    // HTTP request duration should be reasonable
    'http_req_duration': ['p95<5000'],
  },
};

// Helper to get auth session
function login() {
  const loginPayload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/api/auth/sign-in/email`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has session cookie': (r) => r.cookies['better-auth.session_token'] !== undefined,
  });

  if (loginRes.status !== 200) {
    console.error(`Login failed: ${loginRes.status} ${loginRes.body}`);
    return null;
  }

  return loginRes.cookies;
}

// Helper to make authenticated tRPC calls
function trpcCall(cookies, procedure, input) {
  const cookieStr = Object.entries(cookies)
    .map(([name, values]) => `${name}=${values[0].value}`)
    .join('; ');

  const res = http.post(
    `${BASE_URL}/api/trpc/${procedure}`,
    JSON.stringify(input),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStr,
      },
    }
  );

  if (res.status !== 200) {
    console.error(`tRPC ${procedure} failed: ${res.status} ${res.body}`);
    return null;
  }

  try {
    return JSON.parse(res.body);
  } catch (e) {
    console.error(`Failed to parse tRPC response: ${res.body}`);
    return null;
  }
}

// Main test function
export default function () {
  const startTime = Date.now();

  // Step 1: Login
  const cookies = login();
  if (!cookies) {
    ingestionFailures.add(1);
    return;
  }

  // Step 2: Get clientId
  const meResult = trpcCall(cookies, 'auth.me', {});
  if (!meResult?.result?.data?.clientId) {
    console.error('Failed to get clientId');
    ingestionFailures.add(1);
    return;
  }
  const clientId = meResult.result.data.clientId;

  // Step 3: Create source and trigger extraction
  const extractionStart = Date.now();
  const extractResult = trpcCall(cookies, 'hubs.extract', {
    clientId,
    sourceType: 'text',
    title: `Load Test Hub ${Date.now()}`,
    content: TEST_CONTENT,
  });

  if (!extractResult?.result?.data?.sourceId) {
    console.error('Failed to create source');
    ingestionFailures.add(1);
    return;
  }
  const sourceId = extractResult.result.data.sourceId;
  console.log(`Created source: ${sourceId}`);

  // Step 4: Poll for extraction completion
  let extractionComplete = false;
  let pillars = [];
  let attempts = 0;

  while (!extractionComplete && attempts < MAX_POLL_ATTEMPTS) {
    sleep(POLL_INTERVAL_MS / 1000);
    attempts++;

    const pillarsResult = trpcCall(cookies, 'hubs.getPillars', {
      sourceId,
      clientId,
    });

    if (pillarsResult?.result?.data?.pillars?.length >= 3) {
      extractionComplete = true;
      pillars = pillarsResult.result.data.pillars;
    } else if (pillarsResult?.result?.data?.error) {
      console.error(`Extraction error: ${pillarsResult.result.data.error}`);
      break;
    }
  }

  const extractionDuration = Date.now() - extractionStart;

  // Record metrics
  ingestionDuration.add(extractionDuration);

  const withinSla = extractionDuration <= INGESTION_SLA_MS;
  slaCompliance.add(withinSla);

  if (extractionComplete) {
    extractionSuccess.add(1);
    console.log(`Extraction completed in ${extractionDuration}ms with ${pillars.length} pillars (SLA: ${withinSla ? 'PASS' : 'FAIL'})`);
  } else {
    extractionSuccess.add(0);
    ingestionFailures.add(1);
    console.error(`Extraction failed or timed out after ${extractionDuration}ms`);
  }

  // Validation checks
  check(null, {
    'extraction completed': () => extractionComplete,
    'within 30s SLA': () => withinSla,
    'has 3+ pillars': () => pillars.length >= 3,
  });

  // Total test duration
  const totalDuration = Date.now() - startTime;
  console.log(`Total test iteration: ${totalDuration}ms`);
}

// Summary handler
export function handleSummary(data) {
  const p95 = data.metrics.ingestion_duration_ms?.values?.['p(95)'] || 0;
  const slaRate = data.metrics.sla_compliance?.values?.rate || 0;
  const successRate = data.metrics.extraction_success?.values?.rate || 0;

  const summary = {
    timestamp: new Date().toISOString(),
    nfr: 'NFR-P2',
    slaThresholdMs: INGESTION_SLA_MS,
    results: {
      p95DurationMs: Math.round(p95),
      slaComplianceRate: (slaRate * 100).toFixed(2) + '%',
      extractionSuccessRate: (successRate * 100).toFixed(2) + '%',
      totalIterations: data.metrics.iterations?.values?.count || 0,
      failures: data.metrics.ingestion_failures?.values?.count || 0,
    },
    verdict: p95 <= INGESTION_SLA_MS && slaRate >= 0.95 ? 'PASS' : 'FAIL',
  };

  console.log('\n=== NFR-P2 INGESTION SLA ASSESSMENT ===');
  console.log(JSON.stringify(summary, null, 2));

  return {
    'stdout': JSON.stringify(summary, null, 2),
    'load-tests/ingestion-sla-results.json': JSON.stringify(summary, null, 2),
  };
}
