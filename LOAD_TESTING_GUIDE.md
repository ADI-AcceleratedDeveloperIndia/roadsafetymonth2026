# Load Testing Guide - 50,000 Concurrent Users

## ⚠️ IMPORTANT: Test Safely

**DO NOT test on production/live website without:**
1. Setting up a staging environment first
2. Starting with small tests (100, 500, 1000 users)
3. Monitoring server resources
4. Having rollback plans

## 🎯 Recommended Testing Approach

### Option 1: Staging Environment (RECOMMENDED)
1. Deploy a separate staging instance (Vercel preview deployment)
2. Use staging MongoDB database (separate from production)
3. Test on staging URL
4. No risk to production users

### Option 2: Production Testing (CAREFUL)
- Only during low-traffic hours
- Start with 100 users, gradually increase
- Monitor server metrics closely
- Have emergency stop plan

## 🛠️ Load Testing Tools

### 1. k6 (Recommended - Modern & Fast)
```bash
# Install k6
# Windows: Download from https://k6.io/docs/getting-started/installation/
# Or use: choco install k6

# Create test script: load-test.js
```

### 2. Apache JMeter (GUI-based)
- Download from https://jmeter.apache.org/
- Visual test plan builder
- Good for complex scenarios

### 3. Artillery (Node.js based)
```bash
npm install -g artillery
```

## 📝 Test Scenarios

### Scenario 1: Quiz Page Load
- 50,000 users accessing `/quiz`
- Simulate answering questions
- Submit quiz
- Redirect to certificate page

### Scenario 2: Simulation Page Load
- 50,000 users accessing `/simulation`
- Complete simulations
- Redirect to certificate

### Scenario 3: Certificate Generation
- 50,000 certificate generation requests
- Test PDF generation performance

### Scenario 4: Mixed Traffic
- Realistic mix of all pages
- Simulate real user behavior

## 🔧 k6 Test Script Example

Create `load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 1000 },   // Ramp up to 1000 users
    { duration: '5m', target: 1000 },   // Stay at 1000 users
    { duration: '2m', target: 5000 },   // Ramp up to 5000 users
    { duration: '5m', target: 5000 },   // Stay at 5000 users
    { duration: '2m', target: 10000 },   // Ramp up to 10000 users
    { duration: '5m', target: 10000 },   // Stay at 10000 users
    { duration: '2m', target: 50000 },  // Ramp up to 50000 users
    { duration: '10m', target: 50000 },  // Stay at 50000 users
    { duration: '2m', target: 0 },       // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test Homepage
  let res = http.get(`${BASE_URL}/`);
  check(res, { 'homepage status 200': (r) => r.status === 200 });
  sleep(1);

  // Test Quiz Page
  res = http.get(`${BASE_URL}/quiz`);
  check(res, { 'quiz page status 200': (r) => r.status === 200 });
  sleep(2);

  // Test Quiz API
  res = http.get(`${BASE_URL}/api/quiz/submit?lang=en`);
  check(res, { 'quiz API status 200': (r) => r.status === 200 });
  sleep(1);

  // Test Simulation Page
  res = http.get(`${BASE_URL}/simulation`);
  check(res, { 'simulation page status 200': (r) => r.status === 200 });
  sleep(2);

  // Test Certificate Page
  res = http.get(`${BASE_URL}/certificates`);
  check(res, { 'certificates page status 200': (r) => r.status === 200 });
  sleep(1);

  // Test Certificate Generation API
  const certData = {
    certificateType: 'ORG',
    fullName: 'Test User',
    district: 'Karimnagar',
    issueDate: new Date().toISOString().slice(0, 10),
    referenceId: 'TEST-REF-12345',
  };
  res = http.post(
    `${BASE_URL}/api/certificates/generate-reference-id`,
    JSON.stringify({ certificateType: 'ORG' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'cert API status 200': (r) => r.status === 200 });
  sleep(1);
}
```

### Run k6 Test:
```bash
# Test staging environment
k6 run load-test.js --env BASE_URL=https://your-staging-url.vercel.app

# Test with 50,000 users (gradual ramp-up)
k6 run load-test.js --vus 50000 --duration 30m
```

