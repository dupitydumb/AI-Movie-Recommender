import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

dotenv.config();

let ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function GET(req: NextRequest) {
  // Add CORS headers for cross-origin requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
  };

  const { searchParams } = new URL(req.url);
  const authHeader =
    req.headers.get("Authorization") ||
    searchParams.get("apiKey") ||
    req.headers.get("X-RapidAPI-Key");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const allowedToken = (await Redis.fromEnv().hget(authHeader, "token")) || "";
  
  if (authHeader !== allowedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (authHeader == process.env.API_KEY_TEST) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(15, "60 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  const { success } = await ratelimit.limit("details");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const movieId = searchParams.get("id");
  const language = searchParams.get("language") || "en-US";
  
  // Parse append_to_response parameter for additional data
  const appendToResponse = searchParams.get("append_to_response");
  let appendItems: string[] = [];
  
  if (appendToResponse) {
    appendItems = appendToResponse.split(',').map(item => item.trim());
    
    // Validate append_to_response options based on TMDB docs
    const validAppendOptions = [
      "credits", "images", "videos", "similar", "recommendations", 
      "reviews", "keywords", "translations", "external_ids", 
      "release_dates", "watch/providers"
    ];
    
    const invalidOptions = appendItems.filter(item => !validAppendOptions.includes(item));
    if (invalidOptions.length > 0) {
      return NextResponse.json({ 
        error: `Invalid append_to_response options: ${invalidOptions.join(", ")}. Valid options: ${validAppendOptions.join(", ")}` 
      }, { status: 400, headers });
    }
  }

  if (!movieId) {
    return NextResponse.json({ 
      error: "Movie ID is required" 
    }, { status: 400, headers });
  }

  // Validate movie ID is numeric
  if (!/^\d+$/.test(movieId)) {
    return NextResponse.json({ 
      error: "Movie ID must be a valid number" 
    }, { status: 400, headers });
  }

  const result = await getMovieDetails(movieId, language, appendItems);
  return NextResponse.json(result, { headers });
}

// Add OPTIONS handler for preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
    },
  });
}

async function getMovieDetails(movieId: string, language: string, appendItems: string[]) {
  const apikey = process.env.TMDB;
  
  if (!apikey) {
    return { error: "TMDB API key not configured" };
  }

  try {
    // TMDB Movie Details endpoint - official documentation
    let url = `https://api.themoviedb.org/3/movie/${movieId}?language=${language}`;
    
    // Add append_to_response if specified
    if (appendItems.length > 0) {
      url += `&append_to_response=${appendItems.join(",")}`;
    }

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apikey}`,
      }
    };

    const response = await fetch(url, options);
    
    if (response.status === 404) {
      return { 
        error: "Movie not found",
        movie_id: movieId
      };
    }
    
    if (!response.ok) {
      throw new Error(`TMDB API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add metadata about the request
    const result = {
      ...data,
      _metadata: {
        movie_id: movieId,
        language: language,
        append_to_response: appendItems.length > 0 ? appendItems : null,
        request_timestamp: new Date().toISOString()
      }
    };
    
    return result;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return { 
      error: "Failed to fetch movie details from TMDB",
      details: error instanceof Error ? error.message : "Unknown error",
      movie_id: movieId
    };
  }
}
