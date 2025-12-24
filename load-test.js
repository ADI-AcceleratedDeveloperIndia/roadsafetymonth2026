import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration - GRADUAL RAMP-UP (SAFE)
export const options = {
  stages: [
    // Phase 1: Warm-up (100 users)
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },
    
    // Phase 2: Small scale (1,000 users)
    { duration: '2m', target: 1000 },
    { duration: '3m', target: 1000 },
    
    // Phase 3: Medium scale (5,000 users)
    { duration: '3m', target: 5000 },
    { duration: '5m', target: 5000 },
    
    // Phase 4: Large scale (10,000 users)
    { duration: '3m', target: 10000 },
    { duration: '5m', target: 10000 },
    
    // Phase 5: Extreme scale (50,000 users) - ONLY IF PREVIOUS PHASES PASSED
    { duration: '5m', target: 50000 },
    { duration: '10m', target: 50000 },
    
    // Ramp down
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests should be below 3s
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
    errors: ['rate<0.1'],              // Custom error rate
  },
};

// Get base URL from environment variable or use localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test scenarios
const scenarios = [
  'homepage',
  'quiz',
  'simulation',
  'certificates',
  'events',
  'guides',
  'prevention',
];

export default function () {
  // Random scenario selection
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  try {
    switch (scenario) {
      case 'homepage':
        testHomepage();
        break;
      case 'quiz':
        testQuiz();
        break;
      case 'simulation':
        testSimulation();
        break;
      case 'certificates':
        testCertificates();
        break;
      case 'events':
        testEvents();
        break;
      case 'guides':
        testGuides();
        break;
      case 'prevention':
        testPrevention();
        break;
    }
  } catch (error) {
    errorRate.add(1);
    console.error('Test error:', error);
  }
  
  // Random sleep between 1-3 seconds (simulate real user behavior)
  sleep(Math.random() * 2 + 1);
}

function testHomepage() {
  const res = http.get(`${BASE_URL}/`);
  const success = check(res, {
    'homepage status 200': (r) => r.status === 200,
    'homepage response time < 2s': (r) => r.timings.duration < 2000,
  });
  if (!success) errorRate.add(1);
}

function testQuiz() {
  // Load quiz page
  let res = http.get(`${BASE_URL}/quiz`);
  check(res, { 'quiz page status 200': (r) => r.status === 200 });
  sleep(1);
  
  // Get quiz questions
  res = http.get(`${BASE_URL}/api/quiz/submit?lang=en`);
  const success = check(res, {
    'quiz API status 200': (r) => r.status === 200,
    'quiz has questions': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.questions && data.questions.length > 0;
      } catch {
        return false;
      }
    },
  });
  if (!success) errorRate.add(1);
}

function testSimulation() {
  const res = http.get(`${BASE_URL}/simulation`);
  const success = check(res, {
    'simulation page status 200': (r) => r.status === 200,
    'simulation response time < 2s': (r) => r.timings.duration < 2000,
  });
  if (!success) errorRate.add(1);
}

function testCertificates() {
  // Load certificates page
  let res = http.get(`${BASE_URL}/certificates`);
  check(res, { 'certificates page status 200': (r) => r.status === 200 });
  sleep(1);
  
  // Test certificate reference ID generation
  res = http.post(
    `${BASE_URL}/api/certificates/generate-reference-id`,
    JSON.stringify({ certificateType: 'ORG' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const success = check(res, {
    'cert API status 200': (r) => r.status === 200,
    'cert API has reference ID': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.referenceId && data.referenceId.length > 0;
      } catch {
        return false;
      }
    },
  });
  if (!success) errorRate.add(1);
}

function testEvents() {
  // Load events page
  let res = http.get(`${BASE_URL}/events`);
  check(res, { 'events page status 200': (r) => r.status === 200 });
  sleep(1);
  
  // Test events list API
  res = http.get(`${BASE_URL}/api/events/list`);
  const success = check(res, {
    'events API status 200': (r) => r.status === 200,
    'events API response time < 2s': (r) => r.timings.duration < 2000,
  });
  if (!success) errorRate.add(1);
}

function testGuides() {
  const res = http.get(`${BASE_URL}/guides`);
  const success = check(res, {
    'guides page status 200': (r) => r.status === 200,
    'guides response time < 2s': (r) => r.timings.duration < 2000,
  });
  if (!success) errorRate.add(1);
}

function testPrevention() {
  const res = http.get(`${BASE_URL}/prevention`);
  const success = check(res, {
    'prevention page status 200': (r) => r.status === 200,
    'prevention response time < 2s': (r) => r.timings.duration < 2000,
  });
  if (!success) errorRate.add(1);
}

