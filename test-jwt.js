// JWT Test Script for AI Movie Recommender API
const BASE_URL = 'http://localhost:3000';
const API_KEY = '124124egq243663u534u'; // Your test API key from .env

async function testJWTImplementation() {
  console.log('🚀 Starting JWT Implementation Tests\\n');

  try {
    // Test 1: Login with API key to get JWT tokens
    console.log('Test 1: JWT Login');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: API_KEY,
        email: 'test@screenpick.fun'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful');
      console.log(`   Access Token: ${loginData.data.accessToken.substring(0, 50)}...`);
      console.log(`   User Plan: ${loginData.data.user.plan}`);
      console.log(`   Permissions: ${loginData.data.user.permissions.join(', ')}`);
      
      const { accessToken, refreshToken } = loginData.data;

      // Test 2: Validate JWT token
      console.log('\\nTest 2: Token Validation');
      const validateResponse = await fetch(`${BASE_URL}/api/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const validateData = await validateResponse.json();
      
      if (validateResponse.ok && validateData.success) {
        console.log('✅ Token validation successful');
        console.log(`   User ID: ${validateData.data.user.userId}`);
        console.log(`   Legacy Auth: ${validateData.data.isLegacyAuth}`);
      } else {
        console.log('❌ Token validation failed:', validateData.error?.message);
      }

      // Test 3: Use JWT for API request
      console.log('\\nTest 3: API Request with JWT');
      const searchResponse = await fetch(`${BASE_URL}/api/search?q=action movies`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const searchData = await searchResponse.json();
      
      if (searchResponse.ok && searchData.success) {
        console.log('✅ API request with JWT successful');
        console.log(`   Found ${searchData.total} movies`);
        console.log(`   Auth Method: ${searchData.authMethod}`);
        console.log(`   User Plan: ${searchData.userPlan}`);
      } else {
        console.log('❌ API request failed:', searchData.error?.message);
      }

      // Test 4: Legacy API key (backward compatibility)
      console.log('\\nTest 4: Legacy API Key Authentication');
      const legacyResponse = await fetch(`${BASE_URL}/api/search?q=comedy movies`, {
        headers: {
          'X-RapidAPI-Key': API_KEY
        }
      });

      const legacyData = await legacyResponse.json();
      
      if (legacyResponse.ok && legacyData.success) {
        console.log('✅ Legacy API key authentication successful');
        console.log(`   Found ${legacyData.total} movies`);
        console.log(`   Auth Method: ${legacyData.authMethod}`);
      } else {
        console.log('❌ Legacy authentication failed:', legacyData.error?.message);
      }

      // Test 5: Token refresh
      console.log('\\nTest 5: Token Refresh');
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      const refreshData = await refreshResponse.json();
      
      if (refreshResponse.ok && refreshData.success) {
        console.log('✅ Token refresh successful');
        console.log(`   New Access Token: ${refreshData.data.accessToken.substring(0, 50)}...`);
      } else {
        console.log('❌ Token refresh failed:', refreshData.error?.message);
      }

      // Test 6: Token revocation
      console.log('\\nTest 6: Token Revocation');
      const revokeResponse = await fetch(`${BASE_URL}/api/auth/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const revokeData = await revokeResponse.json();
      
      if (revokeResponse.ok && revokeData.success) {
        console.log('✅ Token revocation successful');
        console.log(`   Message: ${revokeData.data.message}`);
      } else {
        console.log('❌ Token revocation failed:', revokeData.error?.message);
      }

      // Test 7: Use revoked token (should fail)
      console.log('\\nTest 7: Using Revoked Token');
      const revokedTokenResponse = await fetch(`${BASE_URL}/api/search?q=drama movies`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const revokedTokenData = await revokedTokenResponse.json();
      
      if (revokedTokenResponse.status === 401) {
        console.log('✅ Revoked token correctly rejected');
        console.log(`   Error: ${revokedTokenData.error?.message}`);
      } else {
        console.log('❌ Revoked token was not rejected');
      }

    } else {
      console.log('❌ Login failed:', loginData.error?.message);
    }

  } catch (error) {
    console.error('🔥 Test failed with error:', error.message);
  }

  console.log('\\n🏁 JWT Implementation Tests Complete');
}

// Run the tests
testJWTImplementation();
