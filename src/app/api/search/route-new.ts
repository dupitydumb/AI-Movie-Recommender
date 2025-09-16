import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";

dotenv.config();

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID();
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
  // Import the existing AI logic
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

  let movies: { [key: string]: any }[] = [];
  const apiKey = process.env.GAPI;
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

  // Load movie database
  try {
    const response = await fetch(`${process.env.BASE_URL}/movie.json`);
    movies = await response.json();
  } catch (error) {
    console.error("Failed to load movie database:", error);
    throw new Error("Movie database unavailable");
  }

  // Generate AI prompt
  const prompt = `Based on the user query "${query}", recommend movies from the provided database. 
  Return exactly 10 movie recommendations that best match the user's request. 
  Consider genres, themes, release years, ratings, and other relevant factors.
  
  Movie Database (JSON array of movie objects):
  ${JSON.stringify(movies.slice(0, 1000))} // Limit for API constraints
  
  Return ONLY a JSON array of movie objects that match the query, no additional text.
  Each movie object should include: title, release_date, overview, genre_ids, vote_average, poster_path, backdrop_path, id.
  Maximum 10 movies.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse AI response
    const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const recommendedMovies = JSON.parse(cleanText);
    
    return Array.isArray(recommendedMovies) ? recommendedMovies.slice(0, 10) : [];
  } catch (error) {
    console.error("AI recommendation error:", error);
    // Fallback to basic search
    return movies.filter(movie => 
      movie.title?.toLowerCase().includes(query.toLowerCase()) ||
      movie.overview?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
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
