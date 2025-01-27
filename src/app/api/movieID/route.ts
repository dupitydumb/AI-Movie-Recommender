import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

dotenv.config();
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("title");
    if (!name) {
      return NextResponse.json({ error: "No name provided" }, { status: 400 });
    }
    const input = sanitizeInput(name);
    const { success } = await ratelimit.limit("movieID");
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    const result = await getID(input);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function sanitizeInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9 ]/g, "");
}

async function getID(name: string) {
  try {
    const response = await fetch(`https://embed.su/list/movie.json`);
    const data = await response.json();
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
    console.log(error);
    return [{ error: "Internal Server Error" }];
  }
}
