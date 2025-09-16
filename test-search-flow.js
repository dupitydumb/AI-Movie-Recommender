// Test the new search flow: AI → TMDB → Results
async function testSearchFlow() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing New Search Flow: AI → TMDB → Results\n');
  
  try {
    // First generate a test token
    console.log('📝 Step 1: Generating test token...');
    const tokenResponse = await fetch(`${baseUrl}/api/auth/test-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const tokenData = await tokenResponse.json();
    if (!tokenData.success) {
      throw new Error('Failed to generate test token');
    }
    
    const { accessToken } = tokenData.tokens;
    console.log('✅ Token generated successfully');
    
    // Test different search queries
    const testQueries = [
      'sad movies',
      'action movies',
      'romantic comedies',
      'sci-fi thriller',
      'horror movies'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🎬 Testing query: "${query}"`);
      
      const searchResponse = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const searchData = await searchResponse.json();
      
      if (searchData.success) {
        console.log(`✅ Found ${searchData.movies.length} movies`);
        console.log('📋 Movie titles:');
        searchData.movies.slice(0, 5).forEach((movie, index) => {
          console.log(`   ${index + 1}. ${movie.title} (${movie.release_date?.substring(0, 4) || 'Unknown'}) - Rating: ${movie.vote_average}`);
        });
      } else {
        console.log(`❌ Search failed: ${searchData.error?.message || 'Unknown error'}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Search flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSearchFlow();
