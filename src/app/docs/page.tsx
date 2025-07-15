import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import DocsContent from "./docs-content";

export const metadata: Metadata = generatePageMetadata({
  title: "API Documentation - Movie Recommendation API",
  description: "Complete API documentation for Screenpick's movie recommendation service. Learn how to integrate our AI-powered movie suggestions into your application.",
  path: "/docs",
  keywords: "movie API, recommendation API, TMDB API, movie database API, film API documentation, AI movie API",
});

export default function Docs() {
  return <DocsContent />;
}
