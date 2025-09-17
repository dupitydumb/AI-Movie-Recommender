import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";

dotenv.config();

export async function GET(req: NextRequest) {
  const headers = getCORSHeaders();
  const { searchParams } = new URL(req.url);

  // Enforce authentication and rate limiting via shared middleware
  const auth = await authenticate(req, { requireAuth: true, permissions: ['read'] });
  if (!auth.success) return auth.response;

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
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
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
