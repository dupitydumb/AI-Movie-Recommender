/**
 * API Testing Script for AI Movie Recommender
 * 
 * This script tests all available API endpoints to ensure they're working correctly.
 * Make sure your server is running before executing this script.
 * 
 * Usage: node test-api.js
 */

// Configuration
const BASE_URL = 'http://localhost:3000/api'; // Change this to your deployed URL if needed
const API_KEY = '124124egq243663u534u'; // Replace with your actual API key
const TEST_MOVIE_ID = '550'; // Fight Club - popular movie for testing

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper function to make API requests
async function makeRequest(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add API key to params
  params.apiKey = API_KEY;
  
  // Add query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    console.log(`${colors.blue}🚀 Testing:${colors.reset} ${endpoint}`);
    console.log(`${colors.cyan}📡 URL:${colors.reset} ${url.toString()}`);
    
    const startTime = Date.now();
    const response = await fetch(url.toString());
    const endTime = Date.now();
    
    const data = await response.json();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`${colors.green}✅ SUCCESS${colors.reset} (${response.status}) - ${responseTime}ms`);
      console.log(`${colors.yellow}📊 Response preview:${colors.reset}`);
      
      // Show a preview of the response
      if (data.results && Array.isArray(data.results)) {
        console.log(`   Found ${data.results.length} results`);
        if (data.results.length > 0) {
          console.log(`   First result: ${data.results[0].title || data.results[0].name || 'No title'}`);
        }
      } else if (data.genres && Array.isArray(data.genres)) {
        console.log(`   Found ${data.genres.length} genres`);
      } else if (data.title) {
        console.log(`   Movie: ${data.title} (${data.release_date})`);
      } else if (data.movies && Array.isArray(data.movies)) {
        console.log(`   Found ${data.movies.length} movie recommendations`);
      } else {
        console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
      }
      
      return { success: true, data, responseTime };
    } else {
      console.log(`${colors.red}❌ FAILED${colors.reset} (${response.status}) - ${responseTime}ms`);
      console.log(`${colors.red}💬 Error:${colors.reset} ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error, status: response.status, responseTime };
    }
  } catch (error) {
    console.log(`${colors.red}💥 NETWORK ERROR:${colors.reset} ${error.message}`);
    return { success: false, error: error.message, responseTime: 0 };
  }
}

// Test functions for each endpoint
async function testPingEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Ping Endpoint ===${colors.reset}`);
  return await makeRequest('/ping');
}

