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
    permissions: ['read', 'details'],
  });

  if (!authResult.success) {
    return authResult.response;
  }

  const { user, isLegacyAuth } = authResult.context;

  // Get movie ID parameter
  const movieId = searchParams.get("id");
  if (!movieId) {
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "missing_parameter",
          message: "Movie ID is required",
          details: "Provide a movie ID in the 'id' query parameter",
          requestId,
          timestamp
        }
      }, 
      { status: 400, headers: getCORSHeaders() }
    );
  }

  // Validate movie ID format
  if (!/^\d+$/.test(movieId)) {
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "invalid_parameter",
          message: "Invalid movie ID format",
          details: "Movie ID must be a numeric value",
          requestId,
          timestamp
        }
      }, 
      { status: 400, headers: getCORSHeaders() }
    );
  }

  // Get optional parameters
  const language = searchParams.get("language") || "en-US";
  const appendToResponse = searchParams.get("append_to_response") || "";
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
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: "invalid_parameter",
            message: "Invalid append_to_response options",
            details: `Invalid options: ${invalidOptions.join(", ")}. Valid options: ${validAppendOptions.join(", ")}`,
            requestId,
            timestamp
          }
        }, 
        { status: 400, headers: getCORSHeaders() }
      );
    }
  }

  try {
    const movieDetails = await getMovieDetails(movieId, language, appendItems);
    
    if (movieDetails.error) {
      const status = movieDetails.error === "Movie not found" ? 404 : 500;
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: movieDetails.error === "Movie not found" ? "movie_not_found" : "tmdb_error",
            message: movieDetails.error,
            details: movieDetails.details || `Failed to fetch details for movie ID: ${movieId}`,
            requestId,
            timestamp
          }
        }, 
        { status, headers: getCORSHeaders() }
      );
    }

    const response = {
      success: true,
      data: movieDetails,
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
    console.error('Movie details error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: "details_fetch_failed",
          message: "Failed to fetch movie details",
          details: "An unexpected error occurred while fetching movie details",
          requestId,
          timestamp
        }
      }, 
      { status: 500, headers: getCORSHeaders() }
    );
  }
}

// Add OPTIONS handler for preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: getCORSHeaders(),
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
