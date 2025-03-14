"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
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
      method: "POST",
      path: "/api/search",
      title: "Get Movie Recommendations",
      description:
        "Get personalized movie recommendations based on a text prompt.",
      parameters: [
        {
          name: "prompt",
          type: "string",
          required: true,
          description:
            "The text prompt describing the type of movies the user is looking for.",
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
              "After his older brother passes away, Lee Chandler is forced to return home to care for his 16-year-old nephe...",
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
        curl: `curl -X POST https://screenpick.fun/api/search?q=sad+movies+with+time+travel \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Sci-fi movies with time travel",
    "limit": 4,
    "include_details": true
  }'`,
        javascript: `// Using fetch
const response = await fetch('https://screenpick.fun/api/search?q=sad+movies+with+time+travel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Sci-fi movies with time travel'
  }),
});

const data = await response.json();
console.log(data.movies);`,
        python: `import requests

response = requests.post(
    'https://screenpick.fun/api/search?q=sad+movies+with+time+travel',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'Sci-fi movies with time travel'
    }
)

data = response.json()
print(data['movies'])`,
        node: `const axios = require('axios');

async function getRecommendations() {
  try {
    const response = await axios.post('https://screenpick.fun/api/search?q=sad+movies+with+time+travel', {
      prompt: 'Sci-fi movies with time travel'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
      }
    });
    
    console.log(response.data.movies);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

getRecommendations();`,
      },
    },
    {
      id: "get-movie-id",
      method: "GET",
      path: "/api/getID",
      title: "GET Movie ID (TMDB/IMDb)",
      description: "Get detailed information about a specific movie.",
      parameters: [
        {
          name: "title",
          type: "string",
          required: true,
          description: "Title of the movie.",
        },
      ],
      response: {
        title: "La La Land (2016)",
        imdb: "tt126361",
        tmdb: "34661",
      },
      codeExamples: {
        curl: `curl -X GET https://screenpick.fun/api/getID?title=La+La+Land',
 \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
        javascript: `// Using fetch
const response = await fetch('https://screenpick.fun/api/getID?title=La+La+Land',
', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
  },
});

const movie = await response.json();
console.log(movie);`,
        python: `import requests

response = requests.get(
    'https://screenpick.fun/api/getID?title=La+La+Land',

    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
    }
)

movie = response.json()
print(movie)`,
        node: `const axios = require('axios');

