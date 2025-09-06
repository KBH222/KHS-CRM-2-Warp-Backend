// Quick API test script
// Usage: node test-api.js [backend-url]
// Example: node test-api.js https://api.khscrm.com

const backendUrl = process.argv[2] || 'http://localhost:3001';

console.log('🤖 KHS CRM API Test Suite');
console.log('========================');
console.log(`Testing API at: ${backendUrl}\n`);

async function testEndpoint(name, url, options = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      timeout: 10000, // 10 second timeout
      ...options
    });
    
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    const duration = Date.now() - startTime;
    const statusIcon = response.status < 400 ? '✅' : '⚠️';
    
    console.log(`${statusIcon} ${name}: ${response.status} (${duration}ms)`);
    
    if (response.status >= 400) {
      console.log(`   Error: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    } else if (typeof data === 'object') {
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    }
    
    console.log(''); // Add spacing
    return { success: response.status < 400, status: response.status, data, duration };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${name}: Failed (${duration}ms) - ${error.message}`);
    console.log('');
    return { success: false, error: error.message, duration };
  }
}

async function runTests() {
  const results = [];
  
  // Core endpoints
  results.push(await testEndpoint('Root endpoint', `${backendUrl}/`));
  results.push(await testEndpoint('Health check', `${backendUrl}/api/health`));
  
  // Public API endpoints (might require auth)
  results.push(await testEndpoint('Customers API (GET)', `${backendUrl}/api/customers`));
  results.push(await testEndpoint('Jobs API (GET)', `${backendUrl}/api/jobs`));
  
  // Database schema endpoints
  results.push(await testEndpoint('Schema check', `${backendUrl}/api/check-schema`));
  results.push(await testEndpoint('Tasks column check', `${backendUrl}/api/check-tasks-column`));
  
  // Generate summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  const avgTime = Math.round(totalTime / results.length);
  
  console.log('=== TEST SUMMARY ===');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️ Total time: ${totalTime}ms`);
  console.log(`⏱️ Average time: ${avgTime}ms`);
  console.log(`🏆 Success rate: ${Math.round((successful / results.length) * 100)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. This might be expected for endpoints requiring authentication.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

runTests().catch(console.error);