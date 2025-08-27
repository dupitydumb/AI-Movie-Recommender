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
  const baseHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-RapidAPI-Key',
  };

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(req.url);

  // Auth extraction (Bearer / header / query)
  let rawAuth = req.headers.get("Authorization") || "";
  let token = "";
  if (rawAuth.toLowerCase().startsWith("bearer ")) token = rawAuth.substring(7).trim();
  else if (rawAuth) token = rawAuth.trim();
  token = token || searchParams.get("apiKey") || req.headers.get("X-RapidAPI-Key") || "";

  if (!token) {
    return errorResponse(401, {
      code: "invalid_api_key",
      message: "Missing API key",
      details: "Supply API key via Authorization Bearer, X-RapidAPI-Key, or apiKey query (testing only).",
      requestId,
      timestamp
    }, baseHeaders);
  }

  const storedToken = (await Redis.fromEnv().hget(token, "token")) || "";
  if (token !== storedToken && token !== process.env.API_KEY && token !== process.env.API_KEY_TEST) {
    return errorResponse(401, {
      code: "invalid_api_key",
      message: "API key is invalid",
      details: "The supplied API key was not recognized.",
      requestId,
      timestamp
    }, baseHeaders);
  }

  if (token === process.env.API_KEY_TEST) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(15, "60 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
  }

  const title = searchParams.get("title") || "";
  if (!title) {
    return errorResponse(400, {
      code: "missing_parameter",
      message: "The 'title' parameter is required",
      details: "Provide a movie title to search for matching IDs.",
      requestId,
      timestamp
    }, baseHeaders);
  }
  if (title.length > 200) {
    return errorResponse(400, {
      code: "query_too_long",
      message: "Title exceeds maximum length (200 characters)",
      details: "Shorten the title query.",
      requestId,
      timestamp
    }, baseHeaders);
  }

  const sanitized = sanitizeInput(title);
  const rateKey = `getid:${token}`;
  const rate = await ratelimit.limit(rateKey);
  const windowLabel = token === process.env.API_KEY_TEST ? "60m" : "1m";
  if (!rate.success) {
    return errorResponse(429, {
      code: "rate_limit_exceeded",
      message: "Rate limit exceeded",
      details: "Too many getID requests in the current window.",
      requestId,
      timestamp,
      limit: rate.limit,
      remaining: rate.remaining,
      reset: rate.reset
    }, { ...baseHeaders, ...rateLimitHeaders(rate, windowLabel, true) });
  }

  try {
    const results = await lookupIdsFromTMDB(sanitized);
    if (results.length === 0) {
      return errorResponse(404, {
        code: "not_found",
        message: "No matching movies found",
        details: `No movies matched title '${sanitized}'.`,
        requestId,
        timestamp
      }, { ...baseHeaders, ...rateLimitHeaders(rate, windowLabel, false) });
    }
    return NextResponse.json(results, {
      headers: { ...baseHeaders, ...rateLimitHeaders(rate, windowLabel, false) }
    });
  } catch (e: any) {
    const msg = e?.message || "Unknown error";
    const upstream = /TMDB/i.test(msg);
    return errorResponse(upstream ? 503 : 500, {
      code: upstream ? "service_unavailable" : "internal_error",
      message: upstream ? "TMDB service unavailable" : "Internal server error",
      details: msg,
      requestId,
      timestamp
    }, { ...baseHeaders, ...rateLimitHeaders(rate, windowLabel, false) });
  }
}

// Preflight CORS
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

async function lookupIdsFromTMDB(query: string) {
  const apikey = process.env.TMDB;
  if (!apikey) throw new Error("TMDB API key not configured");

  // Search TMDB
  const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const headers = { accept: 'application/json', Authorization: `Bearer ${apikey}` };
  const searchRes = await fetch(searchUrl, { headers });
  if (!searchRes.ok) throw new Error(`TMDB search failed (${searchRes.status})`);
  const searchData = await searchRes.json();
  const results = (searchData.results || []).filter((m: any) => m.id && m.title);

  // Limit number of detailed lookups to avoid overuse (top 8 by popularity)
  const trimmed = results.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, 8);

  // Fetch external IDs for each (IMDb)
  const detailed = await Promise.all(trimmed.map(async (m: any) => {
    try {
      const extRes = await fetch(`https://api.themoviedb.org/3/movie/${m.id}/external_ids`, { headers });
      if (!extRes.ok) throw new Error(`TMDB external_ids failed (${extRes.status})`);
      const ext = await extRes.json();
      const year = m.release_date ? ` (${m.release_date.slice(0,4)})` : "";
      return {
        title: `${m.title}${year}`,
        tmdb: String(m.id),
        imdb: ext.imdb_id || null
      };
    } catch (err) {
      // Fallback without imdb id
      const year = m.release_date ? ` (${m.release_date.slice(0,4)})` : "";
      return { title: `${m.title}${year}`, tmdb: String(m.id), imdb: null };
    }
  }));
  return detailed;
}

// Error helpers
function errorResponse(status: number, error: any, headers: Record<string,string>) {
  return NextResponse.json({ error }, { status, headers });
}

function rateLimitHeaders(rate: any, windowLabel: string, limited: boolean) {
  const resetSeconds = Math.max(0, Math.floor((rate.reset * 1000 - Date.now()) / 1000));
  const h: Record<string,string> = {
    'X-RateLimit-Limit': String(rate.limit ?? 0),
    'X-RateLimit-Remaining': String(rate.remaining ?? 0),
    'X-RateLimit-Reset': String(rate.reset ?? 0),
    'X-RateLimit-Window': windowLabel,
  };
  if (limited) h['Retry-After'] = String(resetSeconds);
  return h;
}
