/**
 * Comprehensive API Test Suite for AI Movie Recommender
 *
 * Run: node api-test-suite.js
 * Optional env vars:
 *   BASE_URL=https://screenpick.fun/api node api-test-suite.js
 *   API_KEY=your_key_here node api-test-suite.js
 *   TEST_KEY=test_key (if you want to test rate-limited tier)
 */

const DEFAULT_BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';
const API_KEY = process.env.API_KEY || 'REPLACE_ME';
const TEST_KEY = process.env.TEST_KEY || null; // optionally pass a test key to exercise lower limits

if (typeof fetch !== 'function') {
  // Node 18+ has fetch; fallback if needed
  global.fetch = (...args) => import('node-fetch').then(m => m.default(...args));
}

// Console colors
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
};

function log(section, msg, color = 'cyan') {
  console.log(`${C[color] || ''}${section}${C.reset} ${msg}`);
}

function hr() { console.log(`${C.magenta}${'-'.repeat(70)}${C.reset}`); }

async function request(endpoint, { params = {}, key = API_KEY, expectJSON = true } = {}) {
  const url = new URL(`${DEFAULT_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  const headers = {};
  if (key && key !== 'REPLACE_ME') headers['Authorization'] = `Bearer ${key}`;
  const started = Date.now();
  let res, bodyRaw, data;
  try {
    res = await fetch(url.toString(), { headers });
    bodyRaw = await res.text();
    if (expectJSON) {
      try { data = bodyRaw ? JSON.parse(bodyRaw) : {}; } catch { data = { __parseError: true, raw: bodyRaw }; }
    } else {
      data = bodyRaw;
    }
  } catch (e) {
    return { ok: false, networkError: e.message, endpoint, duration: Date.now() - started };
  }
  return {
    ok: res.ok,
    status: res.status,
    headers: res.headers,
    data,
    endpoint,
    duration: Date.now() - started,
  };
}

function assert(condition, message, context, failures) {
  if (!condition) failures.push({ message, context });
}

async function testPing() {
  const failures = [];
  const r = await request('/ping', { key: null }); // no auth required per implementation
  assert(r.status === 200, 'Ping should return 200', r.status, failures);
  assert(r.data && r.data.status === 'ok', 'Ping body should contain {status:"ok"}', r.data, failures);
  return { name: 'ping', result: r, failures };
}

async function testSearch() {
  const failures = [];
  const r = await request('/search', { params: { q: 'romantic comedies' } });
  assert([200,503].includes(r.status), 'Search should return 200 or 503 (if upstream unavailable)', r.status, failures);
  if (r.status === 200) {
    assert(Array.isArray(r.data.movies), 'movies should be array', r.data.movies, failures);
    assert(r.data._metadata && r.data._metadata.requestId, 'metadata.requestId present', r.data._metadata, failures);
    assert(r.headers.get('X-RateLimit-Limit'), 'Rate limit headers present', null, failures);
  } else if (r.status === 503) {
    assert(r.data.error && r.data.error.code, 'Error object with code on 503', r.data.error, failures);
  }
  // Missing parameter test
  const rBad = await request('/search', { params: {} });
  assert(rBad.status === 400, 'Missing q should be 400', rBad.status, failures);
  assert(rBad.data.error && rBad.data.error.code === 'missing_parameter', 'Error code missing_parameter', rBad.data.error, failures);
  return { name: 'search', result: r, failures };
}

async function testGetID() {
  const failures = [];
  const r = await request('/getID', { params: { title: 'Inception' } });
  assert([200,503].includes(r.status), 'getID should return 200 or 503', r.status, failures);
  if (r.status === 200) {
    assert(Array.isArray(r.data), 'Response should be array', r.data, failures);
    if (Array.isArray(r.data) && r.data.length > 0) {
      const first = r.data[0];
      assert('tmdb' in first, 'First item has tmdb id', first, failures);
      assert('imdb' in first, 'First item has imdb field (may be null)', first, failures);
    }
  }
  const missing = await request('/getID', { params: {} });
  assert(missing.status === 400, 'Missing title returns 400', missing.status, failures);
  return { name: 'getID', result: r, failures };
}

async function testDetails() {
  const failures = [];
  const r = await request('/details', { params: { id: '550' } });
  assert([200,404,503].includes(r.status), 'Details returns 200/404/503', r.status, failures);
  if (r.status === 200) {
    assert(r.data.id === 550, 'Returned movie id matches 550', r.data.id, failures);
    assert(r.data._metadata, 'Has metadata', r.data._metadata, failures);
  }
  const badId = await request('/details', { params: { id: 'abc' } });
  assert(badId.status === 400, 'Invalid numeric id returns 400', badId.status, failures);
  return { name: 'details', result: r, failures };
}

async function testGenre() {
  const failures = [];
  const list = await request('/genre', { params: { action: 'list' } });
  assert(list.status === 200, 'Genre list 200', list.status, failures);
  if (list.status === 200) {
    assert(Array.isArray(list.data.genres), 'genres array', list.data.genres, failures);
  }
  // Discover
  const discover = await request('/genre', { params: { with_genres: '28', sort_by: 'popularity.desc' } });
  assert([200,503].includes(discover.status), 'Genre discover 200 or 503', discover.status, failures);
  if (discover.status === 200) {
    assert(Array.isArray(discover.data.results), 'results array', discover.data.results, failures);
    assert(discover.data.filters && Array.isArray(discover.data.filters.genre_ids), 'filters.genre_ids present', discover.data.filters, failures);
  }
  const missing = await request('/genre', { params: {} });
  assert(missing.status === 400, 'Missing with_genres returns 400', missing.status, failures);
  return { name: 'genre', result: list, failures };
}

async function testTrending() {
  const failures = [];
  const day = await request('/trending', { params: { time_window: 'day' } });
  assert([200,503].includes(day.status), 'Trending day 200 or 503', day.status, failures);
  if (day.status === 200) {
    assert(Array.isArray(day.data.results), 'results array', day.data.results, failures);
    assert(day.data._metadata, 'metadata present', day.data._metadata, failures);
  }
  const bad = await request('/trending', { params: { time_window: 'year' } });
  assert(bad.status === 400, 'Invalid time_window returns 400', bad.status, failures);
  return { name: 'trending', result: day, failures };
}

async function testTop() {
  const failures = [];
  const popular = await request('/top', { params: { category: 'popular' } });
  assert([200,503].includes(popular.status), 'Top popular 200 or 503', popular.status, failures);
  if (popular.status === 200) {
    assert(Array.isArray(popular.data.results), 'results array', popular.data.results, failures);
  }
  const bad = await request('/top', { params: { category: 'invalid' } });
  assert(bad.status === 400, 'Invalid category returns 400', bad.status, failures);
  return { name: 'top', result: popular, failures };
}

async function testAuthErrors() {
  const failures = [];
  const unauth = await request('/search', { params: { q: 'test' }, key: 'invalid_key_123' });
  assert(unauth.status === 401, 'Invalid key should return 401', unauth.status, failures);
  return { name: 'auth', result: unauth, failures };
}

async function maybeRateLimit() {
  if (!TEST_KEY) return null; // skip if no low-tier key
  const failures = [];
  let last;
  for (let i = 0; i < 20; i++) { // exceed 15/60m test limit
    last = await request('/search', { params: { q: 'thriller movies' }, key: TEST_KEY });
    if (last.status === 429) break;
  }
  if (last) {
    if (last.status !== 429) failures.push({ message: 'Expected at least one 429 with test key', context: last.status });
    else {
      // verify headers
      const retry = last.headers.get('Retry-After');
      if (!retry) failures.push({ message: 'Retry-After header missing on 429', context: null });
    }
  }
  return { name: 'rate_limit', result: last, failures };
}

async function run() {
  console.log(`${C.bold}${C.cyan}AI Movie Recommender Comprehensive API Tests${C.reset}`);
  console.log(`Base   : ${DEFAULT_BASE_URL}`);
  console.log(`API Key: ${API_KEY !== 'REPLACE_ME' ? '✅ Provided' : '❌ Missing (set API_KEY env)'}`);
  if (TEST_KEY) console.log(`Test Key: ✅ Provided (will attempt rate limit test)`);
  if (API_KEY === 'REPLACE_ME') { console.error(`${C.red}Aborting: provide API_KEY env variable.${C.reset}`); return process.exit(1); }
  hr();

  const tests = [
    testPing,
    testSearch,
    testGetID,
    testDetails,
    testGenre,
    testTrending,
    testTop,
    testAuthErrors,
  ];

  const results = [];
  for (const fn of tests) {
    log('▶', `Running ${fn.name}...`);
    const r = await fn();
    results.push(r);
    if (r.failures.length === 0) log('✔', `${fn.name} passed`, 'green'); else log('✖', `${fn.name} failed (${r.failures.length} issues)`, 'red');
    r.failures.forEach(f => console.log(`  - ${C.red}${f.message}${C.reset} ::`, f.context));
    hr();
  }

  // Optional rate limit stress
  const rl = await maybeRateLimit();
  if (rl) {
    results.push(rl);
    if (rl.failures.length === 0) log('✔', 'rate_limit test completed', 'green'); else log('✖', 'rate_limit test encountered issues', 'red');
    rl && rl.failures.forEach(f => console.log(`  - ${C.red}${f.message}${C.reset} ::`, f.context));
    hr();
  }

  const total = results.length;
  const failed = results.reduce((a, r) => a + (r.failures.length > 0 ? 1 : 0), 0);
  console.log(`${C.bold}Summary:${C.reset} ${total - failed}/${total} test groups passed.`);
  if (failed === 0) console.log(`${C.green}All good!${C.reset}`); else process.exitCode = 1;
}

if (require.main === module) {
  run().catch(e => { console.error('Fatal test error:', e); process.exit(1); });
}

module.exports = { run };
