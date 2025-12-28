/**
 * k6 Load Test: Pillar Extraction Performance (NFR-P2)
 *
 * Tests pillar extraction SLA: <30 seconds for 95th percentile
 *
 * Run:
 *   k6 run load-tests/pillar-extraction.js
 *   k6 run --env BASE_URL=https://foundry-stage.williamjshaw.ca load-tests/pillar-extraction.js
 *
 * Install k6:
 *   brew install k6
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// Custom metrics
const extractionDuration = new Trend('pillar_extraction_duration', true);
const extractionSuccess = new Rate('pillar_extraction_success');
const extractionCount = new Counter('pillar_extractions');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test: 1 user, verify basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      exec: 'smokeTest',
    },
    // Load test: Simulate realistic traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },   // Ramp up to 5 users
        { duration: '5m', target: 5 },   // Hold at 5 users
        { duration: '2m', target: 10 },  // Ramp up to 10 users
        { duration: '5m', target: 10 },  // Hold at 10 users
        { duration: '2m', target: 0 },   // Ramp down
      ],
      exec: 'loadTest',
      startTime: '1m', // Start after smoke test
    },
  },
  thresholds: {
    // NFR-P2: 95th percentile < 30 seconds
    'pillar_extraction_duration': ['p(95)<30000'],
    // 99% success rate
    'pillar_extraction_success': ['rate>0.99'],
    // HTTP errors < 1%
    'http_req_failed': ['rate<0.01'],
  },
};

// Configuration from environment
const BASE_URL = __ENV.BASE_URL || 'https://foundry-stage.williamjshaw.ca';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';

// Test content at different sizes
const CONTENT_SAMPLES = {
  small: generateContent(1000),   // ~1000 chars
  medium: generateContent(4000),  // ~4000 chars
  large: generateContent(10000),  // ~10000 chars
};

function generateContent(targetLength) {
  const paragraphs = [
    'The first key insight is about AI content creation and automation.',
    'AI can automate repetitive tasks while humans provide creative direction.',
    'Quality gates ensure every piece meets brand standards consistently.',
    'Systems must handle growing content demands efficiently at scale.',
    'Personalization drives engagement by tailoring content to audiences.',
    'Analytics provide feedback loops for continuous content improvement.',
    'Integration with existing tools streamlines content workflows.',
    'Security and compliance are essential for enterprise content systems.',
  ];

  let content = '';
  while (content.length < targetLength) {
    content += paragraphs[Math.floor(Math.random() * paragraphs.length)] + '\n\n';
  }
  return content.slice(0, targetLength);
}

// Shared headers
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

// Smoke test: Single extraction with small content
export function smokeTest() {
  const startTime = Date.now();

  // Create hub with small content
  const hubResponse = http.post(
    `${BASE_URL}/api/trpc/hubs.create`,
    JSON.stringify({
      json: {
        title: `Load Test Hub ${Date.now()}`,
        content: CONTENT_SAMPLES.small,
      },
    }),
    { headers: getHeaders(), timeout: '60s' }
  );

  const duration = Date.now() - startTime;
  extractionDuration.add(duration);
  extractionCount.add(1);

  const success = check(hubResponse, {
    'hub created': (r) => r.status === 200 || r.status === 201,
    'has hub id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.result?.data?.id != null;
      } catch {
        return false;
      }
    },
    'extraction < 30s': () => duration < 30000,
  });

  extractionSuccess.add(success ? 1 : 0);

  sleep(2); // Wait between requests
}

// Load test: Mixed content sizes
export function loadTest() {
  // Randomly select content size
  const sizes = ['small', 'medium', 'large'];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const content = CONTENT_SAMPLES[size];

  const startTime = Date.now();

  // Create hub
  const hubResponse = http.post(
    `${BASE_URL}/api/trpc/hubs.create`,
    JSON.stringify({
      json: {
        title: `Load Test Hub ${size} ${Date.now()}`,
        content: content,
      },
    }),
    { headers: getHeaders(), timeout: '60s' }
  );

  const duration = Date.now() - startTime;
  extractionDuration.add(duration);
  extractionCount.add(1);

  const success = check(hubResponse, {
    'hub created': (r) => r.status === 200 || r.status === 201,
    'extraction within SLA': () => duration < 30000,
  });

  extractionSuccess.add(success ? 1 : 0);

  // Log detailed metrics for analysis
  if (__ENV.DEBUG) {
    console.log(`[${size}] Duration: ${duration}ms, Status: ${hubResponse.status}`);
  }

  sleep(Math.random() * 3 + 1); // 1-4 second delay
}

// Summary handler
export function handleSummary(data) {
  const p95 = data.metrics.pillar_extraction_duration?.values['p(95)'] || 0;
  const p99 = data.metrics.pillar_extraction_duration?.values['p(99)'] || 0;
  const successRate = data.metrics.pillar_extraction_success?.values.rate || 0;

  const summary = {
    timestamp: new Date().toISOString(),
    nfr: 'NFR-P2',
    threshold: '30000ms',
    results: {
      p50: data.metrics.pillar_extraction_duration?.values['p(50)'],
      p95: p95,
      p99: p99,
      successRate: successRate,
      totalExtractions: data.metrics.pillar_extractions?.values.count,
    },
    passed: p95 < 30000 && successRate > 0.99,
  };

  return {
    'load-tests/results/pillar-extraction-results.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const p95 = data.metrics.pillar_extraction_duration?.values['p(95)'] || 0;
  const successRate = data.metrics.pillar_extraction_success?.values.rate || 0;
  const passed = p95 < 30000 && successRate > 0.99;

  return `
╔══════════════════════════════════════════════════════════════════╗
║                    NFR-P2 LOAD TEST RESULTS                       ║
╠══════════════════════════════════════════════════════════════════╣
║  Pillar Extraction Performance                                    ║
║  Threshold: p95 < 30 seconds                                      ║
╠══════════════════════════════════════════════════════════════════╣
║  p50:  ${String(Math.round(data.metrics.pillar_extraction_duration?.values['p(50)'] || 0)).padStart(6)}ms                                              ║
║  p95:  ${String(Math.round(p95)).padStart(6)}ms  ${p95 < 30000 ? '✅ PASS' : '❌ FAIL'}                                    ║
║  p99:  ${String(Math.round(data.metrics.pillar_extraction_duration?.values['p(99)'] || 0)).padStart(6)}ms                                              ║
║  Success Rate: ${(successRate * 100).toFixed(1)}%  ${successRate > 0.99 ? '✅ PASS' : '❌ FAIL'}                             ║
╠══════════════════════════════════════════════════════════════════╣
║  Overall: ${passed ? '✅ NFR-P2 PASSED' : '❌ NFR-P2 FAILED'}                                          ║
╚══════════════════════════════════════════════════════════════════╝
`;
}
