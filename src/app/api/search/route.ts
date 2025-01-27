import { NextResponse, NextRequest } from "next/server";
import dotenv from "dotenv";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

dotenv.config();
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, "60 m"),
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
    'You are a movie recommendation engine that ONLY outputs valid JSON. Respond with exactly 5 movie suggestions following this structure:\n\n{\n  "recommendations": [\n    {\n      "title": "Exact Movie Title",\n      "reason": "Specific connection to user\'s stated preferences in 1 sentence"\n    },\n    ...\n  ]\n}\n\nRULES:\n1. Output MUST be valid JSON - no markdown, no extra text\n2. Only include "title" and "reason" fields\n3. Use exact official movie titles\n4. Make reasons specific and personalized\n5. If preferences are unclear, still provide 5 recommendations based on common tastes\n6. Never add explanations outside JSON structure\n\nExample VALID response:\n{\n  "recommendations": [\n    {\n      "title": "Parasite",\n      "reason": "Dark social satire you might enjoy based on your interest in psychological thrillers with social commentary"\n    },\n    {\n      "title": "The Grand Budapest Hotel",\n      "reason": "Whimsical visual style matching your preference for quirky Wes Anderson films"\n    }\n  ]\n}\n\nFirst ask for: "What type of movies do you enjoy? (Genre/actors/themes/example movies)"',
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 500,
  responseMimeType: "text/plain",
};

async function run(input: string) {
  try {
    movies = [];
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "i really like movie similar to manchester by the sea\n",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: '{\n  "recommendations": [\n    {\n      "title": "You Can Count on Me",\n      "reason": "Explores themes of grief and family bonds with a quiet, character-driven focus, similar to Manchester by the Sea."\n    },\n    {\n      "title": "Ordinary People",\n      "reason": "Deals with the aftermath of tragedy and its impact on a family, reflecting the emotional depth of Manchester by the Sea."\n    },\n    {\n      "title": "About Schmidt",\n      "reason": "Features a man grappling with loss and finding a new direction in life, echoing the somber, introspective tone you appreciate."\n    },\n       {\n      "title": "Rabbit Hole",\n      "reason": "Offers a raw and realistic portrayal of grief and its complex effects on a couple, similar to the emotional resonance of Manchester by the Sea."\n    },\n    {\n     "title": "Pieces of a Woman",\n     "reason": "Presents an intense and heartbreaking look at loss and personal trauma with a focus on powerful performances like Manchester by the Sea."\n   }\n  ]\n}\n',
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: "i really like movie similar to manchester by the sea\n",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: '```json\n{\n  "recommendations": [\n    {\n      "title": "Arrival",\n      "reason": "Explores themes of grief and communication with a quiet intensity similar to the tone of Manchester by the Sea."\n    },\n    {\n      "title": "Nomadland",\n      "reason": "Features a somber, character-driven narrative about loss and finding a new path, resonating with the emotional weight of Manchester by the Sea."',
            },
          ],
        },
        {
          role: "user",
          parts: [
            { text: "i really like movie similar to manchester by the sea" },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: '```json\n{\n  "recommendations": [\n    {\n      "title": "The Wrestler",\n      "reason": "Features a character study of a man grappling with loss and regret, similar to the introspective tone of Manchester by the Sea."\n    },\n    {\n      "title": "Blue Valentine",\n       "reason": "Depicts a raw and emotionally honest portrayal of a relationship falling apart, echoing the melancholic feel of Manchester by the Sea."\n    },\n    {\n      "title": "Moonlight",\n      "reason": "Presents a character-driven narrative about a man\'s life journey with a focus on his emotions and struggles, like Manchester by the Sea."\n    },\n     {\n      "title": "Captain Fantastic",\n      "reason": "Explores themes of grief, family dynamics, and finding one\'s place, aligning with the emotional core of Manchester by the Sea."\n    },\n    {\n      "title": "Drive My Car",\n      "reason": "Presents a thoughtful look at loss, grief and connection through character driven storytelling similar to Manchester By The Sea."\n    }\n  ]\n}\n```\n',
            },
          ],
        },
      ],
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
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${movieName}`
  );
  const data = await response.json();
  const movie = data.results[0];
  movies.push(movie);
}
