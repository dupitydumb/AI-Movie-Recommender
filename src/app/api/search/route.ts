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
  const { searchParams } = new URL(req.url);
  const authHeader =
    req.headers.get("Authorization") ||
    searchParams.get("apiKey") ||
    req.headers.get("X-RapidAPI-Key");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedToken = (await Redis.fromEnv().hget(authHeader, "token")) || "";
  // if (authHeader !== allowedToken) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  if (authHeader !== allowedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }
  const input = sanitizeInput(name);
  const { success } = await ratelimit.limit("search");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  const result = await run(input);
  return NextResponse.json(result);
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
  model: "gemini-1.5-flash-8b",
  systemInstruction:
    'You are a movie recommendation engine that ONLY outputs valid JSON. Respond with 5-10 movie suggestions following this structure:\n\n{\n  "recommendations": [\n    {\n      "title": "Exact Movie Title and Year",\n      "reason": "Specific connection to user\'s stated preferences in 1 sentence"\n    },\n    ...\n  ]\n}\n\nRULES:\n1. Output MUST be valid JSON - no markdown, no extra text\n2. Only include "title" and "reason" fields\n3. Use exact official movie titles and years\n4. Make reasons specific and personalized\n5. If preferences are unclear, still provide minumal 10 or more recommendations based on common tastes\n6. Never add explanations outside JSON structure\n\nExample VALID response:\n{\n  "recommendations": [\n    {\n      "title": "Parasite 2019",\n      "reason": "Dark social satire you might enjoy based on your interest in psychological thrillers with social commentary"\n    },\n    {\n      "title": "The Grand Budapest Hotel 2014",\n      "reason": "Whimsical visual style matching your preference for quirky Wes Anderson films"\n    }\n  ]\n}\n\nFirst ask for: "What type of movies do you enjoy? (Genre/actors/themes/example movies)"',
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

async function run(input: string) {
  try {
    movies = [];
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(input);
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

async function getMovieDetails(movieName: string) {
  const apikey = process.env.TMBD;
  const [title, year] = movieName.match(/(.*)\s(\d{4})$/)?.slice(1) || [];

  console.log("Searching for movie:", title, year);
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${title}&include_adult=false&sort_by=vote_count.desc&primary_release_year=${year}`
  );
  const data = await response.json();
  const movie = data.results[0];
  movies.push(movie);
}
