import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { authenticate, getCORSHeaders } from "@/lib/auth-middleware";

dotenv.config();

export async function GET(req: NextRequest) {
  const baseHeaders: Record<string, string> = getCORSHeaders();

  const requestId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(req.url);

  // Enforce authentication via shared middleware
  const auth = await authenticate(req, { requireAuth: true, permissions: ['read'] });
  if (!auth.success) return auth.response;

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
  // Rate limiting is handled by the auth middleware

  try {
    const results = await lookupIdsFromTMDB(sanitized);
    if (results.length === 0) {
      return errorResponse(404, {
        code: "not_found",
        message: "No matching movies found",
        details: `No movies matched title '${sanitized}'.`,
        requestId,
        timestamp
      }, baseHeaders);
    }
    return NextResponse.json(results, { headers: baseHeaders });
  } catch (e: any) {
    const msg = e?.message || "Unknown error";
    const upstream = /TMDB/i.test(msg);
    return errorResponse(upstream ? 503 : 500, {
      code: upstream ? "service_unavailable" : "internal_error",
      message: upstream ? "TMDB service unavailable" : "Internal server error",
      details: msg,
      requestId,
      timestamp
    }, baseHeaders);
  }
}

// Preflight CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: getCORSHeaders() });
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

// Per-endpoint rate limit headers removed in favor of centralized middleware