async function testSearchEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Search Endpoint ===${colors.reset}`);
  const testQueries = [
    'action movies with explosions',
    'romantic comedies',
    'sci-fi movies like Blade Runner'
  ];

  const results = [];
  for (const query of testQueries) {
    console.log(`\n${colors.yellow}🔍 Query:${colors.reset} "${query}"`);
    const result = await makeRequest('/search', { q: query });
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit friendly delay
  }
  
  return results;
}

async function testTopEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Top Movies Endpoint ===${colors.reset}`);
  const categories = ['popular', 'top_rated', 'upcoming', 'now_playing'];
  
  const results = [];
  for (const category of categories) {
    console.log(`\n${colors.yellow}🎬 Category:${colors.reset} ${category}`);
    const result = await makeRequest('/top', { category, page: 1 });
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testGenreEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Genre Endpoint ===${colors.reset}`);
  
  // First, get list of genres
  console.log(`\n${colors.yellow}📋 Getting genre list:${colors.reset}`);
  const genreListResult = await makeRequest('/genre', { action: 'list' });
  
  const results = [genreListResult];
  
  if (genreListResult.success && genreListResult.data.genres) {
    // Test with action (28) and comedy (35) genres
    const testGenres = [
      { ids: '28', name: 'Action' },
      { ids: '35', name: 'Comedy' },
      { ids: '28,12', name: 'Action + Adventure' }
    ];
    
    for (const genre of testGenres) {
      console.log(`\n${colors.yellow}🎭 Genre:${colors.reset} ${genre.name} (${genre.ids})`);
      const result = await makeRequest('/genre', { 
        with_genres: genre.ids, 
        page: 1,
        sort_by: 'popularity.desc'
      });
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

async function testDetailsEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Movie Details Endpoint ===${colors.reset}`);
  
  const testMovieIds = [TEST_MOVIE_ID, '155', '13']; // Fight Club, The Dark Knight, Forrest Gump
  const appendOptions = [
    null,
    'credits',
    'credits,videos,similar',
    'images,reviews'
  ];
  
  const results = [];
  
  for (let i = 0; i < testMovieIds.length; i++) {
    const movieId = testMovieIds[i];
    const append = appendOptions[i];
    
    console.log(`\n${colors.yellow}🎥 Movie ID:${colors.reset} ${movieId}${append ? ` (with: ${append})` : ''}`);
    const params = { id: movieId };
    if (append) params.append_to_response = append;
    
    const result = await makeRequest('/details', params);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testTrendingEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing Trending Endpoint ===${colors.reset}`);
  
  const timeWindows = ['day', 'week'];
  const results = [];
  
  for (const timeWindow of timeWindows) {
    console.log(`\n${colors.yellow}📈 Time window:${colors.reset} ${timeWindow}`);
    const result = await makeRequest('/trending', { time_window: timeWindow, page: 1 });
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function testGetIDEndpoint() {
  console.log(`\n${colors.bright}${colors.magenta}=== Testing GetID Endpoint ===${colors.reset}`);
  
  const testTitles = ['Fight Club', 'The Matrix', 'Inception'];
  const results = [];
  
  for (const title of testTitles) {
    console.log(`\n${colors.yellow}🔍 Title:${colors.reset} "${title}"`);
    const result = await makeRequest('/getID', { title });
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}🎬 AI Movie Recommender API Test Suite${colors.reset}`);
  console.log(`${colors.cyan}Base URL: ${BASE_URL}${colors.reset}`);
  console.log(`${colors.cyan}API Key: ${API_KEY ? '✅ Provided' : '❌ Missing'}${colors.reset}\n`);
  
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.log(`${colors.red}⚠️  Please update the API_KEY variable in this script before running tests${colors.reset}\n`);
    return;
  }
  
  const startTime = Date.now();
  const testResults = {};
  
  try {
    // Run all tests
    testResults.ping = await testPingEndpoint();
    testResults.search = await testSearchEndpoint();
    testResults.top = await testTopEndpoint();
    testResults.genre = await testGenreEndpoint();
    testResults.details = await testDetailsEndpoint();
    testResults.trending = await testTrendingEndpoint();
    testResults.getID = await testGetIDEndpoint();
    
  } catch (error) {
    console.log(`${colors.red}💥 Test suite error: ${error.message}${colors.reset}`);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Generate summary report
  console.log(`\n${colors.bright}${colors.cyan}📊 Test Summary Report${colors.reset}`);
  console.log(`${colors.cyan}Total execution time: ${totalTime}ms${colors.reset}\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  Object.keys(testResults).forEach(endpoint => {
    const results = Array.isArray(testResults[endpoint]) ? testResults[endpoint] : [testResults[endpoint]];
    const passed = results.filter(r => r && r.success).length;
    const total = results.length;
    
    totalTests += total;
    passedTests += passed;
    
    const status = passed === total ? `${colors.green}✅` : `${colors.red}❌`;
    console.log(`${status} ${endpoint.toUpperCase()}: ${passed}/${total} tests passed${colors.reset}`);
    
    // Show failed tests
    results.forEach((result, index) => {
      if (result && !result.success) {
        console.log(`   ${colors.red}Failed:${colors.reset} ${result.error} (${result.status || 'Network Error'})`);
      }
    });
  });
  
  console.log(`\n${colors.bright}Overall: ${passedTests}/${totalTests} tests passed${colors.reset}`);
  
  if (passedTests === totalTests) {
    console.log(`${colors.green}🎉 All tests passed! Your API is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed. Check the logs above for details.${colors.reset}`);
  }
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log(`${colors.red}💥 Uncaught Exception: ${error.message}${colors.reset}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(`${colors.red}💥 Unhandled Rejection at: ${promise}, reason: ${reason}${colors.reset}`);
  process.exit(1);
});

// Run the test suite
if (require.main === module) {
  runAllTests().catch(error => {
    console.log(`${colors.red}💥 Test execution failed: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  makeRequest,
  testPingEndpoint,
  testSearchEndpoint,
  testTopEndpoint,
  testGenreEndpoint,
  testDetailsEndpoint,
  testTrendingEndpoint,
  testGetIDEndpoint
};
