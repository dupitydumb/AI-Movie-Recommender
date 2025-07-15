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

  const { success } = await ratelimit.limit("trending");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const timeWindow = searchParams.get("time_window") || "day"; // day or week
  const page = Math.min(Math.max(parseInt(searchParams.get("page") || "1"), 1), 1000);
  const language = searchParams.get("language") || "en-US";

  // Validate time_window parameter based on TMDB docs
  if (!["day", "week"].includes(timeWindow)) {
    return NextResponse.json({ 
      error: "Invalid time_window parameter. Must be 'day' or 'week'" 
    }, { status: 400, headers });
  }

  const result = await getTrendingMovies(timeWindow, page, language);
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

async function getTrendingMovies(timeWindow: string, page: number, language: string) {
  const apikey = process.env.TMDB;
  
  if (!apikey) {
    return { error: "TMDB API key not configured" };
  }

  try {
    // TMDB Trending endpoint - official documentation
    // https://api.themoviedb.org/3/trending/movie/{time_window}
    const url = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?language=${language}&page=${page}`;

    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apikey}`,
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`TMDB API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      page: data.page,
      results: data.results || [],
      total_pages: data.total_pages,
      total_results: data.total_results,
      time_window: timeWindow,
      language: language,
      // Additional metadata for trending context
      _metadata: {
        trending_period: timeWindow === "day" ? "Last 24 hours" : "Last 7 days",
        request_timestamp: new Date().toISOString(),
        next_page: data.page < data.total_pages ? data.page + 1 : null,
        prev_page: data.page > 1 ? data.page - 1 : null
      }
    };
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return { 
      error: "Failed to fetch trending movies from TMDB",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
