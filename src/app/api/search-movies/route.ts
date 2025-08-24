import { NextResponse, NextRequest } from "next/server";
import { createServerSupabaseClient } from '@/lib/supabase';
import dotenv from "dotenv";

dotenv.config();

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

let movies: { [key: string]: any }[] = [];
const apiKey = process.env.GAPI;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are a helpful and friendly movie recommendation assistant. Your primary goal is to provide users with personalized movie suggestions.

  **Interaction Flow:**
  1.  **Provide Recommendations:** Based on the user's input (or general tastes if preferences are vague or not provided), generate and output movie recommendations.

  **Output Format:**

  * **Strictly JSON:** Your entire response containing the movie recommendations MUST be a single, valid JSON object.
  * **No Extra Text:** Do not include any conversational text, greetings, explanations, apologies, or markdown formatting before or after the JSON object.

  **JSON Structure:**

  \`\`\`json
  {
    "recommendations": [
      {
        "title": "Official Movie Title YYYY",
        "genre": "Primary Genre / Secondary Genre",
        "reason": "A concise, 1-2 sentence explanation linking to the user's stated preferences or why it's a good general pick."
      }
      // ... additional movie objects
    ]
  }
  \`\`\`

  RULES for Recommendations:

  Number of Suggestions:
  - If the user provides specific preferences: Aim for 15 to 20 targeted recommendations. If preferences are vague, very broad, or not provided: Offer 8 to 12 recommendations based on generally popular, critically acclaimed, or diverse genre-spanning films.
  title Field:
  - Use the exact, official movie title. Append the 4-digit release year after the title (e.g., "Inception 2010").
  Personalized: 
  - If the user gave preferences, clearly and concisely explain why this movie is a good match for those specific preferences in 1-2 sentences.
  General: 
  - If making general recommendations, provide a brief, compelling reason why the movie is worth watching (e.g., "A landmark film in cinematic history known for its stunning visuals and complex narrative." or "A heartwarming animated adventure perfect for all ages.").
  Variety:
  - If making general recommendations, try to offer a mix of genres and eras unless the user's implicit cues suggest otherwise.
  Quality:
  - Prioritize well-received movies. Avoid obscure or poorly rated films unless specifically requested or fitting a niche interest. Avoid Repetition: Do not suggest the same movie multiple times in one response. If No Match: In the rare case you genuinely cannot find any matches even for general tastes (which should be almost never), you mayrespond with an empty recommendations array, but this is a last resort.

  \`\`\`json

  {
    "recommendations": []
  }
  \`\`\`

  Example VALID Response (User likes mind-bending sci-fi):
  \`\`\` json

  {
    "recommendations": [
      {
        "title": "Inception 2010",
        "genre": "Sci-Fi / Thriller",
        "reason": "Given your interest in mind-bending sci-fi, you'll likely appreciate its complex dream-within-a-dream narrative and stunning visual effects."
      },
      {
        "title": "Blade Runner 2049 2017",
        "genre": "Sci-Fi / Neo-Noir",
        "reason": "This visually spectacular sequel explores deep philosophical themes, perfect for fans of thought-provoking science fiction."
      },
      {
        "title": "Arrival 2016",
        "genre": "Sci-Fi / Drama",
        "reason": "Its unique approach to alien communication and focus on emotional depth offers a different kind of mind-bending experience you might enjoy."
      }
    ]
  }
  \`\`\`
  `,
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4000,
  responseMimeType: "text/plain",
};

function getUserIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    // Get user from session
    const { data: { user } } = await supabase.auth.getUser();
    const userIP = getUserIP(req);

    // Check usage limits
    const { data: usageCheck, error: usageError } = await supabase.rpc('get_or_create_usage', {
      p_user_id: user?.id || null,
      p_user_ip: user ? null : userIP
    });

    if (usageError) {
      console.error('Usage check error:', usageError);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    if (!usageCheck || usageCheck.length === 0) {
      return NextResponse.json({ error: "Unable to check usage limits" }, { status: 500 });
    }

    const usage = usageCheck[0];
    const canMakeRequest = usage.usage_count < usage.usage_limit;

    if (!canMakeRequest) {
      return NextResponse.json({ 
        error: "Usage limit exceeded", 
        usage_limit_exceeded: true,
        remaining_requests: 0,
        is_free_tier: usage.usage_limit <= 3
      }, { status: 429 });
    }

    // Process the movie recommendation request
    const result = await generateMovieRecommendations(query.trim());
    
    if (result.error) {
      return NextResponse.json(result, { status: result.code || 500 });
    }

    // Increment usage count after successful request
    const { error: incrementError } = await supabase.rpc('increment_usage', {
      p_user_id: user?.id || null,
      p_user_ip: user ? null : userIP
    });

    if (incrementError) {
      console.error('Error incrementing usage:', incrementError);
    }

    // If user has subscription, decrement subscription usage
    if (user) {
      const { error: subscriptionError } = await supabase.rpc('decrement_subscription_usage', {
        p_user_id: user.id
      });

      if (subscriptionError) {
        console.error('Error decrementing subscription usage:', subscriptionError);
      }
    }

    // Get updated usage for response
    const { data: updatedUsage } = await supabase.rpc('get_or_create_usage', {
      p_user_id: user?.id || null,
      p_user_ip: user ? null : userIP
    });

    const finalUsage = updatedUsage?.[0] || usage;

    return NextResponse.json({
      ...result,
      usage_info: {
        remaining_requests: Math.max(0, finalUsage.usage_limit - finalUsage.usage_count),
        is_free_tier: finalUsage.usage_limit <= 3,
        usage_count: finalUsage.usage_count,
        usage_limit: finalUsage.usage_limit
      }
    });

  } catch (error: any) {
    console.error('Search movies error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function generateMovieRecommendations(input: string) {
  try {
    movies = [];
    
    // First, search TMDB directly for movies matching the input
    const tmdbResults = await searchTMDB(input);
    if (tmdbResults.length > 0) {
      // If we found direct matches, return them (limit to top 20 results)
      movies = tmdbResults.slice(0, 20);
      return { movies };
    }
    
    // If no direct matches, fall back to AI recommendations
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    
    const result = await chatSession.sendMessage(`Find movies similar to or related to: ${input}`);
    let json;
    
    try {
      json = parseJsonWithBackticks(result.response.text());
    } catch (error) {
      return { error: "Invalid JSON response from AI", code: 502 };
    }
    
    await Promise.all(
      (json.recommendations || []).map(async (movie: any) => {
        await getMovieDetails(movie.title);
      })
    );
    
    return { movies };
  } catch (error: any) {
    console.error('AI recommendation error:', error);
    return { error: "Internal server error", code: 500 };
  }
}

function parseJsonWithBackticks(input: string) {
  // Remove triple backticks and optional "json" identifier
  const cleanedJson = input
    .replace(/^```(json)?\s*/gm, "") // Remove opening ``` and "json"
    .replace(/\s*```$/gm, "") // Remove closing ```
    .trim(); // Trim whitespace
  try {
    return JSON.parse(cleanedJson);
  } catch (error) {
    throw new Error("INVALID_JSON");
  }
}

async function searchTMDB(query: string) {
  const apikey = process.env.TMDB;
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apikey}`,
    }
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    // Filter out movies without proper data and sort by popularity
    const validMovies = (data.results || [])
      .filter((movie: any) => 
        movie.title && 
        movie.id && 
        movie.release_date && 
        movie.poster_path
      )
      .sort((a: any, b: any) => b.popularity - a.popularity);
    
    return validMovies.map((movie: any) => ({
      title: movie.title,
      year: movie.release_date?.split('-')[0] || '',
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      overview: movie.overview || '',
      rating: movie.vote_average || 0,
      id: movie.id
    }));
  } catch (error) {
    console.error('TMDB search error:', error);
    return [];
  }
}

async function getMovieDetails(title: string) {
  // Extract year from title if present
  const yearMatch = title.match(/(\d{4})/);
  const year = yearMatch ? yearMatch[1] : '';
  const cleanTitle = title.replace(/\s*\d{4}\s*$/, '').trim();

  const apikey = process.env.TMDB;
  const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanTitle)}&include_adult=false&language=en-US&page=1${year ? `&year=${year}` : ''}`;
  
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apikey}`,
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0];
      movies.push({
        title: movie.title,
        year: movie.release_date?.split('-')[0] || '',
        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
        overview: movie.overview || '',
        rating: movie.vote_average || 0,
        id: movie.id
      });
    }
  } catch (error) {
    console.error(`Error fetching details for ${title}:`, error);
  }
}
