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
  // if (authHeader !== allowedToken) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

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

  const name = searchParams.get("q");
  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400, headers });
  }
  const input = sanitizeInput(name);
  const { success } = await ratelimit.limit("search");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429, headers });
  }
  const result = await run(input);
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
function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "");
}
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
      },
      {
        "title": "The Matrix 1999",
        "genre": "Sci-Fi / Action",
        "reason": "A classic that redefined the genre with its innovative action and reality-questioning concepts, aligning with your preference for mind-bending themes."
      },
      {
        "title": "Primer 2004",
        "genre": "Sci-Fi / Indie",
        "reason": "For a truly intricate and challenging time travel story, this low-budget indie film is a cult favorite among fans of complex sci-fi narratives."
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

async function run(input: string) {
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
    const json = parseJsonWithBackticks(result.response.text());
    await Promise.all(
      json.recommendations.map(async (movie: any) => {
        await getMovieDetails(movie.title);
      })
    );
  } finally {
    return { movies };
  }
}

function parseJsonWithBackticks(input: string) {
  // Remove triple backticks and optional "json" identifier
  const cleanedJson = input
    .replace(/^```(json)?\s*/gm, "") // Remove opening ``` and "json"
    .replace(/\s*```$/gm, "") // Remove closing ```
    .trim(); // Trim whitespace

  return JSON.parse(cleanedJson);
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
    
    return validMovies;
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return [];
  }
}

async function getMovieDetails(movieName: string) {
  const apikey = process.env.TMDB;
  const [title, year] = movieName.match(/(.*)\s(\d{4})$/)?.slice(1) || [];
  const url = `https://api.themoviedb.org/3/search/movie?query=${title}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${apikey}`,
    }
  };
  const response = await fetch(url, options);
  const data = await response.json();
  const movie = data.results && data.results.length > 0 ? data.results[0] : null;
  if (movie) {
    movies.push(movie);
  }
}
