import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";

dotenv.config();

export async function GET(req: NextRequest) {
  const headers = getCORSHeaders();

  // Enforce authentication via middleware (also applies rate limit per key)
  const auth = await authenticate(req, { requireAuth: true, permissions: ['read'] });
  if (!auth.success) return auth.response;

  const { searchParams } = new URL(req.url);

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
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
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
