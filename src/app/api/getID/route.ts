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
  const name = searchParams.get("title");
  if (!name) {
    return NextResponse.json({ error: "No name provided" }, { status: 400 });
  }

  if (authHeader == process.env.API_KEY_TEST) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(15, "60 m"), // Adjusted rate limit for test API key
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  if (authHeader !== process.env.API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = sanitizeInput(name);
  const { success } = await ratelimit.limit("search");
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  const result = await getID(input);
  return NextResponse.json(result);
}

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "");
}

async function getID(name: string) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/movie.json`, {
      cache: "no-store",
    });
    // Log first 10 movies
    const data = await response.json();
    console.log(data.slice(0, 10));
    const movies = data.filter((movie: any) =>
      movie.title.toLowerCase().includes(name.toLowerCase())
    );
    if (movies.length > 0) {
      return movies.map((movie: any) => ({
        imdb: movie.imdb,
        tmdb: movie.tmdb,
        title: movie.title,
      }));
    } else {
      return [{ error: "Movie not found" }];
    }
  } catch (error) {
    return [{ error: "Internal Server Error" }];
  }
}
