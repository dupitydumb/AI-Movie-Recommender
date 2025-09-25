import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";
import { randomUUID } from 'crypto';

dotenv.config();

export async function GET(req: NextRequest) {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(req.url);

  // Enforce authentication for search endpoint
  const authResult = await authenticate(req, {
    requireAuth: true,
    permissions: ['read', 'search'],
  });
  // Narrow the union returned by authenticate() via presence of 'response'
  if ('response' in authResult) return authResult.response;
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
  
  // Rate limiting is enforced by the auth middleware per user/key

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
      userPlan: user.plan || 'free',
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
  // Groq-based implementation replacing Gemini
  const tmdbToken = process.env.TMDB;
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    throw new Error("Groq API key not configured");
  }
  if (!tmdbToken) {
    throw new Error("TMDB API token not configured");
  }

  const model = (process.env.GROQ_MODEL || 'llama-3.1-8b-instant').trim();

  // Lazy import to avoid bundling in edge contexts unnecessarily
  const { default: Groq } = await import('groq-sdk');
  const groq = new Groq({ apiKey: groqKey });

  const systemTemplate = `You are a movie recommendation engine.\nBased on the user query "{{query}}", return up to 10-15 movie titles that best match in terms of genre, theme, and mood.\n\nOutput strictly in valid JSON:\n["Movie Title 1", "Movie Title 2", "Movie Title 3", ...]\n\nNo extra text, no explanations.`;
  const systemContent = systemTemplate.replace('{{query}}', query);

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.7,
      top_p: 1,
      max_tokens: 256,
      stream: false,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: query }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

    let movieTitles: string[] = [];
    try {
      movieTitles = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      if (match) {
        movieTitles = JSON.parse(match[0]);
      } else {
        throw new Error('LLM returned non-JSON output');
      }
    }

    if (!Array.isArray(movieTitles)) {
      throw new Error('LLM returned invalid format');
    }

    const limited = movieTitles.slice(0, 10);

    // TMDB searches (parallel)
    const searchPromises = limited.map(async (title) => {
      try {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&include_adult=false&language=en-US&page=1`;
        const tmdbResponse = await fetch(searchUrl, {
          headers: {
            'Authorization': `Bearer ${tmdbToken}`,
            'accept': 'application/json'
          }
        });
        if (!tmdbResponse.ok) {
          console.error(`TMDB search failed for "${title}":`, tmdbResponse.status);
          return [];
        }
        const tmdbData = await tmdbResponse.json();
        return tmdbData.results?.slice(0, 2) || [];
      } catch (e) {
        console.error(`Error searching TMDB for "${title}":`, e);
        return [];
      }
    });

    const movieArrays = await Promise.all(searchPromises);
    const movieMap = new Map<number, any>();
    movieArrays.forEach(list => {
      list.forEach((movie: any) => {
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

    return Array.from(movieMap.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

  } catch (error) {
    console.error('Groq movie recommendation error:', error);

    // Fallback: direct TMDB search
    try {
      const fallbackUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
      const fallbackResp = await fetch(fallbackUrl, {
        headers: {
          'Authorization': `Bearer ${tmdbToken}`,
          'accept': 'application/json'
        }
      });
      if (fallbackResp.ok) {
        const data = await fallbackResp.json();
        return data.results?.slice(0, 10) || [];
      }
    } catch (fallbackErr) {
      console.error('Fallback TMDB search failed:', fallbackErr);
    }
    throw new Error('Failed to get movie recommendations');
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