async function getMovieDetails() {
  try {
    const response = await axios.get('https://screenpick.fun/api/getID?title=La+La+Land', {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      }
    });
    
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

getMovieDetails();`,
      },
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Screenpick API Documentation
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Integrate AI-powered movie recommendations into your applications with
          our simple and powerful API.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-64 shrink-0">
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 sticky top-24">
            <h3 className="font-semibold text-lg mb-4">Documentation</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block px-3 py-2 rounded-md text-sm ${
                    activeSection === section.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700/50"
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

            <h3 className="font-semibold text-lg mt-6 mb-4">Endpoints</h3>
            <nav className="space-y-1">
              {endpoints.map((endpoint) => (
                <a
                  key={endpoint.id}
                  href={`#${endpoint.id}`}
                  className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700/50"
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

        {/* Main Content */}
        <div className="flex-1">
          {/* Introduction */}
          <section id="introduction" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                The AI Movie Recommender is a web application that uses AI to
                help you discover your next favorite movie. The application is
                built with Next.js, React, and Tailwind CSS. It uses the TMDB
                API to fetch movie data and the OpenAI API to generate movie
                recommendations based on your preferences. To get started with
                the application, simply type in the search bar and press enter.
                The application will then display a list of movies that match
                your search query. You can click on a movie to view its details,
                including its title, release year, genres, and a short summary.
              </p>
              <p>
                Our API is RESTful and returns responses in JSON format. All API
                requests must be made over HTTPS.
              </p>
              <h3>Base URL</h3>
              <div className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                <code>https://screenpick.fun/api/</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard("https://api.Screenpick.io", "base-url")
                  }
                >
                  {copiedEndpoint === "base-url" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Authentication</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                All API requests require authentication using an API key. You
                can obtain an API key by signing up for a developer account on
                the Screenpick platform.
              </p>
              <p>
                Include your API key in the <code>Authorization</code> header of
                all requests:
              </p>
              <div className="bg-gray-800 p-3 rounded-md">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>
              <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded-r-md mt-4">
                <h4 className="text-yellow-400 font-semibold">Security Note</h4>
                <p className="text-yellow-100 mt-1">
                  Keep your API key secure and never expose it in client-side
                  code. Always make API requests from your server.
                </p>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                To ensure fair usage and service stability, the Screenpick API
                implements rate limiting.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-700 px-4 py-2 text-left">
                      Plan
                    </th>
                    <th className="border border-gray-700 px-4 py-2 text-left">
                      Rate Limit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">Free</td>
                    <td className="border border-gray-700 px-4 py-2">
                      15 requests per day
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">Basic</td>
                    <td className="border border-gray-700 px-4 py-2">
                      2,500 requests per day
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">Pro</td>
                    <td className="border border-gray-700 px-4 py-2">
                      10,000 requests per day
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      Enterprise
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      Custom limits
                    </td>
                  </tr>
                </tbody>
              </table>
              <p>Rate limit information is included in the response headers:</p>
              <ul>
                <li>
                  <code>X-RateLimit-Limit</code>: The maximum number of requests
                  allowed per day
                </li>
                <li>
                  <code>X-RateLimit-Remaining</code>: The number of requests
                  remaining in the current period
                </li>
                <li>
                  <code>X-RateLimit-Reset</code>: The time at which the current
                  rate limit window resets (Unix timestamp)
                </li>
              </ul>
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
                <div className="bg-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
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
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `https://api.Screenpick.io${endpoint.path}`,
                        endpoint.id
                      )
                    }
                  >
                    {copiedEndpoint === endpoint.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{endpoint.title}</h3>
                  <p className="text-gray-300 mb-6">{endpoint.description}</p>

                  {/* Parameters */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Parameters</h4>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-700 px-4 py-2 text-left">
                            Name
                          </th>
                          <th className="border border-gray-700 px-4 py-2 text-left">
                            Type
                          </th>
                          <th className="border border-gray-700 px-4 py-2 text-left">
                            Required
                          </th>
                          <th className="border border-gray-700 px-4 py-2 text-left">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.parameters.map((param) => (
                          <tr key={param.name}>
                            <td className="border border-gray-700 px-4 py-2 font-mono text-sm">
                              {param.name}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                              {param.type}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                              {param.required ? (
                                <span className="text-green-500">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                              {!param.required && "default" in param && (
                                <span className="text-gray-400 ml-2">
                                  (Default:{" "}
                                  <code>{JSON.stringify(param.default)}</code>)
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                              {param.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Response */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Response</h4>
                    <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                      <pre className="text-sm">
                        <code>
                          {JSON.stringify(endpoint.response, null, 2)}
                        </code>
                      </pre>
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
                        <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                          <pre className="text-sm">
                            <code>{endpoint.codeExamples.curl}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="javascript" className="mt-0">
                        <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                          <pre className="text-sm">
                            <code>{endpoint.codeExamples.javascript}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="python" className="mt-0">
                        <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                          <pre className="text-sm">
                            <code>{endpoint.codeExamples.python}</code>
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="node" className="mt-0">
                        <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                          <pre className="text-sm">
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
            <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
            <div className="prose prose-invert max-w-none">
              <p>
                The Screenpick API uses conventional HTTP response codes to
                indicate the success or failure of an API request. In general,
                codes in the 2xx range indicate success, codes in the 4xx range
                indicate an error that resulted from the provided information
                (e.g., a required parameter was missing), and codes in the 5xx
                range indicate an error with our servers.
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-700 px-4 py-2 text-left">
                      Code
                    </th>
                    <th className="border border-gray-700 px-4 py-2 text-left">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>200 - OK</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      The request was successful.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>400 - Bad Request</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      The request was invalid or cannot be otherwise served.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>401 - Unauthorized</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      Authentication credentials were missing or incorrect.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>403 - Forbidden</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      The request is understood, but it has been refused or
                      access is not allowed.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>404 - Not Found</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      The requested resource could not be found.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>429 - Too Many Requests</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      You have exceeded the rate limit.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-4 py-2">
                      <code>500 - Internal Server Error</code>
                    </td>
                    <td className="border border-gray-700 px-4 py-2">
                      Something went wrong on our end.
                    </td>
                  </tr>
                </tbody>
              </table>

              <h3>Error Response Format</h3>
              <p>
                When an error occurs, the API will return a JSON object with the
                following structure:
              </p>
              <div className="bg-gray-800 p-4 rounded-md overflow-auto">
                <pre className="text-sm">
                  <code>
                    {JSON.stringify(
                      {
                        error: {
                          code: "invalid_request",
                          message:
                            "The request was invalid. Please check your parameters.",
                          details: "The 'prompt' parameter is required.",
                        },
                      },
                      null,
                      2
                    )}
                  </code>
                </pre>
              </div>
            </div>
          </section>

          {/* Get API Key CTA */}
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-700/50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              Ready to integrate Screenpick into your application?
            </h3>
            <p className="text-gray-300 mb-4">
              Sign up for a free API key and start building with Screenpick
              today.
            </p>
            <a
              href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
              target="_blank"
            >
              <Button className="bg-purple-600 hover:bg-purple-700">
                Get Your API Key
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
