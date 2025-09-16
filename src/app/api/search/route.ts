import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";
import { randomUUID } from 'crypto';

dotenv.config();

export async function GET(req: NextRequest) {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(req.url);

  // Use new auth middleware for hybrid authentication
  const authResult = await authenticate(req, {
    requireAuth: true,
    permissions: ['read', 'search'],
  });

  if (!authResult.success) {
    return authResult.response;
  }

  const { user, isLegacyAuth } = authResult.context;

  // Get query parameter
  const query = searchParams.get("q") || "";
  if (!query) {
    return errorResponse(400, {
      code: "missing_parameter",
      message: "The 'q' parameter is required",
      details: "Provide a natural language query describing the types of movies you want.",
      requestId,
      timestamp
    });
  }

  if (query.length > 300) {
    return errorResponse(400, {
      code: "query_too_long",
      message: "Query exceeds maximum length (300 characters)",
      details: "Shorten your query to 300 characters or less.",
      requestId,
      timestamp
    });
  }

  // Sanitize input
  const sanitized = sanitizeInput(query);
  
  // Rate limiting is already handled by the auth middleware
  // The user's rate limit configuration is available in authResult.context.rateLimit

  try {
    // Get movie recommendations using AI
    const movies = await getMovieRecommendations(sanitized);

    // Add request metadata to response
    const response = {
      success: true,
      query: query,
      movies: movies,
      total: movies.length,
      requestId,
      timestamp,
      authMethod: isLegacyAuth ? 'api_key' : 'jwt',
      userPlan: user.plan,
    };

    return NextResponse.json(response, { 
      status: 200, 
      headers: getCORSHeaders() 
    });

  } catch (error) {
    console.error('Search error:', error);
    return errorResponse(500, {
      code: "search_failed",
      message: "Failed to process search request",
      details: "An unexpected error occurred while searching for movies.",
      requestId,
      timestamp
    });
  }
}

// Add OPTIONS handler for preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
  });
}

// Utility functions (keeping existing logic)
function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "");
}

async function getMovieRecommendations(query: string) {
  // Import the Google AI SDK
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

  const apiKey = process.env.GAPI;
  const tmdbToken = process.env.TMDB;

  if (!apiKey) {
    throw new Error("Google AI API key not configured");
  }

  if (!tmdbToken) {
    throw new Error("TMDB API token not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  try {
    // Step 1: Get movie titles from AI
    const prompt = `Based on the user query "${query}", recommend 10 popular movie titles that best match this request. 
    Consider genres, themes, moods, and other relevant factors.
    
    Return ONLY a JSON array of movie titles as strings, no additional text or explanation.
    Format: ["Movie Title 1", "Movie Title 2", "Movie Title 3", ...]
    Maximum 10 titles.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse AI response to get movie titles
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const movieTitles = JSON.parse(cleanText);
    
    if (!Array.isArray(movieTitles)) {
      throw new Error("AI returned invalid format");
    }
    // Step 2: Search each title on TMDB and collect results
    const allMovies = [];
    const searchPromises = movieTitles.slice(0, 10).map(async (title: string) => {
      try {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`;
        const tmdbResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Bearer ${tmdbToken}`,
            'accept': 'application/json',
          },
        });

        if (!tmdbResponse.ok) {
          console.error(`TMDB search failed for "${title}":`, tmdbResponse.status);
          return [];
        }

        const tmdbData = await tmdbResponse.json();
        
        // Return the top 2 results for each title to get variety
        return tmdbData.results?.slice(0, 2) || [];
      } catch (error) {
        console.error(`Error searching TMDB for "${title}":`, error);
        return [];
      }
    });

    // Wait for all TMDB searches to complete
    const movieArrays = await Promise.all(searchPromises);
    
    // Flatten and deduplicate results
    const movieMap = new Map();
    movieArrays.forEach(movies => {
      movies.forEach((movie: any) => {
        if (movie && movie.id && !movieMap.has(movie.id)) {
          movieMap.set(movie.id, {
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            overview: movie.overview,
            genre_ids: movie.genre_ids,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            adult: movie.adult,
            original_language: movie.original_language,
            original_title: movie.original_title,
          });
        }
      });
    });

    const finalMovies = Array.from(movieMap.values())
      .sort((a, b) => b.popularity - a.popularity) // Sort by popularity
      .slice(0, 10); // Limit to 10 results
    return finalMovies;

  } catch (error) {
    console.error("Movie recommendation error:", error);
    
    // Fallback: Direct TMDB search with the original query
    try {
      const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
      const tmdbResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${tmdbToken}`,
          'accept': 'application/json',
        },
      });

      if (tmdbResponse.ok) {
        const tmdbData = await tmdbResponse.json();
        return tmdbData.results?.slice(0, 10) || [];
      }
    } catch (fallbackError) {
      console.error("Fallback TMDB search also failed:", fallbackError);
    }
    
    throw new Error("Failed to get movie recommendations");
  }
}

// Error response helper
function errorResponse(status: number, error: any) {
  return NextResponse.json(
    { 
      success: false,
      error 
    },
    { 
      status, 
      headers: getCORSHeaders() 
    }
  );
}