## 📊 What to Monitor

### 1. Server Metrics
- CPU usage
- Memory usage
- Response times
- Error rates
- Database connection pool

### 2. Application Metrics
- API response times
- Page load times
- MongoDB query performance
- Cache hit rates
- Rate limiting effectiveness

### 3. Vercel Metrics
- Function execution time
- Function invocations
- Bandwidth usage
- Edge network performance

## 🚨 Safety Measures

### 1. Rate Limiting (Already Implemented)
- Quiz: 10 submissions/minute per IP
- Certificates: 20 creations/minute per IP
- Events: 10 creations/hour per IP
- This will throttle excessive requests

### 2. Database Protection
- Connection pooling (10-50 connections)
- Query timeouts
- Indexes on frequently queried fields

### 3. Caching
- In-memory cache for stats
- API response caching
- Reduces database load

## 🎯 Recommended Test Plan

### Phase 1: Small Scale (Safe)
```bash
# Test with 100 users
k6 run load-test.js --vus 100 --duration 5m
```

### Phase 2: Medium Scale
```bash
# Test with 1,000 users
k6 run load-test.js --vus 1000 --duration 10m
```

### Phase 3: Large Scale
```bash
# Test with 10,000 users
k6 run load-test.js --vus 10000 --duration 15m
```

### Phase 4: Extreme Scale
```bash
# Test with 50,000 users (gradual ramp-up)
k6 run load-test.js --stages 30m:50000
```

## 🔍 Monitoring During Test

### Vercel Dashboard
- Monitor function execution
- Check error rates
- Watch bandwidth usage

### MongoDB Atlas Dashboard
- Monitor connection count
- Check query performance
- Watch for slow queries

### Application Logs
- Check API response times
- Monitor error logs
- Watch for rate limiting triggers

## ⚡ Quick Test Commands

### Test Single Endpoint
```bash
# Using curl (simple test)
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://your-site.vercel.app/quiz &
done
wait
```

### Test with Apache Bench
```bash
# Install: apt-get install apache2-utils (Linux) or brew install httpd (Mac)
ab -n 10000 -c 100 https://your-site.vercel.app/quiz
```

## 🛡️ Protection Against Test Impact

### 1. Use Staging Environment
- Deploy separate Vercel preview
- Use separate MongoDB database
- No impact on production

### 2. Time-Based Testing
- Test during low-traffic hours
- Avoid peak usage times
- Schedule tests in advance

### 3. Gradual Ramp-Up
- Start with 100 users
- Increase gradually
- Monitor at each step
- Stop if issues occur

## 📈 Expected Results

### Good Performance Indicators:
- ✅ 95% of requests < 2 seconds
- ✅ Error rate < 1%
- ✅ No database connection errors
- ✅ Cache hit rate > 50%
- ✅ Rate limiting working correctly

### Warning Signs:
- ⚠️ Response times > 5 seconds
- ⚠️ Error rate > 5%
- ⚠️ Database connection pool exhausted
- ⚠️ High memory usage
- ⚠️ Function timeouts

## 🎓 Best Practices

1. **Always test staging first**
2. **Start small, scale gradually**
3. **Monitor continuously**
4. **Have rollback plan**
5. **Document results**
6. **Test realistic scenarios**
7. **Include error handling tests**

## 🚀 Quick Start

```bash
# 1. Install k6
# Windows: Download from https://k6.io/download/

# 2. Create test script (load-test.js) - see above

# 3. Run small test first
k6 run load-test.js --vus 100 --duration 5m

# 4. Monitor results
# Check Vercel dashboard, MongoDB Atlas, application logs

# 5. Scale up gradually
k6 run load-test.js --vus 1000 --duration 10m
```

## 📞 Support

If you encounter issues during testing:
1. Check Vercel function logs
2. Check MongoDB connection status
3. Review rate limiting logs
4. Check application error logs
5. Monitor server resources

---

**Remember:** Load testing is important for production readiness, but always test safely!

