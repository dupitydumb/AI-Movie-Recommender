import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";

dotenv.config();

export async function GET(req: NextRequest) {
  const headers = getCORSHeaders();
  const { searchParams } = new URL(req.url);

  // Enforce authentication via middleware
  const auth = await authenticate(req, { requireAuth: true, permissions: ['read'] });
  if ('response' in auth) return auth.response;

  const action = searchParams.get("action") || "discover"; // discover or list
  
  if (action === "list") {
    // Return list of all available genres
    const result = await getGenreList();
    return NextResponse.json(result, { headers });
  }

  // Discover movies by genre
  const genreIds = searchParams.get("with_genres"); // Comma separated genre IDs
  const page = Math.min(Math.max(parseInt(searchParams.get("page") || "1"), 1), 500);
  const sortBy = searchParams.get("sort_by") || "popularity.desc";
  const year = searchParams.get("year");
  const minVoteAverage = searchParams.get("vote_average.gte");
  const minVoteCount = searchParams.get("vote_count.gte") || "10";

  if (!genreIds) {
    return NextResponse.json({ 
      error: "with_genres parameter is required for discovery. Use action=list to get available genres." 
    }, { status: 400, headers });
  }

  // Validate sort_by parameter
  const validSortOptions = [
    "popularity.asc", "popularity.desc",
    "release_date.asc", "release_date.desc", 
    "revenue.asc", "revenue.desc",
    "primary_release_date.asc", "primary_release_date.desc",
    "original_title.asc", "original_title.desc",
    "vote_average.asc", "vote_average.desc",
    "vote_count.asc", "vote_count.desc"
  ];

  if (!validSortOptions.includes(sortBy)) {
    return NextResponse.json({ 
      error: `Invalid sort_by parameter. Must be one of: ${validSortOptions.join(", ")}` 
    }, { status: 400, headers });
  }

  const result = await discoverMoviesByGenre({
    genreIds,
    page,
    sortBy,
    year,
    minVoteAverage,
    minVoteCount
  });
  
  return NextResponse.json(result, { headers });
}

// Add OPTIONS handler for preflight requests
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
}

async function getGenreList() {
  const apikey = process.env.TMDB;
  
  if (!apikey) {
    return { error: "TMDB API key not configured" };
  }

  try {
    // TMDB Genre List endpoint - official documentation
    const url = `https://api.themoviedb.org/3/genre/movie/list?language=en`;
    
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
      genres: data.genres || []
    };
  } catch (error) {
    console.error("Error fetching genre list:", error);
    return { 
      error: "Failed to fetch genres from TMDB",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function discoverMoviesByGenre(params: {
  genreIds: string;
  page: number;
  sortBy: string;
  year?: string | null;
  minVoteAverage?: string | null;
  minVoteCount: string;
}) {
  const apikey = process.env.TMDB;
  
  if (!apikey) {
    return { error: "TMDB API key not configured" };
  }

  try {
    // TMDB Discover endpoint - official documentation
    let url = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${params.page}&sort_by=${params.sortBy}&with_genres=${params.genreIds}&vote_count.gte=${params.minVoteCount}`;
    
    // Add optional parameters if provided
    if (params.year) {
      url += `&year=${params.year}`;
    }
    
    if (params.minVoteAverage) {
      url += `&vote_average.gte=${params.minVoteAverage}`;
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
      filters: {
        genre_ids: params.genreIds.split(',').map(id => parseInt(id.trim())),
        sort_by: params.sortBy,
        year: params.year || null,
        min_vote_average: params.minVoteAverage ? parseFloat(params.minVoteAverage) : null,
        min_vote_count: parseInt(params.minVoteCount)
      }
    };
  } catch (error) {
    console.error("Error discovering movies by genre:", error);
    return { 
      error: "Failed to discover movies from TMDB",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
