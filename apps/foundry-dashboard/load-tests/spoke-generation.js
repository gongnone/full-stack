/* eslint-disable no-undef */
/**
 * k6 Load Test: Spoke Generation Performance (NFR-P3)
 *
 * Tests spoke generation SLA: <60 seconds for 95th percentile
 *
 * Run:
 *   k6 run load-tests/spoke-generation.js
 *   k6 run --env BASE_URL=https://foundry-stage.williamjshaw.ca load-tests/spoke-generation.js
 *
 * Prerequisites:
 *   - Hubs with pillars must exist
 *   - AUTH_TOKEN environment variable for authenticated requests
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const generationDuration = new Trend('spoke_generation_duration', true);
const generationSuccess = new Rate('spoke_generation_success');
const generationCount = new Counter('spoke_generations');

// Test configuration
export const options = {
  scenarios: {
    // Smoke: Single generation
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '2m',
      exec: 'smokeTest',
    },
    // Load: Concurrent generations
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 3 },   // Ramp up to 3 users
        { duration: '5m', target: 3 },   // Hold
        { duration: '2m', target: 5 },   // Ramp up to 5 users
        { duration: '5m', target: 5 },   // Hold
        { duration: '2m', target: 0 },   // Ramp down
      ],
      exec: 'loadTest',
      startTime: '2m',
    },
  },
  thresholds: {
    // NFR-P3: 95th percentile < 60 seconds
    'spoke_generation_duration': ['p(95)<60000'],
    // 95% success rate (generation can fail due to rate limits)
    'spoke_generation_success': ['rate>0.95'],
    'http_req_failed': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const HUB_ID = __ENV.HUB_ID || ''; // Specific hub to test

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
}

// Get a random hub with pillars
function getTestHub() {
  if (HUB_ID) return HUB_ID;

  // List hubs and pick one with pillars
  const response = http.get(
    `${BASE_URL}/api/trpc/hubs.list`,
    { headers: getHeaders() }
  );

  try {
    const data = JSON.parse(response.body);
    const hubs = data.result?.data?.items || [];
    const hubsWithPillars = hubs.filter(h => h.pillar_count > 0);
    if (hubsWithPillars.length > 0) {
      return hubsWithPillars[Math.floor(Math.random() * hubsWithPillars.length)].id;
    }
  } catch (e) {
    console.log('Failed to get hubs:', e);
  }

  return null;
}

// Smoke test: Single spoke generation
export function smokeTest() {
  const hubId = getTestHub();
  if (!hubId) {
    console.log('No hub available for testing');
    sleep(10);
    return;
  }

  const platforms = ['twitter', 'linkedin'];
  const startTime = Date.now();

  // Trigger spoke generation
  const response = http.post(
    `${BASE_URL}/api/trpc/spokes.generate`,
    JSON.stringify({
      json: {
        hubId: hubId,
        platforms: platforms,
      },
    }),
    { headers: getHeaders(), timeout: '90s' }
  );

  const duration = Date.now() - startTime;
  generationDuration.add(duration);
  generationCount.add(1);

  const success = check(response, {
    'generation started': (r) => r.status === 200 || r.status === 202,
    'generation < 60s': () => duration < 60000,
  });

  generationSuccess.add(success ? 1 : 0);

  // Wait before next test
  sleep(15);
}

// Load test: Concurrent generations
export function loadTest() {
  const hubId = getTestHub();
  if (!hubId) {
    sleep(10);
    return;
  }

  // Random platform selection
  const allPlatforms = ['twitter', 'linkedin', 'tiktok', 'instagram', 'newsletter'];
  const platforms = allPlatforms.slice(0, Math.floor(Math.random() * 3) + 1);

  const startTime = Date.now();

  const response = http.post(
    `${BASE_URL}/api/trpc/spokes.generate`,
    JSON.stringify({
      json: {
        hubId: hubId,
        platforms: platforms,
      },
    }),
    { headers: getHeaders(), timeout: '90s' }
  );

  const duration = Date.now() - startTime;
  generationDuration.add(duration);
  generationCount.add(1);

  const success = check(response, {
    'generation accepted': (r) => r.status === 200 || r.status === 202 || r.status === 429,
    'within SLA': () => duration < 60000,
  });

  generationSuccess.add(success ? 1 : 0);

  if (__ENV.DEBUG) {
    console.log(`Generation: ${duration}ms, Status: ${response.status}, Platforms: ${platforms.join(',')}`);
  }

  // Stagger requests to avoid overwhelming the queue
  sleep(Math.random() * 10 + 5);
}

export function handleSummary(data) {
  const p95 = data.metrics.spoke_generation_duration?.values['p(95)'] || 0;
  const successRate = data.metrics.spoke_generation_success?.values.rate || 0;

  const summary = {
    timestamp: new Date().toISOString(),
    nfr: 'NFR-P3',
    threshold: '60000ms',
    results: {
      p50: data.metrics.spoke_generation_duration?.values['p(50)'],
      p95: p95,
      p99: data.metrics.spoke_generation_duration?.values['p(99)'],
      successRate: successRate,
      totalGenerations: data.metrics.spoke_generations?.values.count,
    },
    passed: p95 < 60000 && successRate > 0.95,
  };

  return {
    'load-tests/results/spoke-generation-results.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const p95 = data.metrics.spoke_generation_duration?.values['p(95)'] || 0;
  const successRate = data.metrics.spoke_generation_success?.values.rate || 0;
  const passed = p95 < 60000 && successRate > 0.95;

  return `
╔══════════════════════════════════════════════════════════════════╗
║                    NFR-P3 LOAD TEST RESULTS                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Spoke Generation Performance                                     ║
║  Threshold: p95 < 60 seconds                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  p50:  ${String(Math.round(data.metrics.spoke_generation_duration?.values['p(50)'] || 0)).padStart(6)}ms                                              ║
║  p95:  ${String(Math.round(p95)).padStart(6)}ms  ${p95 < 60000 ? '✅ PASS' : '❌ FAIL'}                                    ║
║  p99:  ${String(Math.round(data.metrics.spoke_generation_duration?.values['p(99)'] || 0)).padStart(6)}ms                                              ║
║  Success Rate: ${(successRate * 100).toFixed(1)}%  ${successRate > 0.95 ? '✅ PASS' : '❌ FAIL'}                             ║
╠══════════════════════════════════════════════════════════════════╣
║  Overall: ${passed ? '✅ NFR-P3 PASSED' : '❌ NFR-P3 FAILED'}                                          ║
╚══════════════════════════════════════════════════════════════════╝
`;
}
