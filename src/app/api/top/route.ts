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
      limiter: Ratelimit.slidingWindow(15, "60 m"), // Adjusted rate limit for test API key
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  const { success } = await ratelimit.limit("top");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }

  const category = searchParams.get("category") || "popular"; // popular, top_rated, upcoming, now_playing
  const page = Math.min(Math.max(parseInt(searchParams.get("page") || "1"), 1), 500);
  const region = searchParams.get("region") || "US";
  
  // Validate category parameter
  const validCategories = ["popular", "top_rated", "upcoming", "now_playing"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ 
      error: "Invalid category. Must be one of: popular, top_rated, upcoming, now_playing" 
    }, { status: 400, headers });
  }

  const result = await getTopMovies(category, page, region);
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

async function getTopMovies(category: string, page: number, region: string) {
  const apikey = process.env.TMDB;
  
  if (!apikey) {
    return { error: "TMDB API key not configured" };
  }

  try {
    // TMDB API endpoints based on official documentation
    let url = `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=${page}`;
    
    // Add region parameter for upcoming and now_playing (as per TMDB docs)
    if (category === "upcoming" || category === "now_playing") {
      url += `&region=${region}`;
    }

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
      category,
      region: (category === "upcoming" || category === "now_playing") ? region : undefined,
      dates: data.dates || undefined // Include dates object for upcoming and now_playing
    };
  } catch (error) {
    console.error("Error fetching top movies:", error);
    return { 
      error: "Failed to fetch movies from TMDB",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
