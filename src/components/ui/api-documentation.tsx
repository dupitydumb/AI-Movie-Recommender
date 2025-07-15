"use client";

import { useState } from "react";
import { Check, Copy, Terminal, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("introduction");

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "authentication", title: "Authentication" },
    { id: "rate-limits", title: "Rate Limits" },
    { id: "endpoints", title: "Endpoints" },
    { id: "errors", title: "Error Handling" },
    { id: "sdks", title: "SDKs & Libraries" },
  ];

  const endpoints = [
    {
      id: "get-recommendations",
      method: "GET",
      path: "/api/search",
      title: "Get AI Movie Recommendations",
      description:
        "Generate personalized movie recommendations using advanced AI. Simply describe what you're looking for, and our intelligent system will suggest movies tailored to your preferences, mood, or specific criteria.",
      parameters: [
        {
          name: "q",
          type: "string",
          required: true,
          description:
            "Natural language query describing the type of movies you want. Examples: 'romantic comedies from the 90s', 'sci-fi movies with time travel', 'feel-good animated movies for kids'.",
        },
        {
          name: "Authorization",
          type: "string",
          required: true,
          location: "header",
          description: "Bearer token for API authentication (Authorization: Bearer YOUR_API_KEY) or X-RapidAPI-Key header.",
        },
      ],
      response: {
        movies: [
          {
            adult: false,
            backdrop_path: "/wj2nLa0vfS0SLu2vJ6ABTRhMrok.jpg",
            genre_ids: [18],
            id: 334541,
            original_language: "en",
            original_title: "Manchester by the Sea",
            overview:
              "After his older brother passes away, Lee Chandler is forced to return home to care for his 16-year-old nephew...",
            popularity: 37.713,
            poster_path: "/o9VXYOuaJxCEKOxbA86xqtwmqYn.jpg",
            release_date: "2016-11-18",
            title: "Manchester by the Sea",
            video: false,
            vote_average: 7.5,
            vote_count: 5868,
          },
        ],
      },
      codeExamples: {
        curl: `curl -X GET "https://screenpick.fun/api/search?q=romantic%20comedies%20from%20the%2090s" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
        javascript: `// Using fetch API
const response = await fetch('https://screenpick.fun/api/search?q=romantic%20comedies%20from%20the%2090s', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  }
});

const data = await response.json();

if (data.movies) {
  console.log('Found', data.movies.length, 'recommendations');
  data.movies.forEach(movie => {
    console.log(\`\${movie.title} (\${movie.release_date?.split('-')[0]})\`);
  });
} else {
  console.error('Error:', data.error);
}`,
        python: `import requests
import urllib.parse

# Encode the query parameter properly
query = urllib.parse.quote("romantic comedies from the 90s")
url = f"https://screenpick.fun/api/search?q={query}"

response = requests.get(
    url,
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    }
)

if response.status_code == 200:
    data = response.json()
    if 'movies' in data:
        print(f"Found {len(data['movies'])} recommendations:")
        for movie in data['movies']:
            year = movie['release_date'][:4] if movie.get('release_date') else 'Unknown'
            print(f"- {movie['title']} ({year})")
    else:
        print("No movies found")
else:
    print(f"Error {response.status_code}: {response.text}")`,
        node: `const axios = require('axios');

async function getMovieRecommendations(query) {
  try {
    const response = await axios.get('https://screenpick.fun/api/search', {
      params: { q: query },
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      }
    });
    
    const { movies } = response.data;
    
    if (movies && movies.length > 0) {
      console.log(\`🎬 Found \${movies.length} movie recommendations:\`);
      movies.forEach((movie, index) => {
        const year = movie.release_date?.split('-')[0] || 'Unknown';
        const rating = movie.vote_average ? \`⭐ \${movie.vote_average}/10\` : '';
        console.log(\`\${index + 1}. \${movie.title} (\${year}) \${rating}\`);
      });
      return movies;
    } else {
      console.log('No recommendations found for your query.');
      return [];
    }
  } catch (error) {
    if (error.response) {
      console.error(\`API Error \${error.response.status}: \${error.response.data?.error || error.response.statusText}\`);
    } else {
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}

// Example usage
getMovieRecommendations("romantic comedies from the 90s");`,
      },
    },
    {
      id: "get-movie-id",
      method: "GET",
      path: "/api/getID",
      title: "Get Movie Database IDs",
      description: "Retrieve TMDb and IMDb identifiers for movies by title. This endpoint searches our comprehensive movie database and returns matching entries with their corresponding database IDs.",
      parameters: [
        {
          name: "title",
          type: "string",
          required: true,
          description: "The movie title to search for. Partial matches are supported (e.g., 'La La Land', 'Inception', 'The Dark Knight').",
        },
        {
          name: "Authorization",
          type: "string",
          required: true,
          location: "header",
          description: "Bearer token for API authentication or X-RapidAPI-Key header.",
        },
      ],
      response: [
        {
          title: "La La Land (2016)",
          imdb: "tt3783958",
          tmdb: "313369",
        },
        {
          title: "La La Land (Short 2014)",
          imdb: "tt4282966",
          tmdb: "285473",
        }
      ],
      codeExamples: {
        curl: `curl -X GET "https://screenpick.fun/api/getID?title=La%20La%20Land" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        javascript: `// Using fetch API
const response = await fetch('https://screenpick.fun/api/getID?title=La%20La%20Land', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
  }
});

const movies = await response.json();

if (Array.isArray(movies) && !movies[0]?.error) {
  console.log('Found matching movies:');
  movies.forEach(movie => {
    console.log(\`Title: \${movie.title}\`);
    console.log(\`TMDb ID: \${movie.tmdb}\`);
    console.log(\`IMDb ID: \${movie.imdb}\`);
    console.log('---');
  });
} else {
  console.error('Movie not found or error occurred');
}`,
        python: `import requests
import urllib.parse

# URL encode the movie title
title = urllib.parse.quote("La La Land")
url = f"https://screenpick.fun/api/getID?title={title}"

response = requests.get(
    url,
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
    }
)

if response.status_code == 200:
    movies = response.json()
    
    if isinstance(movies, list) and movies and not movies[0].get('error'):
        print(f"Found {len(movies)} matching movie(s):")
        for movie in movies:
            print(f"Title: {movie['title']}")
            print(f"TMDb ID: {movie['tmdb']}")
            print(f"IMDb ID: {movie['imdb']}")
            print("---")
    else:
        print("Movie not found in database")
else:
    print(f"Error {response.status_code}: {response.text}")`,
        node: `const axios = require('axios');

async function getMovieIDs(title) {
  try {
    const response = await axios.get('https://screenpick.fun/api/getID', {
      params: { title },
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      }
    });
    
    const movies = response.data;
    
    if (Array.isArray(movies) && movies.length > 0 && !movies[0].error) {
      console.log(\`🎬 Found \${movies.length} matching movie(s) for "\${title}":\`);
      
      movies.forEach((movie, index) => {
        console.log(\`\n\${index + 1}. \${movie.title}\`);
        console.log(\`   TMDb: https://www.themoviedb.org/movie/\${movie.tmdb}\`);
        console.log(\`   IMDb: https://www.imdb.com/title/\${movie.imdb}\`);
      });
      
      return movies;
    } else {
      console.log(\`❌ No movies found for "\${title}"\`);
      return [];
    }
  } catch (error) {
    if (error.response) {
      console.error(\`API Error \${error.response.status}: \${error.response.data?.error || error.response.statusText}\`);
    } else {
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}

// Example usage
getMovieIDs("La La Land");`,
      },
    },
    {
      id: "health-check",
      method: "GET",
      path: "/api/ping",
      title: "Health Check",
      description: "Simple endpoint to check if the API is running and accessible. Returns the current status of the service.",
      parameters: [],
      response: {
        status: "ok"
      },
      codeExamples: {
        curl: `curl -X GET "https://screenpick.fun/api/ping"`,
        javascript: `// Using fetch API
const response = await fetch('https://screenpick.fun/api/ping');
const status = await response.json();

if (status.status === 'ok') {
  console.log('✅ API is healthy and running');
} else {
  console.log('❌ API might be experiencing issues');
}`,
        python: `import requests

try:
    response = requests.get('https://screenpick.fun/api/ping', timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'ok':
            print("✅ API is healthy and running")
        else:
            print("❌ API returned unexpected status")
    else:
        print(f"❌ API health check failed: {response.status_code}")
        
except requests.exceptions.RequestException as e:
    print(f"❌ Failed to reach API: {e}")`,
        node: `const axios = require('axios');

async function checkAPIHealth() {
  try {
    const response = await axios.get('https://screenpick.fun/api/ping', {
      timeout: 5000 // 5 second timeout
    });
    
    if (response.data.status === 'ok') {
      console.log('✅ API is healthy and running');
      return true;
    } else {
      console.log('❌ API returned unexpected status:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    return false;
  }
}

// Example usage
checkAPIHealth();`,
      },
    },
  ];

  return (
    <div className="mx-auto px-4 max-w-7xl">
      {/* Header Section with new styling */}
      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Screenpick API
          </span>
          <br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
            Documentation
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Integrate AI-powered movie recommendations into your applications with
          our simple and powerful API.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-0">
        {/* Sidebar Navigation with updated styling */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800/50 p-6 sticky top-24 backdrop-blur-sm">
            <h3 className="font-bold text-lg mb-6 text-white">Documentation</h3>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {section.title}
                </a>
              ))}
            </nav>

            <h3 className="font-bold text-lg mt-8 mb-6 text-white">Endpoints</h3>
            <nav className="space-y-2">
              {endpoints.map((endpoint) => (
                <a
                  key={endpoint.id}
                  href={`#${endpoint.id}`}
                  className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(endpoint.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {endpoint.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content with updated styling */}
        <div className="flex-1 min-w-0 bg-gray-900/50 rounded-2xl border border-gray-800/50 p-4 md:p-8 backdrop-blur-sm overflow-hidden">
          {/* Introduction */}
          <section id="introduction" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Introduction</h2>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 leading-relaxed text-lg">
                Welcome to the <strong>Screenpick API</strong> – your gateway to intelligent, AI-powered movie discovery. 
                Our sophisticated recommendation engine leverages advanced machine learning algorithms to understand 
                natural language queries and deliver personalized movie suggestions that match your exact preferences, 
                mood, or specific criteria.
              </p>
              
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6 my-6">
                <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  What Makes Screenpick Special
                </h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Natural Language Processing:</strong> Describe what you want in plain English – no complex filters needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Contextual Understanding:</strong> Our AI grasps nuanced requests like "uplifting movies for rainy days" or "mind-bending sci-fi without horror elements"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Rich Movie Data:</strong> Get comprehensive movie information from The Movie Database (TMDb) including ratings, release dates, and plot summaries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Cross-Database Integration:</strong> Seamlessly retrieve both TMDb and IMDb identifiers for external integrations</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Perfect For Developers</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Integrate intelligent movie recommendations into your apps, websites, or services. 
                    Our RESTful API is designed for easy integration with comprehensive documentation and code examples.
                  </p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Enterprise Ready</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Built with scalability and reliability in mind, featuring rate limiting, comprehensive error handling, 
                    and multiple authentication options to meet enterprise requirements.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">API Architecture</h3>
              <p className="text-gray-300 leading-relaxed">
                The Screenpick API follows RESTful principles and returns responses in JSON format. All endpoints 
                support CORS for browser-based applications and require HTTPS for secure communication. Our API 
                is built on a modern, scalable infrastructure ensuring fast response times and high availability.
              </p>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">Base URL</h3>
              <div className="bg-gray-800/70 border border-gray-700/50 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 group hover:border-red-500/30 transition-all duration-300">
                <code className="text-red-400 font-mono text-sm sm:text-lg break-all">https://screenpick.fun/api/</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard("https://screenpick.fun/api/", "base-url")
                  }
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                >
                  {copiedEndpoint === "base-url" ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mt-6">
                <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  💡 Pro Tip
                </h4>
                <p className="text-blue-100 text-sm">
                  Start with our health check endpoint (<code>/api/ping</code>) to verify connectivity, 
                  then explore our AI recommendations endpoint with simple queries like "popular comedies" 
                  or "award-winning dramas from the 2010s" to see the power of our natural language processing.
                </p>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Authentication</h2>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 leading-relaxed">
                The Screenpick API uses API key authentication to ensure secure access to our services. 
                All API requests require a valid API key that identifies your application and tracks usage 
                against your plan limits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Getting Your API Key
                  </h4>
                  <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                    <li>Visit <a href="https://rapidapi.com/AirFU/api/ai-movie-recommender" className="text-red-400 hover:text-red-300 underline break-words" target="_blank" rel="noopener noreferrer">RapidAPI Marketplace</a></li>
                    <li>Create a free RapidAPI account or sign in</li>
                    <li>Subscribe to the Screenpick API plan that fits your needs</li>
                    <li>Copy your unique API key from the dashboard</li>
                  </ol>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Authentication Methods
                  </h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li><strong>Authorization Header:</strong> Bearer token (recommended)</li>
                    <li><strong>X-RapidAPI-Key Header:</strong> Direct API key</li>
                    <li><strong>Query Parameter:</strong> apiKey parameter (for testing only)</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">Authentication Methods</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Method 1: Authorization Header (Recommended)</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Include your API key in the Authorization header using the Bearer token format:
                  </p>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                    <code className="text-red-400 font-mono text-sm whitespace-nowrap">Authorization: Bearer YOUR_API_KEY</code>
                  </div>
                </div>

                <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Method 2: X-RapidAPI-Key Header</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    For RapidAPI integration, use the X-RapidAPI-Key header:
                  </p>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                    <code className="text-red-400 font-mono text-sm whitespace-nowrap">X-RapidAPI-Key: YOUR_RAPIDAPI_KEY</code>
                  </div>
                </div>

                <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Method 3: Query Parameter (Testing Only)</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    For quick testing, you can include the API key as a query parameter:
                  </p>
                  <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                    <code className="text-red-400 font-mono text-sm break-all">https://screenpick.fun/api/search?apiKey=YOUR_API_KEY&q=action+movies</code>
                  </div>
                  <p className="text-yellow-400 text-xs mt-2">
                    ⚠️ Not recommended for production use due to potential exposure in logs
                  </p>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 mt-6">
                <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                  🔒 Security Best Practices
                </h4>
                <ul className="text-red-100 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Never expose API keys in client-side code</strong> – Always make API calls from your server</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Store API keys as environment variables</strong> – Don't hardcode them in your source code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Implement rate limiting</strong> on your end to avoid hitting API limits unexpectedly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Monitor your usage</strong> regularly through the RapidAPI dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>Rotate API keys periodically</strong> for enhanced security</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mt-6">
                <h4 className="text-white font-semibold mb-3">Example Authentication Headers</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">cURL:</p>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                      <code className="text-green-400 font-mono text-sm whitespace-nowrap">curl -H "Authorization: Bearer your_api_key_here"</code>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">JavaScript (fetch):</p>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                      <code className="text-green-400 font-mono text-sm break-all">headers: &#123; 'Authorization': 'Bearer your_api_key_here' &#125;</code>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Python (requests):</p>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-600 overflow-x-auto">
                      <code className="text-green-400 font-mono text-sm break-all">headers = &#123;'Authorization': 'Bearer your_api_key_here'&#125;</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Rate Limits</h2>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 leading-relaxed">
                To ensure fair usage and maintain optimal service performance for all users, the Screenpick API 
                implements intelligent rate limiting. Our rate limits are designed to accommodate both casual 
                developers and high-volume enterprise applications.
              </p>

              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">How Rate Limiting Works</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Sliding Window</h4>
                    <p className="text-gray-300">
                      We use a sliding window approach that provides more flexible usage patterns compared to fixed windows.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Per-Key Tracking</h4>
                    <p className="text-gray-300">
                      Rate limits are tracked individually for each API key, ensuring your usage doesn't affect others.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">Rate Limit Tiers</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-gray-800/50 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-gray-700/50">
                      <th className="border border-gray-600 px-6 py-4 text-left font-bold text-white">Plan</th>
                      <th className="border border-gray-600 px-6 py-4 text-left font-bold text-white">Daily Requests</th>
                      <th className="border border-gray-600 px-6 py-4 text-left font-bold text-white">Per Minute</th>
                      <th className="border border-gray-600 px-6 py-4 text-left font-bold text-white">Features</th>
                      <th className="border border-gray-600 px-6 py-4 text-left font-bold text-white">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span className="font-semibold text-green-400">Free</span>
                        </div>
                      </td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">15 requests</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">1 request</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Basic AI recommendations</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Testing & prototyping</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                          <span className="font-semibold text-blue-400">Basic</span>
                        </div>
                      </td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">2,500 requests</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">10 requests</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">All endpoints + priority support</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Small applications</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                          <span className="font-semibold text-purple-400">Pro</span>
                        </div>
                      </td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">10,000 requests</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">50 requests</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Enhanced AI + analytics dashboard</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Production apps</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          <span className="font-semibold text-red-400">Enterprise</span>
                        </div>
                      </td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Custom limits</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">Custom burst</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">White-label + SLA + dedicated support</td>
                      <td className="border border-gray-600 px-6 py-4 text-gray-300">High-volume enterprise</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Rate Limit Headers</h4>
                  <p className="text-gray-300 text-sm mb-4">Every API response includes rate limit information in the headers:</p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex justify-between items-center gap-2">
                      <code className="text-blue-400 text-xs">X-RateLimit-Limit</code>
                      <span className="text-gray-400 text-xs">Daily limit</span>
                    </li>
                    <li className="flex justify-between items-center gap-2">
                      <code className="text-blue-400 text-xs">X-RateLimit-Remaining</code>
                      <span className="text-gray-400 text-xs">Remaining requests</span>
                    </li>
                    <li className="flex justify-between items-center gap-2">
                      <code className="text-blue-400 text-xs">X-RateLimit-Reset</code>
                      <span className="text-gray-400 text-xs">Reset timestamp</span>
                    </li>
                    <li className="flex justify-between items-center gap-2">
                      <code className="text-blue-400 text-xs">X-RateLimit-Window</code>
                      <span className="text-gray-400 text-xs">Window period</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-white mb-3">Handling Rate Limits</h4>
                  <p className="text-gray-300 text-sm mb-4">Best practices for rate limit management:</p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Check rate limit headers in responses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Implement exponential backoff for 429 errors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Cache responses when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>Use batch requests for multiple queries</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6 mt-6">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                  ⚡ Rate Limit Response (HTTP 429)
                </h4>
                <p className="text-yellow-100 text-sm mb-3">
                  When you exceed your rate limit, you'll receive a 429 Too Many Requests response:
                </p>
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 overflow-x-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
{JSON.stringify({
  error: "Rate limit exceeded",
  message: "You have exceeded your daily request limit. Please upgrade your plan or try again tomorrow.",
  limit: 15,
  remaining: 0,
  resetTime: "2024-01-01T00:00:00Z"
}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section id="endpoints" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Endpoints</h2>

            {endpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                id={endpoint.id}
                className="mb-12 border border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-800 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
                        endpoint.method === "GET"
                          ? "bg-green-600"
                          : endpoint.method === "POST"
                          ? "bg-blue-600"
                          : endpoint.method === "PUT"
                          ? "bg-yellow-600"
                          : endpoint.method === "DELETE"
                          ? "bg-red-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm truncate">{endpoint.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `https://screenpick.fun${endpoint.path}`,
                        endpoint.id
                      )
                    }
                    className="shrink-0"
                  >
                    {copiedEndpoint === endpoint.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="p-4 md:p-6 min-w-0">
                  <h3 className="text-xl font-bold mb-2 break-words">{endpoint.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{endpoint.description}</p>

                  {/* Parameters */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-white">Parameters</h4>
                    {endpoint.parameters.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-gray-800/30 rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-gray-700/50">
                              <th className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">Name</th>
                              <th className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">Type</th>
                              <th className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">Location</th>
                              <th className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">Required</th>
                              <th className="border border-gray-600 px-4 py-3 text-left font-semibold text-white">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.parameters.map((param) => (
                              <tr key={param.name} className="hover:bg-gray-700/20 transition-colors">
                                <td className="border border-gray-600 px-4 py-3">
                                  <code className="font-mono text-sm bg-gray-900/50 px-2 py-1 rounded text-blue-400">
                                    {param.name}
                                  </code>
                                </td>
                                <td className="border border-gray-600 px-4 py-3">
                                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold">
                                    {param.type}
                                  </span>
                                </td>
                                <td className="border border-gray-600 px-4 py-3">
                                  <span className="px-2 py-1 bg-gray-600/50 text-gray-300 rounded text-xs">
                                    {param.location || 'query'}
                                  </span>
                                </td>
                                <td className="border border-gray-600 px-4 py-3">
                                  {param.required ? (
                                    <span className="flex items-center gap-1 text-green-400">
                                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-gray-400">
                                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                      No
                                    </span>
                                  )}
                                  {!param.required && "default" in param && (
                                    <div className="text-gray-400 text-xs mt-1">
                                      Default: <code className="bg-gray-900/50 px-1 rounded">{JSON.stringify(param.default)}</code>
                                    </div>
                                  )}
                                </td>
                                <td className="border border-gray-600 px-4 py-3 text-gray-300 text-sm leading-relaxed">
                                  {param.description}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-800/30 border border-gray-600 rounded-lg p-6 text-center">
                        <p className="text-gray-400">No parameters required for this endpoint.</p>
                      </div>
                    )}
                  </div>

                  {/* Response */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-white">Response Format</h4>
                    <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden">
                      <div className="bg-gray-700/50 px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">JSON Response</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(JSON.stringify(endpoint.response, null, 2), `${endpoint.id}-response`)
                          }
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          {copiedEndpoint === `${endpoint.id}-response` ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="p-4 overflow-auto max-h-96 min-w-0">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                          <code>
                            {JSON.stringify(endpoint.response, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Code Examples */}
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Code Examples
                    </h4>
                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="mb-2">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="node">Node.js</TabsTrigger>
                      </TabsList>
                      <TabsContent value="curl" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md overflow-x-auto min-w-0">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        <code>{endpoint.codeExamples.curl}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="javascript" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md overflow-x-auto min-w-0">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        <code>{endpoint.codeExamples.javascript}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md overflow-x-auto min-w-0">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        <code>{endpoint.codeExamples.python}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="node" className="mt-0">
                    <div className="bg-gray-800 p-4 rounded-md overflow-x-auto min-w-0">
                      <pre className="text-sm whitespace-pre-wrap break-words">
                        <code>{endpoint.codeExamples.node}</code>
                      </pre>
                    </div>
                  </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Error Handling */}
          <section id="errors" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Error Handling</h2>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 leading-relaxed">
                The Screenpick API uses conventional HTTP response codes to indicate the success or failure of requests. 
                Our error responses include detailed information to help you quickly identify and resolve issues.
              </p>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                <h3 className="text-xl font-bold text-white bg-gray-700/50 px-6 py-4">HTTP Status Codes</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700/30">
                      <th className="border border-gray-600 px-6 py-3 text-left font-semibold text-white">Code</th>
                      <th className="border border-gray-600 px-6 py-3 text-left font-semibold text-white">Status</th>
                      <th className="border border-gray-600 px-6 py-3 text-left font-semibold text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-green-500/20 text-green-400 px-2 py-1 rounded font-mono text-sm">200</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-green-400 font-semibold">OK</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Request completed successfully</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono text-sm">400</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-red-400 font-semibold">Bad Request</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Invalid request parameters or malformed request</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono text-sm">401</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-red-400 font-semibold">Unauthorized</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Missing or invalid API key</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-mono text-sm">403</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-orange-400 font-semibold">Forbidden</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Valid API key but insufficient permissions</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono text-sm">404</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-red-400 font-semibold">Not Found</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Requested resource or endpoint doesn't exist</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-mono text-sm">429</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-yellow-400 font-semibold">Too Many Requests</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Rate limit exceeded - slow down your requests</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono text-sm">500</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-red-400 font-semibold">Internal Server Error</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">Something went wrong on our servers</td>
                    </tr>
                    <tr className="hover:bg-gray-700/20 transition-colors">
                      <td className="border border-gray-600 px-6 py-3">
                        <code className="bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono text-sm">503</code>
                      </td>
                      <td className="border border-gray-600 px-6 py-3 text-red-400 font-semibold">Service Unavailable</td>
                      <td className="border border-gray-600 px-6 py-3 text-gray-300">API is temporarily down for maintenance</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">Error Response Format</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                When an error occurs, the API returns a structured JSON response with detailed error information 
                to help you understand and resolve the issue quickly:
              </p>
              
              <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-2">
                  <span className="text-sm font-semibold text-gray-300">Standard Error Response</span>
                </div>
                <div className="p-4 overflow-auto">
                  <pre className="text-sm text-gray-300">
                    <code>
                      {JSON.stringify(
                        {
                          error: {
                            code: "invalid_request",
                            message: "The request was invalid. Please check your parameters.",
                            details: "The 'q' parameter is required for movie recommendations.",
                            timestamp: "2024-01-15T10:30:00Z",
                            requestId: "req_abc123def456"
                          },
                        },
                        null,
                        2
                      )}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                  <h4 className="text-red-400 font-semibold mb-3">Common Error Codes</h4>
                  <ul className="text-red-100 text-sm space-y-2">
                    <li className="break-words"><code className="bg-red-500/20 px-1 rounded">missing_parameter</code> - Required parameter not provided</li>
                    <li className="break-words"><code className="bg-red-500/20 px-1 rounded">invalid_api_key</code> - API key is malformed or invalid</li>
                    <li className="break-words"><code className="bg-red-500/20 px-1 rounded">rate_limit_exceeded</code> - Too many requests sent</li>
                    <li className="break-words"><code className="bg-red-500/20 px-1 rounded">service_unavailable</code> - AI service temporarily down</li>
                    <li className="break-words"><code className="bg-red-500/20 px-1 rounded">query_too_long</code> - Search query exceeds maximum length</li>
                  </ul>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                  <h4 className="text-blue-400 font-semibold mb-3">Error Handling Best Practices</h4>
                  <ul className="text-blue-100 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 shrink-0">•</span>
                      <span>Always check the HTTP status code first</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 shrink-0">•</span>
                      <span>Parse the error response JSON for detailed information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 shrink-0">•</span>
                      <span>Implement exponential backoff for 429 and 5xx errors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 shrink-0">•</span>
                      <span>Log the requestId for support tickets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1 shrink-0">•</span>
                      <span>Show user-friendly messages based on error types</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mt-6">
                <h4 className="text-white font-semibold mb-3">Example Error Handling Code</h4>
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="mb-4 bg-gray-700/50">
                    <TabsTrigger value="javascript" className="data-[state=active]:bg-red-500/20">JavaScript</TabsTrigger>
                    <TabsTrigger value="python" className="data-[state=active]:bg-red-500/20">Python</TabsTrigger>
                    <TabsTrigger value="node" className="data-[state=active]:bg-red-500/20">Node.js</TabsTrigger>
                  </TabsList>
                  <TabsContent value="javascript" className="mt-0">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 overflow-x-auto min-w-0">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                        <code>{`async function handleApiResponse(response) {
  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 400:
        throw new Error(\`Bad Request: \${errorData.error.message}\`);
      case 401:
        throw new Error('Invalid API key. Please check your credentials.');
      case 429:
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new Error(\`Rate limit exceeded. Retry after \${retryAfter} seconds.\`);
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(\`API Error: \${errorData.error.message}\`);
    }
  }
  
  return await response.json();
}`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python" className="mt-0">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 overflow-x-auto min-w-0">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                        <code>{`import requests
import time

def handle_api_request(url, headers):
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 60))
            print(f"Rate limited. Waiting {retry_after} seconds...")
            time.sleep(retry_after)
            return handle_api_request(url, headers)  # Retry
        else:
            error_data = response.json()
            raise Exception(f"API Error {response.status_code}: {error_data['error']['message']}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Network error: {str(e)}")`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="node" className="mt-0">
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 overflow-x-auto min-w-0">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
                        <code>{`const axios = require('axios');

async function apiRequest(url, config = {}) {
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(\`Bad Request: \${data.error.message}\`);
        case 401:
          throw new Error('Unauthorized: Check your API key');
        case 429:
          const retryAfter = error.response.headers['retry-after'] || 60;
          console.log(\`Rate limited. Retrying after \${retryAfter} seconds...\`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return apiRequest(url, config); // Retry
        case 500:
          throw new Error('Internal server error. Please try again later.');
        default:
          throw new Error(\`API Error \${status}: \${data.error.message}\`);
      }
    } else {
      throw new Error(\`Network error: \${error.message}\`);
    }
  }
}`}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>

          {/* SDKs & Libraries */}
          <section id="sdks" className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">SDKs & Libraries</h2>
            <div className="prose prose-invert max-w-none space-y-6">
              <p className="text-gray-300 leading-relaxed">
                While the Screenpick API is simple enough to use with any HTTP library, we've created SDKs and 
                helper libraries to make integration even easier. These libraries handle authentication, error 
                handling, and provide convenient methods for common use cases.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-sm">JS</span>
                    </div>
                    <h3 className="text-lg font-bold text-yellow-400">JavaScript SDK</h3>
                  </div>
                  <p className="text-yellow-100 text-sm mb-4">
                    Full-featured SDK for browser and Node.js environments with TypeScript support.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-900 p-2 rounded text-xs">
                      <code className="text-gray-300">npm install screenpick-js</code>
                    </div>
                    <a href="#" className="text-yellow-400 hover:text-yellow-300 text-sm underline block">
                      View on GitHub →
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm">PY</span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-400">Python SDK</h3>
                  </div>
                  <p className="text-blue-100 text-sm mb-4">
                    Pythonic SDK with async support, perfect for data science and web applications.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-900 p-2 rounded text-xs">
                      <code className="text-gray-300">pip install screenpick-python</code>
                    </div>
                    <a href="#" className="text-blue-400 hover:text-blue-300 text-sm underline block">
                      View on PyPI →
                    </a>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-green-400 font-bold text-sm">GO</span>
                    </div>
                    <h3 className="text-lg font-bold text-green-400">Go SDK</h3>
                  </div>
                  <p className="text-green-100 text-sm mb-4">
                    Lightweight and fast Go client with built-in concurrency support.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-gray-900 p-2 rounded text-xs">
                      <code className="text-gray-300">go get github.com/screenpick/go-sdk</code>
                    </div>
                    <a href="#" className="text-green-400 hover:text-green-300 text-sm underline block">
                      View on GitHub →
                    </a>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">Quick Start Examples</h3>
              
              <Tabs defaultValue="javascript-sdk" className="w-full">
                <TabsList className="mb-4 bg-gray-700/50">
                  <TabsTrigger value="javascript-sdk" className="data-[state=active]:bg-red-500/20">JavaScript SDK</TabsTrigger>
                  <TabsTrigger value="python-sdk" className="data-[state=active]:bg-red-500/20">Python SDK</TabsTrigger>
                  <TabsTrigger value="go-sdk" className="data-[state=active]:bg-red-500/20">Go SDK</TabsTrigger>
                </TabsList>
                
                <TabsContent value="javascript-sdk" className="mt-0">
                  <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="bg-gray-700/50 px-4 py-2">
                      <span className="text-sm font-semibold text-gray-300">screenpick-js SDK</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
                        <code>{`import { ScreenpickClient } from 'screenpick-js';

// Initialize the client
const client = new ScreenpickClient({
  apiKey: 'your_api_key_here',
  timeout: 10000, // 10 seconds
});

// Get movie recommendations
async function getRecommendations() {
  try {
    const movies = await client.recommendations.search({
      query: 'romantic comedies from the 90s',
      limit: 10
    });
    
    console.log(\`Found \${movies.length} recommendations:\`);
    movies.forEach(movie => {
      console.log(\`- \${movie.title} (\${movie.release_date?.split('-')[0]})\`);
    });
    
    return movies;
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      console.log('Rate limit hit, waiting before retry...');
      await client.waitForRateLimit();
      return getRecommendations(); // Retry
    }
    throw error;
  }
}

// Get movie IDs
async function getMovieIDs(title) {
  const ids = await client.movies.getIDs(title);
  return ids;
}

// Check API health
const isHealthy = await client.health.check();`}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="python-sdk" className="mt-0">
                  <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="bg-gray-700/50 px-4 py-2">
                      <span className="text-sm font-semibold text-gray-300">screenpick-python SDK</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
                        <code>{`from screenpick import ScreenpickClient
import asyncio

# Initialize the client
client = ScreenpickClient(
    api_key="your_api_key_here",
    timeout=10.0,
    max_retries=3
)

# Synchronous usage
def get_recommendations_sync():
    try:
        movies = client.recommendations.search(
            query="romantic comedies from the 90s",
            limit=10
        )
        
        print(f"Found {len(movies)} recommendations:")
        for movie in movies:
            year = movie.release_date[:4] if movie.release_date else "Unknown"
            print(f"- {movie.title} ({year})")
            
        return movies
    except ScreenpickRateLimitError as e:
        print(f"Rate limited. Retry after {e.retry_after} seconds")
        time.sleep(e.retry_after)
        return get_recommendations_sync()

# Async usage
async def get_recommendations_async():
    async with ScreenpickClient.async_client(api_key="your_key") as client:
        movies = await client.recommendations.search(
            query="sci-fi movies with time travel"
        )
        return movies

# Batch requests
movies = client.batch([
    client.recommendations.search("action movies"),
    client.movies.get_ids("Inception"),
    client.health.check()
])

# Run async function
recommendations = asyncio.run(get_recommendations_async())`}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="go-sdk" className="mt-0">
                  <div className="bg-gray-800/70 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="bg-gray-700/50 px-4 py-2">
                      <span className="text-sm font-semibold text-gray-300">Go SDK</span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <pre className="text-sm text-gray-300">
                        <code>{`package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "github.com/screenpick/go-sdk/screenpick"
)

func main() {
    // Initialize client
    client := screenpick.NewClient(&screenpick.Config{
        APIKey:     "your_api_key_here",
        Timeout:    10 * time.Second,
        MaxRetries: 3,
    })
    
    ctx := context.Background()
    
    // Get recommendations
    movies, err := client.Recommendations.Search(ctx, &screenpick.SearchRequest{
        Query: "romantic comedies from the 90s",
        Limit: 10,
    })
    if err != nil {
        log.Fatal(err)
    }
    
    fmt.Printf("Found %d recommendations:\\n", len(movies))
    for _, movie := range movies {
        year := "Unknown"
        if movie.ReleaseDate != "" {
            year = movie.ReleaseDate[:4]
        }
        fmt.Printf("- %s (%s)\\n", movie.Title, year)
    }
    
    // Get movie IDs with context timeout
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    
    ids, err := client.Movies.GetIDs(ctx, "Inception")
    if err != nil {
        log.Printf("Error getting movie IDs: %v", err)
        return
    }
    
    for _, id := range ids {
        fmt.Printf("Movie: %s, TMDB: %s, IMDB: %s\\n", 
            id.Title, id.TMDB, id.IMDB)
    }
    
    // Concurrent requests
    movieChan := make(chan []screenpick.Movie, 3)
    queries := []string{
        "action movies",
        "horror films",
        "documentaries",
    }
    
    for _, query := range queries {
        go func(q string) {
            movies, _ := client.Recommendations.Search(ctx, &screenpick.SearchRequest{
                Query: q,
                Limit: 5,
            })
            movieChan <- movies
        }(query)
    }
    
    // Collect results
    for i := 0; i < len(queries); i++ {
        movies := <-movieChan
        fmt.Printf("Query %d returned %d movies\\n", i+1, len(movies))
    }
}`}</code>
                      </pre>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6 mt-8">
                <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  🛠️ Community Libraries
                </h4>
                <p className="text-purple-100 text-sm mb-4">
                  Don't see your favorite language? The community has created unofficial libraries:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-white mb-1">PHP</div>
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">screenpick-php</a>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-white mb-1">Ruby</div>
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">screenpick-rb</a>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-white mb-1">Rust</div>
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">screenpick-rs</a>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                    <div className="font-semibold text-white mb-1">C#</div>
                    <a href="#" className="text-purple-400 hover:text-purple-300 underline">Screenpick.NET</a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Get API Key CTA */}
          <div className="bg-gradient-to-r from-red-900/30 via-purple-900/30 to-pink-900/30 border border-red-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Build Something Amazing?
              </h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Join thousands of developers who are already using Screenpick to power their movie recommendation features. 
                Get started with our free tier and scale as you grow.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 text-sm">
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <div className="text-green-400 font-semibold mb-1">✅ Free Tier Available</div>
                  <div className="text-gray-400">15 requests/day to get started</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center">
                  <div className="text-blue-400 font-semibold mb-1">⚡ Fast Integration</div>
                  <div className="text-gray-400">RESTful API with SDKs</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-purple-400 font-semibold mb-1">🧠 AI-Powered</div>
                  <div className="text-gray-400">Natural language processing</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25">
                    Get Your Free API Key
                  </Button>
                </a>
                <a
                  href="https://github.com/screenpick/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto"
                >
                  <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-xl transition-all duration-300">
                    View Examples
                  </Button>
                </a>
              </div>

              <p className="text-gray-400 text-sm mt-6 text-center break-words">
                Need help getting started? Check out our{" "}
                <a href="/docs/quickstart" className="text-red-400 hover:text-red-300 underline">
                  quickstart guide
                </a>{" "}
                or{" "}
                <a href="mailto:support@screenpick.fun" className="text-red-400 hover:text-red-300 underline break-words">
                  contact our support team
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
